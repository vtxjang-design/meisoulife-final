import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe";
import { resolveStripeBillingDetails, maskStripeCustomerId } from "@/lib/stripe-billing";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const FRIENDLY_PORTAL_ERROR = "メンバーシップ管理ページを開けませんでした。しばらくしてからもう一度お試しください";
const LOGIN_REQUIRED_ERROR = "ログイン後にもう一度お試しください";
const MEMBERSHIP_NOT_FOUND_ERROR = "メンバーシップ情報が見つかりません";
const PORTAL_NOT_CONFIGURED_ERROR = "Stripe Customer Portal is not configured";

function resolveBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";

  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return "";
  }

  return authorization.slice(7).trim();
}

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    const supabase = await getSupabaseServerClient();

    if (!stripe) {
      console.error("[stripe-customer-portal] missing Stripe client");
      return NextResponse.json(
        {
          error: FRIENDLY_PORTAL_ERROR
        },
        {
          status: 503
        }
      );
    }

    if (!supabase) {
      console.error("[stripe-customer-portal] missing Supabase server client");
      return NextResponse.json(
        {
          error: LOGIN_REQUIRED_ERROR
        },
        {
          status: 401
        }
      );
    }

    const bearerToken = resolveBearerToken(request);

    let user = null;
    let userSource: "cookie" | "bearer" | "none" = "none";

    const {
      data: { user: cookieUser },
      error: cookieUserError
    } = await supabase.auth.getUser();

    if (cookieUserError) {
      console.warn("[stripe-customer-portal] cookie session lookup failed", {
        message: cookieUserError.message
      });
    }

    if (cookieUser) {
      user = cookieUser;
      userSource = "cookie";
    } else if (bearerToken) {
      const {
        data: { user: bearerUser },
        error: bearerUserError
      } = await supabase.auth.getUser(bearerToken);

      if (bearerUserError) {
        console.warn("[stripe-customer-portal] bearer session lookup failed", {
          message: bearerUserError.message
        });
      }

      if (bearerUser) {
        user = bearerUser;
        userSource = "bearer";
      }
    }

    console.log("[stripe-customer-portal] auth resolution", {
      hasBearerToken: Boolean(bearerToken),
      userFound: Boolean(user),
      userSource,
      userId: user?.id || null,
      userEmail: user?.email || null
    });

    if (!user) {
      return NextResponse.json(
        {
          error: LOGIN_REQUIRED_ERROR
        },
        {
          status: 401
        }
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from("memberships")
      .select("stripe_customer_id, email, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log("[stripe-customer-portal] membership lookup", {
      userId: user.id,
      found: Boolean(membership),
      hasStripeCustomerId: Boolean(membership?.stripe_customer_id),
      status: membership?.status || null,
      error: membershipError?.message || null
    });

    let stripeCustomerId = membership?.stripe_customer_id ?? null;
    let stripeCustomerSource = stripeCustomerId ? "memberships" : "none";
    let profileId: string | null = null;
    let profileEmail = user.email || null;
    let subscriptionCustomerId: string | null = null;

    if (!stripeCustomerId) {
      let profileResult = await supabase
        .from("users")
        .select("id, email, stripe_customer_id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (profileResult.error?.message?.includes("stripe_customer_id")) {
        profileResult = await supabase.from("users").select("id, email").eq("auth_user_id", user.id).maybeSingle();
      }

      const profile = profileResult.data as
        | {
            id?: string | null;
            email?: string | null;
            stripe_customer_id?: string | null;
          }
        | null;

      profileId = profile?.id ?? null;
      profileEmail = profile?.email ?? profileEmail;

      console.log("[stripe-customer-portal] user profile lookup", {
        authUserId: user.id,
        profileFound: Boolean(profile),
        profileId,
        profileEmail,
        hasStripeCustomerId: Boolean(profile?.stripe_customer_id),
        error: profileResult.error?.message || null
      });

      if (profile?.stripe_customer_id) {
        stripeCustomerId = profile.stripe_customer_id;
        stripeCustomerSource = "users";
      }
    }

    if (!stripeCustomerId && profileId) {
      const { data: subscription, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id, status, plan_key")
        .eq("user_id", profileId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log("[stripe-customer-portal] subscription lookup", {
        profileId,
        found: Boolean(subscription),
        hasStripeCustomerId: Boolean(subscription?.stripe_customer_id),
        status: subscription?.status || null,
        planKey: subscription?.plan_key || null,
        error: subscriptionError?.message || null
      });

      if (subscription?.stripe_customer_id) {
        stripeCustomerId = subscription.stripe_customer_id;
        subscriptionCustomerId = subscription.stripe_customer_id;
        stripeCustomerSource = "subscriptions";
      }
    } else {
      console.log("[stripe-customer-portal] subscription lookup skipped", {
        profileId,
        reason: profileId ? "stripe_customer_id_already_found" : "profile_id_missing"
      });
    }

    if (!stripeCustomerId && user.email) {
      const { data: emailProfile, error: emailProfileError } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", user.email)
        .maybeSingle();

      console.log("[stripe-customer-portal] email fallback profile lookup", {
        email: user.email,
        found: Boolean(emailProfile),
        profileId: emailProfile?.id || null,
        error: emailProfileError?.message || null
      });

      if (emailProfile?.id) {
        const { data: emailSubscription, error: emailSubscriptionError } = await supabase
          .from("subscriptions")
          .select("stripe_customer_id, status, plan_key")
          .eq("user_id", emailProfile.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log("[stripe-customer-portal] email fallback subscription lookup", {
          profileId: emailProfile.id,
          found: Boolean(emailSubscription),
          hasStripeCustomerId: Boolean(emailSubscription?.stripe_customer_id),
          status: emailSubscription?.status || null,
          planKey: emailSubscription?.plan_key || null,
          error: emailSubscriptionError?.message || null
        });

        if (emailSubscription?.stripe_customer_id) {
          stripeCustomerId = emailSubscription.stripe_customer_id;
          stripeCustomerSource = "subscriptions_by_email";
        }
      }
    }

    const localCustomerIds = [
      membership?.stripe_customer_id
        ? {
            customerId: membership.stripe_customer_id,
            source: "memberships"
          }
        : null,
      subscriptionCustomerId
        ? {
            customerId: subscriptionCustomerId,
            source: "subscriptions"
          }
        : null
    ].filter((entry): entry is { customerId: string; source: string } => Boolean(entry?.customerId));

    const stripeBilling = await resolveStripeBillingDetails({
      stripe,
      email: user.email || null,
      preferredPlan: "basic",
      localCustomerIds
    });

    console.log("[stripe-customer-portal] resolved stripe billing", {
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

    if (stripeBilling.customerId) {
      stripeCustomerId = stripeBilling.customerId;
      stripeCustomerSource = stripeBilling.customerSource;
    }

    console.log("[stripe-customer-portal] stripe customer resolution", {
      userId: user.id,
      userEmail: user.email || null,
      stripeCustomerFound: Boolean(stripeCustomerId),
      stripeCustomerSource,
      stripeCustomerId: maskStripeCustomerId(stripeCustomerId)
    });

    if (!stripeCustomerId) {
      return NextResponse.json(
        {
          error: MEMBERSHIP_NOT_FOUND_ERROR
        },
        {
          status: 404
        }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${getSiteUrl()}/member`
    });

    console.log("[stripe-customer-portal] portal session created", {
      userId: user.id,
      stripeCustomerSource,
      hasUrl: Boolean(portalSession.url)
    });

    return NextResponse.json({
      ok: true,
      url: portalSession.url
    });
  } catch (error) {
    console.error("[stripe-customer-portal] failed", error);

    const message = error instanceof Error ? error.message : "";
    const portalConfigMissing =
      message.includes("billing portal") ||
      message.includes("No configuration provided") ||
      message.includes("portal configuration");

    return NextResponse.json(
      {
        error: portalConfigMissing ? PORTAL_NOT_CONFIGURED_ERROR : FRIENDLY_PORTAL_ERROR
      },
      {
        status: 400
      }
    );
  }
}
