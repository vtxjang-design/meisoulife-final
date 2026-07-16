"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
      headline: "今日は、\nどんな回復が必要ですか？",
      subtitle: "Human Recovery Operating System",
      description: "AI時代に、\n人間本来のリズムを取り戻す場所。",
      primaryCta: "1分リセットを始める",
      secondaryCta: "7日間のリズム回復"
    },
    recovery: {
      eyebrow: "Recovery First",
      title: "まずは、\n今の自分に合う\n入口を選びましょう。",
      description: "一つ選ぶだけで、\n静かな60秒が始まります。",
      meditationLabel: "一つ選ぶだけで、\n静かな60秒が始まります。"
    },
    hros: {
      eyebrow: "HROS",
      title: "回復から、静かな旅が始まります。",
      description: "HROSは、回復が生活と意識へ自然につながっていく流れです。",
      libraryCta: "HROS Library",
      stages: [
        {
          label: "Recovery",
          body: "自分に戻る。"
        },
        {
          label: "Rhythm",
          body: "毎日に戻る。"
        },
        {
          label: "Awakening",
          body: "気づき、選び、育つ。"
        },
        {
          label: "Coexistence",
          body: "回復した生を分かち合う。"
        }
      ]
    },
    journey: {
      eyebrow: "Your Journey",
      title: "今日の回復から、生活のリズムへ。",
      description: "必要なのは比較ではなく、次の静かな一歩です。",
      cards: [
        {
          label: "Today",
          title: "1分回復",
          body: "今ここで、静かに始める。",
          cta: "1分回復へ"
        },
        {
          label: "7-Day",
          title: "7日間のリズム回復",
          body: "7日かけて、感覚を取り戻す。",
          cta: "7-Dayへ"
        },
        {
          label: "BASIC",
          title: "Life Rhythm Membership",
          body: "朝・昼・夜に、回復を住まわせる。",
          cta: "BASICへ"
        }
      ]
    },
    chapters: {
      next: "Next Journey →",
      recovery: {
        eyebrow: "Chapter 1",
        title: "1分の回復から始める。",
        description: "今の自分に合う入口を一つ選べば十分です。",
        cta: "FREEを始める"
      },
      sevenDay: {
        eyebrow: "Chapter 2",
        title: "7日かけて、感覚を取り戻す。",
        description: "小さな回復を毎日に戻すための静かなリズムです。",
        cta: "7-Dayへ"
      },
      basic: {
        eyebrow: "Chapter 3",
        title: "回復を、朝・昼・夜に住まわせる。",
        description: "BASICは回復を一度きりで終わらせないための生活設計です。",
        cta: "BASICへ"
      },
      hros: {
        eyebrow: "Chapter 4",
        title: "HROSは、一つの旅です。",
        description: "RecoveryからCoexistenceへ、人の回復がそのまま生き方になる流れです。",
        cta: "HROS Library"
      },
      founder: {
        eyebrow: "Chapter 5",
        title: "一人の回復は、やがて共に歩く力になる。",
        description: "創設者のビジョンと、静かに続ける仲間たちの場へ。",
        cta: "Communityへ"
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
    hros: {
      eyebrow: "HROS",
      title: "회복에서, 조용한 여정이 시작됩니다.",
      description: "HROS는 회복이 삶과 의식으로 자연스럽게 이어지는 흐름입니다.",
      libraryCta: "HROS Library",
      stages: [
        {
          label: "Recovery",
          body: "자신에게 돌아옵니다."
        },
        {
          label: "Rhythm",
          body: "매일 다시 돌아옵니다."
        },
        {
          label: "Awakening",
          body: "알아차리고, 선택하고, 자랍니다."
        },
        {
          label: "Coexistence",
          body: "회복된 삶을 함께 나눕니다."
        }
      ]
    },
    journey: {
      eyebrow: "Your Journey",
      title: "오늘의 회복에서, 삶의 리듬으로.",
      description: "비교보다 필요한 것은 다음의 조용한 한 걸음입니다.",
      cards: [
        {
          label: "Today",
          title: "1분 회복",
          body: "지금 여기서 조용히 시작합니다.",
          cta: "1분 회복으로"
        },
        {
          label: "7-Day",
          title: "7일간의 리듬 회복",
          body: "7일 동안 감각을 되찾습니다.",
          cta: "7-Day로"
        },
        {
          label: "BASIC",
          title: "Life Rhythm Membership",
          body: "아침, 낮, 저녁에 회복을 머무르게 합니다.",
          cta: "BASIC으로"
        }
      ]
    },
    chapters: {
      next: "Next Journey →",
      recovery: {
        eyebrow: "Chapter 1",
        title: "1분의 회복으로 시작합니다.",
        description: "지금의 나에게 맞는 입구를 하나 고르면 충분합니다.",
        cta: "FREE 시작하기"
      },
      sevenDay: {
        eyebrow: "Chapter 2",
        title: "7일 동안 감각을 되찾습니다.",
        description: "작은 회복을 일상으로 돌려놓는 조용한 리듬입니다.",
        cta: "7-Day로"
      },
      basic: {
        eyebrow: "Chapter 3",
        title: "회복을 아침, 낮, 저녁에 머물게 합니다.",
        description: "BASIC은 회복을 한 번의 경험이 아닌 생활의 구조로 바꿉니다.",
        cta: "BASIC으로"
      },
      hros: {
        eyebrow: "Chapter 4",
        title: "HROS는 하나의 여정입니다.",
        description: "Recovery에서 Coexistence까지, 회복이 삶의 방식이 되는 흐름입니다.",
        cta: "HROS Library"
      },
      founder: {
        eyebrow: "Chapter 5",
        title: "한 사람의 회복은 함께 걷는 힘이 됩니다.",
        description: "창립자의 비전과 조용히 이어가는 사람들의 공간으로.",
        cta: "Community로"
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
    hros: {
      eyebrow: "HROS",
      title: "From recovery, a quieter journey begins.",
      description: "HROS is a gentle path from recovery into daily rhythm and shared life.",
      libraryCta: "HROS Library",
      stages: [
        {
          label: "Recovery",
          body: "Return to yourself."
        },
        {
          label: "Rhythm",
          body: "Return every day."
        },
        {
          label: "Awakening",
          body: "Notice. Choose. Grow."
        },
        {
          label: "Coexistence",
          body: "Share your recovered life."
        }
      ]
    },
    journey: {
      eyebrow: "Your Journey",
      title: "From today’s recovery into daily rhythm.",
      description: "You do not need comparison. You only need the next quiet step.",
      cards: [
        {
          label: "Today",
          title: "1-Minute Recovery",
          body: "Begin quietly, right here.",
          cta: "Enter FREE"
        },
        {
          label: "7-Day",
          title: "7-Day Rhythm Recovery",
          body: "Recover your rhythm over seven days.",
          cta: "Enter 7-Day"
        },
        {
          label: "BASIC",
          title: "Life Rhythm Membership",
          body: "Let recovery live in morning, daytime, and evening.",
          cta: "Enter BASIC"
        }
      ]
    },
    chapters: {
      next: "Next Journey →",
      recovery: {
        eyebrow: "Chapter 1",
        title: "Begin with one minute of recovery.",
        description: "Choose the entrance that fits this moment, and begin quietly.",
        cta: "Enter FREE"
      },
      sevenDay: {
        eyebrow: "Chapter 2",
        title: "Recover your rhythm over seven days.",
        description: "A calmer way to bring small recovery back into every day.",
        cta: "Enter 7-Day"
      },
      basic: {
        eyebrow: "Chapter 3",
        title: "Let recovery live in morning, daytime, and evening.",
        description: "BASIC turns recovery from a moment into a way of living.",
        cta: "Enter BASIC"
      },
      hros: {
        eyebrow: "Chapter 4",
        title: "HROS is one continuous journey.",
        description: "From Recovery to Coexistence, human recovery becomes a lived rhythm.",
        cta: "Open HROS Library"
      },
      founder: {
        eyebrow: "Chapter 5",
        title: "One person’s recovery becomes a shared path.",
        description: "Step into the founder’s vision and the quiet community that continues it.",
        cta: "Enter Community"
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

export default function HomePage() {
  const router = useRouter();
  const { authResolved, isLoggedIn, memberState } = useAuthState();
  const landing = useLocaleCopy(landingCopy);
  const copy = useLocaleCopy(homeCopy);
  const [giftDelivered, setGiftDelivered] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    setGiftDelivered(url.searchParams.get("gift") === "1min");
  }, []);

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
        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(180deg,rgba(6,14,22,0.96),rgba(6,14,22,0.84))] px-6 py-8 shadow-[0_28px_120px_rgba(2,8,14,0.36)] sm:px-8 sm:py-10 lg:min-h-[calc(80svh-8rem)] lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,14,0.22),rgba(3,8,14,0.34)_52%,rgba(3,8,14,0.56))]" />
            <div className="absolute left-[8%] top-[12%] h-28 w-28 rounded-full bg-[#d8c08a]/[0.08] blur-[88px]" />
            <div className="absolute right-[10%] top-[16%] h-40 w-40 rounded-full bg-[#9ebbd2]/[0.08] blur-[104px]" />
          </div>

          <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)] lg:items-center lg:gap-10">
            <div className="max-w-[36rem]">
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-[#d8c08a]/78 sm:text-[0.95rem]">
                {copy.hero.subtitle}
              </p>
              <h1 className="mt-5 whitespace-pre-line text-balance font-serif text-[clamp(3.2rem,5.2vw,5.4rem)] leading-[1.06] text-white">
                {copy.hero.headline}
              </h1>
              <p className="mt-5 max-w-[28rem] whitespace-pre-line text-pretty text-base leading-8 text-white/66 sm:text-lg">
                {copy.hero.description}
              </p>

              <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:max-w-[38rem] sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  type="button"
                  onClick={scrollToRecovery}
                  className="inline-flex min-h-[58px] items-center justify-center rounded-[18px] border border-[#f3e4bc]/50 bg-[#e8d5a6] px-6 py-4 text-sm font-semibold text-[#132030] shadow-[0_16px_34px_rgba(212,186,117,0.14)] transition duration-200 hover:brightness-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0ddb0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131d]"
                >
                  {copy.hero.primaryCta}
                </button>
                <Link
                  href="/rhythm-journey"
                  className="inline-flex min-h-[58px] items-center justify-center rounded-[18px] border border-[#d8c08a]/28 bg-[#0c1620]/78 px-6 py-4 text-sm font-semibold text-white/88 transition duration-200 hover:border-[#d8c08a]/42 hover:bg-[#101b26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8c08a]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131d]"
                >
                  {copy.hero.secondaryCta}
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-[#09131c] p-2 shadow-[0_24px_80px_rgba(4,10,18,0.28)]">
              <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#0b1620]">
                <img
                  src={heroWindowVisual}
                  alt=""
                  aria-hidden="true"
                  className="h-[15rem] w-full object-cover object-center opacity-[0.92] brightness-[0.88] contrast-[0.92] saturate-[0.88] sm:h-[18rem] lg:h-[25rem]"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,17,26,0.24),rgba(8,17,26,0.08)_24%,rgba(8,17,26,0.18)_100%),linear-gradient(180deg,rgba(4,11,18,0.1),rgba(4,11,18,0.22)_46%,rgba(4,11,18,0.3)_100%),radial-gradient(circle_at_24%_20%,rgba(244,220,173,0.12),transparent_24%)]" />
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
      </section>

      <section id="journey-free" className="section-shell flex min-h-[100svh] items-center py-20 sm:py-24">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,0.12fr)] lg:items-end">
          <article className="max-w-[42rem] rounded-[40px] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))] px-7 py-10 shadow-[0_28px_110px_rgba(5,12,24,0.16)] sm:px-10 sm:py-12">
            <p className="text-xs uppercase tracking-[0.32em] text-[#d8c08a]/74">{copy.chapters.recovery.eyebrow}</p>
            <h2 className="mt-6 max-w-[12ch] text-balance font-serif text-[clamp(2.4rem,5vw,4.8rem)] leading-[1.04] text-white">
              {copy.chapters.recovery.title}
            </h2>
            <p className="mt-6 max-w-[30rem] text-pretty text-base leading-8 text-white/64 sm:text-lg">
              {copy.chapters.recovery.description}
            </p>
            <button
              type="button"
              onClick={scrollToRecovery}
              className="mt-10 inline-flex min-h-[58px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#f0ddb0_0%,#dcc086_56%,#caa160_100%)] px-7 py-3 text-sm font-semibold text-[#16202b] shadow-[0_16px_36px_rgba(212,186,117,0.16)] transition hover:brightness-[1.03]"
            >
              {copy.chapters.recovery.cta}
            </button>
          </article>
          <div className="lg:pb-2">
            <button
              type="button"
              onClick={() => scrollToSection("journey-seven-day")}
              className="inline-flex items-center gap-2 text-sm font-medium text-white/56 transition hover:text-white/84"
            >
              {copy.chapters.next}
            </button>
          </div>
        </div>
      </section>

      <section id="journey-seven-day" className="section-shell flex min-h-[100svh] items-center py-20 sm:py-24">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,0.16fr)_minmax(0,0.84fr)] lg:items-end">
          <div className="hidden lg:block" />
          <article className="justify-self-end max-w-[42rem] rounded-[40px] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.016))] px-7 py-10 shadow-[0_28px_110px_rgba(5,12,24,0.14)] sm:px-10 sm:py-12">
            <p className="text-xs uppercase tracking-[0.32em] text-[#d8c08a]/74">{copy.chapters.sevenDay.eyebrow}</p>
            <h2 className="mt-6 max-w-[13ch] text-balance font-serif text-[clamp(2.4rem,5vw,4.8rem)] leading-[1.04] text-white">
              {copy.chapters.sevenDay.title}
            </h2>
            <p className="mt-6 max-w-[30rem] text-pretty text-base leading-8 text-white/64 sm:text-lg">
              {copy.chapters.sevenDay.description}
            </p>
            <Link
              href="/rhythm-journey"
              className="mt-10 inline-flex min-h-[58px] items-center justify-center rounded-full bg-white/[0.04] px-7 py-3 text-sm font-medium text-white/84 transition hover:bg-white/[0.06]"
            >
              {copy.chapters.sevenDay.cta}
            </Link>
          </article>
          <div className="lg:col-start-2">
            <button
              type="button"
              onClick={() => scrollToSection("journey-basic")}
              className="inline-flex items-center gap-2 text-sm font-medium text-white/56 transition hover:text-white/84"
            >
              {copy.chapters.next}
            </button>
          </div>
        </div>
      </section>

      <section id="journey-basic" className="section-shell flex min-h-[100svh] items-center py-20 sm:py-24">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.1fr)] lg:items-end">
          <article className="max-w-[44rem] rounded-[42px] bg-[linear-gradient(180deg,rgba(212,186,117,0.1),rgba(255,255,255,0.02))] px-7 py-10 shadow-[0_32px_120px_rgba(5,12,24,0.18)] sm:px-10 sm:py-12">
            <p className="text-xs uppercase tracking-[0.32em] text-[#f0ddb0]/82">{copy.chapters.basic.eyebrow}</p>
            <h2 className="mt-6 max-w-[14ch] text-balance font-serif text-[clamp(2.5rem,5vw,5rem)] leading-[1.03] text-white">
              {copy.chapters.basic.title}
            </h2>
            <p className="mt-6 max-w-[31rem] text-pretty text-base leading-8 text-white/68 sm:text-lg">
              {copy.chapters.basic.description}
            </p>
            <button
              type="button"
              onClick={handleBasicJourneyCta}
              className="mt-10 inline-flex min-h-[58px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#f0ddb0_0%,#dcc086_56%,#caa160_100%)] px-7 py-3 text-sm font-semibold text-[#16202b] shadow-[0_18px_40px_rgba(212,186,117,0.18)] transition hover:brightness-[1.03]"
            >
              {copy.chapters.basic.cta}
            </button>
          </article>
          <div className="lg:pb-2">
            <button
              type="button"
              onClick={() => scrollToSection("journey-hros")}
              className="inline-flex items-center gap-2 text-sm font-medium text-white/56 transition hover:text-white/84"
            >
              {copy.chapters.next}
            </button>
          </div>
        </div>
      </section>

      <section id="journey-hros" className="section-shell flex min-h-[100svh] items-center py-20 sm:py-24">
        <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,0.38fr)] lg:items-end">
          <article className="max-w-[38rem]">
            <p className="text-xs uppercase tracking-[0.32em] text-[#d8c08a]/74">{copy.chapters.hros.eyebrow}</p>
            <h2 className="mt-6 max-w-[12ch] text-balance font-serif text-[clamp(2.4rem,5vw,4.8rem)] leading-[1.04] text-white">
              {copy.chapters.hros.title}
            </h2>
            <p className="mt-6 max-w-[28rem] text-pretty text-base leading-8 text-white/64 sm:text-lg">
              {copy.chapters.hros.description}
            </p>
            <Link
              href="/brain-education"
              className="mt-10 inline-flex min-h-[58px] items-center justify-center rounded-full bg-white/[0.04] px-7 py-3 text-sm font-medium text-white/84 transition hover:bg-white/[0.06]"
            >
              {copy.chapters.hros.cta}
            </Link>
          </article>

          <div className="rounded-[36px] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.016))] px-6 py-7 shadow-[0_24px_80px_rgba(5,12,24,0.12)] sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5">
              {copy.hros.stages.map((stage, index) => (
                <div key={stage.label} className="flex items-start gap-4">
                  <p className="pt-1 text-[11px] uppercase tracking-[0.28em] text-[#d8c08a]/64">{`0${index + 1}`}</p>
                  <div>
                    <h3 className="text-[1.02rem] font-semibold text-white sm:text-[1.12rem]">{stage.label}</h3>
                    <p className="mt-1 text-sm leading-7 text-white/58">{stage.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={() => scrollToSection("journey-founder")}
              className="inline-flex items-center gap-2 text-sm font-medium text-white/56 transition hover:text-white/84"
            >
              {copy.chapters.next}
            </button>
          </div>
        </div>
      </section>

      <section id="journey-founder" className="section-shell flex min-h-[100svh] items-center py-20 sm:py-24">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,0.5fr)] lg:items-end">
          <article className="max-w-[38rem] rounded-[40px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.014))] px-7 py-10 shadow-[0_28px_110px_rgba(5,12,24,0.14)] sm:px-10 sm:py-12">
            <p className="text-xs uppercase tracking-[0.32em] text-[#d8c08a]/74">{copy.chapters.founder.eyebrow}</p>
            <h2 className="mt-6 max-w-[14ch] text-balance font-serif text-[clamp(2.4rem,5vw,4.8rem)] leading-[1.04] text-white">
              {copy.chapters.founder.title}
            </h2>
            <p className="mt-6 max-w-[30rem] text-pretty text-base leading-8 text-white/64 sm:text-lg">
              {copy.chapters.founder.description}
            </p>
            <Link
              href="/community"
              className="mt-10 inline-flex min-h-[58px] items-center justify-center rounded-full bg-white/[0.04] px-7 py-3 text-sm font-medium text-white/84 transition hover:bg-white/[0.06]"
            >
              {copy.chapters.founder.cta}
            </Link>
          </article>

          <div className="justify-self-end rounded-[36px] border border-white/8 bg-[linear-gradient(180deg,rgba(8,17,26,0.46),rgba(8,17,26,0.22))] px-6 py-8 sm:px-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#d8c08a]/62">HROS</p>
            <p className="mt-4 max-w-[20rem] text-[1.02rem] leading-8 text-white/72 sm:text-[1.08rem]">
              {copy.hros.stages[0].label} → {copy.hros.stages[1].label} → {copy.hros.stages[2].label} → {copy.hros.stages[3].label}
            </p>
          </div>

          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={() => scrollToSection("homepage-recovery")}
              className="inline-flex items-center gap-2 text-sm font-medium text-white/56 transition hover:text-white/84"
            >
              {copy.chapters.next}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
