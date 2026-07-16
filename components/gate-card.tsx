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
      className="group flex min-h-[118px] w-full cursor-pointer flex-col items-start justify-between rounded-[20px] border border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.038),rgba(255,255,255,0.016))] px-3.5 py-3 text-left shadow-[0_12px_28px_rgba(5,12,22,0.12)] transition duration-200 hover:-translate-y-[1px] hover:border-gold/30 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.022))] hover:shadow-[0_20px_44px_rgba(212,186,117,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1620] active:scale-[0.985] active:translate-y-[1px] sm:min-h-[154px] sm:rounded-[24px] sm:px-4.5 sm:py-4.5 sm:shadow-[0_16px_40px_rgba(5,12,22,0.14)]"
    >
      <div className="w-full">
        <div className="flex items-start gap-2.5 sm:block sm:space-y-3">
          <div className="inline-flex h-7.5 min-w-7.5 flex-none items-center justify-center rounded-full bg-white/[0.04] px-2 text-[16px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 group-hover:bg-white/[0.07] group-hover:text-[17px] sm:h-8.5 sm:min-w-8.5 sm:px-2.5 sm:text-[18px] sm:group-hover:text-[19px]">
            <span aria-hidden="true">{emoji}</span>
          </div>
          <div className="min-w-0 flex-1 space-y-1 sm:space-y-2">
            <p className="text-[15px] font-medium leading-[1.28] tracking-[-0.02em] text-white [text-wrap:balance] sm:font-serif sm:text-[21px]">
              {worldName}
            </p>
            <p className="max-w-none text-[11.5px] leading-[1.45] text-white/64 [text-wrap:balance] sm:max-w-[18ch] sm:text-[12.5px] sm:leading-[1.65]">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-2 hidden w-full items-end justify-between sm:mt-3 sm:flex">
        <p className="inline-flex rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[10.5px] leading-none tracking-[0.08em] text-gold/76 sm:text-[11px]">
          {label}
        </p>
        {ctaLabel ? (
          <span className="inline-flex translate-y-1 rounded-full border border-gold/16 bg-gold/[0.07] px-2.5 py-1 text-[10.5px] font-medium tracking-[0.04em] text-gold/88 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            {`\u2192 ${ctaLabel}`}
          </span>
        ) : null}
      </div>
    </button>
  );
}
