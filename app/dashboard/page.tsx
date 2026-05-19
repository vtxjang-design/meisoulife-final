import { MemberDashboard } from "@/components/member-dashboard";
import { isLeaderCandidate } from "@/lib/leader";
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
  let planKey: "free" | "basic" | "growth" | "inner_circle" = "free";
  let candidateLeader = false;
  let streakCount = mock.streakCount;
  let challengeDay = mock.challengeDay;

  if (supabase) {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;

    if (user) {
      const { data: membership, error: membershipError } = await supabase
        .from("memberships")
        .select("plan")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (membershipError) {
        console.error("Failed to fetch membership", membershipError);
      } else if (membership?.plan === "basic" || membership?.plan === "growth" || membership?.plan === "inner_circle") {
        planKey = membership.plan;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("current_plan, candidate_leader, paid_days, check_in_count, helpful_comments, challenge_day")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (planKey === "free") {
        if (profile?.current_plan === "basic" || profile?.current_plan === "growth" || profile?.current_plan === "inner_circle") {
          planKey = profile.current_plan;
        }
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
      <MemberDashboard
        planKey={planKey}
        challengeDay={challengeDay}
        streakCount={streakCount}
        aiUsage={mock.aiUsage}
        candidateLeader={candidateLeader}
        communityUrl={planKey === "free" ? mock.communityLinks.free : mock.communityLinks.paid}
        challengeStarted={Boolean(params.challenge)}
        registeredEmail={params.email}
      />
    </div>
  );
}
