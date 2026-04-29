import Link from "next/link";
import { getLeaderProgress, isLeaderCandidate, leaderThresholds } from "@/lib/leader";
import { SectionHeading } from "@/components/section-heading";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const leaderStages = [
  {
    title: "一般会員",
    description: "まずは自分の心を整え、毎日の実践を安定させる段階です。"
  },
  {
    title: "実践会員",
    description: "チェックインと参加が積み重なり、周りにもよい影響を与え始める段階です。"
  },
  {
    title: "Growth",
    description: "より深いルーティンとグループ参加を通して、自分の軸をさらに育てていきます。"
  },
  {
    title: "リーダー候補",
    description: "30日以上の有料継続、10回以上のチェックイン、3回以上の助け合いで候補になります。"
  },
  {
    title: "リーダー",
    description: "小さな場を支え、仲間の継続を助ける共同体の中核です。"
  }
] as const;

export default async function LeadersPage() {
  const supabase = await getSupabaseServerClient();
  let paidDays = 0;
  let checkInCount = 0;
  let helpfulComments = 0;
  let candidateLeader = false;

  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("paid_days, check_in_count, helpful_comments, candidate_leader")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      paidDays = profile?.paid_days || 0;
      checkInCount = profile?.check_in_count || 0;
      helpfulComments = profile?.helpful_comments || 0;
      candidateLeader = isLeaderCandidate({
        paidDays,
        checkInCount,
        helpfulComments,
        candidateLeader: profile?.candidate_leader
      });
    }
  }

  const progress = getLeaderProgress({
    paidDays,
    checkInCount,
    helpfulComments,
    candidateLeader
  });

  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading
        eyebrow="Leader Growth"
        title="実践からリーダー成長へ"
        description="瞑想lifeの1段階目は、ただ参加するだけで終わらず、継続、貢献、信頼を通して共同体を支える人を育てる構造です。"
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4">
          {leaderStages.map((stage, index) => (
            <article key={stage.title} className="premium-card rounded-lg p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Stage {index + 1}</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{stage.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/72">{stage.description}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-6">
          <div className="premium-card rounded-lg p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">Promotion Rule</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">リーダー候補になる条件</h2>
            <div className="mt-5 grid gap-3 text-sm text-white/82">
              <div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
                有料会員 {leaderThresholds.paidDays}日以上 · 現在 {progress.paidDays.current}日
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
                チェックイン {leaderThresholds.checkInCount}回以上 · 現在 {progress.checkInCount.current}回
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
                助け合いコメント {leaderThresholds.helpfulComments}回以上 · 現在 {progress.helpfulComments.current}回
              </div>
            </div>
          </div>

          <div className="premium-card rounded-lg p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">Invitation</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {candidateLeader ? "リーダープログラムに招待されました" : "リーダー候補までの進み具合"}
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/72">
              {candidateLeader
                ? "Supabaseの実データをもとに判定し、条件を満たした状態ではダッシュボードにも自動表示されます。"
                : "Supabaseの実データをもとに、あとどこを積み上げればよいかが見えるようにしています。"}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92]"
              >
                ダッシュボードで確認
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center justify-center rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                コミュニティ導線を見る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
