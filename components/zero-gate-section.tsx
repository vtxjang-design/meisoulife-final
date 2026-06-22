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
    title: "今日は\nどこへ\n戻りますか",
    description: "1分だけ\n立ち止まる場所\n\n呼吸 · 回復 · 静けさ",
    encouragement: "使うものではなく\n戻る場所を選びます",
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
    title: "오늘은\n어디로\n돌아가고 싶은가요",
    description: "1분 동안\n잠시 머무는 곳\n\n호흡 · 회복 · 고요",
    encouragement: "무언가를 쓰는 것이 아니라\n돌아갈 곳을 고릅니다",
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
    title: "Where would you like\nto return\ntoday",
    description: "A one-minute place\nto pause\n\nBreath · Recovery · Quiet",
    encouragement: "Choose a place to return\nnot a program to use",
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
    <section id="zero-gate" className="section-shell mt-12 scroll-mt-24 sm:mt-14">
      <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.11),transparent_24%),radial-gradient(circle_at_84%_22%,rgba(107,168,159,0.11),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.018))] px-4 py-6 shadow-[0_24px_72px_rgba(7,17,31,0.2)] sm:rounded-[32px] sm:px-7 sm:py-9 sm:shadow-[0_28px_88px_rgba(7,17,31,0.22)] lg:px-8 lg:py-10">
        <div className="pointer-events-none absolute inset-0 sm:hidden">
          <div className="absolute right-[-4%] top-[7%] h-48 w-48 rounded-full bg-emerald-200/[0.09] blur-[92px] animate-meditation-ambient-breathe motion-reduce:animate-none" />
          <div className="absolute left-[-4%] top-[-2%] h-32 w-32 rounded-full bg-gold/[0.11] blur-[76px] animate-meditation-fog motion-reduce:animate-none" />
          <div className="absolute right-[8%] top-[14%] h-24 w-24 rounded-full bg-white/[0.02] blur-[56px] animate-meditation-float motion-reduce:animate-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_20%,rgba(126,162,171,0.14),transparent_19%),radial-gradient(circle_at_18%_0%,rgba(212,186,117,0.1),transparent_24%),linear-gradient(180deg,rgba(7,17,31,0.01),rgba(7,17,31,0.06)_16%,rgba(7,17,31,0.14)_56%,rgba(7,17,31,0.26))]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,22,0.01),rgba(4,12,22,0.05)_24%,rgba(4,12,22,0.16)_52%,rgba(4,12,22,0.3)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_68%,rgba(6,23,31,0.2),transparent_24%)]" />
        </div>
        <div className="relative max-w-[18ch] sm:max-w-[44rem]">
          <p className="text-sm uppercase tracking-[0.3em] text-gold/90">{copy.eyebrow}</p>
          <h2 className="hero-measure keep-phrase mt-4 whitespace-pre-line font-serif text-[clamp(1.55rem,6vw,2.6rem)] leading-[1.28] text-white sm:max-w-[13ch] sm:text-[clamp(2rem,4vw,2.75rem)] sm:leading-[1.24]">
            {copy.title}
          </h2>
          <p className="body-measure keep-phrase mt-3 whitespace-pre-line text-[clamp(0.95rem,3.7vw,1.08rem)] leading-[1.72] text-white/66 sm:mt-4 sm:max-w-[20ch] sm:text-[1.08rem] sm:leading-[1.82]">
            {copy.description}
          </p>
        </div>
        {copy.encouragement ? (
          <p className="relative mt-3 max-w-[16ch] text-[13px] leading-6 text-white/44 sm:mt-5 sm:max-w-none sm:text-sm sm:leading-7">{copy.encouragement}</p>
        ) : null}
        <div className="relative mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:gap-3 lg:gap-4 xl:grid-cols-3">
          {copy.gates.map((gate) => (
            <GateCard
              key={gate.key}
              emoji={gate.emoji}
              label={gate.label}
              worldName={gate.worldName}
              description={gate.description}
              onClick={() => onEnterGate(gate.key)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
