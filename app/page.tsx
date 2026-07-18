"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuthState } from "@/components/auth-provider";
import { InstantMeditationSection } from "@/components/instant-meditation-section";
import { ZeroGateSection } from "@/components/zero-gate-section";
import { useLanguage, useLocaleCopy } from "@/lib/i18n";
import { landingCopy } from "@/lib/landing-copy";

const heroWindowVisual =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";

const homeCopy = {
  jp: {
    giftBanner: "あなたに、1分の休息が届きました。",
    hero: {
      headline: "今日は、どんな回復が必要ですか？",
      subtitle: "Human Recovery Operating System",
      description: "AI時代に、人間本来のリズムへ還る場所。",
      primaryCta: "1分リセットを始める",
      secondaryCta: "7日間の小さな回復"
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
      description: "Choose one,\nand your quiet 60 seconds begin.",
      meditationLabel: "Choose one,\nand your quiet 60 seconds begin."
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

function renderRecoveryHeadline(language: "jp" | "kr" | "en") {
  if (language === "jp") {
    return (
      <>
        <span className="hidden sm:block">
          <span className="inline-block whitespace-nowrap">まずは、今の自分に合う</span>
        </span>
        <span className="mt-[0.14em] hidden sm:block">
          <span className="inline-block whitespace-nowrap">入口を選びましょう。</span>
        </span>
        <span className="block sm:hidden">
          <span className="inline-block whitespace-nowrap">まずは、</span>
        </span>
        <span className="mt-[0.14em] block sm:hidden">
          <span className="inline-block whitespace-nowrap">今の自分に合う</span>
        </span>
        <span className="mt-[0.1em] block sm:hidden">
          <span className="inline-block whitespace-nowrap">入口を選びましょう。</span>
        </span>
      </>
    );
  }

  if (language === "kr") {
    return (
      <>
        <span className="hidden sm:block">
          <span className="inline-block whitespace-nowrap">먼저, 지금의 나에게 맞는</span>
        </span>
        <span className="mt-[0.16em] hidden sm:block">
          <span className="inline-block whitespace-nowrap">입구를 고르세요.</span>
        </span>
        <span className="block sm:hidden">
          <span className="inline-block whitespace-nowrap">먼저,</span>
        </span>
        <span className="mt-[0.14em] block sm:hidden">
          <span className="inline-block whitespace-nowrap">지금의 나에게 맞는</span>
        </span>
        <span className="mt-[0.1em] block sm:hidden">
          <span className="inline-block whitespace-nowrap">입구를 고르세요.</span>
        </span>
      </>
    );
  }

  return (
    <>
      <span className="hidden sm:block">
        <span className="inline-block whitespace-nowrap">First, choose the entrance</span>
      </span>
      <span className="mt-[0.16em] hidden sm:block">
        <span className="inline-block whitespace-nowrap">that fits you now.</span>
      </span>
      <span className="block sm:hidden">
        <span className="inline-block whitespace-nowrap">First,</span>
      </span>
      <span className="mt-[0.14em] block sm:hidden">
        <span className="inline-block whitespace-nowrap">choose the entrance</span>
      </span>
      <span className="mt-[0.1em] block sm:hidden">
        <span className="inline-block whitespace-nowrap">that fits you now.</span>
      </span>
    </>
  );
}

function getRecoveryHeadlineClass(language: "jp" | "kr" | "en") {
  if (language === "jp") {
    return "mt-3 font-serif text-[clamp(1.72rem,4vw,2.78rem)] leading-[1.14] tracking-[-0.022em] text-white sm:mt-4";
  }

  if (language === "kr") {
    return "mt-3 font-serif text-[clamp(1.62rem,5vw,2.68rem)] leading-[1.16] tracking-[-0.02em] text-white sm:mt-4";
  }

  return "mt-3 font-serif text-[clamp(1.56rem,5vw,2.58rem)] leading-[1.14] tracking-[-0.022em] text-white sm:mt-4";
}

function getRecoveryDescriptionClass(language: "jp" | "kr" | "en") {
  if (language === "en") {
    return "mt-3 max-w-[23rem] whitespace-pre-line text-[14px] leading-7 text-white/62 sm:mt-4 sm:max-w-[25rem] sm:text-[15px] sm:leading-8";
  }

  return "mt-3 max-w-[20rem] whitespace-pre-line text-[14px] leading-7 text-white/62 sm:mt-4 sm:max-w-[23rem] sm:text-[15px] sm:leading-8";
}

function SectionHeader({
  eyebrow,
  title,
  description,
  language,
  align = "left"
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  language: "jp" | "kr" | "en";
  align?: "left" | "center";
}) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-[44rem] ${alignment}`}>
      <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[#d8c08a]/74 sm:text-xs sm:tracking-[0.32em]">{eyebrow}</p>
      <h2 className={getRecoveryHeadlineClass(language)}>{title}</h2>
      <p className={getRecoveryDescriptionClass(language)}>{description}</p>
    </div>
  );
}

function renderHeroHeadline(language: "jp" | "kr" | "en") {
  if (language === "jp") {
    return (
      <>
        <span className="block">今日は、</span>
        <span className="mt-[0.16em] hidden whitespace-normal sm:block">
          <span className="inline-block whitespace-nowrap">どんな回復が必要ですか？</span>
        </span>
        <span className="mt-[0.16em] block whitespace-normal sm:hidden">
          <span className="block">
            <span className="inline-block whitespace-nowrap">どんな回復が</span>
          </span>
          <span className="mt-[0.12em] block">
            <span className="inline-block whitespace-nowrap">必要ですか？</span>
          </span>
        </span>
      </>
    );
  }

  if (language === "kr") {
    return (
      <>
        <span className="block">오늘,</span>
        <span className="mt-[0.18em] hidden whitespace-normal sm:block">
          <span className="inline-block whitespace-nowrap">어떤 회복이 필요하세요?</span>
        </span>
        <span className="mt-[0.12em] block sm:hidden">
          <span className="inline-block whitespace-nowrap">어떤 회복이</span>
        </span>
        <span className="mt-[0.08em] block sm:hidden">
          <span className="inline-block whitespace-nowrap">필요하세요?</span>
        </span>
      </>
    );
  }

  return (
    <>
      <span className="hidden sm:block">What kind of recovery</span>
      <span className="mt-[0.18em] hidden whitespace-normal sm:block">
        <span className="inline-block whitespace-nowrap">do you need today?</span>
      </span>
      <span className="block sm:hidden">What kind</span>
      <span className="mt-[0.14em] block sm:hidden">of recovery</span>
      <span className="mt-[0.14em] block whitespace-normal sm:hidden">
        <span className="inline-block whitespace-nowrap">do you need today?</span>
      </span>
    </>
  );
}

function getHeroHeadlineClass(language: "jp" | "kr" | "en") {
  if (language === "jp") {
    return "mt-4 font-serif text-[clamp(2.8rem,4vw,4.85rem)] font-normal leading-[1.1] tracking-[-0.024em] text-white sm:mt-5 lg:max-w-[8.8em]";
  }

  if (language === "kr") {
    return "mt-4 max-w-full font-serif text-[clamp(2.25rem,10vw,2.95rem)] font-normal leading-[1.1] tracking-[-0.018em] text-white sm:mt-5 sm:text-[clamp(2.55rem,8.6vw,4.72rem)] sm:leading-[1.12] sm:tracking-[-0.022em] lg:max-w-[8.85em]";
  }

  return "mt-4 font-serif text-[clamp(2.22rem,9vw,4.68rem)] font-normal leading-[1.08] tracking-[-0.026em] text-white sm:mt-5 sm:text-[clamp(2.58rem,4vw,4.68rem)] lg:max-w-[9.4em]";
}

function getHeroDescriptionClass(language: "jp" | "kr" | "en") {
  if (language === "en") {
    return "mt-5 max-w-[32rem] text-[15px] leading-7 text-white/70 sm:text-base sm:leading-8 lg:max-w-[33rem]";
  }

  if (language === "kr") {
    return "mt-5 max-w-[33rem] text-[15px] leading-7 text-white/70 sm:text-base sm:leading-8";
  }

  return "mt-5 max-w-[34rem] text-[15px] leading-7 text-white/70 sm:text-base sm:leading-8 lg:whitespace-nowrap";
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

const chapterLightVisuals: Record<
  JourneyChapterKey,
  {
    fieldClassName: string;
    coreClassName: string;
    innerGlowClassName: string;
    outerGlowClassName: string;
  }
> = {
  recovery: {
    fieldClassName:
      "bg-[radial-gradient(circle_at_58%_40%,rgba(244,230,194,0.18),transparent_18%),radial-gradient(circle_at_50%_46%,rgba(221,197,137,0.12),transparent_34%),radial-gradient(circle_at_54%_48%,rgba(98,121,140,0.18),transparent_68%)]",
    coreClassName: "bg-[radial-gradient(circle,rgba(250,244,226,0.8),rgba(240,224,182,0.26)_42%,transparent_76%)]",
    innerGlowClassName: "bg-[radial-gradient(circle,rgba(225,202,147,0.28),rgba(225,202,147,0.08)_48%,transparent_82%)]",
    outerGlowClassName: "bg-[radial-gradient(circle,rgba(88,109,129,0.26),rgba(88,109,129,0.08)_54%,transparent_88%)]"
  },
  rhythm: {
    fieldClassName:
      "bg-[radial-gradient(circle_at_56%_42%,rgba(240,236,225,0.14),transparent_18%),radial-gradient(circle_at_50%_46%,rgba(170,191,214,0.14),transparent_34%),radial-gradient(circle_at_56%_50%,rgba(95,122,147,0.18),transparent_68%)]",
    coreClassName: "bg-[radial-gradient(circle,rgba(243,246,248,0.74),rgba(217,226,234,0.2)_44%,transparent_76%)]",
    innerGlowClassName: "bg-[radial-gradient(circle,rgba(174,196,214,0.24),rgba(174,196,214,0.08)_50%,transparent_82%)]",
    outerGlowClassName: "bg-[radial-gradient(circle,rgba(84,110,138,0.28),rgba(84,110,138,0.09)_56%,transparent_90%)]"
  },
  awakening: {
    fieldClassName:
      "bg-[radial-gradient(circle_at_58%_38%,rgba(247,238,207,0.18),transparent_18%),radial-gradient(circle_at_50%_46%,rgba(229,198,125,0.13),transparent_32%),radial-gradient(circle_at_55%_52%,rgba(108,122,138,0.16),transparent_68%)]",
    coreClassName: "bg-[radial-gradient(circle,rgba(250,245,226,0.82),rgba(240,223,176,0.28)_42%,transparent_76%)]",
    innerGlowClassName: "bg-[radial-gradient(circle,rgba(226,196,126,0.27),rgba(226,196,126,0.08)_48%,transparent_82%)]",
    outerGlowClassName: "bg-[radial-gradient(circle,rgba(86,101,118,0.24),rgba(86,101,118,0.08)_56%,transparent_90%)]"
  },
  hros: {
    fieldClassName:
      "bg-[radial-gradient(circle_at_56%_40%,rgba(242,231,199,0.16),transparent_18%),radial-gradient(circle_at_50%_46%,rgba(212,186,117,0.13),transparent_34%),radial-gradient(circle_at_56%_52%,rgba(80,104,124,0.18),transparent_70%)]",
    coreClassName: "bg-[radial-gradient(circle,rgba(247,241,223,0.78),rgba(235,214,166,0.24)_42%,transparent_76%)]",
    innerGlowClassName: "bg-[radial-gradient(circle,rgba(214,189,130,0.26),rgba(214,189,130,0.08)_48%,transparent_82%)]",
    outerGlowClassName: "bg-[radial-gradient(circle,rgba(78,100,122,0.26),rgba(78,100,122,0.08)_56%,transparent_90%)]"
  },
  coexistence: {
    fieldClassName:
      "bg-[radial-gradient(circle_at_58%_40%,rgba(243,235,210,0.16),transparent_18%),radial-gradient(circle_at_50%_46%,rgba(203,188,150,0.12),transparent_32%),radial-gradient(circle_at_54%_50%,rgba(94,118,132,0.18),transparent_68%)]",
    coreClassName: "bg-[radial-gradient(circle,rgba(248,243,228,0.78),rgba(231,216,184,0.22)_42%,transparent_76%)]",
    innerGlowClassName: "bg-[radial-gradient(circle,rgba(214,198,156,0.24),rgba(214,198,156,0.08)_48%,transparent_82%)]",
    outerGlowClassName: "bg-[radial-gradient(circle,rgba(89,111,126,0.26),rgba(89,111,126,0.08)_56%,transparent_90%)]"
  },
  doorway: {
    fieldClassName:
      "bg-[radial-gradient(circle_at_58%_38%,rgba(246,236,207,0.18),transparent_18%),radial-gradient(circle_at_50%_46%,rgba(223,196,134,0.14),transparent_32%),radial-gradient(circle_at_56%_52%,rgba(91,112,128,0.18),transparent_70%)]",
    coreClassName: "bg-[radial-gradient(circle,rgba(248,243,228,0.8),rgba(236,214,162,0.26)_42%,transparent_76%)]",
    innerGlowClassName: "bg-[radial-gradient(circle,rgba(224,197,136,0.28),rgba(224,197,136,0.08)_48%,transparent_82%)]",
    outerGlowClassName: "bg-[radial-gradient(circle,rgba(84,106,123,0.28),rgba(84,106,123,0.08)_56%,transparent_90%)]"
  }
};

export default function HomePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { authResolved, isLoggedIn, memberState } = useAuthState();
  const landing = useLocaleCopy(landingCopy);
  const copy = useLocaleCopy(homeCopy);
  const [giftDelivered, setGiftDelivered] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [headerOffset, setHeaderOffset] = useState(112);
  const chapterHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const recoveryScrollRef = useRef<HTMLDivElement | null>(null);

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

    const headerElement = document.querySelector("header");
    if (!headerElement) {
      return;
    }

    const updateHeaderOffset = () => {
      const nextHeight = Math.ceil(headerElement.getBoundingClientRect().height);
      if (nextHeight > 0) {
        setHeaderOffset(nextHeight);
      }
    };

    updateHeaderOffset();

    const resizeObserver = new ResizeObserver(updateHeaderOffset);
    resizeObserver.observe(headerElement);
    window.addEventListener("resize", updateHeaderOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeaderOffset);
    };
  }, []);

  useEffect(() => {
    if (activeChapterIndex === null || typeof window === "undefined") {
      return;
    }

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
  }, [activeChapterIndex, prefersReducedMotion]);

  useEffect(() => {
    if (typeof document === "undefined" || activeChapterIndex === null) {
      return;
    }

    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlOverscrollBehavior = document.documentElement.style.overscrollBehavior;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyLeft = document.body.style.left;
    const previousBodyRight = document.body.style.right;
    const previousBodyWidth = document.body.style.width;
    const previousBodyOverscrollBehavior = document.body.style.overscrollBehavior;

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscrollBehavior;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.left = previousBodyLeft;
      document.body.style.right = previousBodyRight;
      document.body.style.width = previousBodyWidth;
      document.body.style.overscrollBehavior = previousBodyOverscrollBehavior;
      window.scrollTo({ top: scrollY, behavior: "auto" });
    };
  }, [activeChapterIndex]);

  function scrollToRecovery() {
    if (typeof window === "undefined") {
      return;
    }

    recoveryScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    document.getElementById("homepage-recovery")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  function scrollToOneMinute() {
    if (typeof window === "undefined") {
      return;
    }

    document.querySelector("#one-minute-experience")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  function scrollToSection(sectionId: string) {
    if (typeof window === "undefined") {
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  function openChapterJourney(nextIndex = 0) {
    setActiveChapterIndex(Math.max(0, Math.min(nextIndex, journeyChapterOrder.length - 1)));
  }

  function closeChapterJourney() {
    setActiveChapterIndex(null);
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        recoveryScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
        scrollToSection("homepage-recovery");
      }, prefersReducedMotion ? 0 : 80);
    }
  }

  function goToNextChapter() {
    if (activeChapterIndex === null) {
      openChapterJourney(0);
      return;
    }

    setActiveChapterIndex((currentIndex) =>
      currentIndex === null ? 0 : Math.min(currentIndex + 1, journeyChapterOrder.length - 1)
    );
  }

  function goToPreviousChapter() {
    if (activeChapterIndex === null) {
      return;
    }

    if (activeChapterIndex === 0) {
      closeChapterJourney();
      return;
    }

    setActiveChapterIndex((currentIndex) => (currentIndex === null ? null : Math.max(currentIndex - 1, 0)));
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
  const activeChapterLight = activeChapter ? chapterLightVisuals[activeChapter.key] : null;
  const viewportSectionMinHeight = `calc(100dvh - ${headerOffset}px)`;
  const chapterOverlayStyle = {
    top: `${headerOffset}px`,
    paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))"
  } as const;
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

      <section className="relative overflow-hidden" style={{ height: viewportSectionMinHeight }}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#061018_0%,#09131d_42%,#08121b_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full md:w-[62%] lg:w-[54%]">
          <img
            src={heroWindowVisual}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-[66%_center] opacity-[0.92] brightness-[0.9] contrast-[0.95] saturate-[0.9] sepia-[0.04] md:max-lg:object-[70%_center] md:max-lg:opacity-[0.88] md:max-lg:brightness-[0.84] md:max-lg:contrast-[0.93] md:max-lg:saturate-[0.86] lg:object-[70%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#061018_0%,rgba(6,16,24,0.97)_12%,rgba(6,16,24,0.84)_26%,rgba(6,16,24,0.42)_48%,rgba(6,16,24,0.16)_68%,rgba(6,16,24,0.12)_100%),linear-gradient(180deg,rgba(4,10,18,0.44)_0%,rgba(4,10,18,0.18)_32%,rgba(4,10,18,0.28)_100%),radial-gradient(circle_at_74%_26%,rgba(237,212,160,0.09),transparent_24%)] md:max-lg:bg-[linear-gradient(90deg,#061018_0%,rgba(6,16,24,0.985)_14%,rgba(6,16,24,0.9)_32%,rgba(6,16,24,0.54)_52%,rgba(6,16,24,0.2)_72%,rgba(6,16,24,0.14)_100%),linear-gradient(180deg,rgba(4,10,18,0.5)_0%,rgba(4,10,18,0.24)_30%,rgba(4,10,18,0.3)_100%),radial-gradient(circle_at_76%_24%,rgba(237,212,160,0.06),transparent_24%)]" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(228,205,154,0.08),transparent_20%),radial-gradient(circle_at_84%_18%,rgba(189,205,220,0.08),transparent_18%)]" />
        <div className="section-shell relative z-10 flex h-full items-center">
          <div className="grid w-full lg:grid-cols-[minmax(0,0.52fr)_minmax(0,0.48fr)] lg:items-center">
            <div className="flex min-w-0 flex-col justify-center lg:-translate-y-[3svh]">
              <p className="text-[0.69rem] font-medium uppercase tracking-[0.22em] text-[#d8c08a]/72 sm:text-[0.8rem]">
                {copy.hero.subtitle}
              </p>
              <h1 className={getHeroHeadlineClass(language)}>
                {renderHeroHeadline(language)}
              </h1>
              <p className={getHeroDescriptionClass(language)}>
                {copy.hero.description}
              </p>

              <div className="mt-7 flex w-full flex-col items-stretch gap-3.5 sm:mt-8 sm:max-w-[33rem] sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <button
                  type="button"
                  onClick={scrollToRecovery}
                  className="inline-flex min-h-[54px] items-center justify-center rounded-[16px] border border-[#ebd7a8]/32 bg-[#deca97] px-5 py-3 text-sm font-semibold text-[#12202f] transition duration-200 hover:bg-[#e7d4a4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0ddb0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08121b] sm:min-w-[12.8rem]"
                >
                  {copy.hero.primaryCta}
                </button>
                <Link
                  href="/rhythm-journey"
                  className="inline-flex min-h-[54px] items-center justify-center rounded-[16px] border border-white/14 bg-[rgba(8,18,27,0.16)] px-5 py-3 text-sm font-medium text-white/84 transition duration-200 hover:border-[#d8c08a]/30 hover:bg-[rgba(255,255,255,0.04)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8c08a]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08121b] sm:min-w-[12.8rem]"
                >
                  {copy.hero.secondaryCta}
                </Link>
              </div>
            </div>
            <div className="hidden lg:block" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section
        id="homepage-recovery"
        className="relative overflow-hidden bg-[#08121b] pt-8 sm:pt-15"
        style={{ minHeight: viewportSectionMinHeight }}
      >
        <div className="section-shell">
          <div
            ref={recoveryScrollRef}
            className="flex max-h-[calc(100dvh-var(--header-offset,0px))] min-h-0 flex-col overflow-y-auto overscroll-contain pr-0.5 [-webkit-overflow-scrolling:touch] sm:pr-1"
            style={{
              minHeight: viewportSectionMinHeight,
              paddingBottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 0.5rem))",
              ["--header-offset" as string]: `${headerOffset}px`
            }}
          >
            <div className="space-y-4 sm:space-y-6">
              <SectionHeader
                eyebrow={copy.recovery.eyebrow}
                title={renderRecoveryHeadline(language)}
                description={copy.recovery.description}
                language={language}
              />
              <ZeroGateSection onEnterGate={handleZeroGateEnter} />
              <div className="flex justify-stretch sm:justify-end">
                <button
                  type="button"
                  onClick={() => openChapterJourney(0)}
                  className="group inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/74 transition duration-200 hover:border-gold/22 hover:text-white/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131d] motion-reduce:transform-none sm:min-h-[44px] sm:w-auto sm:justify-end sm:px-5"
                >
                  <span>{copy.chapters.continueJourney}</span>
                  <span
                    aria-hidden="true"
                    className="text-[15px] leading-none text-white/52 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none"
                  >
                    →
                  </span>
                </button>
              </div>
              <InstantMeditationSection copy={landing.instant} />
            </div>
          </div>
        </div>
      </section>

      {activeChapter ? (
        <div className="fixed inset-x-0 bottom-0 z-40 overflow-hidden bg-[#07111a]" style={chapterOverlayStyle}>
          <div className="absolute inset-0 bg-[#07111a]" aria-hidden="true" />
          <section
            id="chapter-journey"
            className="section-shell relative flex h-full items-center py-4 sm:py-5"
            aria-label={`${copy.chapters.position} ${activeChapterIndex! + 1}`}
          >
            <div
              key={activeChapter.key}
              className={`flex h-full w-full flex-col overflow-x-hidden overflow-y-auto rounded-[34px] border border-white/7 px-5 py-5 shadow-[0_20px_72px_rgba(6,12,22,0.18)] sm:overflow-hidden sm:rounded-[38px] sm:px-7 sm:py-7 lg:px-10 lg:py-9 ${
                chapterBackdropClasses[activeChapter.key]
              } ${prefersReducedMotion ? "" : "animate-[chapterFade_420ms_ease-out]"}`}
              style={{ height: `calc(100dvh - ${headerOffset}px - 2rem)` }}
            >
              <div className="pointer-events-none absolute opacity-0" aria-live="polite">
                {`${copy.chapters.position} ${activeChapterIndex! + 1} / ${chapterSequence.length}`}
              </div>
              <div className="flex h-full flex-col gap-8 sm:gap-10 lg:justify-between">
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

                <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,0.26fr)] lg:items-end lg:gap-9">
                  <div className="flex min-h-0 flex-col justify-end max-w-[42rem]">
                    <h2
                      ref={chapterHeadingRef}
                      tabIndex={-1}
                      className="whitespace-pre-line text-balance font-serif text-[clamp(2.5rem,5.2vw,5rem)] leading-[1.12] tracking-[-0.03em] text-white focus:outline-none"
                    >
                      {activeChapter.headline}
                    </h2>
                    <p className="mt-5 max-w-[29rem] whitespace-pre-line text-pretty text-[15px] leading-7 text-white/64 sm:text-base sm:leading-8">
                      {activeChapter.supporting}
                    </p>

                    {activeChapter.key === "hros" ? (
                      <div className="mt-8">
                        <Link
                          href="/brain-education"
                          className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/82 transition hover:bg-white/[0.06] hover:text-white"
                        >
                          {copy.chapters.exploreHros}
                        </Link>
                      </div>
                    ) : null}

                    {activeChapter.key === "doorway" ? (
                      <div className="mt-8 flex flex-col gap-3 sm:max-w-[28rem]">
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

                  <div className="relative self-center lg:self-end">
                    <div
                      className={`pointer-events-none absolute left-1/2 top-0 h-[clamp(11.5rem,24vw,16.25rem)] w-[clamp(11.5rem,24vw,16.25rem)] -translate-x-1/2 rounded-full opacity-90 blur-[2px] ${
                        activeChapterLight?.fieldClassName ?? ""
                      } ${prefersReducedMotion ? "" : "animate-[meditation-ambient-breathe_10s_ease-in-out_infinite]"}`}
                      aria-hidden="true"
                    />
                    <div
                      className={`pointer-events-none absolute left-1/2 top-[14%] h-[clamp(3.1rem,7vw,4.4rem)] w-[clamp(3.1rem,7vw,4.4rem)] -translate-x-1/2 rounded-full ${
                        activeChapterLight?.coreClassName ?? ""
                      } ${prefersReducedMotion ? "" : "animate-[meditation-soft-pulse_7.4s_ease-in-out_infinite]"}`}
                      aria-hidden="true"
                    />
                    <div
                      className={`pointer-events-none absolute left-1/2 top-[6%] h-[clamp(8.8rem,18vw,12.4rem)] w-[clamp(8.8rem,18vw,12.4rem)] -translate-x-1/2 rounded-full blur-[34px] ${
                        activeChapterLight?.innerGlowClassName ?? ""
                      }`}
                      aria-hidden="true"
                    />
                    <div
                      className={`pointer-events-none absolute left-1/2 top-[-8%] h-[clamp(18rem,34vw,28rem)] w-[clamp(18rem,34vw,28rem)] -translate-x-1/2 rounded-full blur-[72px] sm:blur-[88px] ${
                        activeChapterLight?.outerGlowClassName ?? ""
                      }`}
                      aria-hidden="true"
                    />
                    <div className="relative flex min-h-[17.5rem] w-full max-w-[20rem] flex-col justify-end pt-[8.2rem] sm:min-h-[18.5rem] sm:max-w-[21rem] sm:pt-[8.8rem] lg:min-h-[21rem] lg:max-w-[23rem] lg:pt-[9.6rem]">
                      <p className="max-w-[17rem] text-sm leading-7 text-white/60 sm:max-w-[18rem] sm:text-[15px] sm:leading-7 lg:max-w-[19rem]">
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
                </div>

                <div className="border-t border-white/8 pt-5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:pb-0">
                  <div className="flex flex-col gap-3 sm:hidden">
                    <div className="grid min-w-0 grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={goToPreviousChapter}
                        className="inline-flex min-h-[48px] min-w-0 items-center justify-start rounded-full border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[13px] font-medium leading-5 text-white/74 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131d]"
                        aria-label={copy.chapters.previous}
                      >
                        <span className="min-w-0 text-left [text-wrap:balance]">{copy.chapters.previous}</span>
                      </button>
                      <button
                        type="button"
                        onClick={activeChapterIndex === chapterSequence.length - 1 ? closeChapterJourney : goToNextChapter}
                        className="inline-flex min-h-[48px] min-w-0 items-center justify-end rounded-full bg-white/[0.05] px-3 py-2.5 text-[13px] font-medium leading-5 text-white/86 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131d]"
                        aria-label={copy.chapters.next}
                      >
                        <span className="min-w-0 text-right [text-wrap:balance]">
                          {activeChapterIndex === chapterSequence.length - 1 ? copy.chapters.close : copy.chapters.next}
                        </span>
                      </button>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={closeChapterJourney}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-full px-3 py-2 text-[13px] font-medium leading-5 text-white/54 transition hover:text-white/82 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131d]"
                        aria-label={copy.chapters.close}
                      >
                        {copy.chapters.close}
                      </button>
                      <div className="flex items-center gap-2" aria-hidden="true">
                        {chapterSequence.map((chapter, index) => (
                          <span
                            key={chapter.key}
                            className={`h-1.5 rounded-full transition-all ${index === activeChapterIndex ? "w-8 bg-[#e8d5a6]" : "w-3 bg-white/18"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between">
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
                      onClick={activeChapterIndex === chapterSequence.length - 1 ? closeChapterJourney : goToNextChapter}
                      className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white/86 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131d]"
                      aria-label={copy.chapters.next}
                    >
                      {activeChapterIndex === chapterSequence.length - 1 ? copy.chapters.close : copy.chapters.next}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
