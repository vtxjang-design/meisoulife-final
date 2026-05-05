"use client";

import Link from "next/link";
import { useSiteCopy } from "@/lib/i18n";

export default function WelcomePage() {
  const copy = useSiteCopy().welcomePage;

  return (
    <div className="section-shell py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <section className="premium-card rounded-[28px] p-8 text-center sm:p-12">
          <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl">{copy.title}</h1>
          <p className="mt-6 text-lg text-gold sm:text-xl">{copy.subtitle}</p>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">{copy.description}</p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/meditation"
              className="inline-flex min-h-[56px] min-w-[240px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
            >
              {copy.primary}
            </Link>

            <Link
              href="/challenge"
              className="inline-flex min-h-[52px] min-w-[240px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
            >
              {copy.secondary}
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-[48px] min-w-[240px] items-center justify-center rounded-full px-6 py-3 text-sm font-medium text-white/58 transition duration-300 hover:text-white/82"
            >
              {copy.tertiary}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
