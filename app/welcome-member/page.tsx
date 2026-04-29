import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { absoluteUrl, getWelcomeMemberLinks } from "@/lib/site";

export const metadata: Metadata = {
  title: "メンバーようこそ",
  description: "瞑想lifeメンバー参加後の歓迎ページ。コミュニティ参加、1分瞑想、音声ガイド受け取りへすぐ進めます。",
  alternates: {
    canonical: absoluteUrl("/welcome-member")
  }
};

export default function WelcomeMemberPage() {
  const links = getWelcomeMemberLinks();

  return (
    <div className="section-shell py-14 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-5xl gap-8">
        <div className="premium-card overflow-hidden rounded-lg">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <p className="text-sm uppercase tracking-[0.34em] text-gold">Welcome Member</p>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">
                ご参加ありがとうございます。瞑想lifeメンバーへようこそ。
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
                ここから、つながり、実践、回復の流れが始まります。まずはコミュニティに入り、短い瞑想から今日のリズムを整えていきましょう。
              </p>
            </div>
            <div className="relative min-h-[260px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80"
                alt="やわらかな朝の瞑想風景"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            </div>
          </div>
        </div>

        <SectionHeading
          eyebrow="Next step"
          title="次の行動を、すぐ始められるように"
          description="ボタン先のURLは環境変数で後から簡単に差し替えできます。まずはこの3つから動線をつなげておくと、決済後の離脱が減ります。"
        />

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
          <Link
            href={links.community}
            className="premium-card rounded-lg p-6 transition hover:bg-white/[0.08]"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-gold">Community</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">LINEメンバーコミュニティ参加</h2>
            <p className="mt-4 text-sm leading-7 text-white/72">
              会員専用のLINE導線に入り、日々のチェックインや案内を受け取れます。
            </p>
            <span className="mt-6 inline-flex rounded-md bg-gold px-4 py-3 text-sm font-semibold text-ink">
              参加する
            </span>
          </Link>

          <Link
            href={links.meditationStart}
            className="premium-card rounded-lg p-6 transition hover:bg-white/[0.08]"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-gold">Meditation</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">1分瞑想スタート</h2>
            <p className="mt-4 text-sm leading-7 text-white/72">
              忙しい日でもすぐ始められる、短い実践からメンバー体験を始めます。
            </p>
            <span className="mt-6 inline-flex rounded-md border border-white/15 px-4 py-3 text-sm font-semibold text-white">
              始める
            </span>
          </Link>

          <Link
            href={links.audioGuide}
            className="premium-card rounded-lg p-6 transition hover:bg-white/[0.08]"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-gold">Audio Guide</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">音声ガイドを受け取る</h2>
            <p className="mt-4 text-sm leading-7 text-white/72">
              日常で繰り返し使える音声ガイドや回復ルーティンの入口につながります。
            </p>
            <span className="mt-6 inline-flex rounded-md border border-gold/40 px-4 py-3 text-sm font-semibold text-gold">
              受け取る
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
