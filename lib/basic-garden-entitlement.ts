import { hasProtectedMembershipAccess } from "./membership-access";
import { isActiveMembershipStatus, normalizeMembershipPlan } from "./membership";
import { resolveMembershipEntitlementReadOnly } from "./membership-resolver";

type BasicGardenMembershipClient = {
  from: (table: string) => unknown;
};

export type BasicGardenEntitlementResult =
  | { status: "entitled" }
  | { status: "not_entitled" }
  | { status: "unavailable" };

/**
 * Read-only BASIC Garden authorization. This deliberately uses the canonical
 * resolver's separate read-only entry point so Stripe-backed access is
 * honored without allowing membership reconciliation or repair.
 */
export async function resolveBasicGardenEntitlement(params: {
  client: BasicGardenMembershipClient;
  authUserId: string;
  authUserEmail: string | null;
}): Promise<BasicGardenEntitlementResult> {
  try {
    const resolution = await resolveMembershipEntitlementReadOnly({
      supabase: params.client,
      userId: params.authUserId,
      email: params.authUserEmail,
      logPrefix: "[basic-garden-entitlement]"
    });

    if (!resolution.resolved || resolution.errorMessage) {
      return { status: "unavailable" };
    }

    const plan = normalizeMembershipPlan(resolution.plan);
    const membershipStatus = resolution.membershipStatus;

    if (!isActiveMembershipStatus(membershipStatus)) {
      return { status: "not_entitled" };
    }

    return hasProtectedMembershipAccess({
      plan,
      membershipStatus,
      requiredPlan: "basic"
    })
      ? { status: "entitled" }
      : { status: "not_entitled" };
  } catch {
    return { status: "unavailable" };
  }
}
