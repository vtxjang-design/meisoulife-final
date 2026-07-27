import type { MembershipResolutionResult } from "@/lib/membership";

type PreviousAuthSnapshot = {
  sessionUserId: string | null;
  authResolved: boolean;
  planResolved: boolean;
};

export function shouldResetMembershipResolution(previous: PreviousAuthSnapshot, nextUserId: string | null) {
  if (!nextUserId) {
    return true;
  }

  return !(
    previous.sessionUserId === nextUserId &&
    previous.authResolved &&
    previous.planResolved
  );
}

export function shouldPreserveVerifiedMembershipDuringRefresh(args: {
  canReusePreviousResolution: boolean;
  membershipState: MembershipResolutionResult;
}) {
  const { canReusePreviousResolution, membershipState } = args;

  if (!canReusePreviousResolution) {
    return false;
  }

  return Boolean(membershipState.errorMessage) && !membershipState.resolved;
}
