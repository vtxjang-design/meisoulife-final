"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { useSiteCopy } from "@/lib/i18n";

const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL || "";
const AI_COACH_URL = process.env.NEXT_PUBLIC_AI_COACH_URL || "";

function ExternalSupportButton({
  href,
  label,
  fallback
}: {
  href: string;
  label: string;
  fallback: string;
}) {
  if (!href) {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/60">
          {label}
        </span>
        <p className="text-sm text-white/52">{fallback}</p>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
    >
      {label}
    </a>
  );
}

export default function GrowthProgramPage() {
  const program = useSiteCopy().programPages.growth;

  return (
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
        {program.weeks.map((week) => (
          <article key={week.week} className="premium-card rounded-lg p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-gold/90">
              {program.weekLabel} {week.week}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{week.title}</h2>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{program.goalLabel}</p>
                <p className="mt-2 text-sm leading-7 text-white/72">{week.goal}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{program.practiceLabel}</p>
                <p className="mt-2 text-sm leading-7 text-white/72">{week.practice}</p>
              </div>
            </div>
            <Link
              href={`/meditation?duration=180&type=growth-week-${week.week}`}
              className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              {week.button}
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">{program.communityTitle}</h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">{program.communityDescription}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ExternalSupportButton href={LINE_URL} label={program.lineButton} fallback={program.fallback} />
          <ExternalSupportButton href={AI_COACH_URL} label={program.coachButton} fallback={program.fallback} />
          <Link
            href="/meditation"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
          >
            {program.meditationButton}
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-[28px] border border-gold/20 bg-gold/10 p-6 text-center sm:p-8">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">{program.bottomTitle}</h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-white/74">{program.bottomDescription}</p>
        <div className="mt-6">
          <Link
            href="/program/inner"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-stone-100"
          >
            {program.bottomButton}
          </Link>
        </div>
      </section>
    </div>
  );
}
