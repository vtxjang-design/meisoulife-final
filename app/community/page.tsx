import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { communityChannels } from "@/lib/content";
import { getLineInviteLinks } from "@/lib/site";

export default function CommunityPage() {
  const invites = getLineInviteLinks();

  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading
        eyebrow="Community"
        title="ひとりで頑張らない瞑想習慣"
        description="無料ユーザーはLINE参加リンク、有料ユーザーは会員導線とプライベートリンクへ進める設計です。"
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <article className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Free users</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">無料チャレンジ参加者向けLINE</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">
            朝のリマインド、7日チャレンジ案内、やさしい声かけが届く入口です。
          </p>
          <Link
            href={invites.free}
            className="mt-6 inline-flex rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92]"
          >
            無料参加
          </Link>
        </article>
        <article className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Paid users</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">会員専用の深い実践導線</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">
            継続記録、ライブ案内、質問、リーダー育成がひとつの流れでつながります。
          </p>
          <Link
            href={invites.member}
            className="mt-6 inline-flex rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            メンバーになる
          </Link>
        </article>
        <article className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Leader users</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">リーダー専用のつながり</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">
            リーダー候補やリーダー向けの案内、運営連絡、育成コンテンツへつながる導線です。
          </p>
          <Link
            href={invites.leader}
            className="mt-6 inline-flex rounded-md border border-gold/40 px-5 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10"
          >
            リーダー招待リンク
          </Link>
        </article>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {communityChannels.map((channel) => (
          <div key={channel} className="premium-card rounded-lg px-4 py-5 text-center text-sm text-white/82">
            {channel}
          </div>
        ))}
      </div>
    </div>
  );
}
