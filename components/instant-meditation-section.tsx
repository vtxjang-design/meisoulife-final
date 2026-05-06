"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BreathingCircle } from "@/components/breathing-circle";
import { SectionHeading } from "@/components/section-heading";
import type { LandingCopy } from "@/lib/landing-copy";
import { markDailyRhythmCompleted } from "@/lib/return-rhythm";

type Phase = "inhale" | "hold" | "exhale";

type InstantMeditationSectionProps = {
  copy: LandingCopy["instant"];
};

const TOTAL_SECONDS = 60;
const INHALE_SECONDS = 4;
const HOLD_SECONDS = 2;
const EXHALE_SECONDS = 4;

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

  const phaseLabel = copy[phase];
  const phaseBottom =
    phase === "inhale"
      ? `${copy.inhale} · 4s`
      : phase === "hold"
        ? `${copy.hold} · 2s`
        : `${copy.exhale} · 4s`;

  function handleStartPause() {
    if (secondsLeft === 0) {
      setSecondsLeft(TOTAL_SECONDS);
      setRunning(true);
      return;
    }

    setRunning((current) => !current);
  }

  return (
    <section id="one-minute-experience" className="section-shell mt-16">
      <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-8 shadow-[0_24px_80px_rgba(7,17,31,0.24)] sm:px-8 sm:py-10">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} align="center" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="order-2 space-y-5 lg:order-1">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm leading-7 text-white/68">{copy.sensory}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleStartPause}
                className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
              >
                {running ? copy.pause : copy.start}
              </button>
              <Link
                href="/meditation"
                className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
              >
                {copy.fullscreen}
              </Link>
            </div>
          </div>
          <div className="order-1 flex justify-center lg:order-2">
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
    </section>
  );
}
