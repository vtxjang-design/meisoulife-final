"use client";

import { useEffect, useState } from "react";
import OneMinuteMeditation from "@/components/one-minute-meditation";
import { useSiteCopy } from "@/lib/i18n";

const MEMBER_RETURNED_KEY = "meisoulife_member_returned";
const LINE_CONNECT_URL = process.env.NEXT_PUBLIC_LINE_FREE_URL || "https://lin.ee/z8Lzvvs";

export default function WelcomeMemberPage() {
  const [meditationOpen, setMeditationOpen] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const copy = useSiteCopy();

  useEffect(() => {
    const hasReturned = window.localStorage.getItem(MEMBER_RETURNED_KEY) === "true";

    if (hasReturned) {
      setIsReturning(true);
    }

    window.localStorage.setItem(MEMBER_RETURNED_KEY, "true");
  }, []);

  return (
    <div className="section-shell py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <section className="premium-card rounded-[28px] p-8 text-center sm:p-12">
          <p className="text-sm uppercase tracking-[0.34em] text-gold">{copy.welcomeMember.eyebrow}</p>
          <h1 className="mt-6 whitespace-pre-line font-serif text-4xl leading-tight text-white sm:text-5xl">
            {isReturning ? copy.welcomeMember.returningTitle : copy.welcomeMember.firstTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">{copy.welcomeMember.body}</p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setMeditationOpen(true)}
              className="inline-flex min-h-[56px] min-w-[240px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
            >
              {copy.welcomeMember.primary}
            </button>

            <a
              href={LINE_CONNECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] min-w-[240px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
            >
              {copy.welcomeMember.secondary}
            </a>
          </div>
        </section>
      </div>

      <OneMinuteMeditation open={meditationOpen} onClose={() => setMeditationOpen(false)} />
    </div>
  );
}
