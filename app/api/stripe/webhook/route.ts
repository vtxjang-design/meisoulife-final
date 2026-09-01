import { NextResponse } from "next/server";
import Stripe from "stripe";
import { normalizeLookupEmail, normalizeMembershipPlan } from "@/lib/membership";
import { sendAdminPaymentNotification, sendPaymentConfirmationEmail } from "@/lib/resend";
import { getStripeClient } from "@/lib/stripe";
import {
  claimStripeWebhookEvent,
  completeStripeWebhookEvent,
  failStripeWebhookEvent,
  WebhookLedgerError
} from "@/lib/stripe-webhook-ledger";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type MembershipSyncInput = {
  user_id?: string | null;
  email?: string | null;
  plan?: string | null;
  status?: string | null;
  amount_total?: number | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_end?: string | null;
};

type CheckoutNotification = {
  customerEmail: string;
  customerName: string | null;
  language: string | null;
  plan: string | null;
  amountTotal: number | null;
  currency: string | null;
  subscriptionId: string | null;
};

class WebhookSyncError extends Error {
  readonly category: string;

  constructor(category: string) {
    super(`Stripe webhook sync failed: ${category}`);
    this.name = "WebhookSyncError";
    this.category = category;
  }
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
  const normalizedEmail = normalizeLookupEmail(email);

  if (explicitUserId) {
    return explicitUserId;
  }

  if (!normalizedEmail) {
    return null;
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new WebhookSyncError("missing_supabase_admin");
  }

  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (error) {
    console.error("[stripe-webhook] failed to lookup auth user by email", {
      category: "auth_user_lookup"
    });
    throw new WebhookSyncError("auth_user_lookup");
  }

  const matchedUser = data.users.find((user) => normalizeLookupEmail(user.email) === normalizedEmail);

  console.log("[stripe-webhook] auth user lookup completed", {
    matched: Boolean(matchedUser?.id)
  });

  return matchedUser?.id || null;
}

async function upsertMembership(record: MembershipSyncInput) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new WebhookSyncError("missing_supabase_admin");
  }

  const resolvedUserId = await resolveMembershipUserId(record.email, record.user_id);
  const resolvedPlan = getMembershipPlan(record);
  const resolvedStatus = record.status || "active";
  const normalizedEmail = normalizeLookupEmail(record.email);
  const payload = {
    user_id: resolvedUserId,
    email: normalizedEmail,
    stripe_customer_id: record.stripe_customer_id || null,
    stripe_subscription_id: record.stripe_subscription_id || null,
    plan: resolvedPlan,
    status: resolvedStatus,
    current_period_end: record.current_period_end ?? null
  };

  const existingMembership =
    record.stripe_subscription_id
      ? await supabase
          .from("memberships")
          .select("id")
          .eq("stripe_subscription_id", record.stripe_subscription_id)
          .limit(1)
          .maybeSingle()
      : resolvedUserId
        ? await supabase
            .from("memberships")
            .select("id")
            .eq("user_id", resolvedUserId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : normalizedEmail
          ? await supabase
              .from("memberships")
              .select("id")
              .eq("email", normalizedEmail)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle()
          : { data: null, error: null };

  if (existingMembership.error) {
    console.error("[stripe-webhook] existing membership lookup failed", {
      category: "membership_lookup"
    });
    throw new WebhookSyncError("membership_lookup");
  }

  const existingMembershipId = existingMembership.data?.id ?? null;

  const { data, error } = existingMembershipId
    ? await supabase.from("memberships").update(payload).eq("id", existingMembershipId).select("user_id, plan, status").maybeSingle()
    : await supabase.from("memberships").insert(payload).select("user_id, plan, status").maybeSingle();

  if (error) {
    console.error("[stripe-webhook] membership upsert failed", {
      category: "membership_upsert"
    });
    throw new WebhookSyncError("membership_upsert");
  }

  console.log("[stripe-webhook] membership synced", {
    plan: data?.plan ?? resolvedPlan,
    status: data?.status ?? resolvedStatus,
    authenticated: Boolean(data?.user_id ?? resolvedUserId)
  });
}

