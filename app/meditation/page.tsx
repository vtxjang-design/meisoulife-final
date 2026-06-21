"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage, useSiteCopy } from "@/lib/i18n";
import {
  getNatureSoundPreference,
  pauseAmbientNatureAudio,
  resumeAmbientNatureAudio,
  setAmbientNatureAudioVolume,
  setNatureSoundPreference,
  startAmbientNatureAudio,
  STRUCTURED_AMBIENT_PENDING_KEY,
  stopAmbientNatureAudio
} from "@/lib/meditation-ambient-audio";
import { handleMeditationComplete as triggerMeditationCompletion, supportsMeditationVibration } from "@/lib/meditation-completion";
import { getRhythmJourneyContent, getRhythmJourneyGuidance, journeyAudioMap } from "@/lib/rhythm-journey";
import { getBasicPracticeByRouteType, getBasicPracticeBySession } from "@/lib/basic-rhythm";

const CYCLE_SECONDS = 10;
const INHALE_SECONDS = 4;
const HOLD_SECONDS = 2;
const AI_COACH_URL =
  process.env.NEXT_PUBLIC_AI_COACH_URL ||
  "https://chatgpt.com/g/g-69f968bc9a408191a3e5f943912666c0-quiet-rhythm-guide";
const JOURNEY_AUDIO_PENDING_KEY = "meisoulife_journey_audio_pending";
const JOURNEY_AUDIO_DAY_KEY = "meisoulife_journey_day";
const AFFIRMATION_TOTAL_SECONDS = 180;
const MORNING_GATE_FADE_IN_MS = 1800;
const MORNING_GATE_FADE_OUT_MS = 3000;
const MORNING_GATE_DUCK_RATIO = 0.65;
const MORNING_GATE_AUDIO = {
  affirmation: {
    src: "/audio/morning/affirmation gate.mp3",
    volume: 0.18
  },
  energy: {
    src: "/audio/morning/energy gate.mp3",
    volume: 0.2
  },
  vision: {
    src: "/audio/morning/vision gate.mp3",
    volume: 0.16
  }
} as const;
const ENERGY_GATE_VIDEO_SRC = "/basic/morning%20gate/energy%20gate8.mp4";

type BreathPhase = "inhale" | "hold" | "exhale";
type MeditationType = "default" | "morning" | "day" | "night";
type MeditationDoor =
  | "affirmation"
  | "energy"
  | "vision"
  | "focus"
  | "rest"
  | "recharge"
  | "relax"
  | "vitality"
  | "release"
  | "gratitude"
  | "sleep"
  | null;

type StructuredMorningStage =
  | "openingFade"
  | "openingNarration"
  | "breathing"
  | "bodyAwareness"
  | "affirmation"
  | "energy"
  | "vision"
  | "integration"
  | "closing";

type StructuredMorningLine = { at: number; key: string; text: string };

type StructuredMorningCopy = {
  title: string;
  subtitle: string;
  duration: string;
  audioLabel: string;
  startAudio: string;
  pause: string;
  resume: string;
  inhale: string;
  exhale: string;
  completionTitle: string;
  completionMessage: string;
  completionNote: string;
  completionButton: string;
  openingFade: string;
  integration: string;
  openingLines: readonly StructuredMorningLine[];
  closingLines: readonly StructuredMorningLine[];
  affirmationLines?: readonly StructuredMorningLine[];
  awarenessLines?: readonly StructuredMorningLine[];
  energyLines?: readonly StructuredMorningLine[];
  visionLines?: readonly StructuredMorningLine[];
};

const affirmationGateCopy = {
  jp: {
    title: "今日の自分を選ぶ",
    subtitle: "朝は、一日を始める時間ではありません。今日の自分を選ぶ時間です。",
    duration: "3:00",
    audioLabel: "朝のリチュアル",
    startAudio: "音声を開始",
    pause: "一度止める",
    resume: "続ける",
    inhale: "吸う",
    exhale: "吐く",
    completionTitle: "今日の自分を、選びました。",
    completionMessage: "今日の方向は、もう決まりました。",
    completionNote: "この静けさのまま、一日が始まります。",
    completionButton: "朝の扉へ戻る",
    openingFade: "今日の自分を選ぶ",
    integration: "今日は、この自分で生きてみよう。",
    openingLines: [
      { at: 15, key: "open-1", text: "ようこそ。" },
      { at: 22, key: "open-2", text: "少しだけ、立ち止まりましょう。" },
      { at: 35, key: "open-3", text: "吸って。新しい朝を迎えます。" },
      { at: 47, key: "open-4", text: "吐いて。昨日を手放します。" },
      { at: 61, key: "open-5", text: "吸って。今日へ戻ります。" },
      { at: 73, key: "open-6", text: "吐いて。余分な力を手放します。" },
      { at: 87, key: "open-7", text: "吸って。" },
      { at: 93, key: "open-8", text: "吐いて。" }
    ],
    affirmationLines: [
      { at: 104, key: "affirm-1", text: "今朝のあなたは、どんな自分でいたいですか。" },
      { at: 118, key: "affirm-2", text: "穏やかな自分。" },
      { at: 126, key: "affirm-3", text: "自信のある自分。" },
      { at: 134, key: "affirm-4", text: "軽やかな自分。" },
      { at: 142, key: "affirm-5", text: "感謝できる自分。" },
      { at: 150, key: "affirm-6", text: "正解はありません。" },
      { at: 158, key: "affirm-7", text: "今、心が自然に選ぶものを感じてください。" }
    ],
    closingLines: [
      { at: 172, key: "close-1", text: "今日は、この自分を選ぼう。" },
      { at: 178, key: "close-2", text: "それでは、行ってらっしゃい。" }
    ]
  },
  kr: {
    title: "오늘의 나를 선택하기",
    subtitle: "아침은 하루를 시작하는 시간이 아니라, 오늘의 나를 선택하는 시간입니다.",
    duration: "3:00",
    audioLabel: "아침 리추얼",
    startAudio: "음성 시작하기",
    pause: "잠시 멈추기",
    resume: "이어가기",
    inhale: "들이쉬기",
    exhale: "내쉬기",
    completionTitle: "오늘의 나를 선택했습니다.",
    completionMessage: "오늘의 방향은 이미 정해졌습니다.",
    completionNote: "이 고요함 그대로 하루를 시작하면 충분합니다.",
    completionButton: "아침의 문으로 돌아가기",
    openingFade: "오늘의 나를 선택하기",
    integration: "오늘은,\n이 나로 살아갑니다.",
    openingLines: [
      { at: 15, key: "open-1", text: "환영합니다." },
      { at: 22, key: "open-2", text: "잠시, 멈춰 섭니다." },
      { at: 35, key: "open-3", text: "들이쉬며, 아침을 맞이합니다." },
      { at: 47, key: "open-4", text: "내쉬며, 어제를 내려놓습니다." },
      { at: 61, key: "open-5", text: "들이쉬며, 오늘로 돌아옵니다." },
      { at: 73, key: "open-6", text: "내쉬며, 남은 힘을 풉니다." },
      { at: 87, key: "open-7", text: "들이쉬고." },
      { at: 93, key: "open-8", text: "내쉽니다." }
    ],
    affirmationLines: [
      { at: 104, key: "affirm-1", text: "오늘 아침의 나는, 어떤 모습으로 있고 싶나요." },
      { at: 118, key: "affirm-2", text: "차분한 나." },
      { at: 126, key: "affirm-3", text: "분명한 나." },
      { at: 134, key: "affirm-4", text: "가벼운 나." },
      { at: 142, key: "affirm-5", text: "감사하는 나." },
      { at: 150, key: "affirm-6", text: "정답은 없습니다." },
      { at: 158, key: "affirm-7", text: "지금, 마음이 고르는 쪽을 느껴봅니다." }
    ],
    closingLines: [
      { at: 172, key: "close-1", text: "오늘은, 이 나를 선택합니다." },
      { at: 178, key: "close-2", text: "이제, 하루를 시작합니다." }
    ]
  },
  en: {
    title: "Choose Today’s Self",
    subtitle: "Morning is not where you begin the day. It is where you choose who you are today.",
    duration: "3:00",
    audioLabel: "Morning Ritual",
    startAudio: "Start Audio",
    pause: "Pause",
    resume: "Continue",
    inhale: "Inhale",
    exhale: "Exhale",
    completionTitle: "You have chosen who you are today.",
    completionMessage: "From this quiet place, let the day begin gently.",
    completionNote: "There is no need to rush. You can begin as slowly as morning light.",
    completionButton: "Return to Morning Gate",
    openingFade: "Choose Today’s Self",
    integration: "Today,\nI live as this self.",
    openingLines: [
      { at: 15, key: "open-1", text: "Welcome." },
      { at: 22, key: "open-2", text: "Let's pause for a moment." },
      { at: 35, key: "open-3", text: "Inhale. Welcome the new morning." },
      { at: 47, key: "open-4", text: "Exhale. Set yesterday down." },
      { at: 61, key: "open-5", text: "Inhale. Return to today." },
      { at: 73, key: "open-6", text: "Exhale. Soften the extra effort." },
      { at: 87, key: "open-7", text: "Inhale." },
      { at: 93, key: "open-8", text: "Exhale." }
    ],
    affirmationLines: [
      { at: 104, key: "affirm-1", text: "Who do you want to be this morning?" },
      { at: 118, key: "affirm-2", text: "Calm." },
      { at: 126, key: "affirm-3", text: "Clear." },
      { at: 134, key: "affirm-4", text: "Light." },
      { at: 142, key: "affirm-5", text: "Grateful." },
      { at: 150, key: "affirm-6", text: "There is no right answer." },
      { at: 158, key: "affirm-7", text: "Simply notice what your heart is choosing." }
    ],
    closingLines: [
      { at: 172, key: "close-1", text: "Today, I choose this self." },
      { at: 178, key: "close-2", text: "Let's begin the day." }
    ]
  }
} as const;

