export type MembershipPlanKey = "free" | "basic" | "growth" | "inner_circle";

type MembershipRow = {
  plan: string | null;
  status?: string | null;
  created_at?: string | null;
};

type MembershipClient = {
  from: (table: string) => any;
};

export type MembershipFetchResult = {
  plan: MembershipPlanKey;
  resolved: boolean;
  membershipStatus: string | null;
  table: "memberships";
  errorMessage: string | null;
};

export const ACTIVE_MEMBERSHIP_STATUSES = ["active", "trialing"] as const;

export function isActiveMembershipStatus(status: string | null | undefined) {
  if (!status) {
    return false;
  }

  return ACTIVE_MEMBERSHIP_STATUSES.includes(status.toLowerCase() as (typeof ACTIVE_MEMBERSHIP_STATUSES)[number]);
}

export function normalizeMembershipPlan(plan: string | null | undefined): MembershipPlanKey {
  if (!plan) {
    return "free";
  }

  const normalized = plan.toLowerCase().replace(/[-\s]/g, "_");

  if (normalized === "basic") {
    return "basic";
  }

  if (normalized === "growth" || normalized === "leader") {
    return "growth";
  }

  if (normalized === "inner_circle" || normalized === "premium") {
    return "inner_circle";
  }

  return "free";
}

async function queryLatestMembership(
  supabase: MembershipClient,
  userId: string,
  activeOnly: boolean
) {
  const baseQuery = supabase.from("memberships").select("plan, status, created_at").eq("user_id", userId);

  const orderedQuery =
    activeOnly && typeof baseQuery.in === "function"
      ? baseQuery.in("status", ACTIVE_MEMBERSHIP_STATUSES).order("created_at", { ascending: false })
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
          membershipStatus: null,
          table: "memberships",
          errorMessage: activeError.message ?? "Unknown memberships query error"
        };
      }

      continue;
    }

    if (activeMembership) {
      const selectedPlan = normalizeMembershipPlan(activeMembership.plan);
      console.log(`${logPrefix} membership query result`, {
        rawMembership: activeMembership,
        rawPlan: activeMembership.plan ?? null,
        normalizedPlan: selectedPlan,
        membershipStatus: activeMembership.status ?? null
      });

      return {
        plan: selectedPlan,
        resolved: true,
        membershipStatus: activeMembership.status ?? null,
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
          membershipStatus: null,
          table: "memberships",
          errorMessage: fallbackError.message ?? "Unknown memberships fallback query error"
        };
      }

      continue;
    }

    const selectedPlan = normalizeMembershipPlan(fallbackMembership?.plan);
    console.log(`${logPrefix} membership query result`, {
      rawMembership: fallbackMembership,
      rawPlan: fallbackMembership?.plan ?? null,
      normalizedPlan: selectedPlan,
      membershipStatus: fallbackMembership?.status ?? null
    });

    return {
      plan: selectedPlan,
      resolved: true,
      membershipStatus: fallbackMembership?.status ?? null,
      table: "memberships",
      errorMessage: null
    };
  }

  return {
    plan: "free",
    resolved: false,
    membershipStatus: null,
    table: "memberships",
    errorMessage: "Membership lookup exhausted without a successful response"
  };
}
