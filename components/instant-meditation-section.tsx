"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { useLanguage, type Language } from "@/lib/i18n";
import type { LandingCopy } from "@/lib/landing-copy";
import { handleMeditationComplete as playMeditationCompletion } from "@/lib/meditation-completion";
import { markDailyRhythmCompleted } from "@/lib/return-rhythm";

type Phase = "inhale" | "hold" | "exhale";

type InstantMeditationSectionProps = {
  copy: LandingCopy["instant"];
};

type ZeroGateKey = "overload" | "anxiety" | "low-energy" | "distracted" | "reset-mood" | "sleep";
type DailyRhythmKey = "morning" | "day" | "night";
type MeditationExperienceKey = ZeroGateKey | DailyRhythmKey;

const TOTAL_SECONDS = 60;
const INHALE_SECONDS = 4;
const HOLD_SECONDS = 2;
const EXHALE_SECONDS = 4;
const MEDITATION_MOOD_STORAGE_KEY = "meisoulife_instant_meditation_mood";
const ZERO_GATE_STORAGE_KEY = "meisoulife_zero_gate";
const DEFAULT_SANCTUARY: ZeroGateKey = "overload";
const PRE_START_TRANSITION_MS = 1000;
const OPENING_QUIET_MS = 2000;
const OPENING_MESSAGE_MS = 5000;
const OPENING_FADE_MS = 700;
const OPENING_POST_FADE_MS = 900;

const sanctuaryVisuals: Record<
  MeditationExperienceKey,
  {
    source: string;
    poster: string;
    overlayClassName: string;
    glowClassName: string;
    videoClassName: string;
  }
> = {
  overload: {
    source: "/one-minute-reset/one-minute-reset-forest1.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(4,10,18,0.18),rgba(4,10,18,0.72)_72%,rgba(4,10,18,0.84))]",
    glowClassName: "bg-[radial-gradient(circle_at_78%_24%,rgba(125,151,130,0.16),transparent_42%)]",
    videoClassName: "brightness-[1.15] contrast-[0.98] saturate-[1.05]"
  },
  anxiety: {
    source: "/one-minute-reset/one-minute-reset-refresh1.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(5,10,18,0.22),rgba(5,10,18,0.74)_72%,rgba(5,10,18,0.86))]",
    glowClassName: "bg-[radial-gradient(circle_at_72%_22%,rgba(120,138,169,0.14),transparent_38%)]",
    videoClassName: "brightness-[1.15] contrast-[0.98] saturate-[1.05]"
  },
  morning: {
    source: "/videos2/morning-one-minute-rhythm.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(11,15,22,0.12),rgba(11,15,22,0.56)_70%,rgba(11,15,22,0.76))]",
    glowClassName: "bg-[radial-gradient(circle_at_76%_20%,rgba(230,197,120,0.16),transparent_40%)]",
    videoClassName: "brightness-[1.25] contrast-[0.95] saturate-[1.08]"
  },
  day: {
    source: "/videos/one-minute-reset-energy.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(6,10,16,0.16),rgba(6,10,16,0.64)_70%,rgba(6,10,16,0.8))]",
    glowClassName: "bg-[radial-gradient(circle_at_74%_26%,rgba(212,186,117,0.14),transparent_40%)]",
    videoClassName: "brightness-[1.15] contrast-[0.98] saturate-[1.05]"
  },
  night: {
    source: "/videos/one-minute-reset-moon8.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(4,8,18,0.24),rgba(4,8,18,0.74)_72%,rgba(4,8,18,0.88))]",
    glowClassName: "bg-[radial-gradient(circle_at_78%_18%,rgba(138,152,196,0.16),transparent_40%)]",
    videoClassName: "brightness-[0.95] contrast-[0.92] saturate-[0.95]"
  },
  "low-energy": {
    source: "/one-minute-reset/one-minute-reset-energy1.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(6,10,16,0.18),rgba(6,10,16,0.68)_70%,rgba(6,10,16,0.82))]",
    glowClassName: "bg-[radial-gradient(circle_at_74%_26%,rgba(212,186,117,0.14),transparent_40%)]",
    videoClassName: "brightness-[1.15] contrast-[0.98] saturate-[1.05]"
  },
  distracted: {
    source: "/one-minute-reset/one-minute-reset-focus1.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(4,11,19,0.2),rgba(4,11,19,0.72)_70%,rgba(4,11,19,0.84))]",
    glowClassName: "bg-[radial-gradient(circle_at_80%_22%,rgba(105,145,169,0.14),transparent_42%)]",
    videoClassName: "brightness-[1.15] contrast-[0.98] saturate-[1.05]"
  },
  "reset-mood": {
    source: "/one-minute-reset/one-minute-reset-sea1.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(6,11,18,0.16),rgba(6,11,18,0.68)_72%,rgba(6,11,18,0.82))]",
    glowClassName: "bg-[radial-gradient(circle_at_78%_20%,rgba(157,177,129,0.14),transparent_40%)]",
    videoClassName: "brightness-[1.15] contrast-[0.98] saturate-[1.05]"
  },
  sleep: {
    source: "/one-minute-reset/one-minute-reset-moon1.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(4,8,18,0.26),rgba(4,8,18,0.76)_72%,rgba(4,8,18,0.88))]",
    glowClassName: "bg-[radial-gradient(circle_at_78%_18%,rgba(138,152,196,0.16),transparent_40%)]",
    videoClassName: "brightness-[0.95] contrast-[0.92] saturate-[0.95]"
  }
};