const energyGateCopy = {
  jp: {
    title: "脳と身体を目覚めさせる",
    subtitle: "体と脳を、中心から静かに目覚めさせる時間です。",
    duration: "3:00",
    audioLabel: "朝のエネルギーリチュアル",
    startAudio: "音声を開始",
    pause: "一度止める",
    resume: "続ける",
    inhale: "吸う",
    exhale: "吐く",
    completionTitle: "脳と体が目覚めました。",
    completionMessage: "エネルギーが、静かに戻ってきました。",
    completionNote: "この流れのまま、今日を始めれば十分です。",
    completionButton: "朝の扉へ戻る",
    openingFade: "脳と身体を目覚めさせる",
    integration: "丹田を感じます。\n今を感じます。",
    openingLines: [
      { at: 15, key: "open-1", text: "ようこそ。" },
      { at: 24, key: "open-2", text: "今日は、体の中心から目覚めます。" },
      { at: 38, key: "open-3", text: "おへその下、丹田に意識を向けます。" },
      { at: 52, key: "open-4", text: "軽く拳を握り、やさしく叩きます。" }
    ],
    awarenessLines: [
      { at: 62, key: "body-1", text: "トントン。" },
      { at: 70, key: "body-2", text: "トントン。" },
      { at: 84, key: "body-3", text: "呼吸は自然に。丹田を感じます。" },
      { at: 98, key: "body-4", text: "トントン。" },
      { at: 106, key: "body-5", text: "トントン。" }
    ],
    energyLines: [
      { at: 120, key: "energy-1", text: "体が目覚めます。脳が目覚めます。" },
      { at: 134, key: "energy-2", text: "温かさを感じます。生命力を感じます。" },
      { at: 146, key: "energy-3", text: "トントン。" },
      { at: 154, key: "energy-4", text: "トントン。" },
      { at: 162, key: "energy-5", text: "今日を支える力は、すでにあなたの中にあります。" },
      { at: 174, key: "energy-6", text: "丹田を感じます。呼吸を感じます。今を感じます。" }
    ],
    closingLines: [
      { at: 178, key: "close-1", text: "準備ができました。" }
    ]
  },
  kr: {
    title: "뇌와 몸을 깨우기",
    subtitle: "몸과 뇌를, 중심에서 조용히 깨우는 시간입니다.",
    duration: "3:00",
    audioLabel: "아침 에너지 리추얼",
    startAudio: "음성 시작하기",
    pause: "잠시 멈추기",
    resume: "이어가기",
    inhale: "들이쉬기",
    exhale: "내쉬기",
    completionTitle: "뇌와 몸이 깨어났습니다.",
    completionMessage: "에너지가 조용히 돌아오고 있습니다.",
    completionNote: "이 리듬 그대로 오늘을 시작하면 충분합니다.",
    completionButton: "아침의 문으로 돌아가기",
    openingFade: "뇌와 몸을 깨우기",
    integration: "단전을 느낍니다.\n지금을 느낍니다.",
    openingLines: [
      { at: 15, key: "open-1", text: "어서 오세요." },
      { at: 24, key: "open-2", text: "오늘은, 몸의 중심에서 깨어납니다." },
      { at: 38, key: "open-3", text: "배꼽 아래, 단전에 의식을 둡니다." },
      { at: 52, key: "open-4", text: "가볍게 주먹을 쥐고, 부드럽게 두드립니다." }
    ],
    awarenessLines: [
      { at: 62, key: "body-1", text: "톡톡." },
      { at: 70, key: "body-2", text: "톡톡." },
      { at: 84, key: "body-3", text: "호흡은 자연스럽게. 단전을 느낍니다." },
      { at: 98, key: "body-4", text: "톡톡." },
      { at: 106, key: "body-5", text: "톡톡." }
    ],
    energyLines: [
      { at: 120, key: "energy-1", text: "몸이 깨어납니다. 뇌가 깨어납니다." },
      { at: 134, key: "energy-2", text: "따뜻함을 느낍니다. 생명력을 느낍니다." },
      { at: 146, key: "energy-3", text: "톡톡." },
      { at: 154, key: "energy-4", text: "톡톡." },
      { at: 162, key: "energy-5", text: "오늘을 움직이는 힘은, 이미 내 안에 있습니다." },
      { at: 174, key: "energy-6", text: "단전을 느낍니다. 호흡을 느낍니다. 지금을 느낍니다." }
    ],
    closingLines: [
      { at: 178, key: "close-1", text: "준비되었습니다." }
    ]
  },
  en: {
    title: "Wake Brain and Body",
    subtitle: "A quiet ritual to awaken the body, brain, and center.",
    duration: "3:00",
    audioLabel: "Morning Energy Ritual",
    startAudio: "Start Audio",
    pause: "Pause",
    resume: "Continue",
    inhale: "Inhale",
    exhale: "Exhale",
    completionTitle: "Your mind and body are waking up.",
    completionMessage: "Your energy is returning quietly.",
    completionNote: "This is enough to begin the day.",
    completionButton: "Return to Morning Gate",
    openingFade: "Wake Brain and Body",
    integration: "Feel your center.\nFeel this moment.",
    openingLines: [
      { at: 15, key: "open-1", text: "Welcome." },
      { at: 24, key: "open-2", text: "Today, we awaken from our center." },
      { at: 38, key: "open-3", text: "Bring your awareness to the lower dantian, just below the navel." },
      { at: 56, key: "open-4", text: "Lightly make a fist, and gently tap." }
    ],
    awarenessLines: [
      { at: 66, key: "body-1", text: "Tap." },
      { at: 74, key: "body-2", text: "Tap." },
      { at: 88, key: "body-3", text: "Let the breath be natural. Feel your center." },
      { at: 104, key: "body-4", text: "Tap." },
      { at: 112, key: "body-5", text: "Tap." }
    ],
    energyLines: [
      { at: 124, key: "energy-1", text: "The body awakens. The brain awakens." },
      { at: 138, key: "energy-2", text: "Feel the warmth. Feel the life energy." },
      { at: 150, key: "energy-3", text: "Tap." },
      { at: 158, key: "energy-4", text: "Tap." },
      { at: 166, key: "energy-5", text: "The strength for today is already within you." },
      { at: 176, key: "energy-6", text: "Feel your center. Feel your breath. Feel this moment." }
    ],
    closingLines: [
      { at: 178, key: "close-1", text: "You are ready." }
    ]
  }
} as const;

