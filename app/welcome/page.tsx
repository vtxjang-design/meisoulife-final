"use client";

import Link from "next/link";
import { useSiteCopy } from "@/lib/i18n";

const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL || "";
const AI_COACH_URL = process.env.NEXT_PUBLIC_AI_COACH_URL || "";

function ExternalActionButton({
  href,
  label,
  fallback,
  className
}: {
  href: string;
  label: string;
  fallback: string;
  className: string;
}) {
  if (!href) {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className={`${className} cursor-not-allowed opacity-60`}>{label}</span>
        <p className="text-sm text-white/58">{fallback}</p>
      </div>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  );
}

export default function WelcomePage() {
  const copy = useSiteCopy().welcomePage;

  return (
    <div className="section-shell py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <section className="premium-card rounded-[28px] p-8 text-center sm:p-12">
          <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl">{copy.title}</h1>
          <p className="mt-6 text-lg text-gold sm:text-xl">{copy.subtitle}</p>
          <div className="mx-auto mt-8 max-w-2xl space-y-3">
            {copy.steps.map((step, index) => (
              <p key={step} className="text-base leading-8 text-white/72 sm:text-lg">
                {index + 1}. {step}
              </p>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <ExternalActionButton
              href={LINE_URL}
              label={copy.lineButton}
              fallback={copy.fallback}
              className="inline-flex min-h-[56px] min-w-[240px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
            />

            <ExternalActionButton
              href={AI_COACH_URL}
              label={copy.coachButton}
              fallback={copy.fallback}
              className="inline-flex min-h-[56px] min-w-[240px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
            />

            <Link
              href="/meditation"
              className="inline-flex min-h-[56px] min-w-[240px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
            >
              {copy.meditationButton}
            </Link>

            <Link
              href="/challenge"
              className="inline-flex min-h-[52px] min-w-[240px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
            >
              {copy.challengeButton}
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-[48px] min-w-[240px] items-center justify-center rounded-full px-6 py-3 text-sm font-medium text-white/58 transition duration-300 hover:text-white/82"
            >
              {copy.tertiary}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
