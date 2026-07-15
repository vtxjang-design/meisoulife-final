"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "@/components/auth-provider";
import { InstantMeditationSection } from "@/components/instant-meditation-section";
import { ZeroGateSection } from "@/components/zero-gate-section";
import { useLocaleCopy } from "@/lib/i18n";
import { landingCopy } from "@/lib/landing-copy";
import { updateReturnRhythmVisit, type ReturnRhythmSnapshot } from "@/lib/return-rhythm";

const MEDITATION_MOOD_STORAGE_KEY = "meisoulife_instant_meditation_mood";
const fallbackHeroNatureVisual =
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80";

const heroNatureVisualByWeekday: Record<number, string> = {
  0: "/images/todays-nature/sunday.jpg",
  1: "/images/todays-nature/monday.jpg",
  2: "/images/todays-nature/tuesday.jpg",
  3: "/images/todays-nature/wednesday.jpg",
  4: "/images/todays-nature/thursday.jpg",
  5: "/images/todays-nature/friday.jpg",
  6: "/images/todays-nature/saturday.jpg"
} as const;

const sceneCopy = {
  jp: {
    state: {
      eyebrow: "MEISOU LIFE",
      title: "今日は、どんな回復が必要ですか。",
      description: "少し立ち止まり、今の自分を感じてみましょう。",
      cta: "1分の回復をはじめる",
      scrollCue: "静かな入口へ"
    },
    relief: {
      eyebrow: "RELIEF",
      title: "今、必要な回復を選んでください。",
      description: "いちばん近い入口から、静かに戻れます。",
      meditationTitle: "選んだ場所から、1分だけ静かに戻ります。"
    },
    rhythm: {
      eyebrow: "RHYTHM",
      title: "小さな回復を、毎日のリズムへ。",
      description: "一度きりではなく、また戻ってこられる流れを育てます。",
      guidedLabel: "7日間の小さな回復",
      guidedDescription: "一日一度、自分の感覚を取り戻す小さな旅",
      guidedCta: "7日間を始める",
      dailyLabel: "朝・昼・夜のリズム",
      dailyDescription: "一日を回復のリズムでつなぎます。",
      dailyCta: "BASICへ進む",
      dailyMoments: ["朝", "昼", "夜"]
    },
    return: {
      eyebrow: "RETURN",
      title: "一日一度、自分のリズムに戻る場所。",
      description: "回復は特別な時間ではなく、日々戻ってくるためのリズムです。",
      support: "Human Recovery Infrastructure",
      support2: "Life Rhythm OS",
      statusTitle: "今日の静かな記録",
      moodLabel: "昨日の気配",
      streakLabel: "戻ってくる歩み",
      memberLabel: "今の状態",
      moodFallback: "まだ静かな記録はありません。",
      firstStatus: "今日はここから始めましょう。",
      returningStatus: "また戻ってきてくれて、ありがとうございます。",
      completedStatus: "昨日の静かな1分が、今日にもつながっています。",
      waitingStatus: "ここには、また戻ってこられる場所があります。",
      guestState: "Free",
      freeState: "Free Member",
      paidState: "Paid Member",
      dayUnit: "日"
    },
    continue: {
      eyebrow: "CONTINUE",
      title: "毎日の回復を、続けていきましょう。",
      description: "明日も、ここでまた会いましょう。",
      support: "必要なときに、またこの場所へ戻ってこられます。",
      guestCta: "無料ではじめる",
      freeCta: "今日のリズムへ戻る",
      paidCta: "自分のリズムへ戻る",
      footnote: "必要なときに、またこの場所へ戻ってこられます。"
    },
    giftBanner: "あなたに、1分の休息が届きました。"
  },
  kr: {
    state: {
      eyebrow: "MEISOU LIFE",
      title: "오늘, 어떤 회복이 필요하세요?",
      description: "잠시 멈추고, 지금의 나를 바라봅니다.",
      cta: "1분 회복 시작하기",
      scrollCue: "조용한 입구로"
    },
    relief: {
      eyebrow: "RELIEF",
      title: "지금 필요한 회복을 선택하세요.",
      description: "가장 가까운 입구에서 조용히 돌아올 수 있습니다.",
      meditationTitle: "선택한 자리에서, 1분만 조용히 돌아옵니다."
    },
    rhythm: {
      eyebrow: "RHYTHM",
      title: "작은 회복을, 하루의 리듬으로.",
      description: "한 번의 기분 전환이 아니라 다시 돌아오는 흐름을 만듭니다.",
      guidedLabel: "7일간의 작은 회복",
      guidedDescription: "하루 한 번, 나의 감각을 다시 깨우는 여정",
      guidedCta: "7일 여정 시작하기",
      dailyLabel: "아침 · 낮 · 저녁 리듬",
      dailyDescription: "하루를 회복의 리듬으로 이어갑니다.",
      dailyCta: "BASIC으로 가기",
      dailyMoments: ["아침", "낮", "저녁"]
    },
    return: {
      eyebrow: "RETURN",
      title: "하루 한 번, 나의 리듬으로 돌아오는 곳.",
      description: "회복은 특별한 시간이 아니라, 다시 돌아오는 생활의 리듬입니다.",
      support: "Human Recovery Infrastructure",
      support2: "Life Rhythm OS",
      statusTitle: "오늘의 조용한 기록",
      moodLabel: "어제의 기분",
      streakLabel: "돌아오는 걸음",
      memberLabel: "현재 상태",
      moodFallback: "아직 남겨진 조용한 기록이 없습니다.",
      firstStatus: "오늘은 여기서 시작해봐요.",
      returningStatus: "다시 와주셔서 반가워요.",
      completedStatus: "어제의 조용한 1분이 오늘까지 이어지고 있어요.",
      waitingStatus: "여기에는 다시 돌아올 수 있는 자리가 있습니다.",
      guestState: "Free",
      freeState: "Free Member",
      paidState: "Paid Member",
      dayUnit: "일"
    },
    continue: {
      eyebrow: "CONTINUE",
      title: "매일의 회복을 이어가세요.",
      description: "내일도, 이곳에서 다시 만나요.",
      support: "필요할 때마다 다시 돌아올 수 있는 자리입니다.",
      guestCta: "무료로 시작하기",
      freeCta: "오늘의 리듬으로 돌아가기",
      paidCta: "나의 리듬으로 돌아가기",
      footnote: "필요할 때마다 다시 돌아올 수 있는 자리입니다."
    },
    giftBanner: "당신에게 1분의 휴식이 도착했습니다."
  },
  en: {
    state: {
      eyebrow: "MEISOU LIFE",
      title: "What kind of recovery do you need today?",
      description: "Pause for a moment and notice how you are now.",
      cta: "Start a 1-minute recovery",
      scrollCue: "Enter quietly"
    },
    relief: {
      eyebrow: "RELIEF",
      title: "Choose the recovery you need now.",
      description: "Begin from the quiet entrance that fits your state.",
      meditationTitle: "From the place you chose, return quietly for one minute."
    },
    rhythm: {
      eyebrow: "RHYTHM",
      title: "Turn a small recovery into a daily rhythm.",
      description: "Not a single moment of relief, but a pattern you can return to.",
      guidedLabel: "7-Day Recovery Journey",
      guidedDescription: "A small daily journey back to your senses",
      guidedCta: "Begin the 7-day journey",
      dailyLabel: "Morning · Daytime · Evening Rhythm",
      dailyDescription: "Carry recovery through the rhythm of your day.",
      dailyCta: "Enter BASIC",
      dailyMoments: ["Morning", "Day", "Evening"]
    },
    return: {
      eyebrow: "RETURN",
      title: "A place to return to your rhythm, once a day.",
      description: "Recovery is not a special event. It is a rhythm we return to.",
      support: "Human Recovery Infrastructure",
      support2: "Life Rhythm OS",
      statusTitle: "A quiet note for today",
      moodLabel: "Yesterday's feeling",
      streakLabel: "Return rhythm",
      memberLabel: "Current state",
      moodFallback: "No quiet note has been left here yet.",
      firstStatus: "We can begin from here today.",
      returningStatus: "You came back. That matters.",
      completedStatus: "Yesterday's quiet minute is still with you today.",
      waitingStatus: "This is a place you can return to again.",
      guestState: "Free",
      freeState: "Free Member",
      paidState: "Paid Member",
      dayUnit: "days"
    },
    continue: {
      eyebrow: "CONTINUE",
      title: "Continue your daily recovery.",
      description: "Let's meet here again tomorrow.",
      support: "Whenever you need it, this place is here to return to.",
      guestCta: "Start free",
      freeCta: "Return to today's rhythm",
      paidCta: "Return to my rhythm",
      footnote: "Whenever you need it, this place is here to return to."
    },
    giftBanner: "A one-minute rest has been sent to you."
  }
} as const;

