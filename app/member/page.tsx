import { MemberEntryContent } from "@/components/member-entry-content";
import { fetchLatestMembershipPlan } from "@/lib/membership";
import { resolveStripeBillingDetails, maskStripeCustomerId } from "@/lib/stripe-billing";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseConfigStatus } from "@/lib/supabase-config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const LINE_URL =
  process.env.NEXT_PUBLIC_LINE_URL ||
  process.env.NEXT_PUBLIC_LINE_FREE_URL ||
  "https://line.me/R/ti/p/@meisoulife";

type MembershipSummary = {
  currentPlan: "free" | "basic" | "growth" | "inner_circle";
  subscriptionStatus: string | null;
  nextBillingDate: string | null;
  canManageMembership: boolean;
};

type MemberPageProps = {
  searchParams?: Promise<{
    debug?: string;
  }>;
};

export default async function MemberPage({ searchParams }: MemberPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const supabaseConfig = getSupabaseConfigStatus();
  const supabase = await getSupabaseServerClient();
  let initialPlan: "free" | "basic" | "growth" | "inner_circle" = "free";
  let initialEmail = "";
  let membershipSummary: MembershipSummary = {
    currentPlan: "free",
    subscriptionStatus: null,
    nextBillingDate: null,
    canManageMembership: false
  };
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (supabase && user) {
    const membershipState = await fetchLatestMembershipPlan(supabase, user.id, "[member]");
    initialPlan = membershipState.plan;
    initialEmail = user.email || "";

    const { data: profile } = await supabase
      .from("users")
      .select("id, current_plan")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const { data: subscription } = profile?.id
      ? await supabase
          .from("subscriptions")
          .select("stripe_customer_id, plan_key, status, current_period_end")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null };

    const { data: membership } = await supabase
      .from("memberships")
      .select("stripe_customer_id, plan, status, current_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (initialPlan === "free") {
      if (profile?.current_plan === "basic" || profile?.current_plan === "growth" || profile?.current_plan === "inner_circle") {
        initialPlan = profile.current_plan;
      } else if (
        (subscription?.status === "active" || subscription?.status === "trialing") &&
        (subscription.plan_key === "basic" || subscription.plan_key === "growth" || subscription.plan_key === "inner_circle")
      ) {
        initialPlan = subscription.plan_key;
      }
    }

    const stripe = getStripeClient();
    const localCustomerIds = [
      membership?.stripe_customer_id
        ? {
            customerId: membership.stripe_customer_id,
            source: "memberships"
          }
        : null,
      subscription?.stripe_customer_id
        ? {
            customerId: subscription.stripe_customer_id,
            source: "subscriptions"
          }
        : null
    ].filter((entry): entry is { customerId: string; source: string } => Boolean(entry?.customerId));

    if (stripe) {
      const stripeBilling = await resolveStripeBillingDetails({
        stripe,
        email: user.email || null,
        preferredPlan: initialPlan,
        localCustomerIds
      });

      console.log("[member] resolved stripe billing", {
        userId: user.id,
        userEmail: user.email || null,
        customerId: maskStripeCustomerId(stripeBilling.customerId),
        subscriptionId: stripeBilling.subscriptionId,
        status: stripeBilling.status,
        currentPeriodStart: stripeBilling.currentPeriodStart,
        currentPeriodEnd: stripeBilling.currentPeriodEnd,
        billingCycleAnchor: stripeBilling.billingCycleAnchor,
        customerSource: stripeBilling.customerSource
      });

      membershipSummary = {
        currentPlan: initialPlan,
        subscriptionStatus: stripeBilling.status ?? membership?.status ?? subscription?.status ?? membershipState.membershipStatus ?? null,
        nextBillingDate:
          stripeBilling.currentPeriodEnd ?? membership?.current_period_end ?? subscription?.current_period_end ?? null,
        canManageMembership: Boolean(stripeBilling.customerId || membership?.stripe_customer_id || subscription?.stripe_customer_id)
      };
    } else {
      membershipSummary = {
        currentPlan: initialPlan,
        subscriptionStatus: membership?.status ?? subscription?.status ?? membershipState.membershipStatus ?? null,
        nextBillingDate: membership?.current_period_end ?? subscription?.current_period_end ?? null,
        canManageMembership: Boolean(membership?.stripe_customer_id || subscription?.stripe_customer_id)
      };
    }
  }

  return (
    <MemberEntryContent
      lineUrl={LINE_URL}
      debug={params?.debug === "1"}
      hasSupabaseUrl={supabaseConfig.supabaseUrlExists}
      hasSupabaseAnonKey={supabaseConfig.supabaseKeyExists}
      isLoggedInInitially={Boolean(user)}
      initialPlan={initialPlan}
      initialEmail={initialEmail}
      membershipSummary={membershipSummary}
    />
  );
}
