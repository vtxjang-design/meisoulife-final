import { NextResponse } from "next/server";
import { resolveMembershipEntitlement } from "@/lib/membership-resolver";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      {
        plan: "free",
        resolved: false,
        membershipStatus: null,
        hasActiveSubscription: false,
        errorMessage: "Supabase server client is unavailable",
        source: "unavailable",
        repaired: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        membershipSummary: {
          currentPlan: "free",
          subscriptionStatus: null,
          nextBillingDate: null,
          canManageMembership: false
        }
      },
      { status: 503 }
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        plan: "free",
        resolved: true,
        membershipStatus: null,
        hasActiveSubscription: false,
        errorMessage: null,
        source: "guest",
        repaired: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        membershipSummary: {
          currentPlan: "free",
          subscriptionStatus: null,
          nextBillingDate: null,
          canManageMembership: false
        }
      },
      { status: 200 }
    );
  }

  const entitlement = await resolveMembershipEntitlement({
    supabase,
    userId: user.id,
    email: user.email ?? null,
    logPrefix: "[api-membership-resolve]"
  });

  return NextResponse.json(entitlement);
}
