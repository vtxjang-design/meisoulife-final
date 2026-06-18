"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getNatureSoundPreference, setNatureSoundPreference, startAmbientNatureAudio, stopAmbientNatureAudio } from "@/lib/meditation-ambient-audio";
import { handleMeditationComplete as triggerMeditationCompletion, supportsMeditationVibration } from "@/lib/meditation-completion";
import { markDailyRhythmCompleted } from "@/lib/return-rhythm";
import { useSiteCopy } from "@/lib/i18n";

const TOTAL_SECONDS = 60;
const INHALE_SECONDS = 4;
const HOLD_SECONDS = 2;
const EXHALE_SECONDS = 4;
const BREATH_CYCLE_SECONDS = INHALE_SECONDS + HOLD_SECONDS + EXHALE_SECONDS;
const AI_COACH_URL =
  process.env.NEXT_PUBLIC_AI_COACH_URL ||
  "https://chatgpt.com/g/g-69f968bc9a408191a3e5f943912666c0-quiet-rhythm-guide";

type BreathPhase = "inhale" | "hold" | "exhale";

type OneMinuteMeditationProps = {
  open: boolean;
  onClose: () => void;
};

function getPhase(elapsedSeconds: number): BreathPhase {
  const cyclePosition = elapsedSeconds % BREATH_CYCLE_SECONDS;

  if (cyclePosition < INHALE_SECONDS) {
    return "inhale";
  }

  if (cyclePosition < INHALE_SECONDS + HOLD_SECONDS) {
    return "hold";
  }

  return "exhale";
}

