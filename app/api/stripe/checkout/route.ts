import { NextResponse } from "next/server";
import { z } from "zod";
import { getSiteUrl } from "@/lib/env";
import { getPlanConfig, getPlanPriceId, getStripeClient, normalizeCheckoutPlan } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const checkoutSchema = z.object({
  plan: z.enum(["basic", "leader", "premium", "growth", "inner_circle", "inner-circle"])
});

const FRIENDLY_CHECKOUT_ERROR = "決済設定を確認中です。しばらくして再度お試しください。";

function resolveCheckoutLanguage(request: Request) {
  const acceptLanguage = request.headers.get("accept-language")?.toLowerCase() || "";
  return acceptLanguage.startsWith("ko") ? "ko" : "ja";
}

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    const payload = checkoutSchema.parse(await request.json());
    const checkoutPlan = normalizeCheckoutPlan(payload.plan);
    const config = getPlanConfig(checkoutPlan);
    const supabase = await getSupabaseServerClient();

    if (!stripe) {
      console.error("[stripe-checkout] missing STRIPE_SECRET_KEY or invalid Stripe secret format");
      return NextResponse.json(
        {
          error: FRIENDLY_CHECKOUT_ERROR
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
          error: "このプランは現在準備中です"
        },
        {
          status: 503
        }
      );
    }

    let userId = "";
    let userEmail = "";

    if (supabase) {
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (user) {
          userId = user.id;
          userEmail = user.email || "";
        }
      } catch (error) {
        console.warn("[stripe-checkout] unable to load Supabase session", error);
      }
    }

    console.log("[stripe-checkout] authenticated user", {
      userId: userId || null,
      email: userEmail || null,
      plan: checkoutPlan
    });

    const siteUrl = getSiteUrl();
    const membershipPlan = config.membershipPlan;
    const language = resolveCheckoutLanguage(request);
    const metadata = {
      user_id: userId,
      userId: userId,
      email: userEmail,
      plan: membershipPlan,
      tier: membershipPlan,
      language,
      source: "meisoulife",
      flow: "membership"
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: userEmail || undefined,
      line_items: [
        {
          price: priceConfig.priceId,
          quantity: 1
        }
      ],
      success_url: `${siteUrl}/success`,
      cancel_url: `${siteUrl}/pricing`,
      metadata,
      subscription_data: {
        metadata: {
          user_id: userId,
          email: userEmail,
          plan: membershipPlan,
          tier: membershipPlan
        }
      }
    });

    console.log("[stripe-checkout] Stripe checkout session created", {
      userId: userId || null,
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
      checkoutUrl: session.url
    });
  } catch (error) {
    console.error("[stripe-checkout] failed", error);
    return NextResponse.json(
      {
        error: FRIENDLY_CHECKOUT_ERROR
      },
      {
        status: 400
      }
    );
  }
}
