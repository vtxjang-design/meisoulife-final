"use client";

import Link from "next/link";
import { useSiteCopy } from "@/lib/i18n";

export function SiteFooter() {
  const copy = useSiteCopy();

  return (
    <footer className="border-t border-white/10 bg-black/10">
      <div className="section-shell flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">{copy.footer.brand}</p>
          <p className="max-w-xl text-sm leading-7 text-white/68">{copy.footer.line1}</p>
        </div>
        <div className="flex w-full flex-nowrap items-center justify-center gap-2 text-[clamp(0.75rem,2.55vw,0.82rem)] leading-5 text-white/68 sm:w-auto sm:flex-wrap sm:justify-end sm:gap-4 sm:text-sm sm:leading-6">
          {copy.footer.links.map((item) => (
            <Link key={item.href} href={item.href} className="shrink-0 whitespace-nowrap">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
