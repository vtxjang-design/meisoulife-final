"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getLocaleCopy, useLanguage } from "@/lib/i18n";

const BASIC_CHECKIN_STORAGE_KEY = "meisoulife_basic_rhythm_check";

type RhythmPhase = "morning" | "day" | "night";

type CheckInState = {
  state: string;
};

const basicHomeCopy = {
  jp: {
    hero: {
      morning: {
        emoji: "☀️",
        title: "今日の朝のリズム",
        body: "今日を始める前に、\n3分だけ自分に戻ってみましょう。",
        button: "朝のリズムを始める"
      },
      day: {
        emoji: "🌿",
        title: "今日の昼のリズム",
        body: "少し立ち止まり、\n呼吸をもう一度整えてみましょう。",
        button: "昼のリズムを始める"
      },
      night: {
        emoji: "🌙",
        title: "今日の夜のリズム",
        body: "今日一日をやさしく手放し、\nゆっくり休んでみましょう。",
        button: "夜のリズムを始める"
      }
    },
    todayMessageTitle: "今日の一文",
    todayMessages: [
      "急がなくて大丈夫です。\nあなたのリズムは、すでにあなたの中にあります。",
      "今日の目標は、うまくやることではなく、目覚めていることです。",
      "今の一呼吸が、今日を少し変えてくれます。",
      "自然は急ぎません。\nあなたも、急がなくて大丈夫です。",
      "静けさは遠くにありません。\n今ここにあります。"
    ],
    checkIn: {
      title: "今の私の状態",
      stateOptions: [
        { value: "calm", label: "😀 穏やか" },
        { value: "tired", label: "😌 少し疲れた" },
        { value: "sleepy", label: "😴 眠い" },
        { value: "energy", label: "⚡ エネルギーが必要" },
        { value: "thoughts", label: "💭 考えが多い" }
      ],
      saved: "今日の状態を記録しました。"
    },
    rhythmCardsTitle: "一日のリズム",
    rhythmCards: [
      { key: "morning", emoji: "☀️", title: "朝", description: "今日を軽やかに始める3分" },
      { key: "day", emoji: "🌿", title: "昼", description: "呼吸を整える3分" },
      { key: "night", emoji: "🌙", title: "夜", description: "一日を手放す3分" }
    ],
    stateRecoveryTitle: "今の状態から選ぶ",
    stateRecoveryItems: [
      { key: "sleep", emoji: "😴", title: "睡眠回復" },
      { key: "stress", emoji: "🌿", title: "ストレスリセット" },
      { key: "energy", emoji: "⚡", title: "エネルギーチャージ" },
      { key: "mind", emoji: "😌", title: "心の整理" },
      { key: "gratitude", emoji: "💛", title: "感謝と幸福" },
      { key: "focus", emoji: "🎯", title: "集中と没入" }
    ],
    stateRecoveryCta: "静かに整える",
    journey: {
      title: "7日間の小さな回復",
      body: "いつでも、また戻ってこられます。",
      cta: "もう一度たどる"
    }
  },
  kr: {
    hero: {
      morning: {
        emoji: "☀️",
        title: "오늘의 아침 리듬",
        body: "오늘을 시작하기 전에\n3분만 자신에게 돌아와 보세요.",
        button: "아침 리듬 시작"
      },
      day: {
        emoji: "🌿",
        title: "오늘의 낮 리듬",
        body: "잠시 멈추고\n호흡을 다시 정리해보세요.",
        button: "낮 리듬 시작"
      },
      night: {
        emoji: "🌙",
        title: "오늘의 밤 리듬",
        body: "오늘 하루를 부드럽게 내려놓고\n편안히 쉬어보세요.",
        button: "밤 리듬 시작"
      }
    },
    todayMessageTitle: "오늘의 한 문장",
    todayMessages: [
      "급하게 가지 않아도 됩니다.\n당신의 리듬은 이미 당신 안에 있습니다.",
      "오늘의 목표는 잘하는 것이 아니라 깨어있는 것입니다.",
      "지금 한 번의 숨이 오늘을 조금 바꿀 수 있습니다.",
      "자연은 서두르지 않습니다.\n당신도 서두르지 않아도 괜찮습니다.",
      "고요함은 멀리 있지 않습니다.\n지금 여기에 있습니다."
    ],
    checkIn: {
      title: "지금 내 상태",
      stateOptions: [
        { value: "calm", label: "😀 편안함" },
        { value: "tired", label: "😌 조금 지침" },
        { value: "sleepy", label: "😴 피곤함" },
        { value: "energy", label: "⚡ 에너지 필요" },
        { value: "thoughts", label: "💭 생각이 많음" }
      ],
      saved: "오늘의 상태를 기록했습니다."
    },
    rhythmCardsTitle: "하루의 리듬",
    rhythmCards: [
      { key: "morning", emoji: "☀️", title: "아침", description: "오늘을 가볍게 시작하는 3분" },
      { key: "day", emoji: "🌿", title: "낮", description: "호흡을 정리하는 3분" },
      { key: "night", emoji: "🌙", title: "밤", description: "하루를 내려놓는 3분" }
    ],
    stateRecoveryTitle: "지금 상태에서 선택하기",
    stateRecoveryItems: [
      { key: "sleep", emoji: "😴", title: "수면 회복" },
      { key: "stress", emoji: "🌿", title: "스트레스 리셋" },
      { key: "energy", emoji: "⚡", title: "에너지 충전" },
      { key: "mind", emoji: "😌", title: "마음 정리" },
      { key: "gratitude", emoji: "💛", title: "감사와 행복" },
      { key: "focus", emoji: "🎯", title: "집중과 몰입" }
    ],
    stateRecoveryCta: "조용히 정돈하기",
    journey: {
      title: "7일간의 작은 회복",
      body: "언제든 다시 돌아올 수 있습니다.",
      cta: "다시 이어가기"
    }
  },
  en: {
    hero: {
      morning: {
        emoji: "☀️",
        title: "Today’s Morning Rhythm",
        body: "Before you begin your day,\ntake 3 minutes to return to yourself.",
        button: "Start Morning Rhythm"
      },
      day: {
        emoji: "🌿",
        title: "Today’s Day Rhythm",
        body: "Pause for a moment\nand gently settle your breath.",
        button: "Start Day Rhythm"
      },
      night: {
        emoji: "🌙",
        title: "Today’s Night Rhythm",
        body: "Gently let go of the day\nand rest in your own rhythm.",
        button: "Start Night Rhythm"
      }
    },
    todayMessageTitle: "Today’s Message",
    todayMessages: [
      "You do not need to rush.\nYour rhythm is already within you.",
      "Today’s goal is not to do it perfectly, but to stay awake within yourself.",
      "One breath now can gently change your day.",
      "Nature does not hurry.\nYou do not need to hurry either.",
      "Stillness is not far away. It is here, now."
    ],
    checkIn: {
      title: "My State Now",
      stateOptions: [
        { value: "calm", label: "😀 Calm" },
        { value: "tired", label: "😌 A little tired" },
        { value: "sleepy", label: "😴 Sleepy" },
        { value: "energy", label: "⚡ Need energy" },
        { value: "thoughts", label: "💭 Many thoughts" }
      ],
      saved: "Your state has been recorded for today."
    },
    rhythmCardsTitle: "Rhythm of the Day",
    rhythmCards: [
      { key: "morning", emoji: "☀️", title: "Morning", description: "3 minutes to begin lightly" },
      { key: "day", emoji: "🌿", title: "Day", description: "3 minutes to settle your breath" },
      { key: "night", emoji: "🌙", title: "Night", description: "3 minutes to let the day go" }
    ],
    stateRecoveryTitle: "Choose From Your Current State",
    stateRecoveryItems: [
      { key: "sleep", emoji: "😴", title: "Sleep Recovery" },
      { key: "stress", emoji: "🌿", title: "Stress Reset" },
      { key: "energy", emoji: "⚡", title: "Energy Charge" },
      { key: "mind", emoji: "😌", title: "Mind Clearing" },
      { key: "gratitude", emoji: "💛", title: "Gratitude & Happiness" },
      { key: "focus", emoji: "🎯", title: "Focus & Flow" }
    ],
    stateRecoveryCta: "Settle Gently",
    journey: {
      title: "7-Day Small Recovery",
      body: "You can return to this journey anytime.",
      cta: "Return to the Journey"
    }
  }
} as const;

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalRhythmPhase(): RhythmPhase {
  const hour = new Date().getHours();

  if (hour >= 5 && hour <= 11) {
    return "morning";
  }

  if (hour >= 12 && hour <= 17) {
    return "day";
  }

  return "night";
}

