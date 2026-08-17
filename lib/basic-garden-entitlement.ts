import { resolveBasicGardenMembershipAuthorization } from "./basic-garden-membership-authorization";

type BasicGardenMembershipClient = {
  from: (table: string) => unknown;
};

export type BasicGardenEntitlementResult =
  | { status: "entitled" }
  | { status: "not_entitled" }
  | { status: "unavailable" };

/** Server-only, authorization-specific membership decision for Garden writes. */
export async function resolveBasicGardenEntitlement(params: {
  client: BasicGardenMembershipClient;
  authUserId: string;
  authUserEmail: string | null;
}): Promise<BasicGardenEntitlementResult> {
  try {
    return await resolveBasicGardenMembershipAuthorization({
      supabase: params.client,
      authUserId: params.authUserId,
      authUserEmail: params.authUserEmail
    });
  } catch {
    return { status: "unavailable" };
  }
}
