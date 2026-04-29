import { NextResponse } from "next/server";
import { z } from "zod";
import { getSiteUrl } from "@/lib/env";
import { getStripeClient, membershipPlans } from "@/lib/stripe";

const checkoutSchema = z.object({
  plan: z.enum(["basic", "leader", "premium"])
});

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    const payload = checkoutSchema.parse(await request.json());
    const config = membershipPlans[payload.plan];

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

    const siteUrl = getSiteUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${siteUrl}/dashboard?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=canceled`,
      metadata: {
        plan: payload.plan
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
