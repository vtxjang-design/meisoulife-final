import Link from "next/link";
import { cn } from "@/lib/utils";

type PricingCardProps = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  href?: string;
  featured?: boolean;
};

export function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  href = "/pricing",
  featured = false
}: PricingCardProps) {
  return (
    <article
      className={cn(
        "premium-card flex h-full flex-col gap-6 rounded-lg p-6",
        featured && "border-gold/50 bg-white/[0.075]"
      )}
    >
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">{name}</p>
        <p className="text-3xl font-semibold text-white">{price}</p>
        <p className="text-sm leading-7 text-white/68">{description}</p>
      </div>
      <ul className="grid gap-3 text-sm text-white/78">
        {features.map((feature) => (
          <li key={feature} className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={cn(
          "mt-auto inline-flex items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition",
          featured ? "bg-gold text-ink hover:bg-[#e7cd92]" : "border border-white/15 text-white hover:bg-white/10"
        )}
      >
        {cta}
      </Link>
    </article>
  );
}
