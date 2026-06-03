"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BreathingCircle } from "@/components/breathing-circle";
import { SectionHeading } from "@/components/section-heading";
import type { LandingCopy } from "@/lib/landing-copy";
import { handleMeditationComplete as playMeditationCompletion } from "@/lib/meditation-completion";
import { markDailyRhythmCompleted } from "@/lib/return-rhythm";

type Phase = "inhale" | "hold" | "exhale";

type InstantMeditationSectionProps = {
  copy: LandingCopy["instant"];
};

type SanctuaryGateKey = "overload" | "anxiety" | "low-energy" | "distracted" | "reset-mood" | "sleep";

const TOTAL_SECONDS = 60;
const INHALE_SECONDS = 4;
const HOLD_SECONDS = 2;
const EXHALE_SECONDS = 4;
const MEDITATION_MOOD_STORAGE_KEY = "meisoulife_instant_meditation_mood";
const ZERO_GATE_STORAGE_KEY = "meisoulife_zero_gate";
const DEFAULT_SANCTUARY: SanctuaryGateKey = "overload";

const sanctuaryVisuals: Record<
  SanctuaryGateKey,
  {
    source: string;
    poster: string;
    overlayClassName: string;
    glowClassName: string;
  }
> = {
  overload: {
    source: "/videos/one-minute-reset-forest.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(4,10,18,0.18),rgba(4,10,18,0.72)_72%,rgba(4,10,18,0.84))]",
    glowClassName: "bg-[radial-gradient(circle_at_78%_24%,rgba(125,151,130,0.16),transparent_42%)]"
  },
  anxiety: {
    source: "/videos/one-minute-reset-sky.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(5,10,18,0.22),rgba(5,10,18,0.74)_72%,rgba(5,10,18,0.86))]",
    glowClassName: "bg-[radial-gradient(circle_at_72%_22%,rgba(120,138,169,0.14),transparent_38%)]"
  },
  "low-energy": {
    source: "/videos/one-minute-reset-energy.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(6,10,16,0.18),rgba(6,10,16,0.68)_70%,rgba(6,10,16,0.82))]",
    glowClassName: "bg-[radial-gradient(circle_at_74%_26%,rgba(212,186,117,0.14),transparent_40%)]"
  },
  distracted: {
    source: "/videos/one-minute-reset-path.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(4,11,19,0.2),rgba(4,11,19,0.72)_70%,rgba(4,11,19,0.84))]",
    glowClassName: "bg-[radial-gradient(circle_at_80%_22%,rgba(105,145,169,0.14),transparent_42%)]"
  },
  "reset-mood": {
    source: "/videos/one-minute-reset-sea.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(6,11,18,0.16),rgba(6,11,18,0.68)_72%,rgba(6,11,18,0.82))]",
    glowClassName: "bg-[radial-gradient(circle_at_78%_20%,rgba(157,177,129,0.14),transparent_40%)]"
  },
  sleep: {
    source: "/videos/one-minute-reset-moon.mp4",
    poster: "/images/quiet-meditation.jpg",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(4,8,18,0.26),rgba(4,8,18,0.76)_72%,rgba(4,8,18,0.88))]",
    glowClassName: "bg-[radial-gradient(circle_at_78%_18%,rgba(138,152,196,0.16),transparent_40%)]"
  }
};

function isSanctuaryGateKey(value: string): value is SanctuaryGateKey {
  return value in sanctuaryVisuals;
}

