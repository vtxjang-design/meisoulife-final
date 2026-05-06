"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { useSiteCopy } from "@/lib/i18n";

type PremiumPageContentProps = {
  plan: "basic" | "growth" | "inner_circle";
  success: boolean;
};

const PROGRAM_ROUTES = {
  basic: "/program/basic",
  growth: "/program/growth",
  inner_circle: "/program/inner"
} as const;

export function PremiumPageContent({ plan, success }: PremiumPageContentProps) {
  const copy = useSiteCopy().premiumPage;

  return (
    <div className="section-shell py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="premium-card rounded-[28px] p-8 sm:p-12">
          {success ? (
            <div className="mb-6 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/12 px-4 py-2 text-sm font-medium text-emerald-100">
              {copy.successBadge}
            </div>
          ) : null}

          <SectionHeading eyebrow={copy.currentPlan} title={copy.title} description={copy.subtitle} />
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm uppercase tracking-[0.28em] text-gold/85">{copy.currentPlan}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{copy.planLabels[plan]}</p>
              <p className="mt-3 text-base leading-8 text-white/72">{copy.description}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={PROGRAM_ROUTES[plan]}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
              >
                {copy.primary}
              </Link>
              <Link
                href="/meditation"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
              >
                {copy.secondary}
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
              >
                {copy.tertiary}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
