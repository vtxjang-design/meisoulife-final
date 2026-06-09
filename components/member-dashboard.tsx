"use client";

import Link from "next/link";
import { useLocaleCopy } from "@/lib/i18n";

type PlanKey = "free" | "basic" | "growth" | "inner_circle";

type MemberDashboardProps = {
  planKey: PlanKey;
  membershipResolved?: boolean;
  membershipError?: boolean;
  challengeDay?: number;
  streakCount: number;
  aiUsage: {
    used: number;
    limit: number | "unlimited";
  };
  candidateLeader?: boolean;
  communityUrl?: string;
  challengeStarted?: boolean;
  registeredEmail?: string;
};

const dashboardCopy = {
  jp: {
    eyebrow: "QUIET RECORDS",
    title: "静かな記録",
    challengeStartedTitle: "チャレンジを開始しました",
    description:
      "プラン、旅の流れ、ともに歩く人たち、次の集いを、必要なときにここで静かに確かめられます。",
    leaderEyebrow: "Leader Program",
    leaderTitle: "リーダープログラムに招待されました",
    leaderBody:
      "継続実践、チェックイン、コミュニティ貢献が一定基準を超えました。次のステップへ進めます。",
    currentPlan: "今日のリズム",
    checkingMembership: "リズム空間を準備しています。",
    challengeProgress: "旅の日",
    streakCount: "歩いてきた日々",
    aiUsage: "今日の気づき",
    challengeEyebrow: "THE QUIET PATH",
    challengeTitle: "リズムの道",
    openProgress: "旅をひらく",
    gateDayPrefix: "第",
    gateDaySuffix: "の扉",
    communityEyebrow: "ともに歩く人たち",
    communityTitle: "ともに歩く人たち",
    communityBody: "毎日の気づきや小さな前進を、同じ道を歩く仲間たちと静かに分かち合えます。",
    communityCta: "仲間たちの場所へ",
    eventsEyebrow: "次の集い",
    upgradeCta: "プランをアップグレード",
    registeredEmail: "登録メール",
    dayLabel: "Day",
    streakUnit: "日",
    insightReady: "自分に戻る時間がここにあります。",
    plans: {
      free: "Freeメンバー",
      basic: "Basicメンバー",
      growth: "Growthメンバー",
      inner_circle: "Inner Circleメンバー"
    },
    challengeDays: ["立ち止まる庭", "呼吸の道", "からだの森", "感情の湖", "思考の丘", "感謝の展望台", "本来の私"],
    events: ["毎週水曜 06:30 朝ライブ瞑想", "土曜 21:00 睡眠回復セッション"]
  },
  kr: {
    eyebrow: "QUIET RECORDS",
    title: "조용한 기록",
    challengeStartedTitle: "챌린지를 시작했습니다",
    description:
      "플랜, 여정의 흐름, 함께 걷는 사람들, 다음 모임을 필요할 때 이곳에서 조용히 확인할 수 있습니다.",
    leaderEyebrow: "Leader Program",
    leaderTitle: "리더 프로그램에 초대되었습니다",
    leaderBody: "지속 실천, 체크인, 커뮤니티 기여가 기준을 넘어 다음 단계로 나아갈 수 있습니다.",
    currentPlan: "오늘의 리듬",
    checkingMembership: "리듬 공간을 준비하고 있습니다.",
    challengeProgress: "여정의 날",
    streakCount: "이어온 날들",
    aiUsage: "오늘의 통찰",
    challengeEyebrow: "THE QUIET PATH",
    challengeTitle: "리듬의 길",
    openProgress: "여정 열기",
    gateDayPrefix: "제",
    gateDaySuffix: "의 문",
    communityEyebrow: "함께 걷는 사람들",
    communityTitle: "함께 걷는 사람들",
    communityBody: "매일의 작은 회복과 조용한 깨달음을, 같은 길을 걷는 사람들과 나눌 수 있습니다.",
    communityCta: "함께 걷는 사람들로",
    eventsEyebrow: "다가오는 모임",
    upgradeCta: "플랜 업그레이드",
    registeredEmail: "등록 이메일",
    dayLabel: "Day",
    streakUnit: "일",
    insightReady: "자신에게 돌아오는 시간이 여기에 있습니다.",
    plans: {
      free: "Free 회원",
      basic: "Basic 회원",
      growth: "Growth 회원",
      inner_circle: "Inner Circle 회원"
    },
    challengeDays: ["멈춤의 정원", "호흡의 길", "몸의 숲길", "감정의 호수", "생각의 언덕", "감사의 전망대", "본래의 나"],
    events: ["매주 수요일 06:30 아침 라이브 명상", "토요일 21:00 수면 회복 세션"]
  },
  en: {
    eyebrow: "QUIET RECORDS",
    title: "Quiet Records",
    challengeStartedTitle: "Your challenge has started",
    description:
      "Your plan, journey path, fellow walkers, and upcoming gatherings live here quietly when you need them.",
    leaderEyebrow: "Leader Program",
    leaderTitle: "You have been invited to the leader program",
    leaderBody:
      "Your steady practice, check-ins, and community contribution have reached the next threshold.",
    currentPlan: "Today’s Rhythm",
    checkingMembership: "Preparing your rhythm space.",
    challengeProgress: "Journey Day",
    streakCount: "Days of Practice",
    aiUsage: "Today’s Insight",
    challengeEyebrow: "THE QUIET PATH",
    challengeTitle: "The Quiet Path",
    openProgress: "Open the path",
    gateDayPrefix: "Gate ",
    gateDaySuffix: "",
    communityEyebrow: "People Walking Together",
    communityTitle: "People Walking Together",
    communityBody:
      "Return to small daily recoveries, shared questions, and the companionship of people walking the same path.",
    communityCta: "Go to fellow walkers",
    eventsEyebrow: "Upcoming Gatherings",
    upgradeCta: "Upgrade plan",
    registeredEmail: "Registered email",
    dayLabel: "Day",
    streakUnit: "days",
    insightReady: "A quiet return to yourself is waiting here.",
    plans: {
      free: "Free",
      basic: "Basic Member",
      growth: "Growth Member",
      inner_circle: "Inner Circle Member"
    },
    challengeDays: ["Garden of Stillness", "Path of Breath", "Forest of Body", "Lake of Emotion", "Hill of Thought", "Viewpoint of Gratitude", "True Self"],
    events: ["Every Wednesday 06:30 Morning live meditation", "Saturday 21:00 Sleep recovery session"]
  }
} as const;