function getDailyMessage(messages: readonly string[]) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return messages[dayOfYear % messages.length] ?? messages[0] ?? "";
}

function readStoredCheckIn(): { date: string; values: CheckInState } | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(BASIC_CHECKIN_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as { date: string; values: CheckInState };
  } catch {
    window.localStorage.removeItem(BASIC_CHECKIN_STORAGE_KEY);
    return null;
  }
}

function buildRhythmMeditationHref(rhythm: RhythmPhase) {
  // Existing safe Daily Rhythm flow currently enters through meditation.
  return `/meditation?duration=180&type=${rhythm}&returnTo=${encodeURIComponent(`/program/basic?rhythm=${rhythm}`)}`;
}

function buildStateRecoveryHref(state: string) {
  // TODO: Replace with dedicated state-based recovery destinations once category routes are defined.
  return `/meditation?duration=60&type=default&state=${encodeURIComponent(state)}&returnTo=${encodeURIComponent("/program/basic#state-recovery")}`;
}

export function BasicHome() {
  const { language } = useLanguage();
  const copy = useMemo(() => getLocaleCopy(basicHomeCopy, language), [language]);
  const searchParams = useSearchParams();
  const highlightedRhythm = searchParams.get("rhythm") as RhythmPhase | null;
  const rhythmPhase = highlightedRhythm === "morning" || highlightedRhythm === "day" || highlightedRhythm === "night"
    ? highlightedRhythm
    : getLocalRhythmPhase();
  const hero = copy.hero[rhythmPhase];
  const todayMessage = useMemo(() => getDailyMessage(copy.todayMessages), [copy.todayMessages]);
  const [checkIn, setCheckIn] = useState<CheckInState>(() => {
    const stored = readStoredCheckIn();
    if (stored?.date === getTodayKey()) {
      return stored.values;
    }

    return {
      state: copy.checkIn.stateOptions[0]?.value ?? "calm"
    };
  });
  const [savedMessage, setSavedMessage] = useState("");

  function saveCheckIn(state: string) {
    const nextState = { state };
    setCheckIn(nextState);
    try {
      window.localStorage.setItem(
        BASIC_CHECKIN_STORAGE_KEY,
        JSON.stringify({
          date: getTodayKey(),
          values: nextState
        })
      );
    } catch (error) {
      console.warn("[basic-home] failed to save rhythm check", error);
    } finally {
      setSavedMessage(copy.checkIn.saved);
    }
  }

  return (
    <div className="section-shell py-14 sm:py-20">
      <div className="mx-auto max-w-6xl space-y-10 sm:space-y-12">
        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(245,241,228,0.12),transparent_20%),radial-gradient(circle_at_bottom,rgba(79,122,101,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] px-6 py-8 shadow-[0_28px_90px_rgba(7,17,31,0.22)] sm:px-8 sm:py-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-gold/82">{copy.hero[rhythmPhase].emoji} {copy.hero[rhythmPhase].title}</p>
            <h1 className="mt-5 whitespace-pre-line font-serif text-[34px] leading-[1.34] text-white sm:text-[46px]">
              {hero.body}
            </h1>
            <div className="mt-7">
              <Link
                href={buildRhythmMeditationHref(rhythmPhase)}
                className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3e0af,#d4ba75)] px-6 py-4 text-base font-semibold text-ink shadow-[0_18px_40px_rgba(212,186,117,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#e7cd92]"
              >
                {hero.button}
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-white/[0.035] px-6 py-8 shadow-[0_20px_72px_rgba(7,17,31,0.16)] sm:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.todayMessageTitle}</p>
          <p className="mt-5 max-w-4xl whitespace-pre-line font-serif text-[28px] leading-[1.7] text-white/90 sm:text-[34px]">
            {todayMessage}
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[30px] border border-white/10 bg-white/[0.035] px-6 py-7 shadow-[0_20px_72px_rgba(7,17,31,0.16)] sm:px-8">
            <p className="text-sm uppercase tracking-[0.28em] text-gold/82">{copy.checkIn.title}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {copy.checkIn.stateOptions.map((option) => {
                const selected = checkIn.state === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => saveCheckIn(option.value)}
                    className={`inline-flex min-h-[48px] items-center justify-center rounded-full border px-4 py-2.5 text-sm transition duration-200 ${
                      selected
                        ? "border-gold/30 bg-gold/12 text-white shadow-[0_12px_32px_rgba(212,186,117,0.12)]"
                        : "border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.06]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {savedMessage ? <p className="mt-5 text-sm text-white/58">{savedMessage}</p> : null}
          </article>

          <article className="rounded-[30px] border border-white/10 bg-white/[0.035] px-6 py-7 shadow-[0_20px_72px_rgba(7,17,31,0.16)] sm:px-8">
            <p className="text-sm uppercase tracking-[0.28em] text-gold/82">{copy.rhythmCardsTitle}</p>
            <div className="mt-6 grid gap-3">
              {copy.rhythmCards.map((card) => (
                <Link
                  key={card.key}
                  href={buildRhythmMeditationHref(card.key as RhythmPhase)}
                  className={`rounded-[24px] border px-5 py-5 transition duration-300 ${
                    rhythmPhase === card.key
                      ? "border-gold/26 bg-gold/[0.08]"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                  }`}
                >
                  <p className="text-sm uppercase tracking-[0.24em] text-gold/80">{card.emoji} {card.title}</p>
                  <p className="mt-3 text-sm leading-7 text-white/72">{card.description}</p>
                </Link>
              ))}
            </div>
          </article>
        </section>

        <section id="state-recovery" className="rounded-[30px] border border-white/10 bg-white/[0.035] px-6 py-7 shadow-[0_20px_72px_rgba(7,17,31,0.16)] sm:px-8">
          <p className="text-sm uppercase tracking-[0.28em] text-gold/82">{copy.stateRecoveryTitle}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {copy.stateRecoveryItems.map((item) => (
              <article key={item.key} className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-5">
                <p className="text-sm uppercase tracking-[0.24em] text-gold/80">{item.emoji} {item.title}</p>
                <div className="mt-5">
                  <Link
                    href={buildStateRecoveryHref(item.key)}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
                  >
                    {copy.stateRecoveryCta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-gold/14 bg-gold/[0.05] px-6 py-7 shadow-[0_20px_72px_rgba(7,17,31,0.16)] sm:px-8">
          <p className="text-sm uppercase tracking-[0.28em] text-gold/82">{copy.journey.title}</p>
          <p className="mt-4 text-base leading-8 text-white/76">{copy.journey.body}</p>
          <div className="mt-5">
            <Link
              href="/rhythm-journey"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
            >
              {copy.journey.cta}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
