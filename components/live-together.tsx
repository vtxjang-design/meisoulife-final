"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import type { LandingCopy } from "@/lib/landing-copy";

type LiveTogetherProps = {
  copy: LandingCopy["live"];
};

export function LiveTogether({ copy }: LiveTogetherProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", syncMotionPreference);
    };
  }, []);

  // TODO: Replace this static metric source with Supabase or live session data when ready.
  const metrics = copy.metrics;

  return (
    <section className="section-shell mt-24">
      <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.16),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-10 shadow-[0_24px_80px_rgba(7,17,31,0.24)] sm:px-10">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} align="center" />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {metrics.map((metric, index) => (
            <article
              key={metric.key}
              className={`rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur ${
                prefersReducedMotion ? "" : "animate-live-rhythm-pulse"
              }`}
              style={
                prefersReducedMotion
                  ? undefined
                  : {
                      animationDuration: `${8 + index * 2}s`,
                      animationDelay: `${index * 0.8}s`
                    }
              }
            >
              <p className="text-xs uppercase tracking-[0.22em] text-white/46">{metric.label}</p>
              <p className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">{metric.value}</p>
              <p className="mt-4 text-sm leading-7 text-white/68">{metric.subtext}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
