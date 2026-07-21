import "server-only";

import type Stripe from "stripe";
import {
  fetchLatestMembershipPlan,
  isActiveMembershipStatus,
  normalizeLookupEmail,
  normalizeMembershipPlan,
  type MembershipMatchSource,
  type MembershipPlanKey,
  type MembershipResolutionResult
} from "@/lib/membership";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { maskStripeCustomerId, resolveStripeBillingDetails } from "@/lib/stripe-billing";

type MembershipClient = {
  from: (table: string) => any;
};

type LocalMembershipRow = {
  id?: string | null;
  plan?: string | null;
  status?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_end?: string | null;
  email?: string | null;
};

type LocalSubscriptionRow = {
  id?: string | null;
  plan_key?: string | null;
  status?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_end?: string | null;
};

type LocalProfileRow = {
  id?: string | null;
  email?: string | null;
  current_plan?: string | null;
  stripe_customer_id?: string | null;
};

type LocalMembershipSnapshot = {
  profile: LocalProfileRow | null;
  membership: LocalMembershipRow | null;
  subscription: LocalSubscriptionRow | null;
};

type MembershipFailureReason =
  | "membership_active_local"
  | "subscription_active_local"
  | "membership_missing"
  | "subscription_missing"
  | "membership_inactive"
  | "subscription_inactive"
  | "membership_plan_mismatch"
  | "subscription_plan_mismatch"
  | "stripe_skipped_missing_config_or_lookup_key"
  | "stripe_customer_not_found"
  | "stripe_subscription_not_found"
  | "stripe_subscription_inactive"
  | "stripe_plan_mismatch"
  | "webhook_pending_or_sync_missing"
  | "repair_succeeded"
  | "repair_skipped"
  | "repair_not_needed";

type ResolveMembershipEntitlementParams = {
  supabase: MembershipClient | null;
  userId: string;
  email?: string | null;
  logPrefix?: string;
  stripe?: Stripe | null;
  debug?: boolean;
};

function emptyResolution(source: MembershipResolutionResult["source"], errorMessage: string | null): MembershipResolutionResult {
  return {
    plan: "free",
    resolved: source === "guest",
    membershipStatus: null,
    hasActiveSubscription: false,
    errorMessage,
    source,
    repaired: false,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    membershipSummary: {
      currentPlan: "free",
      subscriptionStatus: null,
      nextBillingDate: null,
      canManageMembership: false
    }
  };
}

async function loadLocalMembershipSnapshot(supabase: MembershipClient, userId: string, logPrefix: string) {
  const membershipState = await fetchLatestMembershipPlan(supabase, userId, logPrefix);
  let primaryProfileQuery = await supabase
    .from("users")
    .select("id, email, current_plan, stripe_customer_id")
    .eq("auth_user_id", userId)
    .maybeSingle();

  // Some older deployments do not have users.stripe_customer_id. Keep the
  // entitlement resolver compatible with those schemas while using this
  // authenticated mapping whenever it is available.
  if (primaryProfileQuery.error?.message?.includes("stripe_customer_id")) {
    primaryProfileQuery = await supabase
      .from("users")
      .select("id, email, current_plan")
      .eq("auth_user_id", userId)
      .maybeSingle();
  }
  let profile = primaryProfileQuery.data ?? null;
  const profileError = primaryProfileQuery.error;

  if (profileError) {
    console.error(`${logPrefix} profile fetch failed`, {
      userId,
      error: profileError.message
    });
  }

  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("id, email, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    console.error(`${logPrefix} membership row fetch failed`, {
      userId,
      error: membershipError.message
    });
  }

  const { data: subscription, error: subscriptionError } = profile?.id
    ? await supabase
        .from("subscriptions")
        .select("id, stripe_customer_id, stripe_subscription_id, plan_key, status, current_period_end, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null, error: null };

  if (subscriptionError) {
    console.error(`${logPrefix} subscription row fetch failed`, {
      userId,
      error: subscriptionError.message
    });
  }

  return {
    membershipState,
    snapshot: {
      profile: profile ?? null,
      membership: membership ?? null,
      subscription: subscription ?? null
    } satisfies LocalMembershipSnapshot
  };
}

