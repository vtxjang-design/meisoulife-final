"use client";

import { GateCard } from "@/components/gate-card";
import { useLocaleCopy } from "@/lib/i18n";

type ZeroGateDestinationKey = "overload" | "anxiety" | "low-energy" | "distracted" | "reset-mood" | "sleep";

type ZeroGateSectionProps = {
  onEnterGate: (gateKey: ZeroGateDestinationKey) => void;
};

type ZeroGateCard = {
  key: ZeroGateDestinationKey;
  emoji: string;
  label: string;
  worldName: string;
  description: string;
};

const zeroGateCopy = {
  jp: {
    eyebrow: "ZERO GATE — 1分リセット",
    mobilePrompt: "今の自分に合う入口を選びましょう。",
    title: "1分だけ",
    description: "呼吸・回復・静けさ",
    encouragement: "",
    hoverCta: "1分はじめる",
    gates: [
      { key: "overload", emoji: "🌲", label: "脳過負荷", worldName: "思考を空ける森", description: "頭の中が複雑すぎるとき" },
      { key: "anxiety", emoji: "🏕️", label: "不安", worldName: "安心の休息地", description: "心が不安なとき" },
      { key: "low-energy", emoji: "🔥", label: "気力不足", worldName: "生命の火種", description: "心と体に力が出ないとき" },
      { key: "distracted", emoji: "🌊", label: "散漫", worldName: "集中の道", description: "集中がほどけるとき" },
      { key: "reset-mood", emoji: "🌊", label: "気分転換", worldName: "自由の海", description: "空気を変えたいとき" },
      { key: "sleep", emoji: "🌙", label: "睡眠", worldName: "月明かりの休み場", description: "眠りに入りにくいとき" }
    ] satisfies ZeroGateCard[]
  },
  kr: {
    eyebrow: "ZERO GATE — 1분 리셋",
    mobilePrompt: "지금 필요한 문을 선택하세요.",
    title: "1분만",
    description: "호흡 · 회복 · 고요",
    encouragement: "",
    hoverCta: "1분 시작하기",
    gates: [
      { key: "overload", emoji: "🌲", label: "뇌과부하", worldName: "생각을 비우는 숲", description: "머리가 너무 복잡할 때" },
      { key: "anxiety", emoji: "🏕️", label: "불안", worldName: "안심의 쉼터", description: "마음이 불안할 때" },
      { key: "low-energy", emoji: "🔥", label: "기력 없음", worldName: "생명의 불씨", description: "몸과 마음에 힘이 없을 때" },
      { key: "distracted", emoji: "🌊", label: "산만", worldName: "집중의 길", description: "집중이 흐트러질 때" },
      { key: "reset-mood", emoji: "🌊", label: "기분전환", worldName: "자유의 바다", description: "공기를 바꾸고 싶을 때" },
      { key: "sleep", emoji: "🌙", label: "수면", worldName: "달빛 쉼터", description: "잠들기 어려울 때" }
    ] satisfies ZeroGateCard[]
  },
  en: {
    eyebrow: "ZERO GATE — 1-Minute Reset",
    mobilePrompt: "Choose the door you need now.",
    title: "One minute",
    description: "Breath · Recovery · Quiet",
    encouragement: "",
    hoverCta: "Begin 1 minute",
    gates: [
      { key: "overload", emoji: "🌲", label: "Mental Overload", worldName: "Empty Mind Forest", description: "When your mind feels too crowded" },
      { key: "anxiety", emoji: "🏕️", label: "Anxiety", worldName: "Rest Haven", description: "When your heart feels uneasy" },
      { key: "low-energy", emoji: "🔥", label: "Low Energy", worldName: "Spark of Life", description: "When body and mind feel drained" },
      { key: "distracted", emoji: "🌊", label: "Distraction", worldName: "Path of Focus", description: "When your attention keeps scattering" },
      { key: "reset-mood", emoji: "🌊", label: "Refresh", worldName: "Sea of Freedom", description: "When you want to change the air" },
      { key: "sleep", emoji: "🌙", label: "Sleep", worldName: "Moonlight Resting Place", description: "When it is hard to fall asleep" }
    ] satisfies ZeroGateCard[]
  }
} as const;

