"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
    sidebarTitle: "RHYTHM GARDEN",
    sidebarSubtitle: "探検者の安息所",
    nav: [
      { label: "安息所ホーム", href: "#marker-stone" },
      { label: "私のリズムの旅", href: "#journey-path" },
      { label: "今日の道", href: "#rhythm-gates" },
      { label: "7日間のリズム旅", href: "/rhythm-journey" },
      { label: "回復記録", href: "#quiet-records" },
      { label: "私の気づき", href: "#marker-stone" },
      { label: "ともに歩く人たち", href: "#companions" },
      { label: "コミュニティ", href: "/community" },
      { label: "集い", href: "#upcoming-gatherings" },
      { label: "物語", disabled: true },
      { label: "私の場所", href: "/program/basic" },
      { label: "プロフィール", href: "/member" },
      { label: "設定", disabled: true }
    ],
    companion: {
      progressTitle: "旅の進行状況",
      progressSubtitle: "新しい始まりの日",
      insightTitle: "今日の気づき",
      insightBody: "自分へ帰る時間がここにあります。",
      continuedTitle: "続いてきた日々",
      gatheringsTitle: "これからの集い",
      gatheringsCta: "集いを見る",
      memberLabel: "Basicメンバー",
      memberFallback: "リズム空間を準備しています。",
      memberError: "会員状態を一時的に確認できませんでした。更新してもう一度お試しください。",
      aiLabel: "AI 1/3"
    },
    secondaryEyebrow: "RECOVERY RECORDS",
    secondaryBody: "旅の流れと続いてきたリズムを静かに確認できます。"
  },
  kr: {
    sidebarTitle: "RHYTHM GARDEN",
    sidebarSubtitle: "탐험가의 안식처",
    nav: [
      { label: "안식처 홈", href: "#marker-stone" },
      { label: "나의 리듬 여정", href: "#journey-path" },
      { label: "오늘의 길", href: "#rhythm-gates" },
      { label: "7일 리듬 여정", href: "/rhythm-journey" },
      { label: "회복 기록", href: "#quiet-records" },
      { label: "나의 통찰", href: "#marker-stone" },
      { label: "함께 걷는 사람들", href: "#companions" },
      { label: "커뮤니티", href: "/community" },
      { label: "모임", href: "#upcoming-gatherings" },
      { label: "이야기", disabled: true },
      { label: "나의 공간", href: "/program/basic" },
      { label: "프로필", href: "/member" },
      { label: "설정", disabled: true }
    ],
    companion: {
      progressTitle: "여정 진행 현황",
      progressSubtitle: "새로운 시작의 날",
      insightTitle: "오늘의 통찰",
      insightBody: "자신에게 돌아오는 시간이 여기에 있습니다.",
      continuedTitle: "이어온 날들",
      gatheringsTitle: "다가오는 모임",
      gatheringsCta: "모임 더 보기",
      memberLabel: "Basic 회원",
      memberFallback: "리듬 공간을 준비하고 있습니다.",
      memberError: "회원 상태를 잠시 확인할 수 없습니다. 새로고침 후 다시 시도해주세요.",
      aiLabel: "AI 1/3"
    },
    secondaryEyebrow: "RECOVERY RECORDS",
    secondaryBody: "여정의 흐름과 이어온 리듬을 조용히 확인할 수 있습니다."
  },
  en: {
    sidebarTitle: "RHYTHM GARDEN",
    sidebarSubtitle: "Explorer Sanctuary",
    nav: [
      { label: "Sanctuary Home", href: "#marker-stone" },
      { label: "My Rhythm Journey", href: "#journey-path" },
      { label: "Today’s Path", href: "#rhythm-gates" },
      { label: "7-Day Rhythm Journey", href: "/rhythm-journey" },
      { label: "Recovery Records", href: "#quiet-records" },
      { label: "My Insights", href: "#marker-stone" },
      { label: "Walking Companions", href: "#companions" },
      { label: "Community", href: "/community" },
      { label: "Gatherings", href: "#upcoming-gatherings" },
      { label: "Stories", disabled: true },
      { label: "My Space", href: "/program/basic" },
      { label: "Profile", href: "/member" },
      { label: "Settings", disabled: true }
    ],
    companion: {
      progressTitle: "Journey Progress",
      progressSubtitle: "A day of new beginning",
      insightTitle: "Today’s Insight",
      insightBody: "The time to return to yourself is here.",
      continuedTitle: "Continued Days",
      gatheringsTitle: "Upcoming Gatherings",
      gatheringsCta: "View Gatherings",
      memberLabel: "Basic Member",
      memberFallback: "Preparing your rhythm space.",
      memberError: "We could not confirm your membership status. Please refresh and try again.",
      aiLabel: "AI 1/3"
    },
    secondaryEyebrow: "RECOVERY RECORDS",
    secondaryBody: "A quiet place to see your journey and rhythm."
  }
} as const;

