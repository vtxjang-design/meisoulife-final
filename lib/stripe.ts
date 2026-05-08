import Stripe from "stripe";

export type MembershipPlan = "basic" | "leader" | "premium";
export type MembershipRecordPlan = "basic" | "growth" | "inner_circle";
export type CheckoutPlanInput = MembershipPlan | "growth" | "inner_circle";

export const membershipPlans: Record<MembershipPlan, { name: string; envKeys: string[]; amount: number }> = {
  basic: { name: "Basic", envKeys: ["STRIPE_PRICE_BASIC_MONTHLY", "STRIPE_PRICE_BASIC"], amount: 1000 },
  leader: { name: "Growth", envKeys: ["STRIPE_PRICE_GROWTH_MONTHLY", "STRIPE_PRICE_LEADER"], amount: 3000 },
  premium: { name: "Inner Circle", envKeys: ["STRIPE_PRICE_INNER_CIRCLE_MONTHLY", "STRIPE_PRICE_PREMIUM"], amount: 10000 }
};

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}

export function mapMembershipPlan(plan: MembershipPlan): MembershipRecordPlan {
  if (plan === "leader") {
    return "growth";
  }

  if (plan === "premium") {
    return "inner_circle";
  }

  return "basic";
}

export function normalizeCheckoutPlan(plan: CheckoutPlanInput): MembershipPlan {
  if (plan === "growth") {
    return "leader";
  }

  if (plan === "inner_circle") {
    return "premium";
  }

  return plan;
}

export function getPlanPriceId(plan: MembershipPlan) {
  const config = membershipPlans[plan];

  for (const envKey of config.envKeys) {
    const priceId = process.env[envKey];

    if (priceId) {
      return { envKey, priceId };
    }
  }

  return null;
}
