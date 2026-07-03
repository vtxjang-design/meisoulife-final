"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
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
const AWAKENING_GATE_VIDEO_VOLUME = 0.13;
const VISION_GATE_VIDEO_VOLUME = 0.3;

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

type StructuredMorningLine = { at: number; key: string; text: string; speechText?: string };

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
      { at: 6, key: "open-1", text: "おはようございます" },
      { at: 20, key: "open-2", text: "今日も\n新しい朝が訪れました" },
      { at: 36, key: "open-3", text: "少しだけ\n立ち止まってみましょう" },
      { at: 52, key: "open-4", text: "ゆっくり\n息を吸います" },
      { at: 66, key: "open-5", text: "そして\n静かに吐きます" },
      { at: 82, key: "open-6", text: "もう一度\nゆっくり息を吸います" },
      { at: 96, key: "open-7", text: "ゆっくり吐きます" }
    ],
    affirmationLines: [
      { at: 112, key: "affirm-1", text: "呼吸とともに\n身体が少しずつ目覚めていきます" },
      { at: 128, key: "affirm-2", text: "今は\n何も変えなくても大丈夫です" },
      { at: 144, key: "affirm-3", text: "ただ\nここにいる自分を感じてみましょう" }
    ],
    closingLines: [
      {
        at: 158,
        key: "close-1",
        text: "今日という 一日\n今ここから始まります",
        speechText: "今日という いちにちは\n今ここから始まります"
      },
      { at: 170, key: "close-2", text: "あなた本来のリズムで" },
      { at: 178, key: "close-3", text: "いってらっしゃい" }
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
      { at: 6, key: "open-1", text: "좋은 아침입니다" },
      { at: 20, key: "open-2", text: "오늘도\n새로운 아침이 찾아왔습니다" },
      { at: 36, key: "open-3", text: "잠시만\n멈춰 서 봅니다" },
      { at: 52, key: "open-4", text: "천천히\n숨을 들이쉽니다" },
      { at: 66, key: "open-5", text: "그리고\n조용히 내쉽니다" },
      { at: 82, key: "open-6", text: "한 번 더\n천천히 숨을 들이쉽니다" },
      { at: 96, key: "open-7", text: "길게 내쉽니다" }
    ],
    affirmationLines: [
      { at: 112, key: "affirm-1", text: "숨결을 따라\n몸이 조금씩 깨어납니다" },
      { at: 128, key: "affirm-2", text: "지금은\n아무것도 바꾸지 않아도 괜찮습니다" },
      { at: 144, key: "affirm-3", text: "그저\n여기 있는 나를 가만히 느껴봅니다" }
    ],
    closingLines: [
      { at: 158, key: "close-1", text: "오늘이라는 하루는\n지금 여기에서 시작됩니다" },
      { at: 170, key: "close-2", text: "당신 본래의 리듬으로" },
      { at: 178, key: "close-3", text: "다녀오세요" }
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
      { at: 6, key: "open-1", text: "Good morning" },
      { at: 20, key: "open-2", text: "A new morning\nhas found you again" },
      { at: 36, key: "open-3", text: "Pause here\nfor a moment" },
      { at: 52, key: "open-4", text: "Slowly breathe in" },
      { at: 66, key: "open-5", text: "And gently breathe out" },
      { at: 82, key: "open-6", text: "Once more now\nA slow breath in" },
      { at: 96, key: "open-7", text: "And an easy breath out" }
    ],
    affirmationLines: [
      { at: 112, key: "affirm-1", text: "With the breath\nyour body begins to wake" },
      { at: 128, key: "affirm-2", text: "Nothing needs to change\nright now" },
      { at: 144, key: "affirm-3", text: "Just feel yourself here" }
    ],
    closingLines: [
      { at: 158, key: "close-1", text: "This day begins\nhere" },
      { at: 170, key: "close-2", text: "In your own natural rhythm" },
      { at: 178, key: "close-3", text: "Go gently" }
    ]
  }
} as const;

