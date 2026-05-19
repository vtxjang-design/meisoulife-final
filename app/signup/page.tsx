"use client";

import { AuthCard } from "@/components/auth-card";
import { SectionHeading } from "@/components/section-heading";
import { languageButtons, useLanguage, useSiteCopy } from "@/lib/i18n";

export default function SignupPage() {
  const { language, setLanguage } = useLanguage();
  const copy = useSiteCopy();
  const t = copy.loginPage;

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
          title={t.signupButton}
          description={t.subtitle}
          align="center"
        />
        <AuthCard mode="signup" />
      </div>
    </div>
  );
}
