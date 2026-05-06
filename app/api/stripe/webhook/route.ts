import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type MembershipUpsert = {
  user_id?: string | null;
  email?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  plan?: string | null;
  status?: string | null;
  current_period_end?: string | null;
  updated_at: string;
};

function toIsoDate(value?: number | null) {
  if (!value) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription | null) {
  return subscription?.items.data[0]?.current_period_end ?? null;
}

async function upsertMembership(record: MembershipUpsert) {
  const supabase = getSupabaseAdminClient();

  if (!supabase || !record.stripe_subscription_id) {
    return;
  }

  await supabase.from("memberships").upsert(record, {
    onConflict: "stripe_subscription_id"
  });
}

async function getSubscription(
  stripe: Stripe,
  subscription: string | Stripe.Subscription | null | undefined
) {
  if (!subscription) {
    return null;
  }

  if (typeof subscription === "string") {
    return stripe.subscriptions.retrieve(subscription);
  }

  return subscription;
}

async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  const subscription = await getSubscription(stripe, session.subscription);
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id || null;
  const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id || null;

  await upsertMembership({
    user_id: session.metadata?.user_id || null,
    email: session.customer_details?.email || session.customer_email || null,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    plan: session.metadata?.plan || subscription?.metadata?.plan || null,
    status: "active",
    current_period_end: toIsoDate(getCurrentPeriodEnd(subscription)),
    updated_at: new Date().toISOString()
  });
}

async function handleInvoicePaid(stripe: Stripe, invoice: Stripe.Invoice) {
  const invoiceSubscription = invoice.parent?.subscription_details?.subscription || null;
  const subscription = await getSubscription(
    stripe,
    typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription?.id || null
  );

  await upsertMembership({
    email: invoice.customer_email || null,
    stripe_customer_id: typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null,
    stripe_subscription_id:
      typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription?.id || null,
    plan: subscription?.metadata?.plan || null,
    status: "active",
    current_period_end: toIsoDate(getCurrentPeriodEnd(subscription)),
    updated_at: new Date().toISOString()
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await upsertMembership({
    user_id: subscription.metadata?.user_id || null,
    stripe_customer_id:
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id || null,
    stripe_subscription_id: subscription.id,
    plan: subscription.metadata?.plan || null,
    status: subscription.status,
    current_period_end: toIsoDate(getCurrentPeriodEnd(subscription)),
    updated_at: new Date().toISOString()
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await upsertMembership({
    user_id: subscription.metadata?.user_id || null,
    stripe_customer_id:
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id || null,
    stripe_subscription_id: subscription.id,
    plan: subscription.metadata?.plan || null,
    status: "canceled",
    current_period_end: toIsoDate(getCurrentPeriodEnd(subscription)),
    updated_at: new Date().toISOString()
  });
}

async function handleInvoiceFailed(stripe: Stripe, invoice: Stripe.Invoice) {
  const invoiceSubscription = invoice.parent?.subscription_details?.subscription || null;
  const subscription = await getSubscription(
    stripe,
    typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription?.id || null
  );

  await upsertMembership({
    email: invoice.customer_email || null,
    stripe_customer_id: typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null,
    stripe_subscription_id:
      typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription?.id || null,
    plan: subscription?.metadata?.plan || null,
    status: "past_due",
    current_period_end: toIsoDate(getCurrentPeriodEnd(subscription)),
    updated_at: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !signature || !webhookSecret) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  try {
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(stripe, event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.paid":
        await handleInvoicePaid(stripe, event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handleInvoiceFailed(stripe, event.data.object as Stripe.Invoice);
        break;
      default:
        break;
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
