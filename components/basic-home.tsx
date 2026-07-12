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
    badge: "BASIC Rhythm Space",
    title: "今日は ひとつのリズムから始めます",
    body: "今日の扉ひとつで 十分です",
    identityLine: "今日も また戻ることができます",
    current: "今日のはじまり",
    currentBody: "まずは 朝の扉から静かに始めます",
    gatesTitle: "TODAY'S RHYTHM",
    gatesBody: "今日の扉を選びます",
    enter: "この扉へ戻る",
    primaryCta: "Morning Gateから始める",
    primaryHint: "急ぐ必要はありません",
    journeyTitle: "RECOVERY GARDEN",
    journeyBody: "静かに根を下ろしています",
    daily: "今日の戻りも 庭に残ります",
    weekly: "静かに育っています",
    monthly: "戻るたび 深くなります",
    whisperTitle: "DAILY WHISPER",
    whisperBody: "今日は何が 少し呼吸を楽にしてくれますか",
    returnTitle: "QUIET HOPE",
    returnBody: "急がなくて大丈夫です\nあなたのリズムは 今日もまた始められます",
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
    badge: "BASIC Rhythm Space",
    title: "오늘도 하나의 리듬으로 시작합니다",
    body: "오늘의 문 하나면 충분합니다",
    identityLine: "오늘도 다시 돌아올 수 있습니다",
    current: "오늘의 시작",
    currentBody: "먼저 아침의 문으로 조용히 시작합니다",
    gatesTitle: "TODAY'S RHYTHM",
    gatesBody: "오늘의 문을 선택하세요",
    enter: "이 문으로 돌아가기",
    primaryCta: "Morning Gate로 시작하기",
    primaryHint: "서두를 필요는 없습니다",
    journeyTitle: "RECOVERY GARDEN",
    journeyBody: "조용히 뿌리를 내리고 있습니다",
    daily: "오늘의 돌아옴도 정원에 남습니다",
    weekly: "조용히 자라고 있습니다",
    monthly: "돌아올수록 깊어집니다",
    whisperTitle: "DAILY WHISPER",
    whisperBody: "오늘은 무엇이 당신의 숨을 조금 더 편하게 해줄까요",
    returnTitle: "QUIET HOPE",
    returnBody: "서두르지 않아도 됩니다\n당신의 리듬은 오늘도 다시 시작될 수 있습니다",
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
    badge: "BASIC Rhythm Space",
    title: "Begin today with one gentle rhythm",
    body: "One door for today is enough",
    identityLine: "You can return again today",
    current: "Today’s beginning",
    currentBody: "Begin quietly with the morning door",
    gatesTitle: "TODAY'S RHYTHM",
    gatesBody: "Choose today’s door",
    enter: "Return through this door",
    primaryCta: "Start Morning Gate",
    primaryHint: "There is no rush",
    journeyTitle: "RECOVERY GARDEN",
    journeyBody: "Quietly taking root",
    daily: "Today’s return stays in the garden",
    weekly: "It is growing quietly",
    monthly: "Each return deepens it",
    whisperTitle: "DAILY WHISPER",
    whisperBody: "What might help your breath feel a little easier today",
    returnTitle: "QUIET HOPE",
    returnBody: "There is no rush\nYour rhythm can begin again today",
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

