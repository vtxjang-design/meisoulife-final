import { hasProtectedMembershipAccess } from "./membership-access";
import {
  ACTIVE_MEMBERSHIP_STATUSES,
  isActiveMembershipStatus,
  normalizeMembershipPlan
} from "./membership";

type BasicGardenMembershipClient = {
  from(table: "memberships"): {
    select(columns: string): {
      eq(column: "user_id", value: string): {
        in(column: "status", values: readonly string[]): {
          order(column: "created_at", options: { ascending: false }): {
            limit(count: number): {
              maybeSingle(): Promise<{
                data: { plan: string | null; status: string | null } | null;
                error: { message: string } | null;
              }>;
            };
          };
        };
      };
    };
  };
};

/**
 * Read-only entitlement check for BASIC Garden writes. It deliberately uses
 * only the authenticated identity and the canonical memberships table.
 */
export async function hasBasicGardenEntitlement(params: {
  client: BasicGardenMembershipClient;
  authUserId: string;
}) {
  const { data: membership, error } = await params.client
    .from("memberships")
    .select("plan, status, created_at")
    .eq("user_id", params.authUserId)
    .in("status", ACTIVE_MEMBERSHIP_STATUSES)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !membership || !isActiveMembershipStatus(membership.status)) {
    return false;
  }

  return hasProtectedMembershipAccess({
    plan: normalizeMembershipPlan(membership.plan),
    membershipStatus: membership.status,
    requiredPlan: "basic"
  });
}
