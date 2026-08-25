"use client";

import { useState } from "react";
import Link from "next/link";
import { AccountSecurityCard } from "@/components/account-security-card";
import { useAuthState } from "@/components/auth-provider";
import type { MembershipSummary } from "@/lib/membership";
import { useLanguage } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const accountCopy = {
  jp: {
    eyebrow: "MY PAGE",
    title: "自分のリズムとアカウントを、ここで整えます。",
    description: "毎日の実践、メンバーシップ、アカウントの安全をひとつの静かな場所で確認できます。",
    program: "マイプログラム",
    programBody: "今のプランで利用できる回復の庭へ戻ります。",
    openProgram: "プログラムを開く",
    membership: "メンバーシップ",
    currentPlan: "現在のプラン",
    status: "状態",
    nextBilling: "次回決済日",
    manage: "決済とメンバーシップを管理",
    opening: "開いています...",
    unavailable: "管理ページは現在利用できません。",
    security: "アカウントの安全",
    signOut: "ログアウト",
    signingOut: "ログアウトしています..."
  },
  kr: {
    eyebrow: "MY PAGE",
    title: "나의 리듬과 계정을 이곳에서 정돈합니다.",
    description: "매일의 실천, 멤버십, 계정 보안을 하나의 조용한 공간에서 확인할 수 있습니다.",
    program: "나의 프로그램",
    programBody: "현재 플랜으로 이용할 수 있는 회복의 정원으로 돌아갑니다.",
    openProgram: "프로그램 열기",
    membership: "멤버십",
    currentPlan: "현재 플랜",
    status: "상태",
    nextBilling: "다음 결제일",
    manage: "결제 및 멤버십 관리",
    opening: "여는 중...",
    unavailable: "관리 페이지를 현재 열 수 없습니다.",
    security: "계정 보안",
    signOut: "로그아웃",
    signingOut: "로그아웃 중..."
  },
  en: {
    eyebrow: "MY PAGE",
    title: "Keep your rhythm and account in one calm place.",
    description: "Review your daily practice, membership, and account security without crowding the main navigation.",
    program: "My Program",
    programBody: "Return to the recovery garden included with your current plan.",
    openProgram: "Open program",
    membership: "Membership",
    currentPlan: "Current plan",
    status: "Status",
    nextBilling: "Next billing date",
    manage: "Manage billing and membership",
    opening: "Opening...",
    unavailable: "The management page is currently unavailable.",
    security: "Account security",
    signOut: "Log out",
    signingOut: "Logging out..."
  }
} as const;

function programHref(plan: MembershipSummary["currentPlan"]) {
  if (plan === "inner_circle") return "/program/inner";
  if (plan === "growth") return "/program/growth";
  return "/program/basic";
}

function formatBillingDate(value: string | null, language: keyof typeof accountCopy) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const locale = language === "jp" ? "ja-JP" : language === "kr" ? "ko-KR" : "en-US";
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(date);
}

export function MemberAccountCenter({ email, membership }: { email: string | null; membership: MembershipSummary }) {
  const { language } = useLanguage();
  const { signOut } = useAuthState();
  const copy = accountCopy[language];
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleManageMembership() {
    if (portalLoading || !membership.canManageMembership) return;
    setPortalLoading(true);
    setPortalError("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const response = await fetch("/api/stripe/customer-portal", {
        method: "POST",
        credentials: "include",
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined
      });
      const data = (await response.json()) as { url?: string };
      if (!response.ok || !data.url) throw new Error("portal_unavailable");
      window.location.href = data.url;
    } catch {
      setPortalError(copy.unavailable);
      setPortalLoading(false);
    }
  }

  async function handleSignOut() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut({ redirectTo: "/" });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main className="section-shell py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold tracking-[0.26em] text-gold/78">{copy.eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-serif text-3xl leading-tight text-white sm:text-5xl">{copy.title}</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/64 sm:text-base">{copy.description}</p>

        <Link href={programHref(membership.currentPlan)} className="mt-7 inline-flex rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92]">
          {copy.openProgram}
        </Link>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          <section aria-labelledby="account-security-heading">
            <h2 id="account-security-heading" className="sr-only">{copy.security}</h2>
            <AccountSecurityCard
              email={email}
              footer={(
                <button type="button" onClick={handleSignOut} disabled={loggingOut} className="inline-flex w-full items-center justify-center rounded-md border border-white/14 px-5 py-3 text-sm font-semibold text-white/76 transition hover:border-white/28 hover:bg-white/[0.04] hover:text-white disabled:opacity-60">
                  {loggingOut ? copy.signingOut : copy.signOut}
                </button>
              )}
            />
          </section>

          <section className="premium-card rounded-lg p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white">{copy.membership}</h2>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-white/56">{copy.currentPlan}</dt><dd className="font-semibold capitalize text-white/88">{membership.currentPlan}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-white/56">{copy.status}</dt><dd className="text-white/78">{membership.subscriptionStatus ?? "—"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-white/56">{copy.nextBilling}</dt><dd className="text-right text-white/78">{formatBillingDate(membership.nextBillingDate, language)}</dd></div>
            </dl>
            {membership.canManageMembership ? (
              <button type="button" onClick={handleManageMembership} disabled={portalLoading} className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-white/14 px-5 py-3 text-sm font-semibold text-white/86 transition hover:border-gold/45 hover:text-white disabled:opacity-60">
                {portalLoading ? copy.opening : copy.manage}
              </button>
            ) : null}
            {portalError ? <p role="alert" className="mt-3 text-sm text-white/66">{portalError}</p> : null}
          </section>
        </div>

      </div>
    </main>
  );
}
