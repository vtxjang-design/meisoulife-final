import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendPaymentConfirmationEmail } from "@/lib/resend";
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

async function logWithoutDatabase(message: string, payload: Record<string, unknown>) {
  console.warn(`[stripe-webhook] ${message}`, payload);
}

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
    await logWithoutDatabase("memberships upsert skipped", {
      reason: !supabase ? "missing_supabase_admin" : "missing_subscription_id",
      subscriptionId: record.stripe_subscription_id
    });
    return;
  }

  await supabase.from("memberships").upsert(record, {
    onConflict: "stripe_subscription_id"
  });
}

async function hasProcessedWebhookEvent(eventId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    await logWithoutDatabase("webhook idempotency lookup skipped", {
      reason: "missing_supabase_admin",
      eventId
    });
    return false;
  }

  const { data, error } = await supabase
    .from("stripe_webhook_events")
    .select("event_id")
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) {
    console.warn("[stripe-webhook] idempotency lookup failed", {
      eventId,
      message: error.message
    });
    return false;
  }

  return Boolean(data?.event_id);
}

async function markWebhookEventProcessed(eventId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    await logWithoutDatabase("webhook processed event persistence skipped", {
      reason: "missing_supabase_admin",
      eventId
    });
    return;
  }

  const { error } = await supabase.from("stripe_webhook_events").insert({
    event_id: eventId
  });

  if (error) {
    console.warn("[stripe-webhook] failed to persist processed event", {
      eventId,
      message: error.message
    });
  }
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
  const language = session.metadata?.language || null;
  const plan = session.metadata?.plan || subscription?.metadata?.plan || null;
  const userId = session.metadata?.user_id || session.metadata?.userId || null;

  await upsertMembership({
    user_id: userId,
    email: session.customer_details?.email || session.customer_email || null,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    plan,
    status: "active",
    current_period_end: toIsoDate(getCurrentPeriodEnd(subscription)),
    updated_at: new Date().toISOString()
  });

  const customerEmail = session.customer_details?.email || session.customer_email || null;

  if (!customerEmail) {
    console.warn("[stripe-webhook] checkout completed without customer email", {
      sessionId: session.id,
      plan
    });
    return;
  }

  await sendPaymentConfirmationEmail({
    email: customerEmail,
    name: session.customer_details?.name || null,
    language,
    plan,
    amountTotal: session.amount_total ?? null,
    currency: session.currency ?? null
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

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  await handleSubscriptionUpdated(subscription);
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
    console.log("[stripe-webhook] received", { type: event.type, id: event.id });

    const alreadyProcessed = await hasProcessedWebhookEvent(event.id);

    if (alreadyProcessed) {
      console.log("[stripe-webhook] duplicate event ignored", { id: event.id, type: event.type });
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(stripe, event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
      case "invoice.payment_succeeded":
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
        console.log("[stripe-webhook] unhandled", { type: event.type });
        break;
    }

    await markWebhookEventProcessed(event.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe-webhook] failed", error);
    const isSignatureError =
      error instanceof Stripe.errors.StripeSignatureVerificationError ||
      (error instanceof Error && error.message.toLowerCase().includes("signature"));

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Webhook failed"
      },
      {
        status: isSignatureError ? 400 : 500
      }
    );
  }
}
