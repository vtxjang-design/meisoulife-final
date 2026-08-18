"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { useAuthState } from "@/components/auth-provider";
import { SectionHeading } from "@/components/section-heading";
import { DEFAULT_AUTH_NEXT_PATH, resolveSafeReturnPath } from "@/lib/auth-next";
import { languageButtons, useLanguage, useSiteCopy } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { authResolved, isLoggedIn } = useAuthState();
  const { language, setLanguage } = useLanguage();
  const copy = useSiteCopy();
  const t = copy.loginPage;
  const [nextPath, setNextPath] = useState(DEFAULT_AUTH_NEXT_PATH);
  const [nextPathResolved, setNextPathResolved] = useState(false);

  useEffect(() => {
    const requestedNext = new URLSearchParams(window.location.search).get("next");
    setNextPath(resolveSafeReturnPath(requestedNext));
    setNextPathResolved(true);
  }, []);

  useEffect(() => {
    if (authResolved && isLoggedIn && nextPathResolved) {
      router.replace(nextPath);
    }
  }, [authResolved, isLoggedIn, nextPath, nextPathResolved, router]);

  if (authResolved && isLoggedIn) {
    return <div className="section-shell py-16 sm:py-24" aria-busy="true" />;
  }

  return (
    <div className="section-shell py-16 sm:py-24">
      <div className="mx-auto grid max-w-2xl gap-8">
        <div className="flex justify-end">
          <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.03] p-1">
            {languageButtons.map((button) => (
              <button
                key={button.key}
                type="button"
                onClick={() => setLanguage(button.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.2em] transition duration-300 ${
                  language === button.key ? "bg-white text-ink" : "text-white/68 hover:text-white"
                }`}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.subtitle}
          align="center"
        />
        <AuthCard mode="login" />
        <div className="flex justify-center">
          <Link
            href="/signup"
            className="button-nowrap inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
          >
            {t.signupButton}
          </Link>
        </div>
      </div>
    </div>
  );
}
