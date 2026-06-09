"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getLocaleCopy, useLanguage } from "@/lib/i18n";
import { getTodayRhythmCheckIn } from "@/lib/today-rhythm-checkin";
import { RHYTHM_JOURNEY_STORAGE_KEY } from "@/lib/rhythm-journey";

type RhythmPhase = "morning" | "day" | "night";
type MarkerSleep = "good" | "normal" | "low";
type MarkerStress = "low" | "normal" | "high";
type MarkerMood = "calm" | "tired" | "sleepy" | "energy" | "thoughts" | "unknown";

type MarkerStoneState = {
  date: string;
  sleep: MarkerSleep;
  stress: MarkerStress;
  lastGate: RhythmPhase;
};

type BasicHomeProps = {
  currentDay?: number;
  streakCount?: number;
};

const MARKER_STONE_STORAGE_KEY = "meisoulife_marker_stone_v1";
const LAST_GATE_STORAGE_KEY = "meisoulife_last_rhythm_gate";

const basicHomeCopy = {
  jp: {
    sanctuaryEyebrow: "RHYTHM GARDEN",
    sanctuaryTitle: "小さな回復が\n大きな変化をつくります。",
    sanctuaryBody:
      "今日のリズムが\nあなたを待っています。",
    hero: {
      morning: {
        emoji: "☀️",
        title: "今日の朝のリズム",
        body: "今日を始める前に、\n3分だけ自分に戻ってみましょう。",
        button: "リズムの扉を開く"
      },
      day: {
        emoji: "🌿",
        title: "今日の昼のリズム",
        body: "少し立ち止まり、\n呼吸をもう一度整えてみましょう。",
        button: "リズムの扉を開く"
      },
      night: {
        emoji: "🌙",
        title: "今日の夜のリズム",
        body: "今日一日をやさしく手放し、\nゆっくり休んでみましょう。",
        button: "リズムの扉を開く"
      }
    },
    gatesTitle: "TODAY'S GATE",
    todayGateTitle: "今日、開いている扉",
    todayGateItems: {
      rhythm: "今日のリズム",
      openGate: "今日の扉",
      day: "旅の日",
      streak: "歩いてきた日々",
      insight: "次の一歩は、すでにここで待っています。"
    },
    todayMessageTitle: "今日の道しるべ",
    todayMessages: [
      "あなたのリズムは、すでにあなたの中にあります。",
      "今日の目標は、もっと多くすることではなく、より目覚めていることです。",
      "静けさは遠くにありません。",
      "一つの呼吸が今日を変えてくれます。",
      "自然は急ぎません。あなたも急がなくて大丈夫です。"
    ],
    markerStone: {
      title: "今日の標石",
      bodyTitle: "今日の静かな読み取り",
      note: "今の状態を少しだけ映して、今日に合う一文を置いておきます。",
      mood: "今の気分",
      sleep: "睡眠",
      stress: "ストレス",
      lastGate: "最後にくぐった扉",
      sleepOptions: {
        good: "良い",
        normal: "普通",
        low: "不足"
      },
      stressOptions: {
        low: "低い",
        normal: "普通",
        high: "高い"
      },
      moods: {
        calm: "穏やか",
        tired: "少し疲れた",
        sleepy: "眠い",
        energy: "エネルギーが必要",
        thoughts: "考えが多い",
        unknown: "まだ選んでいません"
      },
      guideEyebrow: "RHYTHM GUIDE",
      guideTitle: "AI Rhythm Guide 準備中",
      guideBody: "今日はまだ軽い標石だけを置いています。次の段階で、この静かな文脈をAIガイドにつなげます。"
    },
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
      {
        key: "morning",
        emoji: "☀️",
        title: "朝の扉",
        description: "今日を軽やかにひらく",
        detail: "3分・Morning Gate",
        button: "朝のリズムを始める →"
      },
      {
        key: "day",
        emoji: "🌿",
        title: "昼の扉",
        description: "もう一度中心に戻る",
        detail: "3分・Day Gate",
        button: "昼のリズムを始める →"
      },
      {
        key: "night",
        emoji: "🌙",
        title: "夜の扉",
        description: "一日をやさしく手放す",
        detail: "3分・Night Gate",
        button: "夜のリズムを始める →"
      }
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
    sanctuaryEyebrow: "RHYTHM GARDEN",
    sanctuaryTitle: "작은 쉼이\n하루를 바꿉니다.",
    sanctuaryBody:
      "오늘의 리듬이\n당신을 기다리고 있습니다.",
    hero: {
      morning: {
        emoji: "☀️",
        title: "오늘의 아침 리듬",
        body: "오늘을 시작하기 전에\n3분만 자신에게 돌아와 보세요.",
        button: "리듬의 문 열기"
      },
      day: {
        emoji: "🌿",
        title: "오늘의 낮 리듬",
        body: "잠시 멈추고\n호흡을 다시 정리해보세요.",
        button: "리듬의 문 열기"
      },
      night: {
        emoji: "🌙",
        title: "오늘의 밤 리듬",
        body: "오늘 하루를 부드럽게 내려놓고\n편안히 쉬어보세요.",
        button: "리듬의 문 열기"
      }
    },
    gatesTitle: "TODAY'S GATE",
    todayGateTitle: "오늘 열려 있는 문",
    todayGateItems: {
      rhythm: "오늘의 리듬",
      openGate: "오늘의 문",
      day: "여정의 날",
      streak: "이어온 날들",
      insight: "당신의 다음 걸음은 이미 여기에서 기다리고 있습니다."
    },
    todayMessageTitle: "오늘의 표지석",
    todayMessages: [
      "당신의 리듬은 이미 당신 안에 있습니다.",
      "오늘의 목표는 더 많이 하는 것이 아니라 더 깨어있는 것입니다.",
      "조용함은 멀리 있지 않습니다.",
      "한 번의 숨이 오늘을 바꿀 수 있습니다.",
      "자연은 서두르지 않습니다. 당신도 서두르지 않아도 괜찮습니다."
    ],
    markerStone: {
      title: "오늘의 표지석",
      bodyTitle: "오늘의 조용한 읽기",
      note: "지금의 상태를 조금 비추어 오늘에 어울리는 한 문장을 놓아둡니다.",
      mood: "지금의 기분",
      sleep: "수면",
      stress: "스트레스",
      lastGate: "마지막으로 지난 문",
      sleepOptions: {
        good: "좋음",
        normal: "보통",
        low: "부족"
      },
      stressOptions: {
        low: "낮음",
        normal: "보통",
        high: "높음"
      },
      moods: {
        calm: "편안함",
        tired: "조금 지침",
        sleepy: "피곤함",
        energy: "에너지 필요",
        thoughts: "생각이 많음",
        unknown: "아직 선택하지 않음"
      },
      guideEyebrow: "RHYTHM GUIDE",
      guideTitle: "AI 리듬 가이드를 준비하고 있습니다",
      guideBody: "지금은 가벼운 표지석만 두고 있습니다. 다음 단계에서 이 조용한 맥락을 AI 가이드로 이어갈 수 있게 준비해 둡니다."
    },
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
      {
        key: "morning",
        emoji: "☀️",
        title: "아침의 문",
        description: "오늘을 가볍게 여는 문",
        detail: "3분 · Morning Gate",
        button: "아침 리듬 시작 →"
      },
      {
        key: "day",
        emoji: "🌿",
        title: "낮의 문",
        description: "다시 중심으로 돌아오는 문",
        detail: "3분 · Day Gate",
        button: "낮 리듬 시작 →"
      },
      {
        key: "night",
        emoji: "🌙",
        title: "밤의 문",
        description: "하루를 내려놓는 문",
        detail: "3분 · Night Gate",
        button: "밤 리듬 시작 →"
      }
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
    sanctuaryEyebrow: "RHYTHM GARDEN",
    sanctuaryTitle: "Small moments of recovery\ncreate great change.",
    sanctuaryBody:
      "Today's rhythm\nis waiting for you.",
    hero: {
      morning: {
        emoji: "☀️",
        title: "Today’s Morning Rhythm",
        body: "Before you begin your day,\ntake 3 minutes to return to yourself.",
        button: "Open the Rhythm Gate"
      },
      day: {
        emoji: "🌿",
        title: "Today’s Day Rhythm",
        body: "Pause for a moment\nand gently settle your breath.",
        button: "Open the Rhythm Gate"
      },
      night: {
        emoji: "🌙",
        title: "Today’s Night Rhythm",
        body: "Gently let go of the day\nand rest in your own rhythm.",
        button: "Open the Rhythm Gate"
      }
    },
    gatesTitle: "TODAY'S GATE",
    todayGateTitle: "Today's Open Gate",
    todayGateItems: {
      rhythm: "Today's Rhythm",
      openGate: "Open Gate",
      day: "Current Day",
      streak: "Days of Practice",
      insight: "Your next step is already waiting."
    },
    todayMessageTitle: "Today’s Signpost",
    todayMessages: [
      "Your rhythm is already within you.",
      "Today’s goal is not to do more, but to be more awake.",
      "Stillness is not far away.",
      "One breath can change today.",
      "Nature does not hurry. You do not need to hurry either."
    ],
    markerStone: {
      title: "Today’s Marker Stone",
      bodyTitle: "A quiet reading for today",
      note: "A small reading shaped by your current state, placed here for today.",
      mood: "Mood",
      sleep: "Sleep",
      stress: "Stress",
      lastGate: "Last gate",
      sleepOptions: {
        good: "Good",
        normal: "Normal",
        low: "Low"
      },
      stressOptions: {
        low: "Low",
        normal: "Normal",
        high: "High"
      },
      moods: {
        calm: "Calm",
        tired: "A little tired",
        sleepy: "Sleepy",
        energy: "Need energy",
        thoughts: "Many thoughts",
        unknown: "Not chosen yet"
      },
      guideEyebrow: "RHYTHM GUIDE",
      guideTitle: "AI Rhythm Guide is being prepared",
      guideBody: "For now, we are placing only a light marker stone here. This structure is ready to hold a future AI rhythm guide without adding noise today."
    },
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
      {
        key: "morning",
        emoji: "☀️",
        title: "Morning Gate",
        description: "Begin gently",
        detail: "3 min · Morning Rhythm",
        button: "Start Morning Rhythm →"
      },
      {
        key: "day",
        emoji: "🌿",
        title: "Day Gate",
        description: "Return to center",
        detail: "3 min · Day Rhythm",
        button: "Start Day Rhythm →"
      },
      {
        key: "night",
        emoji: "🌙",
        title: "Night Gate",
        description: "Release the day",
        detail: "3 min · Night Rhythm",
        button: "Start Night Rhythm →"
      }
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

function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readMarkerStoneState(): MarkerStoneState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(MARKER_STONE_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MarkerStoneState>;

    if (
      typeof parsed.date === "string" &&
      (parsed.sleep === "good" || parsed.sleep === "normal" || parsed.sleep === "low") &&
      (parsed.stress === "low" || parsed.stress === "normal" || parsed.stress === "high") &&
      (parsed.lastGate === "morning" || parsed.lastGate === "day" || parsed.lastGate === "night")
    ) {
      return parsed as MarkerStoneState;
    }
  } catch (_error) {
    window.localStorage.removeItem(MARKER_STONE_STORAGE_KEY);
  }

  return null;
}

function saveMarkerStoneState(next: MarkerStoneState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MARKER_STONE_STORAGE_KEY, JSON.stringify(next));
}

