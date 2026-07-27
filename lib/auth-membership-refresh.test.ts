import assert from "node:assert/strict";
import test from "node:test";
import { resolveMembershipAccessState } from "./basic-experience.ts";
import {
  shouldPreserveVerifiedMembershipDuringRefresh,
  shouldResetMembershipResolution
} from "./auth-membership-refresh.ts";

test("direct protected access stays blocked until auth is resolved", () => {
  assert.equal(
    resolveMembershipAccessState({
      requiredPlan: true,
      authResolved: false,
      hasSupabaseClient: true,
      isLoggedIn: false,
      planResolved: false,
      isMembershipLoading: false,
      planError: null,
      hasActiveSubscription: false,
      hasRequiredAccess: false,
      membershipStatus: null
    }),
    "checking"
  );
});

test("same verified user does not reset membership resolution during background refresh", () => {
  assert.equal(
    shouldResetMembershipResolution(
      {
        sessionUserId: "user-1",
        authResolved: true,
        planResolved: true
      },
      "user-1"
    ),
    false
  );
});

test("first authenticated load still resets membership resolution securely", () => {
  assert.equal(
    shouldResetMembershipResolution(
      {
        sessionUserId: null,
        authResolved: false,
        planResolved: false
      },
      "user-1"
    ),
    true
  );
});

test("switching to another user resets membership resolution", () => {
  assert.equal(
    shouldResetMembershipResolution(
      {
        sessionUserId: "user-1",
        authResolved: true,
        planResolved: true
      },
      "user-2"
    ),
    true
  );
});

test("background refresh errors keep previously verified membership visible", () => {
  assert.equal(
    shouldPreserveVerifiedMembershipDuringRefresh({
      canReusePreviousResolution: true,
      membershipState: {
        plan: "free",
        resolved: false,
        membershipStatus: null,
        hasActiveSubscription: false,
        errorMessage: "Membership resolver request failed",
        source: "unavailable",
        repaired: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        membershipSummary: {
          currentPlan: "free",
          subscriptionStatus: null,
          nextBillingDate: null,
          canManageMembership: false
        }
      }
    }),
    true
  );
});

test("confirmed revoked or missing access does not preserve stale verified membership", () => {
  assert.equal(
    shouldPreserveVerifiedMembershipDuringRefresh({
      canReusePreviousResolution: true,
      membershipState: {
        plan: "free",
        resolved: true,
        membershipStatus: null,
        hasActiveSubscription: false,
        errorMessage: null,
        source: "memberships",
        repaired: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        membershipSummary: {
          currentPlan: "free",
          subscriptionStatus: null,
          nextBillingDate: null,
          canManageMembership: false
        }
      }
    }),
    false
  );
});
