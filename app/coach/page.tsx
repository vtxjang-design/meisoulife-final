import Link from "next/link";

export default function CoachPage() {
  return (
    <div className="section-shell py-16 sm:py-24">
      <section className="premium-card mx-auto max-w-2xl rounded-lg p-6 sm:p-10" aria-labelledby="coach-unavailable-title">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">Gongsaeng Coach</p>
        <h1 id="coach-unavailable-title" className="mt-4 font-serif text-3xl text-white sm:text-4xl">
          현재 이용할 수 없습니다
        </h1>
        <p className="mt-3 text-base leading-8 text-white/72">
          공생 코치는 안전 검토가 완료될 때까지 일시적으로 이용할 수 없습니다. 지금은 승인된 1-Minute Recovery로 돌아갈 수 있습니다.
        </p>
        <Link
          href="/#one-minute-experience"
          className="mt-6 inline-flex rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92]"
        >
          1-Minute Recovery로 돌아가기
        </Link>
      </section>
    </div>
  );
}
