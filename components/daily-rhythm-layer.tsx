"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import type { LandingCopy } from "@/lib/landing-copy";

type DailyRhythmLayerProps = {
  copy: LandingCopy["dailyRhythmLayer"];
};

export function DailyRhythmLayer({ copy }: DailyRhythmLayerProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMessageIndex(Math.floor(Math.random() * copy.messages.length));
  }, [copy.messages.length]);

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

  function handleRhythmEnter(experienceKey?: string) {
    if (!experienceKey || typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("meisoulife:daily-rhythm-change", {
        detail: { experienceKey }
      })
    );
  }

  return (
    <section className="section-shell mt-24">
      <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(245,241,228,0.08),transparent_18%),radial-gradient(circle_at_bottom,rgba(79,122,101,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-10 shadow-[0_24px_80px_rgba(7,17,31,0.24)] sm:px-10">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className={`grid gap-4 ${copy.cards.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
            {copy.cards.map((card) => (
              <article
                key={card.key}
                className={`rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition duration-300 hover:bg-white/[0.06] ${
                  prefersReducedMotion ? "" : "animate-live-rhythm-pulse"
                }`}
              >
                <div className="text-2xl">{card.emoji}</div>
                <h3 className="mt-4 font-serif text-xl text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/74">{card.subtitle}</p>
                <p className="mt-2 text-sm leading-7 text-white/56">{card.description}</p>
                {card.experienceKey ? (
                  <button
                    type="button"
                    onClick={() => handleRhythmEnter(card.experienceKey)}
                    className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
                  >
                    {card.cta}
                  </button>
                ) : (
                  <a
                    href={card.href}
                    className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
                  >
                    {card.cta}
                  </a>
                )}
              </article>
            ))}
          </div>

          <div className="rounded-[28px] border border-gold/14 bg-gold/[0.05] p-6 sm:p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-gold/82">{copy.messageTitle}</p>
            <p className="mt-5 whitespace-pre-line font-serif text-2xl leading-10 text-white/90 sm:text-[30px] sm:leading-[1.5]">
              {copy.messages[messageIndex]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
