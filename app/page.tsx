"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthState } from "@/components/auth-provider";
import { InstantMeditationSection } from "@/components/instant-meditation-section";
import { ZeroGateSection } from "@/components/zero-gate-section";
import { useLocaleCopy } from "@/lib/i18n";
import { landingCopy } from "@/lib/landing-copy";

const heroWindowVisual =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";

const homeCopy = {
  jp: {
    giftBanner: "あなたに、1分の休息が届きました。",
    hero: {
      headline: "今日は、\n\nどんな回復が必要ですか？",
      subtitle: "Human Recovery Operating System",
      description: "AI時代に、\n人間本来のリズムへ還る場所。",
      primaryCta: "1分リセットを始める",
      secondaryCta: "7日間のリズム回復"
    },
    recovery: {
      eyebrow: "Recovery First",
      title: "まずは、\n今の自分に合う\n入口を選びましょう。",
      description: "一つ選ぶだけで、\n静かな60秒が始まります。",
      meditationLabel: "一つ選ぶだけで、\n静かな60秒が始まります。"
    },
    chapters: {
      continueJourney: "回復の旅を続ける",
      previous: "← 前の章",
      next: "次の章 →",
      close: "回復へ戻る",
      position: "章",
      exploreHros: "HROSをもっと知る",
      membership: "BASIC Membershipへ",
      recovery: {
        identity: "RECOVERY",
        headline: "回復は、\n終わりではなく始まりです。",
        supporting: "本来の自分へ戻る、最初の一歩。"
      },
      rhythm: {
        identity: "RHYTHM",
        headline: "小さな回復が、\n毎日のリズムになります。",
        supporting: "戻ることを重ねると、暮らしが変わり始めます。"
      },
      awakening: {
        identity: "AWAKENING",
        headline: "静けさの中で、\n本来の感覚が目覚めます。",
        supporting: "気づき、選び、自分の人生を生きる。"
      },
      hros: {
        identity: "HROS",
        label: "Human Recovery Operating System",
        headline: "AI時代に、\n人間本来のリズムへ戻るために。",
        supporting: "回復し、目覚め、自然知能を広げ、人生の主人になる。"
      },
      coexistence: {
        identity: "COEXISTENCE",
        headline: "一人の回復が、\nともに生きる力になります。",
        supporting: "自分を整え、互いに目覚め、共生する文化へ。"
      },
      doorway: {
        identity: "NEXT DOOR",
        headline: "この旅を、毎日のリズムへ。",
        supporting: "必要な深さへ、静かに進めます。",
        recoveryCta: "7-Day Recoveryへ",
        libraryCta: "HROSをもっと知る",
        basicCta: "BASICを始める"
      }
    }
  },
  kr: {
    giftBanner: "당신에게 1분의 휴식이 도착했습니다.",
    hero: {
      headline: "오늘,\n어떤 회복이 필요하세요?",
      subtitle: "Human Recovery Operating System",
      description: "AI 시대에,\n인간 본래의 리듬을 되찾는 곳.",
      primaryCta: "1분 리셋 시작하기",
      secondaryCta: "7일간의 리듬 회복"
    },
    recovery: {
      eyebrow: "Recovery First",
      title: "먼저,\n지금의 나에게 맞는\n입구를 고르세요.",
      description: "하나만 고르면,\n조용한 60초가 시작됩니다.",
      meditationLabel: "하나만 고르면,\n조용한 60초가 시작됩니다."
    },
    chapters: {
      continueJourney: "회복의 여정 계속하기",
      previous: "← 이전 장",
      next: "다음 장 →",
      close: "회복으로 돌아가기",
      position: "장",
      exploreHros: "HROS 더 알아보기",
      membership: "BASIC Membership으로",
      recovery: {
        identity: "RECOVERY",
        headline: "회복은\n끝이 아니라 시작입니다.",
        supporting: "본래의 나로 돌아가는 첫걸음."
      },
      rhythm: {
        identity: "RHYTHM",
        headline: "작은 회복이\n매일의 리듬이 됩니다.",
        supporting: "돌아오는 경험이 쌓이면 삶이 달라지기 시작합니다."
      },
      awakening: {
        identity: "AWAKENING",
        headline: "고요함 속에서\n본래의 감각이 깨어납니다.",
        supporting: "알아차리고, 선택하며, 자기 삶을 살아갑니다."
      },
      hros: {
        identity: "HROS",
        label: "Human Recovery Operating System",
        headline: "AI 시대,\n인간 본래의 리듬으로 돌아가기 위하여.",
        supporting: "회복하고, 깨어나며, 자연지능을 확장하고, 자기 삶의 주인이 됩니다."
      },
      coexistence: {
        identity: "COEXISTENCE",
        headline: "한 사람의 회복이\n함께 살아가는 힘이 됩니다.",
        supporting: "자신을 회복하고, 함께 깨어나며, 공생하는 문화로 나아갑니다."
      },
      doorway: {
        identity: "NEXT DOOR",
        headline: "이 여정을, 매일의 리듬으로.",
        supporting: "필요한 깊이로 조용히 이어갈 수 있습니다.",
        recoveryCta: "7-Day Recovery로",
        libraryCta: "HROS 더 알아보기",
        basicCta: "BASIC 시작하기"
      }
    }
  },
  en: {
    giftBanner: "A one-minute rest has been sent to you.",
    hero: {
      headline: "What kind of recovery\ndo you need today?",
      subtitle: "Human Recovery Operating System",
      description: "A place to recover the original human rhythm\nin the AI era.",
      primaryCta: "Start the 1-Minute Reset",
      secondaryCta: "7-Day Rhythm Recovery"
    },
    recovery: {
      eyebrow: "Recovery First",
      title: "First,\nchoose the entrance\nthat fits you now.",
      description: "Choose one,\nand a quiet 60 seconds begins.",
      meditationLabel: "Choose one,\nand a quiet 60 seconds begins."
    },
    chapters: {
      continueJourney: "Continue the Recovery Journey",
      previous: "← Previous",
      next: "Next Chapter →",
      close: "Return to Recovery",
      position: "Chapter",
      exploreHros: "Explore HROS",
      membership: "Enter BASIC Membership",
      recovery: {
        identity: "RECOVERY",
        headline: "Recovery is not the end.\nIt is the beginning.",
        supporting: "The first step back to yourself."
      },
      rhythm: {
        identity: "RHYTHM",
        headline: "Small recoveries\nbecome a daily rhythm.",
        supporting: "When returning becomes a practice, life begins to change."
      },
      awakening: {
        identity: "AWAKENING",
        headline: "In stillness,\nyour original awareness awakens.",
        supporting: "Notice. Choose. Live your own life."
      },
      hros: {
        identity: "HROS",
        label: "Human Recovery Operating System",
        headline: "For the AI era,\na return to our original human rhythm.",
        supporting: "Recover, awaken, expand natural intelligence, and become the owner of your life."
      },
      coexistence: {
        identity: "COEXISTENCE",
        headline: "One person’s recovery\nbecomes the strength to live together.",
        supporting: "Recover within. Awaken together. Grow into coexistence."
      },
      doorway: {
        identity: "NEXT DOOR",
        headline: "Carry this journey into daily life.",
        supporting: "Continue recovery, explore the deeper world, or enter BASIC when ready.",
        recoveryCta: "Enter 7-Day Recovery",
        libraryCta: "Explore HROS",
        basicCta: "Enter BASIC"
      }
    }
  }
} as const;

