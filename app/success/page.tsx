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
  "1分、静かに呼吸する",
  "今日の感情をひとつ書く",
  "情報を少し手放す",
  "身体をゆっくり動かす",
  "誰かに優しい一言を送る",
  "自然を1分感じる",
  "自分の変化を振り返る"
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
            <p className="mt-4 text-sm leading-7 text-white/58">
              確認メールをお送りしました。まずは今日の小さな一歩から始めましょう。
            </p>
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
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-gold px-5 py-4 text-center text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              LINEコミュニティへ
            </a>
            <Link
              href="/#one-minute-meditation"
              className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-4 text-center text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
            >
              今日の1分を始める
            </Link>
            <Link
              href="/member"
              className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-gold/20 bg-gold/[0.08] px-5 py-4 text-center text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12]"
            >
              メンバーページへ進む
            </Link>
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.28em] text-gold/82">First 7 Days Rhythm</p>
              <h2 className="mt-3 font-serif text-3xl text-white sm:text-4xl">最初の7日間は、やさしく。</h2>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FIRST_SEVEN_DAYS.map((item, index) => (
                <div key={item} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/42">Day {index + 1}</p>
                  <p className="mt-3 text-sm leading-7 text-white/84">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
