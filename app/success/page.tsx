import { redirect } from "next/navigation";
import Link from "next/link";

type SuccessPageProps = {
  searchParams?: Promise<{
    session_id?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const sessionId = params?.session_id;

  if (sessionId) {
    redirect(`/membership/success?session_id=${encodeURIComponent(sessionId)}`);
  }

  return (
    <div className="section-shell py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="premium-card rounded-[28px] p-8 text-center sm:p-12">
          <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/12 px-4 py-2 text-sm font-medium text-emerald-100">
            Payment completed
          </div>
          <h1 className="mt-6 font-serif text-4xl text-white sm:text-5xl">お支払いが完了しました。</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/72">
            確認メールをお送りしました。ダッシュボードまたはメンバーページから、次のリズムへ静かに進めます。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              ダッシュボードへ
            </Link>
            <Link
              href="/member"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
            >
              メンバーページへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
