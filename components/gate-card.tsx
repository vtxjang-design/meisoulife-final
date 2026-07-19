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
      className="group flex min-h-[126px] h-full w-full min-w-0 cursor-pointer flex-col rounded-[18px] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.012))] px-3 py-3 text-left transition duration-200 hover:border-gold/18 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.038),rgba(255,255,255,0.016))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1620] active:translate-y-[1px] motion-reduce:transform-none sm:min-h-[134px] sm:rounded-[20px] sm:px-4 sm:py-3.5 sm:hover:-translate-y-[1px]"
    >
      <div className="flex h-full w-full min-w-0 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/6 bg-white/[0.025] text-[14px] opacity-80 transition duration-200 group-hover:border-gold/14 group-hover:bg-gold/[0.04] group-hover:opacity-95 sm:h-8.5 sm:w-8.5 sm:text-[15px]">
            <span aria-hidden="true" className="grayscale-[0.18]">
              {emoji}
            </span>
          </div>
          <p className="inline-flex min-h-[20px] max-w-full flex-none items-center whitespace-nowrap rounded-full border border-white/8 bg-white/[0.04] px-2 py-0.5 text-[10px] leading-none tracking-[0.04em] text-gold/72 sm:min-h-[24px] sm:px-2.5 sm:py-1 sm:text-[10.5px]">
            {label}
          </p>
        </div>
        <div className="mt-3 flex min-w-0 flex-1 flex-col sm:mt-2.5">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 text-[14px] font-medium leading-[1.28] tracking-[-0.02em] text-white [text-wrap:balance] [word-break:keep-all] sm:font-serif sm:text-[19px] sm:leading-[1.24]">
              {worldName}
            </p>
            <span
              aria-hidden="true"
              className="mt-0.5 flex-none text-[13px] leading-none text-white/42 transition-transform duration-200 group-hover:translate-x-[2px] group-hover:text-white/68 motion-reduce:transform-none sm:hidden"
            >
              →
            </span>
          </div>
          <p className="mt-2 max-w-[18ch] min-w-0 text-[11.5px] leading-[1.42] text-white/58 [text-wrap:balance] [word-break:keep-all] sm:mt-1.5 sm:max-w-[19ch] sm:text-[12.5px] sm:leading-[1.6]">
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
