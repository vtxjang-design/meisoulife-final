"use client";

import { useEffect, useState } from "react";
import { useSiteCopy } from "@/lib/i18n";
import { markLineRhythmConnected } from "@/lib/return-rhythm";

type LineRhythmInviteProps = {
  className?: string;
};

const LINE_RHYTHM_URL = process.env.NEXT_PUBLIC_LINE_FREE_URL || "https://lin.ee/z8Lzvvs";

export function LineRhythmInvite({ className = "" }: LineRhythmInviteProps) {
  const [showToast, setShowToast] = useState(false);
  const [showAfterMessage, setShowAfterMessage] = useState(false);
  const copy = useSiteCopy();

  useEffect(() => {
    if (!showToast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowToast(false);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [showToast]);

  function handleLineClick() {
    markLineRhythmConnected();
    setShowToast(true);
    setShowAfterMessage(true);
    window.open(LINE_RHYTHM_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <section
      className={`rounded-[24px] border border-white/10 bg-white/[0.03] p-6 text-center sm:p-7 ${className}`.trim()}
    >
      <p className="text-2xl font-semibold text-white">{copy.lineInvite.title}</p>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
        {copy.lineInvite.subtitle}
      </p>
      <div className="mt-5 grid gap-2 text-center text-xs tracking-[0.14em] text-white/48 sm:text-sm">
        <p>{copy.lineInvite.morning}</p>
        <p>{copy.lineInvite.evening}</p>
      </div>
      <button
        type="button"
        onClick={handleLineClick}
        className="mt-5 inline-flex min-h-[50px] items-center justify-center rounded-full border border-gold/35 bg-gold/10 px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/15"
      >
        {copy.lineInvite.button}
      </button>
      <p className="mt-3 text-xs leading-6 text-white/50">{copy.lineInvite.note}</p>
      {showAfterMessage ? (
        <p className="mt-4 text-sm leading-7 text-white/64 animate-fade-in">{copy.lineInvite.afterMessage}</p>
      ) : null}

      <div
        className={`fixed bottom-4 left-1/2 z-[70] -translate-x-1/2 transition-all duration-500 ${
          showToast ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
        >
        <div className="rounded-full border border-white/10 bg-[#0b1728]/92 px-4 py-3 text-sm font-medium text-white shadow-[0_16px_40px_rgba(7,17,31,0.35)] backdrop-blur-md">
          {copy.lineInvite.toast}
        </div>
      </div>
    </section>
  );
}
