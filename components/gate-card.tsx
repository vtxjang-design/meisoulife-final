"use client";

import type { CSSProperties, ReactNode } from "react";

type GateCardProps = {
  icon: ReactNode;
  label: string;
  worldName: string;
  description: string;
  ctaLabel?: string;
  tone?: string;
  onClick: () => void;
};

export function GateCard({ icon, label, worldName, description, ctaLabel, tone, onClick }: GateCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ "--gate-tone": tone } as CSSProperties}
      className="group flex min-h-[104px] h-full w-full min-w-0 cursor-pointer flex-col rounded-[18px] border border-white/[0.14] bg-[linear-gradient(135deg,var(--gate-tone,rgba(255,255,255,0.035)),rgba(5,13,25,0.12)_78%)] px-3 py-2.5 text-left transition-colors duration-200 [@media(hover:hover)]:hover:border-gold/28 [@media(hover:hover)]:hover:bg-[linear-gradient(135deg,var(--gate-tone,rgba(255,255,255,0.045)),rgba(5,13,25,0.08)_78%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1620] active:border-gold/30 active:bg-[linear-gradient(135deg,var(--gate-tone,rgba(255,255,255,0.055)),rgba(212,186,117,0.08)_78%)] motion-reduce:transition-none sm:min-h-[134px] sm:rounded-[20px] sm:border-white/8 sm:bg-[linear-gradient(180deg,rgba(255,255,255,0.032),rgba(255,255,255,0.012))] sm:px-4 sm:py-3.5 [@media(hover:hover)]:sm:hover:border-gold/22 [@media(hover:hover)]:sm:hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] [@media(hover:hover)]:sm:hover:-translate-y-[1px]"
    >
      <div className="flex h-full w-full min-w-0 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.025] text-white/72 transition-colors duration-200 [@media(hover:hover)]:group-hover:border-gold/18 [@media(hover:hover)]:group-hover:bg-gold/[0.04] [@media(hover:hover)]:group-hover:text-gold/82 group-focus-visible:border-gold/28 group-focus-visible:text-gold/86 group-active:border-gold/24 group-active:text-gold/82 sm:h-8.5 sm:w-8.5 sm:border-white/8 sm:text-gold/78">
            {icon}
          </div>
          <p className="inline-flex min-h-[20px] max-w-full flex-none items-center whitespace-nowrap rounded-full border border-white/[0.05] bg-white/[0.035] px-2 py-0.5 text-[10px] leading-none tracking-[0.04em] text-white/54 sm:min-h-[24px] sm:border-white/8 sm:px-2.5 sm:py-1 sm:text-[10.5px] sm:text-gold/72">
            {label}
          </p>
        </div>
        <div className="mt-2 flex min-w-0 flex-1 flex-col sm:mt-2.5">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 text-[14px] font-medium leading-[1.25] tracking-[-0.02em] text-white/92 [text-wrap:balance] [word-break:keep-all] sm:font-serif sm:text-[19px] sm:leading-[1.24] sm:text-white">
              {worldName}
            </p>
            <span
              aria-hidden="true"
              className="mt-0.5 flex-none text-[13px] leading-none text-white/28 transition-colors duration-200 [@media(hover:hover)]:group-hover:text-white/62 group-focus-visible:text-gold/82 group-active:text-white/68 motion-reduce:transition-none sm:hidden"
            >
              →
            </span>
          </div>
          <p className="mt-1.5 max-w-[18ch] min-w-0 text-[11.5px] leading-[1.38] text-white/50 [text-wrap:balance] [word-break:keep-all] sm:mt-1.5 sm:max-w-[19ch] sm:text-[12.5px] sm:leading-[1.6] sm:text-white/58">
            {description}
          </p>
        </div>
        <div className="mt-2 hidden w-full items-center justify-between gap-2.5 sm:flex">
          {ctaLabel ? (
            <span className="hidden translate-y-[1px] rounded-full border border-gold/12 bg-gold/[0.05] px-2.5 py-1 text-[10px] font-medium tracking-[0.04em] text-gold/78 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 md:inline-flex">
              {`\u2192 ${ctaLabel}`}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
