"use client";

import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import type { LandingCopy } from "@/lib/landing-copy";

type QuietCompanionModeProps = {
  copy: LandingCopy["quietCompanion"];
};

export function QuietCompanionMode({ copy }: QuietCompanionModeProps) {
  const [selectedKey, setSelectedKey] = useState(copy.options[0]?.key ?? "");
  const current = useMemo(
    () => copy.options.find((option) => option.key === selectedKey) ?? copy.options[0],
    [copy.options, selectedKey]
  );

  if (!current) {
    return null;
  }

  return (
    <section id="quiet-companion-mode" className="section-shell mt-10 sm:mt-12">
      <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,252,245,0.08),rgba(255,255,255,0.03))] px-5 py-7 shadow-[0_24px_80px_rgba(7,17,31,0.16)] sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute inset-x-[18%] top-0 h-28 rounded-full bg-emerald-200/8 blur-3xl" />
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} align="center" />

        <div className="mx-auto mt-6 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {copy.options.map((option) => {
            const selected = option.key === current.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedKey(option.key)}
                className={`rounded-[22px] border px-4 py-4 text-sm leading-7 transition duration-300 ${
                  selected
                    ? "border-gold/40 bg-gold/10 text-white shadow-[0_18px_50px_rgba(216,191,131,0.08)]"
                    : "border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.05]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-6 max-w-2xl rounded-[24px] border border-emerald-200/12 bg-emerald-200/8 px-5 py-5 sm:px-6">
          <p className="whitespace-pre-line text-sm leading-8 text-white/84 sm:text-base">{current.response}</p>
        </div>

        <div className="mt-6 flex justify-center">
          <a
            href="#one-minute-experience"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.01] hover:bg-[#e7cd92]"
          >
            {copy.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
