"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { useLanguage, useSiteCopy } from "@/lib/i18n";

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
  const { language } = useLanguage();
  const siteCopy = useSiteCopy();
  const copy = siteCopy.premiumPage;
  const recoveryLabel = siteCopy.header.mobileMenu.find((item) => item.href === "/#one-minute-experience")?.label ?? "1-Minute Recovery";
  const memberStatus =
    language === "jp"
      ? plan === "inner_circle"
        ? "Brain Owner"
        : "Premium Member"
      : language === "kr"
        ? plan === "inner_circle"
          ? "브레인 오너"
          : "프리미엄 멤버"
        : plan === "inner_circle"
          ? "Brain Owner"
          : "Premium Member";
  const dashboardLabel = language === "jp" ? "ダッシュボードへ" : language === "kr" ? "대시보드로" : "Go to dashboard";

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
              <p className="mt-3 inline-flex rounded-full border border-gold/20 bg-gold/[0.08] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-gold">
                {memberStatus}
              </p>
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
                href="/#one-minute-experience"
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

            <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-gold/82">{recoveryLabel}</p>
              <p className="mt-3 text-base leading-8 text-white/72">{siteCopy.modal.completeBody}</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/#one-minute-experience"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
                >
                  {recoveryLabel}
                </Link>
                <Link
                  href={PROGRAM_ROUTES[plan]}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
                >
                  {dashboardLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
