import { NextResponse } from "next/server";
import { resolveMembershipEntitlementReadOnly } from "@/lib/membership-resolver";
import { resolveRequestAuthContext } from "@/lib/request-auth";
import { getSupabaseBearerServerClient, getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const debug = requestUrl.searchParams.get("debug") === "1";
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
        },
        debug: debug
          ? {
              authenticated: false,
              userIdPresent: false,
              normalizedLoginEmail: null,
              matchedBy: "none",
              membershipRowFound: false,
              subscriptionRowFound: false,
              profileRowFound: false,
              stripeCustomerIdPresent: false,
              stripeSubscriptionIdPresent: false,
              stripeAvailable: false,
              stripeCustomerSource: null,
              paymentState: null,
              failureReasons: ["supabase_unavailable"]
            }
          : undefined
      },
      { status: 503 }
    );
  }

  const auth = await resolveRequestAuthContext({
    cookieClient: supabase,
    authorizationHeader: request.headers.get("authorization"),
    createBearerClient: getSupabaseBearerServerClient
  });

  if (auth.status === "unavailable") {
    return NextResponse.json(
      {
        plan: "free",
        resolved: false,
        membershipStatus: null,
        hasActiveSubscription: false,
        errorMessage: "Authenticated database client is unavailable",
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

  if (auth.status === "invalid") {
    return NextResponse.json(
      {
        plan: "free",
        resolved: false,
        membershipStatus: null,
        hasActiveSubscription: false,
        errorMessage: "Authentication is invalid",
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
      { status: 401 }
    );
  }

  if (auth.status === "anonymous") {
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
        },
        debug: debug
          ? {
              authenticated: false,
              userIdPresent: false,
              normalizedLoginEmail: null,
              matchedBy: "none",
              membershipRowFound: false,
              subscriptionRowFound: false,
              profileRowFound: false,
              stripeCustomerIdPresent: false,
              stripeSubscriptionIdPresent: false,
              stripeAvailable: false,
              stripeCustomerSource: null,
              paymentState: null,
              failureReasons: ["guest"]
            }
          : undefined
      },
      { status: 200 }
    );
  }

  console.log("[api-membership-resolve] auth resolution", {
    userFound: true,
    userSource: auth.source
  });

  const entitlement = await resolveMembershipEntitlementReadOnly({
    supabase: auth.rlsClient,
    userId: auth.user.id,
    email: auth.user.email ?? null,
    logPrefix: "[api-membership-resolve]",
    debug
  });

  return NextResponse.json(entitlement);
}
