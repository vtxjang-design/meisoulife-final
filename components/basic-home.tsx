"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { getBasicGateForCurrentTime, getBasicRhythmGates, type BasicDoorKey, type BasicGateKey } from "@/lib/basic-rhythm";
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
    gateSummaries: {
      morning: "一日をやわらかく始めたいとき",
      daytime: "集中や緊張を少し戻したいとき",
      evening: "一日を静かに手放したいとき"
    },
    enter: "扉を開く",
    primaryCta: "Morning Gateから始める",
    primaryHint: "急ぐ必要はありません",
    journeyTitle: "RECOVERY GARDEN",
    journeyHeadline: "小さな種は、\nもう植えられています。",
    journeyBody: "今日の戻りも、静かに残っています。",
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
    gateSummaries: {
      morning: "하루를 조금 더 부드럽게 시작하고 싶을 때",
      daytime: "흐트러진 집중과 긴장을 잠시 되돌리고 싶을 때",
      evening: "하루를 조용히 내려놓고 싶을 때"
    },
    enter: "문 열기",
    primaryCta: "Morning Gate로 시작하기",
    primaryHint: "서두를 필요는 없습니다",
    journeyTitle: "RECOVERY GARDEN",
    journeyHeadline: "작은 씨앗은,\n이미 심어져 있습니다.",
    journeyBody: "오늘의 돌아옴도, 조용히 남아 있습니다.",
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
    gateSummaries: {
      morning: "When you want to begin the day more gently",
      daytime: "When you want to restore focus and release tension",
      evening: "When you want to quietly let go of the day"
    },
    enter: "Enter Gate",
    primaryCta: "Start Morning Gate",
    primaryHint: "There is no rush",
    journeyTitle: "RECOVERY GARDEN",
    journeyHeadline: "A small seed\nhas already been planted.",
    journeyBody: "Today’s return remains here, quietly.",
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

function mapDefaultRhythm(defaultRhythm?: "morning" | "day" | "night"): BasicGateKey | undefined {
  if (defaultRhythm === "morning") return "morning";
  if (defaultRhythm === "day") return "daytime";
  if (defaultRhythm === "night") return "evening";
  return undefined;
}

function getGardenStage(language: "jp" | "kr" | "en", currentDay: number) {
  if (currentDay >= 100) {
    return language === "kr"
      ? { icon: "🌲", label: "Forest", body: "당신의 회복은 이제 하나의 숲이 되어가고 있습니다" }
      : language === "en"
        ? { icon: "🌲", label: "Forest", body: "Your recovery is becoming a forest" }
        : { icon: "🌲", label: "Forest", body: "あなたの回復は ひとつの森になりつつあります" };
  }

  if (currentDay >= 30) {
    return language === "kr"
      ? { icon: "🌳", label: "Tree", body: "당신의 리듬은 작지만 분명한 나무가 되어가고 있습니다" }
      : language === "en"
        ? { icon: "🌳", label: "Tree", body: "Your rhythm is becoming a small steady tree" }
        : { icon: "🌳", label: "Tree", body: "あなたのリズムは 小さく確かな木になりつつあります" };
  }

  if (currentDay >= 7) {
    return language === "kr"
      ? { icon: "🌿", label: "Sprout", body: "당신의 정원은 오늘도 조금 더 자랐습니다" }
      : language === "en"
        ? { icon: "🌿", label: "Sprout", body: "Your garden has grown a little more today" }
        : { icon: "🌿", label: "Sprout", body: "あなたの庭は 今日も少し育ちました" };
  }

  return language === "kr"
    ? { icon: "🌱", label: "Seed", body: "작은 씨앗 하나가 이미 심어졌습니다" }
    : language === "en"
      ? { icon: "🌱", label: "Seed", body: "A small seed has already been planted" }
      : { icon: "🌱", label: "Seed", body: "小さな種は もう植えられています" };
}

