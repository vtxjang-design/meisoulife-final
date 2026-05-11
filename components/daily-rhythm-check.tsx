"use client";

import { useEffect, useMemo, useState } from "react";
import type { LandingCopy } from "@/lib/landing-copy";

const STORAGE_KEY = "meisoulife_daily_rhythm_check";

type DailyRhythmCheckProps = {
  copy: LandingCopy["dailyRhythmCheck"];
};

type StoredCheckIn = {
  date: string;
  emotionKey: string;
};

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DailyRhythmCheck({ copy }: DailyRhythmCheckProps) {
  const [selectedKey, setSelectedKey] = useState(copy.options[0]?.key ?? "");
  const [returnMessage, setReturnMessage] = useState("");

  const selected = useMemo(
    () => copy.options.find((option) => option.key === selectedKey) ?? copy.options[0],
    [copy.options, selectedKey]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // TODO: Replace this local-only memory with Supabase daily rhythm memory when member storage is ready.
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return;
    }

    try {
      const parsed = JSON.parse(storedValue) as StoredCheckIn;

      if (parsed.date === getTodayKey()) {
        setSelectedKey(parsed.emotionKey);
        setReturnMessage(copy.returnMessages[0] || "");
        return;
      }

      setReturnMessage(copy.returnMessages[1] || copy.returnMessages[0] || "");
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [copy.options, copy.returnMessages]);

  function handleSelect(nextKey: string) {
    setSelectedKey(nextKey);

    if (typeof window === "undefined") {
      return;
    }

    const payload: StoredCheckIn = {
      date: getTodayKey(),
      emotionKey: nextKey
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setReturnMessage(copy.returnMessages[0] || "");
  }

  if (!selected) {
    return null;
  }

  return (
    <section className="section-shell mt-10 sm:mt-12">
      <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(245,241,228,0.12),transparent_20%),radial-gradient(circle_at_bottom,rgba(79,122,101,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-7 shadow-[0_24px_80px_rgba(7,17,31,0.16)] sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute inset-x-[20%] top-0 h-24 rounded-full bg-gold/10 blur-3xl" />
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gold/84">{copy.eyebrow}</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">{copy.title}</h2>
          <p className="mt-4 text-base leading-8 text-white/68 sm:text-lg">{copy.description}</p>
          {returnMessage ? <p className="mt-3 text-sm leading-7 text-white/52">{returnMessage}</p> : null}
        </div>

        <div className="mx-auto mt-6 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {copy.options.map((option) => {
            const isSelected = option.key === selected.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelect(option.key)}
                className={`rounded-2xl border px-4 py-4 text-sm leading-7 transition duration-300 ${
                  isSelected
                    ? "border-gold/35 bg-gold/10 text-white shadow-[0_18px_50px_rgba(216,191,131,0.08)]"
                    : "border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-6 max-w-2xl rounded-[24px] border border-emerald-200/12 bg-emerald-200/8 px-5 py-5 text-center transition duration-500 animate-[fadeIn_400ms_ease-out] sm:px-6">
          <p className="whitespace-pre-line text-sm leading-8 text-white/84 sm:text-base">{selected.response}</p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <a
            href="#one-minute-experience"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.01] hover:bg-[#e7cd92]"
          >
            {copy.cta}
          </a>
          <p className="text-sm leading-7 text-white/52">{copy.coexistenceLine}</p>
        </div>
      </div>
    </section>
  );
}