export function ZeroGateSection({ onEnterGate }: ZeroGateSectionProps) {
  const copy = useLocaleCopy(zeroGateCopy);

  return (
    <section id="zero-gate" className="mt-1 scroll-mt-24 sm:mt-5">
      <div className="relative overflow-visible rounded-[20px] border border-white/[0.02] bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.035),transparent_22%),radial-gradient(circle_at_82%_20%,rgba(107,168,159,0.035),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.008))] px-2.5 py-2.5 shadow-none sm:overflow-hidden sm:rounded-[28px] sm:border-white/4 sm:px-5 sm:py-5.5 sm:shadow-[0_12px_32px_rgba(7,17,31,0.1)] lg:px-6 lg:py-6">
        <div className="pointer-events-none absolute inset-0 sm:hidden">
          <div className="absolute right-[-4%] top-[7%] h-48 w-48 rounded-full bg-emerald-200/[0.06] blur-[92px] animate-meditation-ambient-breathe motion-reduce:animate-none" />
          <div className="absolute left-[-4%] top-[-2%] h-32 w-32 rounded-full bg-gold/[0.08] blur-[76px] animate-meditation-fog motion-reduce:animate-none" />
          <div className="absolute right-[8%] top-[14%] h-24 w-24 rounded-full bg-white/[0.02] blur-[56px] animate-meditation-float motion-reduce:animate-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_20%,rgba(126,162,171,0.1),transparent_19%),radial-gradient(circle_at_18%_0%,rgba(212,186,117,0.08),transparent_24%),linear-gradient(180deg,rgba(7,17,31,0.01),rgba(7,17,31,0.05)_16%,rgba(7,17,31,0.12)_56%,rgba(7,17,31,0.22))]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,22,0.01),rgba(4,12,22,0.04)_24%,rgba(4,12,22,0.12)_52%,rgba(4,12,22,0.24)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_68%,rgba(6,23,31,0.2),transparent_24%)]" />
        </div>
        <div className="relative max-w-[24ch] sm:max-w-[32rem]">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-gold/70 sm:text-[0.74rem] sm:tracking-[0.3em]">{copy.eyebrow}</p>
          <p className="mt-1 text-[13px] leading-[1.45] text-white/60 sm:hidden">{copy.mobilePrompt}</p>
          <h2 className="hero-measure keep-phrase mt-2 hidden whitespace-pre-line font-serif text-[clamp(1.34rem,5.1vw,2rem)] leading-[1.18] text-white sm:block sm:max-w-[13ch] sm:text-[clamp(1.6rem,3vw,2.12rem)]">
            {copy.title}
          </h2>
          <p className="body-measure keep-phrase mt-1.5 hidden whitespace-pre-line text-[clamp(0.9rem,3.1vw,0.98rem)] leading-[1.65] text-white/58 sm:block sm:mt-2 sm:max-w-[20ch] sm:text-[0.98rem] sm:leading-[1.72]">
            {copy.description}
          </p>
        </div>
        {copy.encouragement ? (
          <p className="relative mt-3 max-w-[16ch] text-[13px] leading-6 text-white/44 sm:mt-5 sm:max-w-none sm:text-sm sm:leading-7">{copy.encouragement}</p>
        ) : null}
        <div className="relative mt-3 grid auto-rows-fr grid-cols-2 gap-2.5 min-[400px]:gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-3 lg:gap-3.5 xl:grid-cols-3">
          {copy.gates.map((gate) => (
            <GateCard
              key={gate.key}
              emoji={gate.emoji}
              label={gate.label}
              worldName={gate.worldName}
              description={gate.description}
              ctaLabel={copy.hoverCta}
              onClick={() => onEnterGate(gate.key)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
