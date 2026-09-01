import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/env";
import { resolveRequestAuthContext } from "@/lib/request-auth";
import { getStripeClient } from "@/lib/stripe";
import { resolveStripeBillingDetails } from "@/lib/stripe-billing";
import { getSupabaseBearerServerClient, getSupabaseServerClient } from "@/lib/supabase/server";

const FRIENDLY_PORTAL_ERROR = "メンバーシップ管理ページを開けませんでした。しばらくしてからもう一度お試しください";
const LOGIN_REQUIRED_ERROR = "ログイン後にもう一度お試しください";
const MEMBERSHIP_NOT_FOUND_ERROR = "メンバーシップ情報が見つかりません";
const PORTAL_NOT_CONFIGURED_ERROR = "Stripe Customer Portal is not configured";

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    const cookieSupabase = await getSupabaseServerClient();

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

    if (!cookieSupabase) {
      console.error("[stripe-customer-portal] missing Supabase server client");
      return NextResponse.json(
        {
          error: FRIENDLY_PORTAL_ERROR
        },
        {
          status: 503
        }
      );
    }

    const auth = await resolveRequestAuthContext({
      cookieClient: cookieSupabase,
      authorizationHeader: request.headers.get("authorization"),
      createBearerClient: getSupabaseBearerServerClient
    });

    if (auth.status === "unavailable") {
      return NextResponse.json(
        {
          error: FRIENDLY_PORTAL_ERROR
        },
        {
          status: 503
        }
      );
    }

    if (auth.status !== "authenticated") {
      return NextResponse.json(
        {
          error: LOGIN_REQUIRED_ERROR
        },
        {
          status: 401
        }
      );
    }

    console.log("[stripe-customer-portal] auth resolution", {
      userFound: true,
      userSource: auth.source
    });

    const user = auth.user;
    const supabase = auth.rlsClient;

    const { data: membership, error: membershipError } = await supabase
      .from("memberships")
      .select("stripe_customer_id, email, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log("[stripe-customer-portal] membership lookup", {
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
        profileFound: Boolean(profile),
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
        found: Boolean(emailProfile),
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
      status: stripeBilling.status,
      customerSource: stripeBilling.customerSource
    });

    if (stripeBilling.customerId) {
      stripeCustomerId = stripeBilling.customerId;
      stripeCustomerSource = stripeBilling.customerSource;
    }

    console.log("[stripe-customer-portal] stripe customer resolution", {
      stripeCustomerFound: Boolean(stripeCustomerId),
      stripeCustomerSource
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
      stripeCustomerSource,
      hasUrl: Boolean(portalSession.url)
    });

    return NextResponse.json({
      ok: true,
      url: portalSession.url
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const portalConfigMissing =
      message.includes("billing portal") ||
      message.includes("No configuration provided") ||
      message.includes("portal configuration");

    console.error("[stripe-customer-portal] failed", {
      category: portalConfigMissing ? "portal_configuration" : "unknown"
    });

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