const visionGateCopy = {
  jp: {
    title: "方向を思い出す",
    subtitle: "今日向かう方向を、静かに思い出す3分。",
    duration: "3:00",
    audioLabel: "朝のビジョンリチュアル",
    startAudio: "音声を開始",
    pause: "一度止める",
    resume: "続ける",
    inhale: "吸う",
    exhale: "吐く",
    completionTitle: "今日の方向を思い出しました。",
    completionMessage: "向かう先が、静かに戻ってきました。",
    completionNote: "この感覚を胸に、今日を始めれば十分です。",
    completionButton: "朝の扉へ戻る",
    openingFade: "方向を思い出す",
    integration: "今日の方向を、\n静かに抱きます。",
    openingLines: [
      { at: 15, key: "open-1", text: "目を軽く閉じます。" },
      { at: 24, key: "open-2", text: "吸って。ゆっくり朝を迎えます。" },
      { at: 36, key: "open-3", text: "吐いて。静かに整えていきます。" },
      { at: 50, key: "open-4", text: "今日は、どこへ向かいたいですか。" }
    ],
    visionLines: [
      { at: 64, key: "vision-1", text: "急がなくて大丈夫です。" },
      { at: 76, key: "vision-2", text: "ひとつの場面で十分です。" },
      { at: 90, key: "vision-3", text: "今日のあなたらしい姿を、心に浮かべます。" },
      { at: 106, key: "vision-4", text: "穏やかな景色かもしれません。" },
      { at: 120, key: "vision-5", text: "まっすぐな表情かもしれません。" },
      { at: 136, key: "vision-6", text: "心が軽くなる方向かもしれません。" },
      { at: 152, key: "vision-7", text: "その場面を、しばらくそのまま感じます。" }
    ],
    closingLines: [
      { at: 172, key: "close-1", text: "もう、方向は見えています。" },
      { at: 178, key: "close-2", text: "その方向へ、今日を始めましょう。" }
    ]
  },
  kr: {
    title: "방향을 기억하기",
    subtitle: "어디로 가는지 다시 떠올리고 싶을 때",
    duration: "3:00",
    audioLabel: "아침 비전 리추얼",
    startAudio: "음성 시작하기",
    pause: "잠시 멈추기",
    resume: "이어가기",
    inhale: "들이쉬기",
    exhale: "내쉬기",
    completionTitle: "오늘의 방향을 떠올렸습니다.",
    completionMessage: "가야 할 방향이 조용히 돌아왔습니다.",
    completionNote: "이 감각을 품고 오늘을 시작하면 충분합니다.",
    completionButton: "아침의 문으로 돌아가기",
    openingFade: "방향을 기억하기",
    integration: "오늘의 방향을,\n가볍게 품습니다.",
    openingLines: [
      { at: 15, key: "open-1", text: "눈을 가볍게 감습니다." },
      { at: 24, key: "open-2", text: "숨을 천천히 들이쉬고, 천천히 내쉽니다." },
      { at: 36, key: "open-3", text: "오늘은, 어디를 향하고 싶은가요." }
    ],
    visionLines: [
      { at: 64, key: "vision-1", text: "서두르지 않아도 됩니다." },
      { at: 76, key: "vision-2", text: "한 장면이면 충분합니다." },
      { at: 90, key: "vision-3", text: "오늘의 나다운 모습을 떠올려 봅니다." },
      { at: 106, key: "vision-4", text: "평온한 장면일 수도 있습니다." },
      { at: 120, key: "vision-5", text: "분명한 표정일 수도 있습니다." },
      { at: 136, key: "vision-6", text: "마음이 가벼워지는 방향일 수도 있습니다." },
      { at: 152, key: "vision-7", text: "그 장면을, 잠시 그대로 둡니다." }
    ],
    closingLines: [
      { at: 172, key: "close-1", text: "이제, 방향이 보입니다." },
      { at: 178, key: "close-2", text: "그 방향으로 오늘을 시작합니다." }
    ]
  },
  en: {
    title: "Remember Your Direction",
    subtitle: "When you want to remember where you are going",
    duration: "3:00",
    audioLabel: "Morning Vision Ritual",
    startAudio: "Start Audio",
    pause: "Pause",
    resume: "Continue",
    inhale: "Inhale",
    exhale: "Exhale",
    completionTitle: "Your direction has returned.",
    completionMessage: "What matters today is quietly in view again.",
    completionNote: "That is enough to begin the day.",
    completionButton: "Return to Morning Gate",
    openingFade: "Remember Your Direction",
    integration: "I hold today's direction\nlightly.",
    openingLines: [
      { at: 15, key: "open-1", text: "Let the eyes rest." },
      { at: 24, key: "open-2", text: "Take a slow breath in, and a slow breath out." },
      { at: 36, key: "open-3", text: "Where do you want to move today?" }
    ],
    visionLines: [
      { at: 64, key: "vision-1", text: "There is no need to hurry." },
      { at: 76, key: "vision-2", text: "One scene is enough." },
      { at: 90, key: "vision-3", text: "Let an image of your truest self appear." },
      { at: 106, key: "vision-4", text: "It may feel calm." },
      { at: 120, key: "vision-5", text: "It may feel clear." },
      { at: 136, key: "vision-6", text: "It may feel light." },
      { at: 152, key: "vision-7", text: "Let that scene stay with you for a moment." }
    ],
    closingLines: [
      { at: 172, key: "close-1", text: "Now the direction is visible." },
      { at: 178, key: "close-2", text: "Let's begin the day there." }
    ]
  }
} as const;

function normalizeDuration(value: string | null) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 60;
  }

  return parsed;
}

function normalizeMeditationType(value: string | null): MeditationType {
  if (value === "morning" || value === "day" || value === "night") {
    return value;
  }

  return "default";
}

function normalizeDoor(value: string | null): MeditationDoor {
  if (
    value === "affirmation" ||
    value === "energy" ||
    value === "vision" ||
    value === "focus" ||
    value === "rest" ||
    value === "recharge" ||
    value === "relax" ||
    value === "vitality" ||
    value === "release" ||
    value === "gratitude" ||
    value === "sleep"
  ) {
    return value;
  }

  return null;
}

function formatRemainingTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function getBreathPhase(elapsedSeconds: number): BreathPhase {
  const cyclePosition = elapsedSeconds % CYCLE_SECONDS;

  if (cyclePosition < INHALE_SECONDS) {
    return "inhale";
  }

  if (cyclePosition < INHALE_SECONDS + HOLD_SECONDS) {
    return "hold";
  }

  return "exhale";
}

function getDurationVariant(totalSeconds: number) {
  return totalSeconds >= 180 ? "threeMinutes" : "sixty";
}

function getJourneyGuidanceStage(elapsedSeconds: number, totalSeconds: number) {
  if (elapsedSeconds < 8) {
    return "opening";
  }

  if (elapsedSeconds >= Math.max(totalSeconds - 5, 0)) {
    return "closing";
  }

  return "breathing";
}

