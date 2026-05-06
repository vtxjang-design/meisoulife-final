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
      return NextResponse.json(
        {
          error: "Authentication required"
        },
        {
          status: 401
        }
      );
    }

    const siteUrl = getSiteUrl();
    const membershipPlan = mapMembershipPlan(payload.plan);

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
      metadata: {
        user_id: user.id,
        plan: membershipPlan
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan: membershipPlan
        }
      }
    });

    return NextResponse.json({
      ok: true,
      url: session.url
    });
  } catch (error) {
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
