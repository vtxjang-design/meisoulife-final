"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AIRhythmCoach } from "@/components/ai-rhythm-coach";
import { BrainOwnershipJourney } from "@/components/brain-ownership-journey";
import { CheckoutButton } from "@/components/checkout-button";
import { DailyRhythmCheck } from "@/components/daily-rhythm-check";
import { DailyRhythmLayer } from "@/components/daily-rhythm-layer";
import { FounderVisionSection } from "@/components/founder-vision-section";
import { InstantMeditationSection } from "@/components/instant-meditation-section";
import { LiveTogether } from "@/components/live-together";
import { MobileCTA } from "@/components/mobile-cta";
import { RhythmGarden } from "@/components/rhythm-garden";
import { RhythmChallenge } from "@/components/rhythm-challenge";
import { SectionHeading } from "@/components/section-heading";
import { TogetherAwakeSection } from "@/components/together-awake-section";
import { ZeroExperienceModal } from "@/components/zero-experience-modal";
import { getChallengeRhythmProgress, type ChallengeRhythmProgress } from "@/lib/challenge-rhythm";
import { useLanguage, languageButtons, useSiteCopy } from "@/lib/i18n";
import { landingCopy } from "@/lib/landing-copy";
import { getReturnRhythmSnapshot, updateReturnRhythmVisit, type ReturnRhythmSnapshot } from "@/lib/return-rhythm";

type MembershipPlanKey = "basic" | "leader" | "premium";

const AI_COACH_URL =
  process.env.NEXT_PUBLIC_AI_COACH_URL ||
  "https://chatgpt.com/g/g-69f968bc9a408191a3e5f943912666c0-quiet-rhythm-guide";
const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL || process.env.NEXT_PUBLIC_LINE_FREE_URL || "https://lin.ee/z8Lzvvs";

const heroCopy = {
  jp: {
    eyebrow: "Digital Zero Park",
    title: "1日1分、自分に戻る。",
    supporting: "AI時代、脳の主人として生きる。",
    subtitle: "瞑想を入口に、人間の本来価値を取り戻す Human Evolution OS。",
    primary: "1分ZERO体験",
    secondary: "無料で始める",
    tertiary: "メンバーになる",
    proof: ["Deep Forest Green", "Breath-led Return", "Together Awakening"],
    visualCopy: "情報の波から少し離れ、\nZeroに戻る入口をひとつ。",
    visualLabel: "Human Evolution OS",
    visualAlt: "Forest light and stillness"
  },
  kr: {
    eyebrow: "Digital Zero Park",
    title: "하루 1분, 다시 나에게 돌아오기。",
    supporting: "AI 시대, 뇌의 주인으로 살아가기。",
    subtitle: "명상을 입구로 인간의 본래 가치를 회복하는 Human Evolution OS。",
    primary: "1분 ZERO 체험",
    secondary: "무료로 시작하기",
    tertiary: "멤버 되기",
    proof: ["Deep Forest Green", "Breath-led Return", "Together Awakening"],
    visualCopy: "정보의 파도에서 잠시 벗어나,\nZero로 돌아오는 입구를 하나 둡니다.",
    visualLabel: "Human Evolution OS",
    visualAlt: "Forest light and stillness"
  },
  en: {
    eyebrow: "Digital Zero Park",
    title: "One minute a day, return to yourself.",
    supporting: "Live as the owner of your brain in the AI era.",
    subtitle: "A Human Evolution OS powered by meditation.",
    primary: "1-Minute ZERO",
    secondary: "Start Free",
    tertiary: "Become a Member",
    proof: ["Deep Forest Green", "Breath-led Return", "Together Awakening"],
    visualCopy: "Step out of the information stream\nand return to Zero.",
    visualLabel: "Human Evolution OS",
    visualAlt: "Forest light and stillness"
  }
} as const;

