import Link from "next/link";
import Stripe from "stripe";
import { SuccessMembershipSync } from "@/components/success-membership-sync";
import { getStripeClient } from "@/lib/stripe";

const LINE_URL = "https://line.me/R/ti/p/@meisoulife";

type SuccessPageProps = {
  searchParams?: Promise<{
    session_id?: string;
  }>;
};

type SuccessTier = "basic" | "growth" | "inner_circle" | null;

const FIRST_SEVEN_DAYS = [
  {
    day: "DAY 1",
    theme: "立ち止まる",
    practice: "1分だけ静かに呼吸する",
    reflection: "今日は、少し立ち止まれましたか？"
  },
  {
    day: "DAY 2",
    theme: "呼吸",
    practice: "呼吸を感じる",
    reflection: "今の呼吸は\n急いでいませんか？"
  },
  {
    day: "DAY 3",
    theme: "身体感覚",
    practice: "身体をゆっくり感じる",
    reflection: "身体は、\n今のあなたに何を伝えていますか？"
  },
  {
    day: "DAY 4",
    theme: "感情",
    practice: "感情を否定せず見る",
    reflection: "今日の感情に、\n名前をつけるなら？"
  },
  {
    day: "DAY 5",
    theme: "思考整理",
    practice: "頭の情報を少し手放す",
    reflection: "本当に必要な情報だけを\n残せるとしたら？"
  },
  {
    day: "DAY 6",
    theme: "感謝",
    practice: "感謝を1つ見つける",
    reflection: "今日、\n感謝できることは？"
  },
  {
    day: "DAY 7",
    theme: "本来の自分",
    practice: "静かに戻る",
    reflection: "少しだけ、\n自分に戻れましたか？"
  }
];

function normalizeTier(value?: string | null): SuccessTier {
  if (value === "basic" || value === "growth" || value === "inner_circle") {
    return value;
  }

  if (value === "inner-circle") {
    return "inner_circle";
  }

  return null;
}

function planLabel(tier: SuccessTier) {
  if (tier === "basic") {
    return "Basic member";
  }

  if (tier === "growth") {
    return "Growth member";
  }

  if (tier === "inner_circle") {
    return "Inner Circle member";
  }

  return null;
}

async function getCheckoutSession(sessionId: string, stripe: Stripe | null) {
  if (!stripe) {
    return null;
  }

  try {
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"]
    });
  } catch (error) {
    console.error("[success-page] failed to retrieve checkout session", {
      sessionId,
      error: error instanceof Error ? error.message : error
    });
    return null;
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const sessionId = params?.session_id;
  const stripe = getStripeClient();
  const session = sessionId ? await getCheckoutSession(sessionId, stripe) : null;
  const tier = normalizeTier(session?.metadata?.plan || session?.metadata?.tier || null);
  const activePlanLabel = planLabel(tier);

  return (
    <div className="section-shell py-16 sm:py-24">
      {sessionId && tier ? <SuccessMembershipSync sessionId={sessionId} tier={tier} /> : null}

      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.14),transparent_24%),linear-gradient(180deg,#0a1716_0%,#0d1824_54%,#08131d_100%)] px-6 py-10 shadow-[0_28px_90px_rgba(7,17,31,0.28)] sm:px-10 sm:py-14">
          <div className="mx-auto max-w-3xl text-center animate-meditation-fade-up">
            <div className="inline-flex rounded-full border border-gold/20 bg-gold/[0.08] px-4 py-2 text-sm font-medium text-gold">
              🌿 Welcome
            </div>
            <h1 className="mt-6 font-serif text-4xl leading-tight text-white sm:text-5xl">
              ようこそ。<br className="hidden sm:block" />
              あなたの新しいリズムが始まりました。
            </h1>
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-white/76 sm:text-lg sm:leading-9">
              {"これはコンテンツ購入ではなく、\n「自分に戻る静かなリズム」を育てる参加です。"}
            </p>
            <p className="mt-5 whitespace-pre-line font-serif text-2xl leading-[1.6] text-gold/90 sm:text-3xl">
              {"一人で頑張る毎日から、\n共に目覚める日常へ。"}
            </p>
            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5">
              <p className="whitespace-pre-line text-sm leading-8 text-white/78 sm:text-base">
                {"ここからは、\n一人で続けなくて大丈夫です。\n\n小さくても、\n一緒に続けていきましょう。"}
              </p>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/58">確認メールをお送りしました。まずは今日の小さな一歩から始めましょう。</p>
          </div>

          {activePlanLabel ? (
            <div className="mx-auto mt-8 max-w-xl rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-center">
              <p className="text-xs uppercase tracking-[0.24em] text-gold/80">Active Membership</p>
              <p className="mt-3 text-2xl font-semibold text-white">{activePlanLabel}</p>
            </div>
          ) : null}

          <div className="mx-auto mt-8 max-w-3xl rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-center">
            <p className="whitespace-pre-line text-sm leading-8 text-white/78">
              {"ようこそ、瞑想lifeへ🌿\n\n今日から一緒に、\n1日1分。\n\n自分に戻る静かな習慣を\n始めましょう。"}
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
            <Link
              href="/#one-minute-meditation"
              className="inline-flex min-h-[64px] flex-col items-center justify-center rounded-[24px] bg-gold px-5 py-4 text-center text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              今日の1分を始める
            </Link>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[64px] flex-col items-center justify-center rounded-[24px] border border-white/12 bg-white/[0.04] px-5 py-4 text-center text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
            >
              <span>LINEコミュニティへ</span>
              <span className="mt-1 text-xs font-medium text-white/56">一緒に続ける仲間がいます</span>
            </a>
            <Link
              href="#first-seven-days"
              className="inline-flex min-h-[64px] flex-col items-center justify-center rounded-[24px] border border-gold/20 bg-gold/[0.08] px-5 py-4 text-center text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12]"
            >
              <span>7日リズムを見る</span>
              <span className="mt-1 text-xs font-medium text-gold/72">無理なく続ける小さな習慣</span>
            </Link>
          </div>

          <div id="first-seven-days" className="mx-auto mt-10 max-w-4xl rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.28em] text-gold/82">First 7 Days Rhythm</p>
              <h2 className="mt-3 font-serif text-3xl text-white sm:text-4xl">最初の7日間</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-8 text-white/70 sm:text-base">
                {"変わろうとしなくて大丈夫。\nただ、少しずつ戻っていきましょう。"}
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {FIRST_SEVEN_DAYS.map((item) => (
                <div key={item.day} className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.025))] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-gold/78">{item.day}</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">{item.theme}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/84">{item.practice}</p>
                  <div className="mt-4 rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">AI Check-in</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-white/68">{item.reflection}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[24px] border border-gold/16 bg-gold/[0.05] px-5 py-6 text-center">
              <p className="whitespace-pre-line font-serif text-2xl leading-[1.7] text-white sm:text-3xl">
                {"毎日1分で大丈夫。\n\n大切なのは、\n完璧ではなく、\n続けることです。"}
              </p>
              <p className="mt-5 text-sm leading-7 text-gold/82">私たちは、共に目覚める旅の仲間です。</p>
            </div>

            <div className="mt-5 flex justify-center">
              <Link
                href="/member"
                className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-4 text-center text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
              >
                メンバーページへ進む
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
