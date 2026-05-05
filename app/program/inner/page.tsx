"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { useSiteCopy } from "@/lib/i18n";

export default function InnerProgramPage() {
  const program = useSiteCopy().programPages.inner;

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
          <p className="text-sm uppercase tracking-[0.3em] text-gold/90">{program.sessionTitle}</p>
          <p className="mt-5 text-base leading-8 text-white/72">{program.sessionDescription}</p>
          <div className="mt-8">
            <Link
              href="/meditation?duration=180&type=night&program=inner"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              {program.primary}
            </Link>
          </div>
        </article>

        <article className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold/90">{program.retreatTitle}</p>
          <p className="mt-5 text-base leading-8 text-white/72">{program.retreatDescription}</p>
          <div className="mt-8">
            <Link
              href="/retreats"
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
