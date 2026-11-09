"use client";

import Link from "next/link";
import { MembershipGuard } from "@/components/membership-guard";
import { useLanguage } from "@/lib/i18n";

const copy = {
  jp: {
    back: "BASICへ戻る",
    eyebrow: "OPTIONAL DEEPENING PROGRAM",
    title: "光明チャクラコース",
    subtitle: "自分自身と深く向き合う、特別な学びのプログラム",
    lead: "日々の瞑想から、さらに深い自分との出会いへ。",
    body: "マインドフリー瞑想と光明セッションを通して、自分の内面を見つめ、理解を深めるための3か月プログラムです。ご自身の関心とペースに合わせて、自由にお選びいただけます。",
    durationLabel: "期間",
    duration: "3か月",
    formatLabel: "方法",
    format: "オンライン・対面",
    feeLabel: "料金",
    fee: "133,000円",
    includesLabel: "内容",
    includes: "マインドフリー・光明セッション",
    operator: "共同運営：MeisoLife・ILCHI Brain Yoga",
    optional: "参加は自由です。MeisoLife BASICの月額会費とは別料金の特別プログラムです。",
    consultationTitle: "詳しく知りたい方へ",
    consultation: "プログラムの内容、日程、参加条件については、無料個別相談で詳しくご案内します。無理に参加をおすすめすることはありません。",
    disclaimer: "特定の健康改善や心理的変化を保証するものではありません。支払方法、キャンセル・返金条件は、お申し込み前にご確認ください。"
  },
  kr: {
    back: "BASIC으로 돌아가기",
    eyebrow: "선택형 심화 프로그램",
    title: "광명 차크라 코스",
    subtitle: "자신과 깊이 마주하는 특별한 배움의 프로그램",
    lead: "매일의 명상에서, 더 깊은 자신과의 만남으로.",
    body: "마인드프리 명상과 광명 세션을 통해 자신의 내면을 바라보고 이해를 깊게 하는 3개월 프로그램입니다. 자신의 관심과 속도에 맞추어 자유롭게 선택할 수 있습니다.",
    durationLabel: "기간",
    duration: "3개월",
    formatLabel: "방식",
    format: "온라인·대면",
    feeLabel: "비용",
    fee: "133,000엔",
    includesLabel: "내용",
    includes: "마인드프리·광명 세션",
    operator: "공동 운영: MeisoLife·ILCHI Brain Yoga",
    optional: "참여는 자유이며 MeisoLife BASIC 월 회비와 별도 비용의 특별 프로그램입니다.",
    consultationTitle: "자세히 알고 싶은 분께",
    consultation: "프로그램 내용, 일정과 참여 조건은 무료 개별상담에서 자세히 안내합니다. 참여를 강요하지 않습니다.",
    disclaimer: "특정한 건강 개선이나 심리적 변화를 보장하지 않습니다. 결제, 취소 및 환불 조건은 신청 전에 확인해 주세요."
  },
  en: {
    back: "Back to BASIC",
    eyebrow: "OPTIONAL DEEPENING PROGRAM",
    title: "Komei Chakra Course",
    subtitle: "A special learning program for meeting yourself more deeply",
    lead: "From daily meditation to a deeper encounter with yourself.",
    body: "This three-month program combines Mind Free meditation and Komei sessions to create space for deeper inner reflection and understanding. Participation is always your choice and may follow your own pace.",
    durationLabel: "Duration",
    duration: "3 months",
    formatLabel: "Format",
    format: "Online and in person",
    feeLabel: "Fee",
    fee: "¥133,000",
    includesLabel: "Includes",
    includes: "Mind Free and Komei sessions",
    operator: "Jointly offered by MeisoLife and ILCHI Brain Yoga",
    optional: "Participation is optional. This program is separate from the MeisoLife BASIC monthly membership fee.",
    consultationTitle: "For more information",
    consultation: "A free individual consultation explains the program, schedule, and participation requirements. There is no pressure to enroll.",
    disclaimer: "This program does not guarantee specific health or psychological outcomes. Please confirm payment, cancellation, and refund terms before applying."
  }
} as const;

function KomeiCourseContent() {
  const { language } = useLanguage();
  const localizedLanguage = language === "kr" || language === "en" ? language : "jp";
  const text = copy[localizedLanguage];

  return (
    <main data-komei-course-detail className="section-shell relative min-h-screen overflow-hidden pb-20 pt-7 sm:pb-28 sm:pt-10">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_8%,rgba(216,192,138,0.14),transparent_28%),radial-gradient(circle_at_15%_20%,rgba(127,255,212,0.09),transparent_32%),linear-gradient(180deg,#061B33_0%,#082845_44%,#051A30_100%)]" />
      <div className="mx-auto max-w-4xl">
        <Link href="/program/basic" className="inline-flex min-h-[44px] items-center gap-2 text-sm text-white/66 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
          <span aria-hidden="true">←</span>
          <span>{text.back}</span>
        </Link>

        <section className="mt-4 overflow-hidden rounded-[30px] border border-[rgba(216,192,138,0.2)] bg-[linear-gradient(180deg,rgba(10,37,61,0.9),rgba(6,25,46,0.98))] px-5 py-7 shadow-[0_26px_72px_rgba(0,0,0,0.2)] sm:px-9 sm:py-10">
          <p className="text-xs uppercase tracking-[0.28em] text-[rgba(216,192,138,0.78)]">{text.eyebrow}</p>
          <h1 className="mt-3 font-serif text-[2rem] leading-tight text-white/96 sm:text-[2.7rem]">{text.title}</h1>
          <p className="mt-2 text-sm leading-6 text-[rgba(244,231,192,0.84)] sm:text-base">{text.subtitle}</p>
          <p className="mt-7 font-serif text-xl leading-8 text-white/92 sm:text-2xl">{text.lead}</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">{text.body}</p>

          <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.08] min-[430px]:grid-cols-2 sm:grid-cols-4">
            {[
              [text.durationLabel, text.duration],
              [text.formatLabel, text.format],
              [text.feeLabel, text.fee],
              [text.includesLabel, text.includes]
            ].map(([label, value]) => (
              <div key={label} className="bg-[rgba(7,29,51,0.95)] px-4 py-4 sm:px-5 sm:py-5">
                <dt className="text-[10px] uppercase tracking-[0.18em] text-white/44">{label}</dt>
                <dd className="mt-2 text-sm leading-6 text-white/90">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 space-y-3 text-sm leading-6 text-white/68 sm:text-[15px]">
            <p>{text.operator}</p>
            <p>{text.optional}</p>
          </div>

          <section className="mt-8 rounded-[22px] border border-[rgba(216,192,138,0.18)] bg-[rgba(216,192,138,0.07)] px-5 py-5 sm:px-6 sm:py-6">
            <h2 className="font-serif text-xl text-[rgba(244,231,192,0.94)]">{text.consultationTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-white/72 sm:text-[15px]">{text.consultation}</p>
          </section>

          <p className="mt-6 text-xs leading-5 text-white/46">{text.disclaimer}</p>
        </section>
      </div>
    </main>
  );
}

export default function KomeiCoursePage() {
  return (
    <MembershipGuard requiredPlan="basic" showLogout={false}>
      <KomeiCourseContent />
    </MembershipGuard>
  );
}
