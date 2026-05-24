"use client";

type GateCardProps = {
  emoji: string;
  label: string;
  worldName: string;
  description: string;
  onClick: () => void;
};

export function GateCard({ emoji, label, worldName, description, onClick }: GateCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[96px] w-full cursor-pointer flex-col items-start justify-center rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] px-4 py-3.5 text-left shadow-[0_14px_36px_rgba(5,12,22,0.14)] transition duration-300 hover:-translate-y-0.5 hover:border-gold/24 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] hover:shadow-[0_18px_42px_rgba(212,186,117,0.08)] active:scale-[0.985] sm:min-h-[104px] sm:px-4.5 sm:py-4"
    >
      <div className="space-y-2.5">
        <div className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white/[0.05] px-2 text-[17px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:h-9 sm:min-w-9 sm:text-[18px]">
          <span aria-hidden="true">{emoji}</span>
        </div>
        <div className="space-y-1">
          <p className="text-[15px] font-semibold leading-tight text-white sm:text-[16px]">{label}</p>
          <p className="font-serif text-[13px] leading-[1.35] text-gold/84 sm:text-[14px]">{worldName}</p>
          <p className="text-[11.5px] leading-5 text-white/64 sm:text-[12px] sm:leading-5">{description}</p>
        </div>
      </div>
    </button>
  );
}