function getMorningGateStage(door: MeditationDoor, elapsedSeconds: number): StructuredMorningStage {
  if (door === "energy") {
    if (elapsedSeconds < 15) return "openingFade";
    if (elapsedSeconds < 60) return "openingNarration";
    if (elapsedSeconds < 120) return "bodyAwareness";
    if (elapsedSeconds < 170) return "energy";
    if (elapsedSeconds < 178) return "integration";
    return "closing";
  }

  if (door === "vision") {
    if (elapsedSeconds < 15) return "openingFade";
    if (elapsedSeconds < 48) return "openingNarration";
    if (elapsedSeconds < 160) return "vision";
    if (elapsedSeconds < 170) return "integration";
    return "closing";
  }

  if (elapsedSeconds < 15) return "openingFade";
  if (elapsedSeconds < 30) return "openingNarration";
  if (elapsedSeconds < 98) return "breathing";
  if (elapsedSeconds < 156) return "affirmation";
  if (elapsedSeconds < 166) return "integration";
  return "closing";
}

function getStructuredMorningSpeechSettings(language: "jp" | "kr" | "en") {
  if (language === "kr") {
    return {
      lang: "ko-KR",
      rate: 0.75,
      pitch: 1,
      volume: 0.92,
      preferredNames: ["Yuna", "Sora", "Google 한국어", "Siri"]
    };
  }

  if (language === "en") {
    return {
      lang: "en-US",
      rate: 0.76,
      pitch: 1,
      volume: 0.92,
      preferredNames: ["Samantha", "Ava", "Victoria", "Google US English", "Siri"]
    };
  }

  return {
    lang: "ja-JP",
    rate: 0.69,
    pitch: 0.95,
    volume: 0.88,
    preferredNames: ["Kyoko", "Otoya", "Google 日本語", "Siri"]
  };
}

function pickStructuredMorningVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
  preferredNames: string[]
) {
  const matchingVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2))
  );

  for (const preferredName of preferredNames) {
    const matchedVoice = matchingVoices.find((voice) => voice.name.includes(preferredName));

    if (matchedVoice) {
      return matchedVoice;
    }
  }

  const localVoice = matchingVoices.find((voice) => voice.localService);

  if (localVoice) {
    return localVoice;
  }

  return matchingVoices[0];
}

function requiresMobileAudioGesture() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || "";
  const isMobileUserAgent = /iPhone|iPad|iPod|Android|Mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
  const isTouchViewport = navigator.maxTouchPoints > 0 && window.matchMedia("(max-width: 768px)").matches;

  return isMobileUserAgent || isTouchViewport;
}

