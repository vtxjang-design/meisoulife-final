"use client";

import OneMinuteMeditation from "@/components/one-minute-meditation";
import {
  CHALLENGE_RHYTHM_EVENT,
  getChallengeRhythmProgress,
  type ChallengeRhythmProgress
} from "@/lib/challenge-rhythm";
import { challengeDays } from "@/lib/content";
import { updateReturnRhythmVisit, type ReturnRhythmSnapshot } from "@/lib/return-rhythm";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Language = "ja" | "ko" | "en";
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
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

type PricingCardProps = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

const basicCheckoutUrl =
  process.env.NEXT_PUBLIC_STRIPE_BASIC_CHECKOUT_URL || "https://buy.stripe.com/fZu5kC443bVL4gWfMa43S05";

const languageButtons: { key: Language; label: string }[] = [
  { key: "ja", label: "JP" },
  { key: "ko", label: "KR" },
  { key: "en", label: "EN" }
];

const moods: Mood[] = ["😀", "🙂", "😐", "😔", "😣"];

const translations = {
  ja: {
    heroEyebrow: "Coexistence Meditation Ecosystem",
    heroPrimary: "今すぐ1分瞑想",
    heroSecondary: "7日間、共に始める",
    heroTertiary: "メンバーとして続ける",
    checkInTitle: "今日の心チェックイン",
    checkInDescription: "今の気分をひとつ選ぶだけで大丈夫です。小さな記録が、毎日のリズムを整えます。",
    checkInConfirmation: "今日の状態を記録しました",
    liveTitle: "今、18人が一緒に瞑想中",
    liveDescription: "静かなつながりが、世界のあちこちで同時に育っています。",
    challengeTitle: "7日チャレンジ",
    challengeDescription: "まずはDay 1から。短くても、毎日戻ってこられる習慣をつくります。",
    challengeProgress: "Day 1 / 7",
    challengeButton: "7日間、共に始める",
    finalPrimary: "今すぐ1分瞑想",
    finalSecondary: "7日間、共に始める",
    finalTertiary: "メンバーとして続ける",
    meditationOpen: "今すぐ1分瞑想"
  },
  ko: {
    heroEyebrow: "Coexistence Meditation Ecosystem",
    heroPrimary: "지금 1분 명상",
    heroSecondary: "7일 함께 시작하기",
    heroTertiary: "멤버로 이어가기",
    checkInTitle: "오늘 마음 체크인",
    checkInDescription: "지금의 기분을 하나만 고르면 됩니다. 작은 기록이 매일의 리듬을 정리해줍니다.",
    checkInConfirmation: "오늘의 상태를 기록했습니다",
    liveTitle: "지금 18명이 함께 명상 중",
    liveDescription: "조용한 연결이 세계 곳곳에서 동시에 자라고 있습니다.",
    challengeTitle: "7일 챌린지",
    challengeDescription: "우선 Day 1부터. 짧아도 매일 다시 돌아오는 습관을 만듭니다.",
    challengeProgress: "Day 1 / 7",
    challengeButton: "7일 함께 시작하기",
    finalPrimary: "지금 1분 명상",
    finalSecondary: "7일 함께 시작하기",
    finalTertiary: "멤버로 이어가기",
    meditationOpen: "지금 바로 1분 명상"
  },
  en: {
    heroEyebrow: "Coexistence Meditation Ecosystem",
    heroPrimary: "Today's 1 min Meditation",
    heroSecondary: "Begin 7 Days Together",
    heroTertiary: "Continue as a Member",
    checkInTitle: "Today’s Mind Check-in",
    checkInDescription: "Choose one feeling for today. A small record helps your rhythm settle each day.",
    checkInConfirmation: "Your state has been recorded",
    liveTitle: "18 people are meditating together now",
    liveDescription: "A quiet sense of connection is growing across the world in real time.",
    challengeTitle: "7-Day Challenge",
    challengeDescription: "Start with Day 1. Even a short practice can become a daily returning rhythm.",
    challengeProgress: "Day 1 / 7",
    challengeButton: "Begin 7 Days Together",
    finalPrimary: "Today's 1 min Meditation",
    finalSecondary: "Begin 7 Days Together",
    finalTertiary: "Continue as a Member",
    meditationOpen: "Start 1-Min Meditation Now"
  }
} as const;

const testimonials = [
  {
    name: "美香さん・49歳",
    quote: "朝3分だけなのに、仕事前の呼吸が整って気持ちの荒れが減りました。"
  },
  {
    name: "健一さん・57歳",
    quote: "眠る前の音声があるだけで、頭の中の騒がしさがやわらぎます。"
  },
  {
    name: "由紀さん・52歳",
    quote: "LINEで仲間がいるので、ひとりで頑張る感じがなく続けやすいです。"
  }
] as const;

