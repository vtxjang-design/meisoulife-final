"use client";

import { GateCard } from "@/components/gate-card";
import { useLocaleCopy } from "@/lib/i18n";
import { Flame, Moon, Route, TentTree, Trees, Waves, type LucideIcon } from "lucide-react";

type ZeroGateDestinationKey = "overload" | "anxiety" | "low-energy" | "distracted" | "reset-mood" | "sleep";

type ZeroGateSectionProps = {
  onEnterGate: (gateKey: ZeroGateDestinationKey) => void;
};

type ZeroGateCard = {
  key: ZeroGateDestinationKey;
  label: string;
  worldName: string;
  description: string;
};

const zeroGateCopy = {
  jp: {
    eyebrow: "ZERO GATE — 1分リセット",
    mobilePrompt: "",
    title: "1分だけ",
    description: "呼吸・回復・静けさ",
    encouragement: "",
    hoverCta: "1分はじめる",
    gates: [
      { key: "overload", label: "脳過負荷", worldName: "思考を空ける森", description: "頭の中が複雑すぎるとき" },
      { key: "anxiety", label: "不安", worldName: "安心の休息地", description: "心が不安なとき" },
      { key: "low-energy", label: "気力不足", worldName: "生命の火種", description: "心と体に力が出ないとき" },
      { key: "distracted", label: "散漫", worldName: "集中の道", description: "集中がほどけるとき" },
      { key: "reset-mood", label: "気分転換", worldName: "自由の海", description: "空気を変えたいとき" },
      { key: "sleep", label: "睡眠", worldName: "月明かりの休み場", description: "眠りに入りにくいとき" }
    ] satisfies ZeroGateCard[]
  },
  kr: {
    eyebrow: "ZERO GATE — 1분 리셋",
    mobilePrompt: "",
    title: "1분만",
    description: "호흡 · 회복 · 고요",
    encouragement: "",
    hoverCta: "1분 시작하기",
    gates: [
      { key: "overload", label: "뇌과부하", worldName: "생각을 비우는 숲", description: "머리가 너무 복잡할 때" },
      { key: "anxiety", label: "불안", worldName: "안심의 쉼터", description: "마음이 불안할 때" },
      { key: "low-energy", label: "기력 없음", worldName: "생명의 불씨", description: "몸과 마음에 힘이 없을 때" },
      { key: "distracted", label: "산만", worldName: "집중의 길", description: "집중이 흐트러질 때" },
      { key: "reset-mood", label: "기분전환", worldName: "자유의 바다", description: "공기를 바꾸고 싶을 때" },
      { key: "sleep", label: "수면", worldName: "달빛 쉼터", description: "잠들기 어려울 때" }
    ] satisfies ZeroGateCard[]
  },
  en: {
    eyebrow: "ZERO GATE — 1-Minute Reset",
    mobilePrompt: "",
    title: "One minute",
    description: "Breath · Recovery · Quiet",
    encouragement: "",
    hoverCta: "Begin 1 minute",
    gates: [
      { key: "overload", label: "Mental Overload", worldName: "Empty Mind Forest", description: "When your mind feels too crowded" },
      { key: "anxiety", label: "Anxiety", worldName: "Rest Haven", description: "When your heart feels uneasy" },
      { key: "low-energy", label: "Low Energy", worldName: "Spark of Life", description: "When body and mind feel drained" },
      { key: "distracted", label: "Distraction", worldName: "Path of Focus", description: "When your attention keeps scattering" },
      { key: "reset-mood", label: "Refresh", worldName: "Sea of Freedom", description: "When you want to change the air" },
      { key: "sleep", label: "Sleep", worldName: "Moonlight Resting Place", description: "When it is hard to fall asleep" }
    ] satisfies ZeroGateCard[]
  }
} as const;

const gateIcons: Record<ZeroGateDestinationKey, LucideIcon> = {
  overload: Trees,
  anxiety: TentTree,
  "low-energy": Flame,
  distracted: Route,
  "reset-mood": Waves,
  sleep: Moon
};

const gateTones: Record<ZeroGateDestinationKey, string> = {
  overload: "rgba(53, 102, 88, 0.18)",
  anxiety: "rgba(132, 102, 67, 0.17)",
  "low-energy": "rgba(137, 79, 48, 0.17)",
  distracted: "rgba(71, 101, 126, 0.18)",
  "reset-mood": "rgba(43, 91, 127, 0.18)",
  sleep: "rgba(91, 100, 139, 0.17)"
};

export function ZeroGateSection({ onEnterGate }: ZeroGateSectionProps) {
  const copy = useLocaleCopy(zeroGateCopy);

  return (
    <section id="zero-gate" className="mt-1 scroll-mt-24 sm:mt-5">
      <div className="relative overflow-visible border-0 bg-transparent px-0 py-0 shadow-none sm:overflow-hidden sm:rounded-[28px] sm:border sm:border-white/4 sm:bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.035),transparent_22%),radial-gradient(circle_at_82%_20%,rgba(107,168,159,0.035),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.008))] sm:px-5 sm:py-5.5 sm:shadow-[0_12px_32px_rgba(7,17,31,0.1)] lg:px-6 lg:py-6">
        <div className="pointer-events-none absolute inset-0 sm:hidden">
          <div className="absolute right-[-4%] top-[7%] h-48 w-48 rounded-full bg-emerald-200/[0.04] blur-[92px]" />
          <div className="absolute left-[-4%] top-[-2%] h-32 w-32 rounded-full bg-gold/[0.06] blur-[76px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_20%,rgba(126,162,171,0.1),transparent_19%),radial-gradient(circle_at_18%_0%,rgba(212,186,117,0.08),transparent_24%),linear-gradient(180deg,rgba(7,17,31,0.01),rgba(7,17,31,0.05)_16%,rgba(7,17,31,0.12)_56%,rgba(7,17,31,0.22))]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,22,0.01),rgba(4,12,22,0.04)_24%,rgba(4,12,22,0.12)_52%,rgba(4,12,22,0.24)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_68%,rgba(6,23,31,0.2),transparent_24%)]" />
        </div>
        <div className="relative max-w-[24ch] sm:max-w-[32rem]">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-gold/60 sm:text-[0.74rem] sm:tracking-[0.3em]">{copy.eyebrow}</p>
          {copy.mobilePrompt ? <p className="mt-1 text-[13px] leading-[1.45] text-white/60 sm:hidden">{copy.mobilePrompt}</p> : null}
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
        <div className="relative mt-2.5 grid auto-rows-fr grid-cols-2 gap-2.5 min-[400px]:gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-3 lg:gap-3.5 xl:grid-cols-3">
          {copy.gates.map((gate) => {
            const Icon = gateIcons[gate.key];

            return <GateCard
              key={gate.key}
              icon={<Icon aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 sm:h-[17px] sm:w-[17px]" />}
              label={gate.label}
              worldName={gate.worldName}
              description={gate.description}
              ctaLabel={copy.hoverCta}
              tone={gateTones[gate.key]}
              onClick={() => onEnterGate(gate.key)}
            />;
          })}
        </div>
      </div>
    </section>
  );
}