function readLastGate() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LAST_GATE_STORAGE_KEY);

  if (raw === "morning" || raw === "day" || raw === "night") {
    return raw;
  }

  return null;
}

function readTodayMood(): MarkerMood {
  const stored = getTodayRhythmCheckIn();

  if (!stored || stored.date !== getTodayKey()) {
    return "unknown";
  }

  switch (stored.moodKey) {
    case "calm":
    case "tired":
    case "sleepy":
    case "energy":
    case "thoughts":
      return stored.moodKey;
    default:
      return "unknown";
  }
}

function buildMarkerMessage(
  language: "jp" | "kr" | "en",
  options: {
    currentDay: number;
    rhythmPhase: RhythmPhase;
    mood: MarkerMood;
    sleep: MarkerSleep;
    stress: MarkerStress;
    lastGate: RhythmPhase;
  }
) {
  const { currentDay, rhythmPhase, mood, sleep, stress, lastGate } = options;

  if (language === "jp") {
    if (sleep === "low") {
      return `第${currentDay}の扉に立つ今日は、\n休みの余白を少し多めに残してみましょう。\n\n最後に通った${lastGate === "night" ? "夜" : lastGate === "day" ? "昼" : "朝"}の扉の静けさが、\n今のあなたを支えてくれます。`;
    }

    if (stress === "high" || mood === "thoughts") {
      return `今は、考えを進めるより\n中心に戻るほうが合いそうです。\n\n${rhythmPhase === "night" ? "夜" : rhythmPhase === "day" ? "昼" : "朝"}のリズムで、\nひと呼吸ずつ整えていきましょう。`;
    }

    if (mood === "energy") {
      return `今日は少し光を足す日にしてみましょう。\n\n第${currentDay}の扉を急がずにくぐりながら、\n体の奥に残る力を呼び戻してみてください。`;
    }

    return `今日のあなたには、\n静かに続ける流れが似合っています。\n\n第${currentDay}の扉と${rhythmPhase === "night" ? "夜" : rhythmPhase === "day" ? "昼" : "朝"}のリズムを重ねて、\n小さく戻ってきましょう。`;
  }

  if (language === "kr") {
    if (sleep === "low") {
      return `오늘은 제${currentDay}의 문 앞에서\n쉬어갈 여백을 조금 더 남겨두면 좋겠습니다.\n\n마지막으로 지나온 ${lastGate === "night" ? "밤" : lastGate === "day" ? "낮" : "아침"}의 문이,\n지금의 당신을 조용히 받쳐줄 것입니다.`;
    }

    if (stress === "high" || mood === "thoughts") {
      return `지금은 더 밀어가기보다\n중심으로 돌아오는 편이 잘 어울립니다.\n\n${rhythmPhase === "night" ? "밤" : rhythmPhase === "day" ? "낮" : "아침"}의 리듬에서,\n숨 하나씩 다시 정돈해 봅시다.`;
    }

    if (mood === "energy") {
      return `오늘은 몸 안의 빛을\n조금 더 깨워도 좋겠습니다.\n\n제${currentDay}의 문을 서두르지 않고 지나며,\n남아 있는 힘을 다시 불러와 보세요.`;
    }

    return `오늘의 당신에게는\n조용히 이어가는 흐름이 어울립니다.\n\n제${currentDay}의 문과 ${rhythmPhase === "night" ? "밤" : rhythmPhase === "day" ? "낮" : "아침"}의 리듬을 겹쳐,\n작게 돌아와 보세요.`;
  }

  if (sleep === "low") {
    return `At Gate ${currentDay},\nleave a little more room for rest today.\n\nThe calm of the ${lastGate} gate you last passed through\ncan keep holding you now.`;
  }

  if (stress === "high" || mood === "thoughts") {
    return `Today may be better for returning to center\nthan for pushing forward.\n\nLet the ${rhythmPhase} rhythm\nsettle you one breath at a time.`;
  }

  if (mood === "energy") {
    return `Today can be a day\nfor gently waking your inner light.\n\nAs you pass Gate ${currentDay},\ncall back the strength that is still with you.`;
  }

  return `A quiet, steady rhythm\nmay be enough for today.\n\nLet Gate ${currentDay} and the ${rhythmPhase} rhythm\nbring you back in a small, kind way.`;
}

