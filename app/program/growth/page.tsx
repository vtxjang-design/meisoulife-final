"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { useSiteCopy } from "@/lib/i18n";

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

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <article className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold/90">{program.weeklyTitle}</p>
          <div className="mt-5 space-y-4">
            {program.weeklyItems.map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/72">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold/90">{program.communityTitle}</p>
          <p className="mt-5 text-base leading-8 text-white/72">{program.communityDescription}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/meditation?duration=60&type=day&program=growth"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              {program.primary}
            </Link>
            <Link
              href="/community"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
            >
              {program.secondary}
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