const openingMessages: Record<ZeroGateKey, Record<Language, string>> = {
  overload: {
    jp: "考えることを少し休んでも大丈夫です。",
    kr: "생각을 잠시 쉬어도 괜찮습니다.",
    en: "It's okay to let your thoughts rest for a moment."
  },
  anxiety: {
    jp: "呼吸とともに、今ここへ戻ってみましょう。",
    kr: "호흡과 함께, 지금으로 돌아와 보세요.",
    en: "Return gently to this moment with your breath."
  },
  "low-energy": {
    jp: "体の奥にある力を、もう一度目覚めさせましょう。",
    kr: "몸 안의 작은 힘을 다시 깨워봅니다.",
    en: "Awaken the quiet strength already within you."
  },
  distracted: {
    jp: "散らばった心を、ゆっくり一つに集めてみましょう。",
    kr: "흩어진 마음을 천천히 모아봅니다.",
    en: "Gather your attention, one gentle breath at a time."
  },
  "reset-mood": {
    jp: "新しい空気を迎え入れてみましょう。",
    kr: "새로운 공기를 들이마셔 보세요.",
    en: "Welcome a breath of fresh air."
  },
  sleep: {
    jp: "今日を静かに手放しても大丈夫です。",
    kr: "오늘을 조용히 내려놓아도 괜찮습니다.",
    en: "It's okay to gently let today go."
  }
};

const gateTransitionMeta: Record<ZeroGateKey, { emoji: string; title: Record<Language, string> }> = {
  overload: {
    emoji: "🌲",
    title: {
      jp: "思考を空ける森",
      kr: "생각을 비우는 숲",
      en: "Empty Mind Forest"
    }
  },
  anxiety: {
    emoji: "🏕️",
    title: {
      jp: "安心の休息地",
      kr: "안심의 쉼터",
      en: "Rest Haven"
    }
  },
  "low-energy": {
    emoji: "🔥",
    title: {
      jp: "生命の火種",
      kr: "생명의 불씨",
      en: "Spark of Life"
    }
  },
  distracted: {
    emoji: "🌊",
    title: {
      jp: "集中の道",
      kr: "집중의 길",
      en: "Path of Focus"
    }
  },
  "reset-mood": {
    emoji: "🌊",
    title: {
      jp: "自由の海",
      kr: "자유의 바다",
      en: "Sea of Freedom"
    }
  },
  sleep: {
    emoji: "🌙",
    title: {
      jp: "月明かりの休み場",
      kr: "달빛 쉼터",
      en: "Moonlight Resting Place"
    }
  }
};

function isMeditationExperienceKey(value: string): value is MeditationExperienceKey {
  return value in sanctuaryVisuals;
}

function isZeroGateKey(value: string): value is ZeroGateKey {
  return ["overload", "anxiety", "low-energy", "distracted", "reset-mood", "sleep"].includes(value);
}

