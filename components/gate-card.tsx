"use client";

type GateCardProps = {
  emoji: string;
  label: string;
  worldName: string;
  description: string;
  ctaLabel?: string;
  onClick: () => void;
};

export function GateCard({ emoji, label, worldName, description, ctaLabel, onClick }: GateCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[92px] w-full cursor-pointer flex-col items-start justify-between rounded-[18px] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.012))] px-3.5 py-3 text-left transition duration-200 hover:-translate-y-[1px] hover:border-gold/18 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.038),rgba(255,255,255,0.016))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1620] active:translate-y-[1px] motion-reduce:transform-none sm:min-h-[134px] sm:rounded-[20px] sm:px-4 sm:py-3.5"
    >
      <div className="w-full space-y-2.5 sm:space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/6 bg-white/[0.025] text-[14px] opacity-80 transition duration-200 group-hover:border-gold/14 group-hover:bg-gold/[0.04] group-hover:opacity-95 sm:h-8.5 sm:w-8.5 sm:text-[15px]">
            <span aria-hidden="true" className="grayscale-[0.18]">
              {emoji}
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
            <p className="text-[15px] font-medium leading-[1.3] tracking-[-0.02em] text-white [text-wrap:balance] sm:font-serif sm:text-[19px] sm:leading-[1.24]">
              {worldName}
            </p>
            <p className="max-w-[24ch] text-[12px] leading-[1.5] text-white/60 [text-wrap:balance] sm:max-w-[19ch] sm:text-[12.5px] sm:leading-[1.6]">
              {description}
            </p>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-3">
          <p className="inline-flex min-h-[24px] items-center rounded-full border border-white/6 bg-white/[0.03] px-2.5 py-1 text-[10px] leading-none tracking-[0.08em] text-gold/68 sm:text-[10.5px]">
            {label}
          </p>
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
