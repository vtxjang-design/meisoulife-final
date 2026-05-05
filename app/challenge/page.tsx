"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import {
  CHALLENGE_RHYTHM_EVENT,
  getChallengeRhythmProgress,
  markChallengeDayCompleted,
  resetChallengeRhythmProgress,
  type ChallengeRhythmProgress
} from "@/lib/challenge-rhythm";
import { useSiteCopy } from "@/lib/i18n";

function formatTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template
  );
}

export default function ChallengePage() {
  const router = useRouter();
  const copy = useSiteCopy();
  const challenge = copy.challengePage;
  const [progress, setProgress] = useState<ChallengeRhythmProgress>({
    currentDay: 1,
    completedDays: []
  });

  useEffect(() => {
    const syncProgress = () => {
      setProgress(getChallengeRhythmProgress());
    };

    syncProgress();

    window.addEventListener(CHALLENGE_RHYTHM_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);

    return () => {
      window.removeEventListener(CHALLENGE_RHYTHM_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, []);

  function startDay(day: number) {
    setProgress(markChallengeDayCompleted(day));
    router.push(`/meditation?returnTo=${encodeURIComponent("/challenge")}&day=${day}`);
  }

  function resetRhythm() {
    setProgress(resetChallengeRhythmProgress());
  }

  const completedCount = progress.completedDays.length;
  const currentDay = challenge.days.find((item) => item.day === progress.currentDay) ?? challenge.days[0];
  const isComplete = completedCount >= challenge.days.length;
  const completionMessage = useMemo(() => {
    if (completedCount === 0) {
      return challenge.notStarted;
    }

    if (completedCount < challenge.days.length) {
      return formatTemplate(challenge.inProgress, { count: completedCount });
    }

    return challenge.complete;
  }, [challenge, completedCount]);

  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading eyebrow={challenge.eyebrow} title={challenge.title} description={challenge.description} />

      <div className="mt-8 rounded-[24px] border border-gold/15 bg-white/[0.035] p-6 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-gold">{challenge.rhythmEyebrow}</p>
            <p className="mt-3 text-lg leading-8 text-white/78 sm:text-xl">{completionMessage}</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/68">
            {challenge.progressLabel} {progress.currentDay} / 7
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {challenge.days.map((item) => {
          const isCompleted = progress.completedDays.includes(item.day);

          return (
            <article
              key={item.day}
              className={`rounded-[24px] border p-5 transition duration-300 ${
                isCompleted
                  ? "border-emerald-300/30 bg-emerald-400/10 shadow-[0_16px_40px_rgba(16,185,129,0.08)]"
                  : "premium-card"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gold">
                    {challenge.progressLabel} {item.day}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">{item.title}</h2>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    isCompleted
                      ? "border border-emerald-300/20 bg-emerald-300/12 text-emerald-100"
                      : "border border-white/10 bg-white/[0.04] text-white/58"
                  }`}
                >
                  {isCompleted ? challenge.completedBadge : challenge.openBadge}
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-white/72">{item.focus}</p>

              <button
                type="button"
                onClick={() => startDay(item.day)}
                className={`mt-6 inline-flex min-h-[50px] w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-300 ${
                  isCompleted
                    ? "border border-white/12 bg-white/10 text-white hover:bg-white/14"
                    : "bg-gold text-ink hover:bg-[#e7cd92]"
                }`}
              >
                {challenge.startButton}
              </button>
            </article>
          );
        })}
      </div>

      <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-gold">{challenge.guidanceEyebrow}</p>
        <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{currentDay.title}</h2>
        <p className="mt-4 text-base leading-8 text-white/72">{challenge.guidanceTitle}</p>
        <p className="mt-4 text-sm leading-7 text-white/58">{challenge.guidanceBody}</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => startDay(progress.currentDay)}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
          >
            {challenge.todayButton}
          </button>
        </div>
      </div>

      {isComplete ? (
        <div className="mt-10 rounded-[28px] border border-gold/20 bg-gold/10 p-6 text-center sm:p-8">
          <p className="text-2xl font-semibold text-white sm:text-3xl">{challenge.endTitle}</p>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-white/74">{challenge.endDescription}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-stone-100"
            >
              {challenge.memberButton}
            </Link>
            <button
              type="button"
              onClick={resetRhythm}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/10"
            >
              {challenge.repeatButton}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
