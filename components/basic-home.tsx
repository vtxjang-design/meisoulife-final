"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import {
  getAlternativeBasicGateKeys,
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
    gardenBody: "表示しているのは、すでに記録されている回復だけです。",
    currentDayLabel: "現在の回復日",
    sessionCountLabel: "記録された回復回数",
    recommendationLabel: "TODAY'S GATE",
    recommendationTitle: "今日、どの扉に入りますか？",
    recommendationBody: "今の時間帯に合う入口を、静かにひとつ選べます。",
    recommendationSourceFallback: "最初の入口として Morning Gate を表示しています。",
    alternativeTitle: "ほかの扉も選べます",
    gateSummaries: {
      morning: "一日をやわらかく始めたいとき",
      daytime: "集中や緊張を少し戻したいとき",
      evening: "一日を静かに手放したいとき"
    },
    recommendationCtas: {
      morning: "Morning Gateへ入る",
      daytime: "Daytime Gateへ入る",
      evening: "Evening Gateへ入る"
    },
    enter: "この扉へ",
    primaryHint: "急ぐ必要はありません",
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
    gardenBody: "이미 기록되어 있는 회복만 차분하게 보여줍니다.",
    currentDayLabel: "현재 회복 일수",
    sessionCountLabel: "기록된 회복 횟수",
    recommendationLabel: "TODAY'S GATE",
    recommendationTitle: "오늘, 어떤 문으로 들어갈까요?",
    recommendationBody: "지금 시간대에 어울리는 입구를 조용히 하나 선택할 수 있습니다.",
    recommendationSourceFallback: "첫 입구로 Morning Gate를 보여주고 있습니다.",
    alternativeTitle: "다른 문도 선택할 수 있습니다",
    gateSummaries: {
      morning: "하루를 조금 더 부드럽게 시작하고 싶을 때",
      daytime: "흐트러진 집중과 긴장을 잠시 되돌리고 싶을 때",
      evening: "하루를 조용히 내려놓고 싶을 때"
    },
    recommendationCtas: {
      morning: "Morning Gate로 들어가기",
      daytime: "Daytime Gate로 들어가기",
      evening: "Evening Gate로 들어가기"
    },
    enter: "이 문으로",
    primaryHint: "서두를 필요는 없습니다",
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
    gardenBody: "This view shows only recovery data that already exists in your record.",
    currentDayLabel: "Current recovery day",
    sessionCountLabel: "Recorded recovery sessions",
    recommendationLabel: "TODAY'S GATE",
    recommendationTitle: "Which gate will you enter today?",
    recommendationBody: "Choose one calm entrance that fits this part of your day.",
    recommendationSourceFallback: "Morning Gate is shown as the first steady starting point.",
    alternativeTitle: "Other gates remain available",
    gateSummaries: {
      morning: "When you want to begin the day more gently",
      daytime: "When you want to restore focus and release tension",
      evening: "When you want to quietly let go of the day"
    },
    recommendationCtas: {
      morning: "Enter Morning Gate",
      daytime: "Enter Daytime Gate",
      evening: "Enter Evening Gate"
    },
    enter: "Enter this gate",
    primaryHint: "There is no rush",
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
  const activeRing = active ? "border-[rgba(127,255,212,0.16)]" : "border-white/[0.08]";

  if (gate === "morning") {
    return `${activeRing} bg-[radial-gradient(circle_at_top,rgba(216,192,138,0.16),transparent_38%),radial-gradient(circle_at_22%_18%,rgba(127,255,212,0.10),transparent_44%),linear-gradient(180deg,rgba(16,49,77,0.76),rgba(8,40,69,0.87)_54%,rgba(6,27,51,0.94))]`;
  }

  if (gate === "daytime") {
    return `${activeRing} bg-[radial-gradient(circle_at_top,rgba(77,182,172,0.16),transparent_40%),radial-gradient(circle_at_80%_24%,rgba(127,255,212,0.08),transparent_44%),linear-gradient(180deg,rgba(11,42,68,0.80),rgba(8,40,69,0.89)_52%,rgba(6,27,51,0.95))]`;
  }

  return `${activeRing} bg-[radial-gradient(circle_at_top,rgba(30,58,95,0.22),transparent_40%),radial-gradient(circle_at_76%_20%,rgba(127,255,212,0.07),transparent_44%),linear-gradient(180deg,rgba(9,34,59,0.85),rgba(7,27,50,0.94)_52%,rgba(5,18,34,0.98))]`;
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
  const currentGate = gates.find((gate) => gate.key === currentGateKey) ?? gates[0];
  const alternativeGates = getAlternativeBasicGateKeys(currentGateKey)
    .map((gateKey) => gates.find((gate) => gate.key === gateKey))
    .filter((gate): gate is (typeof gates)[number] => Boolean(gate));
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

  useEffect(() => {
    setLocalTimeGate(getBasicHomeRecommendedGateForDate());
  }, []);

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
    <section className="space-y-8 sm:space-y-9">
      <section className="border-y border-white/8 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[rgba(233,242,248,0.66)]">
              <span className="font-medium text-[rgba(244,250,255,0.84)]">{visiblePlan}</span>
              <span className="text-white/18">·</span>
              <span className="text-[rgba(233,242,248,0.6)]">{visibleStatus || copy.unknownStatus}</span>
              <span className="hidden text-white/18 sm:inline">·</span>
              <span className="basis-full text-[rgba(233,242,248,0.54)] sm:basis-auto">
                {copy.nextBillingDate} {visibleBillingDate}
              </span>
            </div>
          </div>
          <div className="self-start sm:self-auto">
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
        className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(127,255,212,0.09),transparent_36%),radial-gradient(circle_at_78%_16%,rgba(216,192,138,0.12),transparent_32%),linear-gradient(180deg,rgba(9,34,59,0.78),rgba(7,27,50,0.90)_54%,rgba(5,18,34,0.97))] px-5 py-6 shadow-[0_24px_72px_rgba(0,0,0,0.16)] sm:px-6 sm:py-7"
      >
        <p className="text-xs uppercase tracking-[0.28em] text-[rgba(127,255,212,0.64)]">{copy.gardenLabel}</p>
        <h1 className="mt-3 whitespace-pre-line font-serif text-[1.7rem] leading-[1.2] text-[rgba(244,250,255,0.95)] sm:text-[2.15rem]">
          {copy.gardenHeadline}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[rgba(233,242,248,0.74)] sm:text-base">{copy.gardenBody}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[rgba(233,242,248,0.48)]">{copy.currentDayLabel}</p>
            <p className="mt-2 text-3xl font-semibold text-[rgba(244,250,255,0.94)]">{currentDay}</p>
          </div>
          <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[rgba(233,242,248,0.48)]">{copy.sessionCountLabel}</p>
            <p className="mt-2 text-3xl font-semibold text-[rgba(244,250,255,0.94)]">{streakCount}</p>
          </div>
        </div>
      </section>

      <section
        data-basic-recommendation
        className="rounded-[28px] border border-[rgba(216,192,138,0.16)] bg-[radial-gradient(circle_at_84%_10%,rgba(216,192,138,0.12),transparent_28%),radial-gradient(circle_at_18%_0%,rgba(127,255,212,0.10),transparent_32%),linear-gradient(180deg,rgba(8,40,69,0.80),rgba(6,27,51,0.92)_58%,rgba(5,18,34,0.98))] px-5 py-6 shadow-[0_22px_58px_rgba(0,0,0,0.18)] sm:px-6 sm:py-7"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.28em] text-[rgba(216,192,138,0.74)]">{copy.recommendationLabel}</p>
            <h2 className="mt-3 font-serif text-[1.55rem] leading-[1.24] text-[rgba(244,250,255,0.95)] sm:text-[2rem]">
              {copy.recommendationTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[rgba(233,242,248,0.76)] sm:text-base">{copy.recommendationBody}</p>
            {recommendation.usedFallback ? (
              <p className="mt-2 text-sm leading-6 text-[rgba(233,242,248,0.58)]">{copy.recommendationSourceFallback}</p>
            ) : null}
          </div>
          <div className="min-w-0 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 sm:px-5">
            <p className="text-xs uppercase tracking-[0.28em] text-[rgba(127,255,212,0.68)]">{currentGate.eyebrow}</p>
            <p className="mt-2 text-xl font-semibold text-[rgba(244,250,255,0.96)]">{currentGate.title}</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-[rgba(233,242,248,0.72)]">{copy.gateSummaries[currentGate.key]}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <Link
            href={getBasicGateShortcutHref(currentGate.key)}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-[rgba(216,192,138,0.34)] bg-[linear-gradient(180deg,rgba(216,192,138,0.22),rgba(216,192,138,0.14))] px-5 py-3 text-center text-sm font-medium text-[rgba(255,248,240,0.95)] shadow-[0_18px_36px_rgba(0,0,0,0.16)] transition hover:border-[rgba(216,192,138,0.48)] hover:bg-[linear-gradient(180deg,rgba(216,192,138,0.28),rgba(216,192,138,0.18))] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(216,192,138,0.70)] sm:w-auto sm:self-start"
          >
            {copy.recommendationCtas[currentGate.key]}
          </Link>
          <p className="text-sm leading-6 text-[rgba(233,242,248,0.58)]">{copy.primaryHint}</p>
        </div>

        <div className="mt-5">
          <p className="text-sm leading-6 text-[rgba(233,242,248,0.68)]">{copy.alternativeTitle}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {alternativeGates.map((gate) => (
              <Link
                key={gate.key}
                href={getBasicGateShortcutHref(gate.key)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-[rgba(233,242,248,0.78)] transition hover:border-white/16 hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(127,255,212,0.64)]"
              >
                {gate.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div data-basic-course className="space-y-5">
        <div className="space-y-2">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(216,192,138,0.16),transparent_24%),radial-gradient(circle_at_75%_18%,rgba(127,255,212,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(8,40,69,0.22),transparent_38%),linear-gradient(180deg,rgba(8,40,69,0.82),rgba(6,27,51,0.92)_58%,rgba(5,18,34,0.98))] px-5 py-5 shadow-[0_24px_72px_rgba(0,0,0,0.20)] sm:px-7 sm:py-6">
            <p className="text-xs uppercase tracking-[0.30em] text-[rgba(127,255,212,0.72)]">{copy.badge}</p>
            <h2 className="mt-3 whitespace-pre-line font-serif text-[1.8rem] leading-[1.22] text-[rgba(244,250,255,0.96)] sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[rgba(233,242,248,0.74)] sm:text-base">{copy.body}</p>
          </div>
          <p className="text-xs uppercase tracking-[0.28em] text-[rgba(127,255,212,0.68)]">{copy.gatesTitle}</p>
          <p className="text-sm leading-7 text-[rgba(233,242,248,0.64)]">{copy.gatesBody}</p>
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
