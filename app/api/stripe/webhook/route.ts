import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !signature || !secret) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  try {
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    const supabase = await getSupabaseServerClient();

    if (supabase) {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        await supabase.from("subscriptions").upsert(
          {
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            status: "active",
            plan_key: session.metadata?.plan || "basic"
          },
          {
            onConflict: "stripe_subscription_id"
          }
        );
      }

      if (
        event.type === "customer.subscription.deleted" ||
        event.type === "invoice.payment_failed" ||
        event.type === "invoice.payment_succeeded"
      ) {
        const subscription = event.data.object;
        await supabase.from("subscriptions").upsert(
          {
            stripe_subscription_id: "id" in subscription ? subscription.id : null,
            status:
              event.type === "invoice.payment_failed"
                ? "past_due"
                : event.type === "customer.subscription.deleted"
                  ? "canceled"
                  : "active"
          },
          {
            onConflict: "stripe_subscription_id"
          }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Webhook failed"
      },
      {
        status: 400
      }
    );
  }
}
