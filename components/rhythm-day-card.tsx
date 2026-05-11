"use client";

type RhythmDayCardProps = {
  day: number;
  title: string;
  description: string;
  status: string;
  active: boolean;
  locked: boolean;
  completed: boolean;
  onClick: () => void;
};

export function RhythmDayCard({
  day,
  title,
  description,
  status,
  active,
  locked,
  completed,
  onClick
}: RhythmDayCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={`text-left rounded-2xl border px-4 py-4 transition duration-300 ${
        active
          ? "border-gold/35 bg-gold/10 shadow-[0_18px_50px_rgba(216,191,131,0.08)]"
          : completed
            ? "border-emerald-200/18 bg-emerald-200/[0.06]"
            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
      } ${locked ? "cursor-not-allowed opacity-65" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold/78">Day {day}</p>
          <h3 className="mt-2 text-base font-semibold text-white/90">{title}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-white/58">{status}</span>
      </div>
      <p className="mt-3 text-sm leading-7 text-white/68">{description}</p>
    </button>
  );
}
