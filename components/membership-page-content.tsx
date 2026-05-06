"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { useSiteCopy } from "@/lib/i18n";

type MembershipPageContentProps = {
  canceled: boolean;
};

export function MembershipPageContent({ canceled }: MembershipPageContentProps) {
  const copy = useSiteCopy().membershipPage;

  return (
    <div className="section-shell py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="premium-card rounded-[28px] p-8 sm:p-12">
          <SectionHeading eyebrow="Membership" title={copy.title} description={copy.subtitle} align="center" />
          {canceled ? (
            <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-8 text-white/72">{copy.canceled}</p>
          ) : null}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              {copy.primary}
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
            >
              {copy.secondary}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
