"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const mobileMenuId = "site-mobile-menu";
  const mobileMenuContainerRef = useRef<HTMLDivElement | null>(null);
  const homepageHeaderNav = useMemo(() => {
    return isHome ? copy.header.nav.filter((item) => item.href !== "/leaders") : copy.header.nav;
  }, [copy.header.nav, isHome]);
  const programHref = plan === "inner_circle" ? "/program/inner" : plan === "growth" ? "/program/growth" : "/program/basic";
  const oneMinuteLabel = copy.header.mobileMenu.find((item) => item.href === "/#one-minute-experience")?.label ?? copy.header.nav[0]?.label ?? "1-Minute Recovery";
  const rhythmLabel = copy.header.nav[1]?.label ?? "7-Day Rhythm";
  const homeLabel = copy.header.nav[0]?.label ?? "Home";
  const mobileTabs = useMemo(() => {
    if (isHome) {
      if (isLoggedIn) {
        return [
          { href: "/meditation", label: oneMinuteLabel },
          { href: "/rhythm-journey", label: rhythmLabel },
          { href: programHref, label: copy.header.myPage }
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
        href: tab.href === "/program/basic" || tab.href === "/member" ? programHref : tab.href
      }));
    }

    return copy.header.mobileGuestTabs;
  }, [copy.header.login, copy.header.mobileGuestTabs, copy.header.mobileMemberTabs, copy.header.myPage, isHome, isLoggedIn, oneMinuteLabel, programHref, rhythmLabel]);
  const mobileDropdownLinks = useMemo(() => {
    if (isLoggedIn) {
      const links: Array<{ href: string; label: string }> = [
        { href: programHref, label: copy.header.myProgram },
        { href: "/", label: homeLabel }
      ];

      return links.filter((item, index, array) => {
        return array.findIndex((candidate) => candidate.href === item.href) === index;
      });
    }

    const guestLinks: Array<{ href: string; label: string }> = [
      { href: "/login", label: copy.header.login },
      { href: "/rhythm-journey", label: rhythmLabel }
    ];

    if (!isHome) {
      guestLinks.push({ href: "/", label: homeLabel });
    }

    return guestLinks;
  }, [copy.header.login, copy.header.myProgram, homeLabel, isHome, isLoggedIn, programHref, rhythmLabel]);
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
    if (!mobileOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (mobileMenuContainerRef.current?.contains(target)) {
        return;
      }

      setMobileOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
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
    <header className="sticky top-0 z-50 bg-[linear-gradient(180deg,rgba(6,16,24,0.94),rgba(6,16,24,0.76)_58%,rgba(6,16,24,0.4))] backdrop-blur-xl">
      <div className="section-shell flex items-center justify-between gap-3 py-2.5 sm:py-3.5">
        <Link href="/" className="text-[15px] font-semibold tracking-[0.14em] text-white sm:text-lg sm:tracking-[0.18em]">
          {copy.header.brand}
        </Link>
        <nav className="hidden items-center gap-2 lg:flex">
          {homepageHeaderNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-white/68 transition hover:bg-white/[0.05] hover:text-white",
                pathname === item.href && "bg-white/[0.04] text-white/92"
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
          <div ref={mobileMenuContainerRef} className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white/[0.03] text-white/80 backdrop-blur-md transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131f]"
              aria-label={copy.header.menu}
              aria-expanded={mobileOpen}
              aria-controls={mobileMenuId}
            >
              <span className="relative h-4 w-5">
                <span className="absolute left-0 top-0 h-[2px] w-5 rounded-full bg-current" />
                <span className="absolute left-0 top-1.5 h-[2px] w-5 rounded-full bg-current" />
                <span className="absolute left-0 top-3 h-[2px] w-5 rounded-full bg-current" />
              </span>
            </button>
            <div
              id={mobileMenuId}
              className={cn(
                "pointer-events-none absolute right-[0.125rem] top-[calc(100%+0.18rem)] z-[120] w-[clamp(190px,52vw,210px)] origin-top-right rounded-[18px] border border-white/10 bg-[rgba(7,17,31,0.96)] px-2 py-1.5 shadow-[0_14px_30px_rgba(2,8,20,0.28)] backdrop-blur-xl transition duration-200",
                mobileOpen ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "translate-y-[-6px] scale-[0.98] opacity-0"
              )}
              role="menu"
              aria-label={copy.header.menu}
            >
              <div className="flex flex-col gap-0.5">
                {mobileDropdownLinks.map((item) => {
                  const active = isActivePath(item.href);

                  return (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "inline-flex min-h-[44px] w-full items-center whitespace-nowrap rounded-[12px] px-[14px] py-2 text-[14px] font-medium text-white/88 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131f]",
                        active ? "bg-white/[0.07] text-white" : "hover:bg-white/[0.06] hover:text-white"
                      )}
                      role="menuitem"
                    >
                      {item.label}
                    </Link>
                  );
                })}
                {authResolved && isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="inline-flex min-h-[44px] w-full items-center whitespace-nowrap rounded-[12px] px-[14px] py-2 text-left text-[14px] font-medium text-white/78 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09131f] disabled:cursor-not-allowed disabled:opacity-60"
                    role="menuitem"
                  >
                    {loggingOut ? "..." : logoutLabel}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          <div className="hidden rounded-full border border-white/8 bg-white/[0.025] p-1 lg:inline-flex">
            {languageButtons.map((button) => (
              <button
                key={button.key}
                type="button"
                onClick={() => setLanguage(button.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.2em] transition duration-300",
                  language === button.key ? "bg-white/[0.9] text-ink" : "text-white/62 hover:text-white"
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
                href={programHref}
                className="hidden rounded-md border border-white/12 px-4 py-2 text-sm text-white/88 transition hover:border-gold/50 hover:text-white sm:inline-flex"
                title={userEmail || memberCenterLabel}
              >
                {memberCenterLabel}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="hidden rounded-md border border-white/12 px-4 py-2 text-sm text-white/88 transition hover:border-white/28 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
              >
                {loggingOut ? "..." : logoutLabel}
              </button>
            </>
          ) : authResolved ? (
            <Link
              href="/login"
              className="hidden rounded-md border border-white/12 px-4 py-2 text-sm text-white/88 transition hover:border-gold/50 hover:text-white sm:inline-flex"
            >
              {copy.header.login}
            </Link>
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
                      ? "bg-white/[0.07] text-white shadow-[0_8px_24px_rgba(255,255,255,0.02)]"
                      : "bg-white/[0.03] text-white/70 hover:bg-white/[0.07] hover:text-white"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

    </header>
  );
}
