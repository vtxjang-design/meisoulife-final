"use client";

import { GateCard } from "@/components/gate-card";
import { SectionHeading } from "@/components/section-heading";
import { useLanguage } from "@/lib/i18n";

type ZeroGateSectionProps = {
  onEnterGate: (gateKey: string) => void;
};

const zeroGateCopy = {
  jp: {
    eyebrow: "ZERO GATE — 1分リセット",
    title: "今、どんな入口が必要ですか？",
    description:
      "すぐわかる実用的な入口から始めて、静かな1分の中で自分のリズムへ戻ります。",
    cta: "この入口から入る",
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
    title: "지금 어떤 문이 필요하세요?",
    description:
      "바로 알아볼 수 있는 실용적인 문에서 시작해서, 조용한 1분 안에서 다시 내 리듬으로 돌아갑니다.",
    cta: "이 문으로 들어가기",
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
    cta: "Enter through this gate",
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
  const { language } = useLanguage();
  const copy = zeroGateCopy[language];

  return (
    <section id="zero-gate" className="section-shell mt-10 scroll-mt-24 sm:mt-14">
      <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.12),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-7 shadow-[0_24px_80px_rgba(7,17,31,0.22)] sm:px-7 sm:py-8 lg:px-8 lg:py-9">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-3 xl:gap-4">
          {copy.gates.map((gate) => (
            <GateCard
              key={gate.key}
              emoji={gate.emoji}
              label={gate.label}
              worldName={gate.worldName}
              description={gate.description}
              cta={copy.cta}
              onClick={() => onEnterGate(gate.key)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
