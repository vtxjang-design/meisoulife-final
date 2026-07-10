"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

type CheckoutButtonProps = {
  plan: "basic" | "growth" | "inner-circle";
  label?: string;
  children?: ReactNode;
  className?: string;
  messageClassName?: string;
};

export function CheckoutButton({ plan, label, children, className, messageClassName }: CheckoutButtonProps) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const friendlyCheckoutError =
    language === "kr"
      ? "결제 설정을 확인하고 있습니다. 잠시 후 다시 시도해주세요."
      : language === "en"
        ? "We are checking the checkout settings. Please try again in a moment."
        : "決済設定を確認中です。しばらくして再度お試しください。";

  const loadingLabel =
    language === "kr" ? "결제 페이지로 이동 중..." : language === "en" ? "Redirecting to checkout..." : "決済ページへ移動中...";

  async function handleCheckout() {
    console.log("checkout clicked", plan);
    setLoading(true);
    setMessage("");
    const nextDestination =
      typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("next");

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ plan, next: nextDestination || undefined })
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
        setMessage(data.error || data.message || friendlyCheckoutError);
        return;
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("[checkout-button] unexpected checkout error", error);
      setMessage(friendlyCheckoutError);
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
        {loading ? loadingLabel : children || label}
      </button>
      <p className={messageClassName || "text-sm text-zinc-500"}>
        {message || ""}
      </p>
    </div>
  );
}
