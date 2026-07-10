"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthState } from "@/components/auth-provider";
import { getLocaleCopy, useLanguage, useSiteCopy } from "@/lib/i18n";
import { hasProtectedMembershipAccess, type ProtectedMembershipPlan } from "@/lib/membership-access";
import { getSupabaseClient } from "@/lib/supabase/client";

type MembershipGuardProps = {
  children: React.ReactNode;
  requiredPlan: ProtectedMembershipPlan;
  showLogout?: boolean;
};

type MembershipAccessState = "checking" | "ready" | "unavailable" | "membership-error" | "redirecting";

export type MembershipAccessResult = {
  canRender: boolean;
  nextPath: string;
  requiredPlan: ProtectedMembershipPlan | null;
  status: MembershipAccessState;
};

const membershipGuardCopy = {
  jp: {
    badge: "Membership Check",
    title: "会員状態を確認できませんでした。",
    body: "メンバーシップの確認中に問題が発生しました。少し時間を置いてから再読み込みするか、メンバーページで状態をご確認ください。",
    retry: "もう一度確認する",
    member: "メンバーページを開く"
  },
  kr: {
    badge: "Membership Check",
    title: "회원 상태를 확인하지 못했습니다.",
    body: "멤버십 상태를 확인하는 중 문제가 발생했습니다. 잠시 후 새로고침하거나 멤버 페이지에서 상태를 확인해 주세요.",
    retry: "다시 확인하기",
    member: "멤버 페이지 열기"
  },
  en: {
    badge: "Membership Check",
    title: "We could not confirm your membership.",
    body: "There was a problem while checking your membership. Please refresh in a moment or review your status on the member page.",
    retry: "Check again",
    member: "Open member page"
  }
} as const;

function buildNextPath(pathname: string, searchParams: ReturnType<typeof useSearchParams>) {
  const search = searchParams.toString();
  const fallbackPath = search ? `${pathname}?${search}` : pathname;

  if (typeof window === "undefined") {
    return fallbackPath;
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function useMembershipAccess(requiredPlan: ProtectedMembershipPlan | null): MembershipAccessResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { authResolved, isLoggedIn, planResolved, planError, plan, membershipStatus, hasActiveSubscription, isMembershipLoading } =
    useAuthState();
  const [status, setStatus] = useState<MembershipAccessState>("checking");
  const nextPath = useMemo(() => buildNextPath(pathname, searchParams), [pathname, searchParams]);

  useEffect(() => {
    if (!requiredPlan) {
      setStatus("ready");
      return;
    }

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
      setStatus("redirecting");
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    if (!planResolved || isMembershipLoading) {
      setStatus("checking");
      return;
    }

    if (planError) {
      setStatus("membership-error");
      return;
    }

    if (!hasActiveSubscription || !hasProtectedMembershipAccess({ plan, membershipStatus, requiredPlan })) {
      setStatus("redirecting");
      router.replace(`/member?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    setStatus("ready");
  }, [
    authResolved,
    hasActiveSubscription,
    isLoggedIn,
    isMembershipLoading,
    membershipStatus,
    nextPath,
    plan,
    planError,
    planResolved,
    requiredPlan,
    router
  ]);

  return {
    canRender: status === "ready",
    nextPath,
    requiredPlan,
    status
  };
}

export function MembershipAccessStateView({ access, showLogout = false }: { access: MembershipAccessResult; showLogout?: boolean }) {
  const router = useRouter();
  const { language } = useLanguage();
  const { planError } = useAuthState();
  const copy = useSiteCopy();
  const guardCopy = getLocaleCopy(membershipGuardCopy, language);

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

  if (access.status === "checking" || access.status === "redirecting") {
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

  if (access.status === "unavailable") {
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

  if (access.status === "membership-error") {
    return (
      <div className="section-shell py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="premium-card rounded-[28px] p-8 text-center sm:p-12">
            <p className="text-sm uppercase tracking-[0.28em] text-gold/80">{guardCopy.badge}</p>
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">{guardCopy.title}</h2>
            <p className="mt-4 text-base leading-8 text-white/72">{guardCopy.body}</p>
            {planError ? <p className="mt-4 text-sm text-white/56">{planError}</p> : null}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92]"
              >
                {guardCopy.retry}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/member?next=${encodeURIComponent(access.nextPath)}`)}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/[0.06]"
              >
                {guardCopy.member}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showLogout) {
    return (
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
    );
  }

  return null;
}

export function MembershipGuard({ children, requiredPlan, showLogout = true }: MembershipGuardProps) {
  const access = useMembershipAccess(requiredPlan);

  if (!access.canRender) {
    return <MembershipAccessStateView access={access} showLogout={showLogout} />;
  }

  return (
    <>
      {showLogout ? <MembershipAccessStateView access={{ ...access, status: "ready" }} showLogout={showLogout} /> : null}
      {children}
    </>
  );
}
