import { SectionHeading } from "@/components/section-heading";
import { getMockAdminMetrics } from "@/lib/mock-data";

type AdminPageProps = {
  searchParams: Promise<{
    month?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const metrics = getMockAdminMetrics();

  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading
        eyebrow="Admin"
        title="運営ダッシュボード"
        description="総会員数、有料会員、MRR、解約率、日次登録、完走率、流入元、転換率の高いコンテンツを月別で確認できる管理画面です。"
      />
      <div className="mt-8 flex items-center gap-3">
        <span className="text-sm text-white/60">月フィルター</span>
        <div className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
          {params.month || "2026-04"}
        </div>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="premium-card rounded-lg p-5">
          <p className="text-sm text-white/60">Total users</p>
          <p className="mt-2 text-3xl font-semibold text-white">{metrics.totalUsers}</p>
        </div>
        <div className="premium-card rounded-lg p-5">
          <p className="text-sm text-white/60">Paid users</p>
          <p className="mt-2 text-3xl font-semibold text-white">{metrics.paidUsers}</p>
        </div>
        <div className="premium-card rounded-lg p-5">
          <p className="text-sm text-white/60">MRR</p>
          <p className="mt-2 text-3xl font-semibold text-white">{metrics.mrr}</p>
        </div>
        <div className="premium-card rounded-lg p-5">
          <p className="text-sm text-white/60">Churn</p>
          <p className="mt-2 text-3xl font-semibold text-white">{metrics.churn}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="premium-card rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white">主要KPI</h2>
          <div className="mt-5 grid gap-3 text-sm text-white/78">
            <div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
              日次登録: {metrics.dailySignups}
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
              チャレンジ完走率: {metrics.challengeCompletionRate}
            </div>
          </div>
        </div>
        <div className="premium-card rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white">Top traffic sources</h2>
          <div className="mt-5 grid gap-3 text-sm text-white/78">
            {metrics.topTrafficSources.map((source) => (
              <div key={source} className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
                {source}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 premium-card rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white">Most converting content</h2>
        <div className="mt-5 grid gap-3 text-sm text-white/78">
          {metrics.mostConvertingContent.map((content) => (
            <div key={content} className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
              {content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
