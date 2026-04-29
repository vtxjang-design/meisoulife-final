import { MemberDashboard } from "@/components/member-dashboard";
import { isLeaderCandidate } from "@/lib/leader";
import { SectionHeading } from "@/components/section-heading";
import { getMockDashboard } from "@/lib/mock-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  searchParams: Promise<{
    email?: string;
    challenge?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const mock = getMockDashboard();
  let plan = mock.plan;
  let candidateLeader = false;
  let streakCount = mock.streakCount;
  let challengeDay = mock.challengeDay;

  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("current_plan, candidate_leader, paid_days, check_in_count, helpful_comments, challenge_day")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (profile?.current_plan) {
        plan = profile.current_plan;
      }

      if (typeof profile?.challenge_day === "number" && profile.challenge_day > 0) {
        challengeDay = profile.challenge_day;
      }

      if (typeof profile?.check_in_count === "number" && profile.check_in_count > 0) {
        streakCount = profile.check_in_count;
      }

      candidateLeader = isLeaderCandidate({
        paidDays: profile?.paid_days || 0,
        checkInCount: profile?.check_in_count || 0,
        helpfulComments: profile?.helpful_comments || 0,
        candidateLeader: profile?.candidate_leader
      });
    }
  }

  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading
        eyebrow="Dashboard"
        title={params.challenge ? "チャレンジを開始しました" : "会員ダッシュボード"}
        description="現在のプラン、チャレンジ進行、ストリーク、AIコーチ利用状況、イベント、コミュニティ導線をひとつにまとめています。"
      />
      <div className="mt-10">
        <MemberDashboard
          plan={plan}
          challengeDay={challengeDay}
          streakCount={streakCount}
          aiUsage={mock.aiUsage}
          upcomingEvents={mock.upcomingEvents}
          candidateLeader={candidateLeader}
          communityUrl={plan === "Free" ? mock.communityLinks.free : mock.communityLinks.paid}
        />
      </div>
      {params.email ? <p className="mt-6 text-sm text-white/50">登録メール: {params.email}</p> : null}
    </div>
  );
}
