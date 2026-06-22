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
      className="group flex min-h-[124px] w-full cursor-pointer flex-col items-start justify-between rounded-[20px] border border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] px-3.5 py-3 text-left shadow-[0_14px_36px_rgba(5,12,22,0.14)] transition duration-300 hover:-translate-y-1 hover:border-gold/18 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.022))] hover:shadow-[0_24px_56px_rgba(212,186,117,0.08)] active:scale-[0.985] sm:min-h-[182px] sm:rounded-[24px] sm:px-5 sm:py-5 sm:shadow-[0_18px_48px_rgba(5,12,22,0.16)]"
    >
      <div className="w-full">
        <div className="flex items-start gap-2.5 sm:block sm:space-y-4">
          <div className="inline-flex h-7.5 min-w-7.5 flex-none items-center justify-center rounded-full bg-white/[0.04] px-2 text-[16px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:h-9 sm:min-w-9 sm:px-2.5 sm:text-[18px]">
            <span aria-hidden="true">{emoji}</span>
          </div>
          <div className="min-w-0 flex-1 space-y-1 sm:space-y-2.5">
            <p className="text-[15px] font-medium leading-[1.28] tracking-[-0.02em] text-white [text-wrap:balance] sm:font-serif sm:text-[24px]">
              {worldName}
            </p>
            <p className="max-w-none text-[11.5px] leading-[1.5] text-white/64 [text-wrap:balance] sm:max-w-[20ch] sm:text-[13px] sm:leading-[1.72]">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-2 hidden sm:mt-4 sm:block">
        <p className="inline-flex rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[10.5px] leading-none tracking-[0.08em] text-gold/76 sm:text-[11.5px]">
          {label}
        </p>
        {ctaLabel ? (
          <span className="ml-2 inline-flex rounded-full border border-gold/16 bg-gold/[0.07] px-2.5 py-1 text-[10.5px] font-medium tracking-[0.08em] text-gold/88">
            {ctaLabel}
          </span>
        ) : null}
      </div>
    </button>
  );
}
