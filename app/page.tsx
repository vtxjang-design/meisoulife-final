"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CHALLENGE_RHYTHM_EVENT,
  getChallengeRhythmProgress,
  type ChallengeRhythmProgress
} from "@/lib/challenge-rhythm";
import { languageButtons, useLanguage, useSiteCopy } from "@/lib/i18n";
import { updateReturnRhythmVisit, type ReturnRhythmSnapshot } from "@/lib/return-rhythm";

type Mood = "😀" | "🙂" | "😐" | "😔" | "😣";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

type PricingPlan = {
  key: string;
  name: string;
  price: string;
  description: string;
  features: readonly string[];
  cta: string;
  href: string;
  featured?: boolean;
};

type PricingCardProps = PricingPlan;

const MOOD_STORAGE_KEY = "meisoulife_selected_mood";
const MOOD_MESSAGE_STORAGE_KEY = "meisoulife_selected_mood_message";
const basicCheckoutUrl =
  process.env.NEXT_PUBLIC_STRIPE_BASIC_CHECKOUT_URL || "https://buy.stripe.com/fZu5kC443bVL4gWfMa43S05";

const moods: Mood[] = ["😀", "🙂", "😐", "😔", "😣"];

function formatTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template
  );
}

function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl";

  return (
    <div className={alignment}>
      <p className="text-sm uppercase tracking-[0.3em] text-gold/90">{eyebrow}</p>
      <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-8 text-white/72 sm:text-lg">{description}</p> : null}
    </div>
  );
}

