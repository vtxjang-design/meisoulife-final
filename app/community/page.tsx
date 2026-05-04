import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { communityChannels } from "@/lib/content";
import { getBasicMembershipCheckoutUrl, getLeaderFormUrl, getLineInviteLinks } from "@/lib/site";

export default function CommunityPage() {
  const invites = getLineInviteLinks();
  const basicUrl = getBasicMembershipCheckoutUrl();
  const leaderFormUrl = getLeaderFormUrl();

  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading
        eyebrow="Community"
        title="ここは、がんばる場所ではありません。毎日、共に目覚め直す場所です。"
        description="1分の静けさを一人で終わらせず、7日チャレンジ、LINEコミュニティ、会員リズム、リーダー成長へ自然につながる導線に整えています。"
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <article className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">LINE Community</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">7日間、共に始める入口</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">
            朝のリマインド、夜の声かけ、7日チャレンジ案内が届く無料コミュニティです。小さな実践を、仲間と共に続けます。
          </p>
          <Link
            href={invites.free}
            className="mt-6 inline-flex rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92]"
          >
            LINEで無料参加
          </Link>
        </article>
        <article className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Membership</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">無料参加から会員リズムへ</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">
            ひとりの回復を習慣に変え、共に生きるリズムへ育てる基本会員の導線です。毎日戻る場を生活の中につくります。
          </p>
          <Link
            href={basicUrl}
            className="mt-6 inline-flex rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Basic会員へ進む
          </Link>
        </article>
        <article className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Leader Vision</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">共生人材への入口</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">
            共に目覚めるリズムを支える人へ。リーダーフォームと育成導線を通じて、2030年10万人の共生人材ビジョンへつながります。
          </p>
          <Link
            href={leaderFormUrl}
            className="mt-6 inline-flex rounded-md border border-gold/40 px-5 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10"
          >
            リーダーフォームを見る
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
