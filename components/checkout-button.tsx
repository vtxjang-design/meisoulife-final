"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSiteCopy } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type CheckoutButtonProps = {
  plan: "basic" | "growth" | "inner-circle";
  label: string;
  className?: string;
  messageClassName?: string;
};

const FRIENDLY_CHECKOUT_ERROR = "決済設定を確認中です。しばらくして再度お試しください。";
const PLAN_UNAVAILABLE_MESSAGE = "このプランは現在準備中です";

export function CheckoutButton({ plan, label, className, messageClassName }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [available, setAvailable] = useState(true);
  const [checkedAvailability, setCheckedAvailability] = useState(false);
  const router = useRouter();
  const copy = useSiteCopy();

  useEffect(() => {
    let active = true;

    async function loadAvailability() {
      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "GET",
          cache: "no-store"
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          stripeConfigured?: boolean;
          plans?: Partial<Record<"basic" | "growth" | "inner-circle", boolean>>;
        };

        if (!active) {
          return;
        }

        const isAvailable = Boolean(data.stripeConfigured && data.plans?.[plan]);
        setAvailable(isAvailable);
        setCheckedAvailability(true);
        if (!isAvailable) {
          setMessage(PLAN_UNAVAILABLE_MESSAGE);
        }
      } catch (error) {
        console.error("[checkout-button] failed to load checkout availability", error);
      }
    }

    loadAvailability();

    return () => {
      active = false;
    };
  }, [plan]);

  async function handleCheckout() {
    setLoading(true);
    setMessage("");

    try {
      if (checkedAvailability && !available) {
        setMessage(PLAN_UNAVAILABLE_MESSAGE);
        return;
      }

      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setMessage(copy.loginPage.unavailable);
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ plan })
      });

      const data = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
        message?: string;
      };

      if (response.status === 401) {
        console.error("[checkout-button] authentication required for checkout", {
          plan,
          responseStatus: response.status
        });
        router.push("/login");
        return;
      }

      if (!response.ok || !data.checkoutUrl) {
        console.error("[checkout-button] checkout session creation failed", {
          plan,
          responseStatus: response.status,
          data
        });
        setMessage(data.error || data.message || FRIENDLY_CHECKOUT_ERROR);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("[checkout-button] unexpected checkout error", error);
      setMessage(FRIENDLY_CHECKOUT_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading || (checkedAvailability && !available)}
        className={
          className ||
          "rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {loading ? copy.common.connecting : label}
      </button>
      <p className={messageClassName || "text-sm text-zinc-500"}>
        {message || copy.pricingPage.checkoutNote}
      </p>
    </div>
  );
}
