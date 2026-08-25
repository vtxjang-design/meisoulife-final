import type { MembershipResolutionResult } from "@/lib/membership";

export type MemberGuardDecision = {
  decision: "allowed_to_basic" | "blocked_to_member";
  redirectReason:
    | "none"
    | "unauthenticated"
    | "membership_lookup_failed"
    | "no_membership_record"
    | "inactive_membership"
    | "insufficient_plan";
};

export function resolveMemberGuardDecision(
  authenticated: boolean,
  result: MembershipResolutionResult | null
): MemberGuardDecision {
  if (!authenticated) {
    return { decision: "blocked_to_member", redirectReason: "unauthenticated" };
  }

  if (!result || !result.resolved || result.errorMessage) {
    return { decision: "blocked_to_member", redirectReason: "membership_lookup_failed" };
  }

  if (result.hasActiveSubscription && result.plan !== "free") {
    return { decision: "allowed_to_basic", redirectReason: "none" };
  }

  if (!result.debug?.membershipRowFound && !result.membershipStatus) {
    return { decision: "blocked_to_member", redirectReason: "no_membership_record" };
  }

  if (result.membershipStatus && !["active", "trialing"].includes(result.membershipStatus.toLowerCase())) {
    return { decision: "blocked_to_member", redirectReason: "inactive_membership" };
  }

  return { decision: "blocked_to_member", redirectReason: "insufficient_plan" };
}
