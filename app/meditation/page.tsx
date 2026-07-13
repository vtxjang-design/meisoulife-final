"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { useAuthState } from "@/components/auth-provider";
import { MembershipAccessStateView, useMembershipAccess } from "@/components/membership-guard";
import { useLanguage, useSiteCopy } from "@/lib/i18n";
import {
  getNatureSoundPreference,
  pauseAmbientNatureAudio,
  resumeAmbientNatureAudio,
  setNatureSoundPreference,
  startAmbientNatureAudio,
  STRUCTURED_AMBIENT_PENDING_KEY,
  stopAmbientNatureAudio
} from "@/lib/meditation-ambient-audio";
import { handleMeditationComplete as triggerMeditationCompletion, supportsMeditationVibration } from "@/lib/meditation-completion";
import { getRhythmJourneyContent, journeyAudioMap } from "@/lib/rhythm-journey";
import { getBasicPracticeByRouteType, getBasicPracticeBySession } from "@/lib/basic-rhythm";
import { resolveMeditationRequiredPlan } from "@/lib/membership-access";
import {
  safeLocalStorageGet,
  safeLocalStorageSet,
  safeSessionStorageGet,
  safeSessionStorageRemove
} from "@/lib/safe-browser-storage";

const CYCLE_SECONDS = 10;
const INHALE_SECONDS = 4;
const HOLD_SECONDS = 2;
const AI_COACH_URL =
  process.env.NEXT_PUBLIC_AI_COACH_URL ||
  "https://chatgpt.com/g/g-69f968bc9a408191a3e5f943912666c0-quiet-rhythm-guide";
const JOURNEY_AUDIO_PENDING_KEY = "meisoulife_journey_audio_pending";
const JOURNEY_AUDIO_DAY_KEY = "meisoulife_journey_day";
const JOURNEY_OVERVIEW_IMAGE_SRC = "/7day-recovery/7day-recovery-overview.png";
const AFFIRMATION_TOTAL_SECONDS = 180;
const JOURNEY_SETTLING_MS = 2000;
const MORNING_GATE_FADE_IN_MS = 2000;
const MORNING_GATE_FADE_OUT_MS = 3000;
const MORNING_GATE_NARRATION_VOLUME = 0.9;
const VISION_GATE_SPEECH_RATE_RATIO = 0.9;
const MORNING_GATE_AUDIO = {
  energy: {
    src: "/audio/morning/energy%20gate.mp3",
    volume: 0.14
  }
} as const;
const AWAKENING_GATE_VIDEO_SRC = "/video/morning-gate/awakening-gate-1.mp4";
const ENERGY_GATE_VIDEO_SRC = "/basic/morning%20gate/energy%20gate8.mp4";
const VISION_GATE_VIDEO_SRC = "/basic/morning-gate/vision-gate-7.mp4";
const FOCUS_GATE_VIDEO_SRC = "/one-minute-reset/basic/daytime/focus-gate.mp4";
const CALM_GATE_VIDEO_SRC = "/one-minute-reset/basic/daytime/calm-gate.mp4";
const RECHARGE_GATE_VIDEO_SRC = "/basic/daytime-gate/recharge-gate8.mp4";
const RECHARGE_GATE_GUIDE_IMAGE_SRC = "/basic/daytime-gate/recharge%20gate.png";
const EVENING_RELEASE_VIDEO_SRC = "/evening-gate/evening%20gate1.mp4";
const EVENING_GRATITUDE_VIDEO_SRC = "/basic/evening-gate/Gratitude%20Gate1.mp4";
const EVENING_SLEEP_VIDEO_SRC = "/basic/evening-gate/sleep%20gate1.mp4";
const AWAKENING_GATE_VIDEO_VOLUME = 0.13;
const VISION_GATE_VIDEO_VOLUME = 0.14;
const FOCUS_GATE_VIDEO_VOLUME = 0.34;
const CALM_GATE_VIDEO_VOLUME = 0.35;
const RECHARGE_GATE_VIDEO_VOLUME = 1;
const EVENING_RELEASE_VIDEO_VOLUME = 0.65;
const EVENING_GRATITUDE_VIDEO_VOLUME = 0.65;
const EVENING_SLEEP_VIDEO_VOLUME = 0.65;
const AWAKENING_RITUAL_STORAGE_KEY = "meisoulife_awakening_gate_ritual";
const FOCUS_GATE_TOTAL_SECONDS = 60;
const rechargeCompletionCopy = {
  kr: {
    title: "Recharge Complete",
    body: "몸과 뇌의 에너지가 다시 깨어났습니다.\n\n오늘도 리듬을 이어가세요.",
    button: "Continue"
  },
  jp: {
    title: "Recharge Complete",
    body: "身体と脳のエネルギーが回復しました。\n\n今日もあなたらしいリズムで過ごしましょう。",
    button: "Continue"
  },
  en: {
    title: "Recharge Complete",
    body: "Your body and brain have been recharged.\n\nCarry your natural rhythm into the rest of your day.",
    button: "Continue"
  }
} as const;

const rechargeIntroCopy = {
  kr: {
    title: "Recharge Gate",
    subtitle: "몸을 충전하고 활력을 되찾는 1분",
    state: "\"에너지가 낮다\"",
    body: "당신이 하고 싶은 1분 운동을 하나 선택하여 1분간 실시합니다."
  },
  jp: {
    title: "Recharge Gate",
    subtitle: "疲れから活力へ",
    state: "「エネルギーが下がっている」",
    body: "あなたがやりたい1分運動を一つ選び、1分間行います。"
  },
  en: {
    title: "Recharge Gate",
    subtitle: "From Fatigue to Vitality",
    state: "\"My energy feels low.\"",
    body: "Choose one one-minute exercise you want to do and practice it for one minute."
  }
} as const;

type RechargeExerciseKey = "heelRaise" | "squat" | "rhythmWalking" | "openChest" | "smileBreathe";

const rechargeExerciseOptions: Record<
  "kr" | "jp" | "en",
  { sectionTitle: string; selectedLabel: string; items: readonly { key: RechargeExerciseKey; label: string }[] }
> = {
  kr: {
    sectionTitle: "오늘의 1분 운동",
    selectedLabel: "오늘의 운동",
    items: [
      { key: "heelRaise", label: "발뒤꿈치 들어 올리기" },
      { key: "squat", label: "스쿼트" },
      { key: "rhythmWalking", label: "리듬 워킹" },
      { key: "openChest", label: "가슴 열기" },
      { key: "smileBreathe", label: "웃음과 호흡" }
    ]
  },
  jp: {
    sectionTitle: "今日の1分運動",
    selectedLabel: "今日の運動",
    items: [
      { key: "heelRaise", label: "かかとを上げる" },
      { key: "squat", label: "スクワット" },
      { key: "rhythmWalking", label: "リズムウォーキング" },
      { key: "openChest", label: "胸を開く" },
      { key: "smileBreathe", label: "笑顔と呼吸" }
    ]
  },
  en: {
    sectionTitle: "Today’s 1-Minute Exercise",
    selectedLabel: "Today’s Exercise",
    items: [
      { key: "heelRaise", label: "Heel Raise" },
      { key: "squat", label: "Squat" },
      { key: "rhythmWalking", label: "Rhythm Walking" },
      { key: "openChest", label: "Open Chest" },
      { key: "smileBreathe", label: "Smile & Breathe" }
    ]
  }
} as const;

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

type StructuredMorningLine = { at: number; key: string; text: string; speechText?: string; speechDelayMs?: number };
type GuidedFocusLine = { at: number; key: string; text: string; speechText?: string; speechDelayMs?: number };
type GuidedCalmLine = { at: number; key: string; text: string; speechText?: string; speechDelayMs?: number };
type AwakeningRitualState = {
  streakCount: number;
  completedOn: string;
};

type ResolvedMeditationRoute = {
  routeType: string | null;
  meditationType: MeditationType;
  meditationDoor: MeditationDoor;
  durationSeconds: number;
  journeyMode: boolean;
  journeyDay: number | null;
  returnToHref: string;
  routeInvalid: boolean;
};

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

type MorningAmbientMixState = {
  context: AudioContext | null;
  gainNode: GainNode | null;
  sourceNode: AudioBufferSourceNode | null;
  audioBuffer: AudioBuffer | null;
  sourceUrl: string | null;
  loadPromise: Promise<AudioBuffer> | null;
  startedAt: number;
  offset: number;
  targetVolume: number;
  fadeToken: number;
};

const awakeningRitualCopy = {
  jp: {
    completionMessage: "今日も、\nあなたのリズムが始まりました。",
    rhythmLabel: "今日の小さなリズム",
    continuity: (day: number) => `${day}日目。\nあなたの朝のリズムが続いています。`,
    prompts: [
      "少しだけ、\n空を見上げてみましょう。",
      "今日は一度、\nゆっくり歩いてみましょう。",
      "誰かに、\nやさしい言葉をひとつ届けましょう。",
      "深呼吸をひとつしてから、\n次の行動を始めましょう。",
      "朝の光を、\n少しだけ感じてみましょう。"
    ],
    continueCta: "Energy Gateへ進む",
    returnCta: "Morning Gateへ戻る",
    finishCta: "今日はここまで"
  },
  kr: {
    completionMessage: "오늘도,\n당신의 리듬이 시작되었습니다.",
    rhythmLabel: "오늘의 작은 리듬",
    continuity: (day: number) => `${day}일째.\n당신의 아침 리듬이 이어지고 있습니다.`,
    prompts: [
      "잠시,\n하늘을 올려다보세요.",
      "오늘 한 번,\n천천히 걸어보세요.",
      "누군가에게\n따뜻한 말 한마디를 건네보세요.",
      "다음 행동을 시작하기 전에,\n한 번 깊게 숨 쉬어보세요.",
      "아침 빛을\n잠시 느껴보세요."
    ],
    continueCta: "Energy Gate로 이어가기",
    returnCta: "Morning Gate로 돌아가기",
    finishCta: "오늘은 여기까지"
  },
  en: {
    completionMessage: "Your rhythm has begun again today.",
    rhythmLabel: "Today’s small rhythm",
    continuity: (day: number) => `Day ${day}.\nYour morning rhythm continues.`,
    prompts: [
      "Take a quiet moment\nto look up at the sky.",
      "Walk a little more slowly today.",
      "Offer one kind word to someone.",
      "Take one deep breath\nbefore your next action.",
      "Notice the morning light\nfor a moment."
    ],
    continueCta: "Continue to Energy Gate",
    returnCta: "Return to Morning Gate",
    finishCta: "Finish for today"
  }
} as const;

const focusGateNarration: Record<"jp" | "kr" | "en", GuidedFocusLine[]> = {
  jp: [
    { at: 0, key: "focus-1", text: "背筋を\nやさしく伸ばします", speechDelayMs: 420 },
    { at: 5, key: "focus-2", text: "肩の力を\n静かに下ろします", speechDelayMs: 420 },
    { at: 10, key: "focus-3", text: "ゆっくり\n息を吸います", speechText: "ゆっくり、\n息を吸います", speechDelayMs: 460 },
    { at: 20, key: "focus-6", text: "今この瞬間へ\n戻ります", speechText: "今この瞬間へ、\n戻ります", speechDelayMs: 420 },
    { at: 32, key: "focus-7", text: "散っていた思考が\nひとつの点へ\n集まります", speechText: "散っていた思考が、\nひとつの点へ、\n集まります", speechDelayMs: 420 },
    { at: 38, key: "focus-8", text: "今日いちばん大切な\nひとつを\n思い出します", speechText: "今日いちばん大切な、\nひとつを、\n思い出します", speechDelayMs: 440 },
    { at: 45, key: "focus-9", text: "そのひとつに\n心を置きます", speechText: "そのひとつに、\n心を置きます", speechDelayMs: 440 },
    { at: 50, key: "focus-10", text: "集中する力は\nもうあなたの中にあります", speechText: "集中する力は、\nもうあなたの中にあります", speechDelayMs: 460 },
    { at: 55, key: "focus-11", text: "準備できました", speechDelayMs: 520 },
    { at: 58, key: "focus-12", text: "いちばん大切な\nひとつを始めましょう", speechText: "いちばん大切な、\nひとつを始めましょう", speechDelayMs: 520 }
  ],
  kr: [
    { at: 0, key: "focus-1", text: "척추를 편안하게 세웁니다", speechDelayMs: 420 },
    { at: 5, key: "focus-2", text: "어깨의 힘을 내려놓습니다", speechDelayMs: 420 },
    { at: 10, key: "focus-3", text: "천천히 숨을 들이마십니다", speechDelayMs: 460 },
    { at: 15, key: "focus-4", text: "길게 내쉽니다", speechDelayMs: 500 },
    { at: 21, key: "focus-5", text: "지금 이 순간으로 돌아옵니다", speechDelayMs: 420 },
    { at: 27, key: "focus-6", text: "흩어진 생각이\n하나의 점으로 모입니다", speechDelayMs: 420 },
    { at: 34, key: "focus-7", text: "오늘 가장 중요한\n한 가지를 떠올려 봅니다", speechDelayMs: 460 },
    { at: 41, key: "focus-8", text: "그 하나에 마음을 둡니다", speechDelayMs: 460 },
    { at: 47, key: "focus-9", text: "당신의 집중은\n이미 당신 안에 있습니다", speechDelayMs: 480 },
    { at: 53, key: "focus-10", text: "한 번에 한 가지", speechDelayMs: 520 },
    { at: 56, key: "focus-11", text: "이제\n가장 중요한 한 가지를 시작하세요", speechDelayMs: 540 }
  ],
  en: [
    { at: 0, key: "focus-1", text: "Lengthen the spine\ngently", speechDelayMs: 420 },
    { at: 5, key: "focus-2", text: "Let the shoulders\nsoften", speechDelayMs: 420 },
    { at: 10, key: "focus-3", text: "Slowly breathe in", speechDelayMs: 460 },
    { at: 15, key: "focus-4", text: "And breathe out", speechDelayMs: 460 },
    { at: 20, key: "focus-5", text: "Once more\nA deeper breath in\nand out", speechDelayMs: 480 },
    { at: 27, key: "focus-6", text: "Return to\nthis moment", speechDelayMs: 420 },
    { at: 32, key: "focus-7", text: "Scattered thoughts\nbegin to gather\ninto one point", speechDelayMs: 420 },
    { at: 38, key: "focus-8", text: "Bring to mind\nthe one thing\nthat matters most today", speechDelayMs: 440 },
    { at: 45, key: "focus-9", text: "Place your attention\nthere", speechDelayMs: 440 },
    { at: 50, key: "focus-10", text: "Your focus\nis already within you", speechDelayMs: 460 },
    { at: 55, key: "focus-11", text: "You are ready", speechDelayMs: 520 },
    { at: 58, key: "focus-12", text: "Begin the one thing\nthat matters most", speechDelayMs: 520 }
  ]
};

const calmGateNarration: Record<"jp" | "kr" | "en", GuidedCalmLine[]> = {
  jp: [
    { at: 0, key: "calm-1", text: "体の力を\n静かに下ろします", speechText: "体の力を、\n静かに下ろします", speechDelayMs: 560 },
    { at: 6, key: "calm-2", text: "ゆっくり\n息を吸います", speechText: "ゆっくり、\n息を吸います", speechDelayMs: 640 },
    { at: 14, key: "calm-3", text: "長く\n吐きます", speechText: "長く、\n吐きます", speechDelayMs: 700 },
    { at: 22, key: "calm-4", text: "吐くたびに\n緊張が少しずつ\nほどけていきます", speechText: "吐くたびに、\n緊張が少しずつ、\nほどけていきます", speechDelayMs: 700 },
    { at: 31, key: "calm-5", text: "肩も\n表情も\nやわらいでいきます", speechText: "肩も、\n表情も、\nやわらいでいきます", speechDelayMs: 720 },
    { at: 40, key: "calm-6", text: "今この瞬間を\nそのまま感じます", speechText: "今この瞬間を、\nそのまま感じます", speechDelayMs: 700 },
    { at: 48, key: "calm-7", text: "何もしなくても\n大丈夫です", speechText: "何もしなくても、\n大丈夫です", speechDelayMs: 760 },
    { at: 54, key: "calm-8", text: "このやわらかさとともに\n一日へ戻ります", speechText: "このやわらかさとともに、\n一日へ戻ります", speechDelayMs: 760 }
  ],
  kr: [
    { at: 0, key: "calm-1", text: "몸의 힘을 내려놓습니다", speechDelayMs: 560 },
    { at: 6, key: "calm-2", text: "천천히 숨을 들이마십니다", speechDelayMs: 640 },
    { at: 14, key: "calm-3", text: "길게 내쉽니다", speechDelayMs: 700 },
    { at: 22, key: "calm-4", text: "내쉴 때마다\n긴장이 조금씩 풀려갑니다", speechDelayMs: 700 },
    { at: 31, key: "calm-5", text: "어깨도\n얼굴도\n편안해집니다", speechDelayMs: 720 },
    { at: 40, key: "calm-6", text: "지금 이 순간을\n그대로 느껴봅니다", speechDelayMs: 700 },
    { at: 48, key: "calm-7", text: "아무것도 하지 않아도\n괜찮습니다", speechDelayMs: 760 },
    { at: 54, key: "calm-8", text: "이 편안함을 안고\n다시 하루를 이어갑니다", speechDelayMs: 760 }
  ],
  en: [
    { at: 0, key: "calm-1", text: "Let the body\nsoften", speechDelayMs: 560 },
    { at: 6, key: "calm-2", text: "Slowly breathe in", speechDelayMs: 640 },
    { at: 14, key: "calm-3", text: "And breathe out\nfor longer", speechDelayMs: 700 },
    { at: 22, key: "calm-4", text: "With each exhale\ntension begins\nto loosen", speechDelayMs: 700 },
    { at: 31, key: "calm-5", text: "The shoulders\nand the face\nbecome softer", speechDelayMs: 720 },
    { at: 40, key: "calm-6", text: "Feel this moment\njust as it is", speechDelayMs: 700 },
    { at: 48, key: "calm-7", text: "You do not need\nto do anything", speechDelayMs: 760 },
    { at: 54, key: "calm-8", text: "Carry this ease\nback into your day", speechDelayMs: 760 }
  ]
};

