"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useAuthState } from "@/components/auth-provider";
import { BasicHome } from "@/components/basic-home";
import { getLocaleCopy, useLanguage } from "@/lib/i18n";
import { getMockDashboard } from "@/lib/mock-data";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type DashboardState = {
  challengeDay: number;
  streakCount: number;
};

const basicPageCopy = {
  jp: {
    sidebarTitle: "RHYTHM GARDEN",
    sidebarSubtitle: "探検者の安息所",
    nav: [
      { label: "ホーム", href: "#marker-stone" },
      { label: "記録", href: "#quiet-records" },
      { label: "仲間", href: "#companions" },
      { label: "その他", href: "#upcoming-gatherings" }
    ],
    companion: {
      progressTitle: "旅の進行状況",
      progressSubtitle: "新しい始まりの日",
      insightTitle: "今日の気づき",
      insightBody: "自分へ帰る時間がここにあります。",
      continuedTitle: "続いてきた日々",
      gatheringsTitle: "Growthで開く時間",
      gatheringsBody: "ライブ瞑想やともに深める実践は、Growthで静かに開いていきます。",
      gatheringsCta: "Growthを見る",
      memberLabel: "Basicメンバー",
      memberFallback: "リズム空間を準備しています。",
      memberError: "会員状態を一時的に確認できませんでした。更新してもう一度お試しください。",
      aiLabel: "急がずに進むことが、今日のリズムを守ってくれます。"
    },
  },
  kr: {
    sidebarTitle: "RHYTHM GARDEN",
    sidebarSubtitle: "탐험가의 안식처",
    nav: [
      { label: "홈", href: "#marker-stone" },
      { label: "기록", href: "#quiet-records" },
      { label: "사람들", href: "#companions" },
      { label: "더보기", href: "#upcoming-gatherings" }
    ],
    companion: {
      progressTitle: "여정 진행 현황",
      progressSubtitle: "새로운 시작의 날",
      insightTitle: "오늘의 통찰",
      insightBody: "자신에게 돌아오는 시간이 여기에 있습니다.",
      continuedTitle: "이어온 날들",
      gatheringsTitle: "Growth에서 열리는 시간",
      gatheringsBody: "라이브 명상과 함께 깊어지는 실천은 Growth에서 조용히 열립니다.",
      gatheringsCta: "Growth 보기",
      memberLabel: "Basic 회원",
      memberFallback: "리듬 공간을 준비하고 있습니다.",
      memberError: "회원 상태를 잠시 확인할 수 없습니다. 새로고침 후 다시 시도해주세요.",
      aiLabel: "급히 가는 것보다, 오늘의 리듬을 잃지 않는 것이 더 중요합니다."
    },
  },
  en: {
    sidebarTitle: "RHYTHM GARDEN",
    sidebarSubtitle: "Explorer Sanctuary",
    nav: [
      { label: "Home", href: "#marker-stone" },
      { label: "Records", href: "#quiet-records" },
      { label: "People", href: "#companions" },
      { label: "More", href: "#upcoming-gatherings" }
    ],
    companion: {
      progressTitle: "Journey Progress",
      progressSubtitle: "A day of new beginning",
      insightTitle: "Today’s Insight",
      insightBody: "The time to return to yourself is here.",
      continuedTitle: "Continued Days",
      gatheringsTitle: "What Opens in Growth",
      gatheringsBody: "Live meditation and deeper shared practice quietly open in Growth.",
      gatheringsCta: "See Growth",
      memberLabel: "Basic Member",
      memberFallback: "Preparing your rhythm space.",
      memberError: "We could not confirm your membership status. Please refresh and try again.",
      aiLabel: "More important than moving fast is staying with your rhythm."
    },
  }
} as const;