export default function MeditationPage() {
  const { language } = useLanguage();
  const copy = useSiteCopy().meditationPage;
  const journeyCopy = useMemo(() => getRhythmJourneyContent(language), [language]);
  const localizedLanguage = language === "kr" || language === "en" || language === "jp" ? language : "jp";
  const affirmationCopy = affirmationGateCopy[localizedLanguage];
  const energyCopy = energyGateCopy[localizedLanguage];
  const visionCopy = visionGateCopy[localizedLanguage];
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [meditationType, setMeditationType] = useState<MeditationType>("default");
  const [meditationDoor, setMeditationDoor] = useState<MeditationDoor>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [vibrationSupported, setVibrationSupported] = useState(false);
  const [hasUserGesture, setHasUserGesture] = useState(false);
  const [ambientVideoFailed, setAmbientVideoFailed] = useState(false);
  const [showAmbientRetry, setShowAmbientRetry] = useState(false);
  const [needsUserStart, setNeedsUserStart] = useState(false);
  const [pendingStructuredAmbientStart, setPendingStructuredAmbientStart] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [requiresExplicitAudioStart, setRequiresExplicitAudioStart] = useState(false);
  const [affirmationMessage, setAffirmationMessage] = useState<string | null>(null);
  const [journeyMode, setJourneyMode] = useState(false);
  const [journeyDay, setJourneyDay] = useState<number | null>(null);
  const [returnToHref, setReturnToHref] = useState("/rhythm-journey");
  const [requestedRouteType, setRequestedRouteType] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const completionHandledRef = useRef(false);
  const spokenAffirmationKeysRef = useRef<Set<string>>(new Set());
  const structuredSpeechTimeoutRef = useRef<number | null>(null);
  const structuredSpeechSequenceRef = useRef(0);
  const structuredSpeechUnlockedRef = useRef(false);
  const isPausedRef = useRef(false);
  const isCompleteRef = useRef(false);
  const elapsedTotalSeconds = totalSeconds - secondsLeft;
  const phase = useMemo(() => getBreathPhase(elapsedTotalSeconds), [elapsedTotalSeconds]);
  const isComplete = secondsLeft <= 0;
  const isAffirmationGate = meditationType === "morning" && meditationDoor === "affirmation";
  const isEnergyGate = meditationType === "morning" && meditationDoor === "energy";
  const isVisionGate = meditationType === "morning" && meditationDoor === "vision";
  const isStructuredMorningGate = isAffirmationGate || isEnergyGate || isVisionGate;
  const structuredMorningAudio =
    isAffirmationGate
      ? MORNING_GATE_AUDIO.affirmation
      : isEnergyGate
        ? MORNING_GATE_AUDIO.energy
        : isVisionGate
          ? MORNING_GATE_AUDIO.vision
          : null;
  const morningGateCopy: StructuredMorningCopy = isVisionGate ? visionCopy : isEnergyGate ? energyCopy : affirmationCopy;
  const mappedDoor = meditationDoor === "relax" ? "rest" : meditationDoor === "vitality" ? "recharge" : meditationDoor;
  const basicPracticeCopy =
    getBasicPracticeByRouteType(requestedRouteType, localizedLanguage) ??
    getBasicPracticeBySession(meditationType, mappedDoor, localizedLanguage);
  const content = copy.variants[meditationType];
  const hideSoundToggle = meditationType === "morning";
  const durationVariant = getDurationVariant(totalSeconds);
  const durationTextSet = copy.durationTexts?.[durationVariant];
  const journeyAudioSource = journeyDay ? journeyAudioMap[journeyDay] : undefined;
  const journeyGuidance = journeyDay ? getRhythmJourneyGuidance(language, journeyDay) : undefined;
  const ambientAudioSource =
    journeyMode && journeyAudioSource
      ? journeyAudioSource
      : structuredMorningAudio
        ? structuredMorningAudio.src
        : undefined;
  const ambientAudioVolume = journeyMode ? 0.65 : structuredMorningAudio?.volume;
  const ambientNarrationDuckVolume =
    structuredMorningAudio ? Math.max(0, structuredMorningAudio.volume * MORNING_GATE_DUCK_RATIO) : undefined;
  const ambientFadeInOptions = isStructuredMorningGate ? { fadeInMs: MORNING_GATE_FADE_IN_MS } : undefined;
  const ambientResumeOptions = isStructuredMorningGate ? { fadeInMs: MORNING_GATE_FADE_IN_MS } : undefined;
  const ambientFadeOutMs = isStructuredMorningGate ? MORNING_GATE_FADE_OUT_MS : undefined;
  const journeyGuidanceStage = getJourneyGuidanceStage(elapsedTotalSeconds, totalSeconds);
  const affirmationStage = isStructuredMorningGate ? getMorningGateStage(meditationDoor, elapsedTotalSeconds) : null;
  const topText = journeyMode
    ? journeyCopy.timerTopText
    : basicPracticeCopy
      ? basicPracticeCopy.sessionTitle
    : meditationType === "morning" || meditationType === "night"
      ? content.topText
      : durationTextSet?.topText || content.topText;
  const introText = journeyMode ? journeyCopy.timerSubText : basicPracticeCopy?.sessionGuidance ?? content.intro;
  const completionTitle =
    basicPracticeCopy
      ? basicPracticeCopy.completionTitle
      : meditationType === "morning" || meditationType === "night"
      ? content.completionTitle
      : durationTextSet?.completionTitle || content.completionTitle;
  const circleScaleClass =
    phase === "inhale" ? "scale-110" : phase === "hold" ? "scale-110" : "scale-90";
  const journeyOverlayMessage =
    journeyMode && journeyGuidance
      ? journeyGuidanceStage === "opening"
        ? journeyGuidance.opening
        : journeyGuidanceStage === "closing"
          ? journeyGuidance.closing
          : null
      : null;
  const affirmationProgress = isStructuredMorningGate ? Math.min(100, (elapsedTotalSeconds / AFFIRMATION_TOTAL_SECONDS) * 100) : 0;

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const routeType = searchParams.get("type");
    const routePractice = getBasicPracticeByRouteType(routeType, localizedLanguage);
    const nextDuration = normalizeDuration(searchParams.get("duration"));
    const nextType = routePractice?.meditationType ?? normalizeMeditationType(routeType);
    const nextDoor = routePractice?.meditationDoor ?? normalizeDoor(searchParams.get("door"));
    const nextJourneyMode = searchParams.get("journey") === "1";
    const nextJourneyDay = Number(searchParams.get("day"));
    const nextReturnTo = searchParams.get("returnTo");
    const pendingJourneyAudio =
      typeof window === "undefined" ? null : window.sessionStorage.getItem(JOURNEY_AUDIO_PENDING_KEY);
    const pendingStructuredAmbientAudio =
      typeof window === "undefined" ? null : window.sessionStorage.getItem(STRUCTURED_AMBIENT_PENDING_KEY);
    const storedJourneyDay =
      typeof window === "undefined" ? null : window.sessionStorage.getItem(JOURNEY_AUDIO_DAY_KEY);
    const resolvedJourneyDay = Number.isInteger(nextJourneyDay) && nextJourneyDay >= 1 && nextJourneyDay <= 7
      ? nextJourneyDay
      : Number(storedJourneyDay);

    const isThreeMinuteMorningDoor =
      nextType === "morning" &&
      (nextDoor === "affirmation" || nextDoor === "energy" || nextDoor === "vision");
    const shouldResumeStructuredAmbient = nextType === "morning" && nextDoor === "affirmation" && pendingStructuredAmbientAudio === "1";
    const mobileNeedsGesture = requiresMobileAudioGesture();
    const isProgramMode = nextJourneyMode || nextType !== "default";

    const resolvedDuration = routePractice?.durationSeconds ?? (isThreeMinuteMorningDoor ? AFFIRMATION_TOTAL_SECONDS : nextDuration);
    setTotalSeconds(resolvedDuration);
    setSecondsLeft(resolvedDuration);
    setMeditationType(nextType);
    setMeditationDoor(nextDoor);
    setRequestedRouteType(routeType);
    const nextSoundEnabled =
      nextJourneyMode && pendingJourneyAudio
        ? true
        : shouldResumeStructuredAmbient
          ? true
          : getNatureSoundPreference();
    const shouldPromptForAudioStart = isThreeMinuteMorningDoor || (mobileNeedsGesture && (isProgramMode || nextSoundEnabled));
    setSoundEnabled(nextSoundEnabled);
    setPendingStructuredAmbientStart(shouldResumeStructuredAmbient);
    setJourneyMode(nextJourneyMode);
    setJourneyDay(Number.isInteger(resolvedJourneyDay) && resolvedJourneyDay >= 1 && resolvedJourneyDay <= 7 ? resolvedJourneyDay : null);
    setReturnToHref(nextReturnTo || "/rhythm-journey");
    setAmbientVideoFailed(false);
    setShowAmbientRetry(false);
    setNeedsUserStart(shouldPromptForAudioStart);
    setRequiresExplicitAudioStart(shouldPromptForAudioStart);
    setHasUserGesture(!shouldPromptForAudioStart);
    setIsPaused(mobileNeedsGesture && isProgramMode);
    setAffirmationMessage(null);
    spokenAffirmationKeysRef.current = new Set();
    completionHandledRef.current = false;
    console.log("[Journey Audio] journeyMode:", nextJourneyMode);
    console.log("[Journey Audio] journeyDay:", resolvedJourneyDay);
    console.log(
      "[Journey Audio] src:",
      Number.isInteger(resolvedJourneyDay) && resolvedJourneyDay >= 1 && resolvedJourneyDay <= 7
        ? journeyAudioMap[resolvedJourneyDay]
        : undefined
    );
    console.log("[Journey Audio] pending:", pendingJourneyAudio);
    console.log("[Journey Audio] audio element:", ambientAudioRef.current);
  }, [localizedLanguage]);

  async function handleAmbientStartResult(result: { started: boolean; error?: unknown }, manual = false) {
    if (journeyMode && journeyDay) {
      console.log("[Journey Audio] journeyMode:", journeyMode);
      console.log("[Journey Audio] journeyDay:", journeyDay);
      console.log("[Journey Audio] src:", ambientAudioSource);
      console.log(
        "[Journey Audio] pending:",
        typeof window === "undefined" ? null : window.sessionStorage.getItem(JOURNEY_AUDIO_PENDING_KEY)
      );
      console.log("[Journey Audio] audio element:", ambientAudioRef.current);
    }

    if (result.started) {
      if (journeyMode) {
        console.log("[Journey Audio] play started");
      }

      setShowAmbientRetry(false);
      setNeedsUserStart(false);
      setRequiresExplicitAudioStart(false);
      setIsPaused(false);
      setSoundEnabled(true);
      setNatureSoundPreference(true);
      setPendingStructuredAmbientStart(false);

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(JOURNEY_AUDIO_PENDING_KEY);
        window.sessionStorage.removeItem(JOURNEY_AUDIO_DAY_KEY);
        window.sessionStorage.removeItem(STRUCTURED_AMBIENT_PENDING_KEY);
      }

      return;
    }

    if (journeyMode) {
      setSoundEnabled(false);
      setNatureSoundPreference(false);
      setNeedsUserStart(true);
      setIsPaused(true);
      console.warn("[Journey Audio] play failed");
      if (result.error) {
        console.error(`[Journey Audio] ${manual ? "manual start" : "autoplay"} failed:`, result.error);
      }

      if (typeof window !== "undefined") {
        console.warn("[Journey Audio] exact pending state kept for manual retry");
      }
    } else if (isStructuredMorningGate) {
      setNeedsUserStart(true);
      setIsPaused(true);
      setShowAmbientRetry(false);
      setPendingStructuredAmbientStart(false);
      if (result.error) {
        console.error("[Morning Gate Audio] autoplay failed:", result.error);
      }
    } else {
      setShowAmbientRetry(true);
    }
  }

  async function handleJourneyAudioStart() {
    if (!journeyMode || !ambientAudioSource) {
      return;
    }

    setHasUserGesture(true);
    setRequiresExplicitAudioStart(false);

    if (audioContextRef.current?.state === "suspended") {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.warn("[journey-audio] failed to resume audio context", error);
      }
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.getVoices();
      } catch (error) {
        console.warn("[journey-audio] speech synthesis unavailable during unlock", error);
      }
    }

    const result = await startAmbientNatureAudio(
      ambientAudioRef,
      true,
      ambientAudioSource,
      ambientAudioVolume,
      ambientFadeInOptions
    );
    await handleAmbientStartResult(result, true);
  }

  function unlockStructuredMorningSpeech() {
    if (!isStructuredMorningGate || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      const synth = window.speechSynthesis;
      const settings = getStructuredMorningSpeechSettings(language);
      synth.getVoices();

      if (structuredSpeechUnlockedRef.current) {
        return;
      }

      const unlockUtterance = new SpeechSynthesisUtterance("\u00A0");
      unlockUtterance.lang = settings.lang;
      unlockUtterance.volume = 0;
      unlockUtterance.rate = settings.rate;
      unlockUtterance.pitch = settings.pitch;
      structuredSpeechUnlockedRef.current = true;
      synth.cancel();
      synth.speak(unlockUtterance);
    } catch (error) {
      console.warn("[morning-gate] failed to unlock speech synthesis", error);
    }
  }

  useEffect(() => {
    setVibrationSupported(supportsMeditationVibration());

    const markGesture = () => {
      setHasUserGesture(true);

      if (requiresExplicitAudioStart) {
        return;
      }

      if (!isComplete && soundEnabled && !journeyMode && !isStructuredMorningGate) {
        startAmbientNatureAudio(
          ambientAudioRef,
          soundEnabled,
          ambientAudioSource,
          ambientAudioVolume,
          ambientFadeInOptions
        ).then((result) => {
          void handleAmbientStartResult(result);
        });
      }
    };

    window.addEventListener("pointerdown", markGesture, { once: true });
    window.addEventListener("keydown", markGesture, { once: true });

    return () => {
      window.removeEventListener("pointerdown", markGesture);
      window.removeEventListener("keydown", markGesture);
      stopAmbientNatureAudio(ambientAudioRef, ambientFadeOutMs);
    };
  }, [ambientAudioSource, ambientAudioVolume, isComplete, isStructuredMorningGate, journeyMode, requiresExplicitAudioStart, soundEnabled]);

  useEffect(() => {
    if (secondsLeft <= 0 || isPaused || needsUserStart) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isPaused, needsUserStart, secondsLeft]);

  useEffect(() => {
    if (!isStructuredMorningGate || !soundEnabled) {
      return;
    }

    if (isPaused) {
      pauseAmbientNatureAudio(ambientAudioRef);
      return;
    }

    if (!hasUserGesture || isComplete) {
      return;
    }

    resumeAmbientNatureAudio(ambientAudioRef, true, ambientAudioVolume, ambientResumeOptions).then((result) => {
      if (!result.started && ambientAudioSource) {
        startAmbientNatureAudio(
          ambientAudioRef,
          true,
          ambientAudioSource,
          ambientAudioVolume,
          ambientFadeInOptions
        ).then((startResult) => {
          void handleAmbientStartResult(startResult, true);
        });
      }
    });
  }, [ambientAudioSource, ambientAudioVolume, hasUserGesture, isComplete, isPaused, isStructuredMorningGate, soundEnabled]);

  useEffect(() => {
    if (isComplete || !soundEnabled) {
      stopAmbientNatureAudio(ambientAudioRef, ambientFadeOutMs);
      return;
    }

    if (!hasUserGesture || journeyMode || isStructuredMorningGate) {
      return;
    }

    startAmbientNatureAudio(
      ambientAudioRef,
      soundEnabled,
      ambientAudioSource,
      ambientAudioVolume,
      ambientFadeInOptions
    ).then((result) => {
      void handleAmbientStartResult(result);
    });

    return () => {
      if (isComplete) {
        stopAmbientNatureAudio(ambientAudioRef, ambientFadeOutMs);
      }
    };
  }, [ambientAudioSource, ambientAudioVolume, hasUserGesture, isComplete, isStructuredMorningGate, journeyMode, soundEnabled]);

  useEffect(() => {
    if (!pendingStructuredAmbientStart || !isAffirmationGate || !ambientAudioSource || isComplete || requiresExplicitAudioStart) {
      return;
    }

    startAmbientNatureAudio(
      ambientAudioRef,
      true,
      ambientAudioSource,
      ambientAudioVolume,
      ambientFadeInOptions
    ).then((result) => {
      void handleAmbientStartResult(result);
    });
  }, [ambientAudioSource, ambientAudioVolume, isAffirmationGate, isComplete, pendingStructuredAmbientStart, requiresExplicitAudioStart]);

  useEffect(() => {
    if (!journeyMode || !ambientAudioSource || !soundEnabled || isComplete || requiresExplicitAudioStart) {
      return;
    }

    startAmbientNatureAudio(
      ambientAudioRef,
      true,
      ambientAudioSource,
      ambientAudioVolume,
      ambientFadeInOptions
    ).then((result) => {
      void handleAmbientStartResult(result);
    });
  }, [ambientAudioSource, ambientAudioVolume, isComplete, journeyMode, requiresExplicitAudioStart, soundEnabled]);

  useEffect(() => {
    if (!isComplete || completionHandledRef.current) {
      return;
    }

    completionHandledRef.current = true;
    runMeditationComplete();
  }, [isComplete, hasUserGesture, soundEnabled, vibrationEnabled]);

  useEffect(() => {
    if (!isStructuredMorningGate || isComplete || isPaused || typeof window === "undefined") {
      return;
    }

    const allLines = [
      ...morningGateCopy.openingLines,
      ...(morningGateCopy.awarenessLines ?? []),
      ...(morningGateCopy.affirmationLines ?? []),
      ...(morningGateCopy.energyLines ?? []),
      ...(morningGateCopy.visionLines ?? []),
      ...morningGateCopy.closingLines
    ];
    const nextLine = allLines.find(
      (line) => elapsedTotalSeconds >= line.at && !spokenAffirmationKeysRef.current.has(line.key)
    );

    if (!nextLine) {
      return;
    }

    spokenAffirmationKeysRef.current.add(nextLine.key);
    setAffirmationMessage(nextLine.text);

    if ("speechSynthesis" in window) {
      try {
        const settings = getStructuredMorningSpeechSettings(language);
        const synth = window.speechSynthesis;
        structuredSpeechSequenceRef.current += 1;
        const speechSequence = structuredSpeechSequenceRef.current;

        if (structuredSpeechTimeoutRef.current) {
          window.clearTimeout(structuredSpeechTimeoutRef.current);
          structuredSpeechTimeoutRef.current = null;
        }

        const isFirstStructuredLine = spokenAffirmationKeysRef.current.size === 1;
        const speechDelayMs = isFirstStructuredLine ? 520 : 320;

        const queueSpeak = (attempt: number) => {
          if (
            structuredSpeechSequenceRef.current !== speechSequence ||
            isPausedRef.current ||
            isCompleteRef.current
          ) {
            return;
          }

          if (synth.speaking || synth.pending) {
            if (attempt >= 12) {
              synth.cancel();
            } else {
              structuredSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(attempt + 1), 140);
              return;
            }
          }

          const utterance = new SpeechSynthesisUtterance(nextLine.text);
          utterance.lang = settings.lang;
          utterance.rate = settings.rate;
          utterance.pitch = settings.pitch;
          utterance.volume = settings.volume;

          const selectedVoice = pickStructuredMorningVoice(
            synth.getVoices(),
            settings.lang,
            settings.preferredNames
          );

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }

          utterance.onstart = () => {
            if (ambientNarrationDuckVolume !== undefined) {
              void setAmbientNatureAudioVolume(ambientAudioRef, ambientNarrationDuckVolume, 320);
            }
            console.log("[structured-meditation][tts] started", language, nextLine.key);
          };
          utterance.onerror = (event) => {
            if (ambientAudioVolume !== undefined) {
              void setAmbientNatureAudioVolume(ambientAudioRef, ambientAudioVolume, 780);
            }
            console.error("[structured-meditation][tts] failed", language, nextLine.key, event.error);
            structuredSpeechTimeoutRef.current = null;
          };
          utterance.onend = () => {
            if (ambientAudioVolume !== undefined) {
              void setAmbientNatureAudioVolume(ambientAudioRef, ambientAudioVolume, 780);
            }
            structuredSpeechTimeoutRef.current = null;
          };

          synth.speak(utterance);
        };

        structuredSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(0), speechDelayMs);
      } catch (error) {
        console.warn("[affirmation-gate] speech synthesis unavailable", error);
      }
    }
  }, [
    ambientAudioVolume,
    ambientNarrationDuckVolume,
    elapsedTotalSeconds,
    isComplete,
    isPaused,
    isStructuredMorningGate,
    language,
    morningGateCopy
  ]);

  useEffect(() => {
    if (!isStructuredMorningGate || typeof window === "undefined") {
      return;
    }

    if (affirmationStage === "openingFade") {
      setAffirmationMessage(morningGateCopy.openingFade);
      return;
    }

    if (isAffirmationGate && (affirmationStage === "breathing" || affirmationStage === "bodyAwareness")) {
      setAffirmationMessage(phase === "inhale" ? morningGateCopy.inhale : morningGateCopy.exhale);
      return;
    }

    if (affirmationStage === "integration") {
      setAffirmationMessage(morningGateCopy.integration);
    }
  }, [affirmationStage, isStructuredMorningGate, morningGateCopy, phase]);

  useEffect(() => {
    return () => {
      if (structuredSpeechTimeoutRef.current) {
        window.clearTimeout(structuredSpeechTimeoutRef.current);
        structuredSpeechTimeoutRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        structuredSpeechSequenceRef.current += 1;
        window.speechSynthesis.cancel();
      }
      if (ambientAudioVolume !== undefined) {
        void setAmbientNatureAudioVolume(ambientAudioRef, ambientAudioVolume, 220);
      }
    };
  }, [ambientAudioVolume]);

  async function runMeditationComplete() {
    await stopAmbientNatureAudio(ambientAudioRef, ambientFadeOutMs);
    await triggerMeditationCompletion({
      hasUserGesture,
      soundEnabled,
      vibrationEnabled,
      audioContextRef
    });
  }

  async function handleSoundToggle() {
    setHasUserGesture(true);
    const next = !soundEnabled;

    if (next) {
      const result = await startAmbientNatureAudio(
        ambientAudioRef,
        true,
        ambientAudioSource,
        ambientAudioVolume,
        ambientFadeInOptions
      );
      await handleAmbientStartResult(result, true);
    } else {
      setSoundEnabled(false);
      setNatureSoundPreference(false);
      setShowAmbientRetry(false);
      setNeedsUserStart(false);
      stopAmbientNatureAudio(ambientAudioRef, ambientFadeOutMs);
    }
  }

  function handleVibrationToggle() {
    setHasUserGesture(true);
    setVibrationEnabled((current) => !current);
  }

  async function handleAmbientRetry() {
    setHasUserGesture(true);
    const result = await startAmbientNatureAudio(
      ambientAudioRef,
      soundEnabled,
      ambientAudioSource,
      ambientAudioVolume,
      ambientFadeInOptions
    );
    await handleAmbientStartResult(result, true);
  }

  async function handleProgramAudioStart() {
    setHasUserGesture(true);
    setRequiresExplicitAudioStart(false);
    unlockStructuredMorningSpeech();

    if (audioContextRef.current?.state === "suspended") {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.warn("[meditation] failed to resume audio context", error);
      }
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.getVoices();
      } catch (error) {
        console.warn("[meditation] speech synthesis unavailable during unlock", error);
      }
    }

    if (!soundEnabled && !isStructuredMorningGate) {
      setNeedsUserStart(false);
      setIsPaused(false);
      return;
    }

    if (isStructuredMorningGate && !soundEnabled) {
      setSoundEnabled(true);
    }

    const result = await startAmbientNatureAudio(
      ambientAudioRef,
      true,
      ambientAudioSource,
      ambientAudioVolume,
      ambientFadeInOptions
    );
    await handleAmbientStartResult(result, true);

    if (result.started) {
      setNeedsUserStart(false);
      setIsPaused(false);
      return;
    }

    setNeedsUserStart(true);
  }

  function handlePauseToggle() {
    setHasUserGesture(true);
    setIsPaused((current) => {
      const next = !current;

      if (next && typeof window !== "undefined" && "speechSynthesis" in window) {
        if (structuredSpeechTimeoutRef.current) {
          window.clearTimeout(structuredSpeechTimeoutRef.current);
          structuredSpeechTimeoutRef.current = null;
        }
        structuredSpeechSequenceRef.current += 1;
        window.speechSynthesis.cancel();
        if (ambientAudioVolume !== undefined) {
          void setAmbientNatureAudioVolume(ambientAudioRef, ambientAudioVolume, 220);
        }
      }

      return next;
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(216,191,131,0.12),transparent_20%),linear-gradient(180deg,#07111f_0%,#0d1b2d_45%,#10273a_100%)] px-6 py-10 text-white">
      <div className="relative flex min-h-[480px] w-full max-w-3xl flex-col items-center overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] px-6 py-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:px-8 sm:py-10">
        {!ambientVideoFailed && !isStructuredMorningGate ? (
          <video
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-85"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/quiet-meditation.jpg"
            onLoadedData={() => console.log("Meditation video loaded")}
            onError={() => setAmbientVideoFailed(true)}
          >
            <source src="/videos/one-minute-nature-loop.mp4" type="video/mp4" />
          </video>
        ) : !ambientVideoFailed && isEnergyGate ? (
          <video
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-[0.58]"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={() => console.log("Energy Gate video loaded")}
            onError={() => setAmbientVideoFailed(true)}
          >
            <source src={ENERGY_GATE_VIDEO_SRC} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(216,191,131,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(79,122,101,0.14),transparent_34%),linear-gradient(180deg,rgba(4,10,19,0.76)_0%,rgba(8,18,32,0.88)_100%)]" />
        )}
        {isStructuredMorningGate ? (
          <>
            <div
              className={`absolute inset-0 z-0 ${
                isEnergyGate
                  ? "bg-[radial-gradient(circle_at_top,rgba(216,191,131,0.12),transparent_22%),radial-gradient(circle_at_bottom,rgba(127,255,212,0.10),transparent_34%),linear-gradient(180deg,rgba(10,26,38,0.52)_0%,rgba(8,20,31,0.64)_48%,rgba(7,16,25,0.82)_100%)]"
                  : "bg-[radial-gradient(circle_at_top,rgba(244,220,160,0.16),transparent_24%),radial-gradient(circle_at_bottom,rgba(125,162,108,0.12),transparent_34%),linear-gradient(180deg,rgba(34,42,72,0.92)_0%,rgba(18,29,48,0.92)_48%,rgba(12,22,37,0.96)_100%)]"
              }`}
            />
            <div className="absolute left-[8%] top-[10%] z-0 h-48 w-48 rounded-full bg-gold/10 blur-[80px]" />
            <div className="absolute right-[10%] top-[14%] z-0 h-44 w-44 rounded-full bg-emerald-200/[0.08] blur-[90px]" />
          </>
        ) : null}
        <div className={`absolute inset-0 z-10 ${isStructuredMorningGate ? "bg-[linear-gradient(180deg,rgba(4,10,19,0.18),rgba(4,10,19,0.36))]" : "bg-black/25"}`} />

        <div className="relative z-20 flex w-full flex-col items-center text-center">
        {!isComplete ? (
          <>
            {isStructuredMorningGate ? (
              <div className="w-full max-w-xl space-y-4">
                <p className="text-xs uppercase tracking-[0.28em] text-gold/74">{morningGateCopy.audioLabel}</p>
                <h1 className="font-serif text-3xl text-white sm:text-4xl">{morningGateCopy.title}</h1>
                <p className="text-sm leading-7 text-white/68">{morningGateCopy.subtitle}</p>
                <div className="mx-auto mt-4 h-[6px] w-full max-w-md overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gold/80 transition-[width] duration-700"
                    style={{ width: `${affirmationProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-center gap-3 text-sm text-white/54">
                  <span>{morningGateCopy.duration}</span>
                  <span className="h-1 w-1 rounded-full bg-white/24" />
                  <button
                    type="button"
                    onClick={handlePauseToggle}
                    className="button-nowrap inline-flex min-h-[34px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/72 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {isPaused ? morningGateCopy.resume : morningGateCopy.pause}
                  </button>
                </div>
              </div>
            ) : journeyMode ? (
              <div className="flex min-h-[112px] w-full items-center justify-center">
                {journeyOverlayMessage ? (
                  <div
                    key={`${journeyDay}-${journeyGuidanceStage}`}
                    className="animate-fade-in space-y-3 transition-opacity duration-300"
                  >
                    <p className="keep-phrase text-xs uppercase tracking-[0.28em] text-gold/72">{topText}</p>
                    <p className="body-measure word-balance keep-phrase mx-auto whitespace-pre-line text-center text-xl leading-[1.9] text-white/92 sm:text-2xl">
                      {journeyOverlayMessage}
                    </p>
                  </div>
                ) : (
                  <div
                    key={`${journeyDay}-${journeyGuidanceStage}`}
                    className="animate-fade-in space-y-3 transition-opacity duration-300"
                  >
                    <p className="keep-phrase text-xs uppercase tracking-[0.28em] text-gold/72">{topText}</p>
                    <p className="body-measure keep-phrase mx-auto text-center text-sm leading-7 text-white/62 sm:text-base">
                      {introText}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {basicPracticeCopy ? (
                  <div className="mx-auto max-w-xl space-y-3 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.24em] text-gold/74">
                      {basicPracticeCopy.title} · {Math.floor(totalSeconds / 60)} min
                    </p>
                    <h1 className="font-serif text-3xl text-white sm:text-4xl">{basicPracticeCopy.sessionTitle}</h1>
                    <p className="text-sm leading-7 text-white/70">{basicPracticeCopy.sessionSubtitle}</p>
                    <p className="text-sm leading-7 text-white/56">“{basicPracticeCopy.state}”</p>
                  </div>
                ) : null}
                <p className="keep-phrase text-sm uppercase tracking-[0.32em] text-gold/80">{topText}</p>
                <p className="body-measure keep-phrase mx-auto text-sm leading-7 text-white/60 sm:text-base">{introText}</p>
              </div>
            )}

            <div className="mt-12 flex min-h-[320px] w-full flex-col items-center justify-center">
              {(journeyMode || meditationType !== "default") && needsUserStart ? (
                <div className="mb-6 w-full max-w-md rounded-[24px] border border-[rgba(212,178,106,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-5 text-center shadow-[0_18px_50px_rgba(4,12,24,0.18)]">
                  <p className="text-sm leading-7 text-white/76">{journeyMode ? journeyCopy.audioPrompt : copy.audioPrompt}</p>
                  <button
                    type="button"
                    onClick={journeyMode ? handleJourneyAudioStart : handleProgramAudioStart}
                    className="button-nowrap mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition hover:bg-gold/15 hover:text-[#f5e4b5]"
                  >
                    {journeyMode
                      ? journeyCopy.audioStart
                      : isStructuredMorningGate
                        ? morningGateCopy.startAudio
                        : basicPracticeCopy?.entryLabel ?? copy.audioStart}
                  </button>
                </div>
              ) : null}

              <div className="mb-6 flex items-center gap-2">
                {vibrationSupported ? (
                  <button
                    type="button"
                    onClick={handleVibrationToggle}
                    className="button-nowrap inline-flex min-h-[36px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                    aria-pressed={vibrationEnabled}
                  >
                    {vibrationEnabled ? copy.vibrationOn : copy.vibrationOff}
                  </button>
                ) : null}
                {!hideSoundToggle ? (
                  <button
                    type="button"
                    onClick={handleSoundToggle}
                    className="button-nowrap inline-flex min-h-[36px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                    aria-pressed={soundEnabled}
                  >
                    {soundEnabled ? `🔊 ${journeyMode ? journeyCopy.audioOn : copy.soundOn}` : `🔊 ${journeyMode ? journeyCopy.audioOff : copy.soundOff}`}
                  </button>
                ) : null}
                {journeyMode && !needsUserStart && showAmbientRetry ? (
                  <button
                    type="button"
                    onClick={handleJourneyAudioStart}
                    className="button-nowrap inline-flex min-h-[36px] items-center justify-center rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold transition hover:bg-gold/15 hover:text-[#f5e4b5]"
                  >
                    {journeyCopy.audioStart}
                  </button>
                ) : null}
                {showAmbientRetry && soundEnabled ? (
                  <button
                    type="button"
                    onClick={handleAmbientRetry}
                    className="button-nowrap inline-flex min-h-[36px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {copy.natureLabel}
                  </button>
                ) : null}
              </div>
              {!isStructuredMorningGate ? (
                <p className="text-2xl font-medium text-white/72 transition-all duration-300 ease-out sm:text-3xl">
                  {copy.phases[phase]}
                </p>
              ) : null}

              <div className="relative mt-10 flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72">
                <div className="absolute inset-0 rounded-full bg-gold/10 blur-3xl" />
                <div
                  className={`absolute inset-6 rounded-full border border-gold/35 bg-gold/10 transition-transform duration-[4000] ease-in-out ${circleScaleClass}`}
                />
                <div
                  className={`absolute inset-0 rounded-full border border-white/10 bg-white/[0.03] transition-transform duration-[4000] ease-in-out ${circleScaleClass}`}
                />
                <div className="relative z-10 text-center">
                  <p className="text-5xl font-serif text-white/88 sm:text-6xl">{formatRemainingTime(secondsLeft)}</p>
                </div>
              </div>

              {isStructuredMorningGate ? (
                <div className="mt-8 min-h-[92px] max-w-xl space-y-3">
                  <p className="mx-auto whitespace-pre-line font-serif text-2xl leading-[1.8] text-white/90 sm:text-[32px] sm:leading-[1.9]">
                    {affirmationMessage}
                  </p>
                </div>
              ) : null}
            </div>

            {!isStructuredMorningGate ? (
              <div className="mt-8">
                <p className="text-sm font-medium tracking-[0.18em] text-white/68 transition-opacity duration-300 sm:text-base">
                  {copy.bottomText[phase]}
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="animate-fade-in space-y-8">
            <h1 className="font-serif text-4xl text-white sm:text-5xl">
              {isStructuredMorningGate ? morningGateCopy.completionTitle : completionTitle}
            </h1>
            <p className="mx-auto max-w-xl whitespace-pre-line text-base leading-8 text-white/72">
              {isStructuredMorningGate ? morningGateCopy.completionMessage : copy.completionMessage}
            </p>
            <p className="text-sm leading-7 text-white/54">
              {isStructuredMorningGate ? morningGateCopy.completionNote : copy.completionReturnText}
            </p>
            {!journeyMode && !isStructuredMorningGate ? <p className="mx-auto max-w-2xl text-base leading-8 text-white/68">{copy.completionBody}</p> : null}
            <div className="flex flex-col items-center gap-3">
              <Link
                href={returnToHref}
                className="inline-flex min-h-[56px] min-w-[240px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
              >
                {isStructuredMorningGate ? morningGateCopy.completionButton : journeyMode ? journeyCopy.nextCta : copy.completionPrimary}
              </Link>
              {!journeyMode && !isStructuredMorningGate ? (
                <Link
                  href="/"
                  className="inline-flex min-h-[52px] min-w-[240px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
                >
                  {copy.completionSecondary}
                </Link>
              ) : null}
            </div>
            {!journeyMode && !isStructuredMorningGate ? (
              <div className="mx-auto max-w-2xl border-t border-white/10 pt-8">
                <p className="text-base leading-8 text-white/68">{copy.coachPrompt}</p>
                <div className="mt-5">
                  <a
                    href={AI_COACH_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[52px] min-w-[220px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
                  >
                    {copy.coachButton}
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
