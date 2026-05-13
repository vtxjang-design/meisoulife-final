import { NextResponse } from "next/server";
import { z } from "zod";
import { getSiteUrl } from "@/lib/env";
import { getPlanPriceId, getStripeClient, mapMembershipPlan, membershipPlans, normalizeCheckoutPlan } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const checkoutSchema = z.object({
  plan: z.enum(["basic", "leader", "premium", "growth", "inner_circle"])
});

function resolveCheckoutLanguage(request: Request) {
  const acceptLanguage = request.headers.get("accept-language")?.toLowerCase() || "";
  return acceptLanguage.startsWith("ko") ? "ko" : "ja";
}

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    const payload = checkoutSchema.parse(await request.json());
    const checkoutPlan = normalizeCheckoutPlan(payload.plan);
    const config = membershipPlans[checkoutPlan];
    const supabase = await getSupabaseServerClient();

    if (!stripe) {
      return NextResponse.json(
        {
          error: "Stripe checkout is not configured yet."
        },
        {
          status: 503
        }
      );
    }

    const priceConfig = getPlanPriceId(checkoutPlan);

    if (!priceConfig) {
      return NextResponse.json(
        {
          error: `Missing Stripe price ID for ${config.name}.`
        },
        {
          status: 400
        }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        {
          error: "Supabase auth is not configured yet."
        },
        {
          status: 503
        }
      );
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("[stripe-checkout] missing authenticated user", {
        plan: payload.plan
      });
      return NextResponse.json(
        {
          error: "Authentication required. Please log in again before continuing checkout."
        },
        {
          status: 401
        }
      );
    }

    console.log("[stripe-checkout] authenticated user", {
      userId: user.id,
      email: user.email,
      plan: checkoutPlan
    });

    const siteUrl = getSiteUrl();
    const membershipPlan = mapMembershipPlan(checkoutPlan);
    const language = resolveCheckoutLanguage(request);
    const metadata = {
      user_id: user.id,
      userId: user.id,
      email: user.email || "",
      plan: membershipPlan,
      tier: membershipPlan,
      language,
      source: "meisoulife",
      flow: "membership"
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price: priceConfig.priceId,
          quantity: 1
        }
      ],
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#membership`,
      metadata,
      subscription_data: {
        metadata
      }
    });

    console.log("[stripe-checkout] session created", {
      userId: user.id,
      metadata,
      sessionId: session.id,
      priceEnvKey: priceConfig.envKey,
      hasUrl: Boolean(session.url)
    });

    if (!session.url) {
      return NextResponse.json(
        {
          error: "Stripe checkout session was created without a redirect URL."
        },
        {
          status: 500
        }
      );
    }

    return NextResponse.json({
      ok: true,
      url: session.url
    });
  } catch (error) {
    console.error("[stripe-checkout] failed", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Checkout failed"
      },
      {
        status: 400
      }
    );
  }
}
