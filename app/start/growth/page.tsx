"use client";

import Link from "next/link";

const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL || process.env.NEXT_PUBLIC_LINE_FREE_URL || "https://lin.ee/z8Lzvvs";

export default function StartGrowthPage() {
  return (
    <div className="section-shell py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <section className="premium-card rounded-[28px] p-8 text-center sm:p-12">
          <p className="text-sm uppercase tracking-[0.32em] text-gold/80">Growth Start</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">Growthリズムの入り口です</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/68">
            ここから、週ごとの導きと支え合う流れの中で、もう少し深いリズムへ入っていけます。
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/program/growth"
              className="inline-flex min-h-[56px] min-w-[240px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              Growthプログラムへ進む
            </Link>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] min-w-[240px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
            >
              LINEに参加する
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
