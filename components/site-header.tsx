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
  const isHome = pathname === "/";
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { isLoggedIn, authResolved, planResolved, plan, userEmail } = useAuthState();
  const copy = useSiteCopy();
  const memberCenterLabel = copy.header.myPage;
  const logoutLabel = copy.header.logout;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const programHref = plan === "inner_circle" ? "/program/inner" : plan === "growth" ? "/program/growth" : "/program/basic";
  const oneMinuteLabel = copy.header.mobileMenu.find((item) => item.href === "/#one-minute-experience")?.label ?? copy.header.nav[0]?.label ?? "1-Minute Recovery";
  const rhythmLabel = copy.header.nav[1]?.label ?? "7-Day Rhythm";
  const mobileTabs = useMemo(() => {
    if (isHome) {
      if (isLoggedIn) {
        return [
          { href: "/meditation", label: oneMinuteLabel },
          { href: "/rhythm-journey", label: rhythmLabel },
          { href: "/member", label: copy.header.myPage }
        ];
      }

      return [
        { href: "/meditation", label: oneMinuteLabel },
        { href: "/rhythm-journey", label: rhythmLabel },
        { href: "/login", label: copy.header.login }
      ];
    }

    if (isLoggedIn) {
      return copy.header.mobileMemberTabs.map((tab) => ({
        ...tab,
        href: tab.href === "/program/basic" ? programHref : tab.href
      }));
    }

    return copy.header.mobileGuestTabs;
  }, [copy.header.login, copy.header.mobileGuestTabs, copy.header.mobileMemberTabs, copy.header.myPage, isHome, isLoggedIn, oneMinuteLabel, programHref, rhythmLabel]);
  const mobileMenuLinks = useMemo(() => {
    return isLoggedIn ? copy.header.mobileMemberMenu : copy.header.mobileGuestMenu;
  }, [copy.header.mobileGuestMenu, copy.header.mobileMemberMenu, isLoggedIn]);
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
    if (!mobileOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
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

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    console.log("[site-header] mobile drawer isLoggedIn", isLoggedIn);
    console.log("[site-header] mobile drawer userEmail", userEmail || null);

    if (authResolved && isLoggedIn) {
      console.log("[site-header] rendering logged-in menu");
    }
  }, [authResolved, isLoggedIn, mobileOpen, userEmail]);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      console.log("[site-header] logout clicked");
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
    <header className="sticky top-0 z-50 bg-[linear-gradient(180deg,rgba(4,11,19,0.88),rgba(4,11,19,0.68))] backdrop-blur-2xl">
      <div className="section-shell flex items-center justify-between gap-3 py-2.5 sm:py-4">
        <Link href="/" className="text-[15px] font-semibold tracking-[0.14em] text-white sm:text-lg sm:tracking-[0.18em]">
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
        <div className="flex items-center gap-1.5">
          <div className="inline-flex rounded-full bg-white/[0.03] p-0.5 backdrop-blur-md md:hidden">
            {languageButtons.map((button) => (
              <button
                key={button.key}
                type="button"
                onClick={() => setLanguage(button.key)}
                className={cn(
                  "rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.14em] transition duration-300",
                  language === button.key
                    ? "bg-white/[0.12] text-white shadow-[0_0_16px_rgba(255,255,255,0.05)]"
                    : "text-white/60 hover:text-white"
                )}
              >
                {button.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white/[0.03] text-white/80 backdrop-blur-md transition hover:bg-white/[0.06] hover:text-white lg:hidden"
            aria-label={copy.header.menu}
            aria-expanded={mobileOpen}
          >
            <span className="relative h-4 w-5">
              <span className="absolute left-0 top-0 h-[2px] w-5 rounded-full bg-current" />
              <span className="absolute left-0 top-1.5 h-[2px] w-5 rounded-full bg-current" />
              <span className="absolute left-0 top-3 h-[2px] w-5 rounded-full bg-current" />
            </span>
          </button>
          <div className="hidden rounded-full border border-white/10 bg-white/[0.03] p-1 lg:inline-flex">
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
      <div className="lg:hidden">
        <div className="section-shell overflow-x-auto py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <nav className="flex min-w-max items-center gap-2">
            {mobileTabs.map((tab) => {
              const active = isActivePath(tab.href);

              return (
                <Link
                  key={`${tab.href}-${tab.label}`}
                  href={tab.href}
                  className={cn(
                    "inline-flex min-h-[34px] items-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-medium transition backdrop-blur-md",
                    active
                      ? "bg-white/[0.08] text-white shadow-[0_8px_24px_rgba(255,255,255,0.03)]"
                      : "bg-white/[0.04] text-white/72 hover:bg-white/[0.08] hover:text-white"
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
          "pointer-events-none fixed inset-0 z-[9999] opacity-0 transition duration-300 lg:hidden",
          mobileOpen && "pointer-events-auto opacity-100"
        )}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setMobileOpen(false);
          }
        }}
      >
        <div className="absolute inset-0 bg-[#020814]/88 backdrop-blur-xl" />
        <div
          className={cn(
            "relative flex h-full w-full flex-col overflow-y-auto px-5 pb-6 pt-5 transition duration-300",
            mobileOpen ? "translate-y-0" : "-translate-y-3"
          )}
        >
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="text-base font-semibold tracking-[0.16em] text-white"
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

            <div className="mt-6 grid gap-4">
              {!authResolved ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-white/62">Loading account...</p>
                </div>
              ) : isLoggedIn ? (
                <>
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

                  <div className="flex flex-col gap-3">
                    <Link
                      href="/member"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex min-h-[52px] w-full items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white/84 transition hover:bg-white/[0.07] hover:text-white"
                    >
                      {copy.header.myPage}
                    </Link>
                    <Link
                      href={programHref}
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex min-h-[52px] w-full items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white/84 transition hover:bg-white/[0.07] hover:text-white"
                    >
                      {copy.header.myProgram}
                    </Link>
                    <Link
                      href="/pricing"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex min-h-[52px] w-full items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white/84 transition hover:bg-white/[0.07] hover:text-white"
                    >
                      {copy.header.billingMembership}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base font-medium text-white/84 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loggingOut ? "..." : logoutLabel}
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex min-h-[52px] w-full items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white/84 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    {copy.header.login}
                  </Link>
                  <Link
                    href="/welcome-member"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex min-h-[52px] w-full items-center rounded-2xl bg-gold px-4 py-3 text-base font-semibold text-ink transition hover:bg-[#e7cd92]"
                  >
                    {copy.header.freeJoin}
                  </Link>
                </div>
              )}

              <nav className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                {mobileMenuLinks.map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex min-h-[52px] w-full items-center rounded-2xl border border-white/8 px-4 py-3 text-base text-white/84 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-auto pt-6">
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

              <div className="mt-3 grid gap-2">
                <Link
                  href="/community"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex min-h-[52px] w-full items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white/84 transition hover:bg-white/[0.07] hover:text-white"
                >
                  {copy.header.customerSupport}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
