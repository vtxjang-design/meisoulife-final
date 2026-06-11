"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteCopy } from "@/lib/i18n";

export function SiteFooter() {
  const copy = useSiteCopy();
  const pathname = usePathname();
  const isBasicSanctuary = pathname === "/program/basic" || pathname === "/dashboard";

  return (
    <footer className="border-t border-white/10 bg-black/10">
      <div className="section-shell flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">{copy.footer.brand}</p>
          <p className="max-w-xl text-sm leading-7 text-white/68">{copy.footer.line1}</p>
          {!isBasicSanctuary ? <p className="text-sm leading-7 text-white/52">{copy.footer.line2}</p> : null}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-white/68">
          {copy.footer.links.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