function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left"
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-3xl ${alignment}`}>
      <p className="text-xs uppercase tracking-[0.34em] text-[#d8c08a]/78 sm:text-sm">{eyebrow}</p>
      <h2 className="mt-4 text-balance font-serif text-[clamp(1.75rem,4.2vw,3.2rem)] leading-[1.1] text-white">{title}</h2>
      <p className="mt-4 max-w-[32rem] whitespace-pre-line text-pretty text-[15px] leading-8 text-white/62 sm:text-base sm:leading-9">{description}</p>
    </div>
  );
}

const journeyChapterOrder = ["recovery", "rhythm", "awakening", "hros", "coexistence", "doorway"] as const;
type JourneyChapterKey = (typeof journeyChapterOrder)[number];

const chapterBackdropClasses: Record<JourneyChapterKey, string> = {
  recovery:
    "bg-[radial-gradient(circle_at_18%_22%,rgba(230,204,142,0.12),transparent_24%),linear-gradient(180deg,rgba(8,18,28,0.92),rgba(8,18,28,0.82))]",
  rhythm:
    "bg-[radial-gradient(circle_at_72%_18%,rgba(173,191,214,0.12),transparent_26%),linear-gradient(180deg,rgba(8,19,29,0.92),rgba(8,19,29,0.82))]",
  awakening:
    "bg-[radial-gradient(circle_at_50%_16%,rgba(240,223,176,0.12),transparent_24%),linear-gradient(180deg,rgba(9,20,30,0.92),rgba(9,20,30,0.82))]",
  hros:
    "bg-[radial-gradient(circle_at_78%_22%,rgba(216,192,138,0.11),transparent_26%),linear-gradient(180deg,rgba(7,16,26,0.92),rgba(7,16,26,0.82))]",
  coexistence:
    "bg-[radial-gradient(circle_at_24%_24%,rgba(217,199,151,0.11),transparent_26%),linear-gradient(180deg,rgba(9,18,28,0.92),rgba(9,18,28,0.82))]",
  doorway:
    "bg-[radial-gradient(circle_at_52%_18%,rgba(236,214,162,0.11),transparent_28%),linear-gradient(180deg,rgba(8,17,27,0.92),rgba(8,17,27,0.82))]"
};

export default function HomePage() {
  const router = useRouter();
  const { authResolved, isLoggedIn, memberState } = useAuthState();
  const landing = useLocaleCopy(landingCopy);
  const copy = useLocaleCopy(homeCopy);
  const [giftDelivered, setGiftDelivered] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const chapterHeadingRef = useRef<HTMLHeadingElement | null>(null);

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

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => {
      mediaQuery.removeEventListener("change", syncPreference);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncChapterFromHash = () => {
      const hashValue = window.location.hash.replace(/^#/, "");
      const nextIndex = journeyChapterOrder.findIndex((chapterKey) => hashValue === `journey-${chapterKey}`);
      setActiveChapterIndex(nextIndex >= 0 ? nextIndex : null);
    };

    syncChapterFromHash();
    window.addEventListener("hashchange", syncChapterFromHash);

    return () => {
      window.removeEventListener("hashchange", syncChapterFromHash);
    };
  }, []);

  useEffect(() => {
    if (activeChapterIndex === null || typeof window === "undefined") {
      return;
    }

    const target = document.getElementById("chapter-journey");

    target?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });

    const focusTimer = window.setTimeout(() => {
      chapterHeadingRef.current?.focus();
    }, prefersReducedMotion ? 0 : 180);

    return () => {
      window.clearTimeout(focusTimer);
    };
  }, [activeChapterIndex, prefersReducedMotion]);

  useEffect(() => {
    if (activeChapterIndex === null || typeof window === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isTypingContext =
        tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || target?.isContentEditable;

      if (isTypingContext || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNextChapter();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPreviousChapter();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeChapterJourney();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeChapterIndex]);

  function scrollToRecovery() {
    if (typeof window === "undefined") {
      return;
    }

    document.getElementById("homepage-recovery")?.scrollIntoView({
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

  function scrollToSection(sectionId: string) {
    if (typeof window === "undefined") {
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function updateJourneyHash(nextIndex: number | null) {
    if (typeof window === "undefined") {
      return;
    }

    const nextUrl =
      nextIndex === null
        ? `${window.location.pathname}${window.location.search}`
        : `${window.location.pathname}${window.location.search}#journey-${journeyChapterOrder[nextIndex]}`;

    window.history.pushState(null, "", nextUrl);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  function openChapterJourney(nextIndex = 0) {
    updateJourneyHash(nextIndex);
  }

  function closeChapterJourney() {
    updateJourneyHash(null);
    scrollToSection("homepage-recovery");
  }

  function goToNextChapter() {
    if (activeChapterIndex === null) {
      openChapterJourney(0);
      return;
    }

    const nextIndex = Math.min(activeChapterIndex + 1, journeyChapterOrder.length - 1);
    updateJourneyHash(nextIndex);
  }

  function goToPreviousChapter() {
    if (activeChapterIndex === null) {
      return;
    }

    if (activeChapterIndex === 0) {
      closeChapterJourney();
      return;
    }

    updateJourneyHash(activeChapterIndex - 1);
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

  function handleBasicJourneyCta() {
    if (!authResolved || !isLoggedIn || memberState !== "paid") {
      router.push("/member?next=/program/basic");
      return;
    }

    router.push("/program/basic");
  }

  const chapterSequence = [
    {
      key: "recovery",
      identity: copy.chapters.recovery.identity,
      headline: copy.chapters.recovery.headline,
      supporting: copy.chapters.recovery.supporting
    },
    {
      key: "rhythm",
      identity: copy.chapters.rhythm.identity,
      headline: copy.chapters.rhythm.headline,
      supporting: copy.chapters.rhythm.supporting
    },
    {
      key: "awakening",
      identity: copy.chapters.awakening.identity,
      headline: copy.chapters.awakening.headline,
      supporting: copy.chapters.awakening.supporting
    },
    {
      key: "hros",
      identity: copy.chapters.hros.identity,
      label: copy.chapters.hros.label,
      headline: copy.chapters.hros.headline,
      supporting: copy.chapters.hros.supporting
    },
    {
      key: "coexistence",
      identity: copy.chapters.coexistence.identity,
      headline: copy.chapters.coexistence.headline,
      supporting: copy.chapters.coexistence.supporting
    },
    {
      key: "doorway",
      identity: copy.chapters.doorway.identity,
      headline: copy.chapters.doorway.headline,
      supporting: copy.chapters.doorway.supporting
    }
  ] as const;

  const activeChapter = activeChapterIndex === null ? null : chapterSequence[activeChapterIndex];

  return (
    <div className="relative overflow-hidden pb-24">
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_top,rgba(216,192,138,0.12),transparent_18%),radial-gradient(circle_at_18%_14%,rgba(98,127,146,0.16),transparent_22%),linear-gradient(180deg,#050d15_0%,#09131d_38%,#06111c_100%)]" />
      <div className="pointer-events-none absolute left-[-8%] top-[8rem] -z-20 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(216,192,138,0.12),transparent_70%)] blur-[140px]" />
      <div className="pointer-events-none absolute right-[-12%] top-[26rem] -z-20 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(87,117,133,0.16),transparent_70%)] blur-[160px]" />

      {giftDelivered ? (
        <section className="section-shell pt-6">
          <div className="rounded-[24px] border border-[#d8c08a]/22 bg-[#d8c08a]/[0.08] px-5 py-4 text-center text-sm font-medium text-[#e7d7a8]">
            {copy.giftBanner}
          </div>
        </section>
      ) : null}

      <section className="section-shell pt-6 sm:pt-10">
        <div className="relative overflow-hidden rounded-[44px] border border-white/9 bg-[linear-gradient(180deg,rgba(8,16,25,0.9),rgba(8,16,25,0.78))] px-6 py-7 shadow-[0_22px_90px_rgba(6,12,22,0.24)] sm:px-8 sm:py-9 lg:min-h-[calc(83svh-7.5rem)] lg:px-11 lg:py-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,14,22,0.18),rgba(7,14,22,0.26)_48%,rgba(7,14,22,0.42))]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(232,203,145,0.08),transparent_24%),radial-gradient(circle_at_72%_28%,rgba(236,216,170,0.06),transparent_28%)]" />
            <div className="absolute left-[6%] top-[11%] h-36 w-36 rounded-full bg-[#e5c989]/[0.09] blur-[100px]" />
            <div className="absolute right-[8%] top-[14%] h-44 w-44 rounded-full bg-[#cddbeb]/[0.08] blur-[118px]" />
            <div className="absolute inset-x-[18%] top-[-8%] h-32 rounded-full bg-[#efd8a7]/[0.06] blur-[92px]" />
          </div>

          <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)] lg:items-center lg:gap-10">
            <div className="max-w-[38rem]">
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-[#d8c08a]/78 sm:text-[0.95rem]">
                {copy.hero.subtitle}
              </p>
              <h1 className="mt-5 whitespace-pre-line text-balance font-serif text-[clamp(3.35rem,5.4vw,5.75rem)] leading-[1.12] tracking-[-0.03em] text-white">
                {copy.hero.headline}
              </h1>
              <p className="mt-6 max-w-[28rem] whitespace-pre-line text-pretty text-base leading-9 text-white/68 sm:text-lg sm:leading-9">
                {copy.hero.description}
              </p>

              <div className="mt-8 flex w-full flex-col items-stretch gap-3.5 sm:max-w-[34rem] sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  type="button"
                  onClick={scrollToRecovery}
                  className="inline-flex min-h-[56px] items-center justify-center rounded-[18px] border border-[#f3e4bc]/44 bg-[#e8d5a6] px-5.5 py-3.5 text-sm font-semibold text-[#132030] shadow-[0_14px_28px_rgba(212,186,117,0.12)] transition duration-200 hover:brightness-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0ddb0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131d] sm:min-w-[13.4rem]"
                >
                  {copy.hero.primaryCta}
                </button>
                <Link
                  href="/rhythm-journey"
                  className="inline-flex min-h-[56px] items-center justify-center rounded-[18px] border border-[#d8c08a]/24 bg-[#0d1721]/66 px-5.5 py-3.5 text-sm font-semibold text-white/86 transition duration-200 hover:border-[#d8c08a]/38 hover:bg-[#101b26]/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8c08a]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131d] sm:min-w-[13rem]"
                >
                  {copy.hero.secondaryCta}
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[#0b1620]/74 p-2 shadow-[0_20px_72px_rgba(4,10,18,0.2)]">
              <div className="pointer-events-none absolute inset-x-[10%] top-0 h-8 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0))] opacity-40 blur-xl" />
              <div className="relative overflow-hidden rounded-[31px] border border-white/8 bg-[#0b1620]">
                <img
                  src={heroWindowVisual}
                  alt=""
                  aria-hidden="true"
                  className="h-[16.5rem] w-full object-cover object-center opacity-[0.95] brightness-[0.93] contrast-[0.95] saturate-[0.9] sepia-[0.04] sm:h-[19.5rem] lg:h-[27rem]"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,17,26,0.18),rgba(8,17,26,0.05)_26%,rgba(8,17,26,0.14)_100%),linear-gradient(180deg,rgba(4,11,18,0.08),rgba(4,11,18,0.18)_46%,rgba(4,11,18,0.26)_100%),radial-gradient(circle_at_24%_20%,rgba(244,220,173,0.12),transparent_24%),radial-gradient(circle_at_70%_32%,rgba(237,212,160,0.07),transparent_28%)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="homepage-recovery" className="pt-12 sm:pt-15">
        <div className="section-shell">
          <SectionHeader
            eyebrow={copy.recovery.eyebrow}
            title={copy.recovery.title}
            description={copy.recovery.description}
          />
        </div>
        <div className="mt-7 sm:mt-8">
          <ZeroGateSection onEnterGate={handleZeroGateEnter} />
        </div>
        <InstantMeditationSection copy={landing.instant} />
        <div className="section-shell mt-10 flex justify-start sm:mt-12">
          <button
            type="button"
            onClick={() => openChapterJourney(0)}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131d]"
          >
            {copy.chapters.continueJourney}
          </button>
        </div>
      </section>

      {activeChapter ? (
        <section
          id="chapter-journey"
          className="section-shell flex min-h-[calc(100svh-6.5rem)] items-center py-10 sm:min-h-[calc(100svh-7rem)] sm:py-12"
          aria-label={`${copy.chapters.position} ${activeChapterIndex! + 1}`}
        >
          <div
            className={`w-full overflow-hidden rounded-[40px] border border-white/8 px-6 py-8 shadow-[0_24px_100px_rgba(6,12,22,0.16)] sm:px-8 sm:py-10 lg:px-12 lg:py-12 ${
              chapterBackdropClasses[activeChapter.key]
            } ${prefersReducedMotion ? "" : "animate-[chapterFade_420ms_ease-out]"}`}
          >
            <div className="pointer-events-none absolute opacity-0" aria-live="polite">
              {`${copy.chapters.position} ${activeChapterIndex! + 1} / ${chapterSequence.length}`}
            </div>
            <div className="flex flex-col gap-12 lg:min-h-[calc(100svh-16rem)] lg:justify-between">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.34em] text-[#d8c08a]/72">{activeChapter.identity}</p>
                  {"label" in activeChapter ? (
                    <p className="text-sm tracking-[0.16em] text-white/54">{activeChapter.label}</p>
                  ) : null}
                </div>
                <p className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-white/52">
                  {`${copy.chapters.position} ${activeChapterIndex! + 1} / ${chapterSequence.length}`}
                </p>
              </div>

              <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,0.28fr)] lg:items-end">
                <div className="max-w-[42rem]">
                  <h2
                    ref={chapterHeadingRef}
                    tabIndex={-1}
                    className="whitespace-pre-line text-balance font-serif text-[clamp(2.5rem,5.2vw,5rem)] leading-[1.12] tracking-[-0.03em] text-white focus:outline-none"
                  >
                    {activeChapter.headline}
                  </h2>
                  <p className="mt-6 max-w-[30rem] whitespace-pre-line text-pretty text-base leading-8 text-white/64 sm:text-lg sm:leading-9">
                    {activeChapter.supporting}
                  </p>

                  {activeChapter.key === "hros" ? (
                    <div className="mt-10">
                      <Link
                        href="/brain-education"
                        className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/82 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        {copy.chapters.exploreHros}
                      </Link>
                    </div>
                  ) : null}

                  {activeChapter.key === "doorway" ? (
                    <div className="mt-10 flex flex-col gap-3 sm:max-w-[28rem]">
                      <Link
                        href="/rhythm-journey"
                        className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/84 transition hover:bg-white/[0.06]"
                      >
                        {copy.chapters.doorway.recoveryCta}
                      </Link>
                      <Link
                        href="/brain-education"
                        className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-white/10 bg-transparent px-6 py-3 text-sm font-medium text-white/72 transition hover:border-white/16 hover:bg-white/[0.04] hover:text-white/86"
                      >
                        {copy.chapters.doorway.libraryCta}
                      </Link>
                      <button
                        type="button"
                        onClick={handleBasicJourneyCta}
                        className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#f0ddb0_0%,#dcc086_56%,#caa160_100%)] px-6 py-3 text-sm font-semibold text-[#16202b] shadow-[0_16px_34px_rgba(212,186,117,0.16)] transition hover:brightness-[1.03]"
                      >
                        {copy.chapters.doorway.basicCta}
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[32px] border border-white/7 bg-white/[0.03] px-5 py-6 shadow-[0_18px_54px_rgba(5,12,24,0.1)] sm:px-6">
                  <div className="h-20 rounded-[24px] bg-[radial-gradient(circle_at_50%_50%,rgba(240,221,176,0.18),rgba(240,221,176,0.02)_48%,transparent_72%)]" />
                  <p className="mt-5 text-sm leading-7 text-white/58">
                    {activeChapter.key === "recovery"
                      ? copy.recovery.description
                      : activeChapter.key === "rhythm"
                        ? copy.chapters.rhythm.supporting
                        : activeChapter.key === "awakening"
                          ? copy.chapters.awakening.supporting
                          : activeChapter.key === "hros"
                            ? copy.chapters.hros.supporting
                            : activeChapter.key === "coexistence"
                              ? copy.chapters.coexistence.supporting
                              : copy.chapters.doorway.supporting}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-white/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={goToPreviousChapter}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/74 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131d]"
                    aria-label={copy.chapters.previous}
                  >
                    {copy.chapters.previous}
                  </button>
                  <button
                    type="button"
                    onClick={closeChapterJourney}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full px-3 py-2.5 text-sm font-medium text-white/54 transition hover:text-white/82 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131d]"
                    aria-label={copy.chapters.close}
                  >
                    {copy.chapters.close}
                  </button>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto" aria-hidden="true">
                  {chapterSequence.map((chapter, index) => (
                    <span
                      key={chapter.key}
                      className={`h-1.5 rounded-full transition-all ${index === activeChapterIndex ? "w-8 bg-[#e8d5a6]" : "w-3 bg-white/18"}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={activeChapterIndex === chapterSequence.length - 1 ? () => openChapterJourney(0) : goToNextChapter}
                  className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white/86 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131d]"
                  aria-label={copy.chapters.next}
                >
                  {activeChapterIndex === chapterSequence.length - 1 ? copy.chapters.continueJourney : copy.chapters.next}
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