function readStoredGate(): SanctuaryGateKey {
  if (typeof window === "undefined") {
    return DEFAULT_SANCTUARY;
  }

  try {
    const rawValue = window.localStorage.getItem(ZERO_GATE_STORAGE_KEY);

    if (!rawValue) {
      return DEFAULT_SANCTUARY;
    }

    const parsed = JSON.parse(rawValue) as { gateKey?: string };

    if (parsed.gateKey && isSanctuaryGateKey(parsed.gateKey)) {
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

export function InstantMeditationSection({ copy }: InstantMeditationSectionProps) {
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasUserGesture, setHasUserGesture] = useState(false);
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedGate, setSelectedGate] = useState<SanctuaryGateKey>(DEFAULT_SANCTUARY);
  const [hasSelectedGate, setHasSelectedGate] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
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
      audioContextRef.current?.close().catch(() => undefined);
      audioContextRef.current = null;
    };
  }, []);

  useEffect(() => {
    setSelectedGate(readStoredGate());
    setHasSelectedGate(false);
    setVideoLoading(false);
    setVideoFailed(false);

    function handleGateChange(event: Event) {
      const customEvent = event as CustomEvent<{ gateKey?: string }>;
      const nextGate = customEvent.detail?.gateKey;

      if (nextGate && isSanctuaryGateKey(nextGate)) {
        setSelectedGate(nextGate);
        setHasSelectedGate(true);
        setVideoLoading(true);
        setVideoFailed(false);
      }
    }

    window.addEventListener("meisoulife:zero-gate-change", handleGateChange as EventListener);

    return () => {
      window.removeEventListener("meisoulife:zero-gate-change", handleGateChange as EventListener);
    };
  }, []);

  const phaseLabel = copy[phase];
  const phaseBottom =
    phase === "inhale"
      ? `${copy.inhale} · 4s`
      : phase === "hold"
        ? `${copy.hold} · 2s`
        : `${copy.exhale} · 4s`;
  const sanctuaryVisual = sanctuaryVisuals[selectedGate];
  const activeVideoSource = hasSelectedGate ? sanctuaryVisual.source : null;

  async function syncVideoAudio(nextRunning: boolean, nextSoundEnabled: boolean) {
    const video = videoRef.current;

    if (!video) {
      return;
    }

     if (!activeVideoSource || videoFailed) {
      return;
    }

    if (!nextRunning) {
      video.muted = true;
      video.volume = 0;
      return;
    }

    video.volume = nextSoundEnabled ? 1 : 0;
    video.muted = !nextSoundEnabled;

    try {
      await video.play();
    } catch (error) {
      console.warn("Sanctuary video playback fell back to muted mode", error);
      video.muted = true;
      video.volume = 0;
    }
  }

  useEffect(() => {
    void syncVideoAudio(running, soundEnabled);
  }, [activeVideoSource, running, soundEnabled, videoFailed]);

  async function startMeditationExperience() {
    setHasUserGesture(true);
    setHasSelectedGate(true);
    setVideoLoading(true);
    setVideoFailed(false);

    if (secondsLeft === 0) {
      setSecondsLeft(TOTAL_SECONDS);
      completionHandledRef.current = false;
    }

    setRunning(true);
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
  }

  async function handleMeditationComplete() {
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

  function handleVideoError() {
    setVideoLoading(false);
    setVideoFailed(true);
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
              {activeVideoSource && !videoFailed ? (
                <video
                  key={activeVideoSource}
                  ref={videoRef}
                  className="absolute inset-0 z-0 h-full w-full object-cover opacity-[0.6] blur-[1.5px] transition-opacity duration-700"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={sanctuaryVisual.poster}
                  onLoadStart={() => setVideoLoading(true)}
                  onLoadedData={() => setVideoLoading(false)}
                  onCanPlay={() => setVideoLoading(false)}
                  onError={handleVideoError}
                >
                  <source src={activeVideoSource} type="video/mp4" />
                </video>
              ) : (
                <div
                  className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.42]"
                  style={{ backgroundImage: `url(${sanctuaryVisual.poster})` }}
                />
              )}
              <div className={`absolute inset-0 z-10 ${sanctuaryVisual.glowClassName}`} />
              <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.06),transparent_20%),radial-gradient(circle_at_74%_32%,rgba(212,186,117,0.08),transparent_34%)] opacity-60 blur-2xl" />
              <div className={`absolute inset-0 z-10 ${sanctuaryVisual.overlayClassName}`} />
              <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(3,9,16,0.08),rgba(3,9,16,0.22)_36%,rgba(3,9,16,0.44)_100%)] backdrop-blur-[1px]" />
              {videoLoading ? (
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/12 bg-[#07111b]/62 backdrop-blur-md">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/22 border-t-white/90" />
                  </div>
                </div>
              ) : null}
              {videoFailed ? (
                <div className="absolute inset-x-5 top-5 z-20 rounded-[20px] border border-white/10 bg-[#07111b]/72 px-4 py-3 text-sm leading-6 text-white/72 backdrop-blur-md">
                  {copy.audioError}
                </div>
              ) : null}
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