function getPhaseDuration(phase: BreathPhase) {
  if (phase === "inhale") {
    return INHALE_SECONDS;
  }

  if (phase === "hold") {
    return HOLD_SECONDS;
  }

  return EXHALE_SECONDS;
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function getDurationVariant(totalSeconds: number) {
  return totalSeconds >= 180 ? "threeMinutes" : "sixty";
}

export default function OneMinuteMeditation({ open, onClose }: OneMinuteMeditationProps) {
  const copy = useSiteCopy();
  const modalCopy = copy.modal;
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [vibrationSupported, setVibrationSupported] = useState(false);
  const [completionIndex, setCompletionIndex] = useState(0);
  const [hasUserGesture, setHasUserGesture] = useState(false);
  const [ambientVideoFailed, setAmbientVideoFailed] = useState(false);
  const [showAmbientRetry, setShowAmbientRetry] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const completionHandledRef = useRef(false);
  const previousPhaseRef = useRef<BreathPhase>("inhale");

  const elapsedSeconds = TOTAL_SECONDS - secondsLeft;
  const phase = useMemo(() => getPhase(elapsedSeconds), [elapsedSeconds]);
  const isComplete = secondsLeft <= 0;
  const durationVariant = getDurationVariant(TOTAL_SECONDS);
  const durationTextSet = modalCopy.durationTexts?.[durationVariant];
  const completionMoments = durationTextSet?.completionMoments || modalCopy.completionMoments;
  const completionMessage = completionMoments[completionIndex] || durationTextSet?.completionBody || modalCopy.completeBody;

  useEffect(() => {
    if (!open) {
      setSecondsLeft(TOTAL_SECONDS);
      setSoundEnabled(getNatureSoundPreference());
      setCompletionIndex(0);
      setHasUserGesture(false);
      setVibrationEnabled(true);
      completionHandledRef.current = false;
      previousPhaseRef.current = "inhale";
      setAmbientVideoFailed(false);
      setShowAmbientRetry(false);
      stopAmbientNatureAudio(ambientAudioRef);
      return;
    }

    setSecondsLeft(TOTAL_SECONDS);
    setHasUserGesture(true);
    setSoundEnabled(getNatureSoundPreference());
    setVibrationEnabled(true);
    setCompletionIndex(Math.floor(Math.random() * completionMoments.length));
    completionHandledRef.current = false;
    previousPhaseRef.current = "inhale";
    setAmbientVideoFailed(false);
    setShowAmbientRetry(false);
  }, [completionMoments.length, open]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setVibrationSupported(supportsMeditationVibration());

    return () => {
    };
  }, []);

  useEffect(() => {
    if (!open || isComplete) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isComplete, open, secondsLeft]);

  useEffect(() => {
    if (!open || isComplete || !soundEnabled || !hasUserGesture) {
      stopAmbientNatureAudio(ambientAudioRef);
      return;
    }

    startAmbientNatureAudio(ambientAudioRef, soundEnabled).then((result) => {
      setShowAmbientRetry(!result.started);
    });

    return () => {
      if (!open || isComplete) {
        stopAmbientNatureAudio(ambientAudioRef);
      }
    };
  }, [hasUserGesture, isComplete, open, soundEnabled]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const phaseChanged = previousPhaseRef.current !== phase;

    if (phaseChanged && hasUserGesture) {
      if (phase === "inhale") {
        triggerHaptic([12]);
        playPhaseCue("inhale");
      } else if (phase === "exhale") {
        triggerHaptic([8]);
        playPhaseCue("exhale");
      } else {
        triggerHaptic([5]);
      }
    }

    previousPhaseRef.current = phase;
  }, [hasUserGesture, open, phase, soundEnabled]);

  useEffect(() => {
    if (!open || !isComplete || completionHandledRef.current) {
      return;
    }

    completionHandledRef.current = true;
    runMeditationComplete();
  }, [isComplete, open, soundEnabled, vibrationEnabled, hasUserGesture]);

  useEffect(() => {
    return () => {
      stopAmbientNatureAudio(ambientAudioRef);
      audioContextRef.current?.close().catch(() => undefined);
      audioContextRef.current = null;
    };
  }, []);

  function getAudioContext() {
    if (typeof window === "undefined" || !("AudioContext" in window || "webkitAudioContext" in window)) {
      return null;
    }

    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtor) {
      return null;
    }

    audioContextRef.current = new AudioCtor();
    return audioContextRef.current;
  }

  function playTone(frequency: number, durationMs: number, volume: number) {
    if (!soundEnabled || !hasUserGesture) {
      return;
    }

    const context = getAudioContext();

    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const startAt = context.currentTime;
    const endAt = startAt + durationMs / 1000;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(volume, startAt + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(startAt);
    oscillator.stop(endAt);
  }

  function playPhaseCue(nextPhase: BreathPhase) {
    // TODO: Replace with a more natural ambient cue if a dedicated audio asset is added later.
    if (nextPhase === "inhale") {
      playTone(246.94, 220, 0.015);
      return;
    }

    if (nextPhase === "exhale") {
      playTone(196, 280, 0.012);
    }
  }

  function triggerHaptic(pattern: number | number[]) {
    if (!hasUserGesture || typeof navigator === "undefined" || !("vibrate" in navigator)) {
      return;
    }

    navigator.vibrate(pattern);
  }

  function handleClose() {
    stopAmbientNatureAudio(ambientAudioRef);
    onClose();
  }

  async function handleRestart() {
    setHasUserGesture(true);
    setSecondsLeft(TOTAL_SECONDS);
    setCompletionIndex(Math.floor(Math.random() * completionMoments.length));
    completionHandledRef.current = false;
    previousPhaseRef.current = "inhale";
    triggerHaptic([10]);
    if (soundEnabled) {
      const result = await startAmbientNatureAudio(ambientAudioRef, soundEnabled);
      setShowAmbientRetry(!result.started);
    }
  }

  async function handleSoundToggle() {
    setHasUserGesture(true);
    const next = !soundEnabled;
    setNatureSoundPreference(next);
    setSoundEnabled(next);

    if (next) {
      playTone(329.63, 180, 0.012);
      const result = await startAmbientNatureAudio(ambientAudioRef, true);
      setShowAmbientRetry(!result.started);
    } else {
      setShowAmbientRetry(false);
      stopAmbientNatureAudio(ambientAudioRef);
    }
  }

  function handleVibrationToggle() {
    setHasUserGesture(true);
    setVibrationEnabled((current) => !current);
  }

  async function handleAmbientRetry() {
    setHasUserGesture(true);
    const result = await startAmbientNatureAudio(ambientAudioRef, soundEnabled);
    setShowAmbientRetry(!result.started);
  }

  async function runMeditationComplete() {
    markDailyRhythmCompleted();
    await stopAmbientNatureAudio(ambientAudioRef);

    await triggerMeditationCompletion({
      hasUserGesture,
      soundEnabled,
      vibrationEnabled,
      audioContextRef,
      playSoundOnComplete: false
    });
  }

  if (!open) {
    return null;
  }

  const orbScale = phase === "inhale" ? 1.08 : phase === "hold" ? 1.08 : 0.92;
  const orbGlowOpacity = phase === "inhale" ? 0.38 : phase === "hold" ? 0.32 : 0.26;
  const orbWarmthOpacity = phase === "exhale" ? 0.26 : 0.16;
  const progress = ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100;
  const orbTransitionDuration = `${getPhaseDuration(phase)}s`;
  const ringSize = 300;
  const ringStroke = 10;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progress / 100) * ringCircumference;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#020814]/92 px-4 py-4 backdrop-blur-xl sm:px-6"
      onPointerDownCapture={() => {
        if (!showAmbientRetry || !soundEnabled || isComplete) {
          return;
        }

        startAmbientNatureAudio(ambientAudioRef, soundEnabled).then((result) => {
          setShowAmbientRetry(!result.started);
        });
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.018),transparent_40%),linear-gradient(180deg,rgba(2,8,20,0.58)_0%,rgba(2,8,20,0.72)_44%,rgba(2,8,20,0.9)_100%)]" />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(216,191,131,0.07),transparent_20%),radial-gradient(circle_at_bottom,rgba(79,122,101,0.08),transparent_24%)]" />
        <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(2,8,20,0.26)_0%,transparent_16%,transparent_84%,rgba(2,8,20,0.28)_100%)]" />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(186,205,255,0.08),transparent_18%),radial-gradient(circle_at_bottom,rgba(79,122,101,0.12),transparent_30%),linear-gradient(180deg,rgba(4,10,19,0.8)_0%,rgba(7,16,29,0.9)_100%)] animate-meditation-ambient-breathe" />
        <div className="absolute left-1/2 top-[12%] z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl animate-meditation-fog" />
        <div className="absolute bottom-[8%] right-[14%] z-10 h-48 w-48 rounded-full bg-moss/12 blur-3xl animate-meditation-fog" />
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className="absolute z-10 rounded-full bg-white/18 animate-meditation-float"
            style={{
              left: `${10 + index * 9}%`,
              top: `${18 + (index % 4) * 15}%`,
              width: `${index % 3 === 0 ? 6 : 4}px`,
              height: `${index % 3 === 0 ? 6 : 4}px`,
              animationDelay: `${index * 0.8}s`,
              animationDuration: `${12 + (index % 4) * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-20 min-h-[480px] w-full max-w-md overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.04] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:p-6">
        {!ambientVideoFailed ? (
          <video
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-[0.78] brightness-[0.7] contrast-[0.95] saturate-[0.92]"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/quiet-meditation.jpg"
            onLoadedData={() => console.log("Meditation video loaded")}
            onError={() => {
              console.warn("Ambient meditation video failed to load");
              setAmbientVideoFailed(true);
            }}
          >
            <source src="/videos/one-minute-nature-loop.mp4" type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(216,191,131,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(79,122,101,0.14),transparent_34%),linear-gradient(180deg,rgba(4,10,19,0.76)_0%,rgba(8,18,32,0.88)_100%)]" />
        )}
        <div className="absolute inset-0 z-10 bg-black/38" />
        {ambientVideoFailed ? (
          <div className="absolute left-4 right-4 top-4 z-10 rounded-2xl border border-white/10 bg-[#08121d]/65 px-4 py-3 text-xs leading-6 text-white/60 backdrop-blur">
            Ambient video fallback active. Place the video file at /public/videos/one-minute-nature-loop.mp4.
          </div>
        ) : null}

        <div className="relative z-20">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.32em] text-gold/72">{modalCopy.eyebrow}</p>
              <h2 className="mt-3 text-balance font-serif text-2xl leading-tight text-white/92 sm:text-[30px]">{durationTextSet?.title || modalCopy.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/60">{modalCopy.natureMicrocopy}</p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Close meditation"
            >
              ×
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold/70 via-white/75 to-moss/70 transition-[width] duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              {vibrationSupported ? (
                <button
                  type="button"
                  onClick={handleVibrationToggle}
                  className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                  aria-pressed={vibrationEnabled}
                >
                  {vibrationEnabled ? modalCopy.vibrationOn : modalCopy.vibrationOff}
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleSoundToggle}
                className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                aria-pressed={soundEnabled}
              >
                {soundEnabled ? `🔊 ${modalCopy.soundOn}` : `🔊 ${modalCopy.soundOff}`}
              </button>
              {showAmbientRetry && soundEnabled ? (
                <button
                  type="button"
                  onClick={handleAmbientRetry}
                  className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                >
                  {modalCopy.natureLabel}
                </button>
              ) : null}
            </div>
          </div>

          {!isComplete ? (
            <div className="mt-8 flex flex-col items-center text-center">
              <div className="relative mt-2 flex h-[320px] w-[320px] items-center justify-center sm:h-[360px] sm:w-[360px]">
                <div
                  className="absolute inset-0 rounded-full bg-gold/18 blur-3xl transition-all ease-in-out"
                  style={{ opacity: orbGlowOpacity, transform: `scale(${orbScale + 0.1})`, transitionDuration: orbTransitionDuration }}
                />
                <div
                  className="absolute inset-4 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.22),transparent_34%),radial-gradient(circle_at_70%_72%,rgba(216,191,131,0.16),transparent_42%),radial-gradient(circle_at_50%_50%,rgba(239,243,244,0.08),rgba(15,31,53,0.02))] blur-2xl transition-all ease-in-out"
                  style={{ transform: `scale(${orbScale + 0.06})`, transitionDuration: orbTransitionDuration }}
                />
                <div
                  className={`absolute inset-[18%] rounded-full border border-white/12 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),rgba(255,255,255,0.03)_42%,rgba(15,31,53,0.18)_100%)] shadow-[0_18px_80px_rgba(216,191,131,0.08)] transition-all ease-in-out ${phase === "hold" ? "animate-meditation-soft-pulse" : ""}`}
                  style={{
                    transform: `scale(${orbScale})`,
                    transitionDuration: orbTransitionDuration,
                    boxShadow: `0 0 90px rgba(216, 191, 131, ${orbGlowOpacity}), inset 0 0 48px rgba(255, 255, 255, ${orbWarmthOpacity})`
                  }}
                />
                <div
                  className="absolute inset-[24%] rounded-full border border-white/8 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_68%_72%,rgba(216,191,131,0.18),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(7,17,31,0.2))] transition-all ease-in-out"
                  style={{ transform: `scale(${orbScale - 0.04})`, transitionDuration: orbTransitionDuration }}
                />
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox={`0 0 ${ringSize} ${ringSize}`} aria-hidden="true">
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={ringRadius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={ringStroke}
                  />
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={ringRadius}
                    fill="none"
                    stroke="rgba(227,206,151,0.94)"
                    strokeLinecap="round"
                    strokeWidth={ringStroke}
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute left-1/2 top-1/2 flex w-[62%] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-[28px] border border-white/10 bg-[#06111b]/48 px-5 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/90">{modalCopy.eyebrow}</p>
                  <p
                    aria-live="polite"
                    className="mt-3 text-[2.7rem] font-medium tracking-[0.06em] text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)] transition-all duration-700 ease-in-out sm:text-[3.2rem]"
                  >
                    {formatSeconds(secondsLeft)}
                  </p>
                  <p className="mt-3 text-sm uppercase tracking-[0.26em] text-white/68">{modalCopy.phaseLabels[phase]}</p>
                  <p className="mt-4 text-sm font-medium leading-6 text-white/92">
                    {modalCopy.breathingGuides[phase === "inhale" ? 0 : phase === "hold" ? 1 : 2]?.text}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/[0.07]"
              >
                {modalCopy.endButton}
              </button>
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center text-center animate-meditation-fade-up">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gold/20 blur-2xl animate-meditation-soft-pulse" />
                <div className="absolute inset-3 rounded-full border border-gold/30 bg-white/[0.06]" />
              </div>

              <h3 className="mt-5 text-balance font-serif text-3xl leading-tight text-white/92 sm:text-[34px]">{completionMessage}</h3>
              <p className="mt-4 max-w-sm whitespace-pre-line text-sm leading-7 text-white/72 sm:text-base">{modalCopy.completionMessage}</p>
              <p className="mt-3 text-sm leading-7 text-white/54">{modalCopy.completionReturnText}</p>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/62 sm:text-base">{durationTextSet?.completionBody || modalCopy.completeBody}</p>

              <div className="mt-8 flex w-full flex-col gap-3">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:scale-[1.01] hover:bg-[#e7cd92]"
                >
                  {modalCopy.breatheAgain}
                </button>

                <a
                  href={AI_COACH_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/84 transition hover:bg-white/[0.07]"
                >
                  {modalCopy.tellAi}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
