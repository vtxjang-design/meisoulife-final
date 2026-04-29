import Stripe from "stripe";

export type MembershipPlan = "basic" | "leader" | "premium";

export const membershipPlans: Record<MembershipPlan, { name: string; envKey: string; amount: number }> = {
  basic: { name: "Basic", envKey: "STRIPE_PRICE_BASIC", amount: 1000 },
  leader: { name: "Growth", envKey: "STRIPE_PRICE_LEADER", amount: 3000 },
  premium: { name: "Inner Circle", envKey: "STRIPE_PRICE_PREMIUM", amount: 10000 }
};

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}