function getDailyWhisper(language: "jp" | "kr" | "en", currentDay: number) {
  const questions =
    language === "kr"
      ? [
          "오늘 몸은 무엇을 필요로 하나요",
          "오늘 어디에서 조금 더 부드러워질 수 있을까요",
          "오늘 밤에는 어떤 리듬이 필요할까요"
        ]
      : language === "en"
        ? [
            "What does your body need today",
            "Where can you soften today",
            "What rhythm would support you tonight"
          ]
        : [
            "今日は 体が何を必要としていますか",
            "今日は どこを少しゆるめられそうですか",
            "今夜は どんなリズムが必要でしょうか"
          ];

  return questions[Math.max(currentDay - 1, 0) % questions.length];
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

function getDoorButtonClasses(door: BasicDoorKey) {
  switch (door) {
    case "focus":
      return "border-[rgba(123,219,255,0.24)] bg-[rgba(96,190,255,0.12)] text-[rgba(225,246,255,0.94)] hover:bg-[rgba(96,190,255,0.18)]";
    case "rest":
      return "border-[rgba(134,224,180,0.24)] bg-[rgba(106,194,148,0.12)] text-[rgba(232,255,244,0.94)] hover:bg-[rgba(106,194,148,0.18)]";
    case "recharge":
      return "border-[rgba(236,198,113,0.26)] bg-[rgba(236,198,113,0.12)] text-[rgba(255,247,223,0.94)] hover:bg-[rgba(236,198,113,0.18)]";
    default:
      return "border-[rgba(127,255,212,0.22)] bg-[rgba(127,255,212,0.10)] text-[rgba(225,255,247,0.92)] hover:bg-[rgba(127,255,212,0.16)]";
  }
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
  const dailyWhisper = getDailyWhisper(localizedLanguage, currentDay);

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
    <section className="space-y-10">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(216,192,138,0.16),transparent_24%),radial-gradient(circle_at_75%_18%,rgba(127,255,212,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(8,40,69,0.22),transparent_38%),linear-gradient(180deg,rgba(8,40,69,0.82),rgba(6,27,51,0.92)_58%,rgba(5,18,34,0.98))] px-5 py-6 shadow-[0_28px_100px_rgba(0,0,0,0.24)] sm:px-7 sm:py-8">
        <p className="text-xs uppercase tracking-[0.30em] text-[rgba(127,255,212,0.72)]">{copy.badge}</p>
        <div className="mt-4">
          <div>
            <h1 className="whitespace-pre-line font-serif text-3xl leading-[1.3] text-[rgba(244,250,255,0.96)] sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-xl whitespace-pre-line text-sm leading-7 text-[rgba(233,242,248,0.74)] sm:text-base">
              {copy.body}
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.012))] px-3 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.10)] sm:px-3.5 sm:py-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[rgba(233,242,248,0.66)]">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[rgba(127,255,212,0.62)]">{copy.membershipTitle}</span>
              <span className="hidden text-white/18 sm:inline">·</span>
              <span className="text-[rgba(244,250,255,0.84)]">{visiblePlan}</span>
              <span className="text-white/18">·</span>
              <span className="text-[rgba(233,242,248,0.6)]">{visibleStatus || copy.unknownStatus}</span>
              <span className="text-white/18">·</span>
              <span className="text-[rgba(233,242,248,0.54)]">
                {copy.nextBillingDate} {visibleBillingDate}
              </span>
            </div>
            <p className="mt-1 text-[10px] leading-5 text-[rgba(233,242,248,0.4)]">{copy.billingHelper}</p>
          </div>
          <div className="self-start sm:self-auto">
            <button
              type="button"
              onClick={handleManageMembership}
              disabled={portalLoading}
              className="inline-flex min-h-[32px] items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-[rgba(233,242,248,0.62)] transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
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

        <div className="grid gap-0">
          {gates.map((gate) => {
            const active = gate.key === currentGateKey;

            return (
              <section
                key={gate.key}
                id={`gate-${gate.key}`}
                className={`relative rounded-[30px] border ${gate.key === "morning" ? "p-6 shadow-[0_36px_96px_rgba(0,0,0,0.24)] sm:p-7" : "p-5 shadow-[0_28px_72px_rgba(0,0,0,0.18)] sm:p-6"} ${getGateClasses(gate.key, active)} ${
                  gate.key === "morning"
                    ? ""
                    : gate.key === "daytime"
                      ? "-mt-1"
                      : "-mt-2"
                }`}
              >
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.30em] text-[rgba(127,255,212,0.66)]">{gate.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-[rgba(244,250,255,0.96)]">{gate.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[rgba(242,248,252,0.82)]">{gate.question}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {gate.doors.map((door) => (
                    <Link
                      key={door.key}
                      href={door.href}
                      className={`group relative overflow-hidden rounded-[24px] border backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 ${
                        gate.key === "daytime" ? "flex min-h-[272px] flex-col p-6" : "flex min-h-[220px] flex-col p-5"
                      } ${getDoorClasses(gate.key)} ${getDoorAccentClasses(door.key)}`}
                    >
                      <div className="pointer-events-none absolute inset-0 opacity-100 before:absolute before:inset-0 before:content-['']" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="relative z-10 text-2xl">{door.emoji}</div>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-[rgba(233,242,248,0.58)]">
                          {Math.floor(door.durationSeconds / 60)} min
                        </span>
                      </div>
                      <h3 className="relative z-10 mt-5 text-lg font-semibold text-[rgba(244,250,255,0.95)]">{door.title}</h3>
                      {gate.key === "daytime" ? (
                        <>
                          <p className="relative z-10 mt-3 text-base font-semibold leading-7 text-[rgba(244,250,255,0.88)]">
                            {door.headline}
                          </p>
                          <div className="flex-1" />
                          <span
                            className={`relative z-10 mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition ${getDoorButtonClasses(
                              door.key
                            )}`}
                          >
                            {door.entryLabel}
                          </span>
                        </>
                      ) : (
                        <>
                          <p className="relative z-10 mt-3 text-sm leading-7 text-[rgba(233,242,248,0.72)]">“{door.state}”</p>
                          <div className="flex-1" />
                          <span className="relative z-10 mt-6 inline-flex min-h-[42px] items-center justify-center self-start rounded-full border border-[rgba(127,255,212,0.18)] bg-[rgba(127,255,212,0.08)] px-4 py-2 text-sm font-semibold text-[rgba(225,255,247,0.86)] transition group-hover:bg-[rgba(127,255,212,0.14)] group-hover:text-white">
                            {copy.enter}
                          </span>
                        </>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(127,255,212,0.07),transparent_34%),linear-gradient(180deg,rgba(9,34,59,0.76),rgba(7,27,50,0.88)_52%,rgba(5,18,34,0.96))] p-4 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[rgba(127,255,212,0.64)]">{copy.journeyTitle}</p>
          <p className="mt-2 text-sm leading-7 text-[rgba(233,242,248,0.68)]">{copy.journeyBody}</p>
          <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.03] p-3.5">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{gardenStage.icon}</span>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[rgba(127,255,212,0.68)]">{gardenStage.label}</p>
                <p className="mt-1.5 text-sm text-[rgba(244,250,255,0.86)]">{gardenStage.body}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-3">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-3.5">
              <p className="text-sm leading-6 text-[rgba(242,248,252,0.82)]">{copy.daily}</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-3.5">
              <p className="whitespace-pre-line text-sm leading-6 text-[rgba(242,248,252,0.82)]">{copy.weekly}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm leading-7 text-[rgba(242,248,252,0.84)]">{copy.monthly}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(30,58,95,0.20),transparent_38%),linear-gradient(180deg,rgba(8,29,50,0.82),rgba(6,22,42,0.92)_54%,rgba(4,16,30,0.98))] p-4 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[rgba(127,255,212,0.64)]">{copy.whisperTitle}</p>
          <div className="mt-3 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm leading-7 text-[rgba(244,250,255,0.9)]">{dailyWhisper}</p>
          </div>
        </section>
      </div>
    </section>
  );
}
