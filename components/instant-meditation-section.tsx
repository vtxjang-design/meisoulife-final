"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BreathingCircle } from "@/components/breathing-circle";
import { SectionHeading } from "@/components/section-heading";
import type { LandingCopy } from "@/lib/landing-copy";
import { startAmbientNatureAudio, stopAmbientNatureAudio } from "@/lib/meditation-ambient-audio";
import { handleMeditationComplete as playMeditationCompletion } from "@/lib/meditation-completion";
import { markDailyRhythmCompleted } from "@/lib/return-rhythm";

type Phase = "inhale" | "hold" | "exhale";

type InstantMeditationSectionProps = {
  copy: LandingCopy["instant"];
};

const TOTAL_SECONDS = 60;
const INHALE_SECONDS = 4;
const HOLD_SECONDS = 2;
const EXHALE_SECONDS = 4;
const MEDITATION_MOOD_STORAGE_KEY = "meisoulife_instant_meditation_mood";

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

export function InstantMeditationSection({ copy }: InstantMeditationSectionProps) {
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioError, setAudioError] = useState("");
  const [hasUserGesture, setHasUserGesture] = useState(false);
  const [selectedMood, setSelectedMood] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const completionHandledRef = useRef(false);

  useEffect(() => {
    if (!running || secondsLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [running, secondsLeft]);

  const elapsedSeconds = TOTAL_SECONDS - secondsLeft;
  const phase = useMemo(() => getPhase(elapsedSeconds), [elapsedSeconds]);
  const progress = elapsedSeconds / TOTAL_SECONDS;

  useEffect(() => {
    if (!running) {
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate(phase === "hold" ? 40 : 18);
    }
  }, [phase, running]);

  useEffect(() => {
    if (secondsLeft === 0) {
      setRunning(false);
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
    return () => {
      videoRef.current?.pause();
      stopAmbientNatureAudio(ambientAudioRef);
      audioContextRef.current?.close().catch(() => undefined);
      audioContextRef.current = null;
    };
  }, []);

  const phaseLabel = copy[phase];
  const phaseBottom =
    phase === "inhale"
      ? `${copy.inhale} · 4s`
      : phase === "hold"
        ? `${copy.hold} · 2s`
        : `${copy.exhale} · 4s`;

  async function startMeditationExperience() {
    setHasUserGesture(true);
    setAudioError("");

    if (secondsLeft === 0) {
      setSecondsLeft(TOTAL_SECONDS);
      completionHandledRef.current = false;
    }

    try {
      await videoRef.current?.play();
    } catch (error) {
      console.warn("Meditation video failed to play", error);
    }

    if (soundEnabled) {
      const result = await startAmbientNatureAudio(ambientAudioRef, true);

      if (!result.started) {
        setAudioError(copy.audioError);
      }
    }

    setRunning(true);
  }

  async function handleStartPause() {
    if (running) {
      setRunning(false);
      videoRef.current?.pause();
      await stopAmbientNatureAudio(ambientAudioRef);
      return;
    }

    await startMeditationExperience();
  }

  async function handleSoundToggle() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setHasUserGesture(true);
    setAudioError("");

    if (!next) {
      await stopAmbientNatureAudio(ambientAudioRef);
      return;
    }

    if (running) {
      const result = await startAmbientNatureAudio(ambientAudioRef, true);

      if (!result.started) {
        setAudioError(copy.audioError);
      }
    }
  }

  async function handleRetryAudio() {
    setHasUserGesture(true);
    setAudioError("");
    const result = await startAmbientNatureAudio(ambientAudioRef, soundEnabled);

    if (!result.started) {
      setAudioError(copy.audioError);
    }
  }

  async function handleMeditationComplete() {
    videoRef.current?.pause();
    await stopAmbientNatureAudio(ambientAudioRef);
    await playMeditationCompletion({
      hasUserGesture,
      soundEnabled,
      vibrationEnabled: true,
      audioContextRef
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

  return (
    <section id="one-minute-experience" className="section-shell mt-16">
      <div id="one-minute-meditation" />
      <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-8 shadow-[0_24px_80px_rgba(7,17,31,0.24)] sm:px-8 sm:py-10">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} align="center" />
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {[copy.inhale, copy.hold, copy.exhale].map((item) => (
            <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[13px] text-white/56">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {copy.stages.map((item) => (
            <span key={item} className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs tracking-[0.08em] text-white/46">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="order-2 space-y-4.5 lg:order-1">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm leading-[1.8] text-white/66">{copy.sensory}</p>
            </div>
            {secondsLeft === 0 ? (
              <div className="rounded-[24px] border border-gold/18 bg-gold/[0.06] p-5">
                <p className="text-sm leading-[1.8] text-white/82">{copy.completionMessage}</p>
                <div className="mt-5">
                  <p className="text-sm font-medium text-white/78">{copy.moodQuestion}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {copy.moods.map((mood) => {
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
              </div>
            ) : null}
            {audioError ? (
              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-sm leading-7 text-white/62">{audioError}</p>
                <button
                  type="button"
                  onClick={handleRetryAudio}
                  className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.06] hover:text-white"
                >
                  {copy.retryAudio}
                </button>
              </div>
            ) : null}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleStartPause}
                className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
              >
                {running ? copy.pause : copy.start}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSoundToggle}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/82 transition duration-300 hover:bg-white/[0.06]"
                  aria-pressed={soundEnabled}
                >
                  {soundEnabled ? copy.soundOn : copy.soundOff}
                </button>
                <Link
                  href="/meditation"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/82 transition duration-300 hover:bg-white/[0.06]"
                >
                  {copy.fullscreen}
                </Link>
              </div>
            </div>
          </div>
          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative min-h-[480px] w-full overflow-hidden rounded-[32px] border border-white/10 bg-[#08111b]">
              <video
                ref={videoRef}
                className="absolute inset-0 z-0 h-full w-full object-cover opacity-80"
                muted
                loop
                playsInline
                preload="metadata"
                poster="/images/quiet-meditation.jpg"
              >
                <source src="/videos/one-minute-nature-loop.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 z-10 bg-black/25" />
              <div className="relative z-20 flex min-h-[480px] items-center justify-center px-4 py-8">
                <BreathingCircle
                  progress={progress}
                  secondsLeft={secondsLeft}
                  phaseLabel={phaseLabel}
                  bottomLabel={phaseBottom}
                  running={running}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
