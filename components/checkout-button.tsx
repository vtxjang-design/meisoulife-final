"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSiteCopy } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type CheckoutButtonProps = {
  plan: "basic" | "leader" | "premium";
  label: string;
  className?: string;
  messageClassName?: string;
};

export function CheckoutButton({ plan, label, className, messageClassName }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const copy = useSiteCopy();

  async function handleCheckout() {
    setLoading(true);
    setMessage("");

    try {
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ plan })
      });

      const data = (await response.json()) as {
        url?: string;
        error?: string;
        message?: string;
      };

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok || !data.url) {
        setMessage(data.error || data.message || copy.common.comingSoon);
        return;
      }

      window.location.assign(data.url);
    } catch (_error) {
      setMessage(copy.common.comingSoon);
    } finally {
      setLoading(false);
    }
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
      <p className={messageClassName || "text-sm text-zinc-500"}>
        {message || copy.pricingPage.checkoutNote}
      </p>
    </div>
  );
}