function buildRhythmMeditationHref(rhythm: RhythmPhase) {
  // Existing safe Daily Rhythm flow currently enters through meditation.
  return `/meditation?duration=180&type=${rhythm}&returnTo=${encodeURIComponent(`/program/basic?rhythm=${rhythm}`)}`;
}

function getGateSurfaceClasses(rhythm: RhythmPhase) {
  if (rhythm === "morning") {
    return "bg-[radial-gradient(circle_at_top,rgba(240,211,138,0.26),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(194,139,72,0.18),transparent_36%),linear-gradient(180deg,rgba(46,56,86,0.88),rgba(20,26,42,0.92))] shadow-[0_22px_60px_rgba(232,190,111,0.14)]";
  }

  if (rhythm === "day") {
    return "bg-[radial-gradient(circle_at_top,rgba(120,174,138,0.20),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(53,101,87,0.24),transparent_40%),linear-gradient(180deg,rgba(23,54,58,0.90),rgba(12,26,30,0.94))] shadow-[0_22px_60px_rgba(73,126,103,0.16)]";
  }

  return "bg-[radial-gradient(circle_at_top,rgba(110,138,208,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(58,90,148,0.18),transparent_42%),linear-gradient(180deg,rgba(20,35,61,0.92),rgba(9,18,34,0.96))] shadow-[0_22px_60px_rgba(79,111,178,0.16)]";
}