function getGateClasses(gate: BasicGateKey, active: boolean) {
  const activeRing = active
    ? "ring-1 ring-[rgba(127,255,212,0.22)] border-[rgba(127,255,212,0.22)]"
    : "border-white/10";

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
    return "border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.035))] shadow-[0_24px_64px_rgba(0,0,0,0.18),0_0_0_1px_rgba(216,192,138,0.05)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.095),rgba(255,255,255,0.045))] hover:shadow-[0_28px_72px_rgba(0,0,0,0.22),0_0_0_1px_rgba(216,192,138,0.06)]";
  }

  if (gate === "daytime") {
    return "border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.035))] shadow-[0_24px_56px_rgba(0,0,0,0.20),0_0_0_1px_rgba(77,182,172,0.08)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.095),rgba(255,255,255,0.045))] hover:shadow-[0_28px_64px_rgba(0,0,0,0.22),0_0_0_1px_rgba(77,182,172,0.09)]";
  }

  return "border-[rgba(255,255,255,0.10)] bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.028))] shadow-[0_24px_56px_rgba(0,0,0,0.22),0_0_0_1px_rgba(30,58,95,0.10)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.038))] hover:shadow-[0_28px_66px_rgba(0,0,0,0.24),0_0_0_1px_rgba(30,58,95,0.11)]";
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
  defaultRhythm,
  membershipSummary
}: BasicHomeProps) {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const localizedLanguage = resolveLanguage(language);
  const copy = pageCopy[localizedLanguage];
  const gates = useMemo(() => getBasicRhythmGates(localizedLanguage), [localizedLanguage]);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");
  const highlighted = searchParams.get("rhythm") ?? searchParams.get("gate");
  const defaultGate = mapDefaultRhythm(defaultRhythm);
  const currentGateKey: BasicGateKey =
    highlighted === "morning" || highlighted === "daytime" || highlighted === "evening"
      ? highlighted
      : highlighted === "day"
        ? "daytime"
        : highlighted === "night"
          ? "evening"
          : defaultGate ?? getBasicGateForCurrentTime();
  const currentGate = gates.find((gate) => gate.key === currentGateKey) ?? gates[0];
  const fallbackPlan =
    membershipSummary?.currentPlan && membershipSummary.currentPlan !== "free" ? membershipSummary.currentPlan : "basic";
  const visiblePlan =
    fallbackPlan === "growth" ? "Growth" : fallbackPlan === "inner_circle" ? "Inner Circle" : "Basic";
  const visibleStatus = membershipSummary?.subscriptionStatus || "Active";
  const visibleBillingDate = membershipSummary?.nextBillingDate
    ? new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      }).format(new Date(membershipSummary.nextBillingDate))
    : copy.noBillingDate;
  const gardenStage = getGardenStage(localizedLanguage, currentDay);

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
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(216,192,138,0.16),transparent_24%),radial-gradient(circle_at_75%_18%,rgba(127,255,212,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(8,40,69,0.22),transparent_38%),linear-gradient(180deg,rgba(8,40,69,0.82),rgba(6,27,51,0.92)_58%,rgba(5,18,34,0.98))] px-5 py-5 shadow-[0_24px_72px_rgba(0,0,0,0.20)] sm:px-7 sm:py-6">
        <p className="text-xs uppercase tracking-[0.30em] text-[rgba(127,255,212,0.72)]">{copy.badge}</p>
        <div className="mt-3">
          <div>
            <h1 className="whitespace-pre-line font-serif text-[1.8rem] leading-[1.22] text-[rgba(244,250,255,0.96)] sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[rgba(233,242,248,0.74)] sm:text-base">
              {copy.body}
            </p>
          </div>
        </div>
      </div>

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

      <div className="space-y-5">
        <div className="space-y-2">
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
                      className={`group relative flex min-h-[92px] min-w-0 flex-col overflow-hidden rounded-[18px] border p-3.5 backdrop-blur-xl transition-[transform,box-shadow,border-color,background-color] duration-300 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/24 ${getDoorClasses(gate.key)} ${getDoorAccentClasses(door.key)}`}
                    >
                      <div className="pointer-events-none absolute inset-0 opacity-100 before:absolute before:inset-0 before:content-['']" />
                      <h3 className="relative z-10 text-base font-semibold text-[rgba(244,250,255,0.95)]">{door.title}</h3>
                      <p className="relative z-10 mt-1.5 text-sm leading-5 text-[rgba(233,242,248,0.72)]">{door.description}</p>
                      <span className="relative z-10 mt-auto pt-2 text-sm font-medium text-[rgba(225,255,247,0.88)] transition group-hover:text-white">
                        {door.entryLabel || copy.enter}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(127,255,212,0.07),transparent_34%),linear-gradient(180deg,rgba(9,34,59,0.76),rgba(7,27,50,0.88)_52%,rgba(5,18,34,0.96))] px-5 py-6 sm:px-6">
          <p className="text-xs uppercase tracking-[0.28em] text-[rgba(127,255,212,0.64)]">{copy.journeyTitle}</p>
          <h2 className="mt-3 whitespace-pre-line font-serif text-2xl leading-tight text-[rgba(244,250,255,0.94)] sm:text-3xl">{copy.journeyHeadline}</h2>
          <p className="mt-3 text-sm leading-7 text-[rgba(233,242,248,0.7)]">{copy.journeyBody}</p>
          <p className="mt-3 text-sm leading-6 text-[rgba(233,242,248,0.48)]">{gardenStage.body}</p>
      </section>
    </section>
  );
}
