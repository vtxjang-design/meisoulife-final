"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!supabase) {
        throw new Error("supabase unavailable");
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
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

        setMessage(copy.loginPage.signupSuccess);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          throw error;
        }

        router.push("/program/basic");
      }
    } catch (_error) {
      setMessage(
        mode === "signup"
          ? copy.loginPage.signupError
          : copy.loginPage.error
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card rounded-lg p-6 sm:p-8">
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
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/60"
          />
        </label>
        <label className="grid gap-2 text-sm text-white/76">
          <span>{copy.loginPage.password}</span>
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/60"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={loading || !isAvailable}
        className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:opacity-60"
      >
        {loading ? copy.loginPage.loading : mode === "signup" ? copy.loginPage.signupButton : copy.loginPage.button}
      </button>
      {!isAvailable ? <p className="mt-4 text-sm text-white/72">{copy.loginPage.unavailable}</p> : null}
      {message ? <p className="mt-4 text-sm text-white/72">{message}</p> : null}
    </form>
  );
}
