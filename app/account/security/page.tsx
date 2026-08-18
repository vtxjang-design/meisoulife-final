"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountSecurityCard } from "@/components/account-security-card";
import { ACCOUNT_SECURITY_PATH } from "@/lib/account-security";
import { buildLoginHref } from "@/lib/auth-next";
import { useSiteCopy } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type AccountSecurityState =
  | { status: "checking" }
  | { status: "authenticated"; email: string | null };

export default function AccountSecurityPage() {
  const router = useRouter();
  const copy = useSiteCopy().accountSecurity;
  const [state, setState] = useState<AccountSecurityState>({ status: "checking" });

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();

    async function verifyBrowserSession() {
      if (!supabase) {
        router.replace(buildLoginHref(ACCOUNT_SECURITY_PATH));
        return;
      }

      try {
        const {
          data: { user },
          error
        } = await supabase.auth.getUser();

        if (!active) {
          return;
        }

        if (error || !user) {
          router.replace(buildLoginHref(ACCOUNT_SECURITY_PATH));
          return;
        }

        setState({ status: "authenticated", email: user.email ?? null });
      } catch {
        if (!active) {
          return;
        }

        router.replace(buildLoginHref(ACCOUNT_SECURITY_PATH));
      }
    }

    void verifyBrowserSession();

    return () => {
      active = false;
    };
  }, [router]);

  if (state.status === "checking") {
    return (
      <div className="section-shell py-16 sm:py-24" aria-busy="true">
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-sm text-white/68">{copy.checking}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell py-16 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <AccountSecurityCard email={state.email} />
      </div>
    </div>
  );
}
