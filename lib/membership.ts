export type MembershipPlanKey = "free" | "basic" | "growth" | "inner_circle";

type MembershipRow = {
  plan: string | null;
  subscription_status?: string | null;
  created_at?: string | null;
};

type MembershipClient = {
  from: (table: string) => any;
};

export type MembershipFetchResult = {
  plan: MembershipPlanKey;
  resolved: boolean;
  subscriptionStatus: string | null;
  table: "memberships";
  errorMessage: string | null;
};

const ACTIVE_MEMBERSHIP_STATUSES = ["active", "trialing"];

export function normalizeMembershipPlan(plan: string | null | undefined): MembershipPlanKey {
  if (plan === "basic" || plan === "growth" || plan === "inner_circle") {
    return plan;
  }

  return "free";
}

async function queryLatestMembership(
  supabase: MembershipClient,
  userId: string,
  activeOnly: boolean
) {
  const baseQuery = supabase.from("memberships").select("plan, subscription_status, created_at").eq("user_id", userId);

  const orderedQuery = activeOnly && typeof baseQuery.in === "function"
    ? baseQuery.in("subscription_status", ACTIVE_MEMBERSHIP_STATUSES).order("created_at", { ascending: false })
    : baseQuery.order("created_at", { ascending: false });

  return orderedQuery.limit(1).maybeSingle();
}

export async function fetchLatestMembershipPlan(
  supabase: MembershipClient,
  userId: string,
  logPrefix = "[membership]"
): Promise<MembershipFetchResult> {
  console.log(`${logPrefix} current user id`, userId);

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const { data: activeMembership, error: activeError } = await queryLatestMembership(supabase, userId, true);

    if (activeError) {
      console.error(`${logPrefix} active membership fetch failed`, { attempt, error: activeError });

      if (attempt === 2) {
        return {
          plan: "free",
          resolved: false,
          subscriptionStatus: null,
          table: "memberships",
          errorMessage: activeError.message ?? "Unknown memberships query error"
        };
      }

      continue;
    }

    if (activeMembership) {
      const selectedPlan = normalizeMembershipPlan(activeMembership.plan);
      console.log(`${logPrefix} membership query result`, activeMembership);
      console.log(`${logPrefix} selected plan`, selectedPlan);

      return {
        plan: selectedPlan,
        resolved: true,
        subscriptionStatus: activeMembership.subscription_status ?? null,
        table: "memberships",
        errorMessage: null
      };
    }

    const { data: fallbackMembership, error: fallbackError } = await queryLatestMembership(supabase, userId, false);

    if (fallbackError) {
      console.error(`${logPrefix} fallback membership fetch failed`, { attempt, error: fallbackError });

      if (attempt === 2) {
        return {
          plan: "free",
          resolved: false,
          subscriptionStatus: null,
          table: "memberships",
          errorMessage: fallbackError.message ?? "Unknown memberships fallback query error"
        };
      }

      continue;
    }

    const selectedPlan = normalizeMembershipPlan(fallbackMembership?.plan);
    console.log(`${logPrefix} membership query result`, fallbackMembership);
    console.log(`${logPrefix} selected plan`, selectedPlan);

    return {
      plan: selectedPlan,
      resolved: true,
      subscriptionStatus: fallbackMembership?.subscription_status ?? null,
      table: "memberships",
      errorMessage: null
    };
  }

  return {
    plan: "free",
    resolved: false,
    subscriptionStatus: null,
    table: "memberships",
    errorMessage: "Membership lookup exhausted without a successful response"
  };
}
