"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthState } from "@/components/auth-provider";
import { BasicHome } from "@/components/basic-home";
import { MembershipGuard } from "@/components/membership-guard";
import { recordAuthDiagnostic } from "@/lib/auth-flow-diagnostics";
import type { MembershipResolutionResult } from "@/lib/membership";
import { getMockDashboard } from "@/lib/mock-data";
import { useLanguage } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type DashboardState = {
  challengeDay: number;
  streakCount: number;
};

type MembershipDebugState = {
  httpStatus: number | null;
  data: MembershipResolutionResult | null;
};

function BasicProgramContent() {
  const { plan, planResolved, session, authResolved, isLoggedIn, membershipSummary, hasActiveSubscription } = useAuthState();
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const mock = getMockDashboard();
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    challengeDay: mock.challengeDay,
    streakCount: mock.streakCount
  });
  const highlightedRhythm = searchParams.get("rhythm") ?? searchParams.get("gate");
  const defaultRhythm =
    highlightedRhythm === "morning" || highlightedRhythm === "day" || highlightedRhythm === "night"
      ? highlightedRhythm
      : undefined;
  const membershipDebugEnabled = searchParams.get("membershipDebug") === "1";
  const [membershipDebug, setMembershipDebug] = useState<MembershipDebugState>({
    httpStatus: null,
    data: null
  });

  useEffect(() => {
    recordAuthDiagnostic("program_basic_reached", {
      authenticatedUserIdExists: Boolean(session?.user?.id),
      resolvedMembershipState: plan,
      membershipResolved: planResolved,
      authResolved,
      isLoggedIn
    });
  }, [authResolved, isLoggedIn, plan, planResolved, session?.user?.id]);

  useEffect(() => {
    if (!membershipDebugEnabled) {
      return;
    }

    let active = true;

    async function loadMembershipDebug() {
      try {
        const response = await fetch("/api/membership/resolve?debug=1", {
          credentials: "include",
          cache: "no-store"
        });
        const data = (await response.json()) as MembershipResolutionResult;

        if (!active) {
          return;
        }

        setMembershipDebug({
          httpStatus: response.status,
          data
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setMembershipDebug({
          httpStatus: null,
          data: {
            plan: "free",
            resolved: false,
            membershipStatus: null,
            hasActiveSubscription: false,
            errorMessage: error instanceof Error ? error.message : "Membership debug request failed",
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
        });
      }
    }

    void loadMembershipDebug();

    return () => {
      active = false;
    };
  }, [membershipDebugEnabled]);

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();
    const userId = session?.user?.id;

    if (!supabase || !userId) {
      setDashboardState({
        challengeDay: mock.challengeDay,
        streakCount: mock.streakCount
      });
      return;
    }

    const safeSupabase = supabase;

    async function loadDashboardState() {
      const { data: profile, error } = await safeSupabase
        .from("users")
        .select("check_in_count, challenge_day")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (error) {
        console.warn("[program-basic] dashboard profile fetch failed", {
          userId,
          error: error.message
        });
        setDashboardState({
          challengeDay: mock.challengeDay,
          streakCount: mock.streakCount
        });
        return;
      }

      setDashboardState({
        challengeDay:
          typeof profile?.challenge_day === "number" && profile.challenge_day > 0 ? profile.challenge_day : mock.challengeDay,
        streakCount:
          typeof profile?.check_in_count === "number" && profile.check_in_count > 0
            ? profile.check_in_count
            : mock.streakCount
      });
    }

    void loadDashboardState();

    return () => {
      active = false;
    };
  }, [mock.challengeDay, mock.streakCount, session?.user?.id]);

  if (!authResolved || !isLoggedIn) {
    return (
      <div className="section-shell py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="premium-card rounded-[28px] p-8 text-center sm:p-12">
            <p className="text-lg text-white/72">
              {language === "jp"
                ? "ログイン状態を確認しています..."
                : language === "kr"
                  ? "로그인 상태를 확인하고 있습니다..."
                  : "Checking your login status..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell relative min-h-screen overflow-hidden pb-20 pt-6 sm:pb-28 sm:pt-8">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_10%,rgba(216,192,138,0.10),transparent_22%),radial-gradient(circle_at_72%_16%,rgba(127,255,212,0.14),transparent_28%),radial-gradient(circle_at_52%_46%,rgba(8,40,69,0.18),transparent_34%),radial-gradient(circle_at_50%_82%,rgba(30,58,95,0.18),transparent_46%),linear-gradient(180deg,#061B33_0%,#082845_38%,#07233D_68%,#051A30_100%)]" />
      <div className="pointer-events-none absolute left-[4%] top-[4%] -z-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(216,192,138,0.14),transparent_72%)] blur-[130px]" />
      <div className="pointer-events-none absolute right-[-8%] top-[12%] -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(127,255,212,0.14),transparent_72%)] blur-[150px]" />
      <div className="pointer-events-none absolute left-[18%] top-[38%] -z-10 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(16,82,117,0.14),transparent_74%)] blur-[160px]" />
      <div className="pointer-events-none absolute right-[10%] bottom-[-6%] -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(30,58,95,0.18),transparent_74%)] blur-[150px]" />
      <div className="mx-auto max-w-6xl">
        {membershipDebugEnabled ? (
          <div className="mb-6 rounded-[24px] border border-gold/22 bg-[#09131d]/84 p-5 text-sm text-white/78">
            <p className="text-xs uppercase tracking-[0.26em] text-gold/78">Membership Debug</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <p>authenticated: {isLoggedIn ? "yes" : "no"}</p>
              <p>user ID present: {session?.user?.id ? "yes" : "no"}</p>
              <p>normalized login email: {membershipDebug.data?.debug?.normalizedLoginEmail ?? "unknown"}</p>
              <p>membership resolve HTTP status: {membershipDebug.httpStatus ?? "pending"}</p>
              <p>resolved plan: {membershipDebug.data?.plan ?? "pending"}</p>
              <p>resolved status: {membershipDebug.data?.membershipStatus ?? "none"}</p>
              <p>matched by: {membershipDebug.data?.debug?.matchedBy ?? "unknown"}</p>
              <p>membership row found: {membershipDebug.data?.debug?.membershipRowFound ? "yes" : "no"}</p>
              <p>Stripe customer ID present: {membershipDebug.data?.debug?.stripeCustomerIdPresent ? "yes" : "no"}</p>
              <p>subscription/payment state: {membershipDebug.data?.debug?.paymentState ?? "none"}</p>
              <p>final guard decision: {planResolved && isLoggedIn && hasActiveSubscription ? "allow" : "pending_or_block"}</p>
              <p>redirect reason: {planResolved && isLoggedIn && hasActiveSubscription ? "none" : "see guard diagnostics"}</p>
            </div>
          </div>
        ) : null}
        <BasicHome
          currentDay={dashboardState.challengeDay}
          streakCount={dashboardState.streakCount}
          planKey={plan}
          membershipResolved={planResolved}
          defaultRhythm={defaultRhythm}
          membershipSummary={membershipSummary}
        />
      </div>
    </div>
  );
}

export default function BasicProgramPage() {
  return (
    <MembershipGuard requiredPlan="basic" showLogout={false}>
      <Suspense
        fallback={
          <div className="section-shell py-16 sm:py-24">
            <div className="mx-auto max-w-3xl">
              <div className="premium-card rounded-[28px] p-8 text-center sm:p-12">
                <p className="text-lg text-white/72">Preparing your rhythm space...</p>
              </div>
            </div>
          </div>
        }
      >
        <BasicProgramContent />
      </Suspense>
    </MembershipGuard>
  );
}
