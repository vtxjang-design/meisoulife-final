"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { useSiteCopy } from "@/lib/i18n";

export default function BrainEducationPage() {
  const copy = useSiteCopy().brainEducationPage;

  return (
    <div className="section-shell pb-24 pt-16 sm:pt-20">
      <section className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-10 sm:px-10 sm:py-12">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.subtitle} />
        <p className="mt-6 max-w-4xl text-base leading-8 text-white/72 sm:text-lg">{copy.intro}</p>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-gold/82 sm:text-base">{copy.relationship}</p>
        <p className="mt-6 text-sm font-medium leading-7 text-white/78 sm:text-base">{copy.journey}</p>

        <section className="mt-14 border-t border-white/10 pt-10 sm:mt-16 sm:pt-12">
          <h2 className="max-w-3xl font-serif text-3xl leading-tight text-white sm:text-4xl">{copy.whatIs.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base sm:leading-8">{copy.whatIs.description}</p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {copy.whatIs.ideas.map((idea) => (
              <article key={idea.title} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-semibold text-white">{idea.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">{idea.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-4xl text-sm leading-7 text-white/76 sm:text-base">{copy.whatIs.closing}</p>
        </section>

        <section className="mt-14 border-t border-white/10 pt-10 sm:mt-16 sm:pt-12">
          <h2 className="max-w-3xl font-serif text-3xl leading-tight text-white sm:text-4xl">{copy.fiveSteps.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base sm:leading-8">{copy.fiveSteps.description}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {copy.fiveSteps.items.map((step, index) => (
              <article key={step.name} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs tracking-[0.16em] text-gold/78">0{index + 1}</p>
                <h3 className="mt-3 text-base font-semibold leading-6 text-white">{step.name}</h3>
                <p className="mt-1 text-xs leading-5 text-gold/68">{step.english}</p>
                <p className="mt-3 text-sm leading-6 text-white/68">{step.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm font-medium leading-7 text-gold/82 sm:text-base">{copy.fiveSteps.journey}</p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-white/64">{copy.fiveSteps.dignity}</p>
        </section>

        <section className="mt-14 border-t border-white/10 pt-10 sm:mt-16 sm:pt-12">
          <h2 className="max-w-3xl font-serif text-3xl leading-tight text-white sm:text-4xl">{copy.bos.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base sm:leading-8">{copy.bos.description}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {copy.bos.items.map((item, index) => (
              <article key={item.question} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs tracking-[0.16em] text-gold/78">0{index + 1}</p>
                <h3 className="mt-3 text-sm font-semibold leading-6 text-white">{item.principle}</h3>
                <p className="mt-3 text-sm leading-6 text-white/68">{item.question}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-4xl text-sm leading-7 text-white/76 sm:text-base">{copy.bos.clarification}</p>
        </section>

        <section className="mt-14 border-t border-white/10 pt-10 sm:mt-16 sm:pt-12">
          <h2 className="max-w-3xl font-serif text-3xl leading-tight text-white sm:text-4xl">{copy.dailyLife.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base sm:leading-8">{copy.dailyLife.description}</p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {copy.dailyLife.areas.map((area) => (
              <article key={area.title} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-semibold text-white">{area.title}</h3>
                <div className="mt-5 space-y-5">
                  {area.items.map((item) => (
                    <div key={item.title}>
                      <p className="text-sm font-medium text-gold/84">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-white/68">{item.body}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-4xl rounded-[24px] border border-gold/16 bg-gold/[0.05] px-5 py-4 text-sm leading-7 text-white/76 sm:text-base">{copy.dailyLife.safeguard}</p>
        </section>

        <section className="mt-14 border-t border-white/10 pt-10 sm:mt-16 sm:pt-12">
          <h2 className="max-w-3xl font-serif text-3xl leading-tight text-white sm:text-4xl">{copy.productExperience.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base sm:leading-8">{copy.productExperience.description}</p>
          <p className="mt-6 text-sm font-medium leading-7 text-gold/82 sm:text-base">{copy.productExperience.statement}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {copy.productExperience.items.map((item) => (
              <article key={item.title} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/68">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 border-t border-white/10 pt-10 sm:mt-16 sm:pt-12">
          <h2 className="max-w-3xl font-serif text-3xl leading-tight text-white sm:text-4xl">{copy.coexistence.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base sm:leading-8">{copy.coexistence.description}</p>
          <p className="mt-6 max-w-4xl text-sm leading-7 text-white/72 sm:text-base">{copy.coexistence.body}</p>
          <p className="mt-6 text-sm font-medium leading-7 text-gold/82 sm:text-base">{copy.coexistence.expansion}</p>
          <p className="mt-3 text-sm leading-7 text-white/76 sm:text-base">{copy.coexistence.statement}</p>
        </section>

        <section
          id="founder-message"
          className="mt-10 rounded-[32px] border border-gold/14 bg-gold/[0.05] px-6 py-8 sm:px-8 sm:py-10"
        >
          <p className="max-w-full text-xs tracking-[0.16em] text-gold/82 sm:tracking-[0.2em]">
            {copy.founderMessageTitle}
          </p>
          <h2 className="mt-4 font-serif text-2xl leading-tight text-white sm:text-3xl">{copy.founderMessageSubtitle}</h2>
          <div className="mt-6 h-px w-full bg-white/10" />
          <p className="mt-6 max-w-4xl whitespace-pre-line text-base leading-8 text-white/76 sm:text-lg sm:leading-9">
            {copy.founderMessageBody}
          </p>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/#one-minute-experience"
            className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
          >
            {copy.primary}
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
          >
            {copy.secondary}
          </Link>
        </div>
      </section>
    </div>
  );
}
