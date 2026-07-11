import Stripe from "stripe";
import { getPlanPriceId, type MembershipRecordPlan } from "@/lib/stripe";

type StripePlanPreference = MembershipRecordPlan | "free";

export type StripeResolvedBilling = {
  customerId: string | null;
  subscriptionId: string | null;
  plan: MembershipRecordPlan | "free";
  status: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  billingCycleAnchor: string | null;
  customerSource: string;
};

type CandidateCustomer = {
  customerId: string;
  source: string;
};

function normalizeStripePlan(input?: string | null): MembershipRecordPlan | "free" {
  if (!input) {
    return "free";
  }

  const normalized = input.toLowerCase().replace(/[-\s]/g, "_");

  if (normalized === "basic") {
    return "basic";
  }

  if (normalized === "growth" || normalized === "leader") {
    return "growth";
  }

  if (normalized === "inner_circle" || normalized === "premium" || normalized === "innercircle") {
    return "inner_circle";
  }

  return "free";
}

function inferPlanFromSubscription(subscription: Stripe.Subscription): MembershipRecordPlan | "free" {
  const metadataPlan = normalizeStripePlan(subscription.metadata?.plan || null);

  if (metadataPlan !== "free") {
    return metadataPlan;
  }

  const basicPriceId = getPlanPriceId("basic")?.priceId || null;
  const growthPriceId = getPlanPriceId("growth")?.priceId || null;
  const innerCirclePriceId = getPlanPriceId("inner-circle")?.priceId || null;

  if (subscription.items.data.some((item) => item.price?.id === innerCirclePriceId)) {
    return "inner_circle";
  }

  if (subscription.items.data.some((item) => item.price?.id === growthPriceId)) {
    return "growth";
  }

  if (subscription.items.data.some((item) => item.price?.id === basicPriceId)) {
    return "basic";
  }

  return "free";
}

function toIsoDateFromUnix(value?: number | null) {
  if (!value) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

export function maskStripeCustomerId(value: string | null) {
  if (!value) {
    return null;
  }

  if (value.length <= 8) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function getSubscriptionPriority(status: Stripe.Subscription.Status) {
  if (status === "active") {
    return 5;
  }

  if (status === "trialing") {
    return 4;
  }

  if (status === "past_due") {
    return 3;
  }

  if (status === "unpaid") {
    return 2;
  }

  if (status === "paused") {
    return 1;
  }

  return 0;
}

function getSubscriptionPlanMatch(subscription: Stripe.Subscription, preferredPlan: StripePlanPreference) {
  if (preferredPlan === "free") {
    return 0;
  }

  const preferredPriceId = getPlanPriceId(preferredPlan)?.priceId || null;
  const metadataPlan = subscription.metadata?.plan?.toLowerCase().replace(/[-\s]/g, "_") || "";
  const preferredMetadataPlan = preferredPlan.toLowerCase();
  const hasMatchingPrice = subscription.items.data.some((item) => item.price?.id === preferredPriceId);

  if (metadataPlan === preferredMetadataPlan || hasMatchingPrice) {
    return 2;
  }

  return 0;
}

async function buildCandidateCustomers(
  stripe: Stripe,
  email: string | null,
  localCustomerIds: Array<{ customerId: string; source: string }>
) {
  const candidates = new Map<string, CandidateCustomer>();

  for (const entry of localCustomerIds) {
    if (entry.customerId) {
      candidates.set(entry.customerId, {
        customerId: entry.customerId,
        source: entry.source
      });
    }
  }

  if (email) {
    const customerList = await stripe.customers.list({
      email,
      limit: 10
    });

    console.log("[stripe-billing] stripe email lookup", {
      email,
      customerCount: customerList.data.length
    });

    for (const customer of customerList.data) {
      if (!candidates.has(customer.id)) {
        candidates.set(customer.id, {
          customerId: customer.id,
          source: "stripe_email"
        });
      }
    }
  }

  return Array.from(candidates.values());
}

export async function resolveStripeBillingDetails(params: {
  stripe: Stripe;
  email: string | null;
  preferredPlan: StripePlanPreference;
  localCustomerIds: Array<{ customerId: string; source: string }>;
}) {
  const { stripe, email, preferredPlan, localCustomerIds } = params;
  const candidates = await buildCandidateCustomers(stripe, email, localCustomerIds);

  let best:
    | (StripeResolvedBilling & {
        score: number;
      })
    | null = null;

  for (const candidate of candidates) {
    const subscriptions = await stripe.subscriptions.list({
      customer: candidate.customerId,
      status: "all",
      limit: 20
    });

    console.log("[stripe-billing] customer subscriptions", {
      customerId: maskStripeCustomerId(candidate.customerId),
      source: candidate.source,
      subscriptionCount: subscriptions.data.length
    });

    if (subscriptions.data.length === 0) {
      if (!best) {
        best = {
          customerId: candidate.customerId,
          subscriptionId: null,
          plan: "free",
          status: null,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          billingCycleAnchor: null,
          customerSource: candidate.source,
          score: 0
        };
      }

      continue;
    }

    for (const subscription of subscriptions.data) {
      const statusScore = getSubscriptionPriority(subscription.status);
      const planScore = getSubscriptionPlanMatch(subscription, preferredPlan);
      const score = statusScore * 100 + planScore * 10 + subscription.items.data.length;
      const currentPeriodStart = toIsoDateFromUnix(subscription.items.data[0]?.current_period_start ?? null);
      const currentPeriodEnd = toIsoDateFromUnix(subscription.items.data[0]?.current_period_end ?? null);
      const billingCycleAnchor = toIsoDateFromUnix(subscription.billing_cycle_anchor ?? null);
      const resolvedPlan = inferPlanFromSubscription(subscription);

      console.log({
        customerId: maskStripeCustomerId(candidate.customerId),
        subscriptionId: subscription.id,
        plan: resolvedPlan,
        status: subscription.status,
        currentPeriodStart,
        currentPeriodEnd,
        billingCycleAnchor
      });

      if (!best || score > best.score) {
        best = {
          customerId: candidate.customerId,
          subscriptionId: subscription.id,
          plan: resolvedPlan,
          status: subscription.status,
          currentPeriodStart,
          currentPeriodEnd,
          billingCycleAnchor,
          customerSource: candidate.source,
          score
        };
      }
    }
  }

  if (!best) {
    return {
      customerId: null,
      subscriptionId: null,
      plan: "free",
      status: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      billingCycleAnchor: null,
      customerSource: "none"
    } satisfies StripeResolvedBilling;
  }

  const { score: _score, ...resolved } = best;
  return resolved satisfies StripeResolvedBilling;
}
