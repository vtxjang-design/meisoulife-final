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

const AI_COACH_URL =
  process.env.NEXT_PUBLIC_AI_COACH_URL ||
  "https://chatgpt.com/g/g-69f968bc9a408191a3e5f943912666c0-quiet-rhythm-guide";
const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL || process.env.NEXT_PUBLIC_LINE_FREE_URL || "https://lin.ee/z8Lzvvs";

const heroCopy = {
  jp: {
    eyebrow: "毎日のリズム",
    title: "疲れた脳を、\n1分だけ休ませませんか？",
    supporting: "自然とつながり、\n心を整え、\nまた本来の自分に戻る。",
    subtitle: "仕事の疲れ・SNS疲れ・心の疲れに。",
    primary: "今日の1分を始める",
    secondary: "7日リズムを見る",
    trust: "無料・60秒・登録不要",
    proof: ["脳を休ませる", "自然のリズム", "ひとりじゃない"],
    visualCopy: "森の静けさに少し触れて、\n情報の流れから呼吸へ戻る。",
    visualLabel: "静かな入口",
    visualAlt: "Forest light and stillness"
  },
  kr: {
    eyebrow: "매일의 리듬",
    title: "지친 뇌를,\n1분만 쉬게 해보세요.",
    supporting: "자연과 연결되고,\n마음을 정돈하며,\n다시 본래의 나에게 돌아옵니다.",
    subtitle: "일의 피로·SNS 피로·마음의 피로에.",
    primary: "오늘의 1분 시작하기",
    secondary: "7일 리듬 보기",
    trust: "무료 · 60초 · 가입 불필요",
    proof: ["뇌를 쉬게 하기", "자연의 리듬", "혼자가 아님"],
    visualCopy: "숲의 고요함을 잠시 빌려,\n정보의 흐름에서 호흡으로 돌아옵니다.",
    visualLabel: "조용한 입구",
    visualAlt: "Forest light and stillness"
  },
  en: {
    eyebrow: "Daily Rhythm",
    title: "Would you let your tired brain\nrest for one minute?",
    supporting: "Reconnect with nature,\nsettle your mind,\nand return to who you are.",
    subtitle: "For work fatigue, social fatigue, and emotional exhaustion.",
    primary: "Start today's minute",
    secondary: "See the 7-day rhythm",
    trust: "Free · 60 seconds · No signup",
    proof: ["brain reset", "nature rhythm", "human connection"],
    visualCopy: "Borrow a little stillness from the forest,\nand return from information to breath.",
    visualLabel: "Quiet entry",
    visualAlt: "Forest light and stillness"
  }
} as const;

const healingCopy = {
  jp: {
    eyebrow: "自然の休息",
    title: "森の近くで深呼吸するように。",
    description: "鳥の声、静かな光、少しひんやりした空気。瞑想lifeは、忙しい頭を自然のリズムへ戻す小さな休息の場です。",
    points: ["森の静けさ", "やわらかな呼吸", "情報から少し離れる"]
  },
  kr: {
    eyebrow: "자연의 휴식",
    title: "숲 가까이에서 숨을 고르듯이.",
    description: "새소리, 잔잔한 빛, 조금 서늘한 공기. 명상life는 바쁜 머리를 자연의 리듬으로 되돌리는 작은 쉼의 자리입니다.",
    points: ["숲의 고요함", "부드러운 호흡", "정보에서 잠시 멀어지기"]
  },
  en: {
    eyebrow: "Nature Reset",
    title: "Like taking a deep breath near the forest.",
    description: "Birdsong, quiet light, and cool air. Meisoulife is a small resting place that returns a busy mind to the rhythm of nature.",
    points: ["Forest stillness", "Gentle breath", "A small step away from information"]
  }
} as const;