function resolveLocalMembership(
  snapshot: LocalMembershipSnapshot,
  membershipState: Awaited<ReturnType<typeof fetchLatestMembershipPlan>>
): {
  currentPlan: MembershipPlanKey;
  membershipStatus: string | null;
  nextBillingDate: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  canManageMembership: boolean;
  hasActiveSubscription: boolean;
  failureReasons: MembershipFailureReason[];
} {
  const membershipPlan = normalizeMembershipPlan(snapshot.membership?.plan);
  const subscriptionPlan = normalizeMembershipPlan(snapshot.subscription?.plan_key);
  const profilePlan = normalizeMembershipPlan(snapshot.profile?.current_plan);
  const membershipStatus = snapshot.membership?.status ?? membershipState.membershipStatus ?? null;
  const subscriptionStatus = snapshot.subscription?.status ?? null;
  const activeMembershipPlan = isActiveMembershipStatus(membershipStatus) ? membershipPlan : "free";
  const activeSubscriptionPlan = isActiveMembershipStatus(subscriptionStatus) ? subscriptionPlan : "free";

  const planCandidates: MembershipPlanKey[] = [
    activeMembershipPlan,
    activeSubscriptionPlan,
    membershipPlan,
    subscriptionPlan,
    profilePlan,
    membershipState.plan
  ];

  const currentPlan = planCandidates.find((plan) => plan !== "free") ?? "free";
  const resolvedStatus = membershipStatus ?? subscriptionStatus ?? null;
  const stripeCustomerId =
    snapshot.membership?.stripe_customer_id ??
    snapshot.subscription?.stripe_customer_id ??
    snapshot.profile?.stripe_customer_id ??
    null;
  const stripeSubscriptionId =
    snapshot.membership?.stripe_subscription_id ?? snapshot.subscription?.stripe_subscription_id ?? null;
  const nextBillingDate =
    snapshot.membership?.current_period_end ?? snapshot.subscription?.current_period_end ?? null;
  const failureReasons: MembershipFailureReason[] = [];

  if (snapshot.membership) {
    if (isActiveMembershipStatus(membershipStatus) && membershipPlan !== "free") {
      failureReasons.push("membership_active_local");
    } else if (!isActiveMembershipStatus(membershipStatus)) {
      failureReasons.push("membership_inactive");
    } else {
      failureReasons.push("membership_plan_mismatch");
    }
  } else {
    failureReasons.push("membership_missing");
  }

  if (snapshot.subscription) {
    if (isActiveMembershipStatus(subscriptionStatus) && subscriptionPlan !== "free") {
      failureReasons.push("subscription_active_local");
    } else if (!isActiveMembershipStatus(subscriptionStatus)) {
      failureReasons.push("subscription_inactive");
    } else {
      failureReasons.push("subscription_plan_mismatch");
    }
  } else {
    failureReasons.push("subscription_missing");
  }

  return {
    currentPlan,
    membershipStatus: resolvedStatus,
    nextBillingDate,
    stripeCustomerId,
    stripeSubscriptionId,
    canManageMembership: Boolean(stripeCustomerId),
    hasActiveSubscription: isActiveMembershipStatus(resolvedStatus) && currentPlan !== "free",
    failureReasons
  };
}

