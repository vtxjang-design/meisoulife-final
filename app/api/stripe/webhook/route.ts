import { NextResponse } from "next/server";
import Stripe from "stripe";
import { normalizeLookupEmail, normalizeMembershipPlan } from "@/lib/membership";
import { sendAdminPaymentNotification, sendPaymentConfirmationEmail } from "@/lib/resend";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type MembershipSyncInput = {
  user_id?: string | null;
  email?: string | null;
  plan?: string | null;
  status?: string | null;
  amount_total?: number | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
};

const processedWebhookEventsFallback = new Set<string>();

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

function resolvePlanFromAmount(amountTotal?: number | null) {
  if (amountTotal === 1000) {
    return "basic";
  }

  if (amountTotal === 3000) {
    return "growth";
  }

  if (amountTotal === 10000) {
    return "inner_circle";
  }

  return null;
}

function getMembershipPlan(record: MembershipSyncInput) {
  const normalizedPlan = normalizeMembershipPlan(record.plan);
  const amountDerivedPlan = resolvePlanFromAmount(record.amount_total);

  if (normalizedPlan !== "free") {
    return normalizedPlan;
  }

  return amountDerivedPlan || "basic";
}

async function resolveMembershipUserId(email?: string | null, explicitUserId?: string | null) {
  const supabase = getSupabaseAdminClient();
  const normalizedEmail = normalizeLookupEmail(email);

  if (explicitUserId) {
    return explicitUserId;
  }

  if (!supabase || !normalizedEmail) {
    return null;
  }

  console.log("[stripe-webhook] Stripe email", { email: normalizedEmail });

  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (error) {
    console.error("[stripe-webhook] failed to lookup auth user by email", {
      email: normalizedEmail,
      message: error.message
    });
    return null;
  }

  const matchedUser = data.users.find((user) => normalizeLookupEmail(user.email) === normalizedEmail);

  console.log("[stripe-webhook] matched user id", {
    email: normalizedEmail,
    userId: matchedUser?.id || null
  });

  return matchedUser?.id || null;
}

async function upsertMembership(record: MembershipSyncInput) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    await logWithoutDatabase("memberships sync skipped", {
      reason: "missing_supabase_admin"
    });
    return;
  }

  const resolvedUserId = await resolveMembershipUserId(record.email, record.user_id);
  const resolvedPlan = getMembershipPlan(record);
  const resolvedStatus = record.status || "active";
  const normalizedEmail = normalizeLookupEmail(record.email);

  if (!resolvedUserId) {
    console.warn("[stripe-webhook] membership sync skipped because user_id could not be resolved", {
      email: normalizedEmail,
      plan: resolvedPlan,
      status: resolvedStatus,
      stripeCustomerId: record.stripe_customer_id || null,
      stripeSubscriptionId: record.stripe_subscription_id || null,
      reason: "webhook_pending_or_email_mismatch"
    });
    return;
  }

  const { data, error } = await supabase
    .from("memberships")
    .upsert(
      {
        user_id: resolvedUserId,
        email: normalizedEmail,
        stripe_customer_id: record.stripe_customer_id || null,
        stripe_subscription_id: record.stripe_subscription_id || null,
        plan: resolvedPlan,
        status: resolvedStatus
      },
      {
        onConflict: "user_id"
      }
    )
    .select("user_id, plan, status")
    .maybeSingle();

  if (error) {
    console.error("[stripe-webhook] membership upsert failed", {
      userId: resolvedUserId,
      message: error.message
    });

    const { data: existingMembership, error: lookupError } = await supabase
      .from("memberships")
      .select("id")
      .eq("user_id", resolvedUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error("[stripe-webhook] failed to lookup existing membership", {
        userId: resolvedUserId,
        message: lookupError.message
      });
      return;
    }

    if (!existingMembership?.id) {
      return;
    }

    const { data: fallbackData, error: fallbackError } = await supabase
      .from("memberships")
      .update({
        email: normalizedEmail,
        stripe_customer_id: record.stripe_customer_id || null,
        stripe_subscription_id: record.stripe_subscription_id || null,
        plan: resolvedPlan,
        status: resolvedStatus
      })
      .eq("id", existingMembership.id)
      .select("user_id, plan, status")
      .maybeSingle();

    if (fallbackError) {
      console.error("[stripe-webhook] membership fallback update failed", {
        userId: resolvedUserId,
        message: fallbackError.message
      });
      return;
    }

    console.log("[stripe-webhook] Membership synced", fallbackData);
    return;
  }

  console.log("[stripe-webhook] Membership synced", data);
}

async function syncUserPlan(record: {
  userId?: string | null;
  email?: string | null;
  plan?: string | null;
  status?: string | null;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase || !record.email) {
    return;
  }

  const resolvedUserId = await resolveMembershipUserId(record.email, record.userId);
  const normalizedEmail = normalizeLookupEmail(record.email);
  const currentPlan = record.status === "active" || record.status === "trialing" ? normalizeMembershipPlan(record.plan) || "free" : "free";
  const { error } = await supabase.from("users").upsert(
    {
      auth_user_id: resolvedUserId || null,
      email: normalizedEmail,
      current_plan: currentPlan
    },
    {
      onConflict: "email"
    }
  );

  if (error) {
    console.warn("[stripe-webhook] user plan sync failed", {
      email: record.email,
      message: error.message
    });
  }
}

