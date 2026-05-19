"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export type AuthPlan = "free" | "basic" | "growth" | "inner_circle";
export type AuthMemberState = "guest" | "free" | "paid";

type AuthContextValue = {
  session: Session | null;
  isLoggedIn: boolean;
  authResolved: boolean;
  memberState: AuthMemberState;
  plan: AuthPlan;
  userEmail: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolvePlanForUser(userId: string): Promise<AuthPlan> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return "free";
  }

  const { data: membership, error } = await supabase
    .from("memberships")
    .select("plan")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[auth-provider] Failed to fetch membership", error);
    return "free";
  }

  if (membership?.plan === "basic" || membership?.plan === "growth" || membership?.plan === "inner_circle") {
    return membership.plan;
  }

  return "free";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [plan, setPlan] = useState<AuthPlan>("free");

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
        setAuthResolved(true);
        return;
      }

      setAuthResolved(false);
      const nextPlan = await resolvePlanForUser(nextSession.user.id);

      if (!active) {
        return;
      }

      setPlan(nextPlan);
      setAuthResolved(true);
    }

    async function initialize() {
      if (!supabase) {
        setSession(null);
        setPlan("free");
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
      memberState,
      plan,
      userEmail: session?.user?.email || ""
    };
  }, [session, authResolved, plan]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthState() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthState must be used within AuthProvider");
  }

  return context;
}
