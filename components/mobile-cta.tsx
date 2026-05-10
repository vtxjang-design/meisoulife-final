"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LandingCopy } from "@/lib/landing-copy";

type MobileCTAProps = {
  copy: LandingCopy["mobile"];
};

export function MobileCTA({ copy }: MobileCTAProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const scrollY = window.scrollY;
      const viewportBottom = scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const nearFooter = viewportBottom > documentHeight - 220;

      setVisible(scrollY > 200 && !nearFooter);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      setOpen(false);
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:hidden">
      <div className="relative flex flex-col items-end gap-3">
        {open ? (
          <div className="glass-panel flex w-[168px] flex-col gap-2 rounded-[22px] border border-white/10 px-2 py-2 shadow-[0_20px_50px_rgba(7,17,31,0.32)]">
            <Link
              href="#one-minute-experience"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-ink"
            >
              {copy.meditate}
            </Link>
            <Link
              href="#ai-rhythm-coach"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-4 text-sm font-semibold text-white"
            >
              {copy.askAi}
            </Link>
          </div>
        ) : null}

        <button
          type="button"
          aria-label={open ? `${copy.trigger} menu close` : `${copy.trigger} menu open`}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-gold/25 bg-[#09121d]/82 px-4 py-3 text-sm font-semibold text-gold shadow-[0_18px_40px_rgba(7,17,31,0.28)] backdrop-blur-xl transition duration-300 hover:bg-[#0d1724]"
        >
          {copy.trigger}
        </button>
      </div>
    </div>
  );
}