async function hasProcessedWebhookEvent(eventId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    const processed = processedWebhookEventsFallback.has(eventId);
    await logWithoutDatabase("webhook idempotency using in-memory fallback", {
      reason: "missing_supabase_admin",
      eventId,
      processed
    });
    return processed;
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
    processedWebhookEventsFallback.add(eventId);
    await logWithoutDatabase("webhook processed event stored in-memory fallback", {
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
  console.log("[stripe-webhook] checkout.session.completed received", {
    sessionId: session.id,
    customerId: typeof session.customer === "string" ? session.customer : session.customer?.id || null
  });

  const subscription = await getSubscription(stripe, session.subscription);
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id || null;
  const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id || null;
  const language = session.metadata?.language || null;
  const plan = session.metadata?.plan || subscription?.metadata?.plan || resolvePlanFromAmount(session.amount_total) || null;
  const userId = session.metadata?.user_id || session.metadata?.userId || null;

  await upsertMembership({
    user_id: userId,
    email: session.customer_details?.email || session.customer_email || null,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    plan,
    status: "active",
    amount_total: session.amount_total ?? null,
  });
  await syncUserPlan({
    userId,
    email: session.customer_details?.email || session.customer_email || null,
    plan,
    status: "active"
  });

  const customerEmail = session.customer_details?.email || session.customer_email || null;

  if (!customerEmail) {
    console.warn("[stripe-webhook] customer email missing", {
      sessionId: session.id,
      plan
    });
    return;
  }

  console.log("[stripe-webhook] customer email found", {
    sessionId: session.id,
    email: customerEmail
  });

  try {
    await sendPaymentConfirmationEmail({
      email: customerEmail,
      name: session.customer_details?.name || null,
      language,
      plan,
      amountTotal: session.amount_total ?? null,
      currency: session.currency ?? null,
      subscriptionId: stripeSubscriptionId
    });
  } catch (error) {
    console.error("[stripe-webhook] resend email failed with error", {
      sessionId: session.id,
      email: customerEmail,
      error: error instanceof Error ? error.message : error
    });
  }

  if (process.env.ADMIN_EMAIL) {
    try {
      await sendAdminPaymentNotification({
        customerEmail,
        customerName: session.customer_details?.name || null,
        plan,
        amountTotal: session.amount_total ?? null,
        currency: session.currency ?? null
      });
    } catch (error) {
      console.error("[stripe-webhook] admin email failed with error", {
        sessionId: session.id,
        email: customerEmail,
        error: error instanceof Error ? error.message : error
      });
    }
  }
}

async function handleInvoicePaid(stripe: Stripe, invoice: Stripe.Invoice) {
  const invoiceSubscription = invoice.parent?.subscription_details?.subscription || null;
  const subscription = await getSubscription(
    stripe,
    typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription?.id || null
  );

  await upsertMembership({
    user_id: subscription?.metadata?.user_id || null,
    email: invoice.customer_email || null,
    stripe_customer_id: typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null,
    stripe_subscription_id: subscription?.id || null,
    plan: subscription?.metadata?.plan || resolvePlanFromAmount(invoice.amount_paid || invoice.amount_due || null) || null,
    status: "active",
    amount_total: invoice.amount_paid || invoice.amount_due || null,
  });
  await syncUserPlan({
    userId: subscription?.metadata?.user_id || null,
    email: invoice.customer_email || null,
    plan: subscription?.metadata?.plan || null,
    status: "active"
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  await handleSubscriptionUpdated(subscription);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await upsertMembership({
    user_id: subscription.metadata?.user_id || null,
    email: subscription.metadata?.email || null,
    stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id || null,
    stripe_subscription_id: subscription.id,
    plan: subscription.metadata?.plan || null,
    status: subscription.status
  });
  await syncUserPlan({
    userId: subscription.metadata?.user_id || null,
    email: subscription.metadata?.email || null,
    plan: subscription.metadata?.plan || null,
    status: subscription.status
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await upsertMembership({
    user_id: subscription.metadata?.user_id || null,
    email: subscription.metadata?.email || null,
    stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id || null,
    stripe_subscription_id: subscription.id,
    plan: subscription.metadata?.plan || null,
    status: "canceled"
  });
  await syncUserPlan({
    userId: subscription.metadata?.user_id || null,
    email: subscription.metadata?.email || null,
    plan: subscription.metadata?.plan || null,
    status: "canceled"
  });
}

async function handleInvoiceFailed(stripe: Stripe, invoice: Stripe.Invoice) {
  const invoiceSubscription = invoice.parent?.subscription_details?.subscription || null;
  const subscription = await getSubscription(
    stripe,
    typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription?.id || null
  );

  await upsertMembership({
    user_id: subscription?.metadata?.user_id || null,
    email: invoice.customer_email || null,
    stripe_customer_id: typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null,
    stripe_subscription_id: subscription?.id || null,
    plan: subscription?.metadata?.plan || resolvePlanFromAmount(invoice.amount_due || null) || null,
    status: "past_due",
    amount_total: invoice.amount_due || null,
  });
  await syncUserPlan({
    userId: subscription?.metadata?.user_id || null,
    email: invoice.customer_email || null,
    plan: subscription?.metadata?.plan || null,
    status: "past_due"
  });
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !signature || !webhookSecret) {
    console.error("[stripe-webhook] missing required configuration", {
      hasStripeClient: Boolean(stripe),
      hasSignature: Boolean(signature),
      hasWebhookSecret: Boolean(webhookSecret)
    });
    return NextResponse.json({ received: false }, { status: 400 });
  }

  try {
    const body = await request.text();
    console.log("[stripe-webhook] Stripe webhook received");
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log("[stripe-webhook] event type received", { type: event.type, id: event.id });

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
