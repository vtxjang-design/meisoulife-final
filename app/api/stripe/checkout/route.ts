import { NextResponse } from "next/server";
import { z } from "zod";
import { getSiteUrl } from "@/lib/env";
import { getStripeClient, mapMembershipPlan, membershipPlans } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const checkoutSchema = z.object({
  plan: z.enum(["basic", "leader", "premium"])
});

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    const payload = checkoutSchema.parse(await request.json());
    const config = membershipPlans[payload.plan];
    const supabase = await getSupabaseServerClient();

    if (!stripe) {
      return NextResponse.json({
        ok: true,
        placeholder: true,
        message: "Stripe secret key is not configured yet."
      });
    }

    const priceId = process.env[config.envKey];

    if (!priceId) {
      return NextResponse.json(
        {
          error: `Missing ${config.envKey}`
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
      plan: payload.plan
    });

    const siteUrl = getSiteUrl();
    const membershipPlan = mapMembershipPlan(payload.plan);
    const metadata = {
      user_id: user.id,
      plan: membershipPlan
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${siteUrl}/premium?success=true`,
      cancel_url: `${siteUrl}/membership?canceled=true`,
      metadata,
      subscription_data: {
        metadata
      }
    });

    console.log("[stripe-checkout] session created", {
      userId: user.id,
      metadata,
      sessionId: session.id,
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
