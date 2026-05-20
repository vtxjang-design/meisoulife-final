"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthState } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { languageButtons, useLanguage, useSiteCopy } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { isLoggedIn, authResolved, planResolved, plan, userEmail } = useAuthState();
  const copy = useSiteCopy();
  const memberCenterLabel = copy.header.myPage;
  const logoutLabel = copy.header.logout;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const programHref = plan === "inner_circle" ? "/program/inner" : plan === "growth" ? "/program/growth" : "/program/basic";
  const mobileTabs = isLoggedIn
    ? [
        { href: "/", label: copy.header.nav[0]?.label || "Home" },
        { href: programHref, label: copy.header.myProgram },
        { href: "/pricing", label: copy.header.nav[2]?.label || "Pricing" },
        { href: "/community", label: copy.header.nav[3]?.label || "Community" },
        { href: "/member", label: copy.header.myPage }
      ]
    : [
        { href: "/", label: copy.header.nav[0]?.label || "Home" },
        { href: "/challenge", label: copy.header.nav[1]?.label || "Challenge" },
        { href: "/pricing", label: copy.header.nav[2]?.label || "Pricing" },
        { href: "/community", label: copy.header.nav[3]?.label || "Community" },
        { href: "/leaders", label: copy.header.nav[4]?.label || "Leaders" }
      ];
  const memberBadgeLabel = useMemo(() => {
    if (!isLoggedIn) {
      return "";
    }

    if (!planResolved) {
      return "...";
    }

    if (plan === "inner_circle") {
      return "Inner Circle";
    }

    if (plan === "growth") {
      return "Growth";
    }

    if (plan === "basic") {
      return "Basic";
    }

    return "Free";
  }, [isLoggedIn, planResolved, plan]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    console.log("[site-header] header auth state", {
      isLoggedIn,
      authResolved,
      planResolved,
      plan,
      userEmail
    });
  }, [authResolved, isLoggedIn, plan, planResolved, userEmail]);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await supabase.auth.signOut();
      console.log("[site-header] logout success");
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("[site-header] logout failed", error);
    } finally {
      setLoggingOut(false);
    }
  }

  function isActivePath(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-xl">
      <div className="section-shell flex items-center justify-between gap-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-[0.18em] text-white">
          {copy.header.brand}
        </Link>
        <nav className="hidden items-center gap-2 lg:flex">
          {copy.header.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-white/72 transition hover:bg-white/10 hover:text-white",
                pathname === item.href && "bg-white/10 text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white transition hover:bg-white/[0.08] lg:hidden"
            aria-label={copy.header.menu}
            aria-expanded={mobileOpen}
          >
            <span className="relative h-4 w-5">
              <span className="absolute left-0 top-0 h-[2px] w-5 rounded-full bg-current" />
              <span className="absolute left-0 top-1.5 h-[2px] w-5 rounded-full bg-current" />
              <span className="absolute left-0 top-3 h-[2px] w-5 rounded-full bg-current" />
            </span>
          </button>
          <div className="hidden rounded-full border border-white/10 bg-white/[0.03] p-1 md:inline-flex">
            {languageButtons.map((button) => (
              <button
                key={button.key}
                type="button"
                onClick={() => setLanguage(button.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.2em] transition duration-300",
                  language === button.key ? "bg-white text-ink" : "text-white/68 hover:text-white"
                )}
              >
                {button.label}
              </button>
            ))}
          </div>
          {authResolved && isLoggedIn ? (
            <>
              <span className="hidden rounded-full border border-gold/20 bg-gold/[0.08] px-4 py-2 text-xs font-semibold tracking-[0.16em] text-gold sm:inline-flex">
                {memberBadgeLabel}
              </span>
              <Link
                href="/member"
                className="hidden rounded-md border border-white/15 px-4 py-2 text-sm text-white/90 transition hover:border-gold/60 hover:text-white sm:inline-flex"
                title={userEmail || memberCenterLabel}
              >
                {memberCenterLabel}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="hidden rounded-md border border-white/15 px-4 py-2 text-sm text-white/90 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
              >
                {loggingOut ? "..." : logoutLabel}
              </button>
            </>
          ) : authResolved ? (
            <>
              <Link
                href="/login"
                className="hidden rounded-md border border-white/15 px-4 py-2 text-sm text-white/90 transition hover:border-gold/60 hover:text-white sm:inline-flex"
              >
                {copy.header.login}
              </Link>
              <Link
                href="/welcome-member"
                className="hidden rounded-md bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] sm:inline-flex"
              >
                {copy.header.freeJoin}
              </Link>
            </>
          ) : (
            <div className="hidden h-10 w-[220px] sm:block" />
          )}
        </div>
      </div>
      <div className="border-t border-white/6 lg:hidden">
        <div className="section-shell overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <nav className="flex min-w-max items-center gap-2">
            {mobileTabs.map((tab) => {
              const active = isActivePath(tab.href);

              return (
                <Link
                  key={`${tab.href}-${tab.label}`}
                  href={tab.href}
                  className={cn(
                    "inline-flex min-h-[40px] items-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
                    active
                      ? "border-gold/40 bg-gold/[0.08] text-gold"
                      : "border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-[60] bg-[#020814]/0 opacity-0 transition duration-300 lg:hidden",
          mobileOpen && "pointer-events-auto bg-[#020814]/84 opacity-100 backdrop-blur-xl"
        )}
      >
        <div
          className={cn(
            "absolute inset-x-4 top-4 rounded-[28px] border border-white/10 bg-[#07111f]/94 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.34)] transition duration-300",
            mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="text-base font-semibold tracking-[0.18em] text-white"
            >
              {copy.header.brand}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-white/82 transition hover:bg-white/[0.08]"
              aria-label={copy.header.close}
            >
              {copy.header.close}
            </button>
          </div>

          <nav className="mt-5 grid gap-2">
            {copy.header.mobileMenu.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="inline-flex min-h-[54px] items-center rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-base text-white/84 transition hover:bg-white/[0.07] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-5 grid gap-4">
            {authResolved && isLoggedIn ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{userEmail || memberCenterLabel}</p>
                    <p className="mt-1 text-xs text-white/56">{copy.header.billingMembership}</p>
                  </div>
                  <span className="inline-flex min-h-[36px] items-center rounded-full border border-gold/20 bg-gold/[0.08] px-3 py-1.5 text-xs font-semibold tracking-[0.14em] text-gold">
                    {memberBadgeLabel}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="grid gap-2">
              {authResolved && isLoggedIn ? (
                <>
                  <Link
                    href="/member"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex min-h-[52px] items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white/84 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    {copy.header.myPage}
                  </Link>
                  <Link
                    href={programHref}
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex min-h-[52px] items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white/84 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    {copy.header.myProgram}
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex min-h-[52px] items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white/84 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    {copy.header.billingMembership}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex min-h-[52px] items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white/84 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    {copy.header.login}
                  </Link>
                  <Link
                    href="/welcome-member"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex min-h-[52px] items-center rounded-2xl bg-gold px-4 py-3 text-base font-semibold text-ink transition hover:bg-[#e7cd92]"
                  >
                    {copy.header.freeJoin}
                  </Link>
                </>
              )}
              <Link
                href="/community"
                onClick={() => setMobileOpen(false)}
                className="inline-flex min-h-[52px] items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white/84 transition hover:bg-white/[0.07] hover:text-white"
              >
                {copy.header.customerSupport}
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/42">
                {copy.header.languageSettings}
              </p>
              <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
                {languageButtons.map((button) => (
                  <button
                    key={button.key}
                    type="button"
                    onClick={() => setLanguage(button.key)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.2em] transition duration-300",
                      language === button.key ? "bg-white text-ink" : "text-white/68 hover:text-white"
                    )}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            {authResolved && isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white/84 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? "..." : logoutLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
