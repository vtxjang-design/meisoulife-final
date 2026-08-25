import assert from "node:assert/strict";
import test from "node:test";
import type { MembershipResolutionResult } from "./membership.ts";
import { resolveMemberGuardDecision } from "./member-guard-decision.ts";

function resolution(overrides: Partial<MembershipResolutionResult> = {}): MembershipResolutionResult {
  return {
    plan: "free",
    resolved: true,
    membershipStatus: null,
    hasActiveSubscription: false,
    errorMessage: null,
    source: "local",
    repaired: false,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    membershipSummary: {
      currentPlan: "free",
      subscriptionStatus: null,
      nextBillingDate: null,
      canManageMembership: false
    },
    debug: {
      authenticated: true,
      userIdPresent: true,
      normalizedLoginEmail: "member@example.com",
      matchedBy: "none",
      membershipRowFound: false,
      subscriptionRowFound: false,
      profileRowFound: false,
      stripeCustomerIdPresent: false,
      stripeSubscriptionIdPresent: false,
      stripeAvailable: true,
      stripeCustomerSource: null,
      paymentState: null,
      failureReasons: []
    },
    ...overrides
  };
}

test("allows an active BASIC entitlement even when no local membership row was matched", () => {
  const result = resolveMemberGuardDecision(
    true,
    resolution({ plan: "basic", membershipStatus: "active", hasActiveSubscription: true, source: "stripe" })
  );

  assert.deepEqual(result, { decision: "allowed_to_basic", redirectReason: "none" });
});

test("reports an unauthenticated visitor", () => {
  assert.deepEqual(resolveMemberGuardDecision(false, null), {
    decision: "blocked_to_member",
    redirectReason: "unauthenticated"
  });
});

test("reports an unresolved membership lookup", () => {
  assert.equal(
    resolveMemberGuardDecision(true, resolution({ resolved: false, errorMessage: "lookup failed" })).redirectReason,
    "membership_lookup_failed"
  );
});

test("reports a missing membership record", () => {
  assert.equal(resolveMemberGuardDecision(true, resolution()).redirectReason, "no_membership_record");
});

test("reports an inactive membership", () => {
  const result = resolution({
    plan: "basic",
    membershipStatus: "canceled",
    debug: { ...resolution().debug!, membershipRowFound: true }
  });
  assert.equal(resolveMemberGuardDecision(true, result).redirectReason, "inactive_membership");
});

test("reports an active membership without a BASIC-or-higher plan", () => {
  const result = resolution({
    membershipStatus: "active",
    debug: { ...resolution().debug!, membershipRowFound: true }
  });
  assert.equal(resolveMemberGuardDecision(true, result).redirectReason, "insufficient_plan");
});
