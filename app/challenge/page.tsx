import { ChallengeSignupForm } from "@/components/challenge-signup-form";
import { SectionHeading } from "@/components/section-heading";
import { challengeDays } from "@/lib/content";

export default function ChallengePage() {
  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading
        eyebrow="Free 7-Day Challenge"
        title="7日間、共に目覚めるリズムを始める"
        description="朝の1分、夜の3分。自分に戻る小さな実践を7日重ねながら、回復からつながりへ進む土台を育てます。"
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
      <div className="mt-10 rounded-[24px] border border-gold/20 bg-gold/10 p-6 text-center">
        <p className="text-2xl font-semibold text-white">このリズムを、ひとりで終わらせない。</p>
        <p className="mt-3 text-base text-white/72">瞑想lifeメンバーとして続ける。</p>
      </div>
    </div>
  );
}
