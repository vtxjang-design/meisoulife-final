"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getLocaleCopy, useLanguage } from "@/lib/i18n";
import { getTodayRhythmCheckIn } from "@/lib/today-rhythm-checkin";
import { getRhythmJourneyDay, RHYTHM_JOURNEY_STORAGE_KEY } from "@/lib/rhythm-journey";

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
const TODAY_REFLECTION_STORAGE_KEY = "meisoulife_basic_daily_reflection_v1";

const basicHomeCopy = {
  jp: {
    sanctuaryEyebrow: "TODAY'S MARKER STONE",
    continueJourney: "旅を続ける",
    summaryCards: {
      currentGate: "現在の扉",
      progress: "旅の進み",
      returnedDays: "戻ってきた日々",
      insight: "今日の気づき",
      progressValue: "リズムの道の Day {day}",
      insightBody: "小さなリズムは、大きな変化になっていきます。"
    },
    gatesTitle: "今日のリズムゲート",
    todayGateTitle: "今日、開いている扉",
    todayGateItems: {
      rhythm: "今日のリズム",
      openGate: "今日の扉",
      day: "旅の日",
      streak: "歩いてきた日々",
      insight: "次の一歩は、すでにここで待っています。"
    },
    openGate: {
      title: "今日開いている扉",
      practice: "今日は\n立ち止まる練習をします。",
      cta: "扉を開く",
      viewAll: "旅全体を見る"
    },
    aiGuide: {
      title: "AIリズムガイド",
      eyebrow: "今日の案内",
      body: "今日は昨日よりも\n少し静かなリズムが似合っています。\n\n一呼吸をゆっくり取り、\n次へ進む前に余白を残しましょう。",
      availability: "AI 1/3"
    },
    question: {
      title: "今日の問い",
      prompt: "今日あなたは\n何を手放したいですか？",
      placeholder: "一行だけでも大丈夫です。",
      saved: "今日の記録が静かに残りました。"
    },
    companions: {
      title: "ともに歩く人たち",
      body: "今日この道をともに歩く人たちがいます。",
      walked: "128人が今日この道を歩きました",
      present: "14人が今ここにいます"
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
      title: "今日の道しるべ",
      bodyTitle: "立ち止まる庭",
      note: "立ち止まっても大丈夫です。\n\nあなたのリズムは消えたのではなく\n少し休んでいただけです。",
      heroNote: "今日は少し急がなくても大丈夫です。\n\n呼吸があなたを待っています。",
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
      guideBody: "今は重いAI接続を使わず、静かな文脈だけを整えています。次の段階で、この標石をAIリズムガイドへ自然につなげます。"
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
    rhythmCardsTitle: "朝・昼・夜の扉を通して、今日の自分を整えましょう。",
    rhythmCards: [
      {
        key: "morning",
        emoji: "☀️",
        title: "朝の扉",
        description: "呼吸を目覚めさせる時間",
        detail: "一日を始めながら、心の扉を開きます。",
        button: "朝のリズムを始める →"
      },
      {
        key: "day",
        emoji: "🌿",
        title: "昼の扉",
        description: "今ここにとどまる時間",
        detail: "忙しさの中でも、自分を忘れない時間。",
        button: "昼のリズムを始める →"
      },
      {
        key: "night",
        emoji: "🌙",
        title: "夜の扉",
        description: "一日を手放す時間",
        detail: "すべてを手放し、自分へ帰ります。",
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
    sanctuaryEyebrow: "TODAY'S MARKER STONE",
    continueJourney: "여정 계속하기",
    summaryCards: {
      currentGate: "현재의 문",
      progress: "여정의 흐름",
      returnedDays: "돌아온 날들",
      insight: "오늘의 통찰",
      progressValue: "리듬의 길 Day {day}",
      insightBody: "작은 리듬은 큰 변화로 이어집니다."
    },
    gatesTitle: "오늘의 리듬 게이트",
    todayGateTitle: "오늘 열려 있는 문",
    todayGateItems: {
      rhythm: "오늘의 리듬",
      openGate: "오늘의 문",
      day: "여정의 날",
      streak: "이어온 날들",
      insight: "당신의 다음 걸음은 이미 여기에서 기다리고 있습니다."
    },
    openGate: {
      title: "오늘 열린 문",
      practice: "오늘은\n멈추는 연습을 합니다.",
      cta: "문 열기",
      viewAll: "전체 여정 보기"
    },
    aiGuide: {
      title: "AI 리듬 가이드",
      eyebrow: "오늘의 안내",
      body: "오늘 당신의 리듬은 어제보다\n조금 더 조용해 보입니다.\n\n한 번 더 천천히 숨을 쉬고,\n다음으로 가기 전 여백을 남겨보세요.",
      availability: "AI 1/3"
    },
    question: {
      title: "오늘의 질문",
      prompt: "오늘 당신은\n무엇을 내려놓고 싶나요?",
      placeholder: "한 줄만 적어도 충분합니다.",
      saved: "오늘의 기록이 조용히 남았습니다."
    },
    companions: {
      title: "함께 걷는 사람들",
      body: "오늘 이 길을 함께 걷는 사람들이 있습니다.",
      walked: "128명이 오늘 이 길을 걸었습니다",
      present: "14명이 지금 함께 머물고 있습니다"
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
      bodyTitle: "멈춤의 정원",
      note: "멈추어도 괜찮습니다.\n\n당신의 리듬은 사라진 것이 아니라\n잠시 쉬고 있었을 뿐입니다.",
      heroNote: "오늘은 잠시 서두르지 않아도 됩니다.\n\n호흡이 당신을 기다리고 있습니다.",
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
      guideBody: "지금은 무거운 AI 연결 없이 조용한 맥락만 정리합니다. 다음 단계에서 이 표지석을 AI 리듬 가이드와 자연스럽게 잇게 됩니다."
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
    rhythmCardsTitle: "아침, 낮, 밤의 문을 통해 오늘의 나를 돌보세요.",
    rhythmCards: [
      {
        key: "morning",
        emoji: "☀️",
        title: "아침의 문",
        description: "숨을 깨우는 시간",
        detail: "하루를 시작하며 마음의 문을 엽니다.",
        button: "아침 리듬 시작 →"
      },
      {
        key: "day",
        emoji: "🌿",
        title: "낮의 문",
        description: "지금 여기에 머무는 시간",
        detail: "분주함 속에서도 나를 잊지 않는 시간.",
        button: "낮 리듬 시작 →"
      },
      {
        key: "night",
        emoji: "🌙",
        title: "밤의 문",
        description: "하루를 내려놓는 시간",
        detail: "모든 것을 내려놓고 나에게 돌아갑니다.",
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
    sanctuaryEyebrow: "TODAY'S MARKER STONE",
    continueJourney: "Continue Journey",
    summaryCards: {
      currentGate: "Current Gate",
      progress: "Journey Progress",
      returnedDays: "Days Returned",
      insight: "Today's Insight",
      progressValue: "Day {day} of the Rhythm Path",
      insightBody: "Small rhythms become great transformations."
    },
    gatesTitle: "Today’s Rhythm Gates",
    todayGateTitle: "Today's Open Gate",
    todayGateItems: {
      rhythm: "Today's Rhythm",
      openGate: "Open Gate",
      day: "Current Day",
      streak: "Days of Practice",
      insight: "Your next step is already waiting."
    },
    openGate: {
      title: "Today’s Open Gate",
      practice: "Today,\nwe practice pausing.",
      cta: "Open Gate",
      viewAll: "View Full Journey"
    },
    aiGuide: {
      title: "AI Rhythm Guide",
      eyebrow: "Today’s Guidance",
      body: "Today your rhythm feels quieter than yesterday.\n\nTake a slower breath and allow space\nbefore moving forward.",
      availability: "AI 1/3"
    },
    question: {
      title: "Today’s Question",
      prompt: "What would you like\nto let go of today?",
      placeholder: "One line is enough.",
      saved: "Today’s reflection has been quietly saved."
    },
    companions: {
      title: "Walking Companions",
      body: "There are people walking this path with you today.",
      walked: "128 people walked this path today",
      present: "14 are currently present"
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
      bodyTitle: "Garden of Stillness",
      note: "It is okay to pause.\n\nYour rhythm has not disappeared.\nIt has only been resting for a while.",
      heroNote: "Today, you do not need to hurry.\n\nYour breath is waiting for you.",
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
      guideBody: "For now, we are keeping this light and steady. The structure is ready for a future AI rhythm guide without adding noise to today."
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
    rhythmCardsTitle: "Care for yourself through the morning, day, and night gates.",
    rhythmCards: [
      {
        key: "morning",
        emoji: "☀️",
        title: "Morning Gate",
        description: "Time to awaken the breath",
        detail: "Open the door of your heart as the day begins.",
        button: "Start Morning Rhythm →"
      },
      {
        key: "day",
        emoji: "🌿",
        title: "Day Gate",
        description: "Time to stay here, now",
        detail: "A moment to remember yourself in the middle of the day.",
        button: "Start Day Rhythm →"
      },
      {
        key: "night",
        emoji: "🌙",
        title: "Night Gate",
        description: "Time to let the day go",
        detail: "Let everything go and return to yourself.",
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

function readTodayReflection() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const raw = window.localStorage.getItem(TODAY_REFLECTION_STORAGE_KEY);

    if (!raw) {
      return "";
    }

    const parsed = JSON.parse(raw) as { date?: string; text?: string };
    return parsed?.date === getTodayKey() && typeof parsed.text === "string" ? parsed.text : "";
  } catch (_error) {
    window.localStorage.removeItem(TODAY_REFLECTION_STORAGE_KEY);
    return "";
  }
}

function saveTodayReflection(text: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    TODAY_REFLECTION_STORAGE_KEY,
    JSON.stringify({
      date: getTodayKey(),
      text
    })
  );
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

function getJourneyGateLabel(language: "jp" | "kr" | "en", day: number) {
  if (language === "jp") {
    return `第${day}の扉`;
  }

  if (language === "kr") {
    return `제${day}의 문`;
  }

  const ordinals = ["One", "Two", "Three", "Four", "Five", "Six", "Seven"];
  return `Gate ${ordinals[day - 1] ?? day}`;
}

function getMarkerStoneCtaLabel(language: "jp" | "kr" | "en", rhythmPhase: RhythmPhase) {
  if (language === "jp") {
    if (rhythmPhase === "morning") return "朝の扉を開く";
    if (rhythmPhase === "day") return "昼の扉を開く";
    return "夜の扉を開く";
  }

  if (language === "kr") {
    if (rhythmPhase === "morning") return "아침의 문 열기";
    if (rhythmPhase === "day") return "낮의 문 열기";
    return "밤의 문 열기";
  }

  if (rhythmPhase === "morning") return "Open Morning Gate";
  if (rhythmPhase === "day") return "Open Day Gate";
  return "Open Night Gate";
}

function replaceDayToken(template: string, day: number) {
  return template.replace("{day}", String(day));
}

export function BasicHome({ currentDay = 1, streakCount = 3 }: BasicHomeProps) {
  const { language } = useLanguage();
  const copy = useMemo(() => getLocaleCopy(basicHomeCopy, language), [language]);
  const searchParams = useSearchParams();
  const highlightedRhythm = searchParams.get("rhythm") as RhythmPhase | null;
  const rhythmPhase = highlightedRhythm === "morning" || highlightedRhythm === "day" || highlightedRhythm === "night"
    ? highlightedRhythm
    : getLocalRhythmPhase();
  const todayMessage = useMemo(() => getDailyMessage(copy.todayMessages), [copy.todayMessages]);
  const [journeyDay, setJourneyDay] = useState(currentDay);
  const [streakDays, setStreakDays] = useState(streakCount);
  const [selectedMood, setSelectedMood] = useState<MarkerMood>("unknown");
  const [sleepStatus, setSleepStatus] = useState<MarkerSleep>("normal");
  const [stressStatus, setStressStatus] = useState<MarkerStress>("normal");
  const [lastGate, setLastGate] = useState<RhythmPhase>(rhythmPhase);
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);

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
      setReflectionText(readTodayReflection());
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
  const currentJourneyGate = useMemo(() => getRhythmJourneyDay(language, journeyDay), [language, journeyDay]);

  function handleReflectionChange(next: string) {
    setReflectionText(next);
    setReflectionSaved(false);

    try {
      saveTodayReflection(next);
      setReflectionSaved(true);
    } catch (error) {
      console.warn("[basic-home] failed to save today reflection", error);
    }
  }

  const sanctuarySectionClass =
    "relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,20,40,0.62),rgba(6,15,28,0.74))] px-6 py-8 shadow-[0_24px_90px_rgba(5,14,26,0.22)] backdrop-blur-[22px] sm:px-8";
  const markerCtaLabel = getMarkerStoneCtaLabel(language, rhythmPhase);

  return (
    <div className="space-y-10 sm:space-y-12">
        <section id="marker-stone" className="relative min-h-[60vh] overflow-hidden rounded-[38px] border border-gold/16 bg-[radial-gradient(circle_at_18%_18%,rgba(0,200,150,0.18),transparent_28%),radial-gradient(circle_at_78%_14%,rgba(212,178,106,0.16),transparent_24%),radial-gradient(circle_at_85%_28%,rgba(0,120,255,0.10),transparent_28%),linear-gradient(180deg,#061326,#071a2e_48%,#0b2a2d_100%)] px-6 py-8 shadow-[0_40px_120px_rgba(3,10,20,0.46)] sm:min-h-[68vh] sm:px-8 sm:py-10">
          <div id="sanctuary-home" className="absolute inset-0" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(241,222,170,0.18),transparent_60%)]" />
            <div className="absolute left-[7%] top-[8%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(212,178,106,0.18),transparent_72%)] blur-3xl animate-meditation-fog" />
            <div className="absolute left-[18%] top-[20%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,200,150,0.16),transparent_70%)] blur-3xl animate-meditation-fog" />
            <div className="absolute right-[5%] top-[10%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,120,255,0.12),transparent_72%)] blur-3xl animate-meditation-fog" />
            <div className="absolute right-[12%] top-[22%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(212,178,106,0.12),transparent_72%)] blur-3xl animate-meditation-float" />
            <div className="absolute bottom-[10%] left-[8%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(59,137,121,0.14),transparent_74%)] blur-3xl animate-meditation-fog" />
            <div className="absolute inset-x-[12%] bottom-[14%] h-px bg-gradient-to-r from-transparent via-white/16 to-transparent" />
            <div className="absolute left-[16%] top-[28%] h-2 w-2 rounded-full bg-white/45 blur-[1px] animate-pulse" />
            <div className="absolute left-[34%] top-[22%] h-1.5 w-1.5 rounded-full bg-gold/50 blur-[1px] animate-pulse" />
            <div className="absolute right-[20%] top-[26%] h-2 w-2 rounded-full bg-white/35 blur-[1px] animate-pulse" />
          </div>

          <div className="relative flex min-h-[52vh] flex-col justify-between sm:min-h-[58vh]">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.36em] text-gold/82">{copy.sanctuaryEyebrow}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-white/40">
                <span>Explorer Sanctuary</span>
                <span className="h-1 w-1 rounded-full bg-gold/70" />
                <span>Digital National Park</span>
              </div>
              <div className="mt-10">
                <p className="text-sm uppercase tracking-[0.28em] text-white/48">Day {journeyDay}</p>
                <h1 className="mt-3 max-w-[10ch] font-serif text-[40px] leading-[1.08] text-white sm:text-[66px]">
                  {currentJourneyGate.title}
                </h1>
              </div>
              <p className="mt-6 max-w-2xl whitespace-pre-line text-base leading-[1.95] text-white/80 sm:text-lg">
                {copy.markerStone.heroNote}
              </p>
            </div>

            <div className="relative mt-10 flex flex-wrap gap-3">
              <Link
                href={`/rhythm-journey?rhythm=${rhythmPhase}`}
                onClick={() => handleSelectGate(rhythmPhase)}
                className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#f2ddb0,#d4ba75)] px-6 py-4 text-sm font-semibold text-ink shadow-[0_22px_54px_rgba(212,178,106,0.24)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_60px_rgba(212,178,106,0.3)]"
              >
                {markerCtaLabel}
              </Link>
              <Link
                href={`/rhythm-journey?day=${journeyDay}`}
                className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/12 bg-white/[0.06] px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.1]"
              >
                {copy.continueJourney}
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,28,46,0.80),rgba(7,17,29,0.90))] px-5 py-5 shadow-[0_18px_52px_rgba(5,14,26,0.18)]">
            <p className="text-xs uppercase tracking-[0.24em] text-gold/76">{copy.summaryCards.currentGate}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{currentJourneyGate.title}</p>
            <p className="mt-2 text-sm text-white/58">{copy.todayGateItems.openGate}</p>
          </article>
          <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,31,34,0.82),rgba(7,19,22,0.90))] px-5 py-5 shadow-[0_18px_52px_rgba(5,14,26,0.18)]">
            <p className="text-xs uppercase tracking-[0.24em] text-gold/76">{copy.summaryCards.progress}</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {replaceDayToken(copy.summaryCards.progressValue, journeyDay)}
            </p>
            <p className="mt-2 text-sm text-white/58">{copy.openGate.title}</p>
          </article>
          <article className="rounded-[28px] border border-[#2E7D6B]/24 bg-[linear-gradient(180deg,rgba(14,33,35,0.84),rgba(7,18,21,0.90))] px-5 py-5 shadow-[0_18px_52px_rgba(5,14,26,0.18)]">
            <p className="text-xs uppercase tracking-[0.24em] text-gold/76">{copy.summaryCards.returnedDays}</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {streakDays} {language === "jp" ? "日" : language === "kr" ? "일" : "Days"}
            </p>
            <p className="mt-2 text-sm leading-7 text-white/62">{todayMessage}</p>
          </article>
          <article className={`relative overflow-hidden rounded-[28px] border border-gold/22 px-5 py-5 shadow-[0_18px_52px_rgba(212,178,106,0.10)] ${getGateSurfaceClasses(rhythmPhase)}`}>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_30%,rgba(6,10,20,0.24)_100%)]" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.24em] text-gold/76">{copy.summaryCards.insight}</p>
              <p className="mt-3 text-xl font-semibold text-white">{copy.summaryCards.insightBody}</p>
              <p className="mt-2 text-sm leading-7 text-white/72">{copy.aiGuide.availability}</p>
            </div>
          </article>
        </section>

        <section id="today-open-gate" className={`${sanctuarySectionClass} bg-[radial-gradient(circle_at_18%_20%,rgba(0,200,150,0.10),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(212,178,106,0.11),transparent_20%),linear-gradient(180deg,rgba(10,20,40,0.64),rgba(6,15,28,0.78))]`}>
          <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.openGate.title}</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
            <article className={`relative overflow-hidden rounded-[30px] border border-gold/24 px-6 py-6 shadow-[0_24px_72px_rgba(0,0,0,0.26)] ${getGateSurfaceClasses(rhythmPhase)}`}>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_28%,rgba(4,8,18,0.28)_100%)]" />
              <div className="absolute inset-x-[12%] top-0 h-24 rounded-full bg-gold/12 blur-3xl" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.24em] text-gold/78">{getJourneyGateLabel(language, journeyDay)}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{currentJourneyGate.title}</p>
                <p className="mt-3 max-w-md whitespace-pre-line text-sm leading-7 text-white/78">{copy.openGate.practice}</p>
                <Link
                  href={`/rhythm-journey?day=${journeyDay}`}
                  className="mt-6 inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/14 bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
                >
                  {copy.openGate.cta}
                </Link>
              </div>
            </article>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <article className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] px-5 py-5">
                <p className="text-sm text-white/56">{copy.summaryCards.currentGate}</p>
                <p className="mt-2 text-xl font-semibold text-white">{currentJourneyGate.title}</p>
              </article>
              <article className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] px-5 py-5">
                <p className="text-sm text-white/56">{copy.summaryCards.progress}</p>
                <p className="mt-2 text-xl font-semibold text-white">{replaceDayToken(copy.summaryCards.progressValue, journeyDay)}</p>
              </article>
              <article className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] px-5 py-5">
                <p className="text-sm text-white/56">{copy.summaryCards.returnedDays}</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {streakDays} {language === "jp" ? "日" : language === "kr" ? "일" : "Days"}
                </p>
                <Link href="#journey-path" className="mt-3 inline-flex text-xs uppercase tracking-[0.28em] text-gold/58">
                  {copy.openGate.viewAll}
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className={`${sanctuarySectionClass} bg-[linear-gradient(180deg,rgba(10,20,40,0.62),rgba(6,15,28,0.76))]`}>
          <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.aiGuide.title}</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px]">
            <article className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] px-5 py-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/44">{copy.aiGuide.eyebrow}</p>
              <p className="mt-4 whitespace-pre-line font-serif text-[24px] leading-[1.8] text-white/88 sm:text-[28px]">
                {copy.aiGuide.body}
              </p>
            </article>
            <article className="rounded-[26px] border border-[#2E7D6B]/22 bg-[linear-gradient(180deg,rgba(46,125,107,0.14),rgba(255,255,255,0.02))] px-5 py-5">
              <p className="text-sm text-white/60">{copy.aiGuide.eyebrow}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{copy.aiGuide.availability}</p>
            </article>
          </div>
        </section>

        <section className={`${sanctuarySectionClass} bg-[linear-gradient(180deg,rgba(10,20,40,0.62),rgba(6,15,28,0.76))]`}>
          <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.question.title}</p>
          <p className="mt-5 whitespace-pre-line font-serif text-[24px] leading-[1.75] text-white/88 sm:text-[30px]">
            {copy.question.prompt}
          </p>
          <div className="mt-5">
            <textarea
              value={reflectionText}
              onChange={(event) => handleReflectionChange(event.target.value)}
              placeholder={copy.question.placeholder}
              className="min-h-[132px] w-full rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 text-base leading-7 text-white placeholder:text-white/32 outline-none transition focus:border-gold/34"
            />
            {reflectionSaved ? <p className="mt-3 text-sm text-gold/74">{copy.question.saved}</p> : null}
          </div>
        </section>

        <section id="rhythm-gates" className={`${sanctuarySectionClass} bg-[linear-gradient(180deg,rgba(10,20,40,0.62),rgba(6,15,28,0.78))]`}>
          <p className="text-xs uppercase tracking-[0.3em] text-gold/78">{copy.gatesTitle}</p>
          <p className="mt-3 text-sm leading-7 text-white/56">{copy.rhythmCardsTitle}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {copy.rhythmCards.map((card) => {
              const rhythm = card.key as RhythmPhase;

              return (
                <Link
                  key={card.key}
                  href={`/rhythm-journey?rhythm=${rhythm}`}
                  onClick={() => handleSelectGate(rhythm)}
                  className={`group relative overflow-hidden rounded-[30px] border px-5 py-5 transition duration-300 hover:-translate-y-1 ${
                    rhythmPhase === card.key ? "border-gold/34 ring-1 ring-gold/22 shadow-[0_20px_60px_rgba(212,178,106,0.14)]" : "border-white/10"
                  } ${getGateSurfaceClasses(rhythm)}`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_26%,rgba(6,10,20,0.24)_100%)] opacity-90" />
                  <div className="absolute -right-8 top-6 h-24 w-24 rounded-full bg-white/8 blur-2xl transition duration-500 group-hover:scale-125" />
                  <div className="absolute inset-x-[18%] top-0 h-14 rounded-full bg-white/8 blur-2xl opacity-70" />
                  <div className="relative">
                    <p className="text-sm uppercase tracking-[0.24em] text-gold/82">{card.emoji} {card.title}</p>
                    <p className="mt-3 min-h-[56px] text-sm leading-7 text-white/82">{card.description}</p>
                    <p className="mt-4 text-sm leading-7 text-white/58">{card.detail}</p>
                    <div className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/14 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition duration-300 group-hover:bg-white/[0.12]">
                      {language === "jp" ? "始める" : language === "kr" ? "시작하기" : "Begin"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section id="companions" className={`${sanctuarySectionClass} bg-[linear-gradient(180deg,rgba(10,20,40,0.60),rgba(6,15,28,0.74))]`}>
          <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.companions.title}</p>
          <p className="mt-4 text-base leading-8 text-white/74">{copy.companions.body}</p>
          <div className="mt-6 flex items-center gap-3">
            {["A", "M", "S", "K", "Y"].map((label, index) => (
              <span
                key={label}
                className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-sm text-white/78 ${index > 0 ? "-ml-3" : ""}`}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/74">{copy.companions.walked}</div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/74">{copy.companions.present}</div>
          </div>
        </section>

        <section className="rounded-[32px] border border-gold/14 bg-[radial-gradient(circle_at_top,rgba(212,178,106,0.12),transparent_26%),linear-gradient(180deg,rgba(10,20,40,0.62),rgba(6,15,28,0.78))] px-6 py-7 shadow-[0_24px_80px_rgba(5,14,26,0.24)] sm:px-8">
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
  );
}
