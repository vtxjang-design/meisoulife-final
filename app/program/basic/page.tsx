"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthState } from "@/components/auth-provider";
import { BasicHome } from "@/components/basic-home";
import { MembershipGuard } from "@/components/membership-guard";
import { recordAuthDiagnostic } from "@/lib/auth-flow-diagnostics";
import {
  BASIC_GARDEN_GROWTH_MOMENT_KEY,
  readBasicGardenGrowthMoment,
  type BasicGardenGrowthMoment
} from "@/lib/basic-garden-v1";
import { safeSessionStorageGet, safeSessionStorageRemove } from "@/lib/safe-browser-storage";
import type { MembershipResolutionResult } from "@/lib/membership";
import { useLanguage } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type DashboardState = {
  cumulativeVisitDays: number;
  cumulativeRecoveryRecords: number;
  todayDistinctGateCount: number;
  growthMoment: BasicGardenGrowthMoment | null;
};

type MembershipDebugState = {
  httpStatus: number | null;
  data: MembershipResolutionResult | null;
};

type DashboardLoadState = "idle" | "loading" | "ready" | "error";

function BasicProgramContent() {
  const { plan, planResolved, session, authResolved, isLoggedIn, membershipSummary, hasActiveSubscription } = useAuthState();
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const [dashboardState, setDashboardState] = useState<DashboardState | null>(null);
  const [dashboardLoadState, setDashboardLoadState] = useState<DashboardLoadState>("loading");
  const [dashboardRetry, setDashboardRetry] = useState(0);
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
    if (!authResolved) {
      return;
    }

    if (!userId) {
      setDashboardState(null);
      setDashboardLoadState("idle");
      return;
    }

    if (!supabase) {
      setDashboardLoadState("error");
      return;
    }

    const safeSupabase = supabase;

    async function loadDashboardState() {
      setDashboardLoadState("loading");

      try {
        const sessionResult = await safeSupabase.auth.getSession();
        const accessToken = sessionResult.data.session?.access_token?.trim();
        const response = await fetch("/api/basic/garden-visit", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`
              }
            : undefined
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          errorMessage?: string;
          cumulativeVisitDays?: unknown;
          cumulativeRecoveryRecords?: unknown;
          todayDistinctGateCount?: unknown;
          activityDate?: unknown;
        };

        if (!response.ok || !payload.ok) {
          throw new Error(payload.errorMessage || "Garden progress could not be loaded");
        }

        if (
          !Number.isInteger(payload.cumulativeVisitDays) ||
          !Number.isInteger(payload.cumulativeRecoveryRecords) ||
          !Number.isInteger(payload.todayDistinctGateCount) ||
          typeof payload.activityDate !== "string"
        ) {
          throw new Error("Garden progress response was invalid");
        }

        if (!active) {
          return;
        }

        const cumulativeVisitDays = payload.cumulativeVisitDays as number;
        const cumulativeRecoveryRecords = payload.cumulativeRecoveryRecords as number;
        const responseTodayDistinctGateCount = payload.todayDistinctGateCount as number;
        const activityDate = payload.activityDate as string;

        const pendingGrowthMoment = readBasicGardenGrowthMoment(safeSessionStorageGet(BASIC_GARDEN_GROWTH_MOMENT_KEY));
        const growthMoment =
          pendingGrowthMoment?.activityDate === activityDate && pendingGrowthMoment.checkInCount === cumulativeRecoveryRecords
            ? pendingGrowthMoment
            : null;

        if (pendingGrowthMoment) {
          safeSessionStorageRemove(BASIC_GARDEN_GROWTH_MOMENT_KEY);
        }

        const todayDistinctGateCount = growthMoment
          ? Math.max(3, responseTodayDistinctGateCount)
          : responseTodayDistinctGateCount;

        setDashboardState({
          cumulativeVisitDays,
          cumulativeRecoveryRecords,
          todayDistinctGateCount,
          growthMoment
        });
        setDashboardLoadState("ready");
        return;
      } catch (error) {
        console.warn("[program-basic] garden visit sync failed", {
          userId,
          error: error instanceof Error ? error.message : "unknown_error"
        });
      }

      if (active) {
        setDashboardLoadState("error");
      }
    }

    void loadDashboardState();

    return () => {
      active = false;
    };
  }, [authResolved, dashboardRetry, session?.user?.id]);

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
        {dashboardState ? (
          <BasicHome
            cumulativeVisitDays={dashboardState.cumulativeVisitDays}
            cumulativeRecoveryRecords={dashboardState.cumulativeRecoveryRecords}
            todayDistinctGateCount={dashboardState.todayDistinctGateCount}
            gardenGrowthMoment={dashboardState.growthMoment}
            planKey={plan}
            membershipResolved={planResolved}
            defaultRhythm={defaultRhythm}
            membershipSummary={membershipSummary}
          />
        ) : (
          <div role={dashboardLoadState === "error" ? "alert" : "status"} className="rounded-2xl border border-gold/30 bg-[#09131d]/84 px-4 py-5 text-sm text-white/82">
            <p>
              {dashboardLoadState === "error"
                ? language === "kr"
                  ? "가든 기록을 불러오지 못했습니다. 기록이 확인되면 여기에 표시됩니다."
                  : language === "jp"
                    ? "ガーデンの記録を読み込めませんでした。確認でき次第、ここに表示されます。"
                    : "We could not load your Garden progress. It will appear here once confirmed."
                : language === "kr"
                  ? "가든 기록을 불러오고 있습니다..."
                  : language === "jp"
                    ? "ガーデンの記録を読み込んでいます..."
                    : "Loading your Garden progress..."}
            </p>
            {dashboardLoadState === "error" ? (
              <button
                type="button"
                className="mt-2 rounded-full border border-gold/45 px-3 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                onClick={() => setDashboardRetry((value) => value + 1)}
              >
                {language === "kr" ? "다시 시도" : language === "jp" ? "再試行" : "Try again"}
              </button>
            ) : null}
          </div>
        )}
        {dashboardLoadState === "error" && dashboardState ? (
          <div role="alert" className="mt-4 rounded-2xl border border-gold/30 bg-[#09131d]/84 px-4 py-3 text-sm text-white/82">
            <p>
              {language === "kr"
                ? "가든 기록을 불러오지 못했습니다. 마지막으로 확인된 기록은 그대로 표시됩니다."
                : language === "jp"
                  ? "ガーデンの記録を読み込めませんでした。最後に確認できた記録を表示しています。"
                  : "We could not load your Garden progress. Your last confirmed record is still shown."}
            </p>
            <button
              type="button"
              className="mt-2 rounded-full border border-gold/45 px-3 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              onClick={() => setDashboardRetry((value) => value + 1)}
            >
              {language === "kr" ? "다시 시도" : language === "jp" ? "再試行" : "Try again"}
            </button>
          </div>
        ) : null}
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
