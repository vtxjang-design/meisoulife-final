"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProgramAccessGuard } from "@/components/program-access-guard";
import { SectionHeading } from "@/components/section-heading";
import { useSiteCopy } from "@/lib/i18n";

const STORAGE_KEY = "meisoulife_basic_program_completed_days";

export default function BasicProgramPage() {
  const program = useSiteCopy().programPages.basic;
  const router = useRouter();
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as number[];

      if (Array.isArray(parsed)) {
        setCompletedDays(parsed.filter((value) => Number.isInteger(value)).sort((a, b) => a - b));
      }
    } catch (_error) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function startDay(day: number) {
    const nextDays = Array.from(new Set([...completedDays, day])).sort((a, b) => a - b);

    setCompletedDays(nextDays);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDays));
    router.push(`/meditation?duration=180&type=basic-day-${day}`);
  }

  return (
    <ProgramAccessGuard>
      <div className="section-shell py-16 sm:py-24">
        <SectionHeading
          eyebrow={program.eyebrow}
          title={program.title}
          description={program.description}
          align="center"
        />
        <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-8 text-white/72 sm:text-lg">
          {program.intro}
        </p>

        <section className="mt-10 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {program.days.map((day) => {
            const isCompleted = completedDays.includes(day.day);

            return (
              <article key={day.day} className="premium-card rounded-lg p-5">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-gold/90">
                    {program.dayLabel} {day.day}
                  </p>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isCompleted
                        ? "border border-emerald-300/20 bg-emerald-300/12 text-emerald-100"
                        : "border border-white/10 bg-white/[0.04] text-white/58"
                    }`}
                  >
                    {isCompleted ? program.completedBadge : program.openBadge}
                  </div>
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-white">{day.title}</h2>
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{program.goalLabel}</p>
                    <p className="mt-2 text-sm leading-7 text-white/72">{day.goal}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{program.practiceLabel}</p>
                    <p className="mt-2 text-sm leading-7 text-white/72">{day.practice}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => startDay(day.day)}
                  className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
                >
                  {day.button}
                </button>
              </article>
            );
          })}
        </section>

        <section className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{program.bottomTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/72">{program.bottomDescription}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/meditation"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              {program.bottomPrimary}
            </Link>
            <Link
              href="/challenge"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
            >
              {program.bottomSecondary}
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
            >
              {program.bottomTertiary}
            </Link>
          </div>
        </section>
      </div>
    </ProgramAccessGuard>
  );
}
