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
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80";

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
      description: "必要なのは説明ではなく、\n今の自分に合う入口です。",
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
      description: "필요한 것은 설명이 아니라,\n지금의 나에게 맞는 입구입니다.",
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
      description: "What you need is not more explanation,\nbut the right entrance for this moment.",
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
      <p className="mt-4 max-w-[32rem] text-pretty text-[15px] leading-7 text-white/62 sm:text-base sm:leading-8">{description}</p>
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
        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(180deg,rgba(6,14,22,0.94),rgba(6,14,22,0.8))] px-6 py-9 shadow-[0_28px_120px_rgba(2,8,14,0.36)] sm:px-8 sm:py-12 lg:min-h-[calc(100svh-9rem)] lg:px-12 lg:py-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,14,0.14),rgba(3,8,14,0.48)_66%,rgba(3,8,14,0.68))]" />
            <div className="absolute left-[8%] top-[10%] h-28 w-28 rounded-full bg-[#d8c08a]/[0.1] blur-[88px]" />
            <div className="absolute right-[12%] top-[18%] h-40 w-40 rounded-full bg-white/[0.05] blur-[104px]" />
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
                  className="h-[16.5rem] w-full object-cover object-center opacity-[0.92] brightness-[0.9] contrast-[0.94] saturate-[0.9] sm:h-[20rem] lg:h-[31rem]"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,17,26,0.22),rgba(8,17,26,0.02)_24%,rgba(8,17,26,0.1)_100%),linear-gradient(180deg,rgba(4,11,18,0.06),rgba(4,11,18,0.18)_46%,rgba(4,11,18,0.42)_100%),radial-gradient(circle_at_20%_18%,rgba(255,242,216,0.12),transparent_22%)]" />
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
        <div className="section-shell mt-9 sm:mt-11">
          <p className="whitespace-pre-line text-sm uppercase tracking-[0.18em] text-white/46 sm:text-base">{copy.recovery.meditationLabel}</p>
        </div>
        <InstantMeditationSection copy={landing.instant} />
      </section>

      <section className="section-shell pt-18 sm:pt-24">
        <div className="overflow-hidden rounded-[36px] bg-[linear-gradient(180deg,rgba(8,17,26,0.72),rgba(8,17,26,0.52))] px-6 py-10 shadow-[0_24px_90px_rgba(2,8,14,0.18)] sm:px-8 sm:py-12 lg:px-10 lg:py-14">
          <SectionHeader
            eyebrow={copy.hros.eyebrow}
            title={copy.hros.title}
            description={copy.hros.description}
          />

          <div className="mt-10 flex flex-col gap-5">
            {copy.hros.stages.map((stage, index) => (
              <div key={stage.label} className="flex flex-col gap-4">
                <article className="max-w-[28rem] rounded-[28px] bg-white/[0.03] px-5 py-5 shadow-[0_18px_46px_rgba(2,8,14,0.12)] sm:px-6 sm:py-6">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8c08a]/70">{`0${index + 1}`}</p>
                  <h3 className="mt-3 text-[1.15rem] font-semibold text-white sm:text-[1.28rem]">{stage.label}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/62">{stage.body}</p>
                </article>
                {index < copy.hros.stages.length - 1 ? (
                  <div className="ml-5 h-8 w-px bg-[linear-gradient(180deg,rgba(216,192,138,0.42),rgba(216,192,138,0.08))] sm:ml-6" />
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/brain-education"
              className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/74 transition hover:bg-white/[0.06] hover:text-white"
            >
              {copy.hros.libraryCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell pt-18 sm:pt-24">
        <SectionHeader
          eyebrow={copy.journey.eyebrow}
          title={copy.journey.title}
          description={copy.journey.description}
          align="center"
        />

        <div className="mt-12 flex flex-col gap-6">
          <article className="flex flex-col rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] px-6 py-7 shadow-[0_20px_70px_rgba(7,17,31,0.12)] sm:max-w-[26rem] sm:px-7 sm:py-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d8c08a]/78">{copy.journey.cards[0].label}</p>
            <h3 className="mt-4 text-[1.5rem] font-semibold text-white">{copy.journey.cards[0].title}</h3>
            <p className="mt-3 text-[15px] leading-7 text-white/66">{copy.journey.cards[0].body}</p>
            <button
              type="button"
              onClick={scrollToRecovery}
              className="mt-7 inline-flex min-h-[56px] items-center justify-center self-start rounded-full bg-[linear-gradient(135deg,#f0ddb0_0%,#dcc086_56%,#caa160_100%)] px-6 py-3 text-sm font-semibold text-[#16202b] shadow-[0_14px_28px_rgba(212,186,117,0.16)] transition hover:brightness-[1.03]"
            >
              {copy.journey.cards[0].cta}
            </button>
          </article>

          <div className="flex items-center gap-4 pl-4 sm:pl-8">
            <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(216,192,138,0.32),rgba(216,192,138,0.04))]" />
            <span className="text-[#d8c08a]/54">↓</span>
            <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(216,192,138,0.04),rgba(216,192,138,0.32))]" />
          </div>

          <article className="flex flex-col rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.018))] px-6 py-8 shadow-[0_20px_70px_rgba(7,17,31,0.12)] sm:ml-12 sm:max-w-[30rem] sm:px-7 sm:py-9">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d8c08a]/78">{copy.journey.cards[1].label}</p>
            <h3 className="mt-4 text-[1.55rem] font-semibold text-white">{copy.journey.cards[1].title}</h3>
            <p className="mt-3 text-[15px] leading-7 text-white/66">{copy.journey.cards[1].body}</p>
            <Link
              href="/rhythm-journey"
              className="mt-7 inline-flex min-h-[52px] items-center justify-center self-start rounded-full bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/82 transition hover:bg-white/[0.06]"
            >
              {copy.journey.cards[1].cta}
            </Link>
          </article>

          <div className="flex items-center gap-4 pl-4 sm:pl-16">
            <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(216,192,138,0.32),rgba(216,192,138,0.04))]" />
            <span className="text-[#d8c08a]/54">↓</span>
            <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(216,192,138,0.04),rgba(216,192,138,0.32))]" />
          </div>

          <article className="flex flex-col rounded-[34px] bg-[linear-gradient(180deg,rgba(212,186,117,0.1),rgba(255,255,255,0.025))] px-6 py-9 shadow-[0_24px_80px_rgba(7,17,31,0.16)] sm:ml-24 sm:max-w-[34rem] sm:px-8 sm:py-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f0ddb0]/84">{copy.journey.cards[2].label}</p>
            <h3 className="mt-4 text-[1.7rem] font-semibold text-white">{copy.journey.cards[2].title}</h3>
            <p className="mt-3 text-[15px] leading-7 text-white/72">{copy.journey.cards[2].body}</p>
            <button
              type="button"
              onClick={handleBasicJourneyCta}
              className="mt-8 inline-flex min-h-[56px] items-center justify-center self-start rounded-full bg-[linear-gradient(135deg,#f0ddb0_0%,#dcc086_56%,#caa160_100%)] px-6 py-3 text-sm font-semibold text-[#16202b] shadow-[0_16px_36px_rgba(212,186,117,0.18)] transition hover:brightness-[1.03]"
            >
              {copy.journey.cards[2].cta}
            </button>
          </article>
        </div>
      </section>
    </div>
  );
}
