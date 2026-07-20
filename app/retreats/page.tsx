"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { retreatsPageCopy, useLocaleCopy } from "@/lib/i18n";

export default function RetreatsPage() {
  const copy = useLocaleCopy(retreatsPageCopy);

  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {copy.items.map((retreat) => (
          <article key={`${retreat.place}-${retreat.title}`} className="premium-card rounded-lg p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">{retreat.place}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{retreat.title}</h2>
            <p className="mt-4 text-sm leading-7 text-white/72">{retreat.description}</p>
          </article>
        ))}
      </div>
      <div className="mt-10">
        <Link
          href="/community"
          className="inline-flex rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92]"
        >
          {copy.cta}
        </Link>
      </div>
    </div>
  );
}
