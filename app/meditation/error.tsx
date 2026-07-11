"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";

const errorCopy = {
  jp: {
    title: "瞑想を始める途中で問題が発生しました。",
    body: "もう一度試すか、BASICへ戻ってください。",
    retry: "もう一度試す",
    back: "BASICへ戻る"
  },
  kr: {
    title: "명상을 시작하는 중 문제가 발생했습니다.",
    body: "다시 시도하거나 BASIC으로 돌아가 주세요.",
    retry: "다시 시도하기",
    back: "BASIC으로 돌아가기"
  },
  en: {
    title: "Something went wrong while starting this meditation.",
    body: "Please try again or return to BASIC.",
    retry: "Try again",
    back: "Return to BASIC"
  }
} as const;

export default function MeditationError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language } = useLanguage();
  const localizedLanguage = language === "kr" || language === "en" || language === "jp" ? language : "jp";
  const copy = errorCopy[localizedLanguage];
  const reportedFingerprintRef = useRef<string | null>(null);

  useEffect(() => {
    console.error("[meditation-route-error] runtime", error);
    console.error("[meditation-route-error] stack", error?.stack);
    console.error("[meditation-route-error] digest", error?.digest);

    const componentStack =
      typeof error === "object" &&
      error !== null &&
      "componentStack" in error
        ? (error as Error & { componentStack?: string }).componentStack
        : undefined;

    console.error(
      "[meditation-route-error] componentStack",
      componentStack
    );

    try {
      const pathname = typeof window !== "undefined" ? window.location.pathname : "";
      const search = typeof window !== "undefined" ? window.location.search : "";
      const meditationType =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("type") ?? undefined
          : undefined;
      const userAgent =
        typeof navigator !== "undefined" ? navigator.userAgent : undefined;
      const buildId =
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
        process.env.NEXT_PUBLIC_BUILD_ID ||
        undefined;
      const payload = {
        errorName: error?.name,
        message: error?.message,
        stack: error?.stack,
        digest: error?.digest,
        componentStack,
        pathname,
        search,
        meditationType,
        language: localizedLanguage,
        userAgent,
        timestamp: new Date().toISOString(),
        buildId
      };
      const fingerprint = JSON.stringify({
        errorName: payload.errorName ?? "",
        message: payload.message ?? "",
        digest: payload.digest ?? "",
        pathname: payload.pathname ?? "",
        search: payload.search ?? ""
      });

      if (reportedFingerprintRef.current === fingerprint) {
        return;
      }

      reportedFingerprintRef.current = fingerprint;

      const body = JSON.stringify(payload);

      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const beaconBody = new Blob([body], { type: "application/json" });
        const sent = navigator.sendBeacon("/api/client-error-report", beaconBody);

        if (sent) {
          return;
        }
      }

      void fetch("/api/client-error-report", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body,
        keepalive: true
      }).catch(() => undefined);
    } catch {
      // Ignore client-side reporting failures so the fallback UI remains stable.
    }
  }, [error]);

  return (
    <main className="section-shell py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="premium-card rounded-[28px] p-8 text-center sm:p-12">
          <div className="mx-auto max-w-xl space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-gold/72">Meditation Gate</p>
            <h1 className="font-serif text-3xl text-white sm:text-4xl">{copy.title}</h1>
            <p className="text-sm leading-7 text-white/68 sm:text-base">{copy.body}</p>
            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
              >
                {copy.retry}
              </button>
              <Link
                href="/program/basic"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
              >
                {copy.back}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
