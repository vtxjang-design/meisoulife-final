import { challengeDays } from "@/lib/content";

export function getMockDashboard() {
  return {
    plan: "Free",
    challengeDay: 1,
    streakCount: 3,
    aiUsage: { used: 1, limit: 3 },
    upcomingEvents: [
      "毎週水曜 06:30 朝ライブ瞑想",
      "土曜 21:00 睡眠回復セッション"
    ],
    challengeProgress: challengeDays.map((item) => ({
      ...item,
      completed: item.day < 1
    })),
    communityLinks: {
      free: process.env.LINE_FREE_INVITE_URL || "#",
      paid: process.env.LINE_MEMBER_INVITE_URL || "#"
    }
  };
}

export function getMockAdminMetrics() {
  return {
    totalUsers: 1248,
    paidUsers: 289,
    mrr: "¥716,000",
    churn: "4.8%",
    dailySignups: 37,
    challengeCompletionRate: "43%",
    topTrafficSources: [
      "YouTube Shorts",
      "Instagram Reels",
      "LINE友だち紹介"
    ],
    mostConvertingContent: [
      "朝3分で、心が整う。",
      "眠れない夜の3分呼吸",
      "頑張りすぎる人のための瞑想"
    ]
  };
}