const sceneIds = ["state", "relief", "rhythm", "return", "continue"] as const;
type SceneId = (typeof sceneIds)[number];

function HomeScene({
  id,
  className = "",
  children
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`snap-start scroll-mt-28 sm:scroll-mt-32 ${className}`}>
      {children}
    </section>
  );
}

function SceneHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-3xl ${alignment}`}>
      <p className="text-xs uppercase tracking-[0.32em] text-gold/78 sm:text-sm">{eyebrow}</p>
      <h2 className="mt-4 text-balance font-serif text-[clamp(2rem,5vw,4rem)] leading-[1.12] text-white">
        {title}
      </h2>
      {description ? <p className="mt-4 max-w-[34rem] text-pretty text-base leading-8 text-white/64 sm:text-lg">{description}</p> : null}
    </div>
  );
}

function ScrollCue({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium tracking-[0.18em] text-white/56 transition hover:bg-white/[0.06] hover:text-white"
    >
      <span>{label}</span>
      <span className="animate-meditation-float motion-reduce:animate-none">↓</span>
    </button>
  );
}

function RhythmEntryCard({
  label,
  description,
  cta,
  href,
  tones,
  children
}: {
  label: string;
  description: string;
  cta: string;
  href: string;
  tones: string;
  children?: React.ReactNode;
}) {
  return (
    <article className={`flex h-full flex-col rounded-[32px] border px-6 py-7 shadow-[0_20px_80px_rgba(7,17,31,0.14)] sm:px-8 sm:py-8 ${tones}`}>
      <p className="text-sm uppercase tracking-[0.28em] text-gold/78">{label}</p>
      <p className="mt-4 max-w-[24rem] text-base leading-8 text-white/72 sm:text-lg">{description}</p>
      {children ? <div className="mt-8">{children}</div> : null}
      <div className="mt-8">
        <Link
          href={href}
          className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
        >
          {cta}
        </Link>
      </div>
    </article>
  );
}

function SceneDots({
  activeScene,
  onSelect
}: {
  activeScene: SceneId;
  onSelect: (scene: SceneId) => void;
}) {
  return (
    <nav
      aria-label="Homepage scenes"
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 xl:flex xl:flex-col xl:gap-3"
    >
      {sceneIds.map((scene) => {
        const isActive = scene === activeScene;

        return (
          <button
            key={scene}
            type="button"
            aria-label={`Go to ${scene} scene`}
            aria-pressed={isActive}
            onClick={() => onSelect(scene)}
            className={`h-2.5 w-2.5 rounded-full border transition duration-200 ${
              isActive
                ? "border-gold/80 bg-gold/90 shadow-[0_0_0_6px_rgba(212,186,117,0.08)]"
                : "border-white/28 bg-white/18 hover:border-white/50 hover:bg-white/35"
            }`}
          />
        );
      })}
    </nav>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { authResolved, isLoggedIn, memberState } = useAuthState();
  const landing = useLocaleCopy(landingCopy);
  const copy = useLocaleCopy(sceneCopy);
  const [giftDelivered, setGiftDelivered] = useState(false);
  const [lastMoodLabel, setLastMoodLabel] = useState("");
  const [heroNatureSrc, setHeroNatureSrc] = useState<string>(fallbackHeroNatureVisual);
  const [heroNatureImageFailed, setHeroNatureImageFailed] = useState(false);
  const [activeScene, setActiveScene] = useState<SceneId>("state");
  const [hasScrolledPastHero, setHasScrolledPastHero] = useState(false);
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
    setReturnRhythm(updateReturnRhythmVisit());
  }, []);

  useEffect(() => {
    const weekdayIndex = new Date().getDay();
    setHeroNatureSrc(heroNatureVisualByWeekday[weekdayIndex] ?? fallbackHeroNatureVisual);
    setHeroNatureImageFailed(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    setGiftDelivered(url.searchParams.get("gift") === "1min");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(MEDITATION_MOOD_STORAGE_KEY);

      if (!stored) {
        setLastMoodLabel("");
        return;
      }

      const parsed = JSON.parse(stored) as { moodKey?: string };
      const moodLabel = landing.instant.moods.find((item) => item.key === parsed.moodKey)?.label ?? "";
      setLastMoodLabel(moodLabel);
    } catch (error) {
      console.error("[home] failed to read last meditation mood", error);
      setLastMoodLabel("");
    }
  }, [landing.instant.moods]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const topEntry = visibleEntries[0];
        const scene = topEntry?.target.getAttribute("data-scene-id") as SceneId | null;

        if (scene) {
          setActiveScene(scene);
        }
      },
      {
        threshold: [0.35, 0.55, 0.75],
        rootMargin: "-18% 0px -18% 0px"
      }
    );

    sceneIds.forEach((scene) => {
      const node = document.getElementById(scene);
      if (node) {
        node.setAttribute("data-scene-id", scene);
        observer.observe(node);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleScroll = () => {
      setHasScrolledPastHero(window.scrollY > 56);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function scrollToScene(scene: SceneId) {
    if (typeof window === "undefined") {
      return;
    }

    document.getElementById(scene)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function scrollToZeroGate() {
    if (typeof window === "undefined") {
      return;
    }

    document.querySelector("#zero-gate")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function scrollToOneMinute() {
    if (typeof window === "undefined") {
      return;
    }

    document.querySelector("#one-minute-experience")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function handleZeroGateEnter(gateKey: string) {
    if (typeof window !== "undefined") {
      const payload = {
        gateKey,
        enteredAt: new Date().toISOString()
      };

      window.localStorage.setItem("meisoulife_zero_gate", JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent("meisoulife:zero-gate-change", { detail: payload }));
    }

    scrollToOneMinute();
  }

  function handleContinueCta() {
    if (!authResolved || !isLoggedIn) {
      router.push("/signup");
      return;
    }

    router.push("/program/basic");
  }

  const returnStatusMessage = !returnRhythm.lastVisitDate
    ? copy.return.firstStatus
    : returnRhythm.isCompletedToday
      ? copy.return.completedStatus
      : returnRhythm.isReturningToday
        ? copy.return.returningStatus
        : copy.return.waitingStatus;
  const memberLabel = !authResolved || !isLoggedIn ? copy.return.guestState : memberState === "paid" ? copy.return.paidState : copy.return.freeState;
  const streakLabel =
    Math.max(returnRhythm.streakCount, 1) <= 1
      ? `1 ${copy.return.dayUnit}`
      : `${Math.max(returnRhythm.streakCount, 1)} ${copy.return.dayUnit}`;
  const continueLabel = !authResolved || !isLoggedIn ? copy.continue.guestCta : memberState === "paid" ? copy.continue.paidCta : copy.continue.freeCta;

  return (
    <div className="pb-24">
      {giftDelivered ? (
        <section className="section-shell pt-6">
          <div className="rounded-[24px] border border-gold/20 bg-gold/[0.08] px-5 py-4 text-center text-sm font-medium text-gold">
            {copy.giftBanner}
          </div>
        </section>
      ) : null}

      <div className="relative snap-y snap-proximity">
        <SceneDots activeScene={activeScene} onSelect={scrollToScene} />
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.1),transparent_30%),linear-gradient(180deg,rgba(5,14,24,0.22),rgba(5,14,24,0))]" />

        <HomeScene id="state" className="section-shell pt-6 sm:pt-10">
          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,18,29,0.86),rgba(7,18,29,0.72))] px-6 py-10 shadow-[0_28px_100px_rgba(7,17,31,0.22)] sm:px-8 sm:py-14 lg:min-h-[calc(100svh-10rem)] lg:px-12 lg:py-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-[6%] top-[8%] h-28 w-28 rounded-full bg-gold/[0.12] blur-[80px] motion-reduce:hidden" />
              <div className="absolute right-[8%] top-[18%] h-36 w-36 rounded-full bg-emerald-200/[0.08] blur-[90px] motion-reduce:hidden" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,18,0.02),rgba(4,12,18,0.28)_52%,rgba(4,12,18,0.42))]" />
            </div>

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.34em] text-gold/78 sm:text-sm">{copy.state.eyebrow}</p>
                <h1 className="mt-5 max-w-[12ch] text-balance font-serif text-[clamp(2.5rem,7vw,5.2rem)] leading-[1.06] text-white">
                  {copy.state.title}
                </h1>
                <p className="mt-5 max-w-[26rem] text-pretty text-base leading-8 text-white/66 sm:text-lg">
                  {copy.state.description}
                </p>
                <div className="mt-8 flex flex-col items-start gap-4">
                  <button
                    type="button"
                    onClick={scrollToZeroGate}
                    className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink shadow-[0_18px_40px_rgba(212,186,117,0.18)] transition hover:bg-[#e7cd92]"
                  >
                    {copy.state.cta}
                  </button>
                  <div className={`transition duration-500 ${hasScrolledPastHero ? "opacity-0" : "opacity-100"}`}>
                    <ScrollCue label={copy.state.scrollCue} onClick={scrollToZeroGate} />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#09131c]">
                <img
                  src={heroNatureImageFailed ? fallbackHeroNatureVisual : heroNatureSrc}
                  alt=""
                  aria-hidden="true"
                  onError={() => setHeroNatureImageFailed(true)}
                  className="h-[20rem] w-full object-cover object-center opacity-[0.82] brightness-[0.74] sm:h-[24rem] lg:h-[34rem]"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,18,24,0.14),rgba(5,18,24,0.28)_44%,rgba(5,18,24,0.58)_100%),radial-gradient(circle_at_20%_18%,rgba(255,243,214,0.12),transparent_24%),radial-gradient(circle_at_78%_24%,rgba(125,208,195,0.08),transparent_28%)]" />
              </div>
            </div>
          </div>
        </HomeScene>

        <HomeScene id="relief" className="mt-12 bg-[linear-gradient(180deg,rgba(218,228,216,0.03),rgba(218,228,216,0)_100%)] py-14 sm:mt-16 sm:py-18">
          <div className="section-shell">
            <SceneHeading
              eyebrow={copy.relief.eyebrow}
              title={copy.relief.title}
              description={copy.relief.description}
            />
          </div>
          <ZeroGateSection onEnterGate={handleZeroGateEnter} />
          <div className="section-shell mt-12 sm:mt-16">
            <p className="max-w-2xl text-sm uppercase tracking-[0.24em] text-white/42 sm:text-base">{copy.relief.meditationTitle}</p>
          </div>
          <InstantMeditationSection copy={landing.instant} />
        </HomeScene>

        <HomeScene id="rhythm" className="mt-12 bg-[linear-gradient(180deg,rgba(212,186,117,0.05),rgba(212,186,117,0)_100%)] py-14 sm:mt-16 sm:py-18">
          <div className="section-shell">
            <SceneHeading
              eyebrow={copy.rhythm.eyebrow}
              title={copy.rhythm.title}
              description={copy.rhythm.description}
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <RhythmEntryCard
                label={copy.rhythm.guidedLabel}
                description={copy.rhythm.guidedDescription}
                cta={copy.rhythm.guidedCta}
                href="/rhythm-journey"
                tones="border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))]"
              >
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-sm leading-7 text-white/62">{copy.rhythm.guidedDescription}</p>
                </div>
              </RhythmEntryCard>

              <RhythmEntryCard
                label={copy.rhythm.dailyLabel}
                description={copy.rhythm.dailyDescription}
                cta={copy.rhythm.dailyCta}
                href="/program/basic"
                tones="border-gold/20 bg-[linear-gradient(180deg,rgba(212,186,117,0.12),rgba(255,255,255,0.03))]"
              >
                <div className="grid grid-cols-3 gap-3">
                  {copy.rhythm.dailyMoments.map((moment) => (
                    <div
                      key={moment}
                      className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-5 text-center text-sm font-medium text-white/78"
                    >
                      {moment}
                    </div>
                  ))}
                </div>
              </RhythmEntryCard>
            </div>
          </div>
        </HomeScene>

        <HomeScene id="return" className="mt-12 bg-[linear-gradient(180deg,rgba(11,21,32,0.32),rgba(11,21,32,0)_100%)] py-14 sm:mt-16 sm:py-18">
          <div className="section-shell">
            <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,19,28,0.88),rgba(9,19,28,0.72))] px-6 py-8 shadow-[0_24px_80px_rgba(7,17,31,0.18)] sm:px-8 sm:py-10">
              <SceneHeading
                eyebrow={copy.return.eyebrow}
                title={copy.return.title}
                description={copy.return.description}
              />

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.22em] text-gold/78">
                  {copy.return.support}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/56">
                  {copy.return.support2}
                </span>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/42">{copy.return.statusTitle}</p>
                  <p className="mt-4 max-w-[36rem] text-lg leading-8 text-white/82">{returnStatusMessage}</p>
                  <p className="mt-5 text-sm leading-7 text-white/56">
                    {lastMoodLabel ? `${copy.return.moodLabel} · ${lastMoodLabel}` : copy.return.moodFallback}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/42">{copy.return.streakLabel}</p>
                    <p className="mt-3 font-serif text-3xl text-white">{streakLabel}</p>
                  </div>
                  <div className="rounded-[28px] border border-gold/18 bg-gold/[0.08] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-gold/82">{copy.return.memberLabel}</p>
                    <p className="mt-3 text-base text-white/84">{memberLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HomeScene>

        <HomeScene id="continue" className="mt-12 pb-4 pt-14 sm:mt-16 sm:pt-18">
          <div className="section-shell">
            <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-10 shadow-[0_24px_80px_rgba(7,17,31,0.18)] sm:px-10 sm:py-12">
              <SceneHeading
                eyebrow={copy.continue.eyebrow}
                title={copy.continue.title}
                description={copy.continue.description}
                align="center"
              />
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleContinueCta}
                  className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-gold px-7 py-4 text-sm font-semibold text-ink transition hover:bg-[#e7cd92]"
                >
                  {continueLabel}
                </button>
              </div>
              <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-7 text-white/54">{copy.continue.support}</p>
            </div>
          </div>
        </HomeScene>
      </div>
    </div>
  );
}
