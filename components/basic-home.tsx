"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useLanguage } from "@/lib/i18n";
import {
  getBasicGardenCountMessage,
  getBasicGardenMeaningLine,
  getBasicGardenVisualModel,
  getBasicGateShortcutHref,
  getBasicHomeRecommendedGateForDate,
  resolveBasicHomeRecommendedGate
} from "@/lib/basic-home-entry";
import { getBasicRhythmGates, type BasicDoorKey, type BasicGateKey } from "@/lib/basic-rhythm";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type PlanKey = "free" | "basic" | "growth" | "inner_circle";
type BasicHomeProps = {
  currentDay?: number;
  streakCount?: number;
  planKey?: PlanKey;
  membershipResolved?: boolean;
  defaultRhythm?: "morning" | "day" | "night";
  membershipSummary?: {
    currentPlan: "free" | "basic" | "growth" | "inner_circle";
    subscriptionStatus: string | null;
    nextBillingDate: string | null;
    canManageMembership: boolean;
  };
};

const pageCopy = {
  jp: {
    badge: "BASIC RHYTHM",
    title: "今日のリズムを、\nひとつ選びましょう。",
    body: "朝・昼・夜。今の自分に合う扉から。",
    gatesTitle: "TODAY'S RHYTHM",
    gatesBody: "今日の扉を選びます",
    gardenLabel: "私のリカバリーガーデン",
    gardenHeadline: "今日までの回復が、\nここに静かに残っています。",
    gardenBody: "記録されている回復だけを、静かに表示しています。",
    currentDayLabel: "現在の進行日",
    sessionCountLabel: "累計チェックイン数",
    recommendationLabel: "TODAY'S GATE",
    recommendationTitle: "今日、どの扉に入りますか？",
    recommendationBody: "今の時間帯に合う扉へ、そのまま静かに入れます。",
    recommendationSourceFallback: "最初の入口として Morning Gate を表示しています。",
    recommendationBadge: "今のおすすめ",
    gateSummaries: {
      morning: "一日をやわらかく始めたいとき",
      daytime: "集中や緊張を少し戻したいとき",
      evening: "一日を静かに手放したいとき"
    },
    enter: "この扉へ",
    movingToGate: "次へ進んでいます…",
    membershipTitle: "Membership",
    currentPlan: "Current Plan",
    subscriptionStatus: "Subscription Status",
    nextBillingDate: "次回決済日",
    billingHelper: "詳しい請求情報はStripeで確認できます",
    manageMembership: "管理",
    openingPortal: "Opening...",
    noBillingDate: "--",
    unknownStatus: "Unknown",
    membershipError: "メンバーシップ管理ページを開けませんでした"
  },
  kr: {
    badge: "BASIC RHYTHM",
    title: "오늘의 리듬을,\n하나 선택해보세요.",
    body: "아침·낮·밤. 지금의 나에게 맞는 문부터.",
    gatesTitle: "TODAY'S RHYTHM",
    gatesBody: "오늘의 문을 선택하세요",
    gardenLabel: "나의 리커버리 가든",
    gardenHeadline: "오늘까지의 회복이,\n여기에 조용히 남아 있습니다.",
    gardenBody: "이미 기록된 회복만 조용히 보여줍니다.",
    currentDayLabel: "현재 진행 일차",
    sessionCountLabel: "누적 체크인",
    recommendationLabel: "TODAY'S GATE",
    recommendationTitle: "오늘, 어떤 문으로 들어갈까요?",
    recommendationBody: "지금 시간대에 맞는 문으로 바로 조용히 들어갈 수 있습니다.",
    recommendationSourceFallback: "첫 입구로 Morning Gate를 보여주고 있습니다.",
    recommendationBadge: "지금의 추천",
    gateSummaries: {
      morning: "하루를 조금 더 부드럽게 시작하고 싶을 때",
      daytime: "흐트러진 집중과 긴장을 잠시 되돌리고 싶을 때",
      evening: "하루를 조용히 내려놓고 싶을 때"
    },
    enter: "이 문으로",
    movingToGate: "다음으로 이동하고 있습니다…",
    membershipTitle: "멤버십 관리",
    currentPlan: "현재 플랜",
    subscriptionStatus: "구독 상태",
    nextBillingDate: "다음 결제일",
    billingHelper: "자세한 청구 정보는 Stripe에서 확인할 수 있습니다",
    manageMembership: "관리",
    openingPortal: "여는 중...",
    noBillingDate: "--",
    unknownStatus: "Unknown",
    membershipError: "멤버십 관리 페이지를 열 수 없습니다"
  },
  en: {
    badge: "BASIC RHYTHM",
    title: "Choose one rhythm\nfor today.",
    body: "Morning, daytime, or evening—begin with the door that fits you now.",
    gatesTitle: "TODAY'S RHYTHM",
    gatesBody: "Choose today’s door",
    gardenLabel: "MY RECOVERY GARDEN",
    gardenHeadline: "Your recorded recovery\nis resting here, quietly.",
    gardenBody: "This view quietly shows only recovery already recorded in your account.",
    currentDayLabel: "Current program day",
    sessionCountLabel: "Total check-ins",
    recommendationLabel: "TODAY'S GATE",
    recommendationTitle: "Which gate will you enter today?",
    recommendationBody: "Enter the gate that fits this part of your day, without extra steps.",
    recommendationSourceFallback: "Morning Gate is shown as the first steady starting point.",
    recommendationBadge: "Recommended now",
    gateSummaries: {
      morning: "When you want to begin the day more gently",
      daytime: "When you want to restore focus and release tension",
      evening: "When you want to quietly let go of the day"
    },
    enter: "Enter this gate",
    movingToGate: "Moving to the next step…",
    membershipTitle: "Membership",
    currentPlan: "Current Plan",
    subscriptionStatus: "Subscription Status",
    nextBillingDate: "Next Payment Date",
    billingHelper: "Detailed billing information is available in Stripe",
    manageMembership: "Manage",
    openingPortal: "Opening...",
    noBillingDate: "--",
    unknownStatus: "Unknown",
    membershipError: "We could not open the membership management page"
  }
} as const;