export function MemberDashboard({
  planKey,
  membershipResolved = true,
  membershipError = false,
  challengeDay = 1,
  streakCount,
  aiUsage,
  candidateLeader = false,
  communityUrl = "/community",
  challengeStarted = false,
  registeredEmail
}: MemberDashboardProps) {
  const copy = useLocaleCopy(dashboardCopy);
  const safeChallengeDay = Math.min(Math.max(challengeDay, 1), 7);
  const planLabel = membershipResolved && !membershipError ? copy.plans[planKey] : copy.checkingMembership;
  const progressHref = `/rhythm-journey?day=${safeChallengeDay}`;
  const hour = new Date().getHours();
  const todayRhythmLabel =
    hour >= 5 && hour <= 11
      ? copy.challengeDays[0]
      : hour >= 12 && hour <= 17
        ? copy.challengeDays[1]
        : copy.challengeDays[6];

  return (
    <div className="grid gap-6">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-gold/90">{copy.eyebrow}</p>
        <h1 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">
          {challengeStarted ? copy.challengeStartedTitle : copy.title}
        </h1>
        <p className="mt-4 text-base leading-8 text-white/72 sm:text-lg">{copy.description}</p>
      </div>

      {candidateLeader ? (
        <div className="rounded-lg border border-gold/40 bg-gold/10 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">{copy.leaderEyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{copy.leaderTitle}</h2>
          <p className="mt-2 text-sm leading-7 text-white/72">{copy.leaderBody}</p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <section id="journey-path" className="premium-card rounded-[28px] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gold">{copy.challengeEyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{copy.challengeTitle}</h2>
            </div>
            <Link href={progressHref} className="text-sm text-gold">
              {copy.openProgress}
            </Link>
          </div>
          <div className="relative mt-8 pl-6">
            <div className="absolute bottom-3 left-[11px] top-3 w-px bg-gradient-to-b from-gold/50 via-white/16 to-transparent" />
            {copy.challengeDays.map((title, index) => {
              const day = index + 1;
              const active = day === safeChallengeDay;
              const completed = day < safeChallengeDay;
              const dayHref = `/rhythm-journey?day=${day}`;

              return (
                <Link
                  key={day}
                  href={dayHref}
                  className={`group relative mb-3 block rounded-[22px] border px-4 py-4 text-sm ${
                    active
                      ? "border-gold/60 bg-gold/10 text-white shadow-[0_18px_40px_rgba(212,186,117,0.10)]"
                      : completed
                        ? "border-moss/40 bg-moss/10 text-white/88"
                        : "border-white/10 bg-white/[0.03] text-white/72"
                  } transition hover:-translate-y-0.5 hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-gold/40`}
                >
                  <span
                    className={`absolute -left-[25px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border ${
                      active
                        ? "border-gold bg-gold/80 shadow-[0_0_14px_rgba(212,186,117,0.5)]"
                        : completed
                          ? "border-moss/60 bg-moss/50"
                          : "border-white/18 bg-[#0a1524]"
                    }`}
                  />
                  <span className="block text-xs uppercase tracking-[0.24em] text-gold/72">
                    {copy.gateDayPrefix}
                    {day}
                    {copy.gateDaySuffix}
                  </span>
                  <span className="mt-2 block text-base font-semibold text-white">{title}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6">
          <div id="companions" className="premium-card rounded-lg p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">{copy.communityEyebrow}</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{copy.communityTitle}</h3>
            <p className="mt-3 text-sm leading-7 text-white/72">{copy.communityBody}</p>
            <Link
              href={communityUrl}
              className="mt-5 inline-flex rounded-md bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              {copy.communityCta}
            </Link>
          </div>

          <div className="premium-card rounded-lg p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">{copy.eventsEyebrow}</p>
            <div className="mt-4 grid gap-3">
              {copy.events.map((event) => (
                <div key={event} className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/82">
                  {event}
                </div>
              ))}
            </div>
            <Link
              href="/pricing"
              className="mt-5 inline-flex rounded-md border border-gold/50 px-4 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10"
            >
              {copy.upgradeCta}
            </Link>
          </div>
        </section>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="premium-card rounded-[24px] border border-gold/14 bg-[radial-gradient(circle_at_top,rgba(232,196,118,0.16),transparent_44%),linear-gradient(180deg,rgba(18,30,48,0.88),rgba(10,20,34,0.92))] p-5">
          <p className="text-sm text-white/60">{copy.currentPlan}</p>
          <p className="mt-2 text-2xl font-semibold text-white">✦ {todayRhythmLabel}</p>
          <p className="mt-2 text-sm text-white/58">{planLabel}</p>
        </div>
        <div className="premium-card rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,27,43,0.9),rgba(10,18,30,0.9))] p-5">
          <p className="text-sm text-white/60">{copy.challengeProgress}</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {copy.dayLabel} {safeChallengeDay}/7
          </p>
        </div>
        <div className="premium-card rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,32,36,0.9),rgba(10,22,26,0.92))] p-5">
          <p className="text-sm text-white/60">{copy.streakCount}</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {streakCount} {copy.streakUnit}
          </p>
        </div>
        <div className="premium-card rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,26,44,0.9),rgba(11,18,30,0.92))] p-5">
          <p className="text-sm text-white/60">{copy.aiUsage}</p>
          <p className="mt-2 text-base leading-7 text-white/82">{copy.insightReady}</p>
          <p className="mt-3 text-sm text-white/50">
            AI {aiUsage.used}/{aiUsage.limit === "unlimited" ? "∞" : aiUsage.limit}
          </p>
        </div>
      </section>

      {registeredEmail ? <p className="text-sm text-white/50">{copy.registeredEmail}: {registeredEmail}</p> : null}
    </div>
  );
}
