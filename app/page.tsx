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
      title: "回復から、リズムと目覚めへ。",
      description: "Meisou Lifeは、回復だけで終わらず、人が本来のリズムと意識へ戻っていく流れを育てるHuman Recovery Operating Systemです。",
      libraryCta: "HROS Library",
      stages: [
        {
          label: "Recovery",
          body: "まずは神経と感情を静かに整え、自分に戻ります。"
        },
        {
          label: "Rhythm",
          body: "一度きりではなく、毎日に戻ってこられる流れを育てます。"
        },
        {
          label: "Awakening",
          body: "自分の状態に気づき、選び直す力を少しずつ取り戻します。"
        },
        {
          label: "Coexistence",
          body: "回復を自分だけで終わらせず、関係と社会へ広げていきます。"
        }
      ]
    },
    journey: {
      eyebrow: "Your Journey",
      title: "FREEから、7-Day、BASICへ。",
      description: "細かく説明するのではなく、今の場所から次の一歩へ自然につながる流れだけを置いています。",
      cards: [
        {
          label: "FREE",
          title: "1分回復",
          body: "気持ちが重い日でも、今ここから静かに始められる入口です。",
          cta: "1分回復へ"
        },
        {
          label: "7-Day",
          title: "7日間の小さな回復",
          body: "毎日一度、自分の感覚へ戻る小さな旅です。",
          cta: "7-Dayへ"
        },
        {
          label: "BASIC",
          title: "Life Rhythm Membership",
          body: "朝・昼・夜のリズムで、回復を生活の流れへ育てます。",
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
      title: "회복에서, 리듬과 깨어남으로.",
      description: "Meisou Life는 단순한 회복으로 끝나지 않고, 사람이 본래의 리듬과 의식으로 돌아가도록 돕는 Human Recovery Operating System입니다.",
      libraryCta: "HROS Library",
      stages: [
        {
          label: "Recovery",
          body: "먼저 신경과 감정을 조용히 정돈하며 자신에게 돌아옵니다."
        },
        {
          label: "Rhythm",
          body: "한 번의 전환이 아니라 다시 돌아올 수 있는 생활 흐름을 만듭니다."
        },
        {
          label: "Awakening",
          body: "자신의 상태를 알아차리고 다시 선택하는 힘을 조금씩 회복합니다."
        },
        {
          label: "Coexistence",
          body: "회복을 나에게서 끝내지 않고 관계와 사회로 넓혀갑니다."
        }
      ]
    },
    journey: {
      eyebrow: "Your Journey",
      title: "FREE에서, 7-Day, BASIC으로.",
      description: "자세한 설명보다 지금의 자리에서 다음 단계로 자연스럽게 이어지는 흐름만 남겼습니다.",
      cards: [
        {
          label: "FREE",
          title: "1분 회복",
          body: "마음이 무거운 날에도 지금 여기서 조용히 시작할 수 있는 입구입니다.",
          cta: "1분 회복으로"
        },
        {
          label: "7-Day",
          title: "7일간의 작은 회복",
          body: "매일 한 번, 자신의 감각으로 돌아오는 작은 여정입니다.",
          cta: "7-Day로"
        },
        {
          label: "BASIC",
          title: "Life Rhythm Membership",
          body: "아침, 낮, 저녁의 리듬으로 회복을 생활의 흐름으로 키웁니다.",
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
      title: "From recovery into rhythm and awakening.",
      description: "Meisou Life is a Human Recovery Operating System that helps people move from recovery into restored rhythm, awareness, and coexistence.",
      libraryCta: "HROS Library",
      stages: [
        {
          label: "Recovery",
          body: "Calm the nervous system and emotions first, then return to yourself."
        },
        {
          label: "Rhythm",
          body: "Build a pattern you can return to, not a one-time moment of relief."
        },
        {
          label: "Awakening",
          body: "Gradually recover the ability to notice your state and choose again."
        },
        {
          label: "Coexistence",
          body: "Let recovery extend beyond the self into relationships and society."
        }
      ]
    },
    journey: {
      eyebrow: "Your Journey",
      title: "From FREE to 7-Day to BASIC.",
      description: "Rather than explaining every detail, the homepage simply guides you from where you are to the next calm step.",
      cards: [
        {
          label: "FREE",
          title: "1-Minute Recovery",
          body: "A quiet entrance for the days when life already feels heavy.",
          cta: "Enter FREE"
        },
        {
          label: "7-Day",
          title: "7-Day Recovery Journey",
          body: "A small daily path back to your senses and steadiness.",
          cta: "Enter 7-Day"
        },
        {
          label: "BASIC",
          title: "Life Rhythm Membership",
          body: "Carry recovery through morning, daytime, and evening rhythm.",
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
      <h2 className="mt-4 text-balance font-serif text-[clamp(2rem,5vw,4rem)] leading-[1.08] text-white">{title}</h2>
      <p className="mt-4 text-pretty text-base leading-8 text-white/64 sm:text-lg">{description}</p>
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
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,17,26,0.9),rgba(8,17,26,0.72))] px-6 py-9 shadow-[0_24px_90px_rgba(2,8,14,0.26)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <SectionHeader
            eyebrow={copy.hros.eyebrow}
            title={copy.hros.title}
            description={copy.hros.description}
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {copy.hros.stages.map((stage, index) => (
              <article
                key={stage.label}
                className="rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-6"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-[#d8c08a]/74">{`0${index + 1}`}</p>
                <h3 className="mt-4 text-xl font-semibold text-white">{stage.label}</h3>
                <p className="mt-3 text-sm leading-7 text-white/66">{stage.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/brain-education"
              className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
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

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="flex h-full flex-col rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-7 shadow-[0_20px_80px_rgba(7,17,31,0.16)] sm:px-8 sm:py-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d8c08a]/78">{copy.journey.cards[0].label}</p>
            <h3 className="mt-4 text-2xl font-semibold text-white">{copy.journey.cards[0].title}</h3>
            <p className="mt-4 flex-1 text-base leading-8 text-white/68">{copy.journey.cards[0].body}</p>
            <button
              type="button"
              onClick={scrollToRecovery}
              className="mt-8 inline-flex min-h-[54px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              {copy.journey.cards[0].cta}
            </button>
          </article>

          <article className="flex h-full flex-col rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-7 shadow-[0_20px_80px_rgba(7,17,31,0.16)] sm:px-8 sm:py-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d8c08a]/78">{copy.journey.cards[1].label}</p>
            <h3 className="mt-4 text-2xl font-semibold text-white">{copy.journey.cards[1].title}</h3>
            <p className="mt-4 flex-1 text-base leading-8 text-white/68">{copy.journey.cards[1].body}</p>
            <Link
              href="/rhythm-journey"
              className="mt-8 inline-flex min-h-[54px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              {copy.journey.cards[1].cta}
            </Link>
          </article>

          <article className="flex h-full flex-col rounded-[32px] border border-[#d8c08a]/20 bg-[linear-gradient(180deg,rgba(212,186,117,0.12),rgba(255,255,255,0.03))] px-6 py-7 shadow-[0_20px_80px_rgba(7,17,31,0.16)] sm:px-8 sm:py-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f0ddb0]/84">{copy.journey.cards[2].label}</p>
            <h3 className="mt-4 text-2xl font-semibold text-white">{copy.journey.cards[2].title}</h3>
            <p className="mt-4 flex-1 text-base leading-8 text-white/72">{copy.journey.cards[2].body}</p>
            <button
              type="button"
              onClick={handleBasicJourneyCta}
              className="mt-8 inline-flex min-h-[54px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#f0ddb0_0%,#dcc086_56%,#caa160_100%)] px-6 py-3 text-sm font-semibold text-[#16202b] shadow-[0_16px_36px_rgba(212,186,117,0.18)] transition hover:brightness-[1.03]"
            >
              {copy.journey.cards[2].cta}
            </button>
          </article>
        </div>
      </section>
    </div>
  );
}
