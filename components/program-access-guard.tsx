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
  const { authResolved, isLoggedIn, planResolved, memberState, planError, plan, session } = useAuthState();
  const copy = useSiteCopy();
  const [status, setStatus] = useState<"checking" | "ready" | "unavailable" | "membership-error">("checking");

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

    const nextPath =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}${window.location.hash}`
        : pathname;

    console.log("[program-access-guard] state", {
      pathname: nextPath,
      authResolved,
      isLoggedIn,
      planResolved,
      memberState,
      plan,
      planError,
      userId: session?.user?.id ?? null
    });

    if (!isLoggedIn) {
      console.log("[program-access-guard] final access decision", {
        decision: "redirect-login",
        nextPath
      });
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    if (!planResolved) {
      setStatus("checking");
      return;
    }

    if (planError) {
      console.warn("[program-access-guard] membership verification failed", {
        userId: session?.user?.id ?? null,
        error: planError
      });
      setStatus("membership-error");
      return;
    }

    if (memberState !== "paid") {
      console.log("[program-access-guard] final access decision", {
        decision: "redirect-pricing",
        nextPath,
        plan,
        memberState
      });
      router.replace(`/pricing?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    console.log("[program-access-guard] final access decision", {
      decision: "allow",
      nextPath,
      plan,
      memberState
    });
    setStatus("ready");
  }, [authResolved, isLoggedIn, memberState, pathname, plan, planError, planResolved, router, session?.user?.id]);

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

  if (status === "membership-error") {
    return (
      <div className="section-shell py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="premium-card rounded-[28px] p-8 text-center sm:p-12">
            <p className="text-sm uppercase tracking-[0.28em] text-gold/80">Membership Check</p>
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">会員状態を確認できませんでした。</h2>
            <p className="mt-4 text-base leading-8 text-white/72">
              お支払い状態の確認中に問題が発生しました。少し時間を置いてから再読み込みするか、料金ページから状態を確認してください。
            </p>
            {planError ? <p className="mt-4 text-sm text-white/56">{planError}</p> : null}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92]"
              >
                もう一度確認する
              </button>
              <button
                type="button"
                onClick={() => router.push("/pricing")}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/[0.06]"
              >
                料金ページを開く
              </button>
            </div>
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
