"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { languageButtons, useLanguage, useSiteCopy } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const copy = useSiteCopy();
  const memberCenterLabel =
    language === "jp" ? "メンバーセンター" : language === "kr" ? "멤버센터" : "Member Center";
  const logoutLabel = language === "jp" ? "ログアウト" : language === "kr" ? "로그아웃" : "Logout";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [memberState, setMemberState] = useState<"guest" | "free" | "paid">("guest");
  const [paidLabel, setPaidLabel] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();

    async function loadMemberState() {
      if (!supabase) {
        setMemberState("guest");
        setPaidLabel("");
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (!session?.user) {
        setMemberState("guest");
        setPaidLabel("");
        return;
      }

      const { data: membership } = await supabase
        .from("memberships")
        .select("plan, status")
        .eq("user_id", session.user.id)
        .in("status", ["active", "trialing"])
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (membership) {
        setMemberState("paid");
        if (membership.plan === "inner_circle") {
          setPaidLabel(language === "jp" ? "Brain Owner" : language === "kr" ? "브레인 오너" : "Brain Owner");
        } else {
          setPaidLabel(language === "jp" ? "Premium Member" : language === "kr" ? "프리미엄 멤버" : "Premium Member");
        }
        return;
      }

      setMemberState("free");
      setPaidLabel(language === "jp" ? "Upgrade" : language === "kr" ? "업그레이드" : "Upgrade");
    }

    loadMemberState();

    const subscription = supabase?.auth.onAuthStateChange(() => {
      void loadMemberState();
      router.refresh();
    });

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, [language, pathname, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await supabase.auth.signOut();
      setMemberState("guest");
      setPaidLabel("");
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
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
          {memberState !== "guest" ? (
            <>
              <span className="hidden rounded-full border border-gold/20 bg-gold/[0.08] px-4 py-2 text-xs font-semibold tracking-[0.16em] text-gold sm:inline-flex">
                {paidLabel}
              </span>
              <Link
                href="/dashboard"
                className="hidden rounded-md border border-white/15 px-4 py-2 text-sm text-white/90 transition hover:border-gold/60 hover:text-white sm:inline-flex"
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
          ) : (
            <>
              <Link
                href="/member"
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
          )}
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

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
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

            <div className="flex items-center gap-2">
              {memberState !== "guest" ? (
                <>
                  <span className="inline-flex min-h-[44px] items-center rounded-full border border-gold/20 bg-gold/[0.08] px-4 py-2 text-sm font-semibold text-gold">
                    {paidLabel}
                  </span>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-white/10 px-4 py-2 text-sm text-white/84 transition hover:bg-white/[0.06]"
                  >
                    {memberCenterLabel}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-white/10 px-4 py-2 text-sm text-white/84 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loggingOut ? "..." : logoutLabel}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/member"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-white/10 px-4 py-2 text-sm text-white/84 transition hover:bg-white/[0.06]"
                  >
                    {copy.header.login}
                  </Link>
                  <Link
                    href="/challenge"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex min-h-[44px] items-center rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#e7cd92]"
                  >
                    {copy.header.freeJoin}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
