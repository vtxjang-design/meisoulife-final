import Link from "next/link";
import { CheckoutButton } from "@/components/checkout-button";
import { SectionHeading } from "@/components/section-heading";

const membershipPlans = [
  {
    key: "basic",
    name: "BASIC",
    price: "¥1,000",
    dailyCost: "約¥33 / day",
    emotionalCopy: "静かに整う最初の一歩を、やさしく始めたい人へ",
    description: "毎日の心の回復を、無理なく続けるためのベーシックプラン。",
    features: ["毎日の1分瞑想", "心が整う音声ガイド", "会員コミュニティの入口", "毎朝の習慣設計"],
    cta: "BASICではじめる",
    orderClass: "order-2 lg:order-1",
    accentClass: "border-white/60 bg-white/75"
  },
  {
    key: "leader",
    name: "GROWTH",
    price: "¥3,000",
    dailyCost: "約¥100 / day",
    emotionalCopy: "続ける力を、仲間との成長に変えていきたい人へ",
    description: "最もおすすめの中心プラン。実践を深め、日々の安定をしっかり育てます。",
    features: ["少人数サークル", "優先イベント案内", "週次の深い実践ガイド", "実践記録レビュー"],
    cta: "GROWTHで深める",
    orderClass: "order-1 lg:order-2",
    accentClass: "border-emerald-300 bg-gradient-to-b from-white to-emerald-50/70 shadow-[0_24px_60px_rgba(5,150,105,0.12)]"
  },
  {
    key: "premium",
    name: "INNER CIRCLE",
    price: "¥10,000",
    dailyCost: "約¥333 / day",
    emotionalCopy: "深い静けさと、特別なつながりを大切にしたい人へ",
    description: "もっと深く、静かに、自分を整えるためのプレミアムプラン。",
    features: ["月次プレミアムセッション", "リトリート優先案内", "個別サポート導線", "Inner Circle専用アクセス"],
    cta: "INNER CIRCLEへ進む",
    orderClass: "order-3 lg:order-3",
    accentClass: "border-amber-200/80 bg-white/75"
  }
] as const;

const trustBadges = [
  "クレジットカードで安全決済",
  "いつでも解約可能",
  "スマホだけですぐ開始",
  "日本語サポート対応"
] as const;

const pricingTestimonials = [
  {
    name: "美香さん・49歳",
    quote: "BASICに入ってから、朝の1分だけでも気持ちが整う感覚が毎日わかるようになりました。"
  },
  {
    name: "健一さん・57歳",
    quote: "GROWTHは、ひとりで頑張る感じがなくなって続けやすいです。参加して正解でした。"
  },
  {
    name: "由紀さん・52歳",
    quote: "INNER CIRCLEは静かで上質です。慌ただしい日常の中に、安心して戻れる場所ができました。"
  }
] as const;

export default function PricingPage() {
  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading
        eyebrow="Membership"
        title="あなたの今に合う、3つの会員プラン"
        description="名前と価格はシンプルに。選びやすさと続けやすさを最優先にした、瞑想lifeのプレミアム会員設計です。"
      />

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/58">
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">Appleのように静かで明快</span>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">日本のウェルネスらしい余白</span>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">今すぐ始められる導線</span>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:items-stretch">
        {membershipPlans.map((plan) => (
          <article
            key={plan.key}
            className={`${plan.orderClass} flex h-full flex-col rounded-[24px] border p-6 shadow-[0_16px_46px_rgba(8,15,24,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_64px_rgba(8,15,24,0.14)] sm:p-7 ${plan.accentClass}`}
          >
            <div className="space-y-4">
              <p className="text-sm font-medium tracking-[0.28em] text-emerald-700">{plan.name}</p>
              <p className="text-sm leading-7 text-zinc-600">{plan.emotionalCopy}</p>
              <div className="space-y-2">
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">{plan.price}</p>
                  <span className="pb-1 text-sm text-zinc-500">/ month</span>
                </div>
                <p className="text-sm font-medium text-emerald-700">{plan.dailyCost}</p>
              </div>
              <p className="text-sm leading-7 text-zinc-600">{plan.description}</p>
            </div>

            <ul className="mt-6 grid gap-3 text-sm text-zinc-700">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="rounded-2xl border border-zinc-200/70 bg-white/70 px-4 py-3 shadow-[0_8px_24px_rgba(8,15,24,0.04)]"
                >
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              {plan.key === "basic" ? <CheckoutButton plan="basic" label={plan.cta} /> : null}
              {plan.key === "leader" ? <CheckoutButton plan="leader" label={plan.cta} /> : null}
              {plan.key === "premium" ? <CheckoutButton plan="premium" label={plan.cta} /> : null}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {trustBadges.map((badge) => (
          <div
            key={badge}
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm text-white/72 shadow-[0_10px_24px_rgba(8,15,24,0.05)]"
          >
            {badge}
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-gold">Voices</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              入ってよかった、という声
            </h2>
          </div>
          <Link
            href="/community"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            コミュニティを見る
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {pricingTestimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_12px_30px_rgba(8,15,24,0.05)] transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]"
            >
              <p className="text-base leading-8 text-white/84">“{item.quote}”</p>
              <p className="mt-5 text-sm text-gold">{item.name}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