function BasicSidebar() {
  const { language } = useLanguage();
  const copy = getLocaleCopy(basicPageCopy, language);

  return (
    <>
      <div className="glass-panel overflow-x-auto rounded-[22px] px-4 py-3 lg:hidden">
        <div className="flex min-w-max items-center gap-2">
          {copy.nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/72 transition hover:bg-white/[0.07]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <aside className="glass-panel sticky top-24 hidden h-fit rounded-[32px] bg-[radial-gradient(circle_at_top_left,rgba(115,231,210,0.16),transparent_38%),radial-gradient(circle_at_top_right,rgba(89,193,255,0.14),transparent_42%),linear-gradient(180deg,rgba(14,28,46,0.82),rgba(8,22,34,0.78),rgba(9,34,42,0.76))] p-5 shadow-[0_28px_80px_rgba(4,10,20,0.28)] lg:block">
        <p className="text-xs uppercase tracking-[0.32em] text-gold/80">{copy.sidebarTitle}</p>
        <p className="mt-3 font-serif text-xl leading-tight text-white">{copy.sidebarSubtitle}</p>
        <nav className="mt-6 space-y-2">
          {copy.nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/76 transition hover:-translate-y-0.5 hover:bg-white/[0.07]"
            >
              {item.label}
            </Link>
          ))}
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
    <section id="upcoming-gatherings" className="mt-10 space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel rounded-[30px] bg-[radial-gradient(circle_at_top_left,rgba(115,231,210,0.16),transparent_42%),radial-gradient(circle_at_top_right,rgba(89,193,255,0.14),transparent_42%),linear-gradient(135deg,rgba(115,231,210,0.08),rgba(89,193,255,0.04)),linear-gradient(180deg,rgba(14,28,46,0.80),rgba(8,22,34,0.74),rgba(9,34,42,0.72))] p-5 shadow-[0_24px_68px_rgba(4,10,20,0.24)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.companion.progressTitle}</p>
              <p className="mt-3 text-2xl font-semibold text-white">Day {safeDay} / 7</p>
              <p className="mt-2 text-sm text-white/58">{copy.companion.progressSubtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">{copy.companion.continuedTitle}</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {streakCount} {language === "jp" ? "日" : language === "kr" ? "일" : "days"}
              </p>
              <p className="mt-2 text-sm text-white/56">{memberStatus}</p>
            </div>
          </div>
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

        <div className="glass-panel rounded-[30px] bg-[radial-gradient(circle_at_top_right,rgba(115,231,210,0.14),transparent_40%),linear-gradient(135deg,rgba(115,231,210,0.08),rgba(89,193,255,0.04)),linear-gradient(180deg,rgba(18,26,44,0.78),rgba(11,18,30,0.72),rgba(9,30,38,0.68))] p-5 shadow-[0_24px_68px_rgba(4,10,20,0.22)]">
          <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.companion.gatheringsTitle}</p>
          <p className="mt-4 text-sm leading-7 text-white/74">{copy.companion.gatheringsBody}</p>
          <Link
            href="/pricing"
            className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            {copy.companion.gatheringsCta}
          </Link>
        </div>
      </div>

      <div className="glass-panel rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(89,193,255,0.12),transparent_42%),linear-gradient(135deg,rgba(115,231,210,0.08),rgba(89,193,255,0.04)),linear-gradient(180deg,rgba(15,27,43,0.78),rgba(10,18,30,0.72),rgba(9,30,38,0.68))] p-5 shadow-[0_24px_68px_rgba(4,10,20,0.22)]">
        <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.companion.insightTitle}</p>
        <p className="mt-3 text-base leading-7 text-white/82">{copy.companion.insightBody}</p>
        <p className="mt-4 text-sm text-white/50">{copy.companion.aiLabel}</p>
      </div>
    </section>
  );
}

function BasicProgramContent() {
  const { plan, planResolved, planError, session, authResolved, isLoggedIn } = useAuthState();
  const { language } = useLanguage();
  const copy = getLocaleCopy(basicPageCopy, language);
  const router = useRouter();
  const pathname = usePathname();
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

  useEffect(() => {
    if (!authResolved) {
      return;
    }

    if (isLoggedIn) {
      return;
    }

    const nextPath =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}${window.location.hash}`
        : pathname;

    router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
  }, [authResolved, isLoggedIn, pathname, router]);

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
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_20%,rgba(115,231,210,0.18),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(89,193,255,0.16),transparent_50%),radial-gradient(circle_at_50%_80%,rgba(70,220,200,0.12),transparent_60%),linear-gradient(180deg,#041221_0%,#082038_42%,#0B2F3D_74%,#103845_100%)]" />
      <div className="pointer-events-none absolute inset-x-[-6%] top-[-4%] -z-10 h-[560px] rounded-full bg-[radial-gradient(circle,rgba(115,231,210,0.26),transparent_68%)] blur-[130px]" />
      <div className="pointer-events-none absolute right-[-14%] top-[8%] -z-10 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(89,193,255,0.22),transparent_70%)] blur-[150px]" />
      <div className="pointer-events-none absolute left-[14%] top-[28%] -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(115,231,210,0.16),transparent_72%)] blur-[144px]" />
      <div className="pointer-events-none absolute inset-x-[8%] bottom-[8%] -z-10 h-[520px] rounded-full bg-[radial-gradient(circle,rgba(70,220,200,0.14),transparent_74%)] blur-[148px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1400px] rounded-[56px] bg-[radial-gradient(circle_at_top_left,rgba(115,231,210,0.30),transparent_54%),radial-gradient(circle_at_top_right,rgba(89,193,255,0.26),transparent_60%),radial-gradient(circle_at_50%_78%,rgba(70,220,200,0.12),transparent_62%),linear-gradient(180deg,rgba(4,18,33,0.18),rgba(8,32,56,0.08)_42%,rgba(16,56,69,0.04)_100%)]" />
      <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)]">
        <BasicSidebar />

        <main className="min-w-0">
          {planError || !planResolved ? (
            <div className="mb-4 rounded-[20px] border border-gold/18 bg-[linear-gradient(135deg,rgba(212,175,55,0.10),rgba(115,231,210,0.07))] px-5 py-4 text-sm leading-7 text-white/78 shadow-[0_18px_52px_rgba(4,10,20,0.18)]">
              {planError
                ? language === "jp"
                  ? "会員状態の確認に時間がかかっていますが、今日のリズム空間はそのままご利用いただけます。"
                  : language === "kr"
                    ? "멤버십 상태 확인이 지연되고 있지만, 오늘의 리듬 공간은 그대로 이용하실 수 있습니다."
                    : "Membership verification is taking a little longer, but your daily rhythm space is still available."
                : copy.companion.memberFallback}
            </div>
          ) : null}
          <BasicHome
            currentDay={dashboardState.challengeDay}
            streakCount={dashboardState.streakCount}
            planKey={plan}
            membershipResolved={planResolved && !planError}
            defaultRhythm={defaultRhythm}
          />
          <BasicCompanionPanel
            challengeDay={dashboardState.challengeDay}
            streakCount={dashboardState.streakCount}
            planResolved={planResolved && !planError}
            planError={planError}
          />
        </main>
      </div>
    </div>
  );
}

export default function BasicProgramPage() {
  return (
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
  );
}
