"use client";

import type { ReactNode } from "react";
import { useState } from "react";

type CheckoutButtonProps = {
  plan: "basic" | "growth" | "inner-circle";
  label?: string;
  children?: ReactNode;
  className?: string;
  messageClassName?: string;
};

const FRIENDLY_CHECKOUT_ERROR = "決済設定を確認中です。しばらくして再度お試しください。";

export function CheckoutButton({ plan, label, children, className, messageClassName }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCheckout() {
    console.log("checkout clicked", plan);
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ plan })
      });

      const data = (await response.json()) as {
        url?: string;
        checkoutUrl?: string;
        error?: string;
        message?: string;
      };
      console.log("checkout response", data);
      const checkoutUrl = data.url || data.checkoutUrl;

      if (!response.ok || !checkoutUrl) {
        console.error("[checkout-button] checkout session creation failed", {
          plan,
          responseStatus: response.status,
          data
        });
        setMessage(data.error || data.message || FRIENDLY_CHECKOUT_ERROR);
        return;
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("[checkout-button] unexpected checkout error", error);
      setMessage(FRIENDLY_CHECKOUT_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative z-50 space-y-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={
          className ||
          "relative z-50 cursor-pointer rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {loading ? "決済ページへ移動中..." : children || label}
      </button>
      <p className={messageClassName || "text-sm text-zinc-500"}>
        {message || ""}
      </p>
    </div>
  );
}
