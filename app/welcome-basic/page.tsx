import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "ようこそ、瞑想life Basic Memberへ",
  description: "瞑想life Basic Memberのためのプレミアム歓迎ページ。新しい瞑想習慣を気持ちよく始めるための入口です。",
  alternates: {
    canonical: absoluteUrl("/welcome-basic")
  }
};

const benefits = [
  {
    title: "毎日の1分瞑想",
    description: "忙しい日でも続けられる習慣",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-7 w-7 text-emerald-600" aria-hidden="true">
        <path
          d="M24 8C16.82 8 11 13.82 11 21c0 8.5 10.29 17.16 12.17 18.68a1.3 1.3 0 0 0 1.66 0C26.71 38.16 37 29.5 37 21 37 13.82 31.18 8 24 8Z"
          className="fill-emerald-100"
        />
        <path
          d="M24 15.25c-2.9 0-5.25 2.35-5.25 5.25S21.1 25.75 24 25.75s5.25-2.35 5.25-5.25S26.9 15.25 24 15.25Z"
          className="fill-current"
        />
      </svg>
    )
  },
  {
    title: "心が整う音声ガイド",
    description: "気分に合わせて選べる癒し音声",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-7 w-7 text-emerald-600" aria-hidden="true">
        <rect x="12" y="10" width="24" height="28" rx="12" className="fill-emerald-100" />
        <rect x="21" y="14" width="6" height="14" rx="3" className="fill-current" />
        <path
          d="M17 24a7 7 0 1 0 14 0M24 31v5M19.5 36h9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    )
  },
  {
    title: "成長コミュニティ",
    description: "仲間と共に継続し成長する場",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-7 w-7 text-emerald-600" aria-hidden="true">
        <circle cx="17" cy="19" r="5" className="fill-emerald-100" />
        <circle cx="31" cy="19" r="5" className="fill-emerald-100" />
        <path
          d="M10.5 34c1.24-3.97 4.77-6.5 8.5-6.5s7.26 2.53 8.5 6.5M21.5 34c1.24-3.97 4.77-6.5 8.5-6.5s7.26 2.53 8.5 6.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }
] as const;

export default function WelcomeBasicPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-stone-100 to-emerald-50 px-5 py-8 text-zinc-900 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="overflow-hidden rounded-[32px] border border-white/70 bg-gradient-to-br from-white via-stone-50 to-emerald-50/80 shadow-[0_20px_80px_rgba(24,24,27,0.08)]">
          <div className="grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-14">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-4 py-2 text-xs font-medium tracking-[0.24em] text-emerald-700 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Basic Membership Activated
              </div>

              <h1 className="mt-6 max-w-3xl text-balance font-serif text-4xl leading-tight text-zinc-900 sm:text-5xl lg:text-6xl">
                ようこそ、瞑想life Basic Memberへ
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700 sm:text-xl">
                ご参加ありがとうございます。今日から新しい瞑想習慣が始まります。
              </p>
            </div>

            <div className="relative min-h-[280px] overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-emerald-100 via-stone-50 to-amber-50 shadow-[0_16px_50px_rgba(20,83,45,0.10)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(5,150,105,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(217,119,6,0.12),transparent_30%)]" />
              <img
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
                alt="穏やかな光の中で瞑想する静かな風景"
                className="absolute inset-0 h-full w-full object-cover mix-blend-multiply opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/35 via-transparent to-white/18" />
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="group rounded-[24px] border border-zinc-200/80 bg-white/80 p-6 shadow-[0_12px_40px_rgba(24,24,27,0.06)] backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_55px_rgba(24,24,27,0.10)] sm:p-7"
            >
              <div className="inline-flex rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
                {benefit.icon}
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900">{benefit.title}</h2>
              <p className="mt-3 text-base leading-7 text-zinc-600">{benefit.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/75 px-6 py-8 shadow-[0_18px_60px_rgba(24,24,27,0.06)] backdrop-blur sm:px-8 sm:py-10 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-700">Next Step</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              今すぐ始めると、習慣はもっと自然に定着します。
            </h2>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="#"
              className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-[0_16px_34px_rgba(5,150,105,0.22)] transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-[0_20px_40px_rgba(5,150,105,0.28)] sm:w-auto sm:min-w-[240px]"
            >
              LINEコミュニティに参加
            </Link>
            <Link
              href="/challenge"
              className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-emerald-200 bg-white px-6 py-4 text-base font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 sm:w-auto sm:min-w-[220px]"
            >
              1分瞑想を始める
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-4 text-base font-semibold text-zinc-700 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 sm:w-auto sm:min-w-[200px]"
            >
              ホームへ戻る
            </Link>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-gradient-to-r from-white/70 via-stone-50 to-emerald-50/80 px-6 py-8 text-center shadow-[0_12px_48px_rgba(24,24,27,0.04)] sm:px-8">
          <p className="font-serif text-3xl leading-relaxed tracking-tight text-zinc-900 sm:text-4xl">
            小さな1分が、
            <br className="sm:hidden" />
            人生を大きく変えていく。
          </p>
        </section>

        <footer className="pb-4 text-center">
          <p className="text-sm tracking-[0.22em] text-zinc-500">瞑想life Basic Member Portal</p>
        </footer>
      </div>
    </main>
  );
}
