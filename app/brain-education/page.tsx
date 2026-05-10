"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { useSiteCopy } from "@/lib/i18n";

export default function BrainEducationPage() {
  const copy = useSiteCopy().brainEducationPage;

  return (
    <div className="section-shell pb-24 pt-16 sm:pt-20">
      <section className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-10 sm:px-10 sm:py-12">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.subtitle} />
        <p className="mt-6 max-w-4xl text-base leading-8 text-white/72 sm:text-lg">{copy.intro}</p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {copy.sections.map((section) => (
            <article key={section.title} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white sm:text-xl">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base sm:leading-8">{section.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/meditation"
            className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
          >
            {copy.primary}
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
          >
            {copy.secondary}
          </Link>
        </div>
      </section>
    </div>
  );
}
