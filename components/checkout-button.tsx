"use client";

import { useState } from "react";
import { useSiteCopy } from "@/lib/i18n";
import { getStripeCheckoutUrl } from "@/lib/site";

type CheckoutButtonProps = {
  plan: "basic" | "leader" | "premium";
  label: string;
};

export function CheckoutButton({ plan, label }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const copy = useSiteCopy();

  async function handleCheckout() {
    setLoading(true);
    const directUrl = getStripeCheckoutUrl(plan);

    if (directUrl !== "#") {
      window.location.href = directUrl;
      return;
    }

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ plan })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }
    } catch (_error) {
      // Fall through to noop placeholder state.
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className="rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:opacity-60"
    >
      {loading ? copy.common.connecting : label}
    </button>
  );
}
