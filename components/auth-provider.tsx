"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { recordAuthDiagnostic } from "@/lib/auth-flow-diagnostics";
import {
  isActiveMembershipStatus,
  type MembershipPlanKey,
  type MembershipResolutionResult,
  type MembershipSummary
} from "@/lib/membership";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export type AuthPlan = MembershipPlanKey;
export type AuthMemberState = "guest" | "free" | "paid";

type AuthContextValue = {
  session: Session | null;
  isLoggedIn: boolean;
  authResolved: boolean;
  planResolved: boolean;
  isMembershipLoading: boolean;
  memberState: AuthMemberState;
  plan: AuthPlan;
  membershipStatus: string | null;
  hasActiveSubscription: boolean;
  membershipSummary: MembershipSummary;
  userEmail: string;
  planError: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getMembershipResolverFallback(errorMessage: string): MembershipResolutionResult {
  return {
    plan: "free",
    resolved: false,
    membershipStatus: null,
    hasActiveSubscription: false,
    errorMessage,
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
  };
}

async function requestMembershipResolution(accessToken?: string | null): Promise<{
  response: Response;
  data: MembershipResolutionResult;
}> {
  const headers = new Headers();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch("/api/membership/resolve", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers
  });

  const data = (await response.json()) as MembershipResolutionResult;
  return { response, data };
}

function getIncompleteMembershipMessage(data: MembershipResolutionResult, responseStatus: number) {
  return (
    data.errorMessage ||
    `Membership resolution incomplete for authenticated user (${data.source}, HTTP ${responseStatus})`
  );
}

