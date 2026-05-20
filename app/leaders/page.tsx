import { LeaderGrowthPageContent } from "@/components/leader-growth-page-content";
import { getLeaderProgress, isLeaderCandidate } from "@/lib/leader";
import { getLeaderFormUrl } from "@/lib/site";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function LeadersPage() {
  const leaderFormUrl = getLeaderFormUrl();
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
    <LeaderGrowthPageContent
      leaderFormUrl={leaderFormUrl}
      candidateLeader={candidateLeader}
      progress={progress}
    />
  );
}
