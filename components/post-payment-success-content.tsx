"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

type SuccessTier = "basic" | "growth" | "inner_circle" | null;

type PostPaymentSuccessContentProps = {
  lineUrl: string;
  tier: SuccessTier;
  nextDestination?: string | null;
};

const PROGRAM_ROUTES: Record<Exclude<SuccessTier, null>, string> = {
  basic: "/program/basic",
  growth: "/program/growth",
  inner_circle: "/program/inner"
};

const successCopy = {
  jp: {
    badge: "🌿 ようこそ",
    title: "ようこそ。\nあなたの新しいリズムが始まりました。",
    subtitle: "これはコンテンツ購入ではなく、\n「自分に戻る静かなリズム」を育てる参加です。",
    quote: "一人で頑張る毎日から、\n共に目覚める日常へ。",
    support: "ここからは、\n一人で続けなくて大丈夫です。\n\n小さくても、\n一緒に続けていきましょう。",
    emailNote: "確認メールをお送りしました。まずは今日の小さな一歩から始めましょう。",
    welcome: "ようこそ、瞑想lifeへ🌿\n\n今日から一緒に、\n1日1分。\n\n自分に戻る静かな習慣を\n始めましょう。",
    activeMembership: "有効なメンバーシップ",
    planLabels: {
      basic: "Basic member",
      growth: "Growth member",
      inner_circle: "Inner Circle member"
    },
    startButton: "今日の1分を始める",
    lineButton: "LINEコミュニティへ",
    lineSub: "一緒に続ける仲間がいます",
    rhythmButton: "7日リズムを見る",
    rhythmSub: "無理なく続ける小さな習慣",
    firstSevenEyebrow: "最初の7日間リズム",
    firstSevenTitle: "最初の7日間",
    firstSevenDescription: "変わろうとしなくて大丈夫。\nただ、少しずつ戻っていきましょう。",
    aiCheckIn: "AIチェックイン",
    closing: "毎日1分で大丈夫。\n\n大切なのは、\n完璧ではなく、\n続けることです。",
    closingSub: "私たちは、共に目覚める旅の仲間です。",
    memberButton: "メンバーページへ進む",
    days: [
      { day: "DAY 1", theme: "立ち止まる", practice: "1分だけ静かに呼吸する", reflection: "今日は、少し立ち止まれましたか？" },
      { day: "DAY 2", theme: "呼吸", practice: "呼吸を感じる", reflection: "今の呼吸は\n急いでいませんか？" },
      { day: "DAY 3", theme: "身体感覚", practice: "身体をゆっくり感じる", reflection: "身体は、\n今のあなたに何を伝えていますか？" },
      { day: "DAY 4", theme: "感情", practice: "感情を否定せず見る", reflection: "今日の感情に、\n名前をつけるなら？" },
      { day: "DAY 5", theme: "思考整理", practice: "頭の情報を少し手放す", reflection: "本当に必要な情報だけを\n残せるとしたら？" },
      { day: "DAY 6", theme: "感謝", practice: "感謝を1つ見つける", reflection: "今日、\n感謝できることは？" },
      { day: "DAY 7", theme: "本来の自分", practice: "静かに戻る", reflection: "少しだけ、\n自分に戻れましたか？" }
    ]
  },
  kr: {
    badge: "🌿 환영합니다",
    title: "어서 오세요.\n새로운 리듬이 시작되었습니다.",
    subtitle: "이것은 단순한 구매가 아니라,\n나에게 돌아오는 조용한 리듬에 참여하는 시작입니다.",
    quote: "혼자 버티는 일상에서,\n함께 깨어나는 삶으로.",
    support: "이제부터는,\n혼자서 이어가지 않아도 괜찮습니다.\n\n작더라도,\n함께 이어가봅시다.",
    emailNote: "확인 메일을 보냈습니다. 오늘의 작은 한 걸음부터 시작해보세요.",
    welcome: "명상life에 오신 것을 환영합니다 🌿\n\n오늘부터 함께,\n하루 1분.\n\n나에게 돌아오는 조용한 습관을\n시작해봅시다.",
    activeMembership: "활성 멤버십",
    planLabels: {
      basic: "Basic 멤버",
      growth: "Growth 멤버",
      inner_circle: "Inner Circle 멤버"
    },
    startButton: "오늘의 1분 시작하기",
    lineButton: "LINE 커뮤니티로",
    lineSub: "함께 이어가는 동료가 있습니다",
    rhythmButton: "7일 리듬 보기",
    rhythmSub: "무리 없이 이어가는 작은 습관",
    firstSevenEyebrow: "처음 7일의 리듬",
    firstSevenTitle: "처음 7일",
    firstSevenDescription: "달라지려 애쓰지 않아도 괜찮습니다.\n조금씩 다시 돌아오면 됩니다.",
    aiCheckIn: "AI 체크인",
    closing: "매일 1분이면 충분합니다.\n\n중요한 것은,\n완벽함이 아니라,\n계속하는 것입니다.",
    closingSub: "우리는 함께 깨어나는 여정의 동료입니다.",
    memberButton: "멤버 페이지로 가기",
    days: [
      { day: "DAY 1", theme: "멈추기", practice: "1분만 조용히 호흡합니다", reflection: "오늘, 잠시 멈출 수 있었나요?" },
      { day: "DAY 2", theme: "호흡", practice: "지금의 호흡을 느껴봅니다", reflection: "지금의 호흡은\n너무 서두르고 있지 않나요?" },
      { day: "DAY 3", theme: "몸 감각", practice: "몸을 천천히 느껴봅니다", reflection: "몸은,\n지금의 당신에게 무엇을 말하고 있나요?" },
      { day: "DAY 4", theme: "감정", practice: "감정을 부정하지 않고 바라봅니다", reflection: "오늘의 감정에,\n이름을 붙인다면?" },
      { day: "DAY 5", theme: "생각 정리", practice: "머릿속 정보를 조금 놓아봅니다", reflection: "정말 필요한 정보만\n남긴다면 무엇일까요?" },
      { day: "DAY 6", theme: "감사", practice: "감사한 것 하나를 찾습니다", reflection: "오늘,\n감사할 수 있는 것은?" },
      { day: "DAY 7", theme: "본래의 나", practice: "조용히 나에게 돌아옵니다", reflection: "조금은,\n나에게 돌아올 수 있었나요?" }
    ]
  },
  en: {
    badge: "🌿 Welcome",
    title: "Welcome.\nYour new rhythm has begun.",
    subtitle: "This is not just a purchase.\nIt is an invitation to grow a quiet rhythm of returning to yourself.",
    quote: "From enduring alone,\nto awakening together.",
    support: "From here,\nyou do not have to continue alone.\n\nEven if it is small,\nlet’s keep going together.",
    emailNote: "We sent a confirmation email. Start with one small step today.",
    welcome: "Welcome to Meisoulife 🌿\n\nFrom today,\none minute a day.\n\nLet’s begin a quiet habit\nof returning to yourself.",
    activeMembership: "Active Membership",
    planLabels: {
      basic: "Basic member",
      growth: "Growth member",
      inner_circle: "Inner Circle member"
    },
    startButton: "Start today's minute",
    lineButton: "Join the LINE community",
    lineSub: "There are companions continuing with you",
    rhythmButton: "See the 7-day rhythm",
    rhythmSub: "A small habit you can continue gently",
    firstSevenEyebrow: "First 7 Days Rhythm",
    firstSevenTitle: "Your first 7 days",
    firstSevenDescription: "You do not have to force change.\nJust return a little at a time.",
    aiCheckIn: "AI Check-in",
    closing: "One minute a day is enough.\n\nWhat matters is not perfection,\nbut continuing.",
    closingSub: "We are companions on a shared journey of awakening.",
    memberButton: "Go to the member page",
    days: [
      { day: "DAY 1", theme: "Pause", practice: "Breathe quietly for one minute", reflection: "Were you able to pause, even a little, today?" },
      { day: "DAY 2", theme: "Breath", practice: "Notice your breathing", reflection: "Is your breath rushing right now?" },
      { day: "DAY 3", theme: "Body", practice: "Feel your body slowly", reflection: "What is your body trying to tell you right now?" },
      { day: "DAY 4", theme: "Emotion", practice: "Notice emotion without denying it", reflection: "If you gave today’s emotion a name, what would it be?" },
      { day: "DAY 5", theme: "Thoughts", practice: "Let go of a little mental noise", reflection: "If only the truly necessary thoughts remained, what would stay?" },
      { day: "DAY 6", theme: "Gratitude", practice: "Find one thing to appreciate", reflection: "What can you feel grateful for today?" },
      { day: "DAY 7", theme: "Return to Self", practice: "Quietly return to yourself", reflection: "Did you return to yourself, even a little?" }
    ]
  }
} as const;