async function repairMembershipRecords(params: {
  userId: string;
  email: string | null;
  profileId: string | null;
  snapshot: LocalMembershipSnapshot;
  plan: MembershipPlanKey;
  status: string | null;
  nextBillingDate: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  logPrefix: string;
}) {
  const admin = getSupabaseAdminClient();

  if (!admin) {
    console.warn(`${params.logPrefix} repair skipped`, {
      userId: params.userId,
      reason: "missing_supabase_admin"
    });
    return false;
  }

  const normalizedStatus = params.status ?? "active";
  const effectivePlan = params.plan === "free" && isActiveMembershipStatus(normalizedStatus) ? "basic" : params.plan;

  const needsMembershipRepair =
    normalizeMembershipPlan(params.snapshot.membership?.plan) !== effectivePlan ||
    (params.snapshot.membership?.status ?? null) !== normalizedStatus ||
    (params.snapshot.membership?.stripe_customer_id ?? null) !== params.stripeCustomerId ||
    (params.snapshot.membership?.stripe_subscription_id ?? null) !== params.stripeSubscriptionId ||
    (params.snapshot.membership?.current_period_end ?? null) !== params.nextBillingDate;

  const effectiveUserPlan = isActiveMembershipStatus(normalizedStatus) ? effectivePlan : "free";
  const needsProfileRepair = normalizeMembershipPlan(params.snapshot.profile?.current_plan) !== effectiveUserPlan;
  const needsSubscriptionRepair =
    Boolean(params.profileId) &&
    (
      normalizeMembershipPlan(params.snapshot.subscription?.plan_key) !== effectivePlan ||
      (params.snapshot.subscription?.status ?? null) !== normalizedStatus ||
      (params.snapshot.subscription?.stripe_customer_id ?? null) !== params.stripeCustomerId ||
      (params.snapshot.subscription?.stripe_subscription_id ?? null) !== params.stripeSubscriptionId ||
      (params.snapshot.subscription?.current_period_end ?? null) !== params.nextBillingDate
    );

  let repaired = false;

  if (needsMembershipRepair) {
    const { error } = await admin.from("memberships").upsert(
      {
        user_id: params.userId,
        email: params.email,
        stripe_customer_id: params.stripeCustomerId,
        stripe_subscription_id: params.stripeSubscriptionId,
        plan: effectivePlan,
        status: normalizedStatus,
        current_period_end: params.nextBillingDate
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error(`${params.logPrefix} membership repair failed`, {
        userId: params.userId,
        error: error.message
      });
    } else {
      repaired = true;
    }
  }

  if (needsProfileRepair) {
    const { error } = await admin
      .from("users")
      .update({ current_plan: effectiveUserPlan })
      .eq("auth_user_id", params.userId);

    if (error) {
      console.error(`${params.logPrefix} profile repair failed`, {
        userId: params.userId,
        error: error.message
      });
    } else {
      repaired = true;
    }
  }

  if (params.profileId && needsSubscriptionRepair) {
    const existingSubscriptionId = params.snapshot.subscription?.id ?? null;
    const payload = {
      user_id: params.profileId,
      stripe_customer_id: params.stripeCustomerId,
      stripe_subscription_id: params.stripeSubscriptionId,
      plan_key: effectivePlan,
      status: normalizedStatus,
      current_period_end: params.nextBillingDate
    };

    const { error } = existingSubscriptionId
      ? await admin.from("subscriptions").update(payload).eq("id", existingSubscriptionId)
      : await admin.from("subscriptions").insert(payload);

    if (error) {
      console.error(`${params.logPrefix} subscription repair failed`, {
        userId: params.userId,
        profileId: params.profileId,
        error: error.message
      });
    } else {
      repaired = true;
    }
  }

  return repaired;
}

export async function resolveMembershipEntitlement(
  params: ResolveMembershipEntitlementParams
): Promise<MembershipResolutionResult> {
  const { supabase, userId, email = null, logPrefix = "[membership-resolver]", debug = false } = params;
  const normalizedEmail = normalizeLookupEmail(email);

  if (!userId) {
    return emptyResolution("guest", null);
  }

  if (!supabase) {
    return emptyResolution("unavailable", "Supabase client is unavailable");
  }

  let { membershipState, snapshot } = await loadLocalMembershipSnapshot(supabase, userId, logPrefix);
  let matchedBy: MembershipMatchSource = snapshot.membership ? "user_id" : "none";
  let stripeCustomerSource: string | null = null;

  if (!snapshot.profile && normalizedEmail) {
    const { data: emailProfile, error: emailProfileError } = await supabase
      .from("users")
      .select("id, email, current_plan, auth_user_id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (emailProfileError) {
      console.error(`${logPrefix} profile fallback by email failed`, {
        userId,
        email: normalizedEmail,
        error: emailProfileError.message
      });
    } else if (emailProfile) {
      console.log(`${logPrefix} profile recovered by email fallback`, {
        userId,
        email: normalizedEmail,
        profileId: emailProfile.id ?? null,
        authUserId: emailProfile.auth_user_id ?? null
      });

      const { data: emailSubscription, error: emailSubscriptionError } = await supabase
        .from("subscriptions")
        .select("id, stripe_customer_id, stripe_subscription_id, plan_key, status, current_period_end, created_at")
        .eq("user_id", emailProfile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (emailSubscriptionError) {
        console.error(`${logPrefix} subscription fallback by email profile failed`, {
          userId,
          email: normalizedEmail,
          error: emailSubscriptionError.message
        });
      }

      snapshot = {
        ...snapshot,
        profile: {
          id: emailProfile.id ?? null,
          email: emailProfile.email ?? null,
          current_plan: emailProfile.current_plan ?? null
        },
        subscription: emailSubscription ?? snapshot.subscription
      };
      if (matchedBy === "none") {
        matchedBy = "email";
      }
    }
  }
  const local = resolveLocalMembership(snapshot, membershipState);
  const stripe = params.stripe ?? getStripeClient();
  const localCustomerIds = [
    snapshot.membership?.stripe_customer_id
      ? {
          customerId: snapshot.membership.stripe_customer_id,
          source: "memberships"
        }
      : null,
    snapshot.subscription?.stripe_customer_id
      ? {
          customerId: snapshot.subscription.stripe_customer_id,
          source: "subscriptions"
        }
      : null,
    snapshot.profile?.stripe_customer_id
      ? {
          customerId: snapshot.profile.stripe_customer_id,
          source: "users"
        }
      : null
  ].filter((entry): entry is { customerId: string; source: string } => Boolean(entry?.customerId));

  let source: MembershipResolutionResult["source"] = "local";
  let repaired = false;
  let finalPlan: MembershipPlanKey = local.currentPlan;
  let finalStatus = local.membershipStatus;
  let finalNextBillingDate = local.nextBillingDate;
  let finalStripeCustomerId = local.stripeCustomerId;
  let finalStripeSubscriptionId = local.stripeSubscriptionId;
  let finalCanManageMembership = local.canManageMembership;
  let failureReasons = [...local.failureReasons];

  if (stripe && (normalizedEmail || localCustomerIds.length > 0)) {
    const stripeBilling = await resolveStripeBillingDetails({
      stripe,
      email: normalizedEmail,
      preferredPlan: local.currentPlan as "free" | "basic" | "growth" | "inner_circle",
      localCustomerIds
    });

    console.log(`${logPrefix} stripe reconciliation`, {
      userId,
      email,
      customerId: maskStripeCustomerId(stripeBilling.customerId),
      subscriptionId: stripeBilling.subscriptionId,
      plan: stripeBilling.plan,
      status: stripeBilling.status,
      currentPeriodEnd: stripeBilling.currentPeriodEnd,
      customerSource: stripeBilling.customerSource
    });
    stripeCustomerSource = stripeBilling.customerSource;

    if (stripeBilling.customerId || stripeBilling.subscriptionId || stripeBilling.status) {
      source = "stripe";
      if (matchedBy === "none") {
        matchedBy = stripeBilling.customerSource === "stripe_email" ? "email" : stripeBilling.customerId ? "customer_id" : "none";
      }
      finalPlan = stripeBilling.plan !== "free" ? stripeBilling.plan : local.currentPlan;
      finalStatus = stripeBilling.status ?? local.membershipStatus;
      finalNextBillingDate = stripeBilling.currentPeriodEnd ?? local.nextBillingDate;
      finalStripeCustomerId = stripeBilling.customerId ?? local.stripeCustomerId;
      finalStripeSubscriptionId = stripeBilling.subscriptionId ?? local.stripeSubscriptionId;
      finalCanManageMembership = Boolean(finalStripeCustomerId);

      repaired = await repairMembershipRecords({
        userId,
        email: normalizedEmail ?? normalizeLookupEmail(snapshot.profile?.email) ?? normalizeLookupEmail(snapshot.membership?.email) ?? null,
        profileId: snapshot.profile?.id ?? null,
        snapshot,
        plan: finalPlan,
        status: finalStatus,
        nextBillingDate: finalNextBillingDate,
        stripeCustomerId: finalStripeCustomerId,
        stripeSubscriptionId: finalStripeSubscriptionId,
        logPrefix
      });

      if (repaired) {
        source = "stripe_repaired";
        failureReasons.push("repair_succeeded");
      } else if (isActiveMembershipStatus(finalStatus) && finalPlan === "free") {
        failureReasons.push("stripe_plan_mismatch");
      } else if (isActiveMembershipStatus(finalStatus) && finalPlan !== "free") {
        failureReasons.push("repair_skipped");
      } else {
        failureReasons.push(stripeBilling.subscriptionId ? "stripe_subscription_inactive" : "stripe_subscription_not_found");
      }
    } else if (normalizedEmail || localCustomerIds.length > 0) {
      failureReasons.push(localCustomerIds.length > 0 ? "stripe_subscription_not_found" : "stripe_customer_not_found");
    }
  } else {
    failureReasons.push("stripe_skipped_missing_config_or_lookup_key");
  }

  const hasActiveSubscription = isActiveMembershipStatus(finalStatus) && finalPlan !== "free";
  const finalError = membershipState.errorMessage ?? null;
  const shouldWarnWebhookPending =
    !hasActiveSubscription &&
    !snapshot.membership &&
    !snapshot.subscription &&
    Boolean(normalizedEmail);

  if (shouldWarnWebhookPending) {
    failureReasons.push("webhook_pending_or_sync_missing");
  }

  if (!hasActiveSubscription) {
    console.warn(`${logPrefix} returning free membership state`, {
      userId,
      email: normalizedEmail,
      localPlan: local.currentPlan,
      localStatus: local.membershipStatus,
      stripePlan: finalPlan,
      stripeStatus: finalStatus,
      source,
      repaired,
      reasons: Array.from(new Set(failureReasons))
    });
  } else {
    console.log(`${logPrefix} paid membership confirmed`, {
      userId,
      email: normalizedEmail,
      plan: finalPlan,
      status: finalStatus,
      source,
      repaired
    });
  }

  return {
    plan: finalPlan,
    resolved: membershipState.resolved || source !== "local" || hasActiveSubscription || finalPlan === "free",
    membershipStatus: finalStatus,
    hasActiveSubscription,
    errorMessage: finalError,
    source,
    repaired,
    stripeCustomerId: finalStripeCustomerId,
    stripeSubscriptionId: finalStripeSubscriptionId,
    membershipSummary: {
      currentPlan: finalPlan,
      subscriptionStatus: finalStatus,
      nextBillingDate: finalNextBillingDate,
      canManageMembership: finalCanManageMembership
    },
    debug: debug
      ? {
          authenticated: true,
          userIdPresent: Boolean(userId),
          normalizedLoginEmail: normalizedEmail,
          matchedBy,
          membershipRowFound: Boolean(snapshot.membership),
          subscriptionRowFound: Boolean(snapshot.subscription),
          profileRowFound: Boolean(snapshot.profile),
          stripeCustomerIdPresent: Boolean(finalStripeCustomerId),
          stripeSubscriptionIdPresent: Boolean(finalStripeSubscriptionId),
          stripeAvailable: Boolean(stripe),
          stripeCustomerSource,
          paymentState: finalStatus,
          failureReasons: Array.from(new Set(failureReasons))
        }
      : undefined
  };
}
