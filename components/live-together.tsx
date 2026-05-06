"use client";

import { SectionHeading } from "@/components/section-heading";
import type { LandingCopy } from "@/lib/landing-copy";

type LiveTogetherProps = {
  copy: LandingCopy["live"];
};

export function LiveTogether({ copy }: LiveTogetherProps) {
  const stats = [
    { label: copy.breathingNow, value: "128" },
    { label: copy.countries, value: "18" },
    { label: copy.weekly, value: "21,430 min" }
  ];

  return (
    <section className="section-shell mt-24">
      <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <p className="text-lg leading-8 text-white/84">{copy.sharedMinutes}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/48">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_30%_35%,rgba(212,186,117,0.22),transparent_18%),radial-gradient(circle_at_68%_58%,rgba(166,230,210,0.24),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 sm:p-8">
          <div className="absolute inset-0 opacity-60">
            {Array.from({ length: 24 }).map((_, index) => (
              <span
                key={index}
                className="absolute h-2.5 w-2.5 rounded-full bg-gold/65 blur-[1px]"
                style={{
                  left: `${12 + (index % 6) * 14}%`,
                  top: `${16 + Math.floor(index / 6) * 18}%`,
                  opacity: 0.35 + ((index % 5) / 10)
                }}
              />
            ))}
          </div>
          <div className="relative">
            <div className="rounded-[28px] border border-white/10 bg-[#061220]/55 p-5 backdrop-blur">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {["Tokyo", "Seoul", "London", "Sydney"].map((city, index) => (
                  <div key={city} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-center">
                    <div className={`mx-auto h-3 w-3 rounded-full ${index % 2 === 0 ? "bg-gold" : "bg-emerald-200"}`} />
                    <p className="mt-3 text-sm text-white/72">{city}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