function BasicSidebar() {
  const { language } = useLanguage();
  const copy = getLocaleCopy(basicPageCopy, language);

  return (
    <>
      <div className="glass-panel overflow-x-auto rounded-[22px] px-4 py-3 lg:hidden">
        <div className="flex min-w-max items-center gap-2">
          {copy.nav.map((item) => {
            if ("href" in item) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/72 transition hover:bg-white/[0.07]"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <span
                key={item.label}
                className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-white/35"
              >
                {item.label}
              </span>
            );
          })}
        </div>
      </div>

      <aside className="glass-panel sticky top-24 hidden h-fit rounded-[32px] bg-[radial-gradient(circle_at_top_left,rgba(115,231,210,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(89,193,255,0.08),transparent_28%),linear-gradient(180deg,rgba(14,28,46,0.84),rgba(8,22,34,0.80),rgba(9,34,42,0.78))] p-5 shadow-[0_28px_80px_rgba(4,10,20,0.28)] lg:block">
        <p className="text-xs uppercase tracking-[0.32em] text-gold/80">{copy.sidebarTitle}</p>
        <p className="mt-3 font-serif text-xl leading-tight text-white">{copy.sidebarSubtitle}</p>
        <nav className="mt-6 space-y-2">
          {copy.nav.map((item) => {
            if ("href" in item) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/76 transition hover:-translate-y-0.5 hover:bg-white/[0.07]"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <span
                key={item.label}
                className="block rounded-[16px] border border-white/6 bg-white/[0.025] px-4 py-3 text-sm text-white/34"
              >
                {item.label}
              </span>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function BasicCompanionPanel({
  challengeDay,
  streakCount,
  planResolved,
  planError
}: {
  challengeDay: number;
  streakCount: number;
  planResolved: boolean;
  planError?: string | null;
}) {
  const { language } = useLanguage();
  const copy = getLocaleCopy(basicPageCopy, language);
  const safeDay = Math.min(Math.max(challengeDay, 1), 7);

  const memberStatus = planError ? copy.companion.memberError : planResolved ? copy.companion.memberLabel : copy.companion.memberFallback;

  return (
    <aside className="space-y-4 lg:pt-8">
      <div className="glass-panel rounded-[30px] bg-[radial-gradient(circle_at_top_left,rgba(115,231,210,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(89,193,255,0.08),transparent_28%),linear-gradient(180deg,rgba(14,28,46,0.82),rgba(8,22,34,0.76),rgba(9,34,42,0.74))] p-5 shadow-[0_24px_68px_rgba(4,10,20,0.24)]">
        <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.companion.progressTitle}</p>
        <p className="mt-3 text-2xl font-semibold text-white">Day {safeDay} / 7</p>
        <p className="mt-2 text-sm text-white/58">{copy.companion.progressSubtitle}</p>
        <div className="mt-5 flex gap-2">
          {Array.from({ length: 7 }, (_, index) => {
            const day = index + 1;
            const active = day === safeDay;
            const completed = day < safeDay;

            return (
              <span
                key={day}
                className={`h-2.5 flex-1 rounded-full ${
                  active ? "bg-gold shadow-[0_0_16px_rgba(212,175,55,0.45)]" : completed ? "bg-moss/70" : "bg-white/12"
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="glass-panel rounded-[30px] bg-[radial-gradient(circle_at_top_left,rgba(89,193,255,0.06),transparent_30%),linear-gradient(180deg,rgba(15,27,43,0.80),rgba(10,18,30,0.74),rgba(9,30,38,0.70))] p-5 shadow-[0_24px_68px_rgba(4,10,20,0.22)]">
        <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.companion.insightTitle}</p>
        <p className="mt-3 text-base leading-7 text-white/82">{copy.companion.insightBody}</p>
        <p className="mt-4 text-sm text-white/50">{copy.companion.aiLabel}</p>
      </div>

      <div className="glass-panel rounded-[30px] bg-[radial-gradient(circle_at_bottom_left,rgba(76,183,151,0.08),transparent_30%),linear-gradient(180deg,rgba(16,32,36,0.80),rgba(10,22,26,0.74),rgba(11,36,40,0.70))] p-5 shadow-[0_24px_68px_rgba(4,10,20,0.22)]">
        <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.companion.continuedTitle}</p>
        <p className="mt-3 text-2xl font-semibold text-white">{streakCount} {language === "jp" ? "日" : language === "kr" ? "일" : "days"}</p>
        <p className="mt-2 text-sm text-white/56">{memberStatus}</p>
      </div>

      <div id="upcoming-gatherings" className="glass-panel rounded-[30px] bg-[radial-gradient(circle_at_top_right,rgba(115,231,210,0.08),transparent_28%),linear-gradient(180deg,rgba(18,26,44,0.80),rgba(11,18,30,0.74),rgba(9,30,38,0.70))] p-5 shadow-[0_24px_68px_rgba(4,10,20,0.22)]">
        <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.companion.gatheringsTitle}</p>
        <div className="mt-4 grid gap-3">
          <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/78">
            {language === "jp" ? "毎週水曜 06:30 朝ライブ瞑想" : language === "kr" ? "매주 수요일 06:30 아침 라이브 명상" : "Every Wednesday 06:30 Morning live meditation"}
          </div>
          <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/78">
            {language === "jp" ? "土曜 21:00 睡眠回復セッション" : language === "kr" ? "토요일 21:00 수면 회복 세션" : "Saturday 21:00 Sleep recovery session"}
          </div>
        </div>
        <Link
          href="/community"
          className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
        >
          {copy.companion.gatheringsCta}
        </Link>
      </div>
    </aside>
  );
}

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
    <div className="section-shell relative pb-20 pt-6 sm:pb-28 sm:pt-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1100px] rounded-[56px] bg-[radial-gradient(circle_at_top_left,rgba(115,231,210,0.20),transparent_35%),radial-gradient(circle_at_top_right,rgba(89,193,255,0.16),transparent_40%),linear-gradient(180deg,#041221_0%,#082038_40%,#0B2F3D_70%,#103845_100%)] blur-sm" />
      <div className="pointer-events-none absolute inset-x-[10%] top-28 -z-10 h-56 rounded-full bg-[radial-gradient(circle,rgba(115,231,210,0.10),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[4%] top-48 -z-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(89,193,255,0.10),transparent_72%)] blur-3xl" />
      <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)_310px] xl:grid-cols-[250px_minmax(0,1fr)_330px]">
        <BasicSidebar />

        <main className="min-w-0">
          <BasicHome currentDay={dashboardState.challengeDay} streakCount={dashboardState.streakCount} />

          <section id="quiet-records" className="pt-10 sm:pt-14">
            <div className="mb-6 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.28em] text-white/42">{copy.secondaryEyebrow}</p>
              <p className="mt-3 text-sm leading-7 text-white/60">{copy.secondaryBody}</p>
              {planError ? <p className="mt-3 text-sm text-white/46">{planError}</p> : null}
            </div>

            <MemberDashboard
              variant="basic"
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
          </section>
        </main>

        <BasicCompanionPanel
          challengeDay={dashboardState.challengeDay}
          streakCount={dashboardState.streakCount}
          planResolved={planResolved && !planError}
          planError={planError}
        />
      </div>
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
