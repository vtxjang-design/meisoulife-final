import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/10">
      <div className="section-shell flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">瞑想life</p>
          <p className="max-w-xl text-sm leading-7 text-white/68">
            回復から共生へ。共生から地球経営へ。
          </p>
          <p className="text-sm leading-7 text-white/52">瞑想life — 回復から共生へ。共生から地球経営へ。</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-white/68">
          <Link href="/challenge">無料参加</Link>
          <Link href="/pricing">料金</Link>
          <Link href="/community">コミュニティ</Link>
          <Link href="/leaders">リーダー成長</Link>
          <Link href="/retreats">リトリート</Link>
        </div>
      </div>
    </footer>
  );
}
