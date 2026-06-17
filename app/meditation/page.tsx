"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage, useSiteCopy } from "@/lib/i18n";
import { getNatureSoundPreference, setNatureSoundPreference, startAmbientNatureAudio, stopAmbientNatureAudio } from "@/lib/meditation-ambient-audio";
import { handleMeditationComplete as triggerMeditationCompletion, supportsMeditationVibration } from "@/lib/meditation-completion";
import { getRhythmJourneyContent, getRhythmJourneyGuidance, journeyAudioMap } from "@/lib/rhythm-journey";

const CYCLE_SECONDS = 10;
const INHALE_SECONDS = 4;
const HOLD_SECONDS = 2;
const AI_COACH_URL =
  process.env.NEXT_PUBLIC_AI_COACH_URL ||
  "https://chatgpt.com/g/g-69f968bc9a408191a3e5f943912666c0-quiet-rhythm-guide";
const JOURNEY_AUDIO_PENDING_KEY = "meisoulife_journey_audio_pending";
const JOURNEY_AUDIO_DAY_KEY = "meisoulife_journey_day";
const AFFIRMATION_TOTAL_SECONDS = 180;

type BreathPhase = "inhale" | "hold" | "exhale";
type MeditationType = "default" | "morning" | "day" | "night";
type MeditationDoor =
  | "affirmation"
  | "energy"
  | "vision"
  | "focus"
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
    subtitle: "朝を少し明るく始めたいとき",
    duration: "3:00",
    audioLabel: "朝のリチュアル",
    pause: "一度止める",
    resume: "続ける",
    inhale: "吸う",
    exhale: "吐く",
    completionTitle: "今日の自分を選びました。",
    completionMessage: "静かに、一日を始めましょう。",
    completionNote: "朝の光に合わせて、ゆっくり進めば大丈夫です。",
    completionButton: "朝の扉へ戻る",
    openingFade: "今日の自分を選ぶ",
    integration: "今日の自分を選ぶ",
    openingLines: [
      { at: 15, key: "open-1", text: "目を閉じてください。" },
      { at: 21, key: "open-2", text: "新しい一日が始まりました。" },
      { at: 28, key: "open-3", text: "ゆっくり息を吸います。" }
    ],
    affirmationLines: [
      { at: 80, key: "affirm-1", text: "今日は目覚めて生きます。" },
      { at: 90, key: "affirm-2", text: "今日は前向きに進みます。" },
      { at: 100, key: "affirm-3", text: "今日は中心を失いません。" },
      { at: 110, key: "affirm-4", text: "今日は成長を選びます。" },
      { at: 120, key: "affirm-5", text: "今日は自分を信じます。" }
    ],
    closingLines: [
      { at: 160, key: "close-1", text: "いいですね。" },
      { at: 168, key: "close-2", text: "今日の一日が始まります。" },
      { at: 176, key: "close-3", text: "今日の自分を選びましょう。" }
    ]
  }
} as const;

const energyGateCopy = {
  jp: {
    title: "脳と身体を目覚めさせる",
    subtitle: "まだ身体が完全に起きていないとき",
    duration: "3:00",
    audioLabel: "朝のエネルギーリチュアル",
    pause: "一度止める",
    resume: "続ける",
    inhale: "吸う",
    exhale: "吐く",
    completionTitle: "身体が目覚めました。",
    completionMessage: "今日のエネルギーとともに進みましょう。",
    completionNote: "少しずつ身体を開きながら、一日を始めていけば大丈夫です。",
    completionButton: "朝の扉へ戻る",
    openingFade: "脳と身体を目覚めさせる",
    integration: "脳と身体を目覚めさせる",
    openingLines: [
      { at: 15, key: "open-1", text: "目を閉じてください。" },
      { at: 23, key: "open-2", text: "ゆっくり息を吸います。" },
      { at: 32, key: "open-3", text: "身体の感覚を感じてみましょう。" },
      { at: 40, key: "open-4", text: "あなたの身体は今、少しずつ目覚めています。" }
    ],
    awarenessLines: [
      { at: 52, key: "body-1", text: "肩の力をやさしく緩めます。" },
      { at: 64, key: "body-2", text: "胸を軽く開きます。" },
      { at: 76, key: "body-3", text: "おへその下を感じます。" },
      { at: 88, key: "body-4", text: "手の先、足の先まで意識を向けます。" }
    ],
    energyLines: [
      { at: 102, key: "energy-1", text: "息を吸うたびに、新しいエネルギーが入ってきます。" },
      { at: 116, key: "energy-2", text: "息を吐くたびに、身体が軽く目覚めていきます。" },
      { at: 132, key: "energy-3", text: "今日は生命力で動きます。" },
      { at: 140, key: "energy-4", text: "今日は元気に生きます。" },
      { at: 148, key: "energy-5", text: "今日は身体とともに目覚めます。" }
    ],
    closingLines: [
      { at: 170, key: "close-1", text: "ありがとうございます。" },
      { at: 175, key: "close-2", text: "身体が少し目覚めました。" },
      { at: 179, key: "close-3", text: "今日のエネルギーとともに、一日を始めましょう。" }
    ]
  }
} as const;

