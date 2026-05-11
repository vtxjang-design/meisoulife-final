"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSiteCopy } from "@/lib/i18n";
import { getNatureSoundPreference, setNatureSoundPreference, startAmbientNatureAudio, stopAmbientNatureAudio } from "@/lib/meditation-ambient-audio";
import { handleMeditationComplete as triggerMeditationCompletion, supportsMeditationVibration } from "@/lib/meditation-completion";

const CYCLE_SECONDS = 10;
const INHALE_SECONDS = 4;
const HOLD_SECONDS = 2;
const AI_COACH_URL =
  process.env.NEXT_PUBLIC_AI_COACH_URL ||
  "https://chatgpt.com/g/g-69f968bc9a408191a3e5f943912666c0-quiet-rhythm-guide";

type BreathPhase = "inhale" | "hold" | "exhale";
type MeditationType = "default" | "morning" | "day" | "night";

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

export default function MeditationPage() {
  const copy = useSiteCopy().meditationPage;
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [meditationType, setMeditationType] = useState<MeditationType>("default");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [vibrationSupported, setVibrationSupported] = useState(false);
  const [hasUserGesture, setHasUserGesture] = useState(false);
  const [ambientVideoFailed, setAmbientVideoFailed] = useState(false);
  const [showAmbientRetry, setShowAmbientRetry] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const completionHandledRef = useRef(false);
  const elapsedTotalSeconds = totalSeconds - secondsLeft;
  const phase = useMemo(() => getBreathPhase(elapsedTotalSeconds), [elapsedTotalSeconds]);
  const isComplete = secondsLeft <= 0;
  const content = copy.variants[meditationType];
  const durationVariant = getDurationVariant(totalSeconds);
  const durationTextSet = copy.durationTexts?.[durationVariant];
  const topText =
    meditationType === "morning" || meditationType === "night" ? content.topText : durationTextSet?.topText || content.topText;
  const completionTitle =
    meditationType === "morning" || meditationType === "night"
      ? content.completionTitle
      : durationTextSet?.completionTitle || content.completionTitle;
  const circleScaleClass =
    phase === "inhale" ? "scale-110" : phase === "hold" ? "scale-110" : "scale-90";

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const nextDuration = normalizeDuration(searchParams.get("duration"));
    const nextType = normalizeMeditationType(searchParams.get("type"));

    setTotalSeconds(nextDuration);
    setSecondsLeft(nextDuration);
    setMeditationType(nextType);
    setSoundEnabled(getNatureSoundPreference());
    setAmbientVideoFailed(false);
    setShowAmbientRetry(false);
    completionHandledRef.current = false;
  }, []);

  useEffect(() => {
    setVibrationSupported(supportsMeditationVibration());

    const markGesture = () => {
      setHasUserGesture(true);

      if (!isComplete && soundEnabled) {
        startAmbientNatureAudio(ambientAudioRef, soundEnabled).then((result) => {
          setShowAmbientRetry(!result.started);
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
  }, [isComplete, soundEnabled]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [secondsLeft]);

  useEffect(() => {
    if (isComplete || !soundEnabled || !hasUserGesture) {
      stopAmbientNatureAudio(ambientAudioRef);
      return;
    }

    startAmbientNatureAudio(ambientAudioRef, soundEnabled).then((result) => {
      setShowAmbientRetry(!result.started);
    });

    return () => {
      if (isComplete) {
        stopAmbientNatureAudio(ambientAudioRef);
      }
    };
  }, [hasUserGesture, isComplete, soundEnabled]);

  useEffect(() => {
    if (!isComplete || completionHandledRef.current) {
      return;
    }

    completionHandledRef.current = true;
    runMeditationComplete();
  }, [isComplete, hasUserGesture, soundEnabled, vibrationEnabled]);

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
    setNatureSoundPreference(next);
    setSoundEnabled(next);

    if (next) {
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(216,191,131,0.12),transparent_20%),linear-gradient(180deg,#07111f_0%,#0d1b2d_45%,#10273a_100%)] px-6 py-10 text-white">
      <div className="relative flex min-h-[480px] w-full max-w-3xl flex-col items-center overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] px-6 py-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:px-8 sm:py-10">
        {!ambientVideoFailed ? (
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
        <div className="absolute inset-0 z-10 bg-black/25" />

        <div className="relative z-20 flex w-full flex-col items-center text-center">
        {!isComplete ? (
          <>
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.32em] text-gold/80">{topText}</p>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-white/60 sm:text-base">{content.intro}</p>
            </div>

            <div className="mt-12 flex min-h-[320px] w-full flex-col items-center justify-center">
              <div className="mb-6 flex items-center gap-2">
                {vibrationSupported ? (
                  <button
                    type="button"
                    onClick={handleVibrationToggle}
                    className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                    aria-pressed={vibrationEnabled}
                  >
                    {vibrationEnabled ? copy.vibrationOn : copy.vibrationOff}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleSoundToggle}
                  className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                  aria-pressed={soundEnabled}
                >
                  {soundEnabled ? `🔊 ${copy.soundOn}` : `🔊 ${copy.soundOff}`}
                </button>
                {showAmbientRetry && soundEnabled ? (
                  <button
                    type="button"
                    onClick={handleAmbientRetry}
                    className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    自然音を再生
                  </button>
                ) : null}
              </div>
              <p className="text-2xl font-medium text-white/72 transition-all duration-700 ease-in-out sm:text-3xl">
                {copy.phases[phase]}
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
            </div>

            <div className="mt-8">
              <p className="text-sm font-medium tracking-[0.18em] text-white/68 sm:text-base">{copy.bottomText[phase]}</p>
            </div>
          </>
        ) : (
          <div className="animate-fade-in space-y-8">
            <h1 className="font-serif text-4xl text-white sm:text-5xl">{completionTitle}</h1>
            <p className="mx-auto max-w-xl whitespace-pre-line text-base leading-8 text-white/72">{copy.completionMessage}</p>
            <p className="text-sm leading-7 text-white/54">{copy.completionReturnText}</p>
            <p className="mx-auto max-w-2xl text-base leading-8 text-white/68">{copy.completionBody}</p>
            <div className="flex flex-col items-center gap-3">
              <Link
                href="/challenge"
                className="inline-flex min-h-[56px] min-w-[240px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
              >
                {copy.completionPrimary}
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-[52px] min-w-[240px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
              >
                {copy.completionSecondary}
              </Link>
            </div>
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
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
