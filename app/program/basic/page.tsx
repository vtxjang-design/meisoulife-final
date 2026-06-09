"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "@/components/auth-provider";
import { BasicHome } from "@/components/basic-home";
import { MemberDashboard } from "@/components/member-dashboard";
import { ProgramAccessGuard } from "@/components/program-access-guard";
import { getLocaleCopy, useLanguage } from "@/lib/i18n";
import { isLeaderCandidate } from "@/lib/leader";
import { getMockDashboard } from "@/lib/mock-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type DashboardState = {
  challengeDay: number;
  streakCount: number;
  candidateLeader: boolean;
};

const basicPageCopy = {
  jp: {
    secondaryEyebrow: "RHYTHM GARDEN",
    secondaryBody: "旅の流れ、ともに歩く人たち、次の集いは、必要なときにここで静かに確かめられます。"
  },
  kr: {
    secondaryEyebrow: "RHYTHM GARDEN",
    secondaryBody: "여정의 흐름, 함께 걷는 사람들, 다음 모임은 필요할 때 이곳에서 조용히 확인할 수 있습니다."
  },
  en: {
    secondaryEyebrow: "RHYTHM GARDEN",
    secondaryBody: "Journey, fellow travelers, and upcoming gatherings rest here quietly when you need them."
  }
} as const;

function BasicProgramContent() {
  const { plan, planResolved, planError, userEmail, session } = useAuthState();
  const { language } = useLanguage();
  const copy = getLocaleCopy(basicPageCopy, language);
  const mock = getMockDashboard();
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    challengeDay: mock.challengeDay,
    streakCount: mock.streakCount,
    candidateLeader: false
  });

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();
    const userId = session?.user?.id;

    if (!supabase || !userId) {
      setDashboardState({
        challengeDay: mock.challengeDay,
        streakCount: mock.streakCount,
        candidateLeader: false
      });
      return;
    }

    const safeSupabase = supabase;

    async function loadDashboardState() {
      const { data: profile, error } = await safeSupabase
        .from("users")
        .select("candidate_leader, paid_days, check_in_count, helpful_comments, challenge_day")
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
          streakCount: mock.streakCount,
          candidateLeader: false
        });
        return;
      }

      setDashboardState({
        challengeDay:
          typeof profile?.challenge_day === "number" && profile.challenge_day > 0 ? profile.challenge_day : mock.challengeDay,
        streakCount:
          typeof profile?.check_in_count === "number" && profile.check_in_count > 0
            ? profile.check_in_count
            : mock.streakCount,
        candidateLeader: isLeaderCandidate({
          paidDays: profile?.paid_days || 0,
          checkInCount: profile?.check_in_count || 0,
          helpfulComments: profile?.helpful_comments || 0,
          candidateLeader: profile?.candidate_leader
        })
      });
    }

    void loadDashboardState();

    return () => {
      active = false;
    };
  }, [mock.challengeDay, mock.streakCount, session?.user?.id]);

  return (
    <div className="pb-16 sm:pb-24">
      <BasicHome />

      <section className="section-shell pt-10 sm:pt-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">{copy.secondaryEyebrow}</p>
            <p className="mt-3 text-sm leading-7 text-white/60">{copy.secondaryBody}</p>
            {planError ? <p className="mt-3 text-sm text-white/46">{planError}</p> : null}
          </div>

          <MemberDashboard
            planKey={plan}
            membershipResolved={planResolved && !planError}
            membershipError={Boolean(planError)}
            challengeDay={dashboardState.challengeDay}
            streakCount={dashboardState.streakCount}
            aiUsage={mock.aiUsage}
            candidateLeader={dashboardState.candidateLeader}
            communityUrl={plan === "free" ? mock.communityLinks.free : mock.communityLinks.paid}
            registeredEmail={userEmail}
          />
        </div>
      </section>
    </div>
  );
}

export default function BasicProgramPage() {
  return (
    <ProgramAccessGuard>
      <BasicProgramContent />
    </ProgramAccessGuard>
  );
}