function readStoredGate(): ZeroGateKey {
  if (typeof window === "undefined") {
    return DEFAULT_SANCTUARY;
  }

  try {
    const rawValue = window.localStorage.getItem(ZERO_GATE_STORAGE_KEY);

    if (!rawValue) {
      return DEFAULT_SANCTUARY;
    }

    const parsed = JSON.parse(rawValue) as { gateKey?: string };

    if (parsed.gateKey && isZeroGateKey(parsed.gateKey)) {
      return parsed.gateKey;
    }
  } catch (error) {
    console.warn("Failed to read ZERO GATE selection", error);
  }

  return DEFAULT_SANCTUARY;
}

function getPhase(elapsedSeconds: number): Phase {
  const cycle = elapsedSeconds % (INHALE_SECONDS + HOLD_SECONDS + EXHALE_SECONDS);

  if (cycle < INHALE_SECONDS) {
    return "inhale";
  }

  if (cycle < INHALE_SECONDS + HOLD_SECONDS) {
    return "hold";
  }

  return "exhale";
}

function getPhaseSecondsRemaining(elapsedSeconds: number) {
  const cycleLength = INHALE_SECONDS + HOLD_SECONDS + EXHALE_SECONDS;
  const cyclePosition = elapsedSeconds % cycleLength;

  if (cyclePosition < INHALE_SECONDS) {
    return INHALE_SECONDS - cyclePosition;
  }

  if (cyclePosition < INHALE_SECONDS + HOLD_SECONDS) {
    return INHALE_SECONDS + HOLD_SECONDS - cyclePosition;
  }

  return cycleLength - cyclePosition;
}

function getCenterFocusText(startLabel: string) {
  if (/[가-힣]/.test(startLabel)) {
    return "자신에게 집중";
  }

  if (/[ぁ-んァ-ン一-龯]/.test(startLabel)) {
    return "自分に集中";
  }

  return "Focus on yourself";
}

function getBottomBreathGuidance(startLabel: string) {
  if (/[가-힣]/.test(startLabel)) {
    return "호흡을 자연스럽게.";
  }

  if (/[ぁ-んァ-ン一-龯]/.test(startLabel)) {
    return "呼吸を自然に。";
  }

  return "Let your breath be natural.";
}

function getReturnLabel(startLabel: string) {
  if (/[가-힣]/.test(startLabel)) {
    return "돌아가기";
  }

  if (/[ぁ-んァ-ン一-龯]/.test(startLabel)) {
    return "戻る";
  }

  return "Back";
}

function getNextStepText(startLabel: string) {
  if (/[가-힣]/.test(startLabel)) {
    return "아침의 리듬을 깨우는 3분으로.";
  }

  if (/[ぁ-んァ-ン一-龯]/.test(startLabel)) {
    return "朝のリズムを整える、3分へ。";
  }

  return "Continue with a 3-minute morning rhythm.";
}

function getNextStepCta(startLabel: string) {
  if (/[가-힣]/.test(startLabel)) {
    return "Morning Gate 체험하기";
  }

  if (/[ぁ-んァ-ン一-龯]/.test(startLabel)) {
    return "Morning Gateを見る";
  }

  return "Explore Morning Gate";
}

