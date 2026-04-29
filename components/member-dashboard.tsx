import Link from "next/link";
import { getChallengeProgress } from "@/lib/challenge";

type MemberDashboardProps = {
  plan: string;
  challengeDay?: number;
  streakCount: number;
  aiUsage: {
    used: number;
    limit: number | "unlimited";
  };
  upcomingEvents: string[];
  candidateLeader?: boolean;
  communityUrl?: string;
};

export function MemberDashboard({
  plan,
  challengeDay = 1,
  streakCount,
  aiUsage,
  upcomingEvents,
  candidateLeader = false,
  communityUrl = "/community"
}: MemberDashboardProps) {
  const challengeProgress = getChallengeProgress(challengeDay);

  return (
    <div className="grid gap-6">
      {candidateLeader ? (
        <div className="rounded-lg border border-gold/40 bg-gold/10 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Leader Program</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">リーダープログラムに招待されました</h2>
          <p className="mt-2 text-sm leading-7 text-white/72">
            継続実践、チェックイン、コミュニティ貢献が一定基準を超えました。次のステップへ進めます。
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="premium-card rounded-lg p-5">
          <p className="text-sm text-white/60">Current plan</p>
          <p className="mt-2 text-2xl font-semibold text-white">{plan}</p>
        </div>
        <div className="premium-card rounded-lg p-5">
          <p className="text-sm text-white/60">Challenge progress</p>
          <p className="mt-2 text-2xl font-semibold text-white">Day {challengeDay}/7</p>
        </div>
        <div className="premium-card rounded-lg p-5">
          <p className="text-sm text-white/60">Streak count</p>
          <p className="mt-2 text-2xl font-semibold text-white">{streakCount}日</p>
        </div>
        <div className="premium-card rounded-lg p-5">
          <p className="text-sm text-white/60">AI coach usage</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {aiUsage.used}/{aiUsage.limit === "unlimited" ? "∞" : aiUsage.limit}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <section className="premium-card rounded-lg p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Challenge</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">7日チャレンジの進行</h2>
            </div>
            <Link href="/challenge" className="text-sm text-gold">
              進捗を開く
            </Link>
          </div>
          <div className="mt-6 grid gap-3">
            {challengeProgress.map((item) => (
              <div
                key={item.day}
                className={`rounded-md border px-4 py-3 text-sm ${
                  item.active
                    ? "border-gold/60 bg-gold/10 text-white"
                    : item.completed
                      ? "border-moss/40 bg-moss/10 text-white/88"
                      : "border-white/10 bg-white/[0.03] text-white/68"
                }`}
              >
                Day {item.day} · {item.title}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6">
          <div className="premium-card rounded-lg p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">Community</p>
            <h3 className="mt-3 text-xl font-semibold text-white">コミュニティ導線</h3>
            <p className="mt-3 text-sm leading-7 text-white/72">
              毎日のチェックイン、今日の小さな前進、質問、イベント、リーダー案内にすぐアクセスできます。
            </p>
            <Link
              href={communityUrl}
              className="mt-5 inline-flex rounded-md bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              コミュニティへ
            </Link>
          </div>

          <div className="premium-card rounded-lg p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">Upcoming live events</p>
            <div className="mt-4 grid gap-3">
              {upcomingEvents.map((event) => (
                <div key={event} className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/82">
                  {event}
                </div>
              ))}
            </div>
            <Link
              href="/pricing"
              className="mt-5 inline-flex rounded-md border border-gold/50 px-4 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10"
            >
              プランをアップグレード
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