const visionGateCopy = {
  jp: {
    title: "ビジョンスクリーン瞑想",
    subtitle: "今日の一日を、心の中で静かに描く3分。",
    duration: "3:00",
    audioLabel: "朝のビジョンリチュアル",
    pause: "一度止める",
    resume: "続ける",
    inhale: "吸う",
    exhale: "吐く",
    completionTitle: "心に描いた一日が始まります。",
    completionMessage: "今日の小さな方向が、やさしく未来へつながっていきます。",
    completionNote: "焦らなくても大丈夫です。静かに選んだ方向を胸に、一日を始めましょう。",
    completionButton: "朝の扉へ戻る",
    openingFade: "ビジョンスクリーン瞑想",
    integration: "今日の一日を心に描く",
    openingLines: [
      { at: 15, key: "open-1", text: "目を軽く閉じてください。" },
      { at: 23, key: "open-2", text: "呼吸をゆっくり吸って、ゆっくり吐きます。" },
      { at: 32, key: "open-3", text: "今この瞬間、新しい一日が始まりました。" },
      { at: 41, key: "open-4", text: "今日はどんな一日でありたいですか。" }
    ],
    visionLines: [
      { at: 56, key: "vision-1", text: "急がなくて大丈夫です。" },
      { at: 64, key: "vision-2", text: "答えを急いで探さなくても大丈夫です。" },
      { at: 74, key: "vision-3", text: "心の中に、いちばん大切なひと場面を静かに思い浮かべてみましょう。" },
      { at: 88, key: "vision-4", text: "健やかな自分の姿かもしれません。" },
      { at: 96, key: "vision-5", text: "やわらかく笑っている自分の姿かもしれません。" },
      { at: 106, key: "vision-6", text: "誰かの力になっている姿かもしれません。" },
      { at: 114, key: "vision-7", text: "長く願ってきた生き方の景色かもしれません。" },
      { at: 124, key: "vision-8", text: "その場面を、心のスクリーンにそっと映してみます。" },
      { at: 134, key: "vision-9", text: "もう叶い始めているように、自然に感じてみましょう。" },
      { at: 144, key: "vision-10", text: "その中のあなたは、どんな表情をしていますか。" },
      { at: 152, key: "vision-11", text: "どんな心で生き、どんなエネルギーを分かち合っていますか。" }
    ],
    closingLines: [
      { at: 170, key: "close-1", text: "未来は遠くではなく、今の小さな選択の中で育っていきます。" },
      { at: 176, key: "close-2", text: "私は今日、私らしく生きます。" },
      { at: 179, key: "close-3", text: "微笑みとともに、今日の道を始めましょう。" }
    ]
  },
  kr: {
    title: "비전 스크린 명상",
    subtitle: "오늘 하루의 방향을 마음속에 조용히 그리는 3분.",
    duration: "3:00",
    audioLabel: "아침 비전 리추얼",
    pause: "잠시 멈추기",
    resume: "이어가기",
    inhale: "들이쉬기",
    exhale: "내쉬기",
    completionTitle: "오늘 마음에 그린 한 장면이 시작됩니다.",
    completionMessage: "오늘 마음에 그린 한 장면이, 미래의 현실이 됩니다.",
    completionNote: "조용히 선택한 방향을 가슴에 담고, 오늘의 길을 시작해 보세요.",
    completionButton: "아침의 문으로 돌아가기",
    openingFade: "비전 스크린 명상",
    integration: "오늘 하루를 마음에 그립니다",
    openingLines: [
      { at: 15, key: "open-1", text: "눈을 가볍게 감아봅니다." },
      { at: 23, key: "open-2", text: "호흡을 천천히 들이마시고, 천천히 내쉽니다." },
      { at: 32, key: "open-3", text: "지금 이 순간, 새로운 하루가 시작되었습니다." },
      { at: 41, key: "open-4", text: "오늘은 어떤 하루가 되기를 바라나요?" }
    ],
    visionLines: [
      { at: 56, key: "vision-1", text: "서두르지 않아도 됩니다." },
      { at: 64, key: "vision-2", text: "정답을 찾으려 하지 않아도 됩니다." },
      { at: 74, key: "vision-3", text: "그저 마음속에 가장 소중한 한 장면을 떠올려 보세요." },
      { at: 88, key: "vision-4", text: "건강한 나의 모습일 수도 있고, 밝게 웃고 있는 모습일 수도 있습니다." },
      { at: 102, key: "vision-5", text: "누군가에게 도움이 되는 모습일 수도 있고, 오랫동안 꿈꾸어 온 삶의 모습일 수도 있습니다." },
      { at: 118, key: "vision-6", text: "그 장면을 마음의 스크린에 천천히 비춰봅니다." },
      { at: 128, key: "vision-7", text: "이미 이루어진 것처럼, 자연스럽게 느껴봅니다." },
      { at: 138, key: "vision-8", text: "그 모습 속의 나는 어떤 표정을 하고 있나요?" },
      { at: 146, key: "vision-9", text: "어떤 마음으로 살아가고 있나요?" },
      { at: 154, key: "vision-10", text: "어떤 에너지를 나누고 있나요?" }
    ],
    closingLines: [
      { at: 170, key: "close-1", text: "미래는 멀리 있는 것이 아니라, 지금의 선택 속에서 만들어집니다." },
      { at: 176, key: "close-2", text: "나는 오늘, 나의 가장 좋은 가능성을 선택합니다." },
      { at: 179, key: "close-3", text: "그리고 미소와 함께, 오늘의 길을 시작합니다." }
    ]
  },
  en: {
    title: "Vision Screen Meditation",
    subtitle: "A quiet 3-minute meditation to visualize the direction of your day.",
    duration: "3:00",
    audioLabel: "Morning Vision Ritual",
    pause: "Pause",
    resume: "Continue",
    inhale: "Inhale",
    exhale: "Exhale",
    completionTitle: "The scene in your heart can begin today.",
    completionMessage: "A quiet image held today can become tomorrow’s reality.",
    completionNote: "Hold this gentle direction in your chest and begin the day softly.",
    completionButton: "Return to Morning Gate",
    openingFade: "Vision Screen Meditation",
    integration: "Quietly envision your day",
    openingLines: [
      { at: 15, key: "open-1", text: "Gently close your eyes." },
      { at: 23, key: "open-2", text: "Breathe in slowly, and breathe out slowly." },
      { at: 32, key: "open-3", text: "A new day has begun in this moment." },
      { at: 41, key: "open-4", text: "What kind of day do you hope this will be?" }
    ],
    visionLines: [
      { at: 56, key: "vision-1", text: "There is no need to hurry." },
      { at: 64, key: "vision-2", text: "There is no need to force an answer." },
      { at: 74, key: "vision-3", text: "Simply let one meaningful scene arise in your heart." },
      { at: 88, key: "vision-4", text: "It may be a healthier version of you." },
      { at: 96, key: "vision-5", text: "It may be you smiling with quiet brightness." },
      { at: 106, key: "vision-6", text: "It may be you helping someone with care." },
      { at: 114, key: "vision-7", text: "It may be a life you have long hoped to live." },
      { at: 124, key: "vision-8", text: "Let that scene appear slowly on the screen of your heart." },
      { at: 136, key: "vision-9", text: "Feel it naturally, as if it is already beginning." },
      { at: 146, key: "vision-10", text: "What expression is on your face there?" },
      { at: 154, key: "vision-11", text: "What kind of energy are you sharing with the world?" }
    ],
    closingLines: [
      { at: 170, key: "close-1", text: "The future is not far away. It is shaped by the choices of this moment." },
      { at: 176, key: "close-2", text: "Today, I choose my truest possibility." },
      { at: 179, key: "close-3", text: "With a small smile, begin your day." }
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
    if (elapsedSeconds < 45) return "openingNarration";
    if (elapsedSeconds < 100) return "bodyAwareness";
    if (elapsedSeconds < 150) return "energy";
    if (elapsedSeconds < 170) return "integration";
    return "closing";
  }

  if (door === "vision") {
    if (elapsedSeconds < 15) return "openingFade";
    if (elapsedSeconds < 45) return "openingNarration";
    if (elapsedSeconds < 160) return "vision";
    if (elapsedSeconds < 170) return "integration";
    return "closing";
  }

  if (elapsedSeconds < 15) return "openingFade";
  if (elapsedSeconds < 35) return "openingNarration";
  if (elapsedSeconds < 80) return "breathing";
  if (elapsedSeconds < 130) return "affirmation";
  if (elapsedSeconds < 160) return "integration";
  return "closing";
}

function getStructuredMorningSpeechSettings(language: "jp" | "kr" | "en") {
  if (language === "kr") {
    return {
      lang: "ko-KR",
      rate: 0.84,
      pitch: 1.01,
      volume: 0.94,
      preferredNames: ["Yuna", "Sora", "Google 한국어", "Siri"]
    };
  }

  if (language === "en") {
    return {
      lang: "en-US",
      rate: 0.85,
      pitch: 1,
      volume: 0.94,
      preferredNames: ["Samantha", "Ava", "Victoria", "Google US English", "Siri"]
    };
  }

  return {
    lang: "ja-JP",
    rate: 0.84,
    pitch: 0.98,
    volume: 0.94,
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

export default function MeditationPage() {
  const { language } = useLanguage();
  const copy = useSiteCopy().meditationPage;
  const journeyCopy = useMemo(() => getRhythmJourneyContent(language), [language]);
  const affirmationCopy = affirmationGateCopy.jp;
  const energyCopy = energyGateCopy.jp;
  const visionCopy = visionGateCopy[(language === "kr" || language === "en" || language === "jp") ? language : "jp"];
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
  const [isPaused, setIsPaused] = useState(false);
  const [affirmationMessage, setAffirmationMessage] = useState<string | null>(null);
  const [journeyMode, setJourneyMode] = useState(false);
  const [journeyDay, setJourneyDay] = useState<number | null>(null);
  const [returnToHref, setReturnToHref] = useState("/rhythm-journey");
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const completionHandledRef = useRef(false);
  const spokenAffirmationKeysRef = useRef<Set<string>>(new Set());
  const elapsedTotalSeconds = totalSeconds - secondsLeft;
  const phase = useMemo(() => getBreathPhase(elapsedTotalSeconds), [elapsedTotalSeconds]);
  const isComplete = secondsLeft <= 0;
  const isAffirmationGate = meditationType === "morning" && meditationDoor === "affirmation";
  const isEnergyGate = meditationType === "morning" && meditationDoor === "energy";
  const isVisionGate = meditationType === "morning" && meditationDoor === "vision";
  const isStructuredMorningGate = isAffirmationGate || isEnergyGate || isVisionGate;
  const morningGateCopy: StructuredMorningCopy = isVisionGate ? visionCopy : isEnergyGate ? energyCopy : affirmationCopy;
  const content = copy.variants[meditationType];
  const durationVariant = getDurationVariant(totalSeconds);
  const durationTextSet = copy.durationTexts?.[durationVariant];
  const journeyAudioSource = journeyDay ? journeyAudioMap[journeyDay] : undefined;
  const journeyGuidance = journeyDay ? getRhythmJourneyGuidance(language, journeyDay) : undefined;
  const ambientAudioSource = journeyMode && journeyAudioSource ? journeyAudioSource : undefined;
  const ambientAudioVolume = journeyMode ? 0.65 : isStructuredMorningGate ? 0.22 : undefined;
  const journeyGuidanceStage = getJourneyGuidanceStage(elapsedTotalSeconds, totalSeconds);
  const affirmationStage = isStructuredMorningGate ? getMorningGateStage(meditationDoor, elapsedTotalSeconds) : null;
  const topText = journeyMode
    ? journeyCopy.timerTopText
    : meditationType === "morning" || meditationType === "night"
      ? content.topText
      : durationTextSet?.topText || content.topText;
  const introText = journeyMode ? journeyCopy.timerSubText : content.intro;
  const completionTitle =
    meditationType === "morning" || meditationType === "night"
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
    const searchParams = new URLSearchParams(window.location.search);
    const nextDuration = normalizeDuration(searchParams.get("duration"));
    const nextType = normalizeMeditationType(searchParams.get("type"));
    const nextDoor = normalizeDoor(searchParams.get("door"));
    const nextJourneyMode = searchParams.get("journey") === "1";
    const nextJourneyDay = Number(searchParams.get("day"));
    const nextReturnTo = searchParams.get("returnTo");
    const pendingJourneyAudio =
      typeof window === "undefined" ? null : window.sessionStorage.getItem(JOURNEY_AUDIO_PENDING_KEY);
    const storedJourneyDay =
      typeof window === "undefined" ? null : window.sessionStorage.getItem(JOURNEY_AUDIO_DAY_KEY);
    const resolvedJourneyDay = Number.isInteger(nextJourneyDay) && nextJourneyDay >= 1 && nextJourneyDay <= 7
      ? nextJourneyDay
      : Number(storedJourneyDay);

    const isThreeMinuteMorningDoor =
      nextType === "morning" &&
      (nextDoor === "affirmation" || nextDoor === "energy" || nextDoor === "vision");

    const resolvedDuration = isThreeMinuteMorningDoor ? AFFIRMATION_TOTAL_SECONDS : nextDuration;
    setTotalSeconds(resolvedDuration);
    setSecondsLeft(resolvedDuration);
    setMeditationType(nextType);
    setMeditationDoor(nextDoor);
    const nextSoundEnabled = nextJourneyMode && pendingJourneyAudio ? true : getNatureSoundPreference();
    setSoundEnabled(nextSoundEnabled);
    setJourneyMode(nextJourneyMode);
    setJourneyDay(Number.isInteger(resolvedJourneyDay) && resolvedJourneyDay >= 1 && resolvedJourneyDay <= 7 ? resolvedJourneyDay : null);
    setReturnToHref(nextReturnTo || "/rhythm-journey");
    setAmbientVideoFailed(false);
    setShowAmbientRetry(false);
    setNeedsUserStart(false);
    setHasUserGesture(false);
    setIsPaused(false);
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
  }, []);

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
      setSoundEnabled(true);
      setNatureSoundPreference(true);

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(JOURNEY_AUDIO_PENDING_KEY);
        window.sessionStorage.removeItem(JOURNEY_AUDIO_DAY_KEY);
      }

      return;
    }

    if (journeyMode) {
      setSoundEnabled(false);
      setNatureSoundPreference(false);
      setNeedsUserStart(true);
      console.warn("[Journey Audio] play failed");
      if (result.error) {
        console.error(`[Journey Audio] ${manual ? "manual start" : "autoplay"} failed:`, result.error);
      }

      if (typeof window !== "undefined") {
        console.warn("[Journey Audio] exact pending state kept for manual retry");
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

    try {
      if (!ambientAudioRef.current) {
        const audio = new Audio(ambientAudioSource);
        audio.loop = true;
        audio.preload = "auto";
        audio.volume = ambientAudioVolume ?? 0.65;
        audio.muted = false;
        audio.dataset.meisoSrc = ambientAudioSource;
        ambientAudioRef.current = audio;
      } else if (ambientAudioRef.current.dataset.meisoSrc !== ambientAudioSource) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.currentTime = 0;
        ambientAudioRef.current.src = ambientAudioSource;
        ambientAudioRef.current.dataset.meisoSrc = ambientAudioSource;
      }

      const audio = ambientAudioRef.current;
      audio.volume = ambientAudioVolume ?? 0.65;
      audio.muted = false;
      audio.loop = true;
      audio.load();
      console.log("[Journey Audio] journeyMode:", journeyMode);
      console.log("[Journey Audio] journeyDay:", journeyDay);
      console.log("[Journey Audio] src:", ambientAudioSource);
      console.log(
        "[Journey Audio] pending:",
        typeof window === "undefined" ? null : window.sessionStorage.getItem(JOURNEY_AUDIO_PENDING_KEY)
      );
      console.log("[Journey Audio] audio element:", ambientAudioRef.current);
      await audio.play();
      console.log("[Journey Audio] play started");
      setNeedsUserStart(false);
      setSoundEnabled(true);
      setNatureSoundPreference(true);
      setShowAmbientRetry(false);
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(JOURNEY_AUDIO_PENDING_KEY);
        window.sessionStorage.removeItem(JOURNEY_AUDIO_DAY_KEY);
      }
    } catch (error) {
      setSoundEnabled(false);
      setNatureSoundPreference(false);
      setNeedsUserStart(true);
      console.error("Audio playback failed:", error);
      console.warn("[Journey Audio] manual start failed", error);
    }
  }

  useEffect(() => {
    setVibrationSupported(supportsMeditationVibration());

    const markGesture = () => {
      setHasUserGesture(true);

      if (!isComplete && soundEnabled && !journeyMode) {
        startAmbientNatureAudio(ambientAudioRef, soundEnabled, ambientAudioSource, ambientAudioVolume).then((result) => {
          void handleAmbientStartResult(result);
        });
      }
    };

    window.addEventListener("pointerdown", markGesture, { once: true });
    window.addEventListener("keydown", markGesture, { once: true });

    return () => {
      window.removeEventListener("pointerdown", markGesture);
      window.removeEventListener("keydown", markGesture);
      stopAmbientNatureAudio(ambientAudioRef);
    };
  }, [ambientAudioSource, ambientAudioVolume, isComplete, soundEnabled]);

  useEffect(() => {
    if (secondsLeft <= 0 || isPaused) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isPaused, secondsLeft]);

  useEffect(() => {
    if (isComplete || !soundEnabled) {
      stopAmbientNatureAudio(ambientAudioRef);
      return;
    }

    if (!hasUserGesture || journeyMode) {
      return;
    }

    startAmbientNatureAudio(ambientAudioRef, soundEnabled, ambientAudioSource, ambientAudioVolume).then((result) => {
      void handleAmbientStartResult(result);
    });

    return () => {
      if (isComplete) {
        stopAmbientNatureAudio(ambientAudioRef);
      }
    };
  }, [ambientAudioSource, ambientAudioVolume, hasUserGesture, isComplete, journeyMode, soundEnabled]);

  useEffect(() => {
    if (!journeyMode || !ambientAudioSource || !soundEnabled || isComplete) {
      return;
    }

    startAmbientNatureAudio(ambientAudioRef, true, ambientAudioSource, ambientAudioVolume).then((result) => {
      void handleAmbientStartResult(result);
    });
  }, [ambientAudioSource, ambientAudioVolume, isComplete, journeyMode, soundEnabled]);

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
        window.speechSynthesis.cancel();
        const settings = getStructuredMorningSpeechSettings(language);
        const utterance = new SpeechSynthesisUtterance(nextLine.text);
        utterance.lang = settings.lang;
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;

        const selectedVoice = pickStructuredMorningVoice(
          window.speechSynthesis.getVoices(),
          settings.lang,
          settings.preferredNames
        );

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.warn("[affirmation-gate] speech synthesis unavailable", error);
      }
    }
  }, [elapsedTotalSeconds, isComplete, isPaused, isStructuredMorningGate, language, morningGateCopy]);

  useEffect(() => {
    if (!isStructuredMorningGate || typeof window === "undefined") {
      return;
    }

    if (affirmationStage === "openingFade") {
      setAffirmationMessage(morningGateCopy.openingFade);
      return;
    }

    if (affirmationStage === "breathing" || affirmationStage === "bodyAwareness") {
      setAffirmationMessage(phase === "inhale" ? morningGateCopy.inhale : morningGateCopy.exhale);
      return;
    }

    if (affirmationStage === "integration") {
      setAffirmationMessage(morningGateCopy.integration);
    }
  }, [affirmationStage, isStructuredMorningGate, morningGateCopy, phase]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function runMeditationComplete() {
    await stopAmbientNatureAudio(ambientAudioRef);
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
      const result = await startAmbientNatureAudio(ambientAudioRef, true, ambientAudioSource, ambientAudioVolume);
      await handleAmbientStartResult(result, true);
    } else {
      setSoundEnabled(false);
      setNatureSoundPreference(false);
      setShowAmbientRetry(false);
      setNeedsUserStart(false);
      stopAmbientNatureAudio(ambientAudioRef);
    }
  }

  function handleVibrationToggle() {
    setHasUserGesture(true);
    setVibrationEnabled((current) => !current);
  }

  async function handleAmbientRetry() {
    setHasUserGesture(true);
    const result = await startAmbientNatureAudio(ambientAudioRef, soundEnabled, ambientAudioSource, ambientAudioVolume);
    await handleAmbientStartResult(result, true);
  }

  function handlePauseToggle() {
    setHasUserGesture(true);
    setIsPaused((current) => {
      const next = !current;

      if (next && typeof window !== "undefined" && "speechSynthesis" in window) {
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
        ) : (
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(216,191,131,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(79,122,101,0.14),transparent_34%),linear-gradient(180deg,rgba(4,10,19,0.76)_0%,rgba(8,18,32,0.88)_100%)]" />
        )}
        {isStructuredMorningGate ? (
          <>
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(244,220,160,0.16),transparent_24%),radial-gradient(circle_at_bottom,rgba(125,162,108,0.12),transparent_34%),linear-gradient(180deg,rgba(34,42,72,0.92)_0%,rgba(18,29,48,0.92)_48%,rgba(12,22,37,0.96)_100%)]" />
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
                <p className="keep-phrase text-sm uppercase tracking-[0.32em] text-gold/80">{topText}</p>
                <p className="body-measure keep-phrase mx-auto text-sm leading-7 text-white/60 sm:text-base">{introText}</p>
              </div>
            )}

            <div className="mt-12 flex min-h-[320px] w-full flex-col items-center justify-center">
              {journeyMode && needsUserStart ? (
                <div className="mb-6 w-full max-w-md rounded-[24px] border border-[rgba(212,178,106,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-5 text-center shadow-[0_18px_50px_rgba(4,12,24,0.18)]">
                  <p className="text-sm leading-7 text-white/76">{journeyCopy.audioPrompt}</p>
                  <button
                    type="button"
                    onClick={handleJourneyAudioStart}
                    className="button-nowrap mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition hover:bg-gold/15 hover:text-[#f5e4b5]"
                  >
                    {journeyCopy.audioStart}
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
                <button
                  type="button"
                  onClick={handleSoundToggle}
                  className="button-nowrap inline-flex min-h-[36px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                  aria-pressed={soundEnabled}
                >
                  {soundEnabled ? `🔊 ${journeyMode ? journeyCopy.audioOn : copy.soundOn}` : `🔊 ${journeyMode ? journeyCopy.audioOff : copy.soundOff}`}
                </button>
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
              <p className="text-2xl font-medium text-white/72 transition-all duration-300 ease-out sm:text-3xl">
                {isStructuredMorningGate && (affirmationStage === "breathing" || affirmationStage === "bodyAwareness")
                  ? affirmationMessage
                  : copy.phases[phase]}
              </p>

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

            <div className="mt-8">
              <p className="text-sm font-medium tracking-[0.18em] text-white/68 transition-opacity duration-300 sm:text-base">
                {isStructuredMorningGate
                  ? affirmationStage === "breathing" || affirmationStage === "bodyAwareness"
                    ? phase === "inhale"
                      ? morningGateCopy.inhale
                      : morningGateCopy.exhale
                    : morningGateCopy.title
                  : copy.bottomText[phase]}
              </p>
            </div>
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
