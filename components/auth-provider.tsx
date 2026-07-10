"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { fetchLatestMembershipPlan, isActiveMembershipStatus, type MembershipPlanKey } from "@/lib/membership";
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
  userEmail: string;
  planError: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolvePlanForUser(
  userId: string
): Promise<{ plan: AuthPlan; resolved: boolean; membershipStatus: string | null; errorMessage: string | null; table: string }> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      plan: "free",
      resolved: false,
      membershipStatus: null,
      errorMessage: "Supabase browser client is unavailable",
      table: "memberships"
    };
  }

  const membership = await fetchLatestMembershipPlan(supabase, userId, "[auth-provider]");

  return {
    plan: membership.plan,
    resolved: membership.resolved,
    membershipStatus: membership.membershipStatus,
    errorMessage: membership.errorMessage,
    table: membership.table
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [plan, setPlan] = useState<AuthPlan>("free");
  const [planResolved, setPlanResolved] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();

    async function syncAuthState(nextSession: Session | null) {
      if (!active) {
        return;
      }

      setSession(nextSession);
      console.log("[auth-provider] current session user id", nextSession?.user?.id ?? null);
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
        setAuthResolved(true);
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
      const membershipState = await resolvePlanForUser(nextSession.user.id);

      if (!active) {
        return;
      }

      console.log("[auth-provider] membership query result", {
        table: membershipState.table,
        plan: membershipState.plan,
        resolved: membershipState.resolved,
        membershipStatus: membershipState.membershipStatus,
        error: membershipState.errorMessage
      });

      setPlan(membershipState.plan);
      setPlanResolved(true);
      setPlanError(membershipState.errorMessage);
      setMembershipStatus(membershipState.membershipStatus);
      setAuthResolved(true);
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
      userEmail: session?.user?.email || "",
      planError
    };
  }, [session, authResolved, membershipStatus, plan, planError, planResolved]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthState() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthState must be used within AuthProvider");
  }

  return context;
}
