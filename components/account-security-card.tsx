"use client";

import { useState } from "react";
import { buildOfficialPasswordRecoveryUrl } from "@/lib/account-security";
import { useSiteCopy } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AccountSecurityCard({ email }: { email: string | null }) {
  const copy = useSiteCopy().accountSecurity;
  const supabase = getSupabaseBrowserClient();
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function sendPasswordChangeEmail() {
    if (!supabase || !email || status === "loading" || status === "sent") {
      return;
    }

    setStatus("loading");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildOfficialPasswordRecoveryUrl()
      });

      if (error) {
        throw error;
      }

      setStatus("sent");
    } catch {
      console.error("[account-security] password change email failed", {
        category: "password_change_email_failed"
      });
      setStatus("error");
    }
  }

  const unavailable = !supabase || !email;

  return (
    <div className="premium-card rounded-lg p-6 sm:p-8">
      <div className="grid gap-5">
        <div>
          <h2 className="text-xl font-semibold text-white">{copy.title}</h2>
          <p className="mt-2 text-sm leading-7 text-white/68">{copy.description}</p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs font-semibold tracking-[0.12em] text-white/56">{copy.registeredEmail}</p>
          <p className="mt-1 break-all text-sm text-white/88">{email ?? copy.emailUnavailable}</p>
        </div>
        <p className="text-sm leading-7 text-white/68">{copy.uniquePasswordAdvice}</p>
      </div>

      <button
        type="button"
        onClick={sendPasswordChangeEmail}
        disabled={unavailable || status === "loading" || status === "sent"}
        className="button-nowrap mt-6 inline-flex w-full items-center justify-center rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? copy.sending : status === "sent" ? copy.sentButton : copy.sendButton}
      </button>

      {status === "sent" ? <p className="mt-4 text-sm leading-7 text-white/72">{copy.sent}</p> : null}
      {status === "error" ? <p role="alert" className="mt-4 text-sm leading-7 text-white/72">{copy.error}</p> : null}
      {unavailable ? <p role="alert" className="mt-4 text-sm leading-7 text-white/72">{copy.unavailable}</p> : null}
    </div>
  );
}
