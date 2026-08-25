"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_AUTH_NEXT_PATH, resolveSafeInternalNextPath, resolveSafeReturnPath } from "@/lib/auth-next";
import { recordAuthDiagnostic } from "@/lib/auth-flow-diagnostics";
import { useSiteCopy } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthCardProps = {
  mode: "login" | "signup";
};

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const copy = useSiteCopy();
  const supabase = getSupabaseBrowserClient();
  const isAvailable = Boolean(supabase);
  const [view, setView] = useState<"auth" | "reset">(mode === "login" ? "auth" : "auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState(DEFAULT_AUTH_NEXT_PATH);
  const [isBasicAccessLogin, setIsBasicAccessLogin] = useState(false);
  const redirectTarget = resolveSafeReturnPath(nextPath);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedNext = params.get("next");
    const next = resolveSafeReturnPath(requestedNext);
    setNextPath(next);
    setIsBasicAccessLogin(mode === "login" && requestedNext !== null && next === DEFAULT_AUTH_NEXT_PATH);

    if (mode === "login" && params.get("auth_error") === "invalid_credentials") {
      setMessage(copy.loginPage.error);
    }

    recordAuthDiagnostic("login_page_loaded", {
      mode,
      preservedNextRoute: next
    });
  }, [copy.loginPage.error, mode]);

  function buildResetRedirectTarget() {
    const next = resolveSafeInternalNextPath(nextPath);
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/auth/update-password?next=${next}`)}`;
  }

  async function handleSignupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!supabase) {
        throw new Error("supabase unavailable");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.session?.user) {
        try {
          const { error: profileError } = await supabase.from("profiles").upsert(
            {
              id: data.session.user.id,
              email,
              full_name: name || null
            },
            { onConflict: "id" }
          );

          if (profileError) {
            console.warn("[auth-card] profiles upsert skipped", profileError.message);
          }
        } catch (profileError) {
          console.warn("[auth-card] profiles table unavailable", profileError);
        }

        router.push(redirectTarget);
        router.refresh();
        return;
      }

      setMessage(copy.loginPage.signupSuccess);
    } catch (error) {
      setMessage(
        error instanceof Error && error.message
          ? `${copy.loginPage.signupError} (${error.message})`
          : copy.loginPage.signupError
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!supabase) {
        throw new Error("supabase unavailable");
      }

      if (!email.trim()) {
        setMessage(copy.loginPage.resetRequestEmailRequired);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildResetRedirectTarget()
      });

      if (error) {
        console.error("[auth-card] reset password request failed", error);
        throw error;
      }

      setMessage(copy.loginPage.resetRequestSuccess);
    } catch (error) {
      console.error("[auth-card] reset password request error", error);
      setMessage(
        error instanceof Error && error.message
          ? `${copy.loginPage.resetRequestError} (${error.message})`
          : copy.loginPage.resetRequestError
      );
    } finally {
      setLoading(false);
    }
  }

  if (view === "reset" && mode === "login") {
    return (
      <form onSubmit={handleResetRequest} className="premium-card rounded-lg p-6 sm:p-8">
        <div className="grid gap-5">
          <div>
            <h2 className="text-xl font-semibold text-white">{copy.loginPage.resetRequestTitle}</h2>
            <p className="body-measure keep-phrase mt-2 text-sm leading-7 text-white/68">{copy.loginPage.resetRequestSubtitle}</p>
          </div>
          <label className="grid gap-2 text-sm text-white/76">
            <span>{copy.loginPage.email}</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/60"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading || !isAvailable}
          className="button-nowrap mt-6 inline-flex w-full items-center justify-center rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:opacity-60"
        >
          {loading ? copy.loginPage.resetRequestSending : copy.loginPage.resetRequestButton}
        </button>
        <button
          type="button"
          onClick={() => {
            setView("auth");
            setMessage("");
          }}
          className="button-nowrap mt-4 inline-flex w-full items-center justify-center rounded-md border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/[0.06]"
        >
          {copy.loginPage.resetRequestBack}
        </button>
        {!isAvailable ? <p className="mt-4 text-sm text-white/72">{copy.loginPage.unavailable}</p> : null}
        {message ? <p className="mt-4 text-sm text-white/72">{message}</p> : null}
      </form>
    );
  }

  return (
    <form
      action={mode === "login" ? "/auth/login" : undefined}
      method={mode === "login" ? "post" : undefined}
      onSubmit={mode === "signup" ? handleSignupSubmit : undefined}
      className="premium-card rounded-lg p-6 sm:p-8"
    >
      <div className="grid gap-5">
        {mode === "signup" ? (
          <label className="grid gap-2 text-sm text-white/76">
            <span>Name</span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/60"
              placeholder="Hanako Yamada"
            />
          </label>
        ) : null}
        <label className="grid gap-2 text-sm text-white/76">
          <span>{copy.loginPage.email}</span>
          <input
            required
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/60"
          />
        </label>
        {isBasicAccessLogin ? (
          <p className="text-sm leading-6 text-white/62">{copy.loginPage.basicPaymentEmailNotice}</p>
        ) : null}
        <label className="grid gap-2 text-sm text-white/76">
          <span>{copy.loginPage.password}</span>
          <input
            required
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/60"
          />
        </label>
        {mode === "login" ? <input type="hidden" name="next" value={redirectTarget} /> : null}
      </div>
      <button
        type="submit"
        disabled={mode === "signup" && (loading || !isAvailable)}
        className="button-nowrap mt-6 inline-flex w-full items-center justify-center rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:opacity-60"
      >
        {loading ? copy.loginPage.loading : mode === "signup" ? copy.loginPage.signupButton : copy.loginPage.button}
      </button>
      {mode === "login" ? (
        <button
          type="button"
          onClick={() => {
            setView("reset");
            setMessage("");
          }}
          className="button-nowrap mt-4 inline-flex text-sm text-white/72 transition hover:text-white"
        >
          {copy.loginPage.forgotPassword}
        </button>
      ) : null}
      {!isAvailable ? <p className="mt-4 text-sm text-white/72">{copy.loginPage.unavailable}</p> : null}
      {message ? <p className="mt-4 text-sm text-white/72">{message}</p> : null}
    </form>
  );
}