function resolveLanguage(language: string) {
  if (language === "kr" || language === "en" || language === "jp") {
    return language;
  }

  return "jp";
}

function getGateClasses(gate: BasicGateKey, active: boolean) {
  const activeRing = active ? "border-[rgba(216,192,138,0.26)]" : "border-white/[0.08]";

  if (gate === "morning") {
    return `${activeRing} bg-[radial-gradient(circle_at_top,rgba(216,192,138,0.16),transparent_38%),radial-gradient(circle_at_22%_18%,rgba(127,255,212,0.10),transparent_44%),linear-gradient(180deg,rgba(16,49,77,0.76),rgba(8,40,69,0.87)_54%,rgba(6,27,51,0.94))]`;
  }

  if (gate === "daytime") {
    return `${activeRing} bg-[radial-gradient(circle_at_top,rgba(77,182,172,0.16),transparent_40%),radial-gradient(circle_at_80%_24%,rgba(127,255,212,0.08),transparent_44%),linear-gradient(180deg,rgba(11,42,68,0.80),rgba(8,40,69,0.89)_52%,rgba(6,27,51,0.95))]`;
  }

  return `${activeRing} bg-[radial-gradient(circle_at_top,rgba(30,58,95,0.22),transparent_40%),radial-gradient(circle_at_76%_20%,rgba(127,255,212,0.07),transparent_44%),linear-gradient(180deg,rgba(9,34,59,0.85),rgba(7,27,50,0.94)_52%,rgba(5,18,34,0.98))]`;
}

