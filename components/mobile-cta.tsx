"use client";

import Link from "next/link";
import type { LandingCopy } from "@/lib/landing-copy";

type MobileCTAProps = {
  copy: LandingCopy["mobile"];
};

export function MobileCTA({ copy }: MobileCTAProps) {
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 sm:hidden">
      <div className="glass-panel mx-auto flex max-w-md items-center gap-3 rounded-full px-3 py-3 shadow-[0_24px_60px_rgba(7,17,31,0.35)]">
        <Link
          href="#one-minute-experience"
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-ink"
        >
          {copy.meditate}
        </Link>
        <Link
          href="#ai-rhythm-coach"
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-4 text-sm font-semibold text-white"
        >
          {copy.askAi}
        </Link>
      </div>
    </div>
  );
}