async function resolvePlanForUser(nextSession: Session | null): Promise<MembershipResolutionResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const initialAccessToken = nextSession?.access_token ?? null;
    const { response, data } = await requestMembershipResolution(initialAccessToken);
    recordAuthDiagnostic("membership_resolve_response", {
      httpStatus: response.status,
      resolvedMembershipState: data.plan,
      membershipResolved: data.resolved,
      membershipSource: data.source,
      authenticatedUserIdExists: Boolean(nextSession?.user?.id)
    });

    const shouldRetryWithRefresh =
      Boolean(nextSession?.user) &&
      Boolean(supabase) &&
      (response.status === 401 || data.source === "guest" || !data.resolved);

    if (shouldRetryWithRefresh && supabase) {
      const { data: refreshedSessionData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        recordAuthDiagnostic("membership_resolve_refresh_failed", {
          resolvedMembershipState: data.plan,
          membershipSource: data.source,
          authenticatedUserIdExists: Boolean(nextSession?.user?.id)
        });
        return {
          ...(response.ok ? data : getMembershipResolverFallback("Membership resolver request failed")),
          resolved: false,
          errorMessage: refreshError.message
        };
      }

      const refreshedAccessToken = refreshedSessionData.session?.access_token ?? null;

      if (refreshedAccessToken) {
        const retryResult = await requestMembershipResolution(refreshedAccessToken);
        recordAuthDiagnostic("membership_resolve_retry_response", {
          httpStatus: retryResult.response.status,
          resolvedMembershipState: retryResult.data.plan,
          membershipResolved: retryResult.data.resolved,
          membershipSource: retryResult.data.source,
          authenticatedUserIdExists: Boolean(nextSession?.user?.id)
        });

        if (!retryResult.response.ok) {
          return {
            ...retryResult.data,
            resolved: false,
            errorMessage: retryResult.data.errorMessage || "Membership resolver request failed"
          };
        }

        if (nextSession?.user && (!retryResult.data.resolved || retryResult.data.source === "guest")) {
          return {
            ...retryResult.data,
            resolved: false,
            errorMessage: getIncompleteMembershipMessage(retryResult.data, retryResult.response.status)
          };
        }

        return retryResult.data;
      }

      if (nextSession?.user) {
        return {
          ...data,
          resolved: false,
          errorMessage: getIncompleteMembershipMessage(data, response.status)
        };
      }
    }

    if (!response.ok) {
      return {
        ...data,
        resolved: false,
        errorMessage: data.errorMessage || "Membership resolver request failed"
      };
    }

    if (nextSession?.user && (!data.resolved || data.source === "guest")) {
      return {
        ...data,
        resolved: false,
        errorMessage: getIncompleteMembershipMessage(data, response.status)
      };
    }

    return data;
  } catch (error) {
    return getMembershipResolverFallback(error instanceof Error ? error.message : "Membership resolver request failed");
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [plan, setPlan] = useState<AuthPlan>("free");
  const [planResolved, setPlanResolved] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);
  const [membershipSummary, setMembershipSummary] = useState<MembershipSummary>({
    currentPlan: "free",
    subscriptionStatus: null,
    nextBillingDate: null,
    canManageMembership: false
  });

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();

    async function syncAuthState(nextSession: Session | null) {
      if (!active) {
        return;
      }

      setSession(nextSession);
      recordAuthDiagnostic("auth_state_sync_started", {
        authenticatedUserIdExists: Boolean(nextSession?.user?.id),
        nextSessionExists: Boolean(nextSession)
      });
      console.log("[auth-provider] loading state", {
        hasSession: Boolean(nextSession?.user),
        authResolved: true,
        planResolved: nextSession?.user ? false : true
      });

      if (!nextSession?.user) {
        setPlan("free");
        setPlanResolved(true);
        setPlanError(null);
        setMembershipStatus(null);
        setMembershipSummary({
          currentPlan: "free",
          subscriptionStatus: null,
          nextBillingDate: null,
          canManageMembership: false
        });
        setAuthResolved(true);
        recordAuthDiagnostic("auth_state_resolved", {
          authenticatedUserIdExists: false,
          resolvedMembershipState: "free",
          memberState: "guest"
        });
        console.log("[auth-provider] final access decision", {
          memberState: "guest",
          plan: "free",
          planResolved: true,
          reason: "No active session"
        });
        return;
      }

      setAuthResolved(true);
      setPlanResolved(false);
      setPlanError(null);
      setMembershipStatus(null);
      const membershipState = await resolvePlanForUser(nextSession);

      if (!active) {
        return;
      }

      recordAuthDiagnostic("membership_resolution_completed", {
        authenticatedUserIdExists: true,
        membershipResolveHttpStatus: "see previous diagnostic",
        resolvedMembershipState: membershipState.plan,
        membershipResolved: membershipState.resolved,
        membershipSource: membershipState.source,
        membershipStatus: membershipState.membershipStatus ?? null,
        hasActiveSubscription: membershipState.hasActiveSubscription,
        hasError: Boolean(membershipState.errorMessage)
      });
      console.log("[auth-provider] membership query result", {
        plan: membershipState.plan,
        resolved: membershipState.resolved,
        membershipStatus: membershipState.membershipStatus,
        error: membershipState.errorMessage,
        source: membershipState.source,
        repaired: membershipState.repaired
      });

      setPlan(membershipState.plan);
      setPlanResolved(true);
      setPlanError(membershipState.errorMessage);
      setMembershipStatus(membershipState.membershipStatus);
      setMembershipSummary(membershipState.membershipSummary);
      setAuthResolved(true);
      recordAuthDiagnostic("auth_state_resolved", {
        authenticatedUserIdExists: true,
        resolvedMembershipState: membershipState.plan,
        memberState:
          membershipState.plan === "free" || !isActiveMembershipStatus(membershipState.membershipStatus) ? "free" : "paid",
        membershipResolved: membershipState.resolved,
        hasError: Boolean(membershipState.errorMessage)
      });
      console.log("[auth-provider] final access decision", {
        memberState:
          membershipState.plan === "free" || !isActiveMembershipStatus(membershipState.membershipStatus) ? "free" : "paid",
        plan: membershipState.plan,
        membershipStatus: membershipState.membershipStatus,
        planResolved: true,
        error: membershipState.errorMessage
      });
    }

    async function initialize() {
      if (!supabase) {
        setSession(null);
        setPlan("free");
        setPlanResolved(true);
        setPlanError("Supabase browser client is unavailable");
        setMembershipStatus(null);
        setMembershipSummary({
          currentPlan: "free",
          subscriptionStatus: null,
          nextBillingDate: null,
          canManageMembership: false
        });
        setAuthResolved(true);
        return;
      }

      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();

      await syncAuthState(currentSession);
    }

    void initialize();

    const subscription = supabase?.auth.onAuthStateChange((_event, nextSession) => {
      console.log("[auth-provider] auth state changed", {
        event: _event,
        userId: nextSession?.user?.id ?? null
      });
      void syncAuthState(nextSession);
    });

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const isLoggedIn = Boolean(session?.user);
    const hasActiveSubscription = isLoggedIn && isActiveMembershipStatus(membershipStatus) && plan !== "free";
    const memberState: AuthMemberState = !isLoggedIn ? "guest" : hasActiveSubscription ? "paid" : "free";
    const isMembershipLoading = isLoggedIn && (!authResolved || !planResolved);

    return {
      session,
      isLoggedIn,
      authResolved,
      planResolved,
      isMembershipLoading,
      memberState,
      plan,
      membershipStatus,
      hasActiveSubscription,
      membershipSummary,
      userEmail: session?.user?.email || "",
      planError
    };
  }, [session, authResolved, membershipStatus, membershipSummary, plan, planError, planResolved]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthState() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthState must be used within AuthProvider");
  }

  return context;
}
