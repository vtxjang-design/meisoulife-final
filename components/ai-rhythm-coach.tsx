"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import type { LandingCopy } from "@/lib/landing-copy";

type AIRhythmCoachProps = {
  copy: LandingCopy["coach"];
  coachUrl: string;
};

export function AIRhythmCoach({ copy, coachUrl }: AIRhythmCoachProps) {
  const [selectedKey, setSelectedKey] = useState(copy.states[0]?.key ?? "");
  const current = useMemo(
    () => copy.states.find((item) => item.key === selectedKey) ?? copy.states[0],
    [copy.states, selectedKey]
  );

  return (
    <section id="ai-rhythm-coach" className="section-shell mt-24">
      <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {copy.states.map((state) => (
            <button
              key={state.key}
              type="button"
              onClick={() => setSelectedKey(state.key)}
              className={`rounded-2xl border px-5 py-4 text-left text-sm font-medium transition duration-300 ${
                current.key === state.key
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.06]"
              }`}
            >
              {state.label}
            </button>
          ))}
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-7">
          <div className="flex flex-col gap-5">
            <div className="inline-flex w-fit rounded-full border border-gold/20 bg-gold/10 px-3 py-2 text-xs tracking-[0.22em] text-gold/90">
              AI RHYTHM GUIDE
            </div>
            <p className="text-xl leading-9 text-white sm:text-2xl">{current.acknowledgment}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/48">{copy.guidanceLabel}</p>
                <p className="mt-3 text-sm leading-7 text-white/74">{current.guidance}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/48">{copy.rhythmLabel}</p>
                <p className="mt-3 text-sm leading-7 text-white/74">{current.rhythm}</p>
                <p className="mt-2 text-sm leading-7 text-gold/90">{current.meditation}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-300/12 bg-emerald-300/8 p-4">
              <p className="text-sm leading-7 text-white/78">{current.reflection}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/challenge"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
              >
                {copy.cta}
              </Link>
              <a
                href={coachUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
              >
                {copy.openCoach}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
