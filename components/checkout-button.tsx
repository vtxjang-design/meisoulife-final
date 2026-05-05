"use client";

import { useState } from "react";
import { useSiteCopy } from "@/lib/i18n";
import { getStripeCheckoutUrl } from "@/lib/site";

type CheckoutButtonProps = {
  plan: "basic" | "leader" | "premium";
  label: string;
  className?: string;
  messageClassName?: string;
};

export function CheckoutButton({ plan, label, className, messageClassName }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const copy = useSiteCopy();
  const checkoutUrl = getStripeCheckoutUrl(plan);
  const isAvailable = Boolean(checkoutUrl);

  async function handleCheckout() {
    if (!isAvailable) {
      return;
    }

    setLoading(true);

    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading || !isAvailable}
        className={
          className ||
          "rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {loading ? copy.common.connecting : label}
      </button>
      {!isAvailable ? <p className={messageClassName || "text-sm text-zinc-500"}>{copy.common.comingSoon}</p> : null}
    </div>
  );
}