const releaseGateNarration: Record<"jp" | "kr" | "en", GuidedCalmLine[]> = {
  jp: [
    { at: 10, key: "release-1", text: "今日も…\nお疲れさまでした", speechDelayMs: 880 },
    {
      at: 24,
      key: "release-2",
      text: "今は、\n少し休んでも\n大丈夫です",
      speechText: "いまは、\nすこし やすんでも\nだいじょうぶです",
      speechDelayMs: 920
    },
    {
      at: 40,
      key: "release-3",
      text: "今日という 一日は、\nいろいろな時間が\nあったことでしょう",
      speechText: "きょうという いちにちは、\nいろいろな じかんが\nあったことでしょう",
      speechDelayMs: 940
    },
    { at: 58, key: "release-4", text: "今は、\nそのすべてを\nそっと置いてみましょう", speechText: "いまは、\nそのすべてを\nそっと おいてみましょう", speechDelayMs: 960 },
    { at: 74, key: "release-5", text: "体の力を、\n少しゆるめます", speechText: "からだの ちからを、\nすこし ゆるめます", speechDelayMs: 940 },
    { at: 98, key: "release-6", text: "心も、\n静かに休ませます", speechText: "こころも、\nしずかに やすませます", speechDelayMs: 1000 },
    { at: 122, key: "release-7", text: "今日終わらなかったことは、\n明日のあなたに\n任せても大丈夫です", speechText: "きょう おわらなかったことは、\nあしたの あなたに\nまかせても だいじょうぶです", speechDelayMs: 1020 },
    { at: 136, key: "release-8", text: "何も\n頑張らなくて\n大丈夫です", speechText: "なにも\nがんばらなくて\nだいじょうぶです", speechDelayMs: 1020 },
    { at: 148, key: "release-9", text: "ただ、\nここに\n静かにいてみましょう", speechText: "ただ、\nここに\nしずかに いてみましょう", speechDelayMs: 1080 },
    { at: 155, key: "release-10", text: "今日も…\n十分でした", speechText: "きょうも…\nじゅうぶんでした", speechDelayMs: 1120 },
    { at: 170, key: "release-11", text: "今日の重さを…\nゆっくり下ろします", speechText: "きょうの おもさを…\nゆっくり おろします", speechDelayMs: 1120 }
  ],
  kr: [
    { at: 10, key: "release-1", text: "오늘도…\n수고하셨습니다", speechDelayMs: 880 },
    { at: 24, key: "release-2", text: "지금은\n잠시 쉬어도\n괜찮습니다", speechDelayMs: 920 },
    { at: 40, key: "release-3", text: "오늘 하루,\n많은 순간이\n있었을 것입니다", speechDelayMs: 940 },
    { at: 58, key: "release-4", text: "이제,\n그 모든 것을\n잠시 내려놓습니다", speechDelayMs: 960 },
    { at: 74, key: "release-5", text: "몸의 힘을\n조금 풀어봅니다", speechDelayMs: 940 },
    { at: 98, key: "release-6", text: "마음도\n조용히 쉬어갑니다", speechDelayMs: 1000 },
    { at: 122, key: "release-7", text: "오늘 끝내지 못한 일은\n내일의 당신에게\n맡겨도 됩니다", speechDelayMs: 1020 },
    { at: 136, key: "release-8", text: "아무것도\n애쓰지 않아도 됩니다", speechDelayMs: 1020 },
    { at: 148, key: "release-9", text: "그저,\n여기에\n조용히 머물러 봅니다", speechDelayMs: 1080 },
    { at: 155, key: "release-10", text: "오늘도...\n충분했습니다", speechDelayMs: 1120 },
    { at: 170, key: "release-11", text: "오늘의 무게를...\n천천히 내려놓습니다", speechDelayMs: 1120 }
  ],
  en: [
    { at: 10, key: "release-1", text: "Today...\nThank you", speechDelayMs: 860 },
    { at: 24, key: "release-2", text: "Now,\nyou may simply\nrest", speechDelayMs: 900 },
    { at: 40, key: "release-3", text: "Today\nheld many moments", speechDelayMs: 920 },
    { at: 58, key: "release-4", text: "For now,\ngently set them\ndown", speechDelayMs: 940 },
    { at: 74, key: "release-5", text: "Let your body\nsoften", speechDelayMs: 920 },
    { at: 98, key: "release-6", text: "Let your heart\nrest quietly", speechDelayMs: 980 },
    { at: 122, key: "release-7", text: "Whatever remains unfinished today\ncan wait for tomorrow", speechDelayMs: 980 },
    { at: 136, key: "release-8", text: "You do not need\nto try anymore", speechDelayMs: 980 },
    { at: 148, key: "release-9", text: "Simply\nbe here\nfor a little while", speechDelayMs: 1040 },
    { at: 168, key: "release-10", text: "Today\nwas enough\nGently place\ntoday's weight down", speechText: "Today\nwas enough\nGently place\ntoday's weight down\nNow,\nlet us quietly walk\ntoward the Gate of Gratitude", speechDelayMs: 1100 }
  ]
};

const gratitudeGateNarration: Record<"jp" | "kr" | "en", GuidedCalmLine[]> = {
  jp: [
    { at: 12, key: "gratitude-1", text: "今日も...\nありがとうございます", speechDelayMs: 980 },
    {
      at: 26,
      key: "gratitude-2",
      text: "今日は、\n少しだけ\n一日を\n思い返してみます",
      speechText: "きょうは、\nすこしだけ\nいちにちを\nおもいかえしてみます",
      speechDelayMs: 980
    },
    {
      at: 44,
      key: "gratitude-3",
      text: "近すぎて、\n気づかなかった\nあたたかさが\nあったかもしれません",
      speechDelayMs: 1020
    },
    { at: 60, key: "gratitude-4", text: "空気", speechDelayMs: 1060 },
    { at: 68, key: "gratitude-5", text: "陽ざし", speechDelayMs: 1060 },
    { at: 76, key: "gratitude-6", text: "風", speechDelayMs: 1060 },
    { at: 84, key: "gratitude-7", text: "自然の香り", speechDelayMs: 1080 },
    {
      at: 100,
      key: "gratitude-8",
      text: "今日、\n当たり前すぎて\n見過ごしていたものは\nありませんでしたか",
      speechDelayMs: 1040
    },
    {
      at: 118,
      key: "gratitude-9",
      text: "いつも\nそばにいてくれた\n大切な人たち",
      speechDelayMs: 1040
    },
    { at: 132, key: "gratitude-10", text: "家族", speechDelayMs: 1080 },
    { at: 139, key: "gratitude-11", text: "友人", speechDelayMs: 1080 },
    { at: 146, key: "gratitude-12", text: "仲間", speechDelayMs: 1080 },
    {
      at: 156,
      key: "gratitude-13",
      text: "今日も\n頑張ってくれた\n自分自身",
      speechText: "きょうも\nがんばってくれた\nじぶんじしん",
      speechDelayMs: 1180
    },
    {
      at: 170,
      key: "gratitude-14",
      text: "今日も...\nたくさんの贈りものの中で\n生きていました",
      speechDelayMs: 1080
    },
    {
      at: 184,
      key: "gratitude-15",
      text: "その温もりを\n静かに\n心にしまいます",
      speechDelayMs: 1120
    },
    { at: 200, key: "gratitude-16", text: "今日も...\nありがとうございます", speechDelayMs: 1120 }
  ],
  kr: [
    { at: 12, key: "gratitude-1", text: "오늘도...\n고맙습니다", speechDelayMs: 980 },
    {
      at: 26,
      key: "gratitude-2",
      text: "오늘,\n잠시\n하루를\n떠올려 봅니다",
      speechDelayMs: 980
    },
    {
      at: 44,
      key: "gratitude-3",
      text: "너무 가까워서\n미처 보지 못했던\n따뜻함이\n있었을지도 모릅니다",
      speechDelayMs: 1020
    },
    { at: 60, key: "gratitude-4", text: "공기", speechDelayMs: 1060 },
    { at: 68, key: "gratitude-5", text: "햇살", speechDelayMs: 1060 },
    { at: 76, key: "gratitude-6", text: "바람", speechDelayMs: 1060 },
    { at: 84, key: "gratitude-7", text: "자연의 향기", speechDelayMs: 1080 },
    {
      at: 100,
      key: "gratitude-8",
      text: "오늘...\n당연해서\n지나쳤던 것이\n있었나요",
      speechDelayMs: 1040
    },
    {
      at: 118,
      key: "gratitude-9",
      text: "늘 함께해 준\n소중한 사람들",
      speechDelayMs: 1040
    },
    { at: 132, key: "gratitude-10", text: "가족", speechDelayMs: 1080 },
    { at: 139, key: "gratitude-11", text: "친구", speechDelayMs: 1080 },
    { at: 146, key: "gratitude-12", text: "동료", speechDelayMs: 1080 },
    {
      at: 156,
      key: "gratitude-13",
      text: "오늘도\n애써준\n자기 자신",
      speechDelayMs: 1180
    },
    {
      at: 170,
      key: "gratitude-14",
      text: "오늘도...\n많은 선물 속에서\n살고 있었습니다",
      speechDelayMs: 1080
    },
    {
      at: 184,
      key: "gratitude-15",
      text: "그 따뜻함을\n조용히\n마음에 담아봅니다",
      speechDelayMs: 1120
    },
    { at: 200, key: "gratitude-16", text: "오늘도...\n감사합니다", speechDelayMs: 1120 }
  ],
  en: [
    { at: 12, key: "gratitude-1", text: "Thank you...\nfor today", speechDelayMs: 980 },
    {
      at: 26,
      key: "gratitude-2",
      text: "Take a quiet moment...\nto remember\nyour day",
      speechDelayMs: 980
    },
    {
      at: 44,
      key: "gratitude-3",
      text: "Perhaps\nthere was a warmth\nyou almost missed",
      speechDelayMs: 1020
    },
    { at: 60, key: "gratitude-4", text: "The air", speechDelayMs: 1060 },
    { at: 68, key: "gratitude-5", text: "The sunlight", speechDelayMs: 1060 },
    { at: 76, key: "gratitude-6", text: "The breeze", speechDelayMs: 1060 },
    { at: 84, key: "gratitude-7", text: "The scent of nature", speechDelayMs: 1080 },
    {
      at: 100,
      key: "gratitude-8",
      text: "Today...\nwas there something\nso familiar\nthat you almost forgot",
      speechDelayMs: 1040
    },
    {
      at: 118,
      key: "gratitude-9",
      text: "The people\nwho stayed beside you",
      speechDelayMs: 1040
    },
    { at: 132, key: "gratitude-10", text: "Family", speechDelayMs: 1080 },
    { at: 139, key: "gratitude-11", text: "Friends", speechDelayMs: 1080 },
    { at: 146, key: "gratitude-12", text: "Colleagues", speechDelayMs: 1080 },
    {
      at: 156,
      key: "gratitude-13",
      text: "And...\nyourself,\nwho did your best today",
      speechDelayMs: 1180
    },
    {
      at: 170,
      key: "gratitude-14",
      text: "Today...\nyou lived\namong many gifts",
      speechDelayMs: 1080
    },
    {
      at: 184,
      key: "gratitude-15",
      text: "Hold that warmth\ngently\nin your heart",
      speechDelayMs: 1120
    },
    { at: 200, key: "gratitude-16", text: "Thank you...\nfor today", speechDelayMs: 1120 }
  ]
};

const sleepGateNarration: Record<"jp" | "kr" | "en", GuidedCalmLine[]> = {
  jp: [
    { at: 15, key: "sleep-1", text: "今日も...\nお疲れさまでした", speechDelayMs: 1040 },
    {
      at: 32,
      key: "sleep-2",
      text: "もう...\n何もしなくて\n大丈夫です",
      speechText: "もう...\nなにもしなくて\nだいじょうぶです",
      speechDelayMs: 1080
    },
    {
      at: 50,
      key: "sleep-3",
      text: "体の力を\n少しずつ\nほどいていきます",
      speechText: "からだの ちからを\nすこしずつ\nほどいていきます",
      speechDelayMs: 1080
    },
    {
      at: 68,
      key: "sleep-4",
      text: "呼吸も\n無理に\n変えなくて大丈夫です",
      speechText: "こきゅうも\nむりに\nかえなくて だいじょうぶです",
      speechDelayMs: 1100
    },
    {
      at: 88,
      key: "sleep-5",
      text: "ただ...\n静かに\nここにいてみましょう",
      speechText: "ただ...\nしずかに\nここに いてみましょう",
      speechDelayMs: 1120
    },
    {
      at: 120,
      key: "sleep-6",
      text: "今日は\nもう\n十分でした",
      speechText: "きょうは\nもう\nじゅうぶんでした",
      speechDelayMs: 1120
    },
    {
      at: 138,
      key: "sleep-7",
      text: "これ以上\n頑張らなくて\n大丈夫です",
      speechText: "これいじょう\nがんばらなくて\nだいじょうぶです",
      speechDelayMs: 1140
    },
    {
      at: 156,
      key: "sleep-8",
      text: "体は...\nもう\n知っています",
      speechText: "からだは...\nもう\nしっています",
      speechDelayMs: 1160
    },
    { at: 174, key: "sleep-9", text: "休むことを", speechText: "やすむことを", speechDelayMs: 1180 },
    {
      at: 192,
      key: "sleep-10",
      text: "脳も...\nもう\n知っています",
      speechText: "のうも...\nもう\nしっています",
      speechDelayMs: 1160
    },
    { at: 210, key: "sleep-11", text: "回復することを", speechText: "かいふくすることを", speechDelayMs: 1180 },
    {
      at: 242,
      key: "sleep-12",
      text: "今日の疲れは\nゆっくり\nほどけていきます",
      speechText: "きょうの つかれは\nゆっくり\nほどけていきます",
      speechDelayMs: 1200
    },
    {
      at: 260,
      key: "sleep-13",
      text: "あなたが\n休んでいるあいだ\n体と脳は\n静かに回復を始めます",
      speechText: "あなたが\nやすんでいる あいだ\nからだと のうは\nしずかに かいふくを はじめます",
      speechDelayMs: 1220
    },
    {
      at: 286,
      key: "sleep-14",
      text: "もう\n何も\n抱えなくて大丈夫です",
      speechText: "もう\nなにも\nかかえなくて だいじょうぶです",
      speechDelayMs: 1220
    },
    {
      at: 300,
      key: "sleep-15",
      text: "ただ...\n休んでください",
      speechText: "ただ...\nやすんでください",
      speechDelayMs: 1220
    },
    {
      at: 340,
      key: "sleep-16",
      text: "今日も...\nよく生きてこられました",
      speechText: "きょうも...\nよく いきてこられました",
      speechDelayMs: 1240
    },
    { at: 350, key: "sleep-17", text: "穏やかな夜を", speechText: "おだやかな よるを", speechDelayMs: 1260 }
  ],
  kr: [
    { at: 15, key: "sleep-1", text: "오늘도...\n수고하셨습니다", speechDelayMs: 1040 },
    { at: 32, key: "sleep-2", text: "이제는...\n아무것도\n하지 않아도 됩니다", speechDelayMs: 1080 },
    { at: 50, key: "sleep-3", text: "몸의 힘을\n조금씩\n놓아봅니다", speechDelayMs: 1080 },
    { at: 68, key: "sleep-4", text: "호흡도\n억지로\n바꾸지 않습니다", speechDelayMs: 1100 },
    { at: 88, key: "sleep-5", text: "그저...\n편안히\n머물러 봅니다", speechDelayMs: 1120 },
    { at: 120, key: "sleep-6", text: "오늘은\n충분했습니다", speechDelayMs: 1120 },
    { at: 138, key: "sleep-7", text: "더 애쓰지 않아도 됩니다", speechDelayMs: 1140 },
    { at: 156, key: "sleep-8", text: "몸은...\n이미\n알고 있습니다", speechDelayMs: 1160 },
    { at: 174, key: "sleep-9", text: "쉼을...", speechDelayMs: 1180 },
    { at: 192, key: "sleep-10", text: "뇌도...\n알고 있습니다", speechDelayMs: 1160 },
    { at: 210, key: "sleep-11", text: "회복을...", speechDelayMs: 1180 },
    { at: 242, key: "sleep-12", text: "오늘의 피로는\n천천히\n사라집니다", speechDelayMs: 1200 },
    { at: 260, key: "sleep-13", text: "당신이\n쉬는 동안,\n몸과 뇌는\n조용히\n회복을 시작합니다", speechDelayMs: 1220 },
    { at: 286, key: "sleep-14", text: "지금은\n아무것도\n붙잡지 않아도 됩니다", speechDelayMs: 1220 },
    { at: 300, key: "sleep-15", text: "그저...\n쉬면 됩니다", speechDelayMs: 1220 },
    { at: 340, key: "sleep-16", text: "오늘도...\n잘 살아오셨습니다", speechDelayMs: 1240 },
    { at: 350, key: "sleep-17", text: "편안한 밤 되세요", speechDelayMs: 1260 }
  ],
  en: [
    { at: 15, key: "sleep-1", text: "You have done enough\ntoday", speechDelayMs: 1040 },
    { at: 32, key: "sleep-2", text: "Now...\nyou do not need\nto do anything", speechDelayMs: 1080 },
    { at: 50, key: "sleep-3", text: "Let the body\nsoften\nlittle by little", speechDelayMs: 1080 },
    { at: 68, key: "sleep-4", text: "There is no need\nto change\nyour breathing", speechDelayMs: 1100 },
    { at: 88, key: "sleep-5", text: "Simply...\nrest here\nfor a while", speechDelayMs: 1120 },
    { at: 120, key: "sleep-6", text: "Today\nhas been enough", speechDelayMs: 1120 },
    { at: 138, key: "sleep-7", text: "You do not need\nto try anymore", speechDelayMs: 1140 },
    { at: 156, key: "sleep-8", text: "Your body...\nalready knows", speechDelayMs: 1160 },
    { at: 174, key: "sleep-9", text: "how to rest", speechDelayMs: 1180 },
    { at: 192, key: "sleep-10", text: "Your mind...\nalready knows", speechDelayMs: 1160 },
    { at: 210, key: "sleep-11", text: "how to recover", speechDelayMs: 1180 },
    { at: 242, key: "sleep-12", text: "The fatigue of today\nbegins to fade\nslowly away", speechDelayMs: 1200 },
    { at: 260, key: "sleep-13", text: "While you rest,\nyour body and mind\nbegin their quiet recovery", speechDelayMs: 1220 },
    { at: 286, key: "sleep-14", text: "You do not need\nto hold onto\nanything now", speechDelayMs: 1220 },
    { at: 300, key: "sleep-15", text: "Simply...\nrest", speechDelayMs: 1220 },
    { at: 340, key: "sleep-16", text: "You have come\nthrough today\nwell enough", speechDelayMs: 1240 },
    { at: 350, key: "sleep-17", text: "May your night be gentle", speechDelayMs: 1260 }
  ]
};

