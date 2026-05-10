"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LandingCopy } from "@/lib/landing-copy";

type TodaysRhythmCardProps = {
  copy: LandingCopy["todaysRhythmCard"];
};

export function TodaysRhythmCard({ copy }: TodaysRhythmCardProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [actionIndex, setActionIndex] = useState(0);

  useEffect(() => {
    // TODO: Replace this local daily rotation with Supabase-driven daily guidance when ready.
    const daySeed = new Date().getDate();
    setMessageIndex(daySeed % copy.messages.length);
    setActionIndex(daySeed % copy.actions.length);
  }, [copy.actions.length, copy.messages.length]);

  return (
    <section className="section-shell mt-16">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(245,241,228,0.12),transparent_20%),radial-gradient(circle_at_bottom,rgba(79,122,101,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-8 shadow-[0_24px_80px_rgba(7,17,31,0.22)] sm:px-8 sm:py-9">
        <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gold/86">{copy.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">{copy.title}</h2>
            <p className="mt-5 whitespace-pre-line font-serif text-2xl leading-10 text-white/90 sm:text-[30px] sm:leading-[1.5]">
              {copy.messages[messageIndex]}
            </p>
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-white/68 sm:text-lg">{copy.support}</p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0d1a20]/55 p-5 backdrop-blur">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-sm leading-7 text-white/76">{copy.activeNow}</p>
            </div>
            <div className="mt-4 rounded-[22px] border border-emerald-200/12 bg-emerald-200/[0.06] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/78">{copy.actionLabel}</p>
              <p className="mt-3 text-base leading-7 text-white/84">{copy.actions[actionIndex]}</p>
            </div>
            <Link
              href="#one-minute-experience"
              className="mt-5 inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              {copy.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
