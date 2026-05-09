"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import type { LandingCopy } from "@/lib/landing-copy";
import { getTodayRhythmCheckIn, hasTodayRhythmCheckIn, setTodayRhythmCheckIn } from "@/lib/today-rhythm-checkin";

type TodayRhythmCheckinProps = {
  copy: LandingCopy["checkIn"];
};

export function TodayRhythmCheckin({ copy }: TodayRhythmCheckinProps) {
  const [selectedMoodKey, setSelectedMoodKey] = useState(copy.options[0]?.key ?? "");
  const [hasReturnedToday, setHasReturnedToday] = useState(false);

  useEffect(() => {
    const stored = getTodayRhythmCheckIn();
    setHasReturnedToday(hasTodayRhythmCheckIn());

    if (stored) {
      setSelectedMoodKey(stored.moodKey);
    }
  }, []);

  const current = useMemo(
    () => copy.options.find((option) => option.key === selectedMoodKey) ?? copy.options[0],
    [copy.options, selectedMoodKey]
  );

  function handleSelect(nextKey: string) {
    const next = copy.options.find((option) => option.key === nextKey);

    if (!next) {
      return;
    }

    setSelectedMoodKey(nextKey);
    setHasReturnedToday(true);
    setTodayRhythmCheckIn({
      moodKey: next.key,
      recommendationType: next.recommendation.type
    });
  }

  return (
    <section id="today-rhythm-checkin" className="section-shell mt-16">
      <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-8 shadow-[0_24px_80px_rgba(7,17,31,0.24)] sm:px-8 sm:py-10">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} align="center" />

        <div className="mt-4 text-center">
          <p className="text-sm leading-7 text-white/54">{copy.support}</p>
          {hasReturnedToday ? <p className="mt-2 text-sm text-gold/78">{copy.returnLine}</p> : null}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {copy.options.map((option) => {
            const selected = option.key === current.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelect(option.key)}
                className={`rounded-[24px] border px-5 py-4 text-left transition duration-300 ${
                  selected
                    ? "border-gold/40 bg-gold/10 shadow-[0_18px_50px_rgba(216,191,131,0.08)]"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <span className={`text-sm leading-7 ${selected ? "text-white" : "text-white/78"}`}>{option.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {current ? (
          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-7">
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-gold/82">{copy.recommendationEyebrow}</p>
                <h3 className="mt-3 font-serif text-2xl text-white sm:text-3xl">{copy.recommendationTitle}</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/46">{copy.wordLabel}</p>
                  <p className="mt-3 text-base leading-8 text-white/84">{current.recommendation.word}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/46">{copy.breathLabel}</p>
                  <p className="mt-3 text-base leading-8 text-white/84">{current.recommendation.breath}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/46">{copy.meditationLabel}</p>
                  <p className="mt-3 text-base leading-8 text-white/84">{current.recommendation.meditation}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/46">{copy.supportLabel}</p>
                  <p className="mt-3 text-base leading-8 text-white/84">{current.recommendation.support}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="#one-minute-experience"
                  className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.01] hover:bg-[#e7cd92]"
                >
                  {current.recommendation.cta}
                </a>
                <a
                  href="#ai-rhythm-coach"
                  className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
                >
                  {copy.secondaryCta}
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
