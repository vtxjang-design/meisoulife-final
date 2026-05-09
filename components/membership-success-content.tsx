"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSiteCopy } from "@/lib/i18n";
import { setMembershipStatus, type StoredMembershipTier } from "@/lib/membership-status";

type MembershipSuccessContentProps = {
  sessionId: string;
  tier: StoredMembershipTier;
  lineUrl: string;
  coachUrl: string;
};

const PROGRAM_ROUTES: Record<StoredMembershipTier, string> = {
  basic: "/program/basic",
  growth: "/program/growth",
  inner_circle: "/program/inner"
};

export function MembershipSuccessContent({ sessionId, tier, lineUrl, coachUrl }: MembershipSuccessContentProps) {
  const copy = useSiteCopy().membershipSuccessPage;

  useEffect(() => {
    setMembershipStatus({
      active: true,
      tier,
      activatedAt: new Date().toISOString(),
      stripeSessionId: sessionId
    });
  }, [sessionId, tier]);

  return (
    <div className="section-shell py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="premium-card rounded-[28px] p-8 sm:p-12">
          <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/12 px-4 py-2 text-sm font-medium text-emerald-100">
            {copy.badge}
          </div>

          <div className="mt-6">
            <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/74 sm:text-lg">{copy.subtitle}</p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">{copy.body}</p>
          </div>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.activeTierLabel}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{copy.planLabels[tier]}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {copy.steps.map((step, index) => (
              <div key={step} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-white/42">Step {index + 1}</p>
                <p className="mt-3 text-sm leading-7 text-white/80">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              {copy.lineButton}
            </a>
            <a
              href={coachUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
            >
              {copy.coachButton}
            </a>
            <Link
              href="/meditation"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
            >
              {copy.rhythmButton}
            </Link>
            <Link
              href={PROGRAM_ROUTES[tier]}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
            >
              {copy.programButton}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