const energyGateCopy = {
  jp: {
    title: "脳と身体を目覚めさせる",
    subtitle: "体と脳を\n中心から目覚めさせます",
    duration: "3:00",
    audioLabel: "朝のエネルギーリチュアル",
    startAudio: "音声を開始",
    pause: "一度止める",
    resume: "続ける",
    inhale: "吸う",
    exhale: "吐く",
    completionTitle: "今日、また戻ることができました",
    completionMessage: "エネルギーが\n静かに戻っています",
    completionNote: "少しずつ、早く\n戻れるようになっています",
    completionButton: "朝の扉へ戻る",
    openingFade: "脳と身体を目覚めさせる",
    integration: "丹田を感じます\n今を感じます",
    openingLines: [
      { at: 5, key: "open-1", text: "ようこそ" },
      { at: 10, key: "open-2", text: "今日は" },
      { at: 16, key: "open-3", text: "体の中心から目覚めます" },
      { at: 24, key: "open-4", text: "おへその下" },
      { at: 30, key: "open-5", text: "丹田に意識を向けます" }
    ],
    awarenessLines: [
      { at: 40, key: "body-1", text: "丹田" },
      { at: 48, key: "body-2", text: "丹田" },
      { at: 58, key: "body-3", text: "呼吸は自然に" },
      { at: 68, key: "body-4", text: "丹田を感じます" }
    ],
    energyLines: [
      { at: 84, key: "energy-1", text: "体が目覚めます" },
      { at: 94, key: "energy-2", text: "脳が目覚めます" },
      { at: 106, key: "energy-3", text: "丹田" },
      { at: 114, key: "energy-4", text: "丹田" },
      { at: 126, key: "energy-5", text: "温かさを感じます" },
      { at: 138, key: "energy-6", text: "生命力を感じます" },
      { at: 150, key: "energy-7", text: "今日を支える力は\nすでにあなたの中にあります" }
    ],
    closingLines: [
      { at: 170, key: "close-1", text: "準備ができました" }
    ]
  },
  kr: {
    title: "뇌와 몸을 깨우기",
    subtitle: "몸과 뇌를\n중심에서 조용히 깨웁니다",
    duration: "3:00",
    audioLabel: "아침 에너지 리추얼",
    startAudio: "음성 시작하기",
    pause: "잠시 멈추기",
    resume: "이어가기",
    inhale: "들이쉬기",
    exhale: "내쉬기",
    completionTitle: "오늘, 다시 돌아올 수 있었습니다",
    completionMessage: "에너지가\n조용히 돌아오고 있습니다",
    completionNote: "조금 더 빨리 자신에게\n돌아오고 있습니다",
    completionButton: "아침의 문으로 돌아가기",
    openingFade: "뇌와 몸을 깨우기",
    integration: "단전을 느껴봅니다\n지금을 느껴봅니다",
    openingLines: [
      { at: 5, key: "open-1", text: "어서 오세요" },
      { at: 10, key: "open-2", text: "오늘은 몸과 뇌를 깨웁니다" },
      { at: 24, key: "open-4", text: "배꼽 아래" },
      { at: 30, key: "open-5", text: "단전에 의식을 향해봅니다" }
    ],
    awarenessLines: [
      { at: 40, key: "body-1", text: "가볍게 두드립니다" },
      { at: 50, key: "body-2", text: "호흡은 자연스럽게" },
      { at: 62, key: "body-3", text: "단전을 느껴봅니다" }
    ],
    energyLines: [
      { at: 78, key: "energy-1", text: "몸이 깨어납니다" },
      { at: 90, key: "energy-2", text: "뇌가 깨어납니다" },
      { at: 104, key: "energy-3", text: "따뜻함을 느낍니다" },
      { at: 118, key: "energy-4", text: "생명력을 느낍니다" },
      { at: 134, key: "energy-5", text: "에너지가 돌아옵니다" },
      { at: 150, key: "energy-6", text: "오늘을 움직이는 힘은\n이미 내 안에 있습니다" }
    ],
    closingLines: [
      { at: 170, key: "close-1", text: "준비되었습니다" }
    ]
  },
  en: {
    title: "Wake Brain and Body",
    subtitle: "A quiet ritual\nfor body brain and center",
    duration: "3:00",
    audioLabel: "Morning Energy Ritual",
    startAudio: "Start Audio",
    pause: "Pause",
    resume: "Continue",
    inhale: "Inhale",
    exhale: "Exhale",
    completionTitle: "Today, you returned again",
    completionMessage: "Your energy is\nreturning quietly",
    completionNote: "You are learning to\nreturn more easily",
    completionButton: "Return to Morning Gate",
    openingFade: "Wake Brain and Body",
    integration: "Feel your center\nFeel this moment",
    openingLines: [
      { at: 5, key: "open-1", text: "Welcome" },
      { at: 10, key: "open-2", text: "Today" },
      { at: 16, key: "open-3", text: "we awaken from our center" },
      { at: 24, key: "open-4", text: "Below the navel" },
      { at: 30, key: "open-5", text: "feel your Danjeon" }
    ],
    awarenessLines: [
      { at: 40, key: "body-1", text: "Danjeon" },
      { at: 48, key: "body-2", text: "Danjeon" },
      { at: 58, key: "body-3", text: "Let the breath be natural" },
      { at: 68, key: "body-4", text: "Feel your Danjeon" }
    ],
    energyLines: [
      { at: 84, key: "energy-1", text: "The body awakens" },
      { at: 94, key: "energy-2", text: "The brain awakens" },
      { at: 106, key: "energy-3", text: "Danjeon" },
      { at: 114, key: "energy-4", text: "Danjeon" },
      { at: 126, key: "energy-5", text: "Feel the warmth" },
      { at: 138, key: "energy-6", text: "Feel the life energy" },
      { at: 150, key: "energy-7", text: "The strength for today\nis already within you" }
    ],
    closingLines: [
      { at: 170, key: "close-1", text: "You are ready" }
    ]
  }
} as const;

