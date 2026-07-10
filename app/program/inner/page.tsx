"use client";

import Link from "next/link";
import { ProgramAccessGuard } from "@/components/program-access-guard";
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

export default function InnerProgramPage() {
  const program = useSiteCopy().programPages.inner;

  return (
    <ProgramAccessGuard requiredPlan="inner_circle">
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

        <section className="mt-12 grid gap-5 lg:grid-cols-2">
          {program.modules.map((module) => (
            <article
              key={module.module}
              className="rounded-[24px] border border-gold/15 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-[0_20px_60px_rgba(8,15,24,0.10)]"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-gold/90">
                {program.moduleLabel} {module.module}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{module.title}</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{program.goalLabel}</p>
                  <p className="mt-2 text-sm leading-7 text-white/72">{module.goal}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{program.practiceLabel}</p>
                  <p className="mt-2 text-sm leading-7 text-white/72">{module.practice}</p>
                </div>
              </div>
              <Link
                href={`/meditation?duration=180&type=inner-module-${module.module}`}
                className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
              >
                {module.button}
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-[28px] border border-gold/15 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{program.supportTitle}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">{program.supportDescription}</p>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {program.supportCards.map((card) => (
              <article key={card.title} className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/68">{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[28px] border border-gold/20 bg-gold/10 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{program.actionTitle}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/74">{program.actionDescription}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/meditation?duration=180&type=inner-today"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-stone-100"
            >
              {program.meditationButton}
            </Link>
            <ExternalSupportButton href={AI_COACH_URL} label={program.coachButton} fallback={program.fallback} />
            <ExternalSupportButton href={LINE_URL} label={program.lineButton} fallback={program.fallback} />
            <Link
              href="/program/growth"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
            >
              {program.growthButton}
            </Link>
          </div>
        </section>
      </div>
    </ProgramAccessGuard>
  );
}
