"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ChallengeState = {
  name: string;
  email: string;
  lineId: string;
  stressLevel: string;
};

const initialState: ChallengeState = {
  name: "",
  email: "",
  lineId: "",
  stressLevel: "5"
};

export function ChallengeSignupForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<ChallengeState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          lineId: formState.lineId,
          stressLevel: Number(formState.stressLevel)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "challenge signup failed");
      }

      router.push(`/dashboard?email=${encodeURIComponent(formState.email)}&challenge=started`);
    } catch (error) {
      setMessage("登録に失敗しました。時間をおいてもう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card rounded-lg p-6 sm:p-8">
      <div className="grid gap-5">
        <label className="grid gap-2 text-sm text-white/76">
          <span>お名前</span>
          <input
            required
            value={formState.name}
            onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
            className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/60"
            placeholder="山田 花子"
          />
        </label>
        <label className="grid gap-2 text-sm text-white/76">
          <span>メールアドレス</span>
          <input
            required
            type="email"
            value={formState.email}
            onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
            className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/60"
            placeholder="you@example.com"
          />
        </label>
        <label className="grid gap-2 text-sm text-white/76">
          <span>LINE ID（任意）</span>
          <input
            value={formState.lineId}
            onChange={(event) => setFormState((current) => ({ ...current, lineId: event.target.value }))}
            className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/60"
            placeholder="@meisoulife"
          />
        </label>
        <label className="grid gap-2 text-sm text-white/76">
          <span>今のストレス度（1〜10）</span>
          <input
            required
            min={1}
            max={10}
            type="range"
            value={formState.stressLevel}
            onChange={(event) => setFormState((current) => ({ ...current, stressLevel: event.target.value }))}
            className="accent-gold"
          />
          <span className="text-base text-white">{formState.stressLevel}</span>
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "登録しています..." : "LINEで無料参加する"}
      </button>
      {message ? <p className="mt-4 text-sm text-rose-300">{message}</p> : null}
    </form>
  );
}
