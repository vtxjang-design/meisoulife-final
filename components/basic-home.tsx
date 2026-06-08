"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getLocaleCopy, useLanguage } from "@/lib/i18n";

const BASIC_CHECKIN_STORAGE_KEY = "meisoulife_basic_rhythm_check";

type RhythmPhase = "morning" | "day" | "night";

type CheckInState = {
  mood: string;
  sleep: string;
  stress: string;
};

const basicHomeCopy = {
  jp: {
    hero: {
      morning: {
        emoji: "☀️",
        title: "朝のリズム",
        body: "今日を始める前に、\n3分だけ自分とつながりましょう。",
        button: "朝のリズムを始める"
      },
      day: {
        emoji: "🌿",
        title: "昼のリズム",
        body: "少し立ち止まり、\n呼吸を回復する時間です。",
        button: "昼のリズムを始める"
      },
      night: {
        emoji: "🌙",
        title: "夜のリズム",
        body: "今日もお疲れさまでした。\n一日をやさしく手放しましょう。",
        button: "夜のリズムを始める"
      }
    },
    todayMessageTitle: "Today’s Message",
    todayMessages: [
      "急がなくて大丈夫です。\nあなたのリズムは、誰とも比べられません。",
      "今日の目標は、うまくやることではなく、目覚めていることです。",
      "今の一呼吸が、今日を少し変えてくれます。",
      "自然は急ぎません。\nあなたも、急がなくて大丈夫です。",
      "静けさは、遠くではなく、今ここにあります。"
    ],
    checkIn: {
      title: "今日のリズムチェック",
      mood: "今日の気分",
      sleep: "睡眠",
      stress: "ストレス",
      moodOptions: ["😀", "🙂", "😐", "😔", "😩"],
      sleepOptions: [
        { value: "good", label: "良い" },
        { value: "normal", label: "普通" },
        { value: "low", label: "不足" }
      ],
      stressOptions: [
        { value: "low", label: "低い" },
        { value: "normal", label: "普通" },
        { value: "high", label: "高い" }
      ],
      save: "記録する",
      saved: "今日のリズムを記録しました。"
    },
    rhythmCardsTitle: "今日のリズムから始める",
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
        title: "아침 리듬",
        body: "오늘을 시작하기 전에\n3분만 자신과 연결해보세요.",
        button: "아침 리듬 시작"
      },
      day: {
        emoji: "🌿",
        title: "낮 리듬",
        body: "잠시 멈추고\n호흡을 회복할 시간입니다.",
        button: "낮 리듬 시작"
      },
      night: {
        emoji: "🌙",
        title: "밤 리듬",
        body: "오늘도 수고하셨습니다.\n하루를 부드럽게 내려놓아 보세요.",
        button: "밤 리듬 시작"
      }
    },
    todayMessageTitle: "Today’s Message",
    todayMessages: [
      "서두르지 않아도 괜찮습니다.\n당신의 리듬은 누구와도 비교할 수 없습니다.",
      "오늘의 목표는 잘하는 것이 아니라 깨어있는 것입니다.",
      "지금 한 번의 숨이 오늘을 조금 바꿀 수 있습니다.",
      "자연은 서두르지 않습니다.\n당신도 서두르지 않아도 괜찮습니다.",
      "고요함은 멀리 있는 것이 아니라 지금 여기에 있습니다."
    ],
    checkIn: {
      title: "오늘의 리듬 체크",
      mood: "오늘의 기분",
      sleep: "수면",
      stress: "스트레스",
      moodOptions: ["😀", "🙂", "😐", "😔", "😩"],
      sleepOptions: [
        { value: "good", label: "좋음" },
        { value: "normal", label: "보통" },
        { value: "low", label: "부족" }
      ],
      stressOptions: [
        { value: "low", label: "낮음" },
        { value: "normal", label: "보통" },
        { value: "high", label: "높음" }
      ],
      save: "기록하기",
      saved: "오늘의 리듬을 기록했습니다."
    },
    rhythmCardsTitle: "오늘의 리듬으로 시작하기",
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
        title: "Morning Rhythm",
        body: "Before you begin your day,\ntake 3 minutes to reconnect with yourself.",
        button: "Start Morning Rhythm"
      },
      day: {
        emoji: "🌿",
        title: "Day Rhythm",
        body: "Pause for a moment.\nThis is time to recover your breath.",
        button: "Start Day Rhythm"
      },
      night: {
        emoji: "🌙",
        title: "Night Rhythm",
        body: "You did enough today.\nGently let the day go.",
        button: "Start Night Rhythm"
      }
    },
    todayMessageTitle: "Today’s Message",
    todayMessages: [
      "You do not need to rush.\nYour rhythm cannot be compared with anyone else’s.",
      "Today’s goal is not to do it perfectly, but to stay awake within yourself.",
      "One breath now can gently change your day.",
      "Nature does not hurry.\nYou do not need to hurry either.",
      "Stillness is not far away. It is here, now."
    ],
    checkIn: {
      title: "Today’s Rhythm Check",
      mood: "Mood",
      sleep: "Sleep",
      stress: "Stress",
      moodOptions: ["😀", "🙂", "😐", "😔", "😩"],
      sleepOptions: [
        { value: "good", label: "Good" },
        { value: "normal", label: "Normal" },
        { value: "low", label: "Low" }
      ],
      stressOptions: [
        { value: "low", label: "Low" },
        { value: "normal", label: "Normal" },
        { value: "high", label: "High" }
      ],
      save: "Save",
      saved: "Your rhythm has been recorded for today."
    },
    rhythmCardsTitle: "Begin with the rhythm you need today",
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
  // TODO: Replace with dedicated Daily Rhythm routes if morning/day/night get their own stable destinations.
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
      mood: copy.checkIn.moodOptions[2] ?? "😐",
      sleep: "normal",
      stress: "normal"
    };
  });
  const [savedMessage, setSavedMessage] = useState("");

  function updateCheckIn<K extends keyof CheckInState>(key: K, value: CheckInState[K]) {
    setCheckIn((current) => ({
      ...current,
      [key]: value
    }));
    setSavedMessage("");
  }

  function saveCheckIn() {
    try {
      window.localStorage.setItem(
        BASIC_CHECKIN_STORAGE_KEY,
        JSON.stringify({
          date: getTodayKey(),
          values: checkIn
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
            <div className="mt-6 space-y-6">
              <div>
                <p className="text-sm text-white/64">{copy.checkIn.mood}</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {copy.checkIn.moodOptions.map((option) => {
                    const selected = checkIn.mood === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateCheckIn("mood", option)}
                        className={`inline-flex h-12 min-w-12 items-center justify-center rounded-full px-4 text-xl transition duration-200 ${
                          selected
                            ? "border border-gold/30 bg-gold/12 shadow-[0_12px_32px_rgba(212,186,117,0.12)]"
                            : "border border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm text-white/64">{copy.checkIn.sleep}</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {copy.checkIn.sleepOptions.map((option) => {
                    const selected = checkIn.sleep === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateCheckIn("sleep", option.value)}
                        className={`rounded-full px-4 py-2.5 text-sm transition duration-200 ${
                          selected
                            ? "border border-gold/30 bg-gold/12 text-white"
                            : "border border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.06]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm text-white/64">{copy.checkIn.stress}</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {copy.checkIn.stressOptions.map((option) => {
                    const selected = checkIn.stress === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateCheckIn("stress", option.value)}
                        className={`rounded-full px-4 py-2.5 text-sm transition duration-200 ${
                          selected
                            ? "border border-gold/30 bg-gold/12 text-white"
                            : "border border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.06]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-start gap-3">
                <button
                  type="button"
                  onClick={saveCheckIn}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3e0af,#d4ba75)] px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
                >
                  {copy.checkIn.save}
                </button>
                {savedMessage ? <p className="text-sm text-white/58">{savedMessage}</p> : null}
              </div>
            </div>
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
