import { NextResponse } from "next/server";
import { resolveMembershipEntitlement } from "@/lib/membership-resolver";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function resolveBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";

  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return "";
  }

  return authorization.slice(7).trim();
}

export async function GET(request: Request) {
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
    data: { user: cookieUser },
    error: cookieUserError
  } = await supabase.auth.getUser();

  if (cookieUserError) {
    console.warn("[api-membership-resolve] cookie session lookup failed", {
      message: cookieUserError.message
    });
  }

  const bearerToken = resolveBearerToken(request);

  let user = cookieUser;
  let userSource: "cookie" | "bearer" | "none" = cookieUser ? "cookie" : "none";

  if (!user && bearerToken) {
    const {
      data: { user: bearerUser },
      error: bearerUserError
    } = await supabase.auth.getUser(bearerToken);

    if (bearerUserError) {
      console.warn("[api-membership-resolve] bearer session lookup failed", {
        message: bearerUserError.message
      });
    }

    if (bearerUser) {
      user = bearerUser;
      userSource = "bearer";
    }
  }

  console.log("[api-membership-resolve] auth resolution", {
    hasBearerToken: Boolean(bearerToken),
    userFound: Boolean(user),
    userSource,
    userId: user?.id || null,
    userEmail: user?.email || null
  });

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