const faqItems = [
  {
    question: "瞑想が初めてでも大丈夫ですか？",
    answer: "はい。朝3分の音声ガイドから始めるので、経験がなくても無理なく続けられます。"
  },
  {
    question: "LINEに入らなくても参加できますか？",
    answer: "はい。ただし、無料チャレンジのリマインドや仲間とのつながりはLINE参加の方が受け取りやすくなります。"
  },
  {
    question: "有料会員になると何が変わりますか？",
    answer: "AIコーチ利用上限が外れ、会員向けコミュニティ、ライブイベント、回復音声、継続サポートが解放されます。"
  },
  {
    question: "宗教的な内容ですか？",
    answer: "いいえ。瞑想lifeは日常のストレスケアと心の回復に焦点を当てた実践プラットフォームです。"
  }
] as const;

const retreatLocations = [
  { place: "日本 伊勢", title: "浄化と始まり", description: "静かな節目をつくる、日本の再出発リトリート。" },
  { place: "アメリカ セドナ", title: "グローバル覚醒リトリート", description: "大地の広さの中で、視点を解き放つ体験。" },
  { place: "韓国 済州・国学園", title: "哲学とリーダー教育", description: "実践と思想をつなぐ、深い学びの拠点。" },
  { place: "ニュージーランド Earth Village", title: "自然治癒と共生生活", description: "自然と調和しながら、本来のリズムを思い出す。" },
  { place: "ヨーロッパ テネレフェ", title: "欧州リトリート拠点", description: "光と風の中で、静けさを取り戻す滞在型プログラム。" }
] as const;

const coexistenceSteps = [
  {
    step: "01",
    title: "今日の1分瞑想",
    description: "まずは1分、自分に戻る静けさを体験します。"
  },
  {
    step: "02",
    title: "無料7日チャレンジ",
    description: "朝の1分、夜の3分を重ねながら、やさしい生活リズムをつくります。"
  },
  {
    step: "03",
    title: "LINEコミュニティ",
    description: "毎日、共に目覚め直すための声かけとリマインドを受け取ります。"
  },
  {
    step: "04",
    title: "月額メンバーシップ",
    description: "ひとりの回復を、共に生きる習慣へ育てていきます。"
  },
  {
    step: "05",
    title: "リーダー成長",
    description: "周りを明るくし、共生文化を支える人へ成長していきます。"
  }
] as const;