export function BasicHome({ currentDay = 1, streakCount = 3 }: BasicHomeProps) {
  const { language } = useLanguage();
  const copy = useMemo(() => getLocaleCopy(basicHomeCopy, language), [language]);
  const searchParams = useSearchParams();
  const highlightedRhythm = searchParams.get("rhythm") as RhythmPhase | null;
  const rhythmPhase = highlightedRhythm === "morning" || highlightedRhythm === "day" || highlightedRhythm === "night"
    ? highlightedRhythm
    : getLocalRhythmPhase();
  const hero = copy.hero[rhythmPhase];
  const todayMessage = useMemo(() => getDailyMessage(copy.todayMessages), [copy.todayMessages]);
  const [journeyDay, setJourneyDay] = useState(currentDay);
  const [streakDays, setStreakDays] = useState(streakCount);
  const [selectedMood, setSelectedMood] = useState<MarkerMood>("unknown");
  const [sleepStatus, setSleepStatus] = useState<MarkerSleep>("normal");
  const [stressStatus, setStressStatus] = useState<MarkerStress>("normal");
  const [lastGate, setLastGate] = useState<RhythmPhase>(rhythmPhase);

  useEffect(() => {
    try {
      const journeyRaw = window.localStorage.getItem(RHYTHM_JOURNEY_STORAGE_KEY);
      const streakRaw = window.localStorage.getItem("meisoulife_basic_rhythm_check_streak");
      const markerState = readMarkerStoneState();
      const savedLastGate = readLastGate();
      const parsedStreak = Number.parseInt(streakRaw || "", 10);
      const parsedJourney = journeyRaw ? (JSON.parse(journeyRaw) as { currentDay?: number }) : null;

      if (typeof parsedJourney?.currentDay === "number" && parsedJourney.currentDay >= 1 && parsedJourney.currentDay <= 7) {
        setJourneyDay(parsedJourney.currentDay);
      }

      if (Number.isFinite(parsedStreak) && parsedStreak > 0) {
        setStreakDays(parsedStreak);
      }

      if (markerState?.date === getTodayKey()) {
        setSleepStatus(markerState.sleep);
        setStressStatus(markerState.stress);
        setLastGate(markerState.lastGate);
      } else if (savedLastGate) {
        setLastGate(savedLastGate);
      }

      setSelectedMood(readTodayMood());
    } catch (error) {
      console.warn("[basic-home] failed to read local sanctuary state", error);
    }
  }, []);

  useEffect(() => {
    setJourneyDay(currentDay);
  }, [currentDay]);

  useEffect(() => {
    setStreakDays(streakCount);
  }, [streakCount]);

  function persistMarkerState(next: Partial<Pick<MarkerStoneState, "sleep" | "stress" | "lastGate">>) {
    const payload: MarkerStoneState = {
      date: getTodayKey(),
      sleep: next.sleep ?? sleepStatus,
      stress: next.stress ?? stressStatus,
      lastGate: next.lastGate ?? lastGate
    };

    saveMarkerStoneState(payload);
  }

  function handleSelectGate(gate: RhythmPhase) {
    setLastGate(gate);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LAST_GATE_STORAGE_KEY, gate);
    }

    persistMarkerState({ lastGate: gate });
  }

  function handleSleepChange(next: MarkerSleep) {
    setSleepStatus(next);
    persistMarkerState({ sleep: next });
  }

  function handleStressChange(next: MarkerStress) {
    setStressStatus(next);
    persistMarkerState({ stress: next });
  }

  const markerMessage = useMemo(
    () =>
      buildMarkerMessage(language, {
        currentDay: journeyDay,
        rhythmPhase,
        mood: selectedMood,
        sleep: sleepStatus,
        stress: stressStatus,
        lastGate
      }),
    [currentDay, journeyDay, language, lastGate, rhythmPhase, selectedMood, sleepStatus, stressStatus]
  );

  return (
    <div className="section-shell py-14 sm:py-20">
      <div className="mx-auto max-w-6xl space-y-10 sm:space-y-12">
        <section className="relative flex min-h-[78vh] flex-col justify-between overflow-hidden rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(231,206,140,0.18),transparent_15%),radial-gradient(circle_at_left,rgba(67,104,91,0.24),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(46,86,118,0.28),transparent_30%),linear-gradient(180deg,rgba(8,20,34,0.99),rgba(5,14,24,0.97))] px-6 py-10 shadow-[0_36px_120px_rgba(3,10,20,0.44)] sm:px-8 sm:py-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(241,222,170,0.24),transparent_58%)]" />
            <div className="absolute left-[10%] top-[18%] h-32 w-32 rounded-full bg-gold/12 blur-3xl animate-pulse" />
            <div className="absolute -left-10 bottom-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(83,120,102,0.22),transparent_68%)] blur-3xl" />
            <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(85,110,162,0.18),transparent_70%)] blur-3xl" />
            <div className="absolute left-[18%] top-[34%] h-2 w-2 rounded-full bg-white/45 blur-[1px] animate-pulse" />
            <div className="absolute left-[34%] top-[26%] h-1.5 w-1.5 rounded-full bg-gold/50 blur-[1px] animate-pulse" />
            <div className="absolute right-[22%] top-[32%] h-2 w-2 rounded-full bg-white/35 blur-[1px] animate-pulse" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(4,10,18,0.42))]" />
          </div>

          <div className="relative max-w-3xl">
            <p className="text-sm uppercase tracking-[0.32em] text-gold/82">{copy.sanctuaryEyebrow}</p>
            <h1 className="mt-5 font-serif text-[36px] leading-[1.24] text-white sm:text-[50px]">
              {copy.sanctuaryTitle}
            </h1>
            <p className="mt-6 whitespace-pre-line text-base leading-[2] text-white/76 sm:text-lg sm:leading-[2.05]">
              {copy.sanctuaryBody}
            </p>
            <Link
              href="#rhythm-gates"
              className="mt-8 inline-flex min-h-[54px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#f2ddb0,#d4ba75)] px-6 py-4 text-base font-semibold text-ink shadow-[0_18px_40px_rgba(212,186,117,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#e7cd92]"
            >
              {hero.button}
            </Link>
          </div>

          <div id="rhythm-gates" className="relative mt-10 scroll-mt-24">
            <p className="text-xs uppercase tracking-[0.3em] text-white/48">{copy.gatesTitle}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {copy.rhythmCards.map((card) => {
              const rhythm = card.key as RhythmPhase;

              return (
              <Link
                key={card.key}
                href={buildRhythmMeditationHref(rhythm)}
                onClick={() => handleSelectGate(rhythm)}
                className={`group relative overflow-hidden rounded-[30px] border px-5 py-5 transition duration-300 hover:-translate-y-1 ${
                  rhythmPhase === card.key ? "border-gold/28 ring-1 ring-gold/18" : "border-white/10"
                } ${getGateSurfaceClasses(rhythm)}`}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_26%,rgba(6,10,20,0.24)_100%)] opacity-90" />
                <div className="absolute -right-8 top-6 h-24 w-24 rounded-full bg-white/8 blur-2xl transition duration-500 group-hover:scale-125" />
                <div className="relative">
                  <p className="text-sm uppercase tracking-[0.24em] text-gold/82">{card.emoji} {card.title}</p>
                  <p className="mt-3 min-h-[56px] text-sm leading-7 text-white/82">{card.description}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.24em] text-white/52">{card.detail}</p>
                  <div className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/14 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition duration-300 group-hover:bg-white/[0.12]">
                    {card.button}
                  </div>
                </div>
              </Link>
            );
            })}
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-white/[0.035] px-6 py-8 shadow-[0_20px_72px_rgba(7,17,31,0.16)] sm:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.todayGateTitle}</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
            <article className={`relative overflow-hidden rounded-[26px] border border-gold/16 px-6 py-6 ${getGateSurfaceClasses(rhythmPhase)}`}>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_28%,rgba(4,8,18,0.28)_100%)]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.24em] text-gold/78">{copy.todayGateItems.openGate}</p>
                <p className="mt-3 text-sm uppercase tracking-[0.24em] text-white/60">{copy.todayGateItems.rhythm}</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {copy.rhythmCards.find((card) => card.key === rhythmPhase)?.emoji} {copy.rhythmCards.find((card) => card.key === rhythmPhase)?.title}
                </p>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/78">
                  {copy.rhythmCards.find((card) => card.key === rhythmPhase)?.description}
                </p>
                <Link
                  href={buildRhythmMeditationHref(rhythmPhase)}
                  onClick={() => handleSelectGate(rhythmPhase)}
                  className="mt-6 inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/14 bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
                >
                  {copy.rhythmCards.find((card) => card.key === rhythmPhase)?.button}
                </Link>
              </div>
            </article>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <article className="rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-5">
                <p className="text-sm text-white/56">{copy.todayGateItems.day}</p>
                <p className="mt-2 text-xl font-semibold text-white">Day {journeyDay}</p>
              </article>
              <article className="rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-5">
                <p className="text-sm text-white/56">{copy.todayGateItems.streak}</p>
                <p className="mt-2 text-xl font-semibold text-white">{streakDays}</p>
              </article>
              <article className="rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-5">
                <p className="text-sm text-white/56">{copy.todayMessageTitle}</p>
                <p className="mt-2 text-base leading-7 text-white/82">{copy.todayGateItems.insight}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-white/[0.035] px-6 py-8 shadow-[0_20px_72px_rgba(7,17,31,0.16)] sm:px-8">
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-6 sm:px-6">
              <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.markerStone.title}</p>
              <p className="mt-3 text-sm leading-7 text-white/58">{copy.markerStone.note}</p>
              <p className="mt-5 text-sm uppercase tracking-[0.24em] text-white/44">{copy.markerStone.bodyTitle}</p>
              <p className="mt-4 max-w-4xl whitespace-pre-line font-serif text-[26px] leading-[1.75] text-white/90 sm:text-[32px]">
                {markerMessage}
              </p>
              <p className="mt-5 text-sm leading-7 text-white/54">{todayMessage}</p>
            </article>

            <div className="grid gap-4">
              <article className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-5">
                <div className="flex flex-wrap gap-2 text-sm text-white/66">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                    {copy.markerStone.mood}: {copy.markerStone.moods[selectedMood]}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                    {copy.markerStone.lastGate}: {copy.rhythmCards.find((card) => card.key === lastGate)?.title}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-sm text-white/58">{copy.markerStone.sleep}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["good", "normal", "low"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSleepChange(option)}
                        className={`min-h-[40px] rounded-full border px-3.5 py-2 text-sm transition ${
                          sleepStatus === option
                            ? "border-gold/34 bg-gold/10 text-white"
                            : "border-white/10 bg-white/[0.03] text-white/66 hover:bg-white/[0.05]"
                        }`}
                      >
                        {copy.markerStone.sleepOptions[option]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm text-white/58">{copy.markerStone.stress}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["low", "normal", "high"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleStressChange(option)}
                        className={`min-h-[40px] rounded-full border px-3.5 py-2 text-sm transition ${
                          stressStatus === option
                            ? "border-gold/34 bg-gold/10 text-white"
                            : "border-white/10 bg-white/[0.03] text-white/66 hover:bg-white/[0.05]"
                        }`}
                      >
                        {copy.markerStone.stressOptions[option]}
                      </button>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-[24px] border border-gold/14 bg-gold/[0.05] px-5 py-5">
                <p className="text-xs uppercase tracking-[0.26em] text-gold/78">{copy.markerStone.guideEyebrow}</p>
                <p className="mt-3 text-lg font-semibold text-white">{copy.markerStone.guideTitle}</p>
                <p className="mt-3 text-sm leading-7 text-white/66">{copy.markerStone.guideBody}</p>
              </article>
            </div>
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
