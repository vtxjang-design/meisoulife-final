"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthState } from "@/components/auth-provider";
import { useSiteCopy } from "@/lib/i18n";
import { getSupabaseClient } from "@/lib/supabase/client";

type ProgramAccessGuardProps = {
  children: React.ReactNode;
};

export function ProgramAccessGuard({ children }: ProgramAccessGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { authResolved, isLoggedIn, memberState } = useAuthState();
  const copy = useSiteCopy();
  const [status, setStatus] = useState<"checking" | "ready" | "unavailable">("checking");

  useEffect(() => {
    if (!authResolved) {
      setStatus("checking");
      return;
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      setStatus("unavailable");
      return;
    }

    if (!isLoggedIn) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (memberState !== "paid") {
      router.replace("/pricing");
      return;
    }

    setStatus("ready");
  }, [authResolved, isLoggedIn, memberState, pathname, router]);

  async function handleLogout() {
    const supabase = getSupabaseClient();

    if (!supabase) {
      router.push("/");
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (status === "checking") {
    return (
      <div className="section-shell py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="premium-card rounded-[28px] p-8 text-center sm:p-12">
            <p className="text-lg text-white/72">{copy.loginPage.checking}</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unavailable") {
    return (
      <div className="section-shell py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="premium-card rounded-[28px] p-8 text-center sm:p-12">
            <p className="text-lg text-white/72">{copy.loginPage.unavailable}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="section-shell pt-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
          >
            {copy.loginPage.logout}
          </button>
        </div>
      </div>
      {children}
    </>
  );
}