export function PostPaymentSuccessContent({ lineUrl, tier, nextDestination }: PostPaymentSuccessContentProps) {
  const { language } = useLanguage();
  const copy = successCopy[language];
  const activePlanLabel = tier ? copy.planLabels[tier] : null;
  const continueHref = nextDestination || (tier ? PROGRAM_ROUTES[tier] : "/program/basic");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.14),transparent_24%),linear-gradient(180deg,#0a1716_0%,#0d1824_54%,#08131d_100%)] px-6 py-10 shadow-[0_28px_90px_rgba(7,17,31,0.28)] sm:px-10 sm:py-14">
        <div className="mx-auto max-w-3xl text-center animate-meditation-fade-up">
          <div className="inline-flex rounded-full border border-gold/20 bg-gold/[0.08] px-4 py-2 text-sm font-medium text-gold">
            {copy.badge}
          </div>
          <h1 className="mt-6 whitespace-pre-line font-serif text-4xl leading-tight text-white sm:text-5xl">{copy.title}</h1>
          <p className="mt-5 whitespace-pre-line text-base leading-8 text-white/76 sm:text-lg sm:leading-9">{copy.subtitle}</p>
          <p className="mt-5 whitespace-pre-line font-serif text-2xl leading-[1.6] text-gold/90 sm:text-3xl">{copy.quote}</p>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5">
            <p className="whitespace-pre-line text-sm leading-8 text-white/78 sm:text-base">{copy.support}</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/58">{copy.emailNote}</p>
        </div>

        {activePlanLabel ? (
          <div className="mx-auto mt-8 max-w-xl rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.activeMembership}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{activePlanLabel}</p>
          </div>
        ) : null}

        <div className="mx-auto mt-8 max-w-3xl rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-center">
          <p className="whitespace-pre-line text-sm leading-8 text-white/78">{copy.welcome}</p>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
          <Link
            href="/#one-minute-meditation"
            className="inline-flex min-h-[64px] flex-col items-center justify-center rounded-[24px] bg-gold px-5 py-4 text-center text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
          >
            {copy.startButton}
          </Link>
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[64px] flex-col items-center justify-center rounded-[24px] border border-white/12 bg-white/[0.04] px-5 py-4 text-center text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
          >
            <span>{copy.lineButton}</span>
            <span className="mt-1 text-xs font-medium text-white/56">{copy.lineSub}</span>
          </a>
          <Link
            href="#first-seven-days"
            className="inline-flex min-h-[64px] flex-col items-center justify-center rounded-[24px] border border-gold/20 bg-gold/[0.08] px-5 py-4 text-center text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12]"
          >
            <span>{copy.rhythmButton}</span>
            <span className="mt-1 text-xs font-medium text-gold/72">{copy.rhythmSub}</span>
          </Link>
        </div>

        <div id="first-seven-days" className="mx-auto mt-10 max-w-4xl rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-gold/82">{copy.firstSevenEyebrow}</p>
            <h2 className="mt-3 font-serif text-3xl text-white sm:text-4xl">{copy.firstSevenTitle}</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-8 text-white/70 sm:text-base">{copy.firstSevenDescription}</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {copy.days.map((item) => (
              <div key={item.day} className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.025))] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-gold/78">{item.day}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{item.theme}</h3>
                <p className="mt-3 text-sm leading-7 text-white/84">{item.practice}</p>
                <div className="mt-4 rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">{copy.aiCheckIn}</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-white/68">{item.reflection}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] border border-gold/16 bg-gold/[0.05] px-5 py-6 text-center">
            <p className="whitespace-pre-line font-serif text-2xl leading-[1.7] text-white sm:text-3xl">{copy.closing}</p>
            <p className="mt-5 text-sm leading-7 text-gold/82">{copy.closingSub}</p>
          </div>

          <div className="mt-5 flex justify-center">
            <Link
              href={continueHref}
              className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-4 text-center text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
            >
              {copy.memberButton}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