function getGateCardClasses(gate: BasicGateKey, recommended: boolean, pending: boolean) {
  const base =
    "group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border px-5 py-5 text-left shadow-[0_18px_44px_rgba(0,0,0,0.15)] transition-[transform,border-color,background-color,box-shadow,opacity] duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(216,192,138,0.68)] active:translate-y-[1px] motion-reduce:transform-none motion-reduce:transition-none";
  const recommendationClasses = recommended
    ? "border-[rgba(216,192,138,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.088),rgba(255,255,255,0.04))] shadow-[0_20px_48px_rgba(0,0,0,0.18)] hover:border-[rgba(216,192,138,0.34)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0.05))]"
    : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.026))] hover:border-white/[0.18] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.034))]";
  const motionClasses = pending ? "cursor-wait opacity-[0.92]" : "hover:-translate-y-0.5";

  if (gate === "morning") {
    return `${base} ${recommendationClasses} ${motionClasses} bg-[radial-gradient(circle_at_top,rgba(216,192,138,0.14),transparent_38%),radial-gradient(circle_at_18%_18%,rgba(127,255,212,0.08),transparent_44%),linear-gradient(180deg,rgba(16,49,77,0.72),rgba(8,40,69,0.86)_54%,rgba(6,27,51,0.94))]`;
  }

  if (gate === "daytime") {
    return `${base} ${recommendationClasses} ${motionClasses} bg-[radial-gradient(circle_at_top,rgba(77,182,172,0.16),transparent_40%),radial-gradient(circle_at_80%_24%,rgba(127,255,212,0.07),transparent_44%),linear-gradient(180deg,rgba(11,42,68,0.78),rgba(8,40,69,0.88)_52%,rgba(6,27,51,0.95))]`;
  }

  return `${base} ${recommendationClasses} ${motionClasses} bg-[radial-gradient(circle_at_top,rgba(96,132,182,0.16),transparent_40%),radial-gradient(circle_at_76%_20%,rgba(216,192,138,0.09),transparent_44%),linear-gradient(180deg,rgba(9,34,59,0.84),rgba(7,27,50,0.94)_52%,rgba(5,18,34,0.98))]`;
}

function getDoorClasses(gate: BasicGateKey) {
  if (gate === "morning") {
    return "border-[rgba(255,255,255,0.085)] bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(255,255,255,0.028))] shadow-[0_16px_40px_rgba(0,0,0,0.14)] hover:border-[rgba(216,192,138,0.28)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.095),rgba(216,192,138,0.055))] hover:shadow-[0_20px_48px_rgba(0,0,0,0.18)]";
  }

  if (gate === "daytime") {
    return "border-[rgba(255,255,255,0.085)] bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(255,255,255,0.028))] shadow-[0_16px_40px_rgba(0,0,0,0.14)] hover:border-[rgba(127,255,212,0.25)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(77,182,172,0.05))] hover:shadow-[0_20px_48px_rgba(0,0,0,0.18)]";
  }

  return "border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.052),rgba(255,255,255,0.024))] shadow-[0_16px_40px_rgba(0,0,0,0.15)] hover:border-[rgba(190,166,118,0.22)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(96,132,182,0.05))] hover:shadow-[0_20px_48px_rgba(0,0,0,0.19)]";
}

function getDoorAccentClasses(door: BasicDoorKey) {
  switch (door) {
    case "affirmation":
      return "before:bg-[radial-gradient(circle_at_top_left,rgba(216,192,138,0.16),transparent_52%)]";
    case "energy":
      return "before:bg-[radial-gradient(circle_at_top,rgba(244,208,120,0.14),transparent_50%)]";
    case "vision":
      return "before:bg-[radial-gradient(circle_at_85%_20%,rgba(127,255,212,0.12),transparent_48%)]";
    case "focus":
      return "before:bg-[radial-gradient(circle_at_82%_18%,rgba(136,245,229,0.12),transparent_46%)]";
    case "rest":
      return "before:bg-[radial-gradient(circle_at_top_left,rgba(112,214,190,0.12),transparent_50%)]";
    case "recharge":
      return "before:bg-[radial-gradient(circle_at_top,rgba(162,233,203,0.13),transparent_48%)]";
    case "release":
      return "before:bg-[radial-gradient(circle_at_bottom_left,rgba(78,121,173,0.14),transparent_52%)]";
    case "gratitude":
      return "before:bg-[radial-gradient(circle_at_top,rgba(190,166,118,0.12),transparent_50%)]";
    case "sleep":
      return "before:bg-[radial-gradient(circle_at_80%_18%,rgba(96,132,182,0.14),transparent_52%)]";
    default:
      return "";
  }
}

