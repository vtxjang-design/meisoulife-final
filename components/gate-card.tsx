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
      className="group flex min-h-[168px] w-full cursor-pointer flex-col items-start justify-between rounded-[24px] border border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] px-4.5 py-4.5 text-left shadow-[0_18px_48px_rgba(5,12,22,0.16)] transition duration-300 hover:-translate-y-1 hover:border-gold/18 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.022))] hover:shadow-[0_24px_56px_rgba(212,186,117,0.08)] active:scale-[0.985] sm:min-h-[182px] sm:px-5 sm:py-5"
    >
      <div className="space-y-4">
        <div className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white/[0.04] px-2.5 text-[17px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:h-9 sm:min-w-9 sm:text-[18px]">
          <span aria-hidden="true">{emoji}</span>
        </div>
        <div className="space-y-2.5">
          <p className="font-serif text-[21px] leading-[1.22] tracking-[-0.02em] text-white sm:text-[24px]">
            {worldName}
          </p>
          <p className="max-w-[18ch] text-[12.5px] leading-[1.72] text-white/66 sm:max-w-[20ch] sm:text-[13px]">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[11px] tracking-[0.16em] text-gold/72 sm:text-[11.5px]">{label}</p>
        {ctaLabel ? (
          <span className="inline-flex rounded-full border border-gold/16 bg-gold/[0.07] px-2.5 py-1 text-[10.5px] font-medium tracking-[0.08em] text-gold/88">
            {ctaLabel}
          </span>
        ) : null}
      </div>
    </button>
  );
}