const affirmationGateCopy = {
  jp: {
    title: "Awakening Gate",
    subtitle: "目覚めの扉",
    duration: "3:00",
    audioLabel: "Awakening Gate",
    startAudio: "音声を開始",
    pause: "一度止める",
    resume: "続ける",
    inhale: "吸う",
    exhale: "吐く",
    completionTitle: "今日、また戻ることができました",
    completionMessage: "朝の始まりを\n静かに迎えました",
    completionNote: "あなた本来のリズムが\n戻り始めています",
    completionButton: "朝の扉へ戻る",
    openingFade: "Awakening Gate",
    integration: "",
    openingLines: [
      { at: 6, key: "open-1", text: "おはようございます", speechDelayMs: 680 },
      {
        at: 20,
        key: "open-2",
        text: "今日も\n新しい朝が\n訪れました",
        speechText: "今日も、\n新しい朝が、\n訪れました",
        speechDelayMs: 460
      },
      {
        at: 38,
        key: "open-3",
        text: "少しだけ\n立ち止まってみましょう",
        speechText: "少しだけ、\n立ち止まってみましょう",
        speechDelayMs: 480
      },
      { at: 54, key: "open-4", text: "ゆっくり\n息を吸います", speechText: "ゆっくり、\n息を吸います", speechDelayMs: 520 },
      { at: 70, key: "open-5", text: "そして\n静かに吐きます", speechText: "そして、\n静かに吐きます", speechDelayMs: 520 },
      { at: 88, key: "open-6", text: "もう一度\nゆっくり息を吸います", speechText: "もう一度、\nゆっくり息を吸います", speechDelayMs: 540 },
      { at: 104, key: "open-7", text: "ゆっくり吐きます", speechText: "ゆっくり、\n吐きます", speechDelayMs: 560 }
    ],
    affirmationLines: [
      {
        at: 120,
        key: "affirm-1",
        text: "呼吸とともに\n身体が少しずつ\n目覚めていきます",
        speechText: "呼吸とともに、\n身体が少しずつ、\n目覚めていきます",
        speechDelayMs: 460
      },
      {
        at: 138,
        key: "affirm-2",
        text: "今は\n何も変えなくても\n大丈夫です",
        speechText: "今は、\n何も変えなくても、\n大丈夫です",
        speechDelayMs: 520
      },
      {
        at: 154,
        key: "affirm-3",
        text: "ただ\nここにいる自分を\n感じてみましょう",
        speechText: "ただ、\nここにいる自分を、\n感じてみましょう",
        speechDelayMs: 520
      }
    ],
    closingLines: [
      {
        at: 166,
        key: "close-1",
        text: "今日という 一日\n今ここから始まります",
        speechText: "今日という いちにちは\n今ここから始まります",
        speechDelayMs: 700
      },
      { at: 176, key: "close-2", text: "あなた本来のリズムで", speechText: "あなた本来のリズムで", speechDelayMs: 760 },
      { at: 179, key: "close-3", text: "いってらっしゃい", speechDelayMs: 820 }
    ]
  },
  kr: {
    title: "Awakening Gate",
    subtitle: "깨어남의 문",
    duration: "3:00",
    audioLabel: "Awakening Gate",
    startAudio: "음성 시작하기",
    pause: "잠시 멈추기",
    resume: "이어가기",
    inhale: "들이쉬기",
    exhale: "내쉬기",
    completionTitle: "오늘, 다시 돌아올 수 있었습니다",
    completionMessage: "아침을\n조용히 맞이했습니다",
    completionNote: "당신 본래의 리듬이\n돌아오기 시작합니다",
    completionButton: "아침의 문으로 돌아가기",
    openingFade: "Awakening Gate",
    integration: "",
    openingLines: [
      { at: 6, key: "open-1", text: "좋은 아침입니다", speechDelayMs: 680 },
      { at: 20, key: "open-2", text: "오늘도\n새로운 아침이\n찾아왔습니다", speechDelayMs: 460 },
      { at: 38, key: "open-3", text: "잠시만\n멈춰 서 봅니다", speechDelayMs: 480 },
      { at: 54, key: "open-4", text: "천천히\n숨을 들이쉽니다", speechDelayMs: 520 },
      { at: 70, key: "open-5", text: "그리고\n조용히 내쉽니다", speechDelayMs: 520 },
      { at: 88, key: "open-6", text: "한 번 더\n천천히 숨을 들이쉽니다", speechDelayMs: 540 },
      { at: 104, key: "open-7", text: "길게 내쉽니다", speechDelayMs: 560 }
    ],
    affirmationLines: [
      { at: 120, key: "affirm-1", text: "숨결을 따라\n몸이 조금씩\n깨어납니다", speechDelayMs: 460 },
      { at: 138, key: "affirm-2", text: "지금은\n아무것도 바꾸지 않아도\n괜찮습니다", speechDelayMs: 520 },
      { at: 154, key: "affirm-3", text: "그저\n여기 있는 나를\n가만히 느껴봅니다", speechDelayMs: 520 }
    ],
    closingLines: [
      { at: 166, key: "close-1", text: "오늘이라는 하루는\n지금 여기에서 시작됩니다", speechDelayMs: 700 },
      { at: 176, key: "close-2", text: "당신 본래의 리듬으로", speechDelayMs: 760 },
      { at: 179, key: "close-3", text: "다녀오세요", speechDelayMs: 820 }
    ]
  },
  en: {
    title: "Awakening Gate",
    subtitle: "A quiet gate\ninto the beginning of your day",
    duration: "3:00",
    audioLabel: "Awakening Gate",
    startAudio: "Start Audio",
    pause: "Pause",
    resume: "Continue",
    inhale: "Inhale",
    exhale: "Exhale",
    completionTitle: "Today, you returned again",
    completionMessage: "You quietly welcomed\nthe morning",
    completionNote: "Your natural rhythm\nis beginning to return",
    completionButton: "Return to Morning Gate",
    openingFade: "Awakening Gate",
    integration: "",
    openingLines: [
      { at: 6, key: "open-1", text: "Good morning", speechDelayMs: 680 },
      { at: 20, key: "open-2", text: "A new morning\nhas found you again", speechDelayMs: 460 },
      { at: 38, key: "open-3", text: "Pause here\nfor a moment", speechDelayMs: 480 },
      { at: 54, key: "open-4", text: "Slowly breathe in", speechDelayMs: 520 },
      { at: 70, key: "open-5", text: "And gently breathe out", speechDelayMs: 520 },
      { at: 88, key: "open-6", text: "Once more now\nslowly breathe in", speechDelayMs: 540 },
      { at: 104, key: "open-7", text: "And an easy breath out", speechDelayMs: 560 }
    ],
    affirmationLines: [
      { at: 120, key: "affirm-1", text: "With the breath\nyour body begins to wake", speechDelayMs: 460 },
      { at: 138, key: "affirm-2", text: "Nothing needs to change\nright now", speechDelayMs: 520 },
      { at: 154, key: "affirm-3", text: "Just feel yourself here", speechDelayMs: 520 }
    ],
    closingLines: [
      { at: 166, key: "close-1", text: "This day begins\nhere", speechDelayMs: 700 },
      { at: 176, key: "close-2", text: "In your own natural rhythm", speechDelayMs: 760 },
      { at: 179, key: "close-3", text: "Go gently", speechDelayMs: 820 }
    ]
  }
} as const;

const energyGateCopy = {
  jp: {
    title: "Energy Gate",
    subtitle: "体と脳を\n中心から目覚めさせます",
    duration: "3:00",
    audioLabel: "Energy Gate",
    startAudio: "音声を開始",
    pause: "一度止める",
    resume: "続ける",
    inhale: "吸う",
    exhale: "吐く",
    completionTitle: "今日、また戻ることができました",
    completionMessage: "エネルギーが\n静かに戻っています",
    completionNote: "少しずつ、早く\n戻れるようになっています",
    completionButton: "朝の扉へ戻る",
    openingFade: "Energy Gate",
    integration: "丹田を感じます\n今を感じます",
    openingLines: [
      { at: 5, key: "open-1", text: "ようこそ", speechDelayMs: 620 },
      { at: 10, key: "open-2", text: "今日は\n体の中心から目覚めます", speechText: "今日は、\n体の中心から目覚めます", speechDelayMs: 420 },
      { at: 26, key: "open-4", text: "おへその下", speechDelayMs: 480 },
      { at: 34, key: "open-5", text: "丹田に意識を向けます", speechText: "丹田に、\n意識を向けます", speechDelayMs: 500 }
    ],
    awarenessLines: [
      { at: 46, key: "body-1", text: "丹田", speechDelayMs: 520 },
      { at: 56, key: "body-2", text: "丹田", speechDelayMs: 560 },
      { at: 68, key: "body-3", text: "呼吸は自然に", speechText: "呼吸は、\n自然に", speechDelayMs: 520 },
      { at: 80, key: "body-4", text: "丹田を感じます", speechText: "丹田を、\n感じます", speechDelayMs: 560 }
    ],
    energyLines: [
      { at: 94, key: "energy-1", text: "体が目覚めます", speechDelayMs: 520 },
      { at: 106, key: "energy-2", text: "脳が目覚めます", speechDelayMs: 560 },
      { at: 118, key: "energy-3", text: "丹田", speechDelayMs: 560 },
      { at: 128, key: "energy-4", text: "丹田", speechDelayMs: 580 },
      { at: 140, key: "energy-5", text: "温かさを感じます", speechDelayMs: 560 },
      { at: 152, key: "energy-6", text: "生命力を感じます", speechDelayMs: 580 },
      { at: 164, key: "energy-7", text: "今日を支える力は\nすでにあなたの中にあります", speechText: "今日を支える力は、\nすでにあなたの中にあります", speechDelayMs: 640 }
    ],
    closingLines: [
      { at: 178, key: "close-1", text: "準備ができました", speechDelayMs: 760 }
    ]
  },
  kr: {
    title: "Energy Gate",
    subtitle: "몸과 뇌를\n중심에서 조용히 깨웁니다",
    duration: "3:00",
    audioLabel: "Energy Gate",
    startAudio: "음성 시작하기",
    pause: "잠시 멈추기",
    resume: "이어가기",
    inhale: "들이쉬기",
    exhale: "내쉬기",
    completionTitle: "오늘, 다시 돌아올 수 있었습니다",
    completionMessage: "에너지가\n조용히 돌아오고 있습니다",
    completionNote: "조금 더 빨리 자신에게\n돌아오고 있습니다",
    completionButton: "아침의 문으로 돌아가기",
    openingFade: "Energy Gate",
    integration: "단전을 느껴봅니다\n지금을 느껴봅니다",
    openingLines: [
      { at: 5, key: "open-1", text: "어서 오세요", speechDelayMs: 620 },
      { at: 10, key: "open-2", text: "오늘은 몸과 뇌를 깨웁니다", speechDelayMs: 420 },
      { at: 26, key: "open-4", text: "배꼽 아래", speechDelayMs: 480 },
      { at: 34, key: "open-5", text: "단전에 의식을 향해봅니다", speechDelayMs: 500 }
    ],
    awarenessLines: [
      { at: 46, key: "body-1", text: "가볍게 두드립니다", speechDelayMs: 520 },
      { at: 58, key: "body-2", text: "호흡은 자연스럽게", speechDelayMs: 520 },
      { at: 72, key: "body-3", text: "단전을 느껴봅니다", speechDelayMs: 560 }
    ],
    energyLines: [
      { at: 90, key: "energy-1", text: "몸이 깨어납니다", speechDelayMs: 520 },
      { at: 104, key: "energy-2", text: "뇌가 깨어납니다", speechDelayMs: 560 },
      { at: 120, key: "energy-3", text: "따뜻함을 느낍니다", speechDelayMs: 560 },
      { at: 136, key: "energy-4", text: "생명력을 느낍니다", speechDelayMs: 580 },
      { at: 152, key: "energy-5", text: "에너지가 돌아옵니다", speechDelayMs: 580 },
      { at: 166, key: "energy-6", text: "오늘을 움직이는 힘은\n이미 내 안에 있습니다", speechDelayMs: 640 }
    ],
    closingLines: [
      { at: 178, key: "close-1", text: "준비되었습니다", speechDelayMs: 760 }
    ]
  },
  en: {
    title: "Energy Gate",
    subtitle: "A quiet ritual\nto wake body, brain, and center",
    duration: "3:00",
    audioLabel: "Energy Gate",
    startAudio: "Start Audio",
    pause: "Pause",
    resume: "Continue",
    inhale: "Inhale",
    exhale: "Exhale",
    completionTitle: "Today, you returned again",
    completionMessage: "Your energy is\nreturning quietly",
    completionNote: "You are learning to\nreturn more easily",
    completionButton: "Return to Morning Gate",
    openingFade: "Energy Gate",
    integration: "Feel your center\nFeel this moment",
    openingLines: [
      { at: 5, key: "open-1", text: "Welcome", speechDelayMs: 620 },
      { at: 10, key: "open-2", text: "Today\nwe awaken body and brain", speechDelayMs: 420 },
      { at: 26, key: "open-4", text: "Below the navel", speechDelayMs: 480 },
      { at: 34, key: "open-5", text: "feel your Danjeon", speechDelayMs: 500 }
    ],
    awarenessLines: [
      { at: 46, key: "body-1", text: "Danjeon", speechDelayMs: 520 },
      { at: 56, key: "body-2", text: "Danjeon", speechDelayMs: 560 },
      { at: 68, key: "body-3", text: "Let the breath be natural", speechDelayMs: 520 },
      { at: 80, key: "body-4", text: "Feel your Danjeon", speechDelayMs: 560 }
    ],
    energyLines: [
      { at: 94, key: "energy-1", text: "The body awakens", speechDelayMs: 520 },
      { at: 106, key: "energy-2", text: "The brain awakens", speechDelayMs: 560 },
      { at: 118, key: "energy-3", text: "Danjeon", speechDelayMs: 560 },
      { at: 128, key: "energy-4", text: "Danjeon", speechDelayMs: 580 },
      { at: 140, key: "energy-5", text: "Feel the warmth", speechDelayMs: 560 },
      { at: 152, key: "energy-6", text: "Feel the life energy", speechDelayMs: 580 },
      { at: 164, key: "energy-7", text: "The strength for today\nis already within you", speechDelayMs: 640 }
    ],
    closingLines: [
      { at: 178, key: "close-1", text: "You are ready", speechDelayMs: 760 }
    ]
  }
} as const;

const visionGateCopy = {
  jp: {
    title: "Vision Gate",
    subtitle: "今日の方向を\n静かに思い出す時間です",
    duration: "3:00",
    audioLabel: "Vision Gate",
    startAudio: "音声を開始",
    pause: "一度止める",
    resume: "続ける",
    inhale: "吸う",
    exhale: "吐く",
    completionTitle: "今日、また戻ることができました",
    completionMessage: "今日は\n一歩で十分です",
    completionNote: "リズムを思い出す力が\n育っています",
    completionButton: "朝の扉へ戻る",
    openingFade: "Vision Gate",
    integration: "静かに 今日を\n始めます",
    openingLines: [
      { at: 6, key: "open-1", text: "ようこそ", speechDelayMs: 640 },
      { at: 20, key: "open-2", text: "少しだけ\n呼吸に戻ります", speechText: "少しだけ、\n呼吸に戻ります", speechDelayMs: 480 },
      { at: 34, key: "open-3", text: "ゆっくり\n息を吸います", speechText: "ゆっくり、\n息を吸います", speechDelayMs: 540 },
      { at: 48, key: "open-4", text: "静かに\n吐きます", speechText: "静かに、\n吐きます", speechDelayMs: 560 }
    ],
    visionLines: [
      { at: 62, key: "vision-1", text: "今日は\n遠くを見るのではなく", speechText: "今日は、\n遠くを見るのではなく", speechDelayMs: 520 },
      { at: 78, key: "vision-2", text: "静かに\n方向を思い出します", speechText: "静かに、\n方向を思い出します", speechDelayMs: 560 },
      { at: 96, key: "vision-3", text: "昨日は\nもう過ぎました", speechText: "昨日は、\nもう過ぎました", speechDelayMs: 540 },
      { at: 112, key: "vision-4", text: "明日は\nまだ来ていません", speechText: "明日は、\nまだ来ていません", speechDelayMs: 540 },
      { at: 128, key: "vision-5", text: "今\nここにあるのは\nこの瞬間です", speechText: "今、\nここにあるのは、\nこの瞬間です", speechDelayMs: 560 },
      { at: 146, key: "vision-6", text: "朝の光を\n心の中に\nそっと浮かべます", speechText: "朝の光を、\n心の中に、\nそっと浮かべます", speechDelayMs: 580 },
      { at: 164, key: "vision-7", text: "道は\n消えていません", speechText: "道は、\n消えていません", speechDelayMs: 620 }
    ],
    closingLines: [
      { at: 174, key: "close-1", text: "今日は\n一歩で十分です", speechText: "今日は、\n一歩で十分です", speechDelayMs: 760 }
    ]
  },
  kr: {
    title: "Vision Gate",
    subtitle: "오늘의 방향을\n조용히 떠올리는 시간",
    duration: "3:00",
    audioLabel: "Vision Gate",
    startAudio: "음성 시작하기",
    pause: "잠시 멈추기",
    resume: "이어가기",
    inhale: "들이쉬기",
    exhale: "내쉬기",
    completionTitle: "오늘, 다시 돌아올 수 있었습니다",
    completionMessage: "오늘은\n한 걸음이면 충분합니다",
    completionNote: "리듬을 기억하는 힘이\n자라고 있습니다",
    completionButton: "아침의 문으로 돌아가기",
    openingFade: "Vision Gate",
    integration: "조용히 오늘을\n시작합니다",
    openingLines: [
      { at: 6, key: "open-1", text: "좋은 아침입니다", speechDelayMs: 640 },
      { at: 20, key: "open-2", text: "잠시\n호흡으로 돌아옵니다", speechDelayMs: 480 },
      { at: 34, key: "open-3", text: "천천히\n숨을 들이마십니다", speechDelayMs: 540 },
      { at: 48, key: "open-4", text: "조용히\n내쉽니다", speechDelayMs: 560 }
    ],
    visionLines: [
      { at: 62, key: "vision-1", text: "오늘은\n멀리 내다보기보다", speechDelayMs: 520 },
      { at: 78, key: "vision-2", text: "조용히\n방향을 떠올립니다", speechDelayMs: 560 },
      { at: 96, key: "vision-3", text: "어제는\n이미 지나갔습니다", speechDelayMs: 540 },
      { at: 112, key: "vision-4", text: "내일은\n아직 오지 않았습니다", speechDelayMs: 540 },
      { at: 128, key: "vision-5", text: "지금\n여기에 있는 것은\n이 순간입니다", speechDelayMs: 560 },
      { at: 146, key: "vision-6", text: "아침의 빛을\n마음속에\n가만히 떠올려 봅니다", speechDelayMs: 580 },
      { at: 164, key: "vision-7", text: "당신의 길은\n사라지지 않았습니다", speechDelayMs: 620 }
    ],
    closingLines: [
      { at: 174, key: "close-1", text: "오늘은\n한 걸음이면 충분합니다", speechDelayMs: 760 }
    ]
  },
  en: {
    title: "Vision Gate",
    subtitle: "A quiet space\nto remember your direction",
    duration: "3:00",
    audioLabel: "Vision Gate",
    startAudio: "Start Audio",
    pause: "Pause",
    resume: "Continue",
    inhale: "Inhale",
    exhale: "Exhale",
    completionTitle: "Today, you returned again",
    completionMessage: "One step is enough\nfor today",
    completionNote: "Your rhythm is\nremembering itself",
    completionButton: "Return to Morning Gate",
    openingFade: "Vision Gate",
    integration: "Begin this day\nquietly",
    openingLines: [
      { at: 6, key: "open-1", text: "Welcome", speechDelayMs: 640 },
      { at: 20, key: "open-2", text: "Return\nfor a moment\nto your breath", speechDelayMs: 480 },
      { at: 34, key: "open-3", text: "Slowly breathe in", speechDelayMs: 540 },
      { at: 48, key: "open-4", text: "And softly breathe out", speechDelayMs: 560 }
    ],
    visionLines: [
      { at: 62, key: "vision-1", text: "Today\nyou do not need\nto look too far ahead", speechDelayMs: 520 },
      { at: 78, key: "vision-2", text: "Just remember\nyour direction", speechDelayMs: 560 },
      { at: 96, key: "vision-3", text: "Yesterday\nhas already passed", speechDelayMs: 540 },
      { at: 112, key: "vision-4", text: "Tomorrow\nhas not yet arrived", speechDelayMs: 540 },
      { at: 128, key: "vision-5", text: "What is here now\nis this moment", speechDelayMs: 560 },
      { at: 146, key: "vision-6", text: "Let the morning light\nrise softly\nin your mind", speechDelayMs: 580 },
      { at: 164, key: "vision-7", text: "Your path\nhas not disappeared", speechDelayMs: 620 }
    ],
    closingLines: [
      { at: 174, key: "close-1", text: "One step is enough\nfor today", speechDelayMs: 760 }
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

function normalizeJourneyDay(value: string | null) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 7) {
    return null;
  }

  return parsed;
}

function normalizeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/program/basic";
  }

  return value;
}

function resolveMeditationRoute(
  searchParams: URLSearchParams,
  language: "jp" | "kr" | "en"
): ResolvedMeditationRoute {
  const routeType = searchParams.get("type");
  const routeDoor = searchParams.get("door");
  const routePractice = getBasicPracticeByRouteType(routeType, language);
  const normalizedType = normalizeMeditationType(routeType);
  const normalizedDoor = normalizeDoor(routeDoor);
  const journeyMode = searchParams.get("journey") === "1";
  const journeyDay = normalizeJourneyDay(searchParams.get("day"));
  const meditationType = routePractice?.meditationType ?? normalizedType;
  const meditationDoor = routePractice?.meditationDoor ?? normalizedDoor;
  const isThreeMinuteMorningDoor =
    meditationType === "morning" &&
    (meditationDoor === "affirmation" || meditationDoor === "energy" || meditationDoor === "vision");
  const isSixtySecondGate =
    meditationType === "day" &&
    (meditationDoor === "focus" || meditationDoor === "rest" || meditationDoor === "recharge");
  const durationSeconds =
    routePractice?.durationSeconds ??
    (isThreeMinuteMorningDoor
      ? AFFIRMATION_TOTAL_SECONDS
      : isSixtySecondGate
        ? FOCUS_GATE_TOTAL_SECONDS
        : normalizeDuration(searchParams.get("duration")));
  const routeInvalid =
    !journeyMode &&
    (!routeType || (!routePractice && normalizedType === "default" && normalizedDoor === null));

  return {
    routeType,
    meditationType,
    meditationDoor,
    durationSeconds,
    journeyMode,
    journeyDay,
    returnToHref: normalizeReturnTo(searchParams.get("returnTo")),
    routeInvalid
  };
}

function formatRemainingTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
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

