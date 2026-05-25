"use client";

import { GateCard } from "@/components/gate-card";
import { SectionHeading } from "@/components/section-heading";
import { useLocaleCopy } from "@/lib/i18n";

type ZeroGateSectionProps = {
  onEnterGate: (gateKey: string) => void;
};

const zeroGateCopy = {
  jp: {
    eyebrow: "ZERO GATE — 1分リセット",
    title: "今のあなたは、\nどこから整えますか？",
    description:
      "すぐわかる実用的な入口から始めて、静かな1分の中で自分のリズムへ戻ります。",
    encouragement: "少しずつで、大丈夫です。",
    gates: [
      { key: "overload", emoji: "🧠⚡", label: "脳過負荷", worldName: "「思考を空ける森」", description: "頭の中が複雑すぎるとき" },
      { key: "anxiety", emoji: "😰", label: "不安", worldName: "「安全の洞窟」", description: "心が不安なとき" },
      { key: "low-energy", emoji: "🥱", label: "気力不足", worldName: "「生命の火種」", description: "心と体に力が出ないとき" },
      { key: "distracted", emoji: "🌀", label: "散漫", worldName: "「集中の道」", description: "集中がほどけるとき" },
      { key: "reset-mood", emoji: "😄", label: "気分転換", worldName: "「気分転換の庭」", description: "空気を変えたいとき" },
      { key: "sleep", emoji: "🌙", label: "睡眠", worldName: "「月明かりの休み場」", description: "眠りに入りにくいとき" }
    ]
  },
  kr: {
    eyebrow: "ZERO GATE — 1분 리셋",
    title: "오늘은 어떤 상태를\n먼저 돌보고 싶으세요?",
    description:
      "지금의 상태에 맞는 작은 리셋부터 시작해보세요.\n조용한 1분 안에서 다시 내 리듬을 찾게 됩니다.",
    encouragement: "천천히여도 충분합니다.",
    gates: [
      { key: "overload", emoji: "🧠⚡", label: "뇌과부하", worldName: "「생각 비우는 숲」", description: "머리가 너무 복잡할 때" },
      { key: "anxiety", emoji: "😰", label: "불안", worldName: "「안전의 동굴」", description: "마음이 불안할 때" },
      { key: "low-energy", emoji: "🥱", label: "기력 없음", worldName: "「생명의 불씨」", description: "몸과 마음에 힘이 없을 때" },
      { key: "distracted", emoji: "🌀", label: "산만", worldName: "「집중의 길」", description: "집중이 흐트러질 때" },
      { key: "reset-mood", emoji: "😄", label: "기분전환", worldName: "「기분 전환의 정원」", description: "분위기를 바꾸고 싶을 때" },
      { key: "sleep", emoji: "🌙", label: "수면", worldName: "「달빛 쉼터」", description: "잠들기 어려울 때" }
    ]
  },
  en: {
    eyebrow: "ZERO GATE — 1-Minute Reset",
    title: "What kind of gate do you need right now?",
    description:
      "Begin with a practical entry you can recognize instantly, then return to your rhythm through one quiet minute.",
    encouragement: "A quiet minute is enough to begin.",
    gates: [
      { key: "overload", emoji: "🧠⚡", label: "Mental Overload", worldName: '"Forest of Empty Thoughts"', description: "When your mind feels too crowded" },
      { key: "anxiety", emoji: "😰", label: "Anxiety", worldName: '"Cave of Safety"', description: "When your heart feels uneasy" },
      { key: "low-energy", emoji: "🥱", label: "Low Energy", worldName: '"Spark of Life"', description: "When body and mind feel drained" },
      { key: "distracted", emoji: "🌀", label: "Distraction", worldName: '"Path of Focus"', description: "When your attention keeps scattering" },
      { key: "reset-mood", emoji: "😄", label: "Mood Reset", worldName: '"Garden of Renewal"', description: "When you want to change the atmosphere" },
      { key: "sleep", emoji: "🌙", label: "Sleep", worldName: '"Moonlight Rest Stop"', description: "When it is hard to fall asleep" }
    ]
  }
} as const;

export function ZeroGateSection({ onEnterGate }: ZeroGateSectionProps) {
  const copy = useLocaleCopy(zeroGateCopy);

  return (
    <section id="zero-gate" className="section-shell mt-12 scroll-mt-24 sm:mt-14">
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.12),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-7 shadow-[0_24px_80px_rgba(7,17,31,0.22)] sm:px-7 sm:py-8 lg:px-8 lg:py-8.5">
        <div className="pointer-events-none absolute inset-0 sm:hidden">
          <div className="absolute right-[-10%] top-[10%] h-40 w-40 rounded-full bg-emerald-200/[0.06] blur-[78px]" />
          <div className="absolute left-[-6%] top-0 h-28 w-28 rounded-full bg-gold/[0.08] blur-[64px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_22%,rgba(126,162,171,0.09),transparent_18%),radial-gradient(circle_at_18%_0%,rgba(212,186,117,0.08),transparent_24%),linear-gradient(180deg,rgba(7,17,31,0.01),rgba(7,17,31,0.12)_62%,rgba(7,17,31,0.18))]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,22,0.02),rgba(4,12,22,0.08)_24%,rgba(4,12,22,0.22)_100%)]" />
        </div>
        <div className="relative max-w-[19ch] sm:max-w-3xl">
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        </div>
        <p className="relative mt-5 text-sm leading-7 text-white/48">{copy.encouragement}</p>
        <div className="relative mt-5 grid grid-cols-2 gap-3 xl:grid-cols-3 xl:gap-4">
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