const planCards: PricingPlan[] = [
  {
    key: "free",
    name: "Free",
    price: "¥0",
    description: "まずは7日間、やさしく整える。",
    features: ["7日チャレンジ", "LINE参加リンク", "AIコーチ 1日3回まで"],
    cta: "無料で始める",
    href: "/challenge"
  },
  {
    key: "basic",
    name: "Basic",
    price: "¥1,000/月",
    description: "毎日の心の回復を、無理なく続ける。",
    features: ["AIコーチ無制限", "会員コミュニティ", "ライブ瞑想", "毎朝の習慣設計"],
    cta: "Basicで始める",
    href: basicCheckoutUrl,
    featured: true
  },
  {
    key: "leader",
    name: "Growth",
    price: "¥3,000/月",
    description: "実践を深め、日々の安定をしっかり育てる。",
    features: ["少人数サークル", "優先イベント案内", "週次の深い実践ガイド", "実践記録レビュー"],
    cta: "Growthに進む",
    href: "/pricing"
  },
  {
    key: "premium",
    name: "Inner Circle",
    price: "¥10,000/月",
    description: "もっと深く、静かに、自分を整える。",
    features: ["月次プレミアムセッション", "リトリート優先案内", "個別サポート導線", "Inner Circle専用アクセス"],
    cta: "Inner Circleを見る",
    href: "/pricing"
  }
];

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
  const [language, setLanguage] = useState<Language>("ja");
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [meditationOpen, setMeditationOpen] = useState(false);
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
  const t = useMemo(() => translations[language], [language]);
  const todayRhythm = challengeDays.find((day) => day.day === challengeProgress.currentDay) ?? challengeDays[0];
  const hasStartedChallenge = challengeProgress.completedDays.length > 0;
  const hasCompletedChallenge = challengeProgress.completedDays.length >= challengeDays.length;

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

  return (
    <div className="pb-24">
      <section className="section-shell pt-16 sm:pt-24">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm uppercase tracking-[0.34em] text-gold">{t.heroEyebrow}</p>
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

            <h1 className="max-w-4xl font-serif text-5xl leading-tight text-white sm:text-6xl">
              今、静かに目覚める。
              <br />
              ひとりの瞑想から、共に生きる文化へ。
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-white/72 sm:text-xl">
              朝の1分、夜の3分。自分に戻る小さなリズムが、共に生きる力を育てます。
              瞑想lifeは、回復・習慣・つながり・成長・リーダーシップを一つにつなぐ共生リズムの場です。
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => setMeditationOpen(true)}
                className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
              >
                {t.heroPrimary}
              </button>
              <Link
                href="/challenge"
                className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/15 px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-white/10"
              >
                {t.heroSecondary}
              </Link>
            </div>
          </div>

          <div className="premium-card overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
              alt="静かな朝の瞑想風景"
              className="h-full min-h-[420px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section-shell mt-8">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-gold">Today's Rhythm</p>
              {!hasCompletedChallenge ? (
                <>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    Day {todayRhythm.day} — {todayRhythm.title}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-white/68">
                    {hasStartedChallenge
                      ? todayRhythm.focus
                      : "まだ始まっていない方も、今日は1分だけ自分に戻るところから始められます。"}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-3 text-2xl font-semibold text-white">このリズムを続けています</h2>
                  <p className="mt-2 text-sm leading-7 text-white/68">
                    7日間を越えても、静けさは毎日の中でやさしく続いていきます。
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMeditationOpen(true)}
              className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-gold/35 bg-gold/10 px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/15"
            >
              今日のリズムを始める
            </button>
          </div>
        </div>
      </section>

      <section className="section-shell mt-6">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-gold">戻る場所</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">毎日同じ場所に戻るだけで、リズムは自然に整います</h2>
              <p className="mt-2 text-sm leading-7 text-white/68">
                {returnRhythm.isReturningToday
                  ? "おかえりなさい。今日も1分だけ整えましょう"
                  : "慌ただしい日でも、戻る場所がひとつあるだけで呼吸は静かに整っていきます。"}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/62">
                {returnRhythm.streakCount > 0 ? `${returnRhythm.streakCount}日つづいています` : "今日から静かに始められます"}
              </div>
              <button
                type="button"
                onClick={() => setMeditationOpen(true)}
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-gold/35 bg-gold/10 px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/15"
              >
                今日の1分を始める
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-10 grid gap-4 lg:grid-cols-3">
        <article className="rounded-[28px] border border-white/70 bg-gradient-to-br from-[#fffdf8] via-[#f7f5ee] to-[#eef6ef] p-5 text-ink shadow-[0_18px_48px_rgba(7,17,31,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(7,17,31,0.14)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-moss">Daily Rhythm</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">{t.checkInTitle}</h2>
            </div>
            <div className="rounded-full border border-moss/20 bg-moss/10 px-3 py-1 text-xs font-medium text-moss">Local</div>
          </div>
          <p className="mt-4 text-sm leading-7 text-zinc-600">{t.checkInDescription}</p>
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
          <div className="mt-4 min-h-6 text-sm font-medium text-emerald-700">{selectedMood ? t.checkInConfirmation : ""}</div>
        </article>

        <article className="rounded-[28px] border border-white/70 bg-gradient-to-br from-[#fffdf8] via-[#f7f5ee] to-[#eef6ef] p-5 text-ink shadow-[0_18px_48px_rgba(7,17,31,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(7,17,31,0.14)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-moss">Live Together</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">{t.liveTitle}</h2>
            </div>
            <div className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              Live-ready
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-zinc-600">{t.liveDescription}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-ink sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-center shadow-sm">
              <span className="text-base">🇯🇵</span>
              <span className="ml-2 font-semibold">8</span>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-center shadow-sm">
              <span className="text-base">🇰🇷</span>
              <span className="ml-2 font-semibold">5</span>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-center shadow-sm">
              <span className="text-base">🇺🇸</span>
              <span className="ml-2 font-semibold">3</span>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-center shadow-sm">
              <span className="text-base">🇳🇿</span>
              <span className="ml-2 font-semibold">2</span>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-white/70 bg-gradient-to-br from-[#fffdf8] via-[#f7f5ee] to-[#eef6ef] p-5 text-ink shadow-[0_18px_48px_rgba(7,17,31,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(7,17,31,0.14)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-moss">Challenge</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">7日間、共に始める</h2>
            </div>
            <div className="rounded-full border border-gold/30 bg-[#fff7e6] px-3 py-1 text-xs font-medium text-[#9a7630]">
              {t.challengeProgress}
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-zinc-600">
            1分の静けさを7日間重ねると、呼吸、感情、睡眠、感謝、関係、集中、人生の方向性までゆっくり整い始めます。
          </p>
          <Link
            href="/challenge"
            className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-navy sm:w-auto sm:min-w-[220px]"
          >
            {t.challengeButton}
          </Link>
        </article>
      </section>

      <section className="section-shell mt-24">
        <SectionHeading
          eyebrow="7-Day Rhythm"
          title="7日間、共に目覚めるリズム"
          description="個人の回復を、共に生きる力へ。1日ごとの小さな変化が、生活の質と周りへの光を育てます。"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {challengeDays.map((day) => (
            <article key={day.day} className="premium-card rounded-lg p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Day {day.day}</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{day.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/72">{day.focus}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-[24px] border border-gold/20 bg-gold/10 p-6 text-center">
          <p className="text-2xl font-semibold text-white">このリズムを、ひとりで終わらせない。</p>
          <p className="mt-3 text-base text-white/72">瞑想lifeメンバーとして続ける。</p>
        </div>
      </section>

      <section className="section-shell mt-24 grid gap-6 md:grid-cols-3">
        <div className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Why now</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">今、心を整えることが共生の土台になる</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">
            情報と刺激が強い時代だからこそ、自分を落ち着かせる力が人との関わり方を変えます。朝3分の静けさは、判断力、睡眠、感情の回復力、そしてやさしい共同体づくりの土台になります。
          </p>
        </div>
        <div className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Challenge</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">7日間で、自分を責めない習慣をつくる</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">
            毎朝3分の音声、LINEリマインド、簡単な達成記録で、忙しい人でも無理なく始められます。
          </p>
        </div>
        <div className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">AI Coach</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">乱れた瞬間に、ひとりにしない</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">
            疲れた、不安、眠れない。そんな日のために、3分で呼吸と気持ちを整えるAIコーチを用意しました。
          </p>
        </div>
      </section>

      <section className="section-shell mt-24">
        <SectionHeading
          eyebrow="Platform Flow"
          title="共生リズム・プラットフォームの流れ"
          description="瞑想lifeは、瞑想を売る場ではありません。毎日、共に目覚める生活リズムを育て、個人の回復から共生文化、地球経営へ進む場です。"
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-5">
          {coexistenceSteps.map((item) => (
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
          eyebrow="Testimonials"
          title="続けている人の声"
          description="日本向けローンチを想定した、40〜60代中心の共感コピーで構成しています。"
          align="center"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
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
          eyebrow="Membership"
          title="月額¥1,000から始める会員制度"
          description="無料チャレンジから自然に有料継続へ移れるよう、価値と導線をシンプルに設計しています。"
        />
        <div className="mt-6 flex justify-start">
          <a
            href={basicCheckoutUrl}
            className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-gold/40 px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:scale-[1.02] hover:bg-gold/10"
          >
            Become Member
          </a>
        </div>
        <div className="mt-10 grid gap-6 xl:grid-cols-4">
          {planCards.map((plan) => (
            <PricingCard
              key={plan.key}
              name={plan.name}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              cta={plan.cta}
              href={plan.href}
              featured={plan.featured}
            />
          ))}
        </div>
      </section>

      <section className="section-shell mt-24">
        <SectionHeading
          eyebrow="Global Retreat Network"
          title="世界につながるリトリート導線"
          description="日本での日常実践から、世界各地の深い体験へ。瞑想lifeは長期的な成長動線まで設計します。"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {retreatLocations.map((retreat) => (
            <article key={retreat.place} className="premium-card rounded-lg p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">{retreat.place}</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{retreat.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/72">{retreat.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell mt-24">
        <SectionHeading eyebrow="FAQ" title="よくある質問" />
        <div className="mt-10 grid gap-4">
          {faqItems.map((item) => (
            <article key={item.question} className="premium-card rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-white/72">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell mt-24">
        <div className="premium-card rounded-lg p-8 text-center sm:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Start now</p>
          <h2 className="mt-4 font-serif text-4xl text-white">回復から、つながりへ。つながりから、共生へ。</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/72">
            朝3分の呼吸から、LINEコミュニティ、AIコーチ、月額会員、リーダー育成まで。自分を整えることが、周りと共に生きる力につながる設計です。
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => setMeditationOpen(true)}
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
            >
              {t.finalPrimary}
            </button>
            <Link
              href="/challenge"
              className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/15 px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-white/10"
            >
              {t.finalSecondary}
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-4 text-sm font-semibold text-emerald-200 transition duration-300 hover:scale-[1.02] hover:bg-emerald-400/15"
            >
              {t.finalTertiary}
            </Link>
          </div>
        </div>
      </section>

      <OneMinuteMeditation open={meditationOpen} onClose={() => setMeditationOpen(false)} />
    </div>
  );
}
