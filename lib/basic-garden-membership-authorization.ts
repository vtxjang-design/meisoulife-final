import "server-only";

import { hasProtectedMembershipAccess } from "./membership-access";
import { isActiveMembershipStatus, normalizeMembershipPlan } from "./membership";
import { getStripeClient } from "./stripe";
import { resolveStripeBillingDetails } from "./stripe-billing";

type MembershipClient = {
  from: (table: string) => any;
};

type MembershipCandidate = {
  plan: string | null;
  status: string | null;
  stripeCustomerId: string | null;
};

export type BasicGardenMembershipAuthorization =
  | { status: "entitled" }
  | { status: "not_entitled" }
  | { status: "unavailable" };

function hasBasicOrHigherAccess(candidate: MembershipCandidate) {
  return hasProtectedMembershipAccess({
    plan: normalizeMembershipPlan(candidate.plan),
    membershipStatus: candidate.status,
    requiredPlan: "basic"
  });
}

/**
 * Authorization-only membership resolution for BASIC Garden writes. This is
 * intentionally separate from the canonical reconciliation resolver: it uses
 * only authenticated-server reads and Stripe retrieval and has no admin or
 * repair dependency.
 */
export async function resolveBasicGardenMembershipAuthorization(params: {
  supabase: MembershipClient;
  authUserId: string;
  authUserEmail: string | null;
}): Promise<BasicGardenMembershipAuthorization> {
  const localCandidates: MembershipCandidate[] = [];
  const localCustomerIds: Array<{ customerId: string; source: string }> = [];
  let localReadFailed = false;
  let profileId: string | null = null;

  try {
    const { data, error } = await params.supabase
      .from("memberships")
      .select("plan, status, stripe_customer_id, created_at")
      .eq("user_id", params.authUserId)
      .order("created_at", { ascending: false });

    if (error) {
      localReadFailed = true;
    } else {
      for (const row of data ?? []) {
        localCandidates.push({
          plan: row.plan ?? null,
          status: row.status ?? null,
          stripeCustomerId: row.stripe_customer_id ?? null
        });
      }
    }
  } catch {
    localReadFailed = true;
  }

  try {
    let profileQuery = await params.supabase
      .from("users")
      .select("id, stripe_customer_id")
      .eq("auth_user_id", params.authUserId)
      .maybeSingle();

    if (profileQuery.error?.message?.includes("stripe_customer_id")) {
      profileQuery = await params.supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", params.authUserId)
        .maybeSingle();
    }

    if (profileQuery.error) {
      localReadFailed = true;
    } else {
      profileId = profileQuery.data?.id ?? null;
      if (profileQuery.data?.stripe_customer_id) {
        localCustomerIds.push({ customerId: profileQuery.data.stripe_customer_id, source: "users" });
      }
    }
  } catch {
    localReadFailed = true;
  }

  for (const candidate of localCandidates) {
    if (candidate.stripeCustomerId) {
      localCustomerIds.push({ customerId: candidate.stripeCustomerId, source: "memberships" });
    }
  }

  if (profileId) {
    try {
      const { data, error } = await params.supabase
        .from("subscriptions")
        .select("plan_key, status, stripe_customer_id, created_at")
        .eq("user_id", profileId)
        .order("created_at", { ascending: false });

      if (error) {
        localReadFailed = true;
      } else {
        for (const row of data ?? []) {
          localCandidates.push({
            plan: row.plan_key ?? null,
            status: row.status ?? null,
            stripeCustomerId: row.stripe_customer_id ?? null
          });
          if (row.stripe_customer_id) {
            localCustomerIds.push({ customerId: row.stripe_customer_id, source: "subscriptions" });
          }
        }
      }
    } catch {
      localReadFailed = true;
    }
  }

  if (localCandidates.some(hasBasicOrHigherAccess)) {
    return { status: "entitled" };
  }

  const stripe = getStripeClient();
  const email = params.authUserEmail?.trim().toLowerCase() || null;

  if (!stripe || (!email && localCustomerIds.length === 0)) {
    return { status: "unavailable" };
  }

  try {
    const stripeBilling = await resolveStripeBillingDetails({
      stripe,
      email,
      preferredPlan: "free",
      localCustomerIds
    });

    if (stripeBilling.lookupStatus === "ambiguous") {
      return { status: "unavailable" };
    }

    if (
      isActiveMembershipStatus(stripeBilling.status) &&
      hasProtectedMembershipAccess({
        plan: normalizeMembershipPlan(stripeBilling.plan),
        membershipStatus: stripeBilling.status,
        requiredPlan: "basic"
      })
    ) {
      return { status: "entitled" };
    }
  } catch {
    return { status: "unavailable" };
  }

  return localReadFailed ? { status: "unavailable" } : { status: "not_entitled" };
}