function getJourneyEntranceLine(language: "jp" | "kr" | "en", day: number | null) {
  const safeDay = day ?? 1;

  if (language === "kr") {
    switch (safeDay) {
      case 2:
        return "호흡만\n느껴봅시다.";
      case 3:
        return "몸의 목소리를\n들어봅시다.";
      case 4:
        return "자연의 고요로\n돌아가 봅시다.";
      case 5:
        return "작은 감사 하나를\n느껴봅시다.";
      case 6:
        return "조용한 자리로\n돌아가 봅시다.";
      case 7:
        return "당신의 리듬을\n떠올려 봅시다.";
      default:
        return "오늘,\n그저 자신에게 돌아와 봅니다.";
    }
  }

  if (language === "en") {
    switch (safeDay) {
      case 2:
        return "Feel only\nthis breath.";
      case 3:
        return "Listen to\nyour body.";
      case 4:
        return "Return to\nthe quiet of nature.";
      case 5:
        return "Feel one small\nmoment of gratitude.";
      case 6:
        return "Return to\na quieter place.";
      case 7:
        return "Remember\nyour own rhythm.";
      default:
        return "Today,\nsimply return to yourself.";
    }
  }

  switch (safeDay) {
    case 2:
      return "呼吸だけを\n感じてみましょう。";
    case 3:
      return "身体の声を\n聴いてみましょう。";
    case 4:
      return "自然の静けさに\n戻りましょう。";
    case 5:
      return "小さな恵みを\n感じてみましょう。";
    case 6:
      return "静けさの中へ\n戻りましょう。";
    case 7:
      return "あなたのリズムを\n思い出しましょう。";
    default:
      return "今日、\nただ自分に戻りましょう。";
  }
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
    if (elapsedSeconds < 5) return "openingFade";
    if (elapsedSeconds < 58) return "openingNarration";
    if (elapsedSeconds < 162) return "vision";
    if (elapsedSeconds < 172) return "integration";
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
      volume: MORNING_GATE_NARRATION_VOLUME,
      preferredNames: ["Yuna", "Sora", "Google 한국어", "Siri"]
    };
  }

  if (language === "en") {
    return {
      lang: "en-US",
      rate: 0.76,
      pitch: 1,
      volume: MORNING_GATE_NARRATION_VOLUME,
      preferredNames: ["Samantha", "Ava", "Victoria", "Google US English", "Siri"]
    };
  }

  return {
    lang: "ja-JP",
    rate: 0.69,
    pitch: 0.95,
    volume: MORNING_GATE_NARRATION_VOLUME,
    preferredNames: ["Kyoko", "Otoya", "Google 日本語", "Siri"]
  };
}

function getFocusGateSpeechSettings(language: "jp" | "kr" | "en") {
  if (language === "kr") {
    return {
      lang: "ko-KR",
      rate: 0.74,
      pitch: 0.98,
      volume: 1,
      preferredNames: ["Yuna", "Sora", "Google 한국어", "Siri"]
    };
  }

  if (language === "en") {
    return {
      lang: "en-US",
      rate: 0.82,
      pitch: 1,
      volume: 1,
      preferredNames: ["Samantha", "Ava", "Victoria", "Google US English", "Siri"]
    };
  }

  return {
    lang: "ja-JP",
    rate: 0.78,
    pitch: 0.96,
    volume: 1,
    preferredNames: ["Kyoko", "Otoya", "Google 日本語", "Siri"]
  };
}

function getCalmGateSpeechSettings(language: "jp" | "kr" | "en") {
  if (language === "kr") {
    return {
      lang: "ko-KR",
      rate: 0.66,
      pitch: 0.96,
      volume: 1,
      preferredNames: ["Yuna", "Sora", "Google 한국어", "Siri"]
    };
  }

  if (language === "en") {
    return {
      lang: "en-US",
      rate: 0.7,
      pitch: 0.98,
      volume: 1,
      preferredNames: ["Samantha", "Ava", "Victoria", "Google US English", "Siri"]
    };
  }

  return {
    lang: "ja-JP",
    rate: 0.64,
    pitch: 0.94,
    volume: 1,
    preferredNames: ["Kyoko", "Otoya", "Google 日本語", "Siri"]
  };
}

function getReleaseGateSpeechSettings(language: "jp" | "kr" | "en") {
  if (language === "kr") {
    return {
      lang: "ko-KR",
      rate: 0.57,
      pitch: 0.92,
      volume: 0.56,
      preferredNames: ["Yuna", "Sora", "Google 한국어", "Siri"]
    };
  }

  if (language === "en") {
    return {
      lang: "en-US",
      rate: 0.6,
      pitch: 0.94,
      volume: 0.54,
      preferredNames: ["Samantha", "Ava", "Victoria", "Google US English", "Siri"]
    };
  }

  return {
    lang: "ja-JP",
    rate: 0.54,
    pitch: 0.9,
    volume: 0.7,
    preferredNames: ["Kyoko", "Sakura", "Google 日本語", "Siri"]
  };
}

function getGratitudeGateSpeechSettings(language: "jp" | "kr" | "en") {
  if (language === "kr") {
    return {
      lang: "ko-KR",
      rate: 0.56,
      pitch: 0.93,
      volume: 0.58,
      preferredNames: ["Yuna", "Sora", "Google 한국어", "Siri"]
    };
  }

  if (language === "en") {
    return {
      lang: "en-US",
      rate: 0.58,
      pitch: 0.95,
      volume: 0.56,
      preferredNames: ["Samantha", "Ava", "Victoria", "Google US English", "Siri"]
    };
  }

  return {
    lang: "ja-JP",
    rate: 0.53,
    pitch: 0.91,
    volume: 0.72,
    preferredNames: ["Kyoko", "Sakura", "Google 日本語", "Siri"]
  };
}