async function syncSubscriptionRecord(record: MembershipSyncInput) {
  const supabase = getSupabaseAdminClient();

  if (!record.email) {
    return;
  }

  if (!supabase) {
    throw new WebhookSyncError("missing_supabase_admin");
  }

  const normalizedEmail = normalizeLookupEmail(record.email);
  const resolvedUserId = await resolveMembershipUserId(record.email, record.user_id);
  const resolvedPlan = getMembershipPlan(record);
  const resolvedStatus = record.status || "active";
  const { data: profile, error: profileError } = normalizedEmail
    ? await supabase.from("users").select("id").eq("email", normalizedEmail).maybeSingle()
    : { data: null, error: null };

  if (profileError) {
    console.error("[stripe-webhook] subscription mirror profile lookup failed", {
      category: "subscription_profile_lookup"
    });
    throw new WebhookSyncError("subscription_profile_lookup");
  }

  if (!profile?.id) {
    return;
  }

  if (resolvedUserId) {
    const { error: authUserUpdateError } = await supabase
      .from("users")
      .update({ auth_user_id: resolvedUserId })
      .eq("id", profile.id);

    if (authUserUpdateError) {
      console.error("[stripe-webhook] failed to attach auth user id to profile", {
        category: "profile_auth_link"
      });
      throw new WebhookSyncError("profile_auth_link");
    }
  }

  const payload = {
    user_id: profile.id,
    stripe_customer_id: record.stripe_customer_id || null,
    stripe_subscription_id: record.stripe_subscription_id || null,
    plan_key: resolvedPlan,
    status: resolvedStatus,
    current_period_end: record.current_period_end ?? null
  };

  const existingSubscription =
    record.stripe_subscription_id
      ? await supabase
          .from("subscriptions")
          .select("id")
          .eq("stripe_subscription_id", record.stripe_subscription_id)
          .limit(1)
          .maybeSingle()
      : await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

  if (existingSubscription.error) {
    console.error("[stripe-webhook] subscription mirror lookup failed", {
      category: "subscription_lookup"
    });
    throw new WebhookSyncError("subscription_lookup");
  }

  const { error } = existingSubscription.data?.id
    ? await supabase.from("subscriptions").update(payload).eq("id", existingSubscription.data.id)
    : await supabase.from("subscriptions").insert(payload);

  if (error) {
    console.error("[stripe-webhook] subscription mirror sync failed", {
      category: "subscription_upsert"
    });
    throw new WebhookSyncError("subscription_upsert");
  }
}

