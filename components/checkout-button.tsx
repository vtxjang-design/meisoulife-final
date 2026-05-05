"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSiteCopy } from "@/lib/i18n";

type CheckoutButtonProps = {
  plan: "basic" | "leader" | "premium";
  label: string;
  className?: string;
  messageClassName?: string;
};

const CHECKOUT_URLS = {
  basic: "https://buy.stripe.com/fZu5kC443bVL4gWfMa43S05",
  leader: "https://buy.stripe.com/7sYbJ07gf7Fv8xcczY43S03",
  premium: "https://buy.stripe.com/6oU00i7gfcZP9Bg2Zo43S04"
} as const;

const START_ROUTES = {
  basic: "/start/basic",
  leader: "/start/growth",
  premium: "/start/inner"
} as const;

export function CheckoutButton({ plan, label, className, messageClassName }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const copy = useSiteCopy();
  const checkoutUrl = CHECKOUT_URLS[plan];

  async function handleCheckout() {
    setLoading(true);

    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => {
      router.push(START_ROUTES[plan]);
      setLoading(false);
    }, 3000);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={
          className ||
          "rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {loading ? copy.common.connecting : label}
      </button>
      <p className={messageClassName || "text-sm text-zinc-500"}>{copy.pricingPage.checkoutNote}</p>
    </div>
  );
}
