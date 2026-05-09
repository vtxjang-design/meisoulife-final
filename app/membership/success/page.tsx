import Link from "next/link";
import { MembershipSuccessContent } from "@/components/membership-success-content";
import { getStripeClient } from "@/lib/stripe";

const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL || process.env.NEXT_PUBLIC_LINE_FREE_URL || "https://lin.ee/z8Lzvvs";
const AI_COACH_URL =
  process.env.NEXT_PUBLIC_AI_COACH_URL ||
  "https://chatgpt.com/g/g-69f968bc9a408191a3e5f943912666c0-quiet-rhythm-guide";

type MembershipSuccessPageProps = {
  searchParams?: Promise<{
    session_id?: string;
  }>;
};

function normalizeTier(value: string | null | undefined) {
  if (value === "basic" || value === "growth" || value === "inner_circle") {
    return value;
  }

  return null;
}

export default async function MembershipSuccessPage({ searchParams }: MembershipSuccessPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const sessionId = params?.session_id;
  const stripe = getStripeClient();

  if (!sessionId || !stripe) {
    return (
      <div className="section-shell py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="premium-card rounded-[28px] p-8 text-center sm:p-12">
            <h1 className="font-serif text-4xl text-white sm:text-5xl">お支払い状況を確認できませんでした。</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/68">
              もう一度お試しいただくか、準備ができたら料金ページから静かに戻ってきてください。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/pricing"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
              >
                料金ページへ戻る
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
              >
                ホームへ戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
  const paid =
    session.payment_status === "paid" ||
    (typeof session.subscription !== "string" && session.subscription?.status === "active");
  const tier = normalizeTier(session.metadata?.plan || session.metadata?.tier);

  if (!paid || !tier) {
    return (
      <div className="section-shell py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="premium-card rounded-[28px] p-8 text-center sm:p-12">
            <h1 className="font-serif text-4xl text-white sm:text-5xl">お支払いの確認中です。</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/68">
              決済の反映に少し時間がかかることがあります。しばらくしてからもう一度開いてください。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/premium"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
              >
                プレミアムページを見る
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
              >
                料金ページへ戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <MembershipSuccessContent sessionId={session.id} tier={tier} lineUrl={LINE_URL} coachUrl={AI_COACH_URL} />;
}
