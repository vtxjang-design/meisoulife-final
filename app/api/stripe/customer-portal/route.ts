import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const FRIENDLY_PORTAL_ERROR = "メンバーシップ管理ページを開けませんでした。しばらくしてからもう一度お試しください。";

export async function POST() {
  try {
    const stripe = getStripeClient();
    const supabase = await getSupabaseServerClient();

    if (!stripe) {
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
      return NextResponse.json(
        {
          error: "ログイン情報を確認できませんでした"
        },
        {
          status: 401
        }
      );
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "ログイン後にもう一度お試しください"
        },
        {
          status: 401
        }
      );
    }

    const { data: membership } = await supabase
      .from("memberships")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let stripeCustomerId = membership?.stripe_customer_id ?? null;

    if (!stripeCustomerId) {
      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (profile?.id) {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("stripe_customer_id")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        stripeCustomerId = subscription?.stripe_customer_id ?? null;
      }
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        {
          error: "No Stripe customer ID found for this user"
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
        error: portalConfigMissing
          ? "Stripe Customer Portal is not configured in Stripe Dashboard"
          : FRIENDLY_PORTAL_ERROR
      },
      {
        status: 400
      }
    );
  }
}
