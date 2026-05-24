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
      className="group flex min-h-[112px] w-full cursor-pointer flex-col items-start justify-between rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] px-4 py-4 text-left shadow-[0_14px_36px_rgba(5,12,22,0.14)] transition duration-300 hover:-translate-y-0.5 hover:border-gold/24 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] active:scale-[0.985] sm:min-h-[124px] sm:px-5 sm:py-4.5"
    >
      <div className="space-y-3">
        <div className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-white/[0.05] px-2.5 text-[19px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:h-10 sm:min-w-10 sm:text-[20px]">
          <span aria-hidden="true">{emoji}</span>
        </div>
        <div className="space-y-1.5">
          <p className="text-[16px] font-semibold leading-tight text-white sm:text-[17px]">{label}</p>
          <p className="font-serif text-[14px] leading-[1.4] text-gold/84 sm:text-[15px]">{worldName}</p>
          <p className="text-[12px] leading-5 text-white/64 sm:text-[13px] sm:leading-6">{description}</p>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/72 transition group-hover:text-white sm:text-[13px]">
        {cta}
        <span className="text-gold/78 transition group-hover:translate-x-0.5">→</span>
      </span>
    </button>
  );
}
