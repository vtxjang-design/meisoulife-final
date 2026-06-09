"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSiteCopy } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ResetPasswordCard() {
  const router = useRouter();
  const copy = useSiteCopy();
  const supabase = getSupabaseBrowserClient();
  const isAvailable = Boolean(supabase);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const loginHref = nextPath && nextPath.startsWith("/")
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";

  useEffect(() => {
    let active = true;

    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next"));

    async function checkSession() {
      if (!supabase) {
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (error || !data.session) {
        setMessage(copy.loginPage.resetPageInvalid);
        setReady(false);
        return;
      }

      setReady(true);
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [copy.loginPage.resetPageInvalid, supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage(copy.loginPage.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        throw new Error("supabase unavailable");
      }

      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        throw error;
      }

      await supabase.auth.signOut();
      setMessage(copy.loginPage.resetPageSuccess);
      setReady(false);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error && error.message
          ? `${copy.loginPage.resetPageError} (${error.message})`
          : copy.loginPage.resetPageError
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="premium-card rounded-lg p-6 sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-white">{copy.loginPage.resetPageTitle}</h2>
        <p className="mt-2 text-sm leading-7 text-white/68">{copy.loginPage.resetPageSubtitle}</p>
      </div>

      {ready ? (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm text-white/76">
              <span>{copy.loginPage.newPassword}</span>
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/60"
              />
            </label>
            <label className="grid gap-2 text-sm text-white/76">
              <span>{copy.loginPage.confirmPassword}</span>
              <input
                required
                minLength={8}
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/60"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !isAvailable}
            className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:opacity-60"
          >
            {loading ? copy.loginPage.loading : copy.loginPage.resetPageButton}
          </button>
        </form>
      ) : null}

      {!isAvailable ? <p className="mt-4 text-sm text-white/72">{copy.loginPage.unavailable}</p> : null}
      {message ? <p className="mt-4 text-sm text-white/72">{message}</p> : null}

      <Link
        href={loginHref}
        className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-md border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/[0.06]"
      >
        {copy.loginPage.loginAgain}
      </Link>
    </div>
  );
}
