import Stripe from "stripe";

export type PublicCheckoutPlan = "basic" | "growth" | "inner-circle";
export type LegacyCheckoutPlan = "leader" | "premium" | "inner_circle";
export type CheckoutPlanInput = PublicCheckoutPlan | LegacyCheckoutPlan;
export type MembershipRecordPlan = "basic" | "growth" | "inner_circle";

type StripePlanConfig = {
  publicPlan: PublicCheckoutPlan;
  membershipPlan: MembershipRecordPlan;
  displayName: string;
  amount: number;
  envKeys: string[];
};

const PLAN_CONFIGS: Record<PublicCheckoutPlan, StripePlanConfig> = {
  basic: {
    publicPlan: "basic",
    membershipPlan: "basic",
    displayName: "Basic",
    amount: 1000,
    envKeys: ["STRIPE_PRICE_ID_BASIC", "STRIPE_PRICE_BASIC_MONTHLY", "STRIPE_PRICE_BASIC"]
  },
  growth: {
    publicPlan: "growth",
    membershipPlan: "growth",
    displayName: "Growth",
    amount: 3000,
    envKeys: ["STRIPE_PRICE_ID_GROWTH", "STRIPE_PRICE_GROWTH_MONTHLY", "STRIPE_PRICE_LEADER"]
  },
  "inner-circle": {
    publicPlan: "inner-circle",
    membershipPlan: "inner_circle",
    displayName: "Inner Circle",
    amount: 10000,
    envKeys: ["STRIPE_PRICE_ID_INNER_CIRCLE", "STRIPE_PRICE_INNER_CIRCLE_MONTHLY", "STRIPE_PRICE_PREMIUM"]
  }
};

export const publicStripePlans = PLAN_CONFIGS;

export function normalizeCheckoutPlan(plan: CheckoutPlanInput): PublicCheckoutPlan {
  if (plan === "leader") {
    return "growth";
  }

  if (plan === "premium" || plan === "inner_circle") {
    return "inner-circle";
  }

  return plan;
}

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    console.error("[stripe] Missing STRIPE_SECRET_KEY");
    return null;
  }

  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    console.error("[stripe] Invalid STRIPE_SECRET_KEY format. Expected sk_test_... or sk_live_...");
    return null;
  }

  return new Stripe(secretKey);
}

export function getPlanConfig(plan: CheckoutPlanInput) {
  return PLAN_CONFIGS[normalizeCheckoutPlan(plan)];
}

export function getPlanPriceId(plan: CheckoutPlanInput) {
  const config = getPlanConfig(plan);

  for (const envKey of config.envKeys) {
    const priceId = process.env[envKey];

    if (priceId) {
      return { envKey, priceId, config };
    }
  }

  console.error("[stripe] Missing price id for plan", {
    plan: config.publicPlan,
    envKeys: config.envKeys
  });
  return null;
}

export function getStripeCheckoutAvailability() {
  const stripeConfigured = Boolean(getStripeClient());

  return {
    stripeConfigured,
    plans: {
      basic: Boolean(getPlanPriceId("basic")),
      growth: Boolean(getPlanPriceId("growth")),
      "inner-circle": Boolean(getPlanPriceId("inner-circle"))
    }
  };
}
