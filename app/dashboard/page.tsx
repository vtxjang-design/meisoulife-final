import { MemberDashboard } from "@/components/member-dashboard";
import { isLeaderCandidate } from "@/lib/leader";
import { fetchLatestMembershipPlan, normalizeMembershipPlan } from "@/lib/membership";
import { getMockDashboard } from "@/lib/mock-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function getProgramRoute(plan: "free" | "basic" | "growth" | "inner_circle") {
  if (plan === "growth") {
    return "/program/growth";
  }

  if (plan === "inner_circle") {
    return "/program/inner";
  }

  if (plan === "basic") {
    return "/program/basic";
  }

  return null;
}

type DashboardPageProps = {
  searchParams: Promise<{
    email?: string;
    challenge?: string;
    gate?: string;
    rhythm?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const mock = getMockDashboard();
  let planKey: "free" | "basic" | "growth" | "inner_circle" = "free";
  let activeMembershipRoute: string | null = null;
  let membershipResolved = false;
  let candidateLeader = false;
  let streakCount = mock.streakCount;
  let challengeDay = mock.challengeDay;

  if (supabase) {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;

    if (user) {
      const membershipState = await fetchLatestMembershipPlan(supabase, user.id, "[dashboard]");
      membershipResolved = membershipState.resolved;
      planKey = membershipState.plan;

      const { data: membership } = await supabase
        .from("memberships")
        .select("plan, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (membership?.status === "active" || membership?.status === "trialing") {
        const normalizedMembershipPlan = normalizeMembershipPlan(membership.plan);

        if (normalizedMembershipPlan === "growth") {
          activeMembershipRoute = "/program/growth";
        } else if (normalizedMembershipPlan === "inner_circle") {
          activeMembershipRoute = "/program/inner";
        } else {
          activeMembershipRoute = "/program/basic";
        }

        if (planKey === "free") {
          planKey =
            normalizedMembershipPlan === "free" ? "basic" : normalizedMembershipPlan;
          membershipResolved = true;
        }
      }

      const { data: profile } = await supabase
        .from("users")
        .select("current_plan, candidate_leader, paid_days, check_in_count, helpful_comments, challenge_day")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (planKey === "free") {
        if (profile?.current_plan === "basic" || profile?.current_plan === "growth" || profile?.current_plan === "inner_circle") {
          planKey = profile.current_plan;
          membershipResolved = true;
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

  const programRoute = activeMembershipRoute ?? getProgramRoute(planKey);

  if (programRoute) {
    const query = new URLSearchParams();

    if (params.email) {
      query.set("email", params.email);
    }

    if (params.challenge) {
      query.set("challenge", params.challenge);
    }

    if (params.gate) {
      query.set("gate", params.gate);
    }

    if (params.rhythm) {
      query.set("rhythm", params.rhythm);
    }

    redirect(query.size > 0 ? `${programRoute}?${query.toString()}` : programRoute);
  }

  return (
    <div className="section-shell py-16 sm:py-24">
      <MemberDashboard
        planKey={planKey}
        membershipResolved={membershipResolved}
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
