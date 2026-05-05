"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSiteCopy } from "@/lib/i18n";

const TOTAL_SECONDS = 60;
const CYCLE_SECONDS = 10;
const INHALE_SECONDS = 4;
const HOLD_SECONDS = 2;
const AI_COACH_URL =
  process.env.NEXT_PUBLIC_AI_COACH_URL ||
  "https://chatgpt.com/g/g-69f968bc9a408191a3e5f943912666c0-quiet-rhythm-guide";

type BreathPhase = "inhale" | "hold" | "exhale";

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

export default function MeditationPage() {
  const copy = useSiteCopy().meditationPage;
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [returnTo, setReturnTo] = useState("/challenge");

  useEffect(() => {
    setSecondsLeft(TOTAL_SECONDS);

    const searchParams = new URLSearchParams(window.location.search);
    const nextPath = searchParams.get("returnTo");

    if (nextPath) {
      setReturnTo(nextPath);
    }
  }, []);

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

  const elapsedSeconds = TOTAL_SECONDS - secondsLeft;
  const phase = useMemo(() => getBreathPhase(elapsedSeconds), [elapsedSeconds]);
  const isComplete = secondsLeft <= 0;

  const circleScaleClass =
    phase === "inhale" ? "scale-110" : phase === "hold" ? "scale-110" : "scale-90";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(216,191,131,0.12),transparent_20%),linear-gradient(180deg,#07111f_0%,#0d1b2d_45%,#10273a_100%)] px-6 py-10 text-white">
      <div className="flex w-full max-w-3xl flex-col items-center text-center">
        {!isComplete ? (
          <>
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.32em] text-gold/80">{copy.topText}</p>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-white/60 sm:text-base">{copy.intro}</p>
            </div>

            <div className="mt-12 flex min-h-[320px] w-full flex-col items-center justify-center">
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
                  <p className="text-5xl font-serif text-white/88 sm:text-6xl">{secondsLeft}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-medium tracking-[0.18em] text-white/68 sm:text-base">{copy.bottomText[phase]}</p>
            </div>
          </>
        ) : (
          <div className="animate-fade-in space-y-8">
            <h1 className="font-serif text-4xl text-white sm:text-5xl">{copy.completionTitle}</h1>
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
    </main>
  );
}
