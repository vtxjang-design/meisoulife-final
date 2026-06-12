import { NextResponse } from "next/server";
import { normalizeMembershipPlan } from "@/lib/membership";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ACTIVE_STATUSES = ["active", "trialing"];

export async function GET() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      {
        error: "Supabase server client is unavailable"
      },
      { status: 500 }
    );
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: "Not authenticated"
      },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const admin = getSupabaseAdminClient();
  const membershipClient = admin ?? supabase;

  const membershipQuery = membershipClient
    .from("memberships")
    .select("plan, status, stripe_customer_id, stripe_subscription_id, created_at, updated_at, email")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const profileQuery = membershipClient
    .from("users")
    .select("role, current_plan, email")
    .eq("auth_user_id", userId)
    .maybeSingle();

  const [{ data: membership, error: membershipError }, { data: profile, error: profileError }] = await Promise.all([
    membershipQuery,
    profileQuery
  ]);

  const normalizedPlan = normalizeMembershipPlan(membership?.plan ?? null);
  const memberState = normalizedPlan === "free" ? "free" : "paid";
  const statusIsActive = membership?.status ? ACTIVE_STATUSES.includes(membership.status) : false;
  const redirectsToPricing = memberState !== "paid";

  return NextResponse.json({
    userId,
    accessCheck: {
      route: "/program/basic",
      exactCondition: 'memberState !== "paid"',
      derivedValues: {
        normalizedPlan,
        memberState,
        statusIsActive
      },
      redirectsToPricing,
      redirectReason: redirectsToPricing
        ? `memberState resolved to "${memberState}" because normalizedPlan resolved to "${normalizedPlan}".`
        : null
    },
    membershipRecord: membership
      ? {
          plan: membership.plan ?? null,
          status: membership.status ?? null,
          role: profile?.role ?? null,
          stripe_customer_id: membership.stripe_customer_id ?? null,
          stripe_subscription_id: membership.stripe_subscription_id ?? null,
          stripe_price_id: null
        }
      : null,
    profileRecord: profile
      ? {
          role: profile.role ?? null,
          current_plan: profile.current_plan ?? null,
          email: profile.email ?? null
        }
      : null,
    membershipQueryError: membershipError?.message ?? null,
    profileQueryError: profileError?.message ?? null,
    schemaNotes: {
      membershipsFieldsSelected: [
        "plan",
        "status",
        "stripe_customer_id",
        "stripe_subscription_id",
        "created_at",
        "updated_at",
        "email"
      ],
      membershipsMissingFields: ["role", "stripe_price_id"]
    }
  });
}
