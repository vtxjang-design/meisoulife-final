"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { fetchLatestMembershipPlan, type MembershipPlanKey } from "@/lib/membership";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export type AuthPlan = MembershipPlanKey;
export type AuthMemberState = "guest" | "free" | "paid";

type AuthContextValue = {
  session: Session | null;
  isLoggedIn: boolean;
  authResolved: boolean;
  planResolved: boolean;
  memberState: AuthMemberState;
  plan: AuthPlan;
  userEmail: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolvePlanForUser(userId: string): Promise<{ plan: AuthPlan; resolved: boolean }> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      plan: "free",
      resolved: false
    };
  }

  const membership = await fetchLatestMembershipPlan(supabase, userId, "[auth-provider]");

  return {
    plan: membership.plan,
    resolved: membership.resolved
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [plan, setPlan] = useState<AuthPlan>("free");
  const [planResolved, setPlanResolved] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();

    async function syncAuthState(nextSession: Session | null) {
      if (!active) {
        return;
      }

      setSession(nextSession);

      if (!nextSession?.user) {
        setPlan("free");
        setPlanResolved(true);
        setAuthResolved(true);
        return;
      }

      setAuthResolved(false);
      const membershipState = await resolvePlanForUser(nextSession.user.id);

      if (!active) {
        return;
      }

      setPlan(membershipState.plan);
      setPlanResolved(membershipState.resolved);
      setAuthResolved(true);
    }

    async function initialize() {
      if (!supabase) {
        setSession(null);
        setPlan("free");
        setPlanResolved(false);
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
      void syncAuthState(nextSession);
    });

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const isLoggedIn = Boolean(session?.user);
    const memberState: AuthMemberState = !isLoggedIn ? "guest" : plan === "free" ? "free" : "paid";

    return {
      session,
      isLoggedIn,
      authResolved,
      planResolved,
      memberState,
      plan,
      userEmail: session?.user?.email || ""
    };
  }, [session, authResolved, planResolved, plan]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthState() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthState must be used within AuthProvider");
  }

  return context;
}
