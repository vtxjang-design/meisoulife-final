"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { useSiteCopy } from "@/lib/i18n";

export default function BasicProgramPage() {
  const program = useSiteCopy().programPages.basic;

  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading
        eyebrow={program.eyebrow}
        title={program.title}
        description={program.description}
        align="center"
      />

      <section className="mt-10 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {program.days.map((day) => (
          <article key={day.day} className="premium-card rounded-lg p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-gold/90">Day {day.day}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{day.title}</h2>
            <p className="mt-4 text-sm leading-7 text-white/70">{day.description}</p>
            <Link
              href={`/meditation?duration=60&type=day&program=basic&day=${day.day}`}
              className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              {program.cta}
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