export function InstantMeditationSection({ copy }: InstantMeditationSectionProps) {
  const { language } = useLanguage();
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasUserGesture, setHasUserGesture] = useState(false);
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedGate, setSelectedGate] = useState<MeditationExperienceKey>(DEFAULT_SANCTUARY);
  const [hasSelectedGate, setHasSelectedGate] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [recoveryStarted, setRecoveryStarted] = useState(false);
  const [showGateTransition, setShowGateTransition] = useState(false);
  const [showGateTransitionContent, setShowGateTransitionContent] = useState(false);
  const [showOpeningOverlay, setShowOpeningOverlay] = useState(false);
  const [showOpeningMessage, setShowOpeningMessage] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const resetContainerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const completionHandledRef = useRef(false);
  const pendingAutoStartRef = useRef(false);
  const openingTimerRefs = useRef<number[]>([]);
  const gateTransitionTimerRefs = useRef<number[]>([]);

  const elapsedSeconds = TOTAL_SECONDS - secondsLeft;
  const phase = useMemo(() => getPhase(elapsedSeconds), [elapsedSeconds]);
  const phaseSecondsLeft = useMemo(() => getPhaseSecondsRemaining(elapsedSeconds), [elapsedSeconds]);
  const progress = elapsedSeconds / TOTAL_SECONDS;

  useEffect(() => {
    if (!running || !recoveryStarted) {
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate(phase === "hold" ? 40 : 18);
    }
  }, [phase, recoveryStarted, running]);

  useEffect(() => {
    if (secondsLeft === 0) {
      clearTimer();
      setRunning(false);
      const currentVideo = videoRef.current;

      if (currentVideo) {
        currentVideo.currentTime = Math.min(currentVideo.currentTime, currentVideo.duration || currentVideo.currentTime);
        void fadeOutVideoAudio(currentVideo).finally(() => {
          currentVideo.muted = true;
          currentVideo.volume = 0;
        });
      }
      markDailyRhythmCompleted();
    }
  }, [secondsLeft]);

  useEffect(() => {
    if (secondsLeft !== 0 || completionHandledRef.current) {
      return;
    }

    completionHandledRef.current = true;
    void handleMeditationComplete();
  }, [secondsLeft]);

  useEffect(() => {
    if (!running) {
      clearOpeningSequence();
    }
  }, [running]);

  useEffect(() => {
    return () => {
      clearGateTransition();
      clearOpeningSequence();
      clearTimer();
      videoRef.current?.pause();
      audioContextRef.current?.close().catch(() => undefined);
      audioContextRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => {
      mediaQuery.removeEventListener("change", syncPreference);
    };
  }, []);

  useEffect(() => {
    setSelectedGate(readStoredGate());
    setHasSelectedGate(false);
    setVideoLoading(false);
    setVideoFailed(false);
    setAudioBlocked(false);

    function handleGateChange(event: Event) {
      const customEvent = event as CustomEvent<{ gateKey?: string }>;
      const nextGate = customEvent.detail?.gateKey;

      if (nextGate && isMeditationExperienceKey(nextGate)) {
        void enterGate(nextGate);
      }
    }

    function handleDailyRhythmChange(event: Event) {
      const customEvent = event as CustomEvent<{ experienceKey?: string }>;
      const nextExperience = customEvent.detail?.experienceKey;

      if (nextExperience && isMeditationExperienceKey(nextExperience)) {
        void enterGate(nextExperience);
      }
    }

    window.addEventListener("meisoulife:zero-gate-change", handleGateChange as EventListener);
    window.addEventListener("meisoulife:daily-rhythm-change", handleDailyRhythmChange as EventListener);

    return () => {
      window.removeEventListener("meisoulife:zero-gate-change", handleGateChange as EventListener);
      window.removeEventListener("meisoulife:daily-rhythm-change", handleDailyRhythmChange as EventListener);
    };
  }, []);

  const centerFocusText = getCenterFocusText(copy.start);
  const bottomBreathGuidance = getBottomBreathGuidance(copy.start);
  const returnLabel = getReturnLabel(copy.start);
  const nextStepText = getNextStepText(copy.start);
  const nextStepCta = getNextStepCta(copy.start);
  const sanctuaryVisual = sanctuaryVisuals[selectedGate];
  const activeVideoSource = hasSelectedGate ? sanctuaryVisual.source : null;
  const visibleMoods = copy.moods.filter((mood) => mood.key !== "hard");
  const openingMessage = isZeroGateKey(selectedGate) ? openingMessages[selectedGate][language] : null;
  const openingSequenceActive = showOpeningOverlay && openingMessage;
  const recoveryUiVisible = recoveryStarted && hasSelectedGate && secondsLeft > 0;
  const transitionMeta = isZeroGateKey(selectedGate) ? gateTransitionMeta[selectedGate] : null;

  async function fadeOutVideoAudio(video: HTMLVideoElement) {
    if (video.muted || video.volume <= 0) {
      video.pause();
      return;
    }

    const startVolume = video.volume;
    const steps = 12;
    const stepDuration = 100;

    for (let step = 1; step <= steps; step += 1) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, stepDuration);
      });

      video.volume = startVolume * (1 - step / steps);
    }

    video.pause();
  }

  function clearTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function clearOpeningSequence() {
    for (const timerId of openingTimerRefs.current) {
      window.clearTimeout(timerId);
    }

    openingTimerRefs.current = [];
    setRecoveryStarted(false);
    setShowOpeningOverlay(false);
    setShowOpeningMessage(false);
  }

  function clearGateTransition() {
    for (const timerId of gateTransitionTimerRefs.current) {
      window.clearTimeout(timerId);
    }

    gateTransitionTimerRefs.current = [];
    setShowGateTransition(false);
    setShowGateTransitionContent(false);
  }

  function startGateTransition() {
    clearGateTransition();
    setShowGateTransition(true);

    const revealTimer = window.setTimeout(() => {
      setShowGateTransitionContent(true);
    }, 50);
    const hideContentTimer = window.setTimeout(() => {
      setShowGateTransitionContent(false);
    }, Math.max(PRE_START_TRANSITION_MS - 260, 600));
    const hideTransitionTimer = window.setTimeout(() => {
      setShowGateTransition(false);
    }, PRE_START_TRANSITION_MS);

    gateTransitionTimerRefs.current = [revealTimer, hideContentTimer, hideTransitionTimer];
  }

  function startOpeningSequence(experienceKey: MeditationExperienceKey) {
    clearOpeningSequence();

    if (!isZeroGateKey(experienceKey)) {
      return;
    }

    setShowOpeningOverlay(true);
    const showMessageTimer = window.setTimeout(() => {
      setShowOpeningMessage(true);
    }, OPENING_QUIET_MS);
    const hideMessageTimer = window.setTimeout(() => {
      setShowOpeningMessage(false);
    }, OPENING_QUIET_MS + OPENING_MESSAGE_MS);
    const hideOverlayTimer = window.setTimeout(() => {
      setShowOpeningOverlay(false);
    }, OPENING_QUIET_MS + OPENING_MESSAGE_MS + OPENING_FADE_MS + OPENING_POST_FADE_MS);
    const beginRecoveryTimer = window.setTimeout(() => {
      setRecoveryStarted(true);
      startTimer();
    }, OPENING_QUIET_MS + OPENING_MESSAGE_MS + OPENING_FADE_MS + OPENING_POST_FADE_MS);

    openingTimerRefs.current = [showMessageTimer, hideMessageTimer, hideOverlayTimer, beginRecoveryTimer];
  }

  function startTimer() {
    clearTimer();
    completionHandledRef.current = false;
    setSecondsLeft(TOTAL_SECONDS);
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearTimer();
          return 0;
        }

        return current - 1;
      });
    }, 1000);
  }

  async function syncVideoAudio(nextRunning: boolean, nextSoundEnabled: boolean) {
    const video = videoRef.current;

    if (!video) {
      return;
    }

     if (!activeVideoSource || videoFailed) {
      return;
    }

    if (!nextRunning) {
      clearTimer();
      video.pause();
      video.muted = true;
      video.volume = 0;
      return;
    }

    video.volume = nextSoundEnabled ? 0.28 : 0;
    video.muted = !nextSoundEnabled;

    try {
      video.load();
      await video.play();
      setAudioBlocked(false);
      if (!isZeroGateKey(selectedGate)) {
        setRecoveryStarted(true);
        startTimer();
      }
    } catch (error) {
      console.warn("Sanctuary video playback blocked or fell back", error);
      video.muted = true;
      video.volume = 0;
      setAudioBlocked(nextSoundEnabled);
      try {
        await video.play();
        if (!isZeroGateKey(selectedGate)) {
          setRecoveryStarted(true);
          startTimer();
        }
      } catch (fallbackError) {
        console.warn("Sanctuary muted video playback failed", fallbackError);
      }
    }
  }

  useEffect(() => {
    void syncVideoAudio(running, soundEnabled);
  }, [activeVideoSource, running, soundEnabled, videoFailed]);

  function scrollPlayerIntoView() {
    const node = playerRef.current;

    if (!node || typeof window === "undefined") {
      return;
    }

    const top = node.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  }

  async function startMeditationExperience(nextExperience: MeditationExperienceKey = selectedGate) {
    setHasUserGesture(true);
    setHasSelectedGate(true);
    setVideoLoading(true);
    setVideoFailed(false);
    setAudioBlocked(false);

    setSecondsLeft(TOTAL_SECONDS);
    completionHandledRef.current = false;
    pendingAutoStartRef.current = true;
    setRecoveryStarted(false);

    setRunning(true);
    startOpeningSequence(nextExperience);
  }

  function resetMeditationExperience() {
    pendingAutoStartRef.current = false;
    clearGateTransition();
    clearOpeningSequence();
    clearTimer();
    setRunning(false);
    setSecondsLeft(TOTAL_SECONDS);
    setHasSelectedGate(false);
    setVideoLoading(false);
    setVideoFailed(false);
    setAudioBlocked(false);
    setSelectedMood("");
    completionHandledRef.current = false;

    const video = videoRef.current;

    if (video) {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
      video.volume = 0;
    }

    if (typeof window !== "undefined") {
      const gateSection = document.getElementById("zero-gate");

      if (gateSection) {
        const top = gateSection.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
      }
    }
  }

  async function enterGate(nextGate: MeditationExperienceKey) {
    clearTimer();
    clearGateTransition();
    setSelectedGate(nextGate);
    setHasSelectedGate(true);
    setVideoLoading(true);
    setVideoFailed(false);
    setAudioBlocked(false);
    setSelectedMood("");
    scrollPlayerIntoView();

    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          scrollPlayerIntoView();
        }, 120);
      });
    }

    startGateTransition();

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, PRE_START_TRANSITION_MS);
    });

    await startMeditationExperience(nextGate);
  }

  async function handleStartPause() {
    if (running) {
      setRunning(false);
      return;
    }

    await startMeditationExperience();
  }

  async function handleSoundToggle() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setHasUserGesture(true);

    if (next && !running) {
      await startMeditationExperience();
      return;
    }

    if (next && running) {
      await syncVideoAudio(true, true);
    }
  }

  async function handleEnableAudio() {
    setHasUserGesture(true);
    setSoundEnabled(true);
    setAudioBlocked(false);
    await syncVideoAudio(true, true);
  }

  async function handleEnterFullscreen() {
    const container = resetContainerRef.current;
    const video = videoRef.current;

    if (!container && !video) {
      return;
    }

    try {
      if (video && "webkitEnterFullscreen" in video) {
        (
          video as HTMLVideoElement & {
            webkitEnterFullscreen?: () => void;
          }
        ).webkitEnterFullscreen?.();
        return;
      }

      if (document.fullscreenElement !== container) {
        if (container?.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container && "webkitRequestFullscreen" in container) {
          await (
            container as HTMLDivElement & {
              webkitRequestFullscreen?: () => Promise<void> | void;
            }
          ).webkitRequestFullscreen?.();
        }
      }
    } catch (error) {
      console.warn("Failed to enter ZERO GATE fullscreen", error);
    }
  }

  async function handleMeditationComplete() {
    await playMeditationCompletion({
      hasUserGesture,
      soundEnabled,
      vibrationEnabled: true,
      audioContextRef,
      playSoundOnComplete: false
    });
  }

  function handleMoodSelect(moodKey: string) {
    setSelectedMood(moodKey);

    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      MEDITATION_MOOD_STORAGE_KEY,
      JSON.stringify({
        moodKey,
        recordedAt: new Date().toISOString()
      })
    );
  }

  function handleVideoError() {
    setVideoLoading(false);
    setVideoFailed(true);
    setRunning(false);
    clearTimer();
  }

  async function handleVideoCanPlay() {
    setVideoLoading(false);

    if (!pendingAutoStartRef.current || !running) {
      return;
    }

    pendingAutoStartRef.current = false;
    await syncVideoAudio(true, soundEnabled);
  }

  const ringRadius = 106;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const dashOffset = ringCircumference - progress * ringCircumference;

  return (
    <section id="one-minute-experience" className="section-shell mt-16">
      <style jsx>{`
        .zero-gate-reset-container:fullscreen,
        .zero-gate-reset-container:-webkit-full-screen {
          width: 100vw;
          height: 100vh;
          max-width: none;
          border-radius: 0;
        }

        .zero-gate-reset-container:fullscreen video,
        .zero-gate-reset-container:-webkit-full-screen video {
          width: 100vw;
          height: 100vh;
          object-fit: cover;
        }
      `}</style>
      <div id="one-minute-meditation" />
      <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-8 shadow-[0_24px_80px_rgba(7,17,31,0.24)] sm:px-8 sm:py-10">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} align="center" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="order-2 space-y-4.5 lg:order-1">
            {secondsLeft === 0 ? (
              <div className="rounded-[24px] border border-gold/18 bg-gold/[0.06] p-5">
                <p className="text-sm leading-[1.8] text-white/82">{copy.completionMessage}</p>
                <div className="mt-5">
                  <p className="text-sm font-medium text-white/78">{copy.moodQuestion}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {visibleMoods.map((mood) => {
                      const selected = selectedMood === mood.key;

                      return (
                        <button
                          key={mood.key}
                          type="button"
                          onClick={() => handleMoodSelect(mood.key)}
                          className={`min-h-[52px] rounded-[20px] border px-4 py-3 text-sm font-medium transition duration-300 ${
                            selected
                              ? "border-gold/35 bg-gold/[0.16] text-white shadow-[0_12px_28px_rgba(212,186,117,0.12)]"
                              : "border-white/10 bg-white/[0.05] text-white/72 hover:border-white/14 hover:bg-white/[0.07] hover:text-white"
                          }`}
                        >
                          {mood.label}
                        </button>
                      );
                    })}
                  </div>
                  {selectedMood ? <p className="mt-3 text-sm leading-7 text-white/56">{copy.moodSaved}</p> : null}
                </div>
                <div className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4 text-center">
                  <p className="text-sm leading-6 text-white/68">{nextStepText}</p>
                  <a
                    href="/program/basic"
                    className="mt-3 inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/86 transition duration-300 hover:bg-white/[0.08]"
                  >
                    {nextStepCta}
                  </a>
                </div>
              </div>
            ) : null}
            <div className="flex flex-col gap-3">
              {!hasSelectedGate ? (
                <button
                  type="button"
                  onClick={handleStartPause}
                  className="inline-flex min-h-[60px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#f0ddb0_0%,#dcc086_52%,#caa160_100%)] px-7 py-4 text-sm font-semibold text-[#17202a] shadow-[0_18px_40px_rgba(212,186,117,0.24),inset_0_1px_0_rgba(255,255,255,0.3)] transition duration-300 hover:scale-[1.015] hover:brightness-[1.03] active:scale-[0.985]"
                >
                  {running ? copy.pause : copy.start}
                </button>
              ) : null}
              {!showGateTransition ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={resetMeditationExperience}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/82 transition duration-300 hover:bg-white/[0.06]"
                  >
                    {returnLabel}
                  </button>
                  <button
                    type="button"
                    onClick={handleSoundToggle}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/82 transition duration-300 hover:bg-white/[0.06]"
                    aria-pressed={soundEnabled}
                  >
                    {soundEnabled ? copy.soundOn : copy.soundOff}
                  </button>
                  <button
                    type="button"
                    onClick={handleEnterFullscreen}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/82 transition duration-300 hover:bg-white/[0.06]"
                  >
                    {copy.fullscreen}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <div className="order-1 flex justify-center lg:order-2">
            <div
              ref={(node) => {
                playerRef.current = node;
                resetContainerRef.current = node;
              }}
              className="zero-gate-reset-container relative min-h-[480px] w-full overflow-hidden rounded-[32px] border border-white/10 bg-[#08111b]"
            >
              {activeVideoSource && !videoFailed ? (
                <video
                  key={activeVideoSource}
                  ref={videoRef}
                  className={`absolute inset-0 z-[1] h-full w-full object-cover opacity-[0.68] blur-[1.5px] transition-opacity duration-700 ${sanctuaryVisual.videoClassName}`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={sanctuaryVisual.poster}
                  onLoadStart={() => setVideoLoading(true)}
                  onLoadedData={() => setVideoLoading(false)}
                  onCanPlay={handleVideoCanPlay}
                  onError={handleVideoError}
                >
                  <source src={activeVideoSource} type="video/mp4" />
                </video>
              ) : (
                <div
                  className="absolute inset-0 z-[1] bg-cover bg-center opacity-[0.42]"
                  style={{ backgroundImage: `url(${sanctuaryVisual.poster})` }}
                />
              )}
              <div className={`absolute inset-0 z-[2] ${sanctuaryVisual.glowClassName}`} />
              <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.05),transparent_20%),radial-gradient(circle_at_74%_32%,rgba(212,186,117,0.07),transparent_34%)] opacity-50 blur-2xl" />
              <div className={`absolute inset-0 z-[2] ${sanctuaryVisual.overlayClassName}`} />
              <div className="absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(3,9,16,0.06),rgba(3,9,16,0.18)_36%,rgba(3,9,16,0.34)_100%)] backdrop-blur-[0.5px]" />
              {videoLoading ? (
                <div className="absolute inset-0 z-[3] flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/12 bg-[#07111b]/62 backdrop-blur-md">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/22 border-t-white/90" />
                  </div>
                </div>
              ) : null}
              {videoFailed ? (
                <div className="absolute inset-x-5 top-5 z-[3] rounded-[20px] border border-white/10 bg-[#07111b]/72 px-4 py-3 text-sm leading-6 text-white/72 backdrop-blur-md">
                  {copy.audioError}
                </div>
              ) : null}
              {audioBlocked ? (
                <div className="absolute inset-x-5 bottom-5 z-[3]">
                  <button
                    type="button"
                    onClick={handleEnableAudio}
                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-gold/20 bg-gold/[0.16] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(0,0,0,0.18)] backdrop-blur-md transition hover:bg-gold/[0.22]"
                  >
                    {copy.retryAudio}
                  </button>
                </div>
              ) : null}
              {showGateTransition && transitionMeta ? (
                <div className="absolute inset-0 z-[4] flex items-center justify-center px-6">
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,9,16,0.22),rgba(4,9,16,0.36)_54%,rgba(4,9,16,0.48))]" />
                  <div
                    className={`relative flex flex-col items-center text-center ${
                      prefersReducedMotion ? "" : "transition-opacity duration-300 ease-out"
                    } ${showGateTransitionContent ? "opacity-100" : "opacity-0"}`}
                  >
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[1.5rem] shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                      <span aria-hidden="true">{transitionMeta.emoji}</span>
                    </div>
                    <p className="mt-5 text-[1.15rem] font-medium leading-8 text-white/92 sm:text-[1.3rem]">
                      {transitionMeta.title[language]}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white/62 sm:text-base">
                      {language === "jp"
                        ? "静かな60秒を始めます。"
                        : language === "kr"
                          ? "조용한 60초를 시작합니다."
                          : "Beginning a quiet 60 seconds."}
                    </p>
                  </div>
                </div>
              ) : null}
              {openingSequenceActive ? (
                <div className="absolute inset-0 z-[4] flex items-center justify-center px-6">
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,9,16,0.08),rgba(4,9,16,0.14)_42%,rgba(4,9,16,0.18))]" />
                  <div
                    className={`relative max-w-[23rem] text-center text-[1.05rem] font-medium leading-[2.1] text-white/92 [text-shadow:0_2px_16px_rgba(0,0,0,0.18)] sm:max-w-[31rem] sm:text-[1.22rem] sm:leading-[2.15] ${
                      prefersReducedMotion ? "" : "transition-opacity duration-[700ms] ease-out"
                    } ${showOpeningMessage ? "opacity-100" : "opacity-0"}`}
                  >
                    {openingMessage}
                  </div>
                </div>
              ) : null}
              <div className="relative z-[2] flex min-h-[480px] items-center justify-center px-4 py-8">
                {recoveryUiVisible ? (
                  <div className="relative flex flex-col items-center">
                    <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,rgba(212,186,117,0.1),transparent_66%)] blur-3xl" />
                    <div className="relative flex h-[288px] w-[288px] items-center justify-center sm:h-[328px] sm:w-[328px]">
                      <svg viewBox="0 0 240 240" className="absolute inset-0 h-full w-full -rotate-90">
                        <circle cx="120" cy="120" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                        <circle
                          cx="120"
                          cy="120"
                          r={ringRadius}
                          fill="none"
                          stroke="rgba(212,186,117,0.92)"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={ringCircumference}
                          strokeDashoffset={dashOffset}
                          className="transition-all duration-1000 ease-linear"
                        />
                      </svg>
                      <div className="absolute inset-[22%] rounded-full border border-white/7 bg-[#07111b]/10 shadow-[0_10px_28px_rgba(0,0,0,0.1)] backdrop-blur-sm" />
                      <div className="relative z-10 flex max-w-[62%] flex-col items-center text-center">
                        <p className="text-sm font-medium tracking-[0.08em] text-[rgba(244,248,252,0.88)] sm:text-base">
                          {centerFocusText}
                        </p>
                        <p className="mt-5 font-serif text-[4rem] leading-none text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.32)] sm:text-[4.7rem]">
                          {secondsLeft}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex w-full max-w-[320px] flex-col items-center">
                      <p className="text-center text-sm font-medium leading-6 tracking-[0.01em] text-gold/92 sm:text-[15px]">
                        {bottomBreathGuidance}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