function PricingCard({ name, price, description, features, cta, href, featured = false }: PricingCardProps) {
  return (
    <article
      className={`premium-card flex h-full flex-col gap-6 rounded-lg p-6 ${
        featured ? "border-gold/50 bg-white/[0.075]" : ""
      }`}
    >
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">{name}</p>
        <p className="text-3xl font-semibold text-white">{price}</p>
        <p className="text-sm leading-7 text-white/68">{description}</p>
      </div>
      <ul className="grid gap-3 text-sm text-white/78">
        {features.map((feature) => (
          <li key={feature} className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-auto inline-flex items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition ${
          featured ? "bg-gold text-ink hover:bg-[#e7cd92]" : "border border-white/15 text-white hover:bg-white/10"
        }`}
      >
        {cta}
      </Link>
    </article>
  );
}

export default function HomePage() {
  const { language, setLanguage } = useLanguage();
  const copy = useSiteCopy();
  const home = copy.home;
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeRhythmProgress>({
    currentDay: 1,
    completedDays: []
  });
  const [returnRhythm, setReturnRhythm] = useState<ReturnRhythmSnapshot>({
    lastVisitDate: null,
    streakCount: 0,
    lineConnectedAt: null,
    isReturningToday: false
  });

  const planCards: PricingPlan[] = useMemo(
    () =>
      home.membership.plans.map((plan) => ({
        ...plan,
        href: plan.href === "basic" ? basicCheckoutUrl : plan.href
      })),
    [home.membership.plans]
  );

  const challengeDay = copy.challengePage.days.find((day) => day.day === challengeProgress.currentDay) ?? copy.challengePage.days[0];
  const hasStartedChallenge = challengeProgress.completedDays.length > 0;
  const hasCompletedChallenge = challengeProgress.completedDays.length >= copy.challengePage.days.length;

  useEffect(() => {
    const syncProgress = () => {
      setChallengeProgress(getChallengeRhythmProgress());
    };

    syncProgress();

    window.addEventListener(CHALLENGE_RHYTHM_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);

    return () => {
      window.removeEventListener(CHALLENGE_RHYTHM_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, []);

  useEffect(() => {
    setReturnRhythm(updateReturnRhythmVisit());
  }, []);

  useEffect(() => {
    const savedMood = window.localStorage.getItem(MOOD_STORAGE_KEY) as Mood | null;

    if (savedMood && moods.includes(savedMood)) {
      setSelectedMood(savedMood);
    }
  }, []);

  useEffect(() => {
    if (!selectedMood) {
      return;
    }

    window.localStorage.setItem(MOOD_STORAGE_KEY, selectedMood);
    window.localStorage.setItem(MOOD_MESSAGE_STORAGE_KEY, home.checkInReactions[selectedMood]);
  }, [selectedMood, home.checkInReactions]);

  return (
    <div className="pb-24">
      <section className="section-shell pt-16 sm:pt-24">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm uppercase tracking-[0.34em] text-gold">{home.heroEyebrow}</p>
              <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.03] p-1">
                {languageButtons.map((button) => (
                  <button
                    key={button.key}
                    type="button"
                    onClick={() => setLanguage(button.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.2em] transition duration-300 ${
                      language === button.key ? "bg-white text-ink" : "text-white/68 hover:text-white"
                    }`}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            <h1 className="max-w-4xl whitespace-pre-line font-serif text-5xl leading-tight text-white sm:text-6xl">
              {home.heroTitle}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-white/72 sm:text-xl">{home.heroDescription}</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/welcome-member"
                className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
              >
                {home.heroPrimary}
              </Link>
              <Link
                href="/welcome-member"
                className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/15 px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-white/10"
              >
                {home.heroSecondary}
              </Link>
            </div>
          </div>

          <div className="premium-card overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
              alt={home.imageAlt}
              className="h-full min-h-[420px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section-shell mt-8">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-gold">{home.todayRhythmEyebrow}</p>
              {!hasCompletedChallenge ? (
                <>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    {copy.challengePage.progressLabel} {challengeDay.day} — {challengeDay.title}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-white/68">
                    {hasStartedChallenge ? challengeDay.focus : home.todayRhythmNotStarted}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-3 text-2xl font-semibold text-white">{home.todayRhythmCompletedTitle}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/68">{home.todayRhythmCompletedDescription}</p>
                </>
              )}
            </div>
            <Link
              href="/welcome-member"
              className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-gold/35 bg-gold/10 px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/15"
            >
              {home.todayRhythmButton}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell mt-6">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-gold">{home.returnEyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{home.returnTitle}</h2>
              <p className="mt-2 text-sm leading-7 text-white/68">
                {returnRhythm.isReturningToday ? home.returnReturning : home.returnFirst}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/62">
                {returnRhythm.streakCount > 0 ? formatTemplate(home.returnStreak, { count: returnRhythm.streakCount }) : home.returnStart}
              </div>
              <Link
                href="/welcome-member"
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-gold/35 bg-gold/10 px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/15"
              >
                {home.returnButton}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-10 grid gap-4 lg:grid-cols-3">
        <article className="rounded-[28px] border border-white/70 bg-gradient-to-br from-[#fffdf8] via-[#f7f5ee] to-[#eef6ef] p-5 text-ink shadow-[0_18px_48px_rgba(7,17,31,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(7,17,31,0.14)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-moss">{home.dailyRhythmEyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">{home.checkInTitle}</h2>
            </div>
            <div className="rounded-full border border-moss/20 bg-moss/10 px-3 py-1 text-xs font-medium text-moss">
              {home.dailyRhythmBadge}
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-zinc-600">{home.checkInDescription}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => setSelectedMood(mood)}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-full border text-xl shadow-sm transition duration-300 hover:-translate-y-0.5 ${
                  selectedMood === mood
                    ? "border-emerald-400 bg-emerald-100"
                    : "border-zinc-200 bg-white hover:border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
          <div
            className={`mt-4 min-h-12 text-sm font-medium leading-7 text-emerald-700 transition-all duration-500 ${
              selectedMood ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            }`}
          >
            {selectedMood ? home.checkInReactions[selectedMood] : ""}
          </div>
        </article>

        <article className="rounded-[28px] border border-white/70 bg-gradient-to-br from-[#fffdf8] via-[#f7f5ee] to-[#eef6ef] p-5 text-ink shadow-[0_18px_48px_rgba(7,17,31,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(7,17,31,0.14)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-moss">{home.liveEyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">{home.liveTitle}</h2>
            </div>
            <div className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {home.liveBadge}
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-zinc-600">{home.liveDescription}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-ink sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {[
              { flag: "🇯🇵", count: 8 },
              { flag: "🇰🇷", count: 5 },
              { flag: "🇺🇸", count: 3 },
              { flag: "🇳🇿", count: 2 }
            ].map((item) => (
              <div key={item.flag} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-center shadow-sm">
                <span className="text-base">{item.flag}</span>
                <span className="ml-2 font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-white/70 bg-gradient-to-br from-[#fffdf8] via-[#f7f5ee] to-[#eef6ef] p-5 text-ink shadow-[0_18px_48px_rgba(7,17,31,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(7,17,31,0.14)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-moss">{home.challengeEyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">{home.challengeTitle}</h2>
            </div>
            <div className="rounded-full border border-gold/30 bg-[#fff7e6] px-3 py-1 text-xs font-medium text-[#9a7630]">
              {home.challengeProgress}
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-zinc-600">{home.challengeDescription}</p>
          <Link
            href="/welcome-member"
            className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-navy sm:w-auto sm:min-w-[220px]"
          >
            {home.challengeButton}
          </Link>
        </article>
      </section>

      <section className="section-shell mt-24">
        <SectionHeading
          eyebrow={home.sevenDay.eyebrow}
          title={home.sevenDay.title}
          description={home.sevenDay.description}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {copy.challengePage.days.map((day) => (
            <article key={day.day} className="premium-card rounded-lg p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">
                {copy.challengePage.progressLabel} {day.day}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{day.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/72">{day.focus}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-[24px] border border-gold/20 bg-gold/10 p-6 text-center">
          <p className="text-2xl font-semibold text-white">{home.sevenDay.continuationTitle}</p>
          <p className="mt-3 text-base text-white/72">{home.sevenDay.continuationDescription}</p>
        </div>
      </section>

      <section className="section-shell mt-24 grid gap-6 md:grid-cols-3">
        {home.cards.map((card) => (
          <div key={card.title} className="premium-card rounded-lg p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">{card.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{card.title}</h2>
            <p className="mt-4 text-sm leading-7 text-white/72">{card.description}</p>
          </div>
        ))}
      </section>

      <section className="section-shell mt-24">
        <SectionHeading
          eyebrow={home.platformFlow.eyebrow}
          title={home.platformFlow.title}
          description={home.platformFlow.description}
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-5">
          {home.platformFlow.items.map((item) => (
            <article key={item.step} className="premium-card rounded-lg p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">{item.step}</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/72">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell mt-24">
        <SectionHeading
          eyebrow={home.testimonials.eyebrow}
          title={home.testimonials.title}
          description={home.testimonials.description}
          align="center"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {home.testimonials.items.map((item) => (
            <article
              key={item.name}
              className="premium-card rounded-lg p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]"
            >
              <p className="text-base leading-8 text-white/82">“{item.quote}”</p>
              <p className="mt-5 text-sm text-gold">{item.name}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="membership" className="section-shell mt-24 scroll-mt-28">
        <SectionHeading
          eyebrow={home.membership.eyebrow}
          title={home.membership.title}
          description={home.membership.description}
        />
        <div className="mt-6 flex justify-start">
          <Link
            href="/welcome-member"
            className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-gold/40 px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:scale-[1.02] hover:bg-gold/10"
          >
            {home.membership.topButton}
          </Link>
        </div>
        <div className="mt-10 grid gap-6 xl:grid-cols-4">
          {planCards.map((plan) => {
            const { key, ...planProps } = plan;

            return <PricingCard key={key} {...planProps} />;
          })}
        </div>
      </section>

      <section className="section-shell mt-24">
        <SectionHeading
          eyebrow={home.retreats.eyebrow}
          title={home.retreats.title}
          description={home.retreats.description}
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {home.retreats.items.map((retreat) => (
            <article key={retreat.place} className="premium-card rounded-lg p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">{retreat.place}</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{retreat.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/72">{retreat.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell mt-24">
        <SectionHeading eyebrow={home.faq.eyebrow} title={home.faq.title} />
        <div className="mt-10 grid gap-4">
          {home.faq.items.map((item) => (
            <article key={item.question} className="premium-card rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-white/72">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell mt-24">
        <div className="premium-card rounded-lg p-8 text-center sm:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">{home.finalCta.eyebrow}</p>
          <h2 className="mt-4 font-serif text-4xl text-white">{home.finalCta.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/72">{home.finalCta.description}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/welcome-member"
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
            >
              {home.finalCta.primary}
            </Link>
            <Link
              href="/welcome-member"
              className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/15 px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-white/10"
            >
              {home.finalCta.secondary}
            </Link>
            <Link
              href="/welcome-member"
              className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-4 text-sm font-semibold text-emerald-200 transition duration-300 hover:scale-[1.02] hover:bg-emerald-400/15"
            >
              {home.finalCta.tertiary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
