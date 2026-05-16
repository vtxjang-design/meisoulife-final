"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { useLanguage } from "@/lib/i18n";

const founderCopy = {
  jp: {
    eyebrow: "ILCHI Philosophy",
    title: "人間の価値は、\n内なる意識を目覚めさせることにある。",
    description:
      "瞑想lifeは、Brain Education創始者 ILCHI LEE（イ・スンホン）先生の哲学を土台に、人が本来持つ可能性、脳の主人として生きる力、そして共生の価値を育てます。",
    quote:
      "一人ひとりの意識の変化が、\n世界を変える。",
    chips: ["Brain Ownership", "Hongik Spirit", "Coexistence", "Earth Citizen Consciousness"],
    profileLabel: "Brain Education Founder",
    profileName: "ILCHI LEE",
    profileSub: "イ・スンホン",
    button: "哲学を静かに知る"
  },
  kr: {
    eyebrow: "ILCHI Philosophy",
    title: "인간의 가치는,\n내면의 의식을 깨우는 데 있습니다.",
    description:
      "瞑想life는 Brain Education 창시자 ILCHI LEE(이승헌) 선생의 철학을 바탕으로, 사람이 본래 지닌 가능성, 뇌의 주인으로 살아가는 힘, 그리고 공생의 가치를 길러갑니다.",
    quote:
      "한 사람 한 사람의 의식 변화가,\n세상을 바꿉니다.",
    chips: ["Brain Ownership", "Hongik Spirit", "Coexistence", "Earth Citizen Consciousness"],
    profileLabel: "Brain Education Founder",
    profileName: "ILCHI LEE",
    profileSub: "이승헌",
    button: "철학을 조용히 알아보기"
  },
  en: {
    eyebrow: "ILCHI Philosophy",
    title: "Human value begins\nwhen inner awareness awakens.",
    description:
      "Meisoulife is grounded in the philosophy of ILCHI LEE, founder of Brain Education. It helps people grow their original potential, the power to live as the owner of one’s brain, and the value of coexistence.",
    quote:
      "A change in each person’s consciousness\ncan change the world.",
    chips: ["Brain Ownership", "Hongik Spirit", "Coexistence", "Earth Citizen Consciousness"],
    profileLabel: "Brain Education Founder",
    profileName: "ILCHI LEE",
    profileSub: "Lee Seung Heun",
    button: "Discover the philosophy quietly"
  }
} as const;

export function FounderVisionSection() {
  const { language } = useLanguage();
  const copy = founderCopy[language];

  return (
    <section className="section-shell mt-24">
      <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.16),transparent_24%),linear-gradient(180deg,#091717_0%,#0b1621_58%,#09111a_100%)] px-6 py-10 sm:px-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-10 h-32 w-32 rounded-full bg-emerald-200/8 blur-3xl animate-meditation-ambient-breathe" />
          <div className="absolute right-[12%] top-16 h-36 w-36 rounded-full bg-gold/10 blur-3xl animate-meditation-fog" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,16,0.04),rgba(4,12,16,0.18))]" />
        </div>
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="rounded-[28px] border border-gold/20 bg-gold/[0.08] p-6 sm:p-7">
            <p className="whitespace-pre-line font-serif text-xl leading-9 text-white/92 sm:text-2xl sm:leading-10">{copy.quote}</p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-7">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-gold/84">{copy.profileLabel}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{copy.profileName}</p>
              <p className="mt-1 text-sm text-white/58">{copy.profileSub}</p>
            </div>
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
