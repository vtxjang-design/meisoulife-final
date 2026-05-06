"use client";

type BreathingCircleProps = {
  progress: number;
  secondsLeft: number;
  phaseLabel: string;
  bottomLabel: string;
  running: boolean;
};

const RADIUS = 106;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function BreathingCircle({
  progress,
  secondsLeft,
  phaseLabel,
  bottomLabel,
  running
}: BreathingCircleProps) {
  const dashOffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,rgba(212,186,117,0.18),transparent_62%)] blur-3xl" />
      <div className="relative flex h-[276px] w-[276px] items-center justify-center sm:h-[320px] sm:w-[320px]">
        <div className="absolute inset-0">
          <svg viewBox="0 0 240 240" className="h-full w-full -rotate-90">
            <circle cx="120" cy="120" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="120"
              cy="120"
              r={RADIUS}
              fill="none"
              stroke="rgba(212,186,117,0.92)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        </div>
        {Array.from({ length: 10 }).map((_, index) => (
          <span
            key={index}
            className="absolute h-2 w-2 rounded-full bg-gold/40 blur-[1px]"
            style={{
              left: `${18 + (index % 5) * 16}%`,
              top: `${14 + Math.floor(index / 5) * 54}%`,
              transform: `translateY(${running ? index % 2 === 0 ? "-6px" : "6px" : "0px"})`,
              transition: `transform 4s ease-in-out ${index * 120}ms`
            }}
          />
        ))}
        <div
          className={`absolute inset-[18%] rounded-full border border-white/10 bg-white/[0.04] transition-transform duration-[4000] ease-in-out ${
            phaseLabel === "Hold" || phaseLabel === "멈추기" || phaseLabel === "止めて"
              ? "scale-[1.08]"
              : phaseLabel === "Exhale" || phaseLabel === "내쉬기" || phaseLabel === "吐いて"
                ? "scale-[0.9]"
                : "scale-[1.1]"
          }`}
        />
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.34em] text-gold/80">{phaseLabel}</p>
          <p className="mt-4 font-serif text-5xl text-white/88 sm:text-6xl">{secondsLeft}s</p>
          <p className="mt-4 text-sm text-white/60 sm:text-base">{bottomLabel}</p>
        </div>
      </div>
    </div>
  );
}
