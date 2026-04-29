import { ChallengeSignupForm } from "@/components/challenge-signup-form";
import { SectionHeading } from "@/components/section-heading";
import { challengeDays } from "@/lib/content";

export default function ChallengePage() {
  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading
        eyebrow="Free 7-Day Challenge"
        title="7日で心が整う朝習慣"
        description="毎朝3分音声ガイド、LINEサポート、心が軽くなる小さな習慣。7日目には、朝の空気が少しやさしく感じられる状態を目指します。"
      />
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          {challengeDays.map((item) => (
            <article key={item.day} className="premium-card rounded-lg p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Day {item.day}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm text-white/70">{item.focus}</p>
            </article>
          ))}
        </div>
        <ChallengeSignupForm />
      </div>
    </div>
  );
}
