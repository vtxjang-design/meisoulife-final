"use client";

import Link from "next/link";
import { useLocaleCopy } from "@/lib/i18n";

type PlanKey = "free" | "basic" | "growth" | "inner_circle";

type MemberDashboardProps = {
  planKey: PlanKey;
  membershipResolved?: boolean;
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
    eyebrow: "Dashboard",
    title: "会員ダッシュボード",
    challengeStartedTitle: "チャレンジを開始しました",
    description:
      "現在のプラン、チャレンジ進行、継続日数、AIコーチ利用状況、コミュニティ導線をひとつにまとめています。",
    leaderEyebrow: "Leader Program",
    leaderTitle: "リーダープログラムに招待されました",
    leaderBody:
      "継続実践、チェックイン、コミュニティ貢献が一定基準を超えました。次のステップへ進めます。",
    currentPlan: "現在のプラン",
    checkingMembership: "会員状態を確認しています...",
    challengeProgress: "チャレンジ進行",
    streakCount: "継続日数",
    aiUsage: "AIコーチ利用",
    challengeEyebrow: "Challenge",
    challengeTitle: "7日リズムの進行",
    openProgress: "進捗を開く",
    communityEyebrow: "Community",
    communityTitle: "コミュニティ導線",
    communityBody: "毎日のチェックイン、今日の小さな前進、質問、仲間とのつながりへすぐアクセスできます。",
    communityCta: "コミュニティへ",
    eventsEyebrow: "Upcoming live events",
    upgradeCta: "プランをアップグレード",
    registeredEmail: "登録メール",
    dayLabel: "Day",
    streakUnit: "日",
    plans: {
      free: "Free",
      basic: "Basic メンバー",
      growth: "Growth メンバー",
      inner_circle: "Inner Circle メンバー"
    },
    challengeDays: [
      "立ち止まる",
      "呼吸",
      "身体",
      "感情",
      "思考",
      "感謝",
      "本来の自分"
    ],
    events: ["毎週水曜 06:30 朝ライブ瞑想", "土曜 21:00 睡眠回復セッション"]
  },
  kr: {
    eyebrow: "Dashboard",
    title: "회원 대시보드",
    challengeStartedTitle: "챌린지를 시작했습니다",
    description:
      "현재 플랜, 챌린지 진행, 연속 실천, AI 코치 이용 현황, 커뮤니티 동선을 한곳에서 볼 수 있습니다.",
    leaderEyebrow: "Leader Program",
    leaderTitle: "리더 프로그램에 초대되었습니다",
    leaderBody: "지속 실천, 체크인, 커뮤니티 기여가 기준을 넘어 다음 단계로 나아갈 수 있습니다.",
    currentPlan: "현재 플랜",
    checkingMembership: "멤버십 상태를 확인하고 있습니다...",
    challengeProgress: "챌린지 진행",
    streakCount: "연속 실천",
    aiUsage: "AI 코치 이용",
    challengeEyebrow: "Challenge",
    challengeTitle: "7일 리듬 진행",
    openProgress: "진행 보기",
    communityEyebrow: "Community",
    communityTitle: "커뮤니티 동선",
    communityBody: "매일의 체크인, 오늘의 작은 전진, 질문, 함께 이어가는 연결로 바로 이동할 수 있습니다.",
    communityCta: "커뮤니티로",
    eventsEyebrow: "Upcoming live events",
    upgradeCta: "플랜 업그레이드",
    registeredEmail: "등록 이메일",
    dayLabel: "Day",
    streakUnit: "일",
    plans: {
      free: "Free",
      basic: "Basic 멤버",
      growth: "Growth 멤버",
      inner_circle: "Inner Circle 멤버"
    },
    challengeDays: ["멈추기", "호흡", "몸", "감정", "생각", "감사", "본래의 나"],
    events: ["매주 수요일 06:30 아침 라이브 명상", "토요일 21:00 수면 회복 세션"]
  },
  en: {
    eyebrow: "Dashboard",
    title: "Member Dashboard",
    challengeStartedTitle: "Your challenge has started",
    description:
      "Your current plan, challenge progress, streak count, AI coach usage, and community path are gathered in one place.",
    leaderEyebrow: "Leader Program",
    leaderTitle: "You have been invited to the leader program",
    leaderBody:
      "Your steady practice, check-ins, and community contribution have reached the next threshold.",
    currentPlan: "Current plan",
    checkingMembership: "Checking membership...",
    challengeProgress: "Challenge progress",
    streakCount: "Streak count",
    aiUsage: "AI coach usage",
    challengeEyebrow: "Challenge",
    challengeTitle: "7-day rhythm progress",
    openProgress: "Open progress",
    communityEyebrow: "Community",
    communityTitle: "Community path",
    communityBody:
      "Jump back into daily check-ins, small wins, questions, and the companionship that helps you continue.",
    communityCta: "Go to community",
    eventsEyebrow: "Upcoming live events",
    upgradeCta: "Upgrade plan",
    registeredEmail: "Registered email",
    dayLabel: "Day",
    streakUnit: "days",
    plans: {
      free: "Free",
      basic: "Basic Member",
      growth: "Growth Member",
      inner_circle: "Inner Circle Member"
    },
    challengeDays: ["Pause", "Breath", "Body", "Emotion", "Thoughts", "Gratitude", "Return to Self"],
    events: ["Every Wednesday 06:30 Morning live meditation", "Saturday 21:00 Sleep recovery session"]
  }
} as const;

export function MemberDashboard({
  planKey,
  membershipResolved = true,
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
  const planLabel = membershipResolved ? copy.plans[planKey] : copy.checkingMembership;

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="premium-card rounded-lg p-5">
          <p className="text-sm text-white/60">{copy.currentPlan}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{planLabel}</p>
        </div>
        <div className="premium-card rounded-lg p-5">
          <p className="text-sm text-white/60">{copy.challengeProgress}</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {copy.dayLabel} {safeChallengeDay}/7
          </p>
        </div>
        <div className="premium-card rounded-lg p-5">
          <p className="text-sm text-white/60">{copy.streakCount}</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {streakCount} {copy.streakUnit}
          </p>
        </div>
        <div className="premium-card rounded-lg p-5">
          <p className="text-sm text-white/60">{copy.aiUsage}</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {aiUsage.used}/{aiUsage.limit === "unlimited" ? "∞" : aiUsage.limit}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <section className="premium-card rounded-lg p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gold">{copy.challengeEyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{copy.challengeTitle}</h2>
            </div>
            <Link href="/challenge" className="text-sm text-gold">
              {copy.openProgress}
            </Link>
          </div>
          <div className="mt-6 grid gap-3">
            {copy.challengeDays.map((title, index) => {
              const day = index + 1;
              const active = day === safeChallengeDay;
              const completed = day < safeChallengeDay;

              return (
                <div
                  key={day}
                  className={`rounded-md border px-4 py-3 text-sm ${
                    active
                      ? "border-gold/60 bg-gold/10 text-white"
                      : completed
                        ? "border-moss/40 bg-moss/10 text-white/88"
                        : "border-white/10 bg-white/[0.03] text-white/68"
                  }`}
                >
                  {copy.dayLabel} {day} · {title}
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6">
          <div className="premium-card rounded-lg p-6">
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

      {registeredEmail ? <p className="text-sm text-white/50">{copy.registeredEmail}: {registeredEmail}</p> : null}
    </div>
  );
}