const testimonialCopy = {
  jp: {
    eyebrow: "小さな回復",
    title: "小さな変化は、静かに残ります。",
    items: [
      "1分だけでも、頭のざわつきが少し静かになりました。",
      "SNSを見続けたあとに戻る場所ができました。",
      "頑張れない日でも、ここなら続けられそうです。"
    ]
  },
  kr: {
    eyebrow: "작은 회복",
    title: "작은 변화는 조용히 남습니다.",
    items: [
      "1분만으로도 머리의 소음이 조금 잦아들었어요.",
      "SNS를 오래 본 뒤에 돌아올 곳이 생겼습니다.",
      "애쓰기 어려운 날에도 여기라면 이어갈 수 있을 것 같아요."
    ]
  },
  en: {
    eyebrow: "Small Relief",
    title: "Small changes stay quietly with you.",
    items: [
      "Even one minute softened the noise in my head.",
      "I found a place to return after too much social media.",
      "Even on hard days, this feels possible to continue."
    ]
  }
} as const;

const reassuranceCopy = {
  jp: {
    eyebrow: "安心して続ける",
    title: "無理なく、静かに続けられます。",
    items: ["いつでもやめられる", "無理なく続けられる", "ひとりじゃない"]
  },
  kr: {
    eyebrow: "안심하고 이어가기",
    title: "무리 없이, 조용히 이어갈 수 있습니다.",
    items: ["언제든 멈출 수 있어요", "무리 없이 이어갈 수 있어요", "혼자가 아니에요"]
  },
  en: {
    eyebrow: "A Safe Rhythm",
    title: "You can continue gently, without pressure.",
    items: ["You can stop anytime", "You can continue without force", "You are not alone"]
  }
} as const;

const sanctuaryCopy = {
  jp: {
    eyebrow: "静かな場所",
    title: "ひとりで耐える人生から、\n共に目覚める人生へ。",
    description: "自分を少し手放すとき、\n私たちはつながり、\n自由になっていく。",
    deep: "深く静けさに入るとき、\n生と死さえ、\nひとつの流れであることに気づく。",
    cta: "静かに感じてみる"
  },
  kr: {
    eyebrow: "고요한 장소",
    title: "혼자 버티는 삶에서,\n함께 깨어나는 삶으로.",
    description: "자신을 조금 내려놓을 때,\n우리는 연결되고,\n조금 더 자유로워집니다.",
    deep: "깊은 고요함에 들어갈 때,\n삶과 죽음마저\n하나의 흐름임을 느끼게 됩니다.",
    cta: "조용히 느껴보기"
  },
  en: {
    eyebrow: "Quiet Sanctuary",
    title: "From enduring alone,\ninto awakening together.",
    description: "When we loosen our grip on the self,\nwe begin to connect,\nand become a little more free.",
    deep: "When we enter deeper stillness,\neven life and death\ncan be felt as one flow.",
    cta: "Feel it quietly"
  }
} as const;

const aiAgeCopy = {
  jp: {
    eyebrow: "人間らしさを育てる",
    title: "AI時代だからこそ、\n人間らしさを。",
    description: "注意、感情、関係性、そして気づき。\nこれから大切になるものを、1分のリズムから育てていきます。",
    memberButton: "瞑想lifeメンバーになる",
    labels: ["現在の時間帯", "7日リズム", "戻る力"],
    tableShift: "変化"
  },
  kr: {
    eyebrow: "인간다움을 기르는 리듬",
    title: "AI 시대일수록,\n인간다움이 더 중요합니다.",
    description: "주의, 감정, 관계, 그리고 알아차림.\n앞으로 더 중요해질 것을 1분의 리듬에서부터 길러갑니다.",
    memberButton: "명상life 멤버 되기",
    labels: ["지금의 시간대", "7일 리듬", "돌아오는 힘"],
    tableShift: "변화"
  },
  en: {
    eyebrow: "Human OS Upgrade",
    title: "In the AI age,\nhumanity matters more.",
    description: "Attention, emotion, relationships, and awareness.\nGrow what matters most through a gentle one-minute rhythm.",
    memberButton: "Become a Meisoulife member",
    labels: ["time anchor", "7-day rhythm", "return"],
    tableShift: "Shift"
  }
} as const;