function MembershipCard({
  plan,
  className
}: {
  plan: ReturnType<typeof useLandingMembership>[number];
  className?: string;
}) {
  return (
    <article className={`flex h-full flex-col rounded-[28px] border p-6 ${className || "border-white/10 bg-white/[0.04]"}`}>
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.28em] text-gold">{plan.name}</p>
        <p className="text-3xl font-semibold text-white">{plan.price}</p>
        <p className="text-base text-white/84">{plan.identity}</p>
        <p className="text-sm uppercase tracking-[0.2em] text-white/42">{plan.description}</p>
        <p className="text-sm leading-7 text-white/68">{plan.lifeChange}</p>
      </div>
      <ul className="mt-6 grid gap-3 text-sm text-white/74">
        {plan.features.map((feature) => (
          <li key={feature} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        {plan.key === "basic" ? (
          <CheckoutButton
            plan="basic"
            label={plan.cta}
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            messageClassName="mt-2 text-sm text-white/52"
          />
        ) : null}
        {plan.key === "leader" ? (
          <CheckoutButton
            plan="growth"
            label={plan.cta}
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-white text-ink px-5 py-3 text-sm font-semibold transition duration-300 hover:bg-white/90"
            messageClassName="mt-2 text-sm text-white/52"
          />
        ) : null}
        {plan.key === "premium" ? (
          <CheckoutButton
            plan="inner-circle"
            label={plan.cta}
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-gold/35 bg-gold/10 px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/15"
            messageClassName="mt-2 text-sm text-white/52"
          />
        ) : null}
      </div>
    </article>
  );
}

function useLandingMembership() {
  const { language } = useLanguage();
  return landingCopy[language].membership.plans;
}

export default function HomePage() {
  const { language, setLanguage } = useLanguage();
  const site = useSiteCopy();
  const landing = landingCopy[language];
  const hero = heroCopy[language];
  const membershipPlans = useLandingMembership();
  const [zeroOpen, setZeroOpen] = useState(false);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeRhythmProgress>({
    currentDay: 1,
    completedDays: []
  });
  const [returnRhythm, setReturnRhythm] = useState<ReturnRhythmSnapshot>({
    lastVisitDate: null,
    lastCompletedDate: null,
    streakCount: 0,
    lineConnectedAt: null,
    isReturningToday: false,
    isCompletedToday: false,
    inactiveDays: 0,
    timeAnchor: "daytime"
  });

  useEffect(() => {
    setChallengeProgress(getChallengeRhythmProgress());
    setReturnRhythm(updateReturnRhythmVisit());
  }, []);

  const gardenMood = returnRhythm.isCompletedToday ? "🙂" : returnRhythm.inactiveDays >= 2 ? "😔" : "😀";
  const liveSummary = useMemo(
    () => [
      site.home.rhythmSignals.anchors[returnRhythm.timeAnchor],
      `${challengeProgress.completedDays.length}/7`,
      `${Math.max(returnRhythm.streakCount, 1)}`
    ],
    [challengeProgress.completedDays.length, returnRhythm.streakCount, returnRhythm.timeAnchor, site.home.rhythmSignals.anchors]
  );

  return (
    <div className="pb-28">
      <section className="section-shell pt-14 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm uppercase tracking-[0.34em] text-gold/85">{hero.eyebrow}</p>
              <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.03] p-1">
                {languageButtons.map((button) => (
                  <button
                    key={button.key}
                    type="button"
                    onClick={() => setLanguage(button.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.2em] transition ${
                      button.key === language ? "bg-white text-ink" : "text-white/68 hover:text-white"
                    }`}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <h1 className="whitespace-pre-line font-serif text-5xl leading-[1.18] text-white sm:text-6xl sm:leading-[1.2] lg:text-7xl lg:leading-[1.18]">
                {hero.title}
              </h1>
              <p className="whitespace-pre-line text-xl leading-9 text-gold/82 sm:text-[30px] sm:leading-[1.55]">{hero.supporting}</p>
              <p className="max-w-3xl text-lg leading-8 text-white/68 sm:text-xl sm:leading-9">{hero.subtitle}</p>
            </div>

            <div className="relative z-20 flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => setZeroOpen(true)}
                className="inline-flex min-h-[58px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink shadow-[0_18px_36px_rgba(212,186,117,0.22)] transition duration-300 hover:scale-[1.01] hover:bg-[#e7cd92]"
              >
                {hero.primary}
              </button>
              <Link
                href="/challenge"
                className="inline-flex min-h-[58px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
              >
                {hero.secondary}
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-[58px] items-center justify-center rounded-full border border-gold/20 bg-gold/[0.08] px-6 py-4 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12]"
              >
                {hero.tertiary}
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {hero.proof.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/58">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 sm:p-6">
            <img
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80"
              alt={hero.visualAlt}
              className="relative z-0 h-[440px] w-full rounded-[28px] object-cover sm:h-[520px]"
            />
            <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(5,18,24,0.12),rgba(5,18,24,0.64))]" />
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-8">
              <button
                type="button"
                onClick={() => setZeroOpen(true)}
                className="pointer-events-auto flex h-56 w-56 items-center justify-center rounded-full border border-gold/28 bg-[radial-gradient(circle,rgba(212,186,117,0.24),rgba(212,186,117,0.08)_55%,rgba(6,17,29,0.15)_72%)] shadow-[0_0_120px_rgba(212,186,117,0.16)] transition duration-300 hover:scale-[1.01]"
              >
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.28em] text-gold/84">{hero.visualLabel}</p>
                  <p className="mt-4 font-serif text-6xl text-white sm:text-7xl">ZERO</p>
                </div>
              </button>
            </div>
            <div className="pointer-events-none absolute inset-x-10 bottom-10 z-10 rounded-[28px] border border-white/10 bg-[#06111d]/72 p-5 backdrop-blur">
              <p className="whitespace-pre-line text-sm leading-7 text-white/72">{hero.visualCopy}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {liveSummary.map((item, index) => (
                  <div key={index} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                      {index === 0
                        ? language === "jp"
                          ? "time anchor"
                          : language === "kr"
                            ? "현재 시간대"
                            : "time anchor"
                        : index === 1
                          ? language === "jp"
                            ? "7 day flow"
                            : language === "kr"
                              ? "7일 리듬"
                              : "7 day flow"
                          : language === "jp"
                            ? "return"
                            : language === "kr"
                              ? "return"
                              : "return"}
                    </p>
                    <p className="mt-3 text-lg text-white/84">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <DailyRhythmCheck copy={landing.dailyRhythmCheck} />

      <RhythmChallenge copy={landing.rhythmChallenge} />

      <InstantMeditationSection copy={landing.instant} />

      <LiveTogether copy={landing.live} />

      <BrainOwnershipJourney />

      <DailyRhythmLayer copy={landing.dailyRhythmLayer} />

      <AIRhythmCoach copy={landing.coach} coachUrl={AI_COACH_URL} />

      <TogetherAwakeSection />

      <FounderVisionSection />

      <RhythmGarden
        copy={landing.garden}
        streakCount={Math.max(returnRhythm.streakCount, challengeProgress.completedDays.length, 1)}
        completedToday={returnRhythm.isCompletedToday}
        mood={gardenMood}
      />

      <section id="membership" className="section-shell mt-24">
        <SectionHeading
          eyebrow={landing.membership.eyebrow}
          title={landing.membership.title}
          description={landing.membership.description}
        />
        <div className="mt-8 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <article className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-gold/80">{landing.membership.freeLabel}</p>
            <h3 className="mt-4 font-serif text-3xl text-white">{landing.membership.freeTitle}</h3>
            <ul className="mt-6 grid gap-3 text-sm text-white/72">
              {landing.membership.freeFeatures.map((feature) => (
                <li key={feature} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  {feature}
                </li>
              ))}
            </ul>
            <div className="relative z-20 mt-6">
              <Link
                href="/challenge"
                className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
              >
                {landing.membership.freeCta}
              </Link>
            </div>
          </article>

          <div className="grid gap-5 lg:grid-cols-3">
            {membershipPlans.map((plan) => (
              <MembershipCard
                key={plan.key}
                plan={plan}
                className={
                  plan.featured
                    ? "border-gold/40 bg-[linear-gradient(180deg,rgba(212,186,117,0.14),rgba(255,255,255,0.04))]"
                    : plan.key === "premium"
                      ? "border-amber-200/20 bg-[linear-gradient(180deg,rgba(255,224,180,0.10),rgba(255,255,255,0.03))]"
                      : "border-white/10 bg-white/[0.04]"
                }
              />
            ))}
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="text-2xl font-semibold text-white">{landing.membership.comparisonTitle}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-white/72">
              <thead className="bg-white/[0.02] text-xs uppercase tracking-[0.22em] text-white/46">
                <tr>
                  <th className="px-6 py-4">
                    {language === "jp" ? "Shift" : language === "kr" ? "변화" : "Shift"}
                  </th>
                  <th className="px-6 py-4">{landing.membership.freeLabel}</th>
                  <th className="px-6 py-4">{membershipPlans[1].name}</th>
                  <th className="px-6 py-4">{membershipPlans[2].name}</th>
                </tr>
              </thead>
              <tbody>
                {landing.membership.comparisonRows.map((row) => (
                  <tr key={row.label} className="border-t border-white/10">
                    <td className="px-6 py-4 text-white/88">{row.label}</td>
                    <td className="px-6 py-4">{row.free}</td>
                    <td className="px-6 py-4">{row.growth}</td>
                    <td className="px-6 py-4">{row.inner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-shell mt-24">
        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.12),transparent_24%),linear-gradient(180deg,#0a1716_0%,#0d1824_54%,#08131d_100%)] px-6 py-12 sm:px-10 sm:py-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-[12%] top-8 h-32 rounded-full bg-gold/10 blur-3xl animate-meditation-fog" />
            <div className="absolute -left-8 top-16 h-40 w-40 rounded-full bg-emerald-200/8 blur-3xl animate-meditation-ambient-breathe" />
            <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-sky-200/8 blur-3xl animate-meditation-fog" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,16,0.12),rgba(4,12,16,0.34))]" />
          </div>

          <div className="relative z-20 mx-auto max-w-4xl text-center animate-meditation-fade-up">
            <p className="text-sm uppercase tracking-[0.32em] text-gold/82">静かな場所 | Quiet Sanctuary</p>
            <h2 className="mt-6 whitespace-pre-line font-serif text-3xl leading-[1.4] text-white sm:text-4xl sm:leading-[1.45] lg:text-5xl">
              {"혼자 버티는 삶에서,\n함께 깨어나는 삶으로。"}
            </h2>
            <p className="mt-6 whitespace-pre-line text-base leading-8 text-white/72 sm:text-lg sm:leading-9">
              {"자신을 내려놓을 때,\n우리는 비로소 연결되고 자유로워진다。"}
            </p>

            <div className="mx-auto mt-8 max-w-2xl rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-5 backdrop-blur">
              <p className="text-sm leading-7 text-white/56 sm:text-base">
                「허공을 아는 순간 생사가 하나가 된다。」
              </p>
              <p className="mt-2 text-sm leading-7 text-white/56 sm:text-base">
                「虚空を知る瞬間、生死は一つになる。」
              </p>
            </div>

            <div className="relative z-20 mt-8">
              <Link
                href="#one-minute-experience"
                className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-gold/20 bg-gold/[0.08] px-6 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12] hover:text-[#f1dfaf]"
              >
                静かに感じてみる
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-24">
        <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-10 text-center sm:px-10">
          <h2 className="font-serif text-3xl text-white sm:text-4xl">{landing.mission.mission}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/68">
            {landing.live.description}
          </p>
          <div className="relative z-20 mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/challenge"
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              {landing.hero.primary}
            </Link>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
            >
              LINE
            </a>
          </div>
        </div>
      </section>

      <MobileCTA copy={landing.mobile} />
      <ZeroExperienceModal open={zeroOpen} onClose={() => setZeroOpen(false)} />
    </div>
  );
}
