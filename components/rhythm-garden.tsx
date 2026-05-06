"use client";

import { SectionHeading } from "@/components/section-heading";
import type { LandingCopy } from "@/lib/landing-copy";

type RhythmGardenProps = {
  copy: LandingCopy["garden"];
  streakCount: number;
  completedToday: boolean;
  mood?: string | null;
};

const moodPalette: Record<string, string> = {
  "😀": "bg-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.65)]",
  "🙂": "bg-emerald-200 shadow-[0_0_24px_rgba(110,231,183,0.62)]",
  "😐": "bg-sky-200 shadow-[0_0_24px_rgba(125,211,252,0.58)]",
  "😔": "bg-violet-200 shadow-[0_0_24px_rgba(196,181,253,0.6)]",
  "😣": "bg-rose-200 shadow-[0_0_24px_rgba(253,164,175,0.62)]"
};

export function RhythmGarden({ copy, streakCount, completedToday, mood }: RhythmGardenProps) {
  const dots = Array.from({ length: 7 }).map((_, index) => {
    const active = index < Math.min(streakCount, 7);
    const isCurrent = active && index === Math.min(Math.max(streakCount - 1, 0), 6);

    return {
      id: index,
      active,
      className: active
        ? isCurrent && mood
          ? moodPalette[mood]
          : "bg-emerald-100 shadow-[0_0_18px_rgba(167,243,208,0.48)]"
        : "bg-white/14"
    };
  });

  return (
    <section className="section-shell mt-24">
      <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-gold/90">{copy.weekTitle}</p>
          <div className="mt-8 grid grid-cols-7 gap-3">
            {dots.map((dot) => (
              <div
                key={dot.id}
                className="flex aspect-square items-center justify-center rounded-full border border-white/10 bg-white/[0.02]"
              >
                <div className={`h-5 w-5 rounded-full transition-all duration-700 ${dot.className}`} />
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/48">{copy.streakLabel}</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {streakCount} {copy.dayUnit}
            </p>
            <p className="mt-3 text-sm leading-7 text-white/72">
              {completedToday ? copy.returning : copy.message}
            </p>
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.18),transparent_28%),rgba(255,255,255,0.04)] p-6 sm:p-8">
          <div className="grid h-full gap-4">
            {Array.from({ length: 3 }).map((_, row) => (
              <div key={row} className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-white/[0.02] p-4">
                {Array.from({ length: 4 }).map((__, index) => (
                  <span
                    key={index}
                    className={`h-3 w-3 rounded-full ${
                      (row + index) % 4 === 0
                        ? "bg-gold/80"
                        : (row + index) % 3 === 0
                          ? "bg-emerald-200/75"
                          : "bg-white/22"
                    }`}
                  />
                ))}
                <p className="text-sm leading-7 text-white/64">
                  {row === 0
                    ? `${copy.yesterday} · ${copy.uneasy}`
                    : row === 1
                      ? `${copy.today} · ${copy.softer}`
                      : `${copy.thisWeek} · ${copy.steady}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