async function syncUserPlan(record: {
  userId?: string | null;
  email?: string | null;
  plan?: string | null;
  status?: string | null;
}) {
  const supabase = getSupabaseAdminClient();

  if (!record.email) {
    return;
  }

  if (!supabase) {
    throw new WebhookSyncError("missing_supabase_admin");
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
    console.error("[stripe-webhook] user plan sync failed", {
      category: "user_plan_upsert"
    });
    throw new WebhookSyncError("user_plan_upsert");
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

async function getAuthoritativeSubscription(
  stripe: Stripe,
  eventSubscription: Stripe.Subscription
) {
  try {
    return await stripe.subscriptions.retrieve(eventSubscription.id);
  } catch (error) {
    if (
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      error.code === "resource_missing"
    ) {
      return {
        ...eventSubscription,
        status: "canceled"
      } as Stripe.Subscription;
    }

    throw error;
  }
}

async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  console.log("[stripe-webhook] checkout.session.completed received", {
    customerPresent: Boolean(session.customer),
    subscriptionPresent: Boolean(session.subscription)
  });

  const subscription = await getSubscription(stripe, session.subscription);
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id || null;
  const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id || null;
  const language = session.metadata?.language || null;
  const plan = session.metadata?.plan || subscription?.metadata?.plan || resolvePlanFromAmount(session.amount_total) || null;
  const userId = session.metadata?.user_id || session.metadata?.userId || null;
  const subscriptionStatus = subscription?.status || "active";

  await upsertMembership({
    user_id: userId,
    email: session.customer_details?.email || session.customer_email || null,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    plan,
    status: subscriptionStatus,
    amount_total: session.amount_total ?? null,
    current_period_end: toIsoDate(getCurrentPeriodEnd(subscription))
  });
  await syncSubscriptionRecord({
    user_id: userId,
    email: session.customer_details?.email || session.customer_email || null,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    plan,
    status: subscriptionStatus,
    amount_total: session.amount_total ?? null,
    current_period_end: toIsoDate(getCurrentPeriodEnd(subscription))
  });
  await syncUserPlan({
    userId,
    email: session.customer_details?.email || session.customer_email || null,
    plan,
    status: subscriptionStatus
  });

  const customerEmail = session.customer_details?.email || session.customer_email || null;

  if (!customerEmail) {
    console.warn("[stripe-webhook] customer email missing", {
      plan
    });
    return null;
  }

  console.log("[stripe-webhook] customer email found", {
    emailPresent: true
  });

  return {
    customerEmail,
    customerName: session.customer_details?.name || null,
    language,
    plan,
    amountTotal: session.amount_total ?? null,
    currency: session.currency ?? null,
    subscriptionId: stripeSubscriptionId
  } satisfies CheckoutNotification;
}

async function sendCheckoutNotifications(notification: CheckoutNotification) {
  try {
    await sendPaymentConfirmationEmail({
      email: notification.customerEmail,
      name: notification.customerName,
      language: notification.language,
      plan: notification.plan,
      amountTotal: notification.amountTotal,
      currency: notification.currency,
      subscriptionId: notification.subscriptionId
    });
  } catch {
    console.error("[stripe-webhook] resend email failed with error", {
      category: "customer_notification"
    });
  }

  if (process.env.ADMIN_EMAIL) {
    try {
      await sendAdminPaymentNotification({
        customerEmail: notification.customerEmail,
        customerName: notification.customerName,
        plan: notification.plan,
        amountTotal: notification.amountTotal,
        currency: notification.currency
      });
    } catch {
      console.error("[stripe-webhook] admin email failed with error", {
        category: "admin_notification"
      });
    }
  }
}

function getWebhookFailureCategory(error: unknown) {
  if (error instanceof WebhookLedgerError || error instanceof WebhookSyncError) {
    return error.category;
  }

  return "event_processing";
}

async function handleInvoicePaid(stripe: Stripe, invoice: Stripe.Invoice) {
  const invoiceSubscription = invoice.parent?.subscription_details?.subscription || null;
  const subscription = await getSubscription(
    stripe,
    typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription?.id || null
  );
  const subscriptionStatus = subscription?.status || "active";

  await upsertMembership({
    user_id: subscription?.metadata?.user_id || null,
    email: invoice.customer_email || null,
    stripe_customer_id: typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null,
    stripe_subscription_id: subscription?.id || null,
    plan: subscription?.metadata?.plan || resolvePlanFromAmount(invoice.amount_paid || invoice.amount_due || null) || null,
    status: subscriptionStatus,
    amount_total: invoice.amount_paid || invoice.amount_due || null,
    current_period_end: toIsoDate(getCurrentPeriodEnd(subscription))
  });
  await syncSubscriptionRecord({
    user_id: subscription?.metadata?.user_id || null,
    email: invoice.customer_email || null,
    stripe_customer_id: typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null,
    stripe_subscription_id: subscription?.id || null,
    plan: subscription?.metadata?.plan || resolvePlanFromAmount(invoice.amount_paid || invoice.amount_due || null) || null,
    status: subscriptionStatus,
    amount_total: invoice.amount_paid || invoice.amount_due || null,
    current_period_end: toIsoDate(getCurrentPeriodEnd(subscription))
  });
  await syncUserPlan({
    userId: subscription?.metadata?.user_id || null,
    email: invoice.customer_email || null,
    plan: subscription?.metadata?.plan || null,
    status: subscriptionStatus
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
    status: subscription.status,
    current_period_end: toIsoDate(getCurrentPeriodEnd(subscription))
  });
  await syncSubscriptionRecord({
    user_id: subscription.metadata?.user_id || null,
    email: subscription.metadata?.email || null,
    stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id || null,
    stripe_subscription_id: subscription.id,
    plan: subscription.metadata?.plan || null,
    status: subscription.status,
    current_period_end: toIsoDate(getCurrentPeriodEnd(subscription))
  });
  await syncUserPlan({
    userId: subscription.metadata?.user_id || null,
    email: subscription.metadata?.email || null,
    plan: subscription.metadata?.plan || null,
    status: subscription.status
  });
}

async function handleInvoiceFailed(stripe: Stripe, invoice: Stripe.Invoice) {
  const invoiceSubscription = invoice.parent?.subscription_details?.subscription || null;
  const subscription = await getSubscription(
    stripe,
    typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription?.id || null
  );
  const subscriptionStatus = subscription?.status || "past_due";

  await upsertMembership({
    user_id: subscription?.metadata?.user_id || null,
    email: invoice.customer_email || null,
    stripe_customer_id: typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null,
    stripe_subscription_id: subscription?.id || null,
    plan: subscription?.metadata?.plan || resolvePlanFromAmount(invoice.amount_due || null) || null,
    status: subscriptionStatus,
    amount_total: invoice.amount_due || null,
    current_period_end: toIsoDate(getCurrentPeriodEnd(subscription))
  });
  await syncSubscriptionRecord({
    user_id: subscription?.metadata?.user_id || null,
    email: invoice.customer_email || null,
    stripe_customer_id: typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null,
    stripe_subscription_id: subscription?.id || null,
    plan: subscription?.metadata?.plan || resolvePlanFromAmount(invoice.amount_due || null) || null,
    status: subscriptionStatus,
    amount_total: invoice.amount_due || null,
    current_period_end: toIsoDate(getCurrentPeriodEnd(subscription))
  });
  await syncUserPlan({
    userId: subscription?.metadata?.user_id || null,
    email: invoice.customer_email || null,
    plan: subscription?.metadata?.plan || null,
    status: subscriptionStatus
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
    console.log("[stripe-webhook] event type received", { type: event.type });
    const ledgerClient = getSupabaseAdminClient();
    const claim = await claimStripeWebhookEvent(ledgerClient, event.id, event.type);

    if (claim.outcome === "completed") {
      console.log("[stripe-webhook] completed duplicate ignored", { type: event.type });
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (claim.outcome === "processing") {
      console.log("[stripe-webhook] concurrent duplicate ignored", { type: event.type });
      return NextResponse.json({ received: true, duplicate: true, processing: true });
    }

    const claimToken = claim.claimToken;

    if (!claimToken) {
      throw new WebhookLedgerError("missing_claim_token");
    }

    let checkoutNotification: CheckoutNotification | null = null;

    try {
      switch (event.type) {
        case "checkout.session.completed":
          checkoutNotification = await handleCheckoutCompleted(
            stripe,
            event.data.object as Stripe.Checkout.Session
          );
          break;
        case "customer.subscription.created":
          await handleSubscriptionCreated(
            await getAuthoritativeSubscription(
              stripe,
              event.data.object as Stripe.Subscription
            )
          );
          break;
        case "invoice.paid":
        case "invoice.payment_succeeded":
          await handleInvoicePaid(stripe, event.data.object as Stripe.Invoice);
          break;
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          await handleSubscriptionUpdated(
            await getAuthoritativeSubscription(
              stripe,
              event.data.object as Stripe.Subscription
            )
          );
          break;
        case "invoice.payment_failed":
          await handleInvoiceFailed(stripe, event.data.object as Stripe.Invoice);
          break;
        default:
          console.log("[stripe-webhook] unhandled", { type: event.type });
          break;
      }

      await completeStripeWebhookEvent(ledgerClient, event.id, claimToken);
    } catch (error) {
      const category = getWebhookFailureCategory(error);

      try {
        await failStripeWebhookEvent(ledgerClient, event.id, claimToken, category);
      } catch {
        console.error("[stripe-webhook] failed to persist event failure", {
          category: "failure_record"
        });
      }

      throw error;
    }

    if (checkoutNotification) {
      await sendCheckoutNotifications(checkoutNotification);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const isSignatureError =
      error instanceof Stripe.errors.StripeSignatureVerificationError ||
      (error instanceof Error && error.message.toLowerCase().includes("signature"));
    const isLedgerError = error instanceof WebhookLedgerError;
    const category = isSignatureError ? "signature" : getWebhookFailureCategory(error);

    console.error("[stripe-webhook] failed", { category });

    return NextResponse.json(
      {
        error: isSignatureError ? "Invalid webhook signature" : "Webhook processing failed"
      },
      {
        status: isSignatureError ? 400 : isLedgerError ? 503 : 500,
        headers: isSignatureError
          ? { "Cache-Control": "no-store" }
          : { "Cache-Control": "no-store", "Retry-After": "60" }
      }
    );
  }
}
