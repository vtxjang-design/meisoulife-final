import { hasProtectedMembershipAccess } from "./membership-access";
import { isActiveMembershipStatus, normalizeMembershipPlan } from "./membership";

type BasicGardenMembership = {
  plan: string | null;
  status: string | null;
  created_at: string | null;
};

type BasicGardenMembershipClient = {
  from(table: "memberships"): {
    select(columns: string): {
      eq(column: "user_id", value: string): {
        order(
          column: "created_at",
          options: { ascending: false }
        ): Promise<{
          data: BasicGardenMembership[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};

export type BasicGardenEntitlementResult =
  | { status: "entitled" }
  | { status: "not_entitled" }
  | { status: "unavailable" };

/**
 * Read-only entitlement check for BASIC Garden writes. Membership status is
 * normalized after fetching the authenticated user's history, so legacy
 * status casing cannot turn a valid membership into a denial.
 */
export async function resolveBasicGardenEntitlement(params: {
  client: BasicGardenMembershipClient;
  authUserId: string;
}): Promise<BasicGardenEntitlementResult> {
  let data: BasicGardenMembership[] | null;
  let error: { message: string } | null;

  try {
    ({ data, error } = await params.client
      .from("memberships")
      .select("plan, status, created_at")
      .eq("user_id", params.authUserId)
      .order("created_at", { ascending: false }));
  } catch {
    return { status: "unavailable" };
  }

  if (error) {
    return { status: "unavailable" };
  }

  // Canonical behavior: prefer the latest active/trialing membership; if
  // none is active, evaluate the latest row. Reading an ordered list avoids
  // maybeSingle() failures for users with historical membership rows.
  const membership =
    data?.find((row) => isActiveMembershipStatus(row.status)) ?? data?.[0];

  if (!membership) {
    return { status: "not_entitled" };
  }

  return hasProtectedMembershipAccess({
    plan: normalizeMembershipPlan(membership.plan),
    membershipStatus: membership.status,
    requiredPlan: "basic"
  })
    ? { status: "entitled" }
    : { status: "not_entitled" };
}
