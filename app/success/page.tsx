import Stripe from "stripe";
import { PostPaymentSuccessContent } from "@/components/post-payment-success-content";
import { SuccessMembershipSync } from "@/components/success-membership-sync";
import { getStripeClient } from "@/lib/stripe";

const LINE_URL = "https://line.me/R/ti/p/@meisoulife";

type SuccessPageProps = {
  searchParams?: Promise<{
    session_id?: string;
  }>;
};

type SuccessTier = "basic" | "growth" | "inner_circle" | null;

function normalizeTier(value?: string | null): SuccessTier {
  if (value === "basic" || value === "growth" || value === "inner_circle") {
    return value;
  }

  if (value === "inner-circle") {
    return "inner_circle";
  }

  return null;
}

async function getCheckoutSession(sessionId: string, stripe: Stripe | null) {
  if (!stripe) {
    return null;
  }

  try {
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"]
    });
  } catch (error) {
    console.error("[success-page] failed to retrieve checkout session", {
      sessionId,
      error: error instanceof Error ? error.message : error
    });
    return null;
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const sessionId = params?.session_id;
  const stripe = getStripeClient();
  const session = sessionId ? await getCheckoutSession(sessionId, stripe) : null;
  const tier = normalizeTier(session?.metadata?.plan || session?.metadata?.tier || null);

  return (
    <div className="section-shell py-16 sm:py-24">
      {sessionId && tier ? <SuccessMembershipSync sessionId={sessionId} tier={tier} /> : null}
      <PostPaymentSuccessContent lineUrl={LINE_URL} tier={tier} />
    </div>
  );
}
