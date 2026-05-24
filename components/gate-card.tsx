"use client";

type GateCardProps = {
  emoji: string;
  label: string;
  worldName: string;
  description: string;
  cta: string;
  onClick: () => void;
};

export function GateCard({ emoji, label, worldName, description, cta, onClick }: GateCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[184px] w-full flex-col items-start justify-between rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] px-5 py-5 text-left shadow-[0_18px_48px_rgba(5,12,22,0.16)] transition duration-300 hover:-translate-y-0.5 hover:border-gold/24 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] sm:min-h-[196px] sm:px-6 sm:py-6"
    >
      <div className="space-y-4">
        <div className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-white/[0.05] px-3 text-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <span aria-hidden="true">{emoji}</span>
        </div>
        <div className="space-y-2.5">
          <p className="text-[18px] font-semibold leading-tight text-white">{label}</p>
          <p className="font-serif text-[17px] leading-[1.45] text-gold/84">{worldName}</p>
          <p className="text-sm leading-7 text-white/64">{description}</p>
        </div>
      </div>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-white/72 transition group-hover:text-white">
        {cta}
        <span className="text-gold/78 transition group-hover:translate-x-0.5">→</span>
      </span>
    </button>
  );
}
