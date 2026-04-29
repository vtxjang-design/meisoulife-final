import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { retreatLocations } from "@/lib/content";

export default function RetreatsPage() {
  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading
        eyebrow="Retreats"
        title="世界につながるリトリートネットワーク"
        description="日常の継続から、人生の節目になる深い滞在体験まで。瞑想lifeの次の旅路を紹介します。"
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {retreatLocations.map((retreat) => (
          <article key={retreat.place} className="premium-card rounded-lg p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">{retreat.place}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{retreat.title}</h2>
            <p className="mt-4 text-sm leading-7 text-white/72">{retreat.description}</p>
          </article>
        ))}
      </div>
      <div className="mt-10">
        <Link
          href="/community"
          className="inline-flex rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92]"
        >
          リトリート案内を受け取る
        </Link>
      </div>
    </div>
  );
}