function getSleepGateSpeechSettings(language: "jp" | "kr" | "en") {
  if (language === "kr") {
    return {
      lang: "ko-KR",
      rate: 0.52,
      pitch: 0.82,
      volume: 0.52,
      preferredNames: ["InJoon", "MinJoon", "Google 한국어", "Siri"]
    };
  }

  if (language === "en") {
    return {
      lang: "en-US",
      rate: 0.54,
      pitch: 0.82,
      volume: 0.5,
      preferredNames: ["Daniel", "Alex", "Google US English", "Siri"]
    };
  }

  return {
    lang: "ja-JP",
    rate: 0.5,
    pitch: 0.8,
    volume: 0.56,
    preferredNames: ["Otoya", "Google 日本語", "Siri"]
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

function getOrCreateAudioContext(audioContextRef: MutableRefObject<AudioContext | null>) {
  if (typeof window === "undefined" || !("AudioContext" in window || "webkitAudioContext" in window)) {
    return null;
  }

  if (audioContextRef.current) {
    return audioContextRef.current;
  }

  const AudioCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioCtor) {
    return null;
  }

  audioContextRef.current = new AudioCtor();
  return audioContextRef.current;
}

function isStructuredMorningMobileAudioPath() {
  return requiresMobileAudioGesture();
}

function getBasicIdentityCompletionMessage(language: "jp" | "kr" | "en") {
  if (language === "jp") {
    return "今日、また戻ることができました";
  }

  if (language === "kr") {
    return "오늘, 다시 돌아올 수 있었습니다";
  }

  return "Today, you returned again";
}

function getBasicIdentityCompletionNote(language: "jp" | "kr" | "en") {
  if (language === "jp") {
    return "戻る力が\n少しずつ育っています";
  }

  if (language === "kr") {
    return "리듬을 기억하는 힘이\n자라고 있습니다";
  }

  return "Your rhythm is\nremembering itself";
}

function getBasicIdentityCompletionBody(language: "jp" | "kr" | "en") {
  if (language === "jp") {
    return "少しずつ、リズムで生きる人に近づいています";
  }

  if (language === "kr") {
    return "조금씩, 리듬으로 살아가는 사람에 가까워지고 있습니다";
  }

  return "You are becoming someone who lives with rhythm";
}

function getLocalDayStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPreviousDayStamp(dayStamp: string) {
  const date = new Date(`${dayStamp}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return getLocalDayStamp(date);
}

function getAwakeningPromptIndex(dayStamp: string, promptCount: number) {
  const numeric = Number(dayStamp.replaceAll("-", ""));
  return Number.isFinite(numeric) && promptCount > 0 ? numeric % promptCount : 0;
}

function MeditationPageContent() {
  const searchParams = useSearchParams();
  const { authResolved } = useAuthState();
  const { language } = useLanguage();
  const copy = useSiteCopy().meditationPage;
  const journeyCopy = useMemo(() => getRhythmJourneyContent(language), [language]);
  const localizedLanguage = language === "kr" || language === "en" || language === "jp" ? language : "jp";
  const routeTypeParam = searchParams.get("type");
  const routeDoorParam = searchParams.get("door");
  const journeyModeParam = searchParams.get("journey") === "1";
  const requiredMembershipPlan = useMemo(
    () =>
      resolveMeditationRequiredPlan({
        routeType: routeTypeParam,
        meditationType: routeTypeParam,
        door: routeDoorParam,
        journeyMode: journeyModeParam
      }),
    [journeyModeParam, routeDoorParam, routeTypeParam]
  );
  const membershipAccess = useMembershipAccess(requiredMembershipPlan);
  const requiresProtectedMembership = requiredMembershipPlan !== null;
  const focusGateLines = focusGateNarration[localizedLanguage];
  const calmGateLines = calmGateNarration[localizedLanguage];
  const releaseGateLines = releaseGateNarration[localizedLanguage];
  const gratitudeGateLines = gratitudeGateNarration[localizedLanguage];
  const sleepGateLines = sleepGateNarration[localizedLanguage];
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
  const [focusGateMessage, setFocusGateMessage] = useState<string | null>(null);
  const [calmGateMessage, setCalmGateMessage] = useState<string | null>(null);
  const [releaseGateMessage, setReleaseGateMessage] = useState<string | null>(null);
  const [gratitudeGateMessage, setGratitudeGateMessage] = useState<string | null>(null);
  const [sleepGateMessage, setSleepGateMessage] = useState<string | null>(null);
  const [isRechargeVideoPlaying, setIsRechargeVideoPlaying] = useState(false);
  const [rechargeStartError, setRechargeStartError] = useState<string | null>(null);
  const [isRechargeStarting, setIsRechargeStarting] = useState(false);
  const [selectedRechargeExercise, setSelectedRechargeExercise] = useState<RechargeExerciseKey>("heelRaise");
  const [journeyMode, setJourneyMode] = useState(false);
  const [journeyDay, setJourneyDay] = useState<number | null>(null);
  const [isJourneySettling, setIsJourneySettling] = useState(false);
  const [returnToHref, setReturnToHref] = useState("/rhythm-journey");
  const [requestedRouteType, setRequestedRouteType] = useState<string | null>(null);
  const [hasInvalidRoute, setHasInvalidRoute] = useState(false);
  const [awakeningRitualState, setAwakeningRitualState] = useState<AwakeningRitualState | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const focusVideoRef = useRef<HTMLVideoElement | null>(null);
  const calmVideoRef = useRef<HTMLVideoElement | null>(null);
  const rechargeVideoRef = useRef<HTMLVideoElement | null>(null);
  const releaseVideoRef = useRef<HTMLVideoElement | null>(null);
  const gratitudeVideoRef = useRef<HTMLVideoElement | null>(null);
  const sleepVideoRef = useRef<HTMLVideoElement | null>(null);
  const affirmationVideoRef = useRef<HTMLVideoElement | null>(null);
  const energyVideoRef = useRef<HTMLVideoElement | null>(null);
  const visionVideoRef = useRef<HTMLVideoElement | null>(null);
  const morningAmbientMixRef = useRef<MorningAmbientMixState>({
    context: null,
    gainNode: null,
    sourceNode: null,
    audioBuffer: null,
    sourceUrl: null,
    loadPromise: null,
    startedAt: 0,
    offset: 0,
    targetVolume: 0,
    fadeToken: 0
  });
  const completionHandledRef = useRef(false);
  const spokenAffirmationKeysRef = useRef<Set<string>>(new Set());
  const spokenFocusKeysRef = useRef<Set<string>>(new Set());
  const spokenCalmKeysRef = useRef<Set<string>>(new Set());
  const spokenReleaseKeysRef = useRef<Set<string>>(new Set());
  const spokenGratitudeKeysRef = useRef<Set<string>>(new Set());
  const spokenSleepKeysRef = useRef<Set<string>>(new Set());
  const structuredSpeechTimeoutRef = useRef<number | null>(null);
  const focusSpeechTimeoutRef = useRef<number | null>(null);
  const calmSpeechTimeoutRef = useRef<number | null>(null);
  const releaseSpeechTimeoutRef = useRef<number | null>(null);
  const gratitudeSpeechTimeoutRef = useRef<number | null>(null);
  const sleepSpeechTimeoutRef = useRef<number | null>(null);
  const structuredSpeechSequenceRef = useRef(0);
  const focusSpeechSequenceRef = useRef(0);
  const calmSpeechSequenceRef = useRef(0);
  const releaseSpeechSequenceRef = useRef(0);
  const gratitudeSpeechSequenceRef = useRef(0);
  const sleepSpeechSequenceRef = useRef(0);
  const structuredSpeechUnlockedRef = useRef(false);
  const focusSpeechUnlockedRef = useRef(false);
  const calmSpeechUnlockedRef = useRef(false);
  const releaseSpeechUnlockedRef = useRef(false);
  const gratitudeSpeechUnlockedRef = useRef(false);
  const sleepSpeechUnlockedRef = useRef(false);
  const rechargeTimerIntervalRef = useRef<number | null>(null);
  const rechargeStartTriggerLockRef = useRef(false);
  const awakeningRitualHandledRef = useRef(false);
  const journeySettlingTimeoutRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const isCompleteRef = useRef(false);
  const elapsedTotalSeconds = totalSeconds - secondsLeft;
  const phase = useMemo(() => getBreathPhase(elapsedTotalSeconds), [elapsedTotalSeconds]);
  const isComplete = secondsLeft <= 0;
  const mappedDoor = meditationDoor === "relax" ? "rest" : meditationDoor === "vitality" ? "recharge" : meditationDoor;
  const isAffirmationGate = meditationType === "morning" && meditationDoor === "affirmation";
  const isAwakeningGate = isAffirmationGate;
  const isEnergyGate = meditationType === "morning" && meditationDoor === "energy";
  const isVisionGate = meditationType === "morning" && meditationDoor === "vision";
  const isFocusGate = meditationType === "day" && mappedDoor === "focus";
  const isCalmGate = meditationType === "day" && mappedDoor === "rest";
  const isRechargeGate = meditationType === "day" && mappedDoor === "recharge";
  const isReleaseGate = meditationType === "night" && mappedDoor === "release";
  const isGratitudeGate = meditationType === "night" && mappedDoor === "gratitude";
  const isSleepGate = meditationType === "night" && mappedDoor === "sleep";
  const isGuidedEveningGate = isReleaseGate || isGratitudeGate || isSleepGate;
  const isStructuredMorningGate = isAffirmationGate || isEnergyGate || isVisionGate;
  const ritualCopy = awakeningRitualCopy[localizedLanguage];
  const structuredMorningAudio =
    isEnergyGate
      ? MORNING_GATE_AUDIO.energy
      : null;
  const morningGateCopy: StructuredMorningCopy = isVisionGate ? visionCopy : isEnergyGate ? energyCopy : affirmationCopy;
  const basicPracticeCopy =
    getBasicPracticeByRouteType(requestedRouteType, localizedLanguage) ??
    getBasicPracticeBySession(meditationType, mappedDoor, localizedLanguage);
  const content = copy.variants[meditationType];
  const hideSoundToggle = meditationType === "morning" || isFocusGate || isCalmGate || isRechargeGate || isGuidedEveningGate;
  const durationVariant = getDurationVariant(totalSeconds);
  const durationTextSet = copy.durationTexts?.[durationVariant];
  const journeyAudioSource = journeyDay ? journeyAudioMap[journeyDay] : undefined;
  const ambientAudioSource =
    journeyMode && journeyAudioSource
      ? journeyAudioSource
      : structuredMorningAudio
        ? structuredMorningAudio.src
        : undefined;
  const ambientAudioVolume = journeyMode ? 0.65 : structuredMorningAudio?.volume;
  const ambientFadeInOptions = isStructuredMorningGate ? { fadeInMs: MORNING_GATE_FADE_IN_MS } : undefined;
  const ambientFadeOutMs = isStructuredMorningGate ? MORNING_GATE_FADE_OUT_MS : undefined;
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
  const completionMessageText = isStructuredMorningGate
    ? morningGateCopy.completionMessage
    : basicPracticeCopy
      ? getBasicIdentityCompletionMessage(localizedLanguage)
      : copy.completionMessage;
  const rechargeCompletion = rechargeCompletionCopy[localizedLanguage];
  const rechargeIntro = rechargeIntroCopy[localizedLanguage];
  const rechargeExercises = rechargeExerciseOptions[localizedLanguage];
  const selectedRechargeExerciseLabel =
    rechargeExercises.items.find((item) => item.key === selectedRechargeExercise)?.label ??
    rechargeExercises.items[0]?.label ??
    "";
  const isJapaneseRechargeLabel = localizedLanguage === "jp";
  const rechargeStartErrorText =
    localizedLanguage === "kr"
      ? "다시 한 번 탭해서 시작해 주세요"
      : localizedLanguage === "en"
        ? "Tap once more to start"
        : "もう一度タップして開始してください";
  const rechargeStartLabel =
    localizedLanguage === "kr"
      ? "Recharge 시작하기"
      : localizedLanguage === "en"
        ? "Start Recharge"
        : "リチャージを始める";
  const journeyCalmingLine = getJourneyEntranceLine(localizedLanguage, journeyDay);
  const completionNoteText = isStructuredMorningGate
    ? morningGateCopy.completionNote
    : basicPracticeCopy
      ? getBasicIdentityCompletionNote(localizedLanguage)
      : copy.completionReturnText;
  const completionBodyText =
    !journeyMode && !isStructuredMorningGate
      ? basicPracticeCopy
        ? getBasicIdentityCompletionBody(localizedLanguage)
        : copy.completionBody
      : null;
  const circleScaleClass =
    phase === "inhale" ? "scale-110" : phase === "hold" ? "scale-110" : "scale-90";
  const showJourneyEntranceVisual = journeyMode && !isComplete && (needsUserStart || isJourneySettling);
  const affirmationProgress = isStructuredMorningGate ? Math.min(100, (elapsedTotalSeconds / AFFIRMATION_TOTAL_SECONDS) * 100) : 0;
  const awakeningCompletedOn = awakeningRitualState?.completedOn ?? getLocalDayStamp();
  const awakeningPrompt = ritualCopy.prompts[getAwakeningPromptIndex(awakeningCompletedOn, ritualCopy.prompts.length)];
  const awakeningContinuity = ritualCopy.continuity(awakeningRitualState?.streakCount ?? 1);
  const morningGateReturnHref =
    returnToHref === "/rhythm-journey" ? "/program/basic?rhythm=morning" : returnToHref;
  const finishForTodayHref = morningGateReturnHref.split("?")[0] || "/program/basic";
  const continueToEnergyHref = `/meditation?duration=180&type=morning-energy&returnTo=${encodeURIComponent(morningGateReturnHref)}`;
  const rechargeReturnHref =
    returnToHref === "/rhythm-journey" ? "/program/basic?rhythm=daytime" : returnToHref;
  const invalidRouteCopy =
    localizedLanguage === "kr"
      ? {
          title: "명상을 여는 경로를 확인할 수 없습니다",
          body: "다시 시도하거나 BASIC으로 돌아가 주세요.",
          button: "BASIC으로 돌아가기"
        }
      : localizedLanguage === "en"
        ? {
            title: "This meditation link could not be opened",
            body: "Please try again or return to BASIC.",
            button: "Return to BASIC"
          }
        : {
            title: "この瞑想のリンクを開けませんでした",
            body: "もう一度試すか、BASICへ戻ってください。",
            button: "BASICへ戻る"
          };

  function logStructuredMorningAmbientState(stage: string) {
    if (typeof window === "undefined") {
      return;
    }

    const audio = ambientAudioRef.current;
    const context = audioContextRef.current;

    console.log("[Morning Gate Audio]", stage, {
      gate: meditationDoor,
      src: structuredMorningAudio?.src ?? null,
      mobilePath: isStructuredMorningMobileAudioPath(),
      audioElementCreated: Boolean(audio),
      audioPaused: audio?.paused ?? null,
      audioMuted: audio?.muted ?? null,
      audioVolume: audio?.volume ?? null,
      audioCurrentTime: audio?.currentTime ?? null,
      audioReadyState: audio?.readyState ?? null,
      audioNetworkState: audio?.networkState ?? null,
      contextState: context?.state ?? null,
      gainValue: morningAmbientMixRef.current.gainNode?.gain.value ?? null,
      hasSourceNode: Boolean(morningAmbientMixRef.current.sourceNode)
    });
  }

  async function loadMorningAmbientBuffer(source: string) {
    const mix = morningAmbientMixRef.current;

    if (mix.audioBuffer && mix.sourceUrl === source) {
      return mix.audioBuffer;
    }

    if (mix.loadPromise && mix.sourceUrl === source) {
      return mix.loadPromise;
    }

    const context = getOrCreateAudioContext(audioContextRef);

    if (!context) {
      throw new Error("Web Audio API is unavailable for Morning Gate ambient playback");
    }

    mix.context = context;
    mix.sourceUrl = source;
    mix.loadPromise = fetch(source)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load Morning Gate ambient audio: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return await context.decodeAudioData(arrayBuffer.slice(0));
      })
      .then((buffer) => {
        mix.audioBuffer = buffer;
        mix.loadPromise = null;
        return buffer;
      })
      .catch((error) => {
        mix.audioBuffer = null;
        mix.loadPromise = null;
        throw error;
      });

    return mix.loadPromise;
  }

  function stopMorningAmbientSource(resetOffset = false) {
    const mix = morningAmbientMixRef.current;

    if (mix.sourceNode) {
      try {
        mix.sourceNode.stop();
      } catch (_error) {
        // Ignore stop errors for already-ended sources.
      }

      mix.sourceNode.disconnect();
      mix.sourceNode = null;
    }

    if (resetOffset) {
      mix.offset = 0;
      mix.startedAt = 0;
    }
  }

  async function startStructuredMorningAmbient(options?: { restartFromBeginning?: boolean; fadeInMs?: number }) {
    if (isAffirmationGate) {
      await playAffirmationGateVideo(options);
      return { started: true };
    }

    if (isVisionGate) {
      await playVisionGateVideo(options);
      return { started: true };
    }

    if (!structuredMorningAudio) {
      return { started: false };
    }

    logStructuredMorningAmbientState("structured-start-before");

    const startResult = await startAmbientNatureAudio(
      ambientAudioRef,
      true,
      structuredMorningAudio.src,
      structuredMorningAudio.volume,
      {
        fadeInMs: options?.fadeInMs ?? MORNING_GATE_FADE_IN_MS,
        restartFromBeginning: options?.restartFromBeginning ?? false
      }
    );

    if (startResult.started) {
      logStructuredMorningAmbientState("structured-start-success");
      return startResult;
    }

    console.warn("[Morning Gate Audio] structured start failed, retrying once", startResult.error);

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 300);
    });

    const retryResult = await startAmbientNatureAudio(
      ambientAudioRef,
      true,
      structuredMorningAudio.src,
      structuredMorningAudio.volume,
      {
        fadeInMs: 800,
        restartFromBeginning: false
      }
    );

    logStructuredMorningAmbientState(retryResult.started ? "structured-retry-success" : "structured-retry-failed");
    return retryResult;
  }

  async function pauseStructuredMorningAmbient() {
    if (isAffirmationGate) {
      const video = affirmationVideoRef.current;
      if (video) {
        video.pause();
      }
      return;
    }

    if (isVisionGate) {
      const video = visionVideoRef.current;
      if (video) {
        video.pause();
      }
      return;
    }

    console.log("[Morning Gate Audio] structured-pause");
    pauseAmbientNatureAudio(ambientAudioRef);
  }

  async function resumeStructuredMorningAmbient() {
    if (isAffirmationGate) {
      await playAffirmationGateVideo({ restartFromBeginning: false });
      return { started: true };
    }

    if (isVisionGate) {
      await playVisionGateVideo({ restartFromBeginning: false });
      return { started: true };
    }

    if (!structuredMorningAudio) {
      return { started: false };
    }

    logStructuredMorningAmbientState("structured-resume-before");

    const result = await resumeAmbientNatureAudio(
      ambientAudioRef,
      true,
      structuredMorningAudio.volume,
      { fadeInMs: 800 }
    );

    if (result.started) {
      logStructuredMorningAmbientState("structured-resume-success");
      return result;
    }

    return await startStructuredMorningAmbient({ fadeInMs: MORNING_GATE_FADE_IN_MS });
  }

  async function stopStructuredMorningAmbient() {
    if (isAffirmationGate) {
      const video = affirmationVideoRef.current;
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      logStructuredMorningAmbientState("structured-stop-after");
      return;
    }

    if (isVisionGate) {
      const video = visionVideoRef.current;
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      logStructuredMorningAmbientState("structured-stop-after");
      return;
    }

    logStructuredMorningAmbientState("structured-stop-before");
    await stopAmbientNatureAudio(ambientAudioRef, MORNING_GATE_FADE_OUT_MS);
    stopMorningAmbientSource(true);
    logStructuredMorningAmbientState("structured-stop-after");
  }

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);

  useEffect(() => {
    if (requiresProtectedMembership && !membershipAccess.canRender) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const resolvedRoute = resolveMeditationRoute(searchParams, localizedLanguage);
    const pendingJourneyAudio = safeSessionStorageGet(JOURNEY_AUDIO_PENDING_KEY);
    const pendingStructuredAmbientAudio = safeSessionStorageGet(STRUCTURED_AMBIENT_PENDING_KEY);
    const storedJourneyDay = safeSessionStorageGet(JOURNEY_AUDIO_DAY_KEY);
    const resolvedJourneyDay = resolvedRoute.journeyDay ?? Number(storedJourneyDay);

    const isThreeMinuteMorningDoor =
      resolvedRoute.meditationType === "morning" &&
      (resolvedRoute.meditationDoor === "affirmation" || resolvedRoute.meditationDoor === "energy" || resolvedRoute.meditationDoor === "vision");
    const isFocusGateProgram = resolvedRoute.meditationType === "day" && resolvedRoute.meditationDoor === "focus";
    const isCalmGateProgram = resolvedRoute.meditationType === "day" && resolvedRoute.meditationDoor === "rest";
    const isRechargeGateProgram = resolvedRoute.meditationType === "day" && resolvedRoute.meditationDoor === "recharge";
    const isReleaseGateProgram = resolvedRoute.meditationType === "night" && resolvedRoute.meditationDoor === "release";
    const isGratitudeGateProgram = resolvedRoute.meditationType === "night" && resolvedRoute.meditationDoor === "gratitude";
    const isSleepGateProgram = resolvedRoute.meditationType === "night" && resolvedRoute.meditationDoor === "sleep";
    const shouldResumeStructuredAmbient =
      resolvedRoute.meditationType === "morning" &&
      resolvedRoute.meditationDoor === "affirmation" &&
      pendingStructuredAmbientAudio === "1";
    const mobileNeedsGesture = requiresMobileAudioGesture();
    const isProgramMode = resolvedRoute.journeyMode || resolvedRoute.meditationType !== "default";
    const isDev = process.env.NODE_ENV !== "production";

    if (isDev) {
      console.log("[meditation-bootstrap] route", {
        normalizedType: resolvedRoute.meditationType,
        normalizedDoor: resolvedRoute.meditationDoor,
        journeyMode: resolvedRoute.journeyMode,
        routeInvalid: resolvedRoute.routeInvalid,
        hasSessionStorage: pendingJourneyAudio !== null || pendingStructuredAmbientAudio !== null || storedJourneyDay !== null,
        hasAmbientRef: Boolean(ambientAudioRef.current),
        hasAudioContextApi:
          typeof window !== "undefined" && ("AudioContext" in window || "webkitAudioContext" in window),
        hasSpeechSynthesis: typeof window !== "undefined" && "speechSynthesis" in window
      });
    }

    if (resolvedRoute.routeInvalid) {
      setHasInvalidRoute(true);
      setRequestedRouteType(resolvedRoute.routeType);
      setReturnToHref("/program/basic");
      return;
    }

    setHasInvalidRoute(false);
    setTotalSeconds(resolvedRoute.durationSeconds);
    setSecondsLeft(resolvedRoute.durationSeconds);
    setMeditationType(resolvedRoute.meditationType);
    setMeditationDoor(resolvedRoute.meditationDoor);
    setRequestedRouteType(resolvedRoute.routeType);
    const nextSoundEnabled =
      resolvedRoute.journeyMode && pendingJourneyAudio
        ? true
        : shouldResumeStructuredAmbient
          ? true
          : getNatureSoundPreference();
    const shouldPromptForAudioStart = isThreeMinuteMorningDoor || isFocusGateProgram || isCalmGateProgram || isRechargeGateProgram || isReleaseGateProgram || isGratitudeGateProgram || isSleepGateProgram || (mobileNeedsGesture && (isProgramMode || nextSoundEnabled));
    setSoundEnabled(isFocusGateProgram || isCalmGateProgram || isRechargeGateProgram || isReleaseGateProgram || isGratitudeGateProgram || isSleepGateProgram ? true : nextSoundEnabled);
    setPendingStructuredAmbientStart(shouldResumeStructuredAmbient);
    setJourneyMode(resolvedRoute.journeyMode);
    setJourneyDay(Number.isInteger(resolvedJourneyDay) && resolvedJourneyDay >= 1 && resolvedJourneyDay <= 7 ? resolvedJourneyDay : null);
    setIsJourneySettling(false);
    setReturnToHref(resolvedRoute.returnToHref || "/rhythm-journey");
    setAmbientVideoFailed(false);
    setShowAmbientRetry(false);
    setNeedsUserStart(shouldPromptForAudioStart);
    setRequiresExplicitAudioStart(shouldPromptForAudioStart);
    setHasUserGesture(!shouldPromptForAudioStart);
    setIsPaused(mobileNeedsGesture && isProgramMode);
    setAffirmationMessage(null);
    setFocusGateMessage(null);
    setCalmGateMessage(null);
    setReleaseGateMessage(null);
    setGratitudeGateMessage(null);
    setSleepGateMessage(null);
    setIsRechargeVideoPlaying(false);
    setRechargeStartError(null);
    spokenFocusKeysRef.current = new Set();
    spokenCalmKeysRef.current = new Set();
    spokenReleaseKeysRef.current = new Set();
    spokenGratitudeKeysRef.current = new Set();
    spokenSleepKeysRef.current = new Set();
    spokenAffirmationKeysRef.current = new Set();
    completionHandledRef.current = false;

    if (isDev) {
      console.log("[Morning Gate Audio] init", {
        gate: resolvedRoute.meditationDoor,
        mobileNeedsGesture,
        nextSoundEnabled,
        shouldPromptForAudioStart,
        pendingStructuredAmbientAudio,
        structuredAudioSource:
          resolvedRoute.meditationType === "morning" && resolvedRoute.meditationDoor === "affirmation"
            ? AWAKENING_GATE_VIDEO_SRC
            : resolvedRoute.meditationType === "morning" && resolvedRoute.meditationDoor === "energy"
              ? MORNING_GATE_AUDIO.energy.src
              : resolvedRoute.meditationType === "morning" && resolvedRoute.meditationDoor === "vision"
                ? VISION_GATE_VIDEO_SRC
                : null
      });
      console.log("[Journey Audio] journeyMode:", resolvedRoute.journeyMode);
      console.log("[Journey Audio] journeyDay:", resolvedJourneyDay);
      console.log(
        "[Journey Audio] src:",
        Number.isInteger(resolvedJourneyDay) && resolvedJourneyDay >= 1 && resolvedJourneyDay <= 7
          ? journeyAudioMap[resolvedJourneyDay]
          : undefined
      );
      console.log("[Journey Audio] pending:", pendingJourneyAudio);
      console.log("[Journey Audio] audio element:", ambientAudioRef.current);
    }
  }, [localizedLanguage, membershipAccess.canRender, requiresProtectedMembership]);

  async function handleAmbientStartResult(result: { started: boolean; error?: unknown }, manual = false) {
    if (journeyMode && journeyDay) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[Journey Audio] journeyMode:", journeyMode);
        console.log("[Journey Audio] journeyDay:", journeyDay);
        console.log("[Journey Audio] src:", ambientAudioSource);
        console.log("[Journey Audio] pending:", safeSessionStorageGet(JOURNEY_AUDIO_PENDING_KEY));
        console.log("[Journey Audio] audio element:", ambientAudioRef.current);
      }
    }

    if (result.started) {
      if (journeyMode) {
        console.log("[Journey Audio] play started");
        if (journeySettlingTimeoutRef.current !== null) {
          window.clearTimeout(journeySettlingTimeoutRef.current);
        }
        setIsJourneySettling(true);
        journeySettlingTimeoutRef.current = window.setTimeout(() => {
          setIsJourneySettling(false);
          journeySettlingTimeoutRef.current = null;
        }, JOURNEY_SETTLING_MS);
      }

      setShowAmbientRetry(false);
      setNeedsUserStart(false);
      setRequiresExplicitAudioStart(false);
      setIsPaused(false);
      setSoundEnabled(true);
      setNatureSoundPreference(true);
      setPendingStructuredAmbientStart(false);

      safeSessionStorageRemove(JOURNEY_AUDIO_PENDING_KEY);
      safeSessionStorageRemove(JOURNEY_AUDIO_DAY_KEY);
      safeSessionStorageRemove(STRUCTURED_AMBIENT_PENDING_KEY);

      return;
    }

    if (journeyMode) {
      setSoundEnabled(false);
      setNatureSoundPreference(false);
      setNeedsUserStart(true);
      setIsPaused(true);
      setIsJourneySettling(false);
      console.warn("[Journey Audio] play failed");
      if (result.error) {
        console.error(`[Journey Audio] ${manual ? "manual start" : "autoplay"} failed:`, result.error);
      }

      if (typeof window !== "undefined") {
        console.warn("[Journey Audio] exact pending state kept for manual retry");
      }
    } else if (isStructuredMorningGate) {
      setShowAmbientRetry(true);
      setPendingStructuredAmbientStart(false);
      if (manual) {
        setNeedsUserStart(false);
        setIsPaused(false);
        setRequiresExplicitAudioStart(false);
      } else {
        setNeedsUserStart(true);
        setIsPaused(true);
      }
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

  async function playAffirmationGateVideo(options?: { restartFromBeginning?: boolean }) {
    if (!isAffirmationGate || typeof window === "undefined") {
      return;
    }

    const video = affirmationVideoRef.current;

    if (!video) {
      return;
    }

    try {
      video.defaultMuted = false;
      video.muted = false;
      video.volume = AWAKENING_GATE_VIDEO_VOLUME;
      video.playsInline = true;
      if (options?.restartFromBeginning ?? false) {
        video.currentTime = 0;
      }
      await video.play();
      setAmbientVideoFailed(false);
    } catch (error) {
      console.warn("[awakening-gate] video playback failed", error);
      setAmbientVideoFailed(true);
    }
  }

  async function playFocusGateVideo(options?: { restartFromBeginning?: boolean }) {
    if (!isFocusGate || typeof window === "undefined") {
      return;
    }

    const video = focusVideoRef.current;

    if (!video) {
      return;
    }

    try {
      video.defaultMuted = false;
      video.muted = false;
      video.volume = FOCUS_GATE_VIDEO_VOLUME;
      video.playsInline = true;
      if (options?.restartFromBeginning ?? false) {
        video.currentTime = 0;
      }
      await video.play();
      setAmbientVideoFailed(false);
    } catch (error) {
      console.warn("[focus-gate] video playback failed", error);
      setAmbientVideoFailed(true);
    }
  }

  async function playCalmGateVideo(options?: { restartFromBeginning?: boolean }) {
    if (!isCalmGate || typeof window === "undefined") {
      return;
    }

    const video = calmVideoRef.current;

    if (!video) {
      return;
    }

    try {
      video.defaultMuted = false;
      video.muted = false;
      video.volume = CALM_GATE_VIDEO_VOLUME;
      video.playsInline = true;
      if (options?.restartFromBeginning ?? false) {
        video.currentTime = 0;
      }
      await video.play();
      setAmbientVideoFailed(false);
    } catch (error) {
      console.warn("[calm-gate] video playback failed", error);
      setAmbientVideoFailed(true);
    }
  }

  async function playRechargeGateVideo(options?: { restartFromBeginning?: boolean }) {
    if (!isRechargeGate || typeof window === "undefined") {
      return false;
    }

    const video = rechargeVideoRef.current;

    if (!video) {
      return false;
    }

    try {
      video.defaultMuted = false;
      video.muted = false;
      video.volume = RECHARGE_GATE_VIDEO_VOLUME;
      video.playsInline = true;
      if (options?.restartFromBeginning ?? false) {
        video.currentTime = 0;
      }
      await video.play();
      if (options?.restartFromBeginning ?? false) {
        const fullscreenTarget = video as HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
          webkitRequestFullscreen?: () => Promise<void> | void;
        };
        try {
          if (document.fullscreenEnabled && video.requestFullscreen) {
            await video.requestFullscreen();
          } else if (fullscreenTarget.webkitRequestFullscreen) {
            await fullscreenTarget.webkitRequestFullscreen();
          } else if (fullscreenTarget.webkitEnterFullscreen) {
            fullscreenTarget.webkitEnterFullscreen();
          }
        } catch (error) {
          console.warn("[recharge-gate] fullscreen unavailable", error);
        }
      }
      setAmbientVideoFailed(false);
      return true;
    } catch (error) {
      console.warn("[recharge-gate] video playback failed", error);
      setAmbientVideoFailed(true);
      return false;
    }
  }

  async function playReleaseGateVideo(options?: { restartFromBeginning?: boolean }) {
    if (!isReleaseGate || typeof window === "undefined") {
      return;
    }

    const video = releaseVideoRef.current;

    if (!video) {
      return;
    }

    try {
      video.defaultMuted = false;
      video.muted = false;
      video.volume = EVENING_RELEASE_VIDEO_VOLUME;
      video.playsInline = true;
      if (options?.restartFromBeginning ?? false) {
        video.currentTime = 0;
      }
      await video.play();
      setAmbientVideoFailed(false);
    } catch (error) {
      console.warn("[release-gate] video playback failed", error);
      setAmbientVideoFailed(true);
    }
  }

  async function playGratitudeGateVideo(options?: { restartFromBeginning?: boolean }) {
    if (!isGratitudeGate || typeof window === "undefined") {
      return;
    }

    const video = gratitudeVideoRef.current;

    if (!video) {
      return;
    }

    try {
      video.defaultMuted = false;
      video.muted = false;
      video.volume = EVENING_GRATITUDE_VIDEO_VOLUME;
      video.playsInline = true;
      if (options?.restartFromBeginning ?? false) {
        video.currentTime = 0;
      }
      await video.play();
      setAmbientVideoFailed(false);
    } catch (error) {
      console.warn("[gratitude-gate] video playback failed", error);
      setAmbientVideoFailed(true);
    }
  }

  async function playSleepGateVideo(options?: { restartFromBeginning?: boolean }) {
    if (!isSleepGate || typeof window === "undefined") {
      return;
    }

    const video = sleepVideoRef.current;

    if (!video) {
      return;
    }

    try {
      video.defaultMuted = false;
      video.muted = false;
      video.volume = EVENING_SLEEP_VIDEO_VOLUME;
      video.playsInline = true;
      if (options?.restartFromBeginning ?? false) {
        video.currentTime = 0;
      }
      await video.play();
      setAmbientVideoFailed(false);
    } catch (error) {
      console.warn("[sleep-gate] video playback failed", error);
      setAmbientVideoFailed(true);
    }
  }

  async function playEnergyGateVideo() {
    if (!isEnergyGate || typeof window === "undefined") {
      return;
    }

    const video = energyVideoRef.current;

    if (!video) {
      return;
    }

    try {
      video.muted = true;
      video.playsInline = true;
      video.currentTime = 0;
      await video.play();
      setAmbientVideoFailed(false);
    } catch (error) {
      console.warn("[energy-gate] video playback failed", error);
      setAmbientVideoFailed(true);
    }
  }

  async function playVisionGateVideo(options?: { restartFromBeginning?: boolean }) {
    if (!isVisionGate || typeof window === "undefined") {
      return;
    }

    const video = visionVideoRef.current;

    if (!video) {
      return;
    }

    try {
      video.defaultMuted = false;
      video.muted = false;
      video.volume = VISION_GATE_VIDEO_VOLUME;
      video.playsInline = true;
      if (options?.restartFromBeginning ?? false) {
        video.currentTime = 0;
      }
      await video.play();
      setAmbientVideoFailed(false);
    } catch (error) {
      console.warn("[vision-gate] video playback failed", error);
      setAmbientVideoFailed(true);
    }
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

  function unlockFocusGateSpeech() {
    if (!isFocusGate || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      const synth = window.speechSynthesis;
      const settings = getFocusGateSpeechSettings(localizedLanguage);
      synth.getVoices();

      if (focusSpeechUnlockedRef.current) {
        return;
      }

      const unlockUtterance = new SpeechSynthesisUtterance("\u00A0");
      unlockUtterance.lang = settings.lang;
      unlockUtterance.volume = 0;
      unlockUtterance.rate = settings.rate;
      unlockUtterance.pitch = settings.pitch;
      focusSpeechUnlockedRef.current = true;
      synth.cancel();
      synth.speak(unlockUtterance);
    } catch (error) {
      console.warn("[focus-gate] failed to unlock speech synthesis", error);
    }
  }

  function unlockCalmGateSpeech() {
    if (!isCalmGate || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      const synth = window.speechSynthesis;
      const settings = getCalmGateSpeechSettings(localizedLanguage);
      synth.getVoices();

      if (calmSpeechUnlockedRef.current) {
        return;
      }

      const unlockUtterance = new SpeechSynthesisUtterance("\u00A0");
      unlockUtterance.lang = settings.lang;
      unlockUtterance.volume = 0;
      unlockUtterance.rate = settings.rate;
      unlockUtterance.pitch = settings.pitch;
      calmSpeechUnlockedRef.current = true;
      synth.cancel();
      synth.speak(unlockUtterance);
    } catch (error) {
      console.warn("[calm-gate] failed to unlock speech synthesis", error);
    }
  }

  function unlockReleaseGateSpeech() {
    if (!isReleaseGate || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      const synth = window.speechSynthesis;
      const settings = getReleaseGateSpeechSettings(localizedLanguage);
      synth.getVoices();

      if (releaseSpeechUnlockedRef.current) {
        return;
      }

      const unlockUtterance = new SpeechSynthesisUtterance("\u00A0");
      unlockUtterance.lang = settings.lang;
      unlockUtterance.volume = 0;
      unlockUtterance.rate = settings.rate;
      unlockUtterance.pitch = settings.pitch;
      releaseSpeechUnlockedRef.current = true;
      synth.cancel();
      synth.speak(unlockUtterance);
    } catch (error) {
      console.warn("[release-gate] failed to unlock speech synthesis", error);
    }
  }

  function unlockGratitudeGateSpeech() {
    if (!isGratitudeGate || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      const synth = window.speechSynthesis;
      const settings = getGratitudeGateSpeechSettings(localizedLanguage);
      synth.getVoices();

      if (gratitudeSpeechUnlockedRef.current) {
        return;
      }

      const unlockUtterance = new SpeechSynthesisUtterance("\u00A0");
      unlockUtterance.lang = settings.lang;
      unlockUtterance.volume = 0;
      unlockUtterance.rate = settings.rate;
      unlockUtterance.pitch = settings.pitch;
      gratitudeSpeechUnlockedRef.current = true;
      synth.cancel();
      synth.speak(unlockUtterance);
    } catch (error) {
      console.warn("[gratitude-gate] failed to unlock speech synthesis", error);
    }
  }

  function unlockSleepGateSpeech() {
    if (!isSleepGate || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      const synth = window.speechSynthesis;
      const settings = getSleepGateSpeechSettings(localizedLanguage);
      synth.getVoices();

      if (sleepSpeechUnlockedRef.current) {
        return;
      }

      const unlockUtterance = new SpeechSynthesisUtterance("\u00A0");
      unlockUtterance.lang = settings.lang;
      unlockUtterance.volume = 0;
      unlockUtterance.rate = settings.rate;
      unlockUtterance.pitch = settings.pitch;
      sleepSpeechUnlockedRef.current = true;
      synth.cancel();
      synth.speak(unlockUtterance);
    } catch (error) {
      console.warn("[sleep-gate] failed to unlock speech synthesis", error);
    }
  }

  useEffect(() => {
    setVibrationSupported(supportsMeditationVibration());

    const markGesture = () => {
      setHasUserGesture(true);

      if (requiresExplicitAudioStart) {
        return;
      }

      if (!isComplete && soundEnabled && !journeyMode && !isStructuredMorningGate && !isFocusGate && !isCalmGate && !isRechargeGate && !isGuidedEveningGate) {
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
    };
  }, [ambientAudioSource, ambientAudioVolume, isCalmGate, isComplete, isFocusGate, isGuidedEveningGate, isRechargeGate, isStructuredMorningGate, journeyMode, requiresExplicitAudioStart, soundEnabled]);

  useEffect(() => {
    return () => {
      if (journeySettlingTimeoutRef.current !== null) {
        window.clearTimeout(journeySettlingTimeoutRef.current);
      }
      void stopStructuredMorningAmbient();

      const focusVideo = focusVideoRef.current;
      if (focusVideo) {
        focusVideo.pause();
        focusVideo.currentTime = 0;
      }

      const calmVideo = calmVideoRef.current;
      if (calmVideo) {
        calmVideo.pause();
        calmVideo.currentTime = 0;
      }

      const releaseVideo = releaseVideoRef.current;
      if (releaseVideo) {
        releaseVideo.pause();
        releaseVideo.currentTime = 0;
      }

      const gratitudeVideo = gratitudeVideoRef.current;
      if (gratitudeVideo) {
        gratitudeVideo.pause();
        gratitudeVideo.currentTime = 0;
      }

      const sleepVideo = sleepVideoRef.current;
      if (sleepVideo) {
        sleepVideo.pause();
        sleepVideo.currentTime = 0;
      }

      const rechargeVideo = rechargeVideoRef.current;
      if (rechargeVideo) {
        rechargeVideo.pause();
        rechargeVideo.currentTime = 0;
      }

      clearRechargeTimer();

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        focusSpeechSequenceRef.current += 1;
        calmSpeechSequenceRef.current += 1;
        releaseSpeechSequenceRef.current += 1;
        gratitudeSpeechSequenceRef.current += 1;
        sleepSpeechSequenceRef.current += 1;
        window.speechSynthesis.cancel();
      }

      void stopAmbientNatureAudio(ambientAudioRef, ambientFadeOutMs);
    };
  }, []);

  useEffect(() => {
    if (!isGuidedEveningGate) {
      return;
    }

    void stopAmbientNatureAudio(ambientAudioRef, 0);
  }, [isGuidedEveningGate]);

  useEffect(() => {
    if (isRechargeGate || secondsLeft <= 0 || isPaused || needsUserStart) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isPaused, isRechargeGate, needsUserStart, secondsLeft]);

  useEffect(() => {
    if (!isStructuredMorningGate || !soundEnabled) {
      return;
    }

    if (isPaused) {
      void pauseStructuredMorningAmbient();
      return;
    }

    if (!hasUserGesture || isComplete) {
      return;
    }

    void resumeStructuredMorningAmbient().then((result) => {
      void handleAmbientStartResult(result, true);
    });
  }, [hasUserGesture, isComplete, isPaused, isStructuredMorningGate, soundEnabled]);

  useEffect(() => {
    if ((!isAffirmationGate && !isEnergyGate && !isVisionGate) || !hasUserGesture || isPaused || isComplete || needsUserStart) {
      return;
    }

    if (isAffirmationGate) {
      void playAffirmationGateVideo();
      return;
    }

    if (isEnergyGate) {
      void playEnergyGateVideo();
      return;
    }

    if (isVisionGate) {
      void playVisionGateVideo();
    }
  }, [hasUserGesture, isComplete, isEnergyGate, isPaused, isVisionGate, needsUserStart]);

  useEffect(() => {
    if (!isFocusGate || !hasUserGesture || isPaused || isComplete || needsUserStart) {
      return;
    }

    void playFocusGateVideo();
  }, [hasUserGesture, isComplete, isFocusGate, isPaused, needsUserStart]);

  useEffect(() => {
    if (!isCalmGate || !hasUserGesture || isPaused || isComplete || needsUserStart) {
      return;
    }

    void playCalmGateVideo();
  }, [hasUserGesture, isCalmGate, isComplete, isPaused, needsUserStart]);

  useEffect(() => {
    if (!isReleaseGate || !hasUserGesture || isPaused || isComplete || needsUserStart) {
      return;
    }

    void playReleaseGateVideo();
  }, [hasUserGesture, isComplete, isPaused, isReleaseGate, needsUserStart]);

  useEffect(() => {
    if (!isGratitudeGate || !hasUserGesture || isPaused || isComplete || needsUserStart) {
      return;
    }

    void playGratitudeGateVideo();
  }, [hasUserGesture, isComplete, isGratitudeGate, isPaused, needsUserStart]);

  useEffect(() => {
    if (!isSleepGate || !hasUserGesture || isPaused || isComplete || needsUserStart) {
      return;
    }

    void playSleepGateVideo();
  }, [hasUserGesture, isComplete, isPaused, isSleepGate, needsUserStart]);

  useEffect(() => {
    if (isComplete || !soundEnabled) {
      if (isStructuredMorningGate) {
        void stopStructuredMorningAmbient();
      } else if (isFocusGate) {
        const video = focusVideoRef.current;
        if (video) {
          video.pause();
        }
      } else if (isCalmGate) {
        const video = calmVideoRef.current;
        if (video) {
          video.pause();
        }
      } else if (isReleaseGate) {
        const video = releaseVideoRef.current;
        if (video) {
          video.pause();
        }
      } else if (isGratitudeGate) {
        const video = gratitudeVideoRef.current;
        if (video) {
          video.pause();
        }
      } else if (isSleepGate) {
        const video = sleepVideoRef.current;
        if (video) {
          video.pause();
        }
      } else if (isRechargeGate) {
        const video = rechargeVideoRef.current;
        if (video) {
          video.pause();
        }
        setIsRechargeVideoPlaying(false);
      } else {
        void stopAmbientNatureAudio(ambientAudioRef, ambientFadeOutMs);
      }
      return;
    }

    if (!hasUserGesture || journeyMode || isStructuredMorningGate || isFocusGate || isCalmGate || isRechargeGate || isGuidedEveningGate) {
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
        void stopAmbientNatureAudio(ambientAudioRef, ambientFadeOutMs);
      }
    };
  }, [ambientAudioSource, ambientAudioVolume, hasUserGesture, isCalmGate, isComplete, isFocusGate, isGuidedEveningGate, isRechargeGate, isStructuredMorningGate, journeyMode, soundEnabled]);

  useEffect(() => {
    if (!pendingStructuredAmbientStart || !isAffirmationGate || isComplete || requiresExplicitAudioStart) {
      return;
    }

    void startStructuredMorningAmbient({
      restartFromBeginning: false,
      fadeInMs: MORNING_GATE_FADE_IN_MS
    }).then((result) => {
      void handleAmbientStartResult(result);
    });
  }, [isAffirmationGate, isComplete, pendingStructuredAmbientStart, requiresExplicitAudioStart]);

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
    if (!isAwakeningGate || !isComplete || typeof window === "undefined") {
      if (!isComplete) {
        awakeningRitualHandledRef.current = false;
        setAwakeningRitualState(null);
      }
      return;
    }

    if (awakeningRitualHandledRef.current) {
      return;
    }

    awakeningRitualHandledRef.current = true;

    const today = getLocalDayStamp();
    const yesterday = getPreviousDayStamp(today);
    let streakCount = 1;

    try {
      const storedValue = safeLocalStorageGet(AWAKENING_RITUAL_STORAGE_KEY);

      if (storedValue) {
        const parsed = JSON.parse(storedValue) as AwakeningRitualState;

        if (parsed.completedOn === today) {
          streakCount = parsed.streakCount > 0 ? parsed.streakCount : 1;
        } else if (parsed.completedOn === yesterday) {
          streakCount = (parsed.streakCount > 0 ? parsed.streakCount : 0) + 1;
        }
      }

      const nextState = { streakCount, completedOn: today };
      safeLocalStorageSet(AWAKENING_RITUAL_STORAGE_KEY, JSON.stringify(nextState));
      setAwakeningRitualState(nextState);
    } catch (error) {
      console.warn("[awakening-gate] failed to persist ritual continuity", error);
      setAwakeningRitualState({ streakCount, completedOn: today });
    }
  }, [isAwakeningGate, isComplete]);

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
        const speechDelayMs = nextLine.speechDelayMs ?? (isFirstStructuredLine ? 620 : 420);

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

          const utterance = new SpeechSynthesisUtterance(nextLine.speechText ?? nextLine.text);
          utterance.lang = settings.lang;
          utterance.rate = isVisionGate ? settings.rate * VISION_GATE_SPEECH_RATE_RATIO : settings.rate;
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
            console.log("[Morning Gate Narration] started", {
              gate: meditationDoor,
              language,
              key: nextLine.key,
              text: nextLine.speechText ?? nextLine.text
            });
          };
          utterance.onerror = (event) => {
            console.error("[Morning Gate Narration] failed", {
              gate: meditationDoor,
              language,
              key: nextLine.key,
              error: event.error
            });
            structuredSpeechTimeoutRef.current = null;
          };
          utterance.onend = () => {
            structuredSpeechTimeoutRef.current = null;
          };

          synth.cancel();
          synth.speak(utterance);
        };

        structuredSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(0), speechDelayMs);
      } catch (error) {
        console.warn("[affirmation-gate] speech synthesis unavailable", error);
      }
    }
  }, [
    ambientAudioSource,
    ambientFadeInOptions,
    ambientAudioVolume,
    elapsedTotalSeconds,
    handleAmbientStartResult,
    isComplete,
    isPaused,
    isStructuredMorningGate,
    isVisionGate,
    language,
    morningGateCopy
  ]);

  useEffect(() => {
    if (!isFocusGate || isComplete || isPaused || needsUserStart || typeof window === "undefined") {
      return;
    }

    const nextLine = focusGateLines.find(
      (line) => elapsedTotalSeconds >= line.at && !spokenFocusKeysRef.current.has(line.key)
    );

    if (!nextLine) {
      return;
    }

    spokenFocusKeysRef.current.add(nextLine.key);
    setFocusGateMessage(nextLine.text);

    if (!("speechSynthesis" in window)) {
      return;
    }

    try {
      const settings = getFocusGateSpeechSettings(localizedLanguage);
      const synth = window.speechSynthesis;
      focusSpeechSequenceRef.current += 1;
      const speechSequence = focusSpeechSequenceRef.current;

      if (focusSpeechTimeoutRef.current) {
        window.clearTimeout(focusSpeechTimeoutRef.current);
        focusSpeechTimeoutRef.current = null;
      }

      const speechDelayMs = nextLine.speechDelayMs ?? 420;

      const queueSpeak = (attempt: number) => {
        if (
          focusSpeechSequenceRef.current !== speechSequence ||
          isPausedRef.current ||
          isCompleteRef.current
        ) {
          return;
        }

        if (synth.speaking || synth.pending) {
          if (attempt >= 12) {
            synth.cancel();
          } else {
            focusSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(attempt + 1), 140);
            return;
          }
        }

        const utterance = new SpeechSynthesisUtterance(nextLine.speechText ?? nextLine.text);
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

        utterance.onend = () => {
          focusSpeechTimeoutRef.current = null;
        };

        utterance.onerror = (event) => {
          console.error("[focus-gate] narration failed", {
            language: localizedLanguage,
            key: nextLine.key,
            error: event.error
          });
          focusSpeechTimeoutRef.current = null;
        };

        synth.cancel();
        synth.speak(utterance);
      };

      focusSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(0), speechDelayMs);
    } catch (error) {
      console.warn("[focus-gate] speech synthesis unavailable", error);
    }
  }, [elapsedTotalSeconds, focusGateLines, isComplete, isFocusGate, isPaused, localizedLanguage, needsUserStart]);

  useEffect(() => {
    if (!isCalmGate || isComplete || isPaused || needsUserStart || typeof window === "undefined") {
      return;
    }

    const nextLine = calmGateLines.find(
      (line) => elapsedTotalSeconds >= line.at && !spokenCalmKeysRef.current.has(line.key)
    );

    if (!nextLine) {
      return;
    }

    spokenCalmKeysRef.current.add(nextLine.key);
    setCalmGateMessage(nextLine.text);

    if (!("speechSynthesis" in window)) {
      return;
    }

    try {
      const settings = getCalmGateSpeechSettings(localizedLanguage);
      const synth = window.speechSynthesis;
      calmSpeechSequenceRef.current += 1;
      const speechSequence = calmSpeechSequenceRef.current;

      if (calmSpeechTimeoutRef.current) {
        window.clearTimeout(calmSpeechTimeoutRef.current);
        calmSpeechTimeoutRef.current = null;
      }

      const speechDelayMs = nextLine.speechDelayMs ?? 560;

      const queueSpeak = (attempt: number) => {
        if (
          calmSpeechSequenceRef.current !== speechSequence ||
          isPausedRef.current ||
          isCompleteRef.current
        ) {
          return;
        }

        if (synth.speaking || synth.pending) {
          if (attempt >= 12) {
            synth.cancel();
          } else {
            calmSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(attempt + 1), 160);
            return;
          }
        }

        const utterance = new SpeechSynthesisUtterance(nextLine.speechText ?? nextLine.text);
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

        utterance.onend = () => {
          calmSpeechTimeoutRef.current = null;
        };

        utterance.onerror = (event) => {
          console.error("[calm-gate] narration failed", {
            language: localizedLanguage,
            key: nextLine.key,
            error: event.error
          });
          calmSpeechTimeoutRef.current = null;
        };

        synth.cancel();
        synth.speak(utterance);
      };

      calmSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(0), speechDelayMs);
    } catch (error) {
      console.warn("[calm-gate] speech synthesis unavailable", error);
    }
  }, [calmGateLines, elapsedTotalSeconds, isCalmGate, isComplete, isPaused, localizedLanguage, needsUserStart]);

  useEffect(() => {
    if (!isReleaseGate || isComplete || isPaused || needsUserStart || typeof window === "undefined") {
      return;
    }

    const nextLine = releaseGateLines.find(
      (line) => elapsedTotalSeconds >= line.at && !spokenReleaseKeysRef.current.has(line.key)
    );

    if (!nextLine) {
      return;
    }

    spokenReleaseKeysRef.current.add(nextLine.key);
    setReleaseGateMessage(nextLine.text);

    if (!("speechSynthesis" in window)) {
      return;
    }

    try {
      const settings = getReleaseGateSpeechSettings(localizedLanguage);
      const synth = window.speechSynthesis;
      releaseSpeechSequenceRef.current += 1;
      const speechSequence = releaseSpeechSequenceRef.current;

      if (releaseSpeechTimeoutRef.current) {
        window.clearTimeout(releaseSpeechTimeoutRef.current);
        releaseSpeechTimeoutRef.current = null;
      }

      const speechDelayMs = nextLine.speechDelayMs ?? 920;

      const queueSpeak = (attempt: number) => {
        if (
          releaseSpeechSequenceRef.current !== speechSequence ||
          isPausedRef.current ||
          isCompleteRef.current
        ) {
          return;
        }

        if (synth.speaking || synth.pending) {
          if (attempt >= 16) {
            synth.cancel();
          } else {
            releaseSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(attempt + 1), 180);
            return;
          }
        }

        const utterance = new SpeechSynthesisUtterance(nextLine.speechText ?? nextLine.text);
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

        utterance.onend = () => {
          releaseSpeechTimeoutRef.current = null;
        };

        utterance.onerror = (event) => {
          console.error("[release-gate] narration failed", {
            language: localizedLanguage,
            key: nextLine.key,
            error: event.error
          });
          releaseSpeechTimeoutRef.current = null;
        };

        synth.cancel();
        synth.speak(utterance);
      };

      releaseSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(0), speechDelayMs);
    } catch (error) {
      console.warn("[release-gate] speech synthesis unavailable", error);
    }
  }, [elapsedTotalSeconds, isComplete, isPaused, isReleaseGate, localizedLanguage, needsUserStart, releaseGateLines]);

  useEffect(() => {
    if (!isGratitudeGate || isComplete || isPaused || needsUserStart || typeof window === "undefined") {
      return;
    }

    const nextLine = gratitudeGateLines.find(
      (line) => elapsedTotalSeconds >= line.at && !spokenGratitudeKeysRef.current.has(line.key)
    );

    if (!nextLine) {
      return;
    }

    spokenGratitudeKeysRef.current.add(nextLine.key);
    setGratitudeGateMessage(nextLine.text);

    if (!("speechSynthesis" in window)) {
      return;
    }

    try {
      const settings = getGratitudeGateSpeechSettings(localizedLanguage);
      const synth = window.speechSynthesis;
      gratitudeSpeechSequenceRef.current += 1;
      const speechSequence = gratitudeSpeechSequenceRef.current;

      if (gratitudeSpeechTimeoutRef.current) {
        window.clearTimeout(gratitudeSpeechTimeoutRef.current);
        gratitudeSpeechTimeoutRef.current = null;
      }

      const speechDelayMs = nextLine.speechDelayMs ?? 980;

      const queueSpeak = (attempt: number) => {
        if (
          gratitudeSpeechSequenceRef.current !== speechSequence ||
          isPausedRef.current ||
          isCompleteRef.current
        ) {
          return;
        }

        if (synth.speaking || synth.pending) {
          if (attempt >= 16) {
            synth.cancel();
          } else {
            gratitudeSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(attempt + 1), 180);
            return;
          }
        }

        const utterance = new SpeechSynthesisUtterance(nextLine.speechText ?? nextLine.text);
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

        utterance.onend = () => {
          gratitudeSpeechTimeoutRef.current = null;
        };

        utterance.onerror = (event) => {
          console.error("[gratitude-gate] narration failed", {
            language: localizedLanguage,
            key: nextLine.key,
            error: event.error
          });
          gratitudeSpeechTimeoutRef.current = null;
        };

        synth.cancel();
        synth.speak(utterance);
      };

      gratitudeSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(0), speechDelayMs);
    } catch (error) {
      console.warn("[gratitude-gate] speech synthesis unavailable", error);
    }
  }, [elapsedTotalSeconds, gratitudeGateLines, isComplete, isGratitudeGate, isPaused, localizedLanguage, needsUserStart]);

  useEffect(() => {
    if (!isSleepGate || isComplete || isPaused || needsUserStart || typeof window === "undefined") {
      return;
    }

    const nextLine = sleepGateLines.find(
      (line) => elapsedTotalSeconds >= line.at && !spokenSleepKeysRef.current.has(line.key)
    );

    if (!nextLine) {
      return;
    }

    spokenSleepKeysRef.current.add(nextLine.key);
    setSleepGateMessage(nextLine.text);

    if (!("speechSynthesis" in window)) {
      return;
    }

    try {
      const settings = getSleepGateSpeechSettings(localizedLanguage);
      const synth = window.speechSynthesis;
      sleepSpeechSequenceRef.current += 1;
      const speechSequence = sleepSpeechSequenceRef.current;

      if (sleepSpeechTimeoutRef.current) {
        window.clearTimeout(sleepSpeechTimeoutRef.current);
        sleepSpeechTimeoutRef.current = null;
      }

      const speechDelayMs = nextLine.speechDelayMs ?? 1120;

      const queueSpeak = (attempt: number) => {
        if (
          sleepSpeechSequenceRef.current !== speechSequence ||
          isPausedRef.current ||
          isCompleteRef.current
        ) {
          return;
        }

        if (synth.speaking || synth.pending) {
          if (attempt >= 18) {
            synth.cancel();
          } else {
            sleepSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(attempt + 1), 220);
            return;
          }
        }

        const utterance = new SpeechSynthesisUtterance(nextLine.speechText ?? nextLine.text);
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

        utterance.onend = () => {
          sleepSpeechTimeoutRef.current = null;
        };

        utterance.onerror = (event) => {
          console.error("[sleep-gate] narration failed", {
            language: localizedLanguage,
            key: nextLine.key,
            error: event.error
          });
          sleepSpeechTimeoutRef.current = null;
        };

        synth.cancel();
        synth.speak(utterance);
      };

      sleepSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(0), speechDelayMs);
    } catch (error) {
      console.warn("[sleep-gate] speech synthesis unavailable", error);
    }
  }, [elapsedTotalSeconds, isComplete, isPaused, isSleepGate, localizedLanguage, needsUserStart, sleepGateLines]);

  useEffect(() => {
    if (!isStructuredMorningGate || typeof window === "undefined") {
      return;
    }

    if (affirmationStage === "openingFade") {
      setAffirmationMessage(morningGateCopy.openingFade);
      return;
    }

    if (isAffirmationGate && (affirmationStage === "breathing" || affirmationStage === "bodyAwareness")) {
      setAffirmationMessage(null);
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
      if (focusSpeechTimeoutRef.current) {
        window.clearTimeout(focusSpeechTimeoutRef.current);
        focusSpeechTimeoutRef.current = null;
      }
      if (calmSpeechTimeoutRef.current) {
        window.clearTimeout(calmSpeechTimeoutRef.current);
        calmSpeechTimeoutRef.current = null;
      }
      if (releaseSpeechTimeoutRef.current) {
        window.clearTimeout(releaseSpeechTimeoutRef.current);
        releaseSpeechTimeoutRef.current = null;
      }
      if (gratitudeSpeechTimeoutRef.current) {
        window.clearTimeout(gratitudeSpeechTimeoutRef.current);
        gratitudeSpeechTimeoutRef.current = null;
      }
      if (sleepSpeechTimeoutRef.current) {
        window.clearTimeout(sleepSpeechTimeoutRef.current);
        sleepSpeechTimeoutRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        structuredSpeechSequenceRef.current += 1;
        focusSpeechSequenceRef.current += 1;
        calmSpeechSequenceRef.current += 1;
        releaseSpeechSequenceRef.current += 1;
        gratitudeSpeechSequenceRef.current += 1;
        sleepSpeechSequenceRef.current += 1;
        window.speechSynthesis.cancel();
      }
    };
  }, [ambientAudioVolume]);

  async function runMeditationComplete() {
    if (isStructuredMorningGate) {
      await stopStructuredMorningAmbient();
    } else if (isFocusGate) {
      const video = focusVideoRef.current;
      if (video) {
        video.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        focusSpeechSequenceRef.current += 1;
        window.speechSynthesis.cancel();
      }
    } else if (isCalmGate) {
      const video = calmVideoRef.current;
      if (video) {
        video.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        calmSpeechSequenceRef.current += 1;
        window.speechSynthesis.cancel();
      }
    } else if (isReleaseGate) {
      const video = releaseVideoRef.current;
      if (video) {
        video.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        releaseSpeechSequenceRef.current += 1;
        window.speechSynthesis.cancel();
      }
    } else if (isGratitudeGate) {
      const video = gratitudeVideoRef.current;
      if (video) {
        video.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        gratitudeSpeechSequenceRef.current += 1;
        window.speechSynthesis.cancel();
      }
    } else if (isSleepGate) {
      const video = sleepVideoRef.current;
      if (video) {
        video.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        sleepSpeechSequenceRef.current += 1;
        window.speechSynthesis.cancel();
      }
    } else if (isRechargeGate) {
      const video = rechargeVideoRef.current;
      if (video) {
        video.pause();
      }
    } else {
      await stopAmbientNatureAudio(ambientAudioRef, ambientFadeOutMs);
    }
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
      const result = isStructuredMorningGate
        ? await startStructuredMorningAmbient({
            restartFromBeginning: isAffirmationGate || isVisionGate,
            fadeInMs: MORNING_GATE_FADE_IN_MS
          })
        : await startAmbientNatureAudio(
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
      if (isStructuredMorningGate) {
        await stopStructuredMorningAmbient();
      } else if (isCalmGate) {
        const video = calmVideoRef.current;
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          calmSpeechSequenceRef.current += 1;
          window.speechSynthesis.cancel();
        }
      } else if (isReleaseGate) {
        const video = releaseVideoRef.current;
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          releaseSpeechSequenceRef.current += 1;
          window.speechSynthesis.cancel();
        }
      } else if (isGratitudeGate) {
        const video = gratitudeVideoRef.current;
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          gratitudeSpeechSequenceRef.current += 1;
          window.speechSynthesis.cancel();
        }
      } else if (isSleepGate) {
        const video = sleepVideoRef.current;
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          sleepSpeechSequenceRef.current += 1;
          window.speechSynthesis.cancel();
        }
      } else if (isRechargeGate) {
        const video = rechargeVideoRef.current;
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      } else {
        await stopAmbientNatureAudio(ambientAudioRef, ambientFadeOutMs);
      }
    }
  }

  function handleVibrationToggle() {
    setHasUserGesture(true);
    setVibrationEnabled((current) => !current);
  }

  async function handleAmbientRetry() {
    setHasUserGesture(true);
    setRequiresExplicitAudioStart(false);
    setNeedsUserStart(false);
    setIsPaused(false);
    logStructuredMorningAmbientState("ambient-retry-tap");

    if (isAffirmationGate) {
      await playAffirmationGateVideo({ restartFromBeginning: true });
    } else if (isEnergyGate) {
      await playEnergyGateVideo();
    } else if (isVisionGate) {
      await playVisionGateVideo({ restartFromBeginning: true });
    }

    const result = isStructuredMorningGate
      ? await startStructuredMorningAmbient({
          restartFromBeginning: isAffirmationGate || isVisionGate,
          fadeInMs: MORNING_GATE_FADE_IN_MS
        })
      : await startAmbientNatureAudio(
          ambientAudioRef,
          true,
          ambientAudioSource,
          ambientAudioVolume,
          {
            ...ambientFadeInOptions,
            restartFromBeginning: isVisionGate
          }
        );
    await handleAmbientStartResult(result, true);
  }

  function clearRechargeTimer() {
    if (typeof window === "undefined") {
      return;
    }

    if (rechargeTimerIntervalRef.current !== null) {
      window.clearInterval(rechargeTimerIntervalRef.current);
      rechargeTimerIntervalRef.current = null;
    }
  }

  function startRechargeCountdown() {
    if (typeof window === "undefined") {
      return;
    }

    if (rechargeTimerIntervalRef.current !== null) {
      return;
    }

    rechargeTimerIntervalRef.current = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearRechargeTimer();
          const video = rechargeVideoRef.current;

          if (video && !video.paused) {
            video.pause();
          }

          return 0;
        }

        return current - 1;
      });
    }, 1000);
  }

  async function handleProgramAudioStart() {
    if (isRechargeGate) {
      const video = rechargeVideoRef.current;

      console.log("[recharge-gate] BUTTON CLICKED");
      console.log("[recharge-gate] video ref =", video);

      if (!video) {
        setRechargeStartError(rechargeStartErrorText);
        setNeedsUserStart(true);
        setRequiresExplicitAudioStart(true);
        setIsRechargeVideoPlaying(false);
        return;
      }

      video.pause();
      if (video.getAttribute("src") !== RECHARGE_GATE_VIDEO_SRC) {
        video.src = RECHARGE_GATE_VIDEO_SRC;
      }
      video.currentTime = 0;
      video.defaultMuted = false;
      video.muted = false;
      video.volume = RECHARGE_GATE_VIDEO_VOLUME;
      video.playsInline = true;

      console.log("[recharge-gate] currentSrc", video.currentSrc);
      console.log("[recharge-gate] readyState before play", video.readyState);
      console.log("[recharge-gate] paused before play", video.paused);
      console.log("[recharge-gate] currentTime before play", video.currentTime);
      console.log("[recharge-gate] ended before play", video.ended);

      clearRechargeTimer();
      setHasUserGesture(true);
      setSoundEnabled(true);
      setRechargeStartError(null);

      try {
        const playPromise = video.play();
        console.log("[recharge-gate] playPromise =", playPromise);
        await playPromise;
        console.log("[recharge-gate] PLAY SUCCESS");

        setTotalSeconds(FOCUS_GATE_TOTAL_SECONDS);
        setSecondsLeft(FOCUS_GATE_TOTAL_SECONDS);
        setNeedsUserStart(false);
        setRequiresExplicitAudioStart(false);
        setIsRechargeVideoPlaying(true);
        setIsPaused(false);
        setIsRechargeStarting(false);
        setAmbientVideoFailed(false);
        startRechargeCountdown();

        let debugTicks = 0;
        const debugInterval = window.setInterval(() => {
          debugTicks += 1;
          console.log("[recharge-gate] currentTime", video.currentTime, "paused", video.paused);

          if (debugTicks >= 5) {
            window.clearInterval(debugInterval);
          }
        }, 1000);

        return;
      } catch (error) {
        console.error("[recharge-gate] PLAY FAILED", error);
        setNeedsUserStart(true);
        setRequiresExplicitAudioStart(true);
        setIsRechargeVideoPlaying(false);
        setIsPaused(true);
        setIsRechargeStarting(false);
        setAmbientVideoFailed(true);
        setRechargeStartError(rechargeStartErrorText);
      }
      return;
    }

    setHasUserGesture(true);
    setRequiresExplicitAudioStart(false);
    setNeedsUserStart(false);
    setIsPaused(false);
    unlockStructuredMorningSpeech();
    unlockFocusGateSpeech();
    unlockCalmGateSpeech();
    unlockReleaseGateSpeech();
    unlockGratitudeGateSpeech();
    unlockSleepGateSpeech();
    logStructuredMorningAmbientState("program-start-tap");

    if (isFocusGate) {
      setSoundEnabled(true);
      await playFocusGateVideo({ restartFromBeginning: true });
      return;
    }

    if (isCalmGate) {
      setSoundEnabled(true);
      await playCalmGateVideo({ restartFromBeginning: true });
      return;
    }

    if (isReleaseGate) {
      setSoundEnabled(true);
      await playReleaseGateVideo({ restartFromBeginning: true });
      return;
    }

    if (isGratitudeGate) {
      setSoundEnabled(true);
      await playGratitudeGateVideo({ restartFromBeginning: true });
      return;
    }

    if (isSleepGate) {
      setSoundEnabled(true);
      await playSleepGateVideo({ restartFromBeginning: true });
      return;
    }

    if (isAffirmationGate) {
      await playAffirmationGateVideo({ restartFromBeginning: true });
    } else if (isEnergyGate) {
      await playEnergyGateVideo();
    } else if (isVisionGate) {
      await playVisionGateVideo({ restartFromBeginning: true });
    }

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

    const result = isStructuredMorningGate
      ? await startStructuredMorningAmbient({
          restartFromBeginning: isAffirmationGate || isVisionGate,
          fadeInMs: MORNING_GATE_FADE_IN_MS
        })
      : await startAmbientNatureAudio(
          ambientAudioRef,
          true,
          ambientAudioSource,
          ambientAudioVolume,
          {
            ...ambientFadeInOptions,
            restartFromBeginning: isVisionGate
          }
        );
    await handleAmbientStartResult(result, true);

    if (result.started) {
      setNeedsUserStart(false);
      setIsPaused(false);
      return;
    }
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
        if (focusSpeechTimeoutRef.current) {
          window.clearTimeout(focusSpeechTimeoutRef.current);
          focusSpeechTimeoutRef.current = null;
        }
        if (calmSpeechTimeoutRef.current) {
          window.clearTimeout(calmSpeechTimeoutRef.current);
          calmSpeechTimeoutRef.current = null;
        }
        if (releaseSpeechTimeoutRef.current) {
          window.clearTimeout(releaseSpeechTimeoutRef.current);
          releaseSpeechTimeoutRef.current = null;
        }
        structuredSpeechSequenceRef.current += 1;
        focusSpeechSequenceRef.current += 1;
        calmSpeechSequenceRef.current += 1;
        releaseSpeechSequenceRef.current += 1;
        window.speechSynthesis.cancel();
      }

      return next;
    });
  }

  function handleRechargeStartTrigger() {
    if (rechargeStartTriggerLockRef.current) {
      return;
    }

    rechargeStartTriggerLockRef.current = true;
    void handleProgramAudioStart().finally(() => {
      window.setTimeout(() => {
        rechargeStartTriggerLockRef.current = false;
      }, 250);
    });
  }

  function handleRechargeVideoPlaying() {
    setRechargeStartError(null);
    setIsRechargeVideoPlaying(true);
    setIsPaused(false);
    setNeedsUserStart(false);
    setRequiresExplicitAudioStart(false);
    setIsRechargeStarting(false);

    if (rechargeTimerIntervalRef.current === null) {
      startRechargeCountdown();
    }
  }

  function handleRechargeVideoPause() {
    console.log("[recharge-gate] EVENT pause");
    setIsRechargeVideoPlaying(false);
    clearRechargeTimer();
    if (!isCompleteRef.current) {
      setIsPaused(true);
    }
  }

  function handleRechargeVideoEnded() {
    console.log("[recharge-gate] EVENT ended");
    setIsRechargeVideoPlaying(false);
    clearRechargeTimer();
    setSecondsLeft(0);
  }

  if (requiresProtectedMembership && (!authResolved || !membershipAccess.canRender)) {
    return <MembershipAccessStateView access={membershipAccess} />;
  }

  if (hasInvalidRoute) {
    return (
      <main className="section-shell py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="premium-card rounded-[28px] p-8 text-center sm:p-12">
            <div className="mx-auto max-w-xl space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-gold/72">Meditation Gate</p>
              <h1 className="font-serif text-3xl text-white sm:text-4xl">{invalidRouteCopy.title}</h1>
              <p className="text-sm leading-7 text-white/68 sm:text-base">{invalidRouteCopy.body}</p>
              <Link
                href="/program/basic"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
              >
                {invalidRouteCopy.button}
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(216,191,131,0.12),transparent_20%),linear-gradient(180deg,#07111f_0%,#0d1b2d_45%,#10273a_100%)] px-6 py-10 text-white">
      <div className={`relative flex min-h-[480px] w-full max-w-3xl ${isRechargeGate ? "overflow-visible" : "overflow-hidden"} flex-col items-center rounded-[32px] border border-white/10 bg-white/[0.04] px-6 py-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:px-8 sm:py-10`}>
        {!ambientVideoFailed && isFocusGate ? (
          <video
            key="focus-gate-video"
            ref={focusVideoRef}
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-[0.82] brightness-[0.92] contrast-[1.04] saturate-[0.96]"
            autoPlay
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => console.log("Focus Gate video loaded")}
            onError={() => setAmbientVideoFailed(true)}
          >
            <source src={FOCUS_GATE_VIDEO_SRC} type="video/mp4" />
          </video>
        ) : !ambientVideoFailed && isRechargeGate && !isComplete ? (
          <video
            key="recharge-gate-video"
            ref={rechargeVideoRef}
            src={RECHARGE_GATE_VIDEO_SRC}
            className={`absolute inset-0 z-0 h-full w-full object-cover brightness-[0.98] contrast-[1.02] saturate-[1.02] transition-opacity duration-700 ${
              needsUserStart ? "pointer-events-none opacity-0" : "opacity-[0.92]"
            }`}
            controls={false}
            playsInline
            preload="auto"
            muted={false}
            onPlay={() => console.log("[recharge-gate] EVENT play")}
            onPlaying={() => {
              console.log("[recharge-gate] EVENT playing");
              handleRechargeVideoPlaying();
            }}
            onPause={handleRechargeVideoPause}
            onEnded={handleRechargeVideoEnded}
            onError={(event) => {
              console.error("[recharge-gate] EVENT error", event);
              setAmbientVideoFailed(true);
            }}
          />
        ) : !ambientVideoFailed && isReleaseGate && !isComplete ? (
          <video
            key="release-gate-video"
            ref={releaseVideoRef}
            src={EVENING_RELEASE_VIDEO_SRC}
            className={`absolute inset-0 z-0 h-full w-full object-cover brightness-[0.82] contrast-[0.96] saturate-[0.9] transition-opacity duration-700 ${
              needsUserStart ? "pointer-events-none opacity-0" : "opacity-[0.94]"
            }`}
            controls={false}
            playsInline
            preload="auto"
            muted={false}
            onPlaying={() => {
              setNeedsUserStart(false);
              setRequiresExplicitAudioStart(false);
              setIsPaused(false);
              setAmbientVideoFailed(false);
            }}
            onPause={() => {
              if (!isCompleteRef.current) {
                setIsPaused(true);
              }
            }}
            onEnded={() => {
              setSecondsLeft(0);
            }}
            onError={() => setAmbientVideoFailed(true)}
          />
        ) : !ambientVideoFailed && isGratitudeGate && !isComplete ? (
          <video
            key="gratitude-gate-video"
            ref={gratitudeVideoRef}
            src={EVENING_GRATITUDE_VIDEO_SRC}
            className={`absolute inset-0 z-0 h-full w-full object-cover brightness-[0.84] contrast-[0.97] saturate-[0.92] transition-opacity duration-700 ${
              needsUserStart ? "pointer-events-none opacity-0" : "opacity-[0.95]"
            }`}
            controls={false}
            playsInline
            preload="auto"
            muted={false}
            onPlaying={() => {
              setNeedsUserStart(false);
              setRequiresExplicitAudioStart(false);
              setIsPaused(false);
              setAmbientVideoFailed(false);
            }}
            onPause={() => {
              if (!isCompleteRef.current) {
                setIsPaused(true);
              }
            }}
            onEnded={() => {
              setSecondsLeft(0);
            }}
            onError={() => setAmbientVideoFailed(true)}
          />
        ) : !ambientVideoFailed && isSleepGate && !isComplete ? (
          <video
            key="sleep-gate-video"
            ref={sleepVideoRef}
            src={EVENING_SLEEP_VIDEO_SRC}
            className={`absolute inset-0 z-0 h-full w-full object-cover brightness-[0.8] contrast-[0.95] saturate-[0.88] transition-opacity duration-700 ${
              needsUserStart ? "pointer-events-none opacity-0" : "opacity-[0.95]"
            }`}
            controls={false}
            playsInline
            preload="auto"
            muted={false}
            onPlaying={() => {
              setNeedsUserStart(false);
              setRequiresExplicitAudioStart(false);
              setIsPaused(false);
              setAmbientVideoFailed(false);
            }}
            onPause={() => {
              if (!isCompleteRef.current) {
                setIsPaused(true);
              }
            }}
            onEnded={() => {
              setSecondsLeft(0);
            }}
            onError={() => setAmbientVideoFailed(true)}
          />
        ) : !ambientVideoFailed && isCalmGate ? (
          <video
            key="calm-gate-video"
            ref={calmVideoRef}
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-[0.86] brightness-[0.96] contrast-[1.02] saturate-[0.98]"
            autoPlay
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => console.log("Calm Gate video loaded")}
            onError={() => setAmbientVideoFailed(true)}
          >
            <source src={CALM_GATE_VIDEO_SRC} type="video/mp4" />
          </video>
        ) : !ambientVideoFailed && !isStructuredMorningGate ? (
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
        ) : !ambientVideoFailed && isAffirmationGate ? (
          <video
            key="awakening-gate-video"
            ref={affirmationVideoRef}
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-[0.9] brightness-[1.03] contrast-[1.02] saturate-[1.04]"
            autoPlay
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => console.log("Awakening Gate video loaded")}
            onError={() => setAmbientVideoFailed(true)}
          >
            <source src={AWAKENING_GATE_VIDEO_SRC} type="video/mp4" />
          </video>
        ) : !ambientVideoFailed && isEnergyGate ? (
          <video
            key="energy-gate-video"
            ref={energyVideoRef}
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-[0.58]"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => console.log("Energy Gate video loaded")}
            onError={() => setAmbientVideoFailed(true)}
          >
            <source src="/basic/morning gate/energy gate8.mp4" type="video/mp4" />
          </video>
        ) : !ambientVideoFailed && isVisionGate ? (
          <video
            key="vision-gate-video"
            ref={visionVideoRef}
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-[0.84] brightness-[1.04] contrast-[1.02] saturate-[1.04]"
            autoPlay
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => console.log("Vision Gate video loaded")}
            onError={() => setAmbientVideoFailed(true)}
          >
            <source src={VISION_GATE_VIDEO_SRC} type="video/mp4" />
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
                  : isVisionGate
                    ? "bg-[radial-gradient(circle_at_top,rgba(244,220,160,0.10),transparent_26%),radial-gradient(circle_at_bottom,rgba(125,162,108,0.08),transparent_34%),linear-gradient(180deg,rgba(20,28,44,0.44)_0%,rgba(15,24,39,0.52)_48%,rgba(10,19,31,0.68)_100%)]"
                  : "bg-[radial-gradient(circle_at_top,rgba(244,220,160,0.10),transparent_24%),radial-gradient(circle_at_bottom,rgba(125,162,108,0.10),transparent_34%),linear-gradient(180deg,rgba(24,38,56,0.28)_0%,rgba(16,28,42,0.36)_48%,rgba(10,18,30,0.48)_100%)]"
              }`}
            />
            <div className="absolute left-[8%] top-[10%] z-0 h-48 w-48 rounded-full bg-gold/10 blur-[80px]" />
            <div className="absolute right-[10%] top-[14%] z-0 h-44 w-44 rounded-full bg-emerald-200/[0.08] blur-[90px]" />
          </>
        ) : null}
        {journeyMode ? (
          <div
            className={`pointer-events-none absolute inset-0 z-[1] overflow-hidden transition-all duration-[1600ms] ${
              showJourneyEntranceVisual ? "opacity-100" : "opacity-[0.46]"
            }`}
          >
            <img
              src={JOURNEY_OVERVIEW_IMAGE_SRC}
              alt={journeyCopy.title}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-[2200ms] ${
                showJourneyEntranceVisual ? "scale-100 opacity-100" : "scale-[1.03] opacity-[0.88]"
              }`}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,220,160,0.10),transparent_26%),linear-gradient(180deg,rgba(4,10,19,0.26),rgba(4,10,19,0.54))]" />
          </div>
        ) : null}
        <div className={`absolute inset-0 z-10 ${isStructuredMorningGate ? "bg-[linear-gradient(180deg,rgba(4,10,19,0.18),rgba(4,10,19,0.36))]" : "bg-black/25"}`} />
        {isRechargeGate && !needsUserStart && !isComplete ? (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
            <div className="relative flex h-56 w-56 items-center justify-center sm:h-80 sm:w-80">
              <div className="absolute inset-0 rounded-full bg-[rgba(7,17,31,0.24)] blur-3xl" />
              <div className="absolute inset-0 rounded-full border border-[rgba(212,178,106,0.32)] bg-[rgba(7,17,31,0.46)] shadow-[0_22px_60px_rgba(4,12,24,0.42)] backdrop-blur-xl" />
              <div className="absolute inset-3 rounded-full border border-white/14" />
              <div className="absolute inset-0 rounded-full border-t border-[rgba(212,178,106,0.72)] border-r border-[rgba(212,178,106,0.22)] border-b border-[rgba(212,178,106,0.16)] border-l border-[rgba(212,178,106,0.42)] opacity-90" />
              <div className="relative z-10 flex max-w-[84%] flex-col items-center justify-center gap-4 text-center sm:gap-5">
                <div className="flex max-w-[84%] flex-col items-center gap-2">
                  <p className="text-xs font-medium text-white/70 sm:text-sm">
                    {rechargeExercises.selectedLabel}
                  </p>
                  <p
                    className={`mx-auto text-center font-medium text-white ${
                      isJapaneseRechargeLabel
                        ? "max-w-[90%] whitespace-nowrap break-keep text-[13px] leading-snug [word-break:keep-all] sm:text-[15px]"
                        : "max-w-[80%] text-sm leading-relaxed [overflow-wrap:anywhere] [word-break:keep-all] sm:text-base"
                    }`}
                  >
                    {selectedRechargeExerciseLabel}
                  </p>
                </div>
                <p className="text-5xl font-semibold tracking-[0.08em] text-white sm:text-7xl">
                  {formatRemainingTime(secondsLeft)}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="relative z-20 flex w-full flex-col items-center text-center">
        {!isComplete ? (
          <>
            {isStructuredMorningGate ? (
              <div className="w-full max-w-xl space-y-4">
                <p className="text-xs uppercase tracking-[0.28em] text-gold/74">{morningGateCopy.audioLabel}</p>
                <h1 className="hero-measure word-balance keep-phrase mx-auto font-serif text-3xl text-white sm:text-4xl">{morningGateCopy.title}</h1>
                <p className="body-measure word-balance keep-phrase mx-auto text-[13px] leading-6 text-white/64 sm:text-[13.5px] sm:leading-6">{morningGateCopy.subtitle}</p>
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
                {showJourneyEntranceVisual ? (
                  <div
                    key={`${journeyDay}-settling`}
                    className="animate-fade-in transition-opacity duration-700"
                  >
                    <p className="body-measure word-balance keep-phrase mx-auto whitespace-pre-line text-center font-serif text-[1.24rem] leading-[1.98] text-white/92 sm:text-[1.6rem] sm:leading-[2.02]">
                      {journeyCalmingLine}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : isRechargeGate ? null : (
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
              {journeyMode && needsUserStart ? (
                <div className="mb-6 flex w-full flex-col items-center justify-end gap-5">
                  <button
                    type="button"
                    onClick={handleJourneyAudioStart}
                    className="button-nowrap inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/16 bg-white/[0.08] px-5 py-2.5 text-sm font-medium text-white/88 shadow-[0_18px_42px_rgba(4,12,24,0.2)] backdrop-blur-md transition duration-300 hover:bg-white/[0.12]"
                  >
                    {journeyCopy.audioStart}
                  </button>
                </div>
              ) : (journeyMode || meditationType !== "default") && needsUserStart ? (
                <div className={`mb-6 w-full ${isRechargeGate ? "max-w-3xl" : "max-w-md"} rounded-[24px] border border-[rgba(212,178,106,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-[clamp(16px,4vw,40px)] py-5 text-center shadow-[0_18px_50px_rgba(4,12,24,0.18)] ${isRechargeGate ? "overflow-visible" : ""}`}>
                  {isRechargeGate ? (
                    <div className={`space-y-4 transition-all duration-300 sm:space-y-5 ${isRechargeStarting ? "scale-[0.98] opacity-0" : "scale-100 opacity-100"}`}>
                      <div className="mx-auto max-w-2xl space-y-3">
                        <p className="text-xs uppercase tracking-[0.28em] text-gold/72">{rechargeIntro.title}</p>
                        <h1 className="font-serif text-3xl text-white sm:text-4xl">{rechargeIntro.subtitle}</h1>
                        <p className="text-sm leading-7 text-white/56">{rechargeIntro.state}</p>
                        <p className="whitespace-pre-line text-sm leading-7 text-white/76 sm:text-base">{rechargeIntro.body}</p>
                      </div>
                      <div className="animate-fade-in mx-auto w-full max-w-[700px] overflow-hidden rounded-[24px] shadow-[0_20px_48px_rgba(4,12,24,0.24)] duration-[500ms]">
                        <img
                          src={RECHARGE_GATE_GUIDE_IMAGE_SRC}
                          alt={rechargeExercises.sectionTitle}
                          className="block h-auto w-full object-contain"
                        />
                      </div>
                      <div className="animate-fade-in mx-auto w-full max-w-2xl space-y-3 duration-[500ms]">
                        <p className="text-center text-xs uppercase tracking-[0.26em] text-gold/68">
                          {rechargeExercises.sectionTitle}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {rechargeExercises.items.map((exercise, index) => {
                            const isSelected = exercise.key === selectedRechargeExercise;

                            return (
                              <button
                                key={exercise.key}
                                type="button"
                                onClick={() => setSelectedRechargeExercise(exercise.key)}
                                className={`flex min-h-[68px] items-center gap-3 rounded-[20px] border px-4 py-3 text-left transition duration-300 ${
                                  isSelected
                                    ? "border-gold/40 bg-gold/14 text-white shadow-[0_12px_30px_rgba(212,178,106,0.14)]"
                                    : "border-white/8 bg-white/[0.03] text-white/78 hover:border-white/16 hover:bg-white/[0.05]"
                                } ${index === rechargeExercises.items.length - 1 ? "sm:col-span-2" : ""}`}
                                aria-pressed={isSelected}
                              >
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                  isSelected ? "bg-gold text-ink" : "bg-white/10 text-white/72"
                                }`}>
                                  {index + 1}
                                </span>
                                <span className="text-sm leading-6 sm:text-[15px]">{exercise.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <p className="text-sm font-medium leading-7 text-white/70">
                        {rechargeExercises.selectedLabel}: {selectedRechargeExerciseLabel}
                      </p>
                      <button
                        type="button"
                        onPointerDown={journeyMode ? undefined : handleRechargeStartTrigger}
                        onClick={journeyMode ? handleJourneyAudioStart : handleRechargeStartTrigger}
                        className="button-nowrap animate-meditation-fade-up mt-3 inline-flex min-h-[54px] items-center justify-center rounded-full border border-gold/30 bg-gold/15 px-7 py-3 text-base font-semibold text-[#f5e4b5] shadow-[0_18px_42px_rgba(212,178,106,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-gold/20 hover:shadow-[0_22px_48px_rgba(212,178,106,0.24)]"
                      >
                        {rechargeStartLabel}
                      </button>
                      {rechargeStartError ? (
                        <p className="text-sm leading-6 text-white/64">{rechargeStartError}</p>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      <p className={`whitespace-pre-line ${journeyMode ? "mx-auto max-w-[18ch] font-serif text-[1.05rem] leading-[1.95] text-white/88" : "text-sm leading-7 text-white/76"}`}>
                        {journeyMode ? journeyCalmingLine : copy.audioPrompt}
                      </p>
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
                    </>
                  )}
                </div>
              ) : null}

              {!isRechargeGate && !journeyMode ? (
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
                {showAmbientRetry && (soundEnabled || isStructuredMorningGate) ? (
                  <button
                    type="button"
                    onClick={handleAmbientRetry}
                    className="button-nowrap inline-flex min-h-[36px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {isEnergyGate ? "音楽を開始" : copy.natureLabel}
                  </button>
                ) : null}
              </div>
              ) : null}
              {!journeyMode && !isStructuredMorningGate && !isFocusGate && !isCalmGate && !isRechargeGate && !isGuidedEveningGate && !showJourneyEntranceVisual ? (
                <p className="text-2xl font-medium text-white/72 transition-all duration-300 ease-out sm:text-3xl">
                  {copy.phases[phase]}
                </p>
              ) : null}

              {!isRechargeGate && !isGuidedEveningGate ? (
                <div className={`relative mt-10 flex h-56 w-56 items-center justify-center transition-all duration-[1200ms] sm:h-72 sm:w-72 ${
                  showJourneyEntranceVisual ? "scale-[0.94] opacity-0 sm:scale-[0.96]" : "scale-100 opacity-100"
                }`}>
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
              ) : (
                <div className="mt-8 min-h-[260px] w-full" />
              )}

              {isStructuredMorningGate ? (
                <div className="mt-8 min-h-[92px] max-w-xl space-y-3">
                  <p
                    key={affirmationMessage ?? "structured-morning-empty"}
                    className="mx-auto animate-fade-in whitespace-pre-line font-serif text-[1.3rem] leading-[1.82] text-white/88 sm:text-[1.65rem] sm:leading-[1.92]"
                  >
                    {affirmationMessage}
                  </p>
                </div>
              ) : isFocusGate ? (
                <div className="mt-8 min-h-[92px] max-w-xl space-y-3">
                  <p
                    key={focusGateMessage ?? "focus-gate-empty"}
                    className="mx-auto animate-fade-in whitespace-pre-line font-serif text-[1.25rem] leading-[1.78] text-white/88 sm:text-[1.55rem] sm:leading-[1.86]"
                  >
                    {focusGateMessage}
                  </p>
                </div>
              ) : isCalmGate ? (
                <div className="mt-8 min-h-[92px] max-w-xl space-y-3">
                  <p
                    key={calmGateMessage ?? "calm-gate-empty"}
                    className="mx-auto animate-fade-in whitespace-pre-line font-serif text-[1.22rem] leading-[1.84] text-white/88 sm:text-[1.5rem] sm:leading-[1.9]"
                  >
                    {calmGateMessage}
                  </p>
                </div>
              ) : isReleaseGate ? (
                <div className="mt-10 min-h-[120px] max-w-2xl space-y-3">
                  <p
                    key={releaseGateMessage ?? "release-gate-empty"}
                    className="mx-auto animate-fade-in whitespace-pre-line font-serif text-[1.18rem] leading-[2.02] text-white/82 sm:text-[1.45rem] sm:leading-[2.08]"
                  >
                    {releaseGateMessage}
                  </p>
                </div>
              ) : isGratitudeGate ? (
                <div className="mt-10 min-h-[120px] max-w-2xl space-y-3">
                  <p
                    key={gratitudeGateMessage ?? "gratitude-gate-empty"}
                    className="mx-auto animate-fade-in whitespace-pre-line font-serif text-[1.18rem] leading-[2.02] text-white/82 sm:text-[1.45rem] sm:leading-[2.08]"
                  >
                    {gratitudeGateMessage}
                  </p>
                </div>
              ) : isSleepGate ? (
                <div className="mt-10 min-h-[120px] max-w-2xl space-y-3">
                  <p
                    key={sleepGateMessage ?? "sleep-gate-empty"}
                    className="mx-auto animate-fade-in whitespace-pre-line font-serif text-[1.14rem] leading-[2.08] text-white/78 sm:text-[1.38rem] sm:leading-[2.14]"
                  >
                    {sleepGateMessage}
                  </p>
                </div>
              ) : null}
            </div>

            {!isStructuredMorningGate && !isFocusGate && !isCalmGate && !isRechargeGate && !isGuidedEveningGate ? (
              <div className="mt-8">
                <p className="text-sm font-medium tracking-[0.18em] text-white/68 transition-opacity duration-300 sm:text-base">
                  {copy.bottomText[phase]}
                </p>
              </div>
            ) : null}
          </>
        ) : isAwakeningGate ? (
          <div className="animate-fade-in space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-gold/72">{morningGateCopy.audioLabel}</p>
              <h1 className="mx-auto max-w-2xl whitespace-pre-line font-serif text-4xl leading-[1.5] text-white sm:text-5xl">
                {ritualCopy.completionMessage}
              </h1>
            </div>

            <div className="mx-auto max-w-xl rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-6 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.26em] text-gold/68">{ritualCopy.rhythmLabel}</p>
              <p className="mt-4 whitespace-pre-line font-serif text-2xl leading-[1.9] text-white/88 sm:text-[32px]">
                {awakeningPrompt}
              </p>
            </div>

            <p className="whitespace-pre-line text-sm leading-7 text-white/56">{awakeningContinuity}</p>

            <div className="flex flex-col items-center gap-3">
              <Link
                href={continueToEnergyHref}
                className="inline-flex min-h-[56px] min-w-[240px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
              >
                {ritualCopy.continueCta}
              </Link>
              <Link
                href={morningGateReturnHref}
                className="inline-flex min-h-[52px] min-w-[240px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
              >
                {ritualCopy.returnCta}
              </Link>
              <Link
                href={finishForTodayHref}
                className="inline-flex min-h-[48px] min-w-[220px] items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-white/58 transition duration-300 hover:text-white/82"
              >
                {ritualCopy.finishCta}
              </Link>
            </div>
          </div>
        ) : isRechargeGate ? (
          <div className="animate-fade-in space-y-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(127,255,212,0.22)] bg-[rgba(127,255,212,0.08)] text-3xl text-[#9bf3dc] shadow-[0_18px_42px_rgba(8,24,32,0.28)]">
              ✓
            </div>
            <h1 className="font-serif text-4xl text-white sm:text-5xl">
              {rechargeCompletion.title}
            </h1>
            <p className="mx-auto max-w-xl whitespace-pre-line text-base leading-8 text-white/72">
              {rechargeCompletion.body}
            </p>
            <div className="flex flex-col items-center gap-3">
              <Link
                href={rechargeReturnHref}
                className="inline-flex min-h-[56px] min-w-[240px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
              >
                {rechargeCompletion.button}
              </Link>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-8">
            <h1 className="font-serif text-4xl text-white sm:text-5xl">
              {isStructuredMorningGate ? morningGateCopy.completionTitle : completionTitle}
            </h1>
            <p className="mx-auto max-w-xl whitespace-pre-line text-base leading-8 text-white/72">
              {completionMessageText}
            </p>
            <p className="whitespace-pre-line text-sm leading-7 text-white/54">{completionNoteText}</p>
            {completionBodyText ? <p className="mx-auto max-w-2xl text-base leading-8 text-white/68">{completionBodyText}</p> : null}
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

export default function MeditationPage() {
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
      <MeditationPageContent />
    </Suspense>
  );
}
