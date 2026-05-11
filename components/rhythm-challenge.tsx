"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckoutButton } from "@/components/checkout-button";
import { RhythmDayCard } from "@/components/rhythm-day-card";
import { SectionHeading } from "@/components/section-heading";
import type { LandingCopy } from "@/lib/landing-copy";
import {
  completeRhythmChallengeDay,
  syncRhythmChallengeState,
  type RhythmChallengeState
} from "@/lib/rhythm-challenge";

type RhythmChallengeProps = {
  copy: LandingCopy["rhythmChallenge"];
};

function scrollToTarget(selector: string) {
  if (typeof window === "undefined") {
    return;
  }

  const element = document.querySelector(selector);
  element?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function RhythmChallenge({ copy }: RhythmChallengeProps) {
  const [progress, setProgress] = useState<RhythmChallengeState>({
    currentDay: 1,
    completedDays: [],
    lastCompletedDate: null
  });
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    const next = syncRhythmChallengeState();
    setProgress(next);
    setSelectedDay(next.currentDay);
  }, []);

  const currentStep = useMemo(
    () => copy.steps.find((step) => step.day === selectedDay) ?? copy.steps[0],
    [copy.steps, selectedDay]
  );

  if (!currentStep) {
    return null;
  }

  const isFinished = progress.completedDays.includes(7);

  function getStatus(day: number) {
    if (progress.completedDays.includes(day)) {
      return copy.completedLabel;
    }

    if (day === progress.currentDay) {
      return copy.todayLabel;
    }

    return copy.lockedLabel;
  }

  function handleCardSelect(day: number) {
    if (day > progress.currentDay) {
      return;
    }

    setSelectedDay(day);

    const selectedStep = copy.steps.find((step) => step.day === day);

    if (day === 1 && selectedStep?.href?.startsWith("#")) {
      scrollToTarget(selectedStep.href);
    }
  }

  function handleCompleteAndContinue() {
    const next = completeRhythmChallengeDay(currentStep.day);
    setProgress(next);

    if (currentStep.href) {
      if (currentStep.href.startsWith("#")) {
        scrollToTarget(currentStep.href);
        return;
      }

      window.location.href = currentStep.href;
    }
  }

  return (
    <section id="rhythm-challenge" className="section-shell mt-14 sm:mt-16">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-7 shadow-[0_24px_80px_rgba(7,17,31,0.22)] sm:px-8 sm:py-9">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.subtitle} align="center" />
        {progress.completedDays.length > 0 ? (
          <p className="mt-4 text-center text-sm leading-7 text-white/52">{copy.returning}</p>
        ) : null}

        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {copy.steps.map((step) => {
            const completed = progress.completedDays.includes(step.day);
            const locked = step.day > progress.currentDay;
            const active = selectedDay === step.day;
            const subdued = step.day >= 4;

            return (
              <RhythmDayCard
                key={step.day}
                day={step.day}
                title={step.title}
                description={step.description}
                status={getStatus(step.day)}
                cta={step.day === 1 ? step.cardCta : undefined}
                active={active}
                locked={locked}
                completed={completed}
                subdued={subdued}
                onClick={() => handleCardSelect(step.day)}
              />
            );
          })}
        </div>

        <p className="mt-4 text-center text-sm leading-7 text-white/50">{copy.gentleLine}</p>

        <div id="rhythm-challenge-detail" className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.actionLabel}</p>
          <h3 className="mt-3 font-serif text-2xl leading-tight text-white sm:text-3xl">{currentStep.title}</h3>
          <p className="mt-3 text-base leading-8 text-white/80">{currentStep.description}</p>
          <p className="mt-4 text-sm leading-7 text-white/62">{currentStep.note}</p>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleCompleteAndContinue}
              disabled={currentStep.day > progress.currentDay}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {currentStep.cta}
            </button>
            <p className="text-sm leading-7 text-white/52">{copy.enoughMessage}</p>
          </div>
        </div>

        {isFinished ? (
          <div className="mt-6 rounded-[28px] border border-gold/18 bg-gold/[0.06] p-6 sm:p-7">
            <p className="font-serif text-2xl leading-tight text-white sm:text-3xl">{copy.invite.title}</p>
            <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">{copy.invite.description}</p>
            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.24em] text-gold/84">{copy.invite.planName}</p>
                <p className="text-3xl font-semibold text-white">{copy.invite.price}</p>
              </div>
              <ul className="mt-5 grid gap-3 text-sm text-white/76">
                {copy.invite.benefits.map((benefit) => (
                  <li key={benefit} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    {benefit}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <CheckoutButton
                  plan="basic"
                  label={copy.invite.cta}
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
                  messageClassName="mt-2 text-sm text-white/52"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
