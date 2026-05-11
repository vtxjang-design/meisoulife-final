"use client";

type RhythmDayCardProps = {
  day: number;
  title: string;
  description: string;
  status: string;
  cta?: string;
  active: boolean;
  locked: boolean;
  completed: boolean;
  subdued?: boolean;
  emphasized?: boolean;
  onClick: () => void;
};

export function RhythmDayCard({
  day,
  title,
  description,
  status,
  cta,
  active,
  locked,
  completed,
  subdued = false,
  emphasized = false,
  onClick
}: RhythmDayCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={`group text-left rounded-2xl border px-4 py-3.5 transition duration-300 ${
        active
          ? "border-gold/35 bg-gold/10 shadow-[0_18px_50px_rgba(216,191,131,0.08)]"
          : completed
            ? "border-emerald-200/18 bg-emerald-200/[0.06]"
            : emphasized
              ? "border-white/12 bg-white/[0.045] hover:bg-white/[0.06]"
              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
      } ${locked ? "cursor-not-allowed" : ""} ${subdued && !active && !completed ? "opacity-[0.78]" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold/78">Day {day}</p>
          <h3 className="mt-1.5 text-[15px] font-semibold text-white/90">{title}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-white/58">{status}</span>
      </div>
      <p className="mt-2.5 text-sm leading-6 text-white/68">{description}</p>
      {cta ? (
        <div className="mt-3 flex justify-end">
          <span className="text-sm font-medium text-gold/78 transition duration-300 group-hover:text-gold/90">{cta}</span>
        </div>
      ) : null}
    </button>
  );
}
