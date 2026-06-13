"use client";

import Link from "next/link";
import { CheckoutButton } from "@/components/checkout-button";
import { LineRhythmInvite } from "@/components/line-rhythm-invite";
import { SectionHeading } from "@/components/section-heading";
import { useLanguage, useSiteCopy } from "@/lib/i18n";

export default function PricingPage() {
  const { language } = useLanguage();
  const copy = useSiteCopy();
  const pricing = copy.pricingPage;

  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading eyebrow={pricing.eyebrow} title={pricing.title} description={pricing.description} />

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/58">
        {pricing.badges.map((badge) => (
          <span key={badge} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
            {badge}
          </span>
        ))}
      </div>

      <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.03] p-6 sm:p-7">
        <p className="body-measure word-balance keep-phrase whitespace-pre-line text-lg leading-8 text-white/78 sm:text-xl">{pricing.supportText}</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:items-stretch">
        {pricing.plans.map((plan) => (
          <article
            key={plan.key}
            className={`${plan.orderClass} flex h-full flex-col rounded-[24px] border p-6 shadow-[0_16px_46px_rgba(8,15,24,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_64px_rgba(8,15,24,0.14)] sm:p-7 ${plan.accentClass}`}
          >
            <div className="space-y-4">
              <p className="text-sm font-medium tracking-[0.28em] text-emerald-700">{plan.name}</p>
              <p className="word-balance keep-phrase text-base font-semibold leading-7 text-zinc-900">{plan.emotionalCopy}</p>
              <div className="space-y-2">
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">{plan.price}</p>
                  <span className="pb-1 text-sm text-zinc-500">
                    {language === "jp" ? "/ 月" : language === "kr" ? "/ 월" : "/ month"}
                  </span>
                </div>
                <p className="text-sm font-medium text-emerald-700">{plan.dailyCost}</p>
              </div>
              <p className="text-sm leading-7 text-zinc-600">{plan.description}</p>
            </div>

            <ul className="mt-6 grid gap-3 text-sm text-zinc-700">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="rounded-2xl border border-zinc-200/70 bg-white/70 px-4 py-3 shadow-[0_8px_24px_rgba(8,15,24,0.04)]"
                >
                  {feature}
                </li>
              ))}
            </ul>

            <div className="relative z-50 mt-6">
              {plan.key === "basic" ? (
                <CheckoutButton
                  plan="basic"
                  className="button-nowrap relative z-50 min-h-[52px] w-full cursor-pointer rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {plan.cta}
                </CheckoutButton>
              ) : null}
              {plan.key === "leader" ? (
                <CheckoutButton
                  plan="growth"
                  className="button-nowrap relative z-50 min-h-[52px] w-full cursor-pointer rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {plan.cta}
                </CheckoutButton>
              ) : null}
              {plan.key === "premium" ? (
                <CheckoutButton
                  plan="inner-circle"
                  className="button-nowrap relative z-50 min-h-[52px] w-full cursor-pointer rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {plan.cta}
                </CheckoutButton>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {pricing.trustBadges.map((badge) => (
          <div
            key={badge}
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm text-white/72 shadow-[0_10px_24px_rgba(8,15,24,0.05)]"
          >
            {badge}
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-gold">{pricing.voicesEyebrow}</p>
            <h2 className="word-balance keep-phrase mt-3 text-[clamp(1.75rem,7vw,3rem)] font-semibold tracking-tight text-white">{pricing.voicesTitle}</h2>
          </div>
          <Link
            href="/community"
            className="button-nowrap inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {pricing.voicesButton}
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {pricing.testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_12px_30px_rgba(8,15,24,0.05)] transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]"
            >
              <p className="text-base leading-8 text-white/84">“{item.quote}”</p>
              <p className="mt-5 text-sm text-gold">{item.name}</p>
            </article>
          ))}
        </div>
      </div>

      <LineRhythmInvite className="mt-10" />
    </div>
  );
}