const visionGateCopy = {
  jp: {
    title: "方向を思い出す",
    subtitle: "今日の方向を\n静かに思い出す時間です",
    duration: "3:00",
    audioLabel: "朝のビジョンリチュアル",
    startAudio: "音声を開始",
    pause: "一度止める",
    resume: "続ける",
    inhale: "吸う",
    exhale: "吐く",
    completionTitle: "今日、また戻ることができました",
    completionMessage: "今日は\n一歩で十分です",
    completionNote: "リズムを思い出す力が\n育っています",
    completionButton: "朝の扉へ戻る",
    openingFade: "方向を思い出す",
    integration: "静かに 今日を\n始めます",
    openingLines: [
      { at: 6, key: "open-1", text: "ようこそ" },
      { at: 18, key: "open-2", text: "ゆっくり 息を吸います" },
      { at: 30, key: "open-3", text: "そして 静かに吐きます" },
      { at: 46, key: "open-4", text: "新しい いちにちが あなたの前に 静かに開いています" }
    ],
    visionLines: [
      { at: 58, key: "vision-1", text: "今日は また始められる 新しい いちにちです" },
      { at: 72, key: "vision-2", text: "昨日は もう過ぎました" },
      { at: 84, key: "vision-3", text: "明日は まだ来ていません" },
      { at: 96, key: "vision-4", text: "今 ここにあるのは この瞬間です" },
      { at: 112, key: "vision-5", text: "朝の光を 心の中に そっと浮かべます" },
      { at: 126, key: "vision-6", text: "やわらかな光が 顔を照らし 胸まで静かに届きます" },
      { at: 142, key: "vision-7", text: "息を吸うたびに 新しい力が 入ってきます" },
      { at: 156, key: "vision-8", text: "息を吐くたびに 心配は 少しずつ遠ざかります" }
    ],
    closingLines: [
      { at: 168, key: "close-1", text: "今日は どんな自分で いたいですか" },
      { at: 178, key: "close-2", text: "静かに微笑んで 今日を始めます" }
    ]
  },
  kr: {
    title: "방향을 기억하기",
    subtitle: "오늘의 방향을\n조용히 떠올리는 시간",
    duration: "3:00",
    audioLabel: "아침 비전 리추얼",
    startAudio: "음성 시작하기",
    pause: "잠시 멈추기",
    resume: "이어가기",
    inhale: "들이쉬기",
    exhale: "내쉬기",
    completionTitle: "오늘, 다시 돌아올 수 있었습니다",
    completionMessage: "오늘은\n한 걸음이면 충분합니다",
    completionNote: "리듬을 기억하는 힘이\n자라고 있습니다",
    completionButton: "아침의 문으로 돌아가기",
    openingFade: "방향을 기억하기",
    integration: "조용히 오늘을\n시작합니다",
    openingLines: [
      { at: 6, key: "open-1", text: "좋은 아침입니다" },
      { at: 18, key: "open-2", text: "천천히 숨을 들이마십니다" },
      { at: 30, key: "open-3", text: "그리고 조용히 내쉽니다" },
      { at: 46, key: "open-4", text: "새로운 하루가 당신 앞에 조용히 펼쳐지고 있습니다" }
    ],
    visionLines: [
      { at: 58, key: "vision-1", text: "오늘은 다시 시작할 수 있는 새로운 하루입니다" },
      { at: 72, key: "vision-2", text: "어제는 지나갔습니다" },
      { at: 84, key: "vision-3", text: "내일은 아직 오지 않았습니다" },
      { at: 96, key: "vision-4", text: "우리에게 있는 것은 지금 이 순간입니다" },
      { at: 112, key: "vision-5", text: "천천히 아침 햇살을 마음속에 떠올려 봅니다" },
      { at: 126, key: "vision-6", text: "따뜻한 빛이 얼굴을 비추고 가슴까지 조용히 스며듭니다" },
      { at: 142, key: "vision-7", text: "숨을 들이마실 때마다 새로운 힘이 들어옵니다" },
      { at: 156, key: "vision-8", text: "숨을 내쉴 때마다 걱정은 조금씩 멀어집니다" }
    ],
    closingLines: [
      { at: 168, key: "close-1", text: "오늘 어떤 사람이 되고 싶습니까" },
      { at: 178, key: "close-2", text: "조용히 미소를 지으며 오늘을 시작합니다" }
    ]
  },
  en: {
    title: "Remember Your Direction",
    subtitle: "A quiet space\nto remember your direction",
    duration: "3:00",
    audioLabel: "Morning Vision Ritual",
    startAudio: "Start Audio",
    pause: "Pause",
    resume: "Continue",
    inhale: "Inhale",
    exhale: "Exhale",
    completionTitle: "Today, you returned again",
    completionMessage: "One step is enough\nfor today",
    completionNote: "Your rhythm is\nremembering itself",
    completionButton: "Return to Morning Gate",
    openingFade: "Remember Your Direction",
    integration: "Begin this day\nquietly",
    openingLines: [
      { at: 6, key: "open-1", text: "Welcome" },
      { at: 18, key: "open-2", text: "Slowly breathe in" },
      { at: 30, key: "open-3", text: "And gently breathe out" },
      { at: 46, key: "open-4", text: "A new day is quietly opening in front of you" }
    ],
    visionLines: [
      { at: 58, key: "vision-1", text: "Today is a new day and you can begin again" },
      { at: 72, key: "vision-2", text: "Yesterday has already passed" },
      { at: 84, key: "vision-3", text: "Tomorrow has not yet arrived" },
      { at: 96, key: "vision-4", text: "What we have is this moment" },
      { at: 112, key: "vision-5", text: "Let the morning light rise softly in your mind" },
      { at: 126, key: "vision-6", text: "A gentle warmth touches your face and settles into your chest" },
      { at: 142, key: "vision-7", text: "Each inhale brings a little new strength" },
      { at: 156, key: "vision-8", text: "Each exhale lets worry move a little farther away" }
    ],
    closingLines: [
      { at: 168, key: "close-1", text: "Who do you want to be today" },
      { at: 178, key: "close-2", text: "With a quiet smile begin your day" }
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
    isEnergyGate
      ? MORNING_GATE_AUDIO.energy
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
  const ambientFadeInOptions = isStructuredMorningGate ? { fadeInMs: MORNING_GATE_FADE_IN_MS } : undefined;
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
  const completionMessageText = isStructuredMorningGate
    ? morningGateCopy.completionMessage
    : basicPracticeCopy
      ? getBasicIdentityCompletionMessage(localizedLanguage)
      : copy.completionMessage;
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
  const journeyOverlayMessage =
    journeyMode && journeyGuidance
      ? journeyGuidanceStage === "opening"
        ? journeyGuidance.opening
        : journeyGuidanceStage === "closing"
          ? journeyGuidance.closing
          : null
      : null;
  const affirmationProgress = isStructuredMorningGate ? Math.min(100, (elapsedTotalSeconds / AFFIRMATION_TOTAL_SECONDS) * 100) : 0;

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

  async function fadeMorningAmbientGain(targetVolume: number, durationMs: number) {
    const mix = morningAmbientMixRef.current;
    const gainNode = mix.gainNode;
    const context = mix.context;

    if (!gainNode || !context) {
      return;
    }

    mix.fadeToken += 1;
    const currentToken = mix.fadeToken;
    const now = context.currentTime;
    const safeTarget = Math.max(0, Math.min(1, targetVolume));
    const currentValue = gainNode.gain.value;

    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(currentValue, now);
    gainNode.gain.linearRampToValueAtTime(safeTarget, now + durationMs / 1000);

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, durationMs);
    });

    if (morningAmbientMixRef.current.fadeToken !== currentToken) {
      return;
    }
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
    console.log("[Morning Gate Audio] init", {
      gate: nextDoor,
      mobileNeedsGesture,
      nextSoundEnabled,
      shouldPromptForAudioStart,
      pendingStructuredAmbientAudio,
      structuredAudioSource:
        nextType === "morning" && nextDoor === "affirmation"
          ? AWAKENING_GATE_VIDEO_SRC
          : nextType === "morning" && nextDoor === "energy"
            ? MORNING_GATE_AUDIO.energy.src
            : nextType === "morning" && nextDoor === "vision"
              ? VISION_GATE_VIDEO_SRC
              : null
    });
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
      if (isStructuredMorningGate) {
        void stopStructuredMorningAmbient();
      } else {
        void stopAmbientNatureAudio(ambientAudioRef, ambientFadeOutMs);
      }
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
    if (isComplete || !soundEnabled) {
      if (isStructuredMorningGate) {
        void stopStructuredMorningAmbient();
      } else {
        void stopAmbientNatureAudio(ambientAudioRef, ambientFadeOutMs);
      }
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
        void stopAmbientNatureAudio(ambientAudioRef, ambientFadeOutMs);
      }
    };
  }, [ambientAudioSource, ambientAudioVolume, hasUserGesture, isComplete, isStructuredMorningGate, journeyMode, soundEnabled]);

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
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        structuredSpeechSequenceRef.current += 1;
        window.speechSynthesis.cancel();
      }
    };
  }, [ambientAudioVolume]);

  async function runMeditationComplete() {
    if (isStructuredMorningGate) {
      await stopStructuredMorningAmbient();
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

  async function handleProgramAudioStart() {
    setHasUserGesture(true);
    setRequiresExplicitAudioStart(false);
    setNeedsUserStart(false);
    setIsPaused(false);
    unlockStructuredMorningSpeech();
    logStructuredMorningAmbientState("program-start-tap");

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
        structuredSpeechSequenceRef.current += 1;
        window.speechSynthesis.cancel();
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