const giftCopy = {
  jp: {
    banner: "あなたに、1分の休息が届きました。",
    eyebrow: "Share a Quiet Minute",
    title: "大切な人に、1分の休息を贈る。",
    description: "言葉で励ますのが難しい日も、\n静かな1分なら届けられます。",
    button: "1分の休息を贈る",
    copied: "リンクをコピーしました。大切な人に届けてください。"
  },
  kr: {
    banner: "당신에게 1분의 휴식이 도착했습니다.",
    eyebrow: "조용한 1분 나누기",
    title: "소중한 사람에게, 1분의 휴식을 건네보세요.",
    description: "말로 위로하기 어려운 날에도,\n조용한 1분은 전할 수 있습니다.",
    button: "1분의 휴식 선물하기",
    copied: "링크를 복사했습니다. 소중한 사람에게 전해주세요."
  },
  en: {
    banner: "A one-minute rest has been sent to you.",
    eyebrow: "Share a Quiet Minute",
    title: "Offer a minute of rest to someone you care about.",
    description: "Even on days when words feel hard,\na quiet minute can still be shared.",
    button: "Share a one-minute rest",
    copied: "Link copied. Send it to someone you care about."
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
            className="relative z-50 inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            messageClassName="mt-2 text-sm text-white/52"
          />
        ) : null}
        {plan.key === "leader" ? (
          <CheckoutButton
            plan="growth"
            label={plan.cta}
            className="relative z-50 inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-white/90"
            messageClassName="mt-2 text-sm text-white/52"
          />
        ) : null}
        {plan.key === "premium" ? (
          <CheckoutButton
            plan="inner-circle"
            label={plan.cta}
            className="relative z-50 inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-full border border-gold/35 bg-gold/10 px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/15"
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
  const healing = healingCopy[language];
  const testimonials = testimonialCopy[language];
  const reassurance = reassuranceCopy[language];
  const sanctuary = sanctuaryCopy[language];
  const aiAge = aiAgeCopy[language];
  const gift = giftCopy[language];
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
  const [giftDelivered, setGiftDelivered] = useState(false);
  const [giftToast, setGiftToast] = useState("");

  useEffect(() => {
    setChallengeProgress(getChallengeRhythmProgress());
    setReturnRhythm(updateReturnRhythmVisit());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    setGiftDelivered(url.searchParams.get("gift") === "1min");
  }, []);

  useEffect(() => {
    if (!giftToast) {
      return;
    }

    const timer = window.setTimeout(() => setGiftToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [giftToast]);

  const gardenMood = returnRhythm.isCompletedToday ? "🙂" : returnRhythm.inactiveDays >= 2 ? "😔" : "😀";
  const liveSummary = useMemo(
    () => [
      site.home.rhythmSignals.anchors[returnRhythm.timeAnchor],
      `${challengeProgress.completedDays.length}/7`,
      `${Math.max(returnRhythm.streakCount, 1)}`
    ],
    [challengeProgress.completedDays.length, returnRhythm.streakCount, returnRhythm.timeAnchor, site.home.rhythmSignals.anchors]
  );

  function scrollToOneMinute() {
    if (typeof window === "undefined") {
      return;
    }

    document.querySelector("#one-minute-experience")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function scrollToRhythmChallenge() {
    if (typeof window === "undefined") {
      return;
    }

    document.querySelector("#rhythm-challenge")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  async function handleGiftShare() {
    if (typeof window === "undefined") {
      return;
    }

    const message = `最近少し疲れていませんか？\nこの1分、よかったら一緒にやってみませんか。\nhttps://www.meisoulife.com/?gift=1min`;

    try {
      await navigator.clipboard.writeText(message);
      setGiftToast(gift.copied);
    } catch (error) {
      console.error("[gift-share] failed to copy invite", error);
    }
  }

  return (
    <div className="pb-28">
      {giftDelivered ? (
        <section className="section-shell pt-6">
          <div className="rounded-[24px] border border-gold/20 bg-gold/[0.08] px-5 py-4 text-center text-sm font-medium text-gold">
            {gift.banner}
          </div>
        </section>
      ) : null}

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
                onClick={scrollToOneMinute}
                className="inline-flex min-h-[58px] items-center justify-center rounded-full bg-gold px-6 py-4 text-base font-semibold text-ink shadow-[0_18px_36px_rgba(212,186,117,0.22)] transition duration-300 hover:scale-[1.01] hover:bg-[#e7cd92]"
              >
                {hero.primary}
              </button>
              <button
                type="button"
                onClick={scrollToRhythmChallenge}
                className="inline-flex min-h-[58px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-4 text-base font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
              >
                {hero.secondary}
              </button>
            </div>

            <p className="text-sm leading-7 text-white/56">{hero.trust}</p>

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
                      {aiAge.labels[index]}
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

      <InstantMeditationSection copy={landing.instant} />

      <section className="section-shell mt-16 sm:mt-20">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.10),transparent_24%),linear-gradient(180deg,#0a1716_0%,#0d1824_54%,#08131d_100%)] p-5 shadow-[0_24px_80px_rgba(7,17,31,0.22)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-gold/84">{healing.eyebrow}</p>
              <h2 className="font-serif text-3xl leading-tight text-white sm:text-4xl">{healing.title}</h2>
              <p className="text-base leading-8 text-white/68 sm:text-lg">{healing.description}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {healing.points.map((point) => (
                  <span key={point} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/62">
                    {point}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[28px] border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
                alt={healing.title}
                className="h-[260px] w-full object-cover sm:h-[320px]"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,16,0.06),rgba(4,12,16,0.44))]" />
            </div>
          </div>
        </div>
      </section>

      <RhythmChallenge copy={landing.rhythmChallenge} />

      <section className="section-shell mt-16 sm:mt-20">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-7 shadow-[0_24px_80px_rgba(7,17,31,0.18)] sm:px-7 sm:py-9">
          <SectionHeading eyebrow={testimonials.eyebrow} title={testimonials.title} align="center" />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {testimonials.items.map((item) => (
              <article key={item} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm leading-8 text-white/76">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell mt-16 sm:mt-20">
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-7 shadow-[0_24px_80px_rgba(7,17,31,0.18)] sm:px-7 sm:py-9">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-gold/84">{gift.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">{gift.title}</h2>
            <p className="mt-4 whitespace-pre-line text-base leading-8 text-white/68 sm:text-lg">{gift.description}</p>
            <button
              type="button"
              onClick={handleGiftShare}
              className="mt-6 inline-flex min-h-[56px] items-center justify-center rounded-full border border-gold/20 bg-gold/[0.08] px-6 py-4 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12]"
            >
              {gift.button}
            </button>
            {giftToast ? <p className="mt-3 text-sm leading-7 text-white/58">{giftToast}</p> : null}
          </div>
        </div>
      </section>

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
                    {aiAge.tableShift}
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
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-8 sm:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-gold/84">{reassurance.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">{reassurance.title}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {reassurance.items.map((item) => (
                <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-medium text-white/78">
                  {item}
                </div>
              ))}
            </div>
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
            <p className="text-sm uppercase tracking-[0.32em] text-gold/82">{sanctuary.eyebrow}</p>
            <h2 className="mt-6 whitespace-pre-line font-serif text-3xl leading-[1.4] text-white sm:text-4xl sm:leading-[1.45] lg:text-5xl">
              {sanctuary.title}
            </h2>
            <p className="mt-6 whitespace-pre-line text-base leading-8 text-white/72 sm:text-lg sm:leading-9">
              {sanctuary.description}
            </p>

            <div className="mx-auto mt-8 max-w-2xl rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-5 backdrop-blur">
              <p className="whitespace-pre-line text-sm leading-8 text-white/56 sm:text-base">
                {sanctuary.deep}
              </p>
            </div>

            <div className="relative z-20 mt-8">
              <Link
                href="#one-minute-experience"
                className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-gold/20 bg-gold/[0.08] px-6 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12] hover:text-[#f1dfaf]"
              >
                {sanctuary.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-24">
        <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-10 text-center sm:px-10">
          <p className="text-sm uppercase tracking-[0.3em] text-gold/84">
            {language === "jp" ? "Human OS Upgrade" : language === "kr" ? "Human OS Upgrade" : "Human OS Upgrade"}
          </p>
          <h2 className="mt-4 whitespace-pre-line font-serif text-3xl text-white sm:text-4xl">
            {aiAge.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl whitespace-pre-line text-base leading-8 text-white/68">
            {aiAge.description}
          </p>
          <div className="relative z-20 mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              {aiAge.memberButton}
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