export function BasicHome({
  currentDay = 1,
  streakCount = 0,
  defaultRhythm,
  membershipSummary
}: BasicHomeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const localizedLanguage = resolveLanguage(language);
  const copy = pageCopy[localizedLanguage];
  const gates = useMemo(() => getBasicRhythmGates(localizedLanguage), [localizedLanguage]);
  const [localTimeGate, setLocalTimeGate] = useState<BasicGateKey | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");
  const highlighted = searchParams.get("rhythm") ?? searchParams.get("gate");
  const recommendation = resolveBasicHomeRecommendedGate({
    highlightedRhythm: highlighted,
    defaultRhythm,
    localTimeGate
  });
  const currentGateKey = recommendation.gate;
  const [pendingGateKey, setPendingGateKey] = useState<BasicGateKey | null>(null);
  const fallbackPlan =
    membershipSummary?.currentPlan && membershipSummary.currentPlan !== "free" ? membershipSummary.currentPlan : "basic";
  const visiblePlan =
    fallbackPlan === "growth" ? "Growth" : fallbackPlan === "inner_circle" ? "Inner Circle" : "BASIC";
  const visibleStatus = membershipSummary?.subscriptionStatus || "Active";
  const visibleBillingDate = membershipSummary?.nextBillingDate
    ? new Intl.DateTimeFormat(localizedLanguage === "jp" ? "ja-JP" : localizedLanguage === "kr" ? "ko-KR" : "en-US", {
        dateStyle: "long"
      }).format(new Date(membershipSummary.nextBillingDate))
    : copy.noBillingDate;
  const gardenVisual = getBasicGardenVisualModel(streakCount);
  const gardenMeaningLine = getBasicGardenMeaningLine(localizedLanguage);
  const gardenCountMessage = getBasicGardenCountMessage(localizedLanguage, streakCount);

  function renderGardenSvg(maxWidthClassName: string, glowClassName: string) {
    return (
      <div className={`relative mx-auto flex items-center justify-center ${maxWidthClassName}`}>
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-[14%] top-[14%] h-20 rounded-full bg-[radial-gradient(circle,rgba(127,255,212,0.16),transparent_68%)] blur-2xl motion-safe:animate-[gardenGlow_9s_ease-in-out_infinite] motion-reduce:animate-none ${glowClassName}`}
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 280 220"
          className="relative h-auto w-full overflow-visible"
        >
          <defs>
            <linearGradient id="gardenSoil" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(33,56,83,0.92)" />
              <stop offset="55%" stopColor="rgba(15,39,64,0.98)" />
              <stop offset="100%" stopColor="rgba(8,26,44,0.95)" />
            </linearGradient>
            <linearGradient id="gardenStem" x1="0%" x2="0%" y1="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(93,171,152,0.18)" />
              <stop offset="100%" stopColor="rgba(154,236,215,0.84)" />
            </linearGradient>
            <radialGradient id="gardenLight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(251,240,206,0.98)" />
              <stop offset="38%" stopColor="rgba(184,246,233,0.94)" />
              <stop offset="100%" stopColor="rgba(127,255,212,0.72)" />
            </radialGradient>
            <radialGradient id="gardenLightHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(214,244,235,0.24)" />
              <stop offset="100%" stopColor="rgba(214,244,235,0)" />
            </radialGradient>
          </defs>
          <ellipse cx="140" cy="184" rx="96" ry="28" fill="rgba(5,18,34,0.72)" />
          <ellipse cx="140" cy="178" rx="102" ry="24" fill="url(#gardenSoil)" />
          <ellipse cx="140" cy="173" rx="10" ry="7" fill="rgba(216,192,138,0.44)" opacity={gardenVisual.hasRecordedRecovery ? 0.28 : 0.7} />
          <g className="motion-safe:animate-[gardenPlantBreath_12s_ease-in-out_infinite] motion-reduce:animate-none">
            <path d="M140 176 C138 164 137 148 140 130" stroke="url(#gardenStem)" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M140 158 C126 154 116 146 110 132" stroke="url(#gardenStem)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M141 149 C157 143 170 132 176 116" stroke="url(#gardenStem)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M138 136 C124 130 114 118 108 104" stroke="url(#gardenStem)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9" />
            <path d="M142 128 C155 122 164 112 170 100" stroke="url(#gardenStem)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9" />
          </g>
          {gardenVisual.marks.map((mark, index) => (
            <g
              key={`${mark.x}-${mark.y}-${index}`}
              className="motion-safe:animate-[gardenDrift_11s_ease-in-out_infinite] motion-reduce:animate-none"
              style={{ animationDelay: `${index * 0.6}s` }}
            >
              <path
                d={`M${mark.anchorX} ${mark.anchorY} Q${(mark.anchorX + mark.x) / 2} ${(mark.anchorY + mark.y) / 2 + 3} ${mark.x} ${mark.y + 1}`}
                stroke="rgba(154,236,215,0.32)"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
              <circle
                cx={mark.x}
                cy={mark.y}
                r={mark.radius + 6}
                fill="url(#gardenLightHalo)"
              />
              <circle
                cx={mark.x}
                cy={mark.y}
                r={mark.radius}
                fill="url(#gardenLight)"
              />
              <circle cx={mark.x} cy={mark.y} r={Math.max(1.8, mark.radius - 2.2)} fill="rgba(250,250,244,0.92)" opacity="0.7" />
            </g>
          ))}
        </svg>
      </div>
    );
  }
  useEffect(() => {
    setLocalTimeGate(getBasicHomeRecommendedGateForDate());
  }, []);

  useEffect(() => {
    gates.forEach((gate) => {
      router.prefetch(getBasicGateShortcutHref(gate.key));
    });
  }, [gates, router]);

  useEffect(() => {
    setPendingGateKey(null);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!pendingGateKey) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPendingGateKey(null);
    }, 3200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [pendingGateKey]);

  function handleGateCardClick(
    event: MouseEvent<HTMLAnchorElement>,
    gateKey: BasicGateKey,
    href: string
  ) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (pendingGateKey) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    setPendingGateKey(gateKey);
    router.push(href);
  }

  async function handleManageMembership() {
    if (portalLoading) {
      return;
    }

    setPortalLoading(true);
    setPortalError("");

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session }
      } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const accessToken = session?.access_token;
      const response = await fetch("/api/stripe/customer-portal", {
        method: "POST",
        credentials: "include",
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`
            }
          : undefined
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      console.error("Customer portal request failed", {
        status: response.status,
        error: data.error || copy.membershipError
      });
      setPortalError(data.error || copy.membershipError);
    } catch (error) {
      console.error("Customer portal redirect failed", error);
      setPortalError(copy.membershipError);
    }

    setPortalLoading(false);
  }

  return (
    <section className="space-y-5 sm:space-y-9">
      <section className="border-y border-white/8 py-2.5 sm:py-3">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[rgba(233,242,248,0.66)] sm:text-sm">
              <span className="font-medium text-[rgba(244,250,255,0.84)]">{visiblePlan}</span>
              <span className="text-white/18">·</span>
              <span className="text-[rgba(233,242,248,0.6)]">{visibleStatus || copy.unknownStatus}</span>
            </div>
            <div className="mt-1 flex min-h-[44px] items-center justify-between gap-3 text-[13px] text-[rgba(233,242,248,0.54)] sm:mt-0 sm:min-h-0 sm:block sm:text-sm">
              <span>{copy.nextBillingDate} {visibleBillingDate}</span>
              <button
                type="button"
                onClick={handleManageMembership}
                disabled={portalLoading}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center px-1 py-2 text-[13px] font-medium text-[rgba(233,242,248,0.68)] underline decoration-white/20 underline-offset-4 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-70 sm:hidden"
              >
                {portalLoading ? copy.openingPortal : copy.manageMembership}
              </button>
            </div>
          </div>
          <div className="hidden sm:self-auto sm:block">
            <button
              type="button"
              onClick={handleManageMembership}
              disabled={portalLoading}
              className="inline-flex min-h-[44px] items-center justify-center px-2 py-2 text-sm font-medium text-[rgba(233,242,248,0.68)] underline decoration-white/20 underline-offset-4 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {portalLoading ? copy.openingPortal : copy.manageMembership}
            </button>
          </div>
        </div>
        {portalError ? <p className="mt-1.5 text-xs text-[#f3c7b8]">{portalError}</p> : null}
      </section>

      <section
        data-basic-garden
        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(127,255,212,0.09),transparent_36%),radial-gradient(circle_at_78%_16%,rgba(216,192,138,0.12),transparent_32%),linear-gradient(180deg,rgba(9,34,59,0.78),rgba(7,27,50,0.90)_54%,rgba(5,18,34,0.97))] px-4 py-3.5 shadow-[0_24px_72px_rgba(0,0,0,0.16)] sm:px-6 sm:py-[1.375rem]"
      >
        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-5">
          <div className="order-1">
            <div className="flex items-start justify-between gap-4 lg:hidden">
              <p className="pt-1 text-xs uppercase tracking-[0.28em] text-[rgba(127,255,212,0.64)]">{copy.gardenLabel}</p>
              <div className="w-[7.6rem] shrink-0">
                {renderGardenSvg("max-w-[7.6rem]", "inset-x-[10%] top-[10%] h-16 blur-[22px]")}
              </div>
            </div>
            <p className="hidden text-xs uppercase tracking-[0.28em] text-[rgba(127,255,212,0.64)] lg:block">{copy.gardenLabel}</p>
            <h1 className="mt-2 whitespace-pre-line font-serif text-[1.3rem] leading-[1.16] text-[rgba(244,250,255,0.95)] sm:text-[1.72rem] lg:text-[2rem]">
              {copy.gardenHeadline}
            </h1>
            <p className="mt-2 hidden max-w-xl text-[13px] leading-5.5 text-[rgba(233,242,248,0.72)] lg:block lg:text-[0.97rem] lg:leading-6">{copy.gardenBody}</p>
            <div className="mt-2 space-y-1.5 sm:space-y-2 lg:mt-3">
              <p className="text-[13px] leading-5 text-[rgba(214,244,235,0.82)] sm:text-sm sm:leading-6">{gardenMeaningLine}</p>
              <p className="hidden text-[13px] leading-5 text-[rgba(233,242,248,0.56)] sm:text-sm sm:leading-6 lg:block">{gardenCountMessage}</p>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:gap-2.5 lg:mt-3">
              <div className="rounded-[15px] border border-white/6 bg-white/[0.02] px-3 py-2 sm:rounded-[18px] sm:px-4 sm:py-3">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[rgba(233,242,248,0.46)]">{copy.currentDayLabel}</p>
                <p className="mt-1 text-[1.2rem] font-semibold leading-none text-[rgba(244,250,255,0.94)] sm:mt-1.5 sm:text-[1.65rem]">{currentDay}</p>
              </div>
              <div className="rounded-[15px] border border-white/6 bg-white/[0.02] px-3 py-2 sm:rounded-[18px] sm:px-4 sm:py-3">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[rgba(233,242,248,0.46)]">{copy.sessionCountLabel}</p>
                <p className="mt-1 text-[1.2rem] font-semibold leading-none text-[rgba(244,250,255,0.94)] sm:mt-1.5 sm:text-[1.65rem]">{streakCount}</p>
              </div>
            </div>
          </div>

          <div className="order-2 hidden lg:block">
            {renderGardenSvg("max-w-[18rem] lg:max-w-none", "sm:inset-x-[10%] sm:top-[10%] sm:h-32 sm:blur-3xl")}
          </div>
        </div>
        <span className="sr-only">{`${copy.sessionCountLabel}: ${gardenVisual.recordedCheckIns}. ${gardenCountMessage}`}</span>
      </section>
      <style jsx>{`
        @keyframes gardenGlow {
          0%, 100% { opacity: 0.55; transform: scale(0.98); }
          50% { opacity: 0.85; transform: scale(1.02); }
        }
        @keyframes gardenPlantBreath {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(0, -1.5px, 0) scale(1.01); }
        }
        @keyframes gardenDrift {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.88; }
          50% { transform: translate3d(0, -3px, 0); opacity: 1; }
        }
      `}</style>

      <section
        data-basic-recommendation
        className="rounded-[28px] border border-[rgba(216,192,138,0.16)] bg-[radial-gradient(circle_at_84%_10%,rgba(216,192,138,0.12),transparent_28%),radial-gradient(circle_at_18%_0%,rgba(127,255,212,0.10),transparent_32%),linear-gradient(180deg,rgba(8,40,69,0.80),rgba(6,27,51,0.92)_58%,rgba(5,18,34,0.98))] px-4 py-4.5 shadow-[0_22px_58px_rgba(0,0,0,0.18)] sm:px-6 sm:py-7"
      >
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[rgba(216,192,138,0.74)]">{copy.recommendationLabel}</p>
          <h2 className="mt-2.5 font-serif text-[1.34rem] leading-[1.18] text-[rgba(244,250,255,0.95)] sm:text-[2rem]">
            {copy.recommendationTitle}
          </h2>
          <p className="mt-2 text-[13px] leading-5.5 text-[rgba(233,242,248,0.76)] sm:text-base sm:leading-7">{copy.recommendationBody}</p>
          {recommendation.usedFallback ? (
            <p className="mt-1.5 text-[13px] leading-5 text-[rgba(233,242,248,0.58)] sm:text-sm sm:leading-6">{copy.recommendationSourceFallback}</p>
          ) : null}
        </div>
        <nav aria-label={copy.recommendationTitle} className="mt-4">
          <div className="grid gap-3 md:grid-cols-3 md:gap-4 lg:gap-5">
            {gates.map((gate) => {
              const isRecommended = gate.key === currentGateKey;
              const href = getBasicGateShortcutHref(gate.key);
              const isPending = pendingGateKey === gate.key;
              const mobileOrderClass = isRecommended ? "order-first md:order-none" : "";
              const sizeClass = isRecommended
                ? "min-h-[160px] md:min-h-[184px]"
                : "min-h-[118px] md:min-h-[184px]";

              return (
                <Link
                  key={gate.key}
                  data-basic-recommendation-primary={isRecommended ? "true" : undefined}
                  href={href}
                  onClick={(event) => handleGateCardClick(event, gate.key, href)}
                  aria-busy={isPending}
                  className={`${getGateCardClasses(gate.key, isRecommended, isPending)} ${mobileOrderClass} ${sizeClass}`}
                >
                  <div className="flex h-full flex-col">
                    <div className="min-h-[1.75rem]">
                      {isRecommended ? (
                        <span className="inline-flex items-center rounded-full border border-[rgba(216,192,138,0.24)] bg-[rgba(216,192,138,0.10)] px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] text-[rgba(244,234,209,0.9)] sm:text-[11px]">
                          {copy.recommendationBadge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-[rgba(127,255,212,0.68)] sm:text-xs">{gate.eyebrow}</p>
                    <h3 className={`mt-2 font-semibold leading-tight ${isRecommended ? "text-[1.34rem] text-[rgba(244,250,255,0.97)] sm:text-[1.5rem]" : "text-[1.2rem] text-[rgba(244,250,255,0.94)] sm:text-[1.32rem]"}`}>
                      {gate.title}
                    </h3>
                    <p className="mt-2 max-w-[26ch] text-[13px] leading-5 text-[rgba(233,242,248,0.74)] sm:text-sm sm:leading-6">
                      {isPending ? copy.movingToGate : copy.gateSummaries[gate.key]}
                    </p>
                    <div className="mt-auto flex items-end justify-end pt-5">
                      <span
                        aria-hidden="true"
                        className={`shrink-0 text-[18px] leading-none text-[rgba(244,234,209,0.84)] transition-transform duration-150 ${isPending ? "translate-x-0 opacity-72" : "group-hover:translate-x-1"}`}
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </section>

      <div data-basic-course className="space-y-4 sm:space-y-5">
        <div className="space-y-2">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(216,192,138,0.16),transparent_24%),radial-gradient(circle_at_75%_18%,rgba(127,255,212,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(8,40,69,0.22),transparent_38%),linear-gradient(180deg,rgba(8,40,69,0.82),rgba(6,27,51,0.92)_58%,rgba(5,18,34,0.98))] px-4 py-4 shadow-[0_24px_72px_rgba(0,0,0,0.20)] sm:px-7 sm:py-6">
            <p className="text-xs uppercase tracking-[0.30em] text-[rgba(127,255,212,0.72)]">{copy.badge}</p>
            <h2 className="mt-2.5 whitespace-pre-line font-serif text-[1.45rem] leading-[1.16] text-[rgba(244,250,255,0.96)] sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-5.5 text-[rgba(233,242,248,0.74)] sm:text-base sm:leading-7">{copy.body}</p>
          </div>
          <p className="text-xs uppercase tracking-[0.28em] text-[rgba(127,255,212,0.68)]">{copy.gatesTitle}</p>
          <p className="text-[13px] leading-5.5 text-[rgba(233,242,248,0.64)] sm:text-sm sm:leading-7">{copy.gatesBody}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gates.map((gate) => {
            const active = gate.key === currentGateKey;

            return (
              <section
                key={gate.key}
                id={`gate-${gate.key}`}
                className={`relative flex min-w-0 flex-col rounded-[26px] border p-5 shadow-[0_20px_52px_rgba(0,0,0,0.16)] sm:p-6 ${getGateClasses(gate.key, active)}`}
              >
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-[0.30em] text-[rgba(127,255,212,0.66)]">{gate.eyebrow}</p>
                  <h2 className="mt-2 text-xl font-semibold text-[rgba(244,250,255,0.96)]">{gate.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[rgba(242,248,252,0.78)]">{copy.gateSummaries[gate.key]}</p>
                </div>

                <div className="grid gap-2.5">
                  {gate.doors.map((door) => (
                    <Link
                      key={door.key}
                      href={door.href}
                      className={`group relative flex min-h-[92px] min-w-0 cursor-pointer flex-col overflow-hidden rounded-[18px] border p-3.5 backdrop-blur-xl transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:border-[rgba(244,250,255,0.36)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(216,192,138,0.72)] active:scale-[0.99] active:border-white/[0.28] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:focus-visible:transform-none motion-reduce:active:transform-none ${getDoorClasses(gate.key)} ${getDoorAccentClasses(door.key)}`}
                    >
                      <div className="pointer-events-none absolute inset-0 opacity-100 before:absolute before:inset-0 before:content-['']" />
                      <h3 className="relative z-10 text-base font-semibold text-[rgba(244,250,255,0.95)]">{door.title}</h3>
                      <p className="relative z-10 mt-1.5 text-sm leading-5 text-[rgba(233,242,248,0.72)]">{door.description}</p>
                      <span className="relative z-10 mt-auto flex items-center gap-2 pt-2 text-sm font-medium text-[rgba(225,255,247,0.7)] transition-colors duration-300 group-hover:text-white group-focus-visible:text-white">
                        <span>{copy.enter}</span>
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
                        >
                          →
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
