"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { useLanguage } from "@/lib/i18n";

const founderCopy = {
  jp: {
    eyebrow: "Founder / Vision",
    title: "創設者メッセージ",
    description:
      "瞑想lifeは、イルチ・イ スンホン創設者が長年伝えてきた脳教育、弘益精神、地球市民意識を、AI時代の生活の中で実践できる形にした新しい学びと実践の場です。\n\n私たちは、瞑想を目的ではなく、人間の本来価値を回復する入口と考えます。一人ひとりが脳の主人となり、ゼロ意識から人・自然・地球と調和して生きる時、新しい共生文化が始まります。",
    quote:
      "瞑想lifeは、1分で戻れるやさしい入口から始まり、やがて人間の本来価値と共生文化へつながっていく Human Evolution OS です。",
    chips: ["Brain Education", "Hongik Spirit", "Earth Citizenship", "Coexistence Culture"],
    button: "脳教育と創設者ビジョンを見る"
  },
  kr: {
    eyebrow: "Founder / Vision",
    title: "창립자 메시지",
    description:
      "瞑想life는 일지 이승헌 창립자가 오랫동안 전해온 뇌교육, 홍익정신, 지구시민 의식을 AI 시대의 생활 속에서 실천할 수 있도록 만든 새로운 배움과 실천의 장입니다.\n\n우리는 명상을 목적이 아니라 인간의 본래 가치를 회복하는 입구로 봅니다. 한 사람 한 사람이 뇌의 주인이 되어 제로의식에서 사람·자연·지구와 조화롭게 살아갈 때, 새로운 공생 문화가 시작됩니다.",
    quote:
      "瞑想life는 1분 만에 돌아올 수 있는 부드러운 입구에서 시작해, 결국 인간의 본래 가치와 공생 문화를 향해 이어지는 Human Evolution OS입니다.",
    chips: ["Brain Education", "Hongik Spirit", "Earth Citizenship", "Coexistence Culture"],
    button: "뇌교육과 창립자 비전 보기"
  },
  en: {
    eyebrow: "Founder / Vision",
    title: "Founder’s Message",
    description:
      "Meditation Life is a living platform inspired by the vision of Ilchi Lee: Brain Education, Hongik spirit, Earth Citizenship, and a culture of coexistence.\n\nWe do not see meditation as the final goal. We see it as an entrance to recover our original human value. When each person becomes the owner of their brain and lives from Zero Consciousness in harmony with people, nature, and the Earth, a new culture of coexistence begins.",
    quote:
      "Meisoulife begins as a gentle one-minute return and gradually opens into a Human Evolution OS for original human value and coexistence culture.",
    chips: ["Brain Education", "Hongik Spirit", "Earth Citizenship", "Coexistence Culture"],
    button: "Explore Brain Education and the founder vision"
  }
} as const;

export function FounderVisionSection() {
  const { language } = useLanguage();
  const copy = founderCopy[language];

  return (
    <section className="section-shell mt-24">
      <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-10 sm:px-10">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="rounded-[28px] border border-gold/20 bg-gold/[0.08] p-6 sm:p-7">
            <p className="whitespace-pre-line font-serif text-xl leading-9 text-white/92 sm:text-2xl sm:leading-10">{copy.quote}</p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-7">
            <div className="flex flex-wrap gap-3">
              {copy.chips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/58">
                  {chip}
                </span>
              ))}
            </div>
            <Link
              href="/brain-education#founder-message"
              className="mt-8 inline-flex min-h-[54px] items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              {copy.button}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
