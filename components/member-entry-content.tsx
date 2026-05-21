"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n";

type MemberEntryContentProps = {
  lineUrl: string;
  debug?: boolean;
  hasSupabaseUrl: boolean;
  hasSupabaseAnonKey: boolean;
  isLoggedInInitially: boolean;
  initialPlan: "free" | "basic" | "growth" | "inner_circle";
  initialEmail: string;
};

type AuthState = "idle" | "sending" | "sent" | "error" | "unavailable";

type MagicLinkApiResult = {
  success: boolean;
  message?: string;
  error?: string;
  env?: {
    supabaseUrlExists: boolean;
    supabaseKeyExists: boolean;
  };
};

type AuthDebugResult = {
  supabaseUrlExists: boolean;
  supabaseKeyExists: boolean;
  siteUrl: string;
};

const memberEntryCopy = {
  jp: {
    badge: "Member Entrance",
    title: "おかえりなさい。今日の1分から始めましょう。",
    description:
      "ここは、決済後も無理なく戻ってこられる静かな入口です。今日の1分、7日リズム、LINEサポートから、今の自分に合う一歩を選べます。",
    actions: {
      minute: "今日の1分を始める",
      rhythm: "7日リズムを見る",
      line: "LINEでサポートを受ける",
      login: "ログインする",
      dashboard: "メンバーの続きへ進む",
      myProgram: "私のプログラムへ",
      community: "共に続ける場を見る"
    },
    lineNote: "決済済みの方も、まずはLINEから静かにサポートを受けられます。",
    fallback:
      "ログイン機能を調整中です。決済済みの方はLINEからサポートを受けられます。",
    supportCta: "決済済みです。LINEで確認する",
    loginTitle: "メールでログインリンクを受け取る",
    loginDescription:
      "登録したメールアドレスに、メンバーページへ戻るためのマジックリンクをお送りします。",
    emailPlaceholder: "you@example.com",
    emailLabel: "メールアドレス",
    submit: "ログインリンクを送る",
    submitLoading: "送信中...",
    sentMessage: "ログインリンクを送信しました。メールをご確認ください。",
    errorMessage:
      "ログインリンクを送れませんでした。しばらくしてからもう一度お試しください。",
    unavailableMessage:
      "今はログインを開けませんが、LINEからサポートを受ければ次の案内につながれます。",
    loggedIn: "ログイン済みです。続きから静かに始められます。",
    inboxHelp:
      "メールが届かない場合は、迷惑メールをご確認ください。解決しない場合はLINEでサポートします。",
    invalidEmail: "有効なメールアドレスを入力してください。",
    sentBox:
      "ログインリンクを送信しました。メールをご確認ください。迷惑メールもご確認ください。",
    loggedInBox: "ログインできました。今日の1分から始めましょう。",
    planLabel: "現在の段階",
    planLabels: {
      free: "Free",
      basic: "Basic / Life Rhythm",
      growth: "Growth / Brain Owner",
      inner_circle: "Inner Circle / Coexistence Circle"
    },
    dashboard: {
      eyebrow: "Daily Life OS",
      title: "今日の回復から、共に目覚める流れへ",
      description:
        "1分の回復、毎日のリズム、脳の主人として生きる感覚、共生の実践、そして大きなビジョンまでを、今日の一歩としてまとめています。",
      journeyTitle: "今日のプラットフォーム・ジャーニー",
      journeySteps: ["1分の回復", "毎日のリズム", "脳の主人", "共生", "文明"],
      stateTitle: "今日の心の状態",
      stateDescription: "今いちばん近い感覚をひとつ選ぶだけで大丈夫です。",
      states: [
        {
          key: "anxiety",
          label: "不安がある",
          support: "まずは長く吐く呼吸で、心のスピードを少しゆるめましょう。"
        },
        {
          key: "overload",
          label: "頭がいっぱい",
          support: "考えを減らすより、身体感覚に戻る1分が役立つかもしれません。"
        },
        {
          key: "tired",
          label: "疲れている",
          support: "がんばるより、今は静かに力を戻す選択が大切です。"
        },
        {
          key: "lonely",
          label: "少し孤独",
          support: "ひとりで耐えなくて大丈夫です。つながる入口を開いておきましょう。"
        }
      ],
      recoveryTitle: "おすすめの1分リカバリー",
      recoveryDescription: "今日の状態に合わせて、最もやさしい入口から始めます。",
      recoveryCta: "1分リカバリーを始める",
      rhythmTitle: "Daily Rhythm Score",
      rhythmDescription: "完璧さではなく、今日どれだけ自分に戻れたかを静かに見る指標です。",
      rhythmScoreLabel: "今日のスコア",
      rhythmItems: [
        "☀ 身体を軽く起こす",
        "🧠 集中をリセットする",
        "❤️ 感謝をひとつ見つける",
        "🌿 自然を1分感じる"
      ],
      bosTitle: "BOS Reflection",
      bosDescription: "Brain Operating System の問いで、今日は何が自分を動かしたかを見つめます。",
      bosQuestions: [
        "今日、私の脳を動かしていたのは何でしたか？",
        "私は何を選び直せますか？",
        "今、自分の主人として戻れているでしょうか？"
      ],
      coexistenceTitle: "今日の共生アクション",
      coexistenceDescription:
        "回復は一人で終わりません。小さな優しさやつながりが、共生文化の始まりになります。",
      coexistenceAction: "誰かに、短くても温かい一言を送る",
      founderTitle: "今日の創始者の言葉",
      founderDescription:
        "45年の実践が伝えてきたのは、人はいつでも再び回復し、目覚め直せるという希望です。",
      founderWisdoms: [
        "小さな実践は、人生のリズムを変える力になります。",
        "AI時代だからこそ、人間の温かさが未来を決めます。",
        "共に目覚める文化は、一人の静かな実践から始まります。"
      ]
    },
    debug: {
      title: "接続確認",
      supabaseUrl: "Supabase URL",
      anonKey: "Anon key",
      serverApi: "Server API result",
      authDebug: "Auth debug API",
      origin: "Current origin",
      lastError: "Last error",
      yes: "yes",
      no: "no",
      none: "none"
    }
  },
  kr: {
    badge: "Member Entrance",
    title: "다시 오신 것을 환영합니다. 오늘의 1분부터 시작해볼까요?",
    description:
      "이곳은 결제 후에도 부담 없이 다시 돌아올 수 있는 조용한 입구입니다. 오늘의 1분, 7일 리듬, LINE 지원 중 지금의 나에게 맞는 한 걸음을 고를 수 있습니다.",
    actions: {
      minute: "오늘의 1분 시작하기",
      rhythm: "7일 리듬 보기",
      line: "LINE으로 지원받기",
      login: "로그인하기",
      dashboard: "멤버 이어서 보기",
      myProgram: "나의 프로그램 가기",
      community: "함께 이어가는 곳 보기"
    },
    lineNote: "결제하신 분도 먼저 LINE에서 조용히 안내를 받을 수 있습니다.",
    fallback:
      "로그인 기능을 조정중입니다. 결제하신 분은 LINE에서 지원을 받을 수 있습니다.",
    supportCta: "결제 완료했습니다. LINE으로 확인하기",
    loginTitle: "이메일로 로그인 링크 받기",
    loginDescription:
      "등록한 이메일 주소로 멤버 페이지로 돌아오는 매직 링크를 보내드립니다.",
    emailPlaceholder: "you@example.com",
    emailLabel: "이메일 주소",
    submit: "로그인 링크 보내기",
    submitLoading: "보내는 중...",
    sentMessage: "로그인 링크를 보냈습니다. 이메일을 확인해주세요.",
    errorMessage:
      "로그인 링크를 보내지 못했습니다. 잠시 후 다시 시도해 주세요.",
    unavailableMessage:
      "지금은 로그인 연결이 원활하지 않지만, LINE 지원으로 다음 안내를 받으실 수 있습니다.",
    loggedIn: "이미 로그인되어 있습니다. 이어서 조용히 시작하실 수 있습니다.",
    inboxHelp:
      "메일이 보이지 않으면 스팸함을 확인해주세요. 그래도 해결되지 않으면 LINE으로 도와드리겠습니다.",
    invalidEmail: "올바른 이메일 주소를 입력해주세요.",
    sentBox:
      "로그인 링크를 보냈습니다. 이메일을 확인해주세요. 스팸함도 함께 확인해주세요.",
    loggedInBox: "로그인되었습니다. 오늘의 1분부터 시작해볼까요?",
    planLabel: "현재 단계",
    planLabels: {
      free: "Free",
      basic: "Basic / Life Rhythm",
      growth: "Growth / Brain Owner",
      inner_circle: "Inner Circle / Coexistence Circle"
    },
    dashboard: {
      eyebrow: "Daily Life OS",
      title: "오늘의 회복에서 함께 깨어나는 흐름으로",
      description:
        "1분 회복, 일상의 리듬, 뇌의 주인으로 살아가는 감각, 공생의 실천, 그리고 더 큰 비전까지 오늘의 한 걸음으로 이어줍니다.",
      journeyTitle: "오늘의 플랫폼 여정",
      journeySteps: ["1분 회복", "일상 리듬", "뇌의 주인", "공생", "문명"],
      stateTitle: "오늘의 마음 상태",
      stateDescription: "지금 가장 가까운 감각 하나만 골라도 충분합니다.",
      states: [
        {
          key: "anxiety",
          label: "불안해요",
          support: "먼저 길게 내쉬는 호흡으로 마음의 속도를 조금 늦춰보세요."
        },
        {
          key: "overload",
          label: "머리가 복잡해요",
          support: "생각을 줄이기보다 몸의 감각으로 돌아오는 1분이 도움이 될 수 있습니다."
        },
        {
          key: "tired",
          label: "지쳐 있어요",
          support: "지금은 더 애쓰기보다 조용히 힘을 회복하는 선택이 중요합니다."
        },
        {
          key: "lonely",
          label: "조금 외로워요",
          support: "혼자 버티지 않아도 됩니다. 연결의 입구를 열어둘게요."
        }
      ],
      recoveryTitle: "추천 1분 리커버리",
      recoveryDescription: "지금 상태에 맞는 가장 부드러운 시작점부터 안내합니다.",
      recoveryCta: "1분 리커버리 시작",
      rhythmTitle: "Daily Rhythm Score",
      rhythmDescription: "완벽함보다 오늘 얼마나 나에게 다시 돌아왔는지를 조용히 보는 지표입니다.",
      rhythmScoreLabel: "오늘의 점수",
      rhythmItems: [
        "☀ 몸을 가볍게 깨우기",
        "🧠 집중 리셋하기",
        "❤️ 감사 한 가지 찾기",
        "🌿 자연을 1분 느끼기"
      ],
      bosTitle: "BOS Reflection",
      bosDescription: "Brain Operating System 질문으로 오늘 무엇이 나를 움직였는지 돌아봅니다.",
      bosQuestions: [
        "오늘 내 뇌를 움직이고 있던 것은 무엇이었나요?",
        "나는 무엇을 다시 선택할 수 있나요?",
        "지금 나는 나의 주인으로 돌아와 있나요?"
      ],
      coexistenceTitle: "오늘의 공생 액션",
      coexistenceDescription:
        "회복은 혼자 끝나지 않습니다. 작은 친절과 연결이 공생 문화의 시작이 됩니다.",
      coexistenceAction: "누군가에게 짧아도 따뜻한 한마디를 전하기",
      founderTitle: "오늘의 창립자 메시지",
      founderDescription:
        "45년의 실천이 전하는 핵심은, 사람은 언제든 다시 회복하고 깨어날 수 있다는 희망입니다.",
      founderWisdoms: [
        "작은 실천이 삶의 리듬을 바꾸는 힘이 됩니다.",
        "AI 시대일수록 인간의 따뜻함이 미래를 결정합니다.",
        "함께 깨어나는 문화는 한 사람의 조용한 실천에서 시작됩니다."
      ]
    },
    debug: {
      title: "연결 확인",
      supabaseUrl: "Supabase URL",
      anonKey: "Anon key",
      serverApi: "Server API result",
      authDebug: "Auth debug API",
      origin: "Current origin",
      lastError: "Last error",
      yes: "yes",
      no: "no",
      none: "none"
    }
  },
  en: {
    badge: "Member Entrance",
    title: "Welcome back. Let’s begin with today’s one minute.",
    description:
      "This is a calm doorway you can return to after payment without pressure. Choose the next step that fits today: one minute, the 7-day rhythm, or LINE support.",
    actions: {
      minute: "Start today's minute",
      rhythm: "See the 7-day rhythm",
      line: "Get support on LINE",
      login: "Log in",
      dashboard: "Continue as a member",
      myProgram: "Open my program",
      community: "See the shared path"
    },
    lineNote: "Paid members can always receive gentle support through LINE first.",
    fallback:
      "We are still tuning the login flow. If you have already paid, you can receive support through LINE.",
    supportCta: "I already paid. Check on LINE",
    loginTitle: "Receive a magic login link by email",
    loginDescription:
      "We will send a magic link to the email address you used so you can return to your member page.",
    emailPlaceholder: "you@example.com",
    emailLabel: "Email address",
    submit: "Send login link",
    submitLoading: "Sending...",
    sentMessage: "Login link sent. Please check your email.",
    errorMessage:
      "We could not send the login link. Please try again in a moment.",
    unavailableMessage:
      "Login is not available right now, but LINE support can guide you to your next step.",
    loggedIn: "You are already logged in. You can quietly continue from here.",
    inboxHelp:
      "If the email does not arrive, please check your spam folder. If it still does not appear, LINE support can help.",
    invalidEmail: "Please enter a valid email address.",
    sentBox:
      "Login link sent. Please check your email. Please also check your spam folder.",
    loggedInBox: "You are logged in. Start with today’s one minute.",
    planLabel: "Current layer",
    planLabels: {
      free: "Free",
      basic: "Basic / Life Rhythm",
      growth: "Growth / Brain Owner",
      inner_circle: "Inner Circle / Coexistence Circle"
    },
    dashboard: {
      eyebrow: "Daily Life OS",
      title: "From today’s recovery to a shared rhythm of awakening",
      description:
        "This dashboard gathers one-minute recovery, daily rhythm, brain ownership, coexistence practice, and the deeper vision into one calm next step.",
      journeyTitle: "Today’s platform journey",
      journeySteps: ["1-minute recovery", "daily rhythm", "brain ownership", "coexistence", "civilization"],
      stateTitle: "How are you feeling today?",
      stateDescription: "Choose the state that feels closest right now.",
      states: [
        {
          key: "anxiety",
          label: "Anxious",
          support: "Begin with a longer exhale and let the pace inside you soften a little."
        },
        {
          key: "overload",
          label: "Overloaded",
          support: "Instead of forcing clarity, one minute in the body may help you return."
        },
        {
          key: "tired",
          label: "Exhausted",
          support: "Today may be less about pushing and more about quietly restoring strength."
        },
        {
          key: "lonely",
          label: "Lonely",
          support: "You do not have to hold everything alone. Let connection stay open."
        }
      ],
      recoveryTitle: "Recommended 1-minute recovery",
      recoveryDescription: "Start with the gentlest recovery point for your current state.",
      recoveryCta: "Start 1-minute recovery",
      rhythmTitle: "Daily Rhythm Score",
      rhythmDescription:
        "Not a measure of perfection, but a quiet way to see how often you returned to yourself today.",
      rhythmScoreLabel: "Today’s score",
      rhythmItems: [
        "☀ Wake up the body",
        "🧠 Reset focus",
        "❤️ Find one gratitude",
        "🌿 Feel nature for one minute"
      ],
      bosTitle: "BOS Reflection",
      bosDescription:
        "Use the Brain Operating System questions to notice what guided your mind today.",
      bosQuestions: [
        "What was controlling my brain today?",
        "What can I choose again now?",
        "Am I returning as the owner of my mind?"
      ],
      coexistenceTitle: "Today’s coexistence action",
      coexistenceDescription:
        "Recovery does not end with the self. A small act of warmth can begin coexistence.",
      coexistenceAction: "Send one short but warm message to someone today",
      founderTitle: "Founder wisdom of the day",
      founderDescription:
        "Forty-five years of practice point to one hopeful truth: people can recover, awaken, and begin again.",
      founderWisdoms: [
        "Small daily actions can change the rhythm of a life.",
        "In the AI era, human warmth will matter even more.",
        "A culture of awakening together begins with one quiet practice."
      ]
    },
    debug: {
      title: "Connection check",
      supabaseUrl: "Supabase URL",
      anonKey: "Anon key",
      serverApi: "Server API result",
      authDebug: "Auth debug API",
      origin: "Current origin",
      lastError: "Last error",
      yes: "yes",
      no: "no",
      none: "none"
    }
  }
} as const;

export function MemberEntryContent({
  lineUrl,
  debug = false,
  hasSupabaseUrl,
  hasSupabaseAnonKey,
  isLoggedInInitially,
  initialPlan,
  initialEmail
}: MemberEntryContentProps) {
  const { language } = useLanguage();
  const copy = memberEntryCopy[language];
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [email, setEmail] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn] = useState(isLoggedInInitially);
  const [selectedStateKey, setSelectedStateKey] = useState("anxiety");
  const [lastError, setLastError] = useState("");
  const [lastApiResult, setLastApiResult] = useState("");
  const [apiResponse, setApiResponse] = useState<MagicLinkApiResult | null>(null);
  const [authDebugResponse, setAuthDebugResponse] = useState<AuthDebugResult | null>(null);
  const [currentOrigin, setCurrentOrigin] = useState("");
  const debugEnabled = process.env.NODE_ENV !== "production" || debug;
  const recommendedProgramHref =
    initialPlan === "growth"
      ? "/program/growth"
      : initialPlan === "inner_circle"
        ? "/program/inner"
        : "/program/basic";
  const founderWisdom = copy.dashboard.founderWisdoms[new Date().getDay() % copy.dashboard.founderWisdoms.length];
  const selectedState =
    copy.dashboard.states.find((state) => state.key === selectedStateKey) ?? copy.dashboard.states[0];
  const rhythmScore = initialPlan === "inner_circle" ? 88 : initialPlan === "growth" ? 74 : initialPlan === "basic" ? 62 : 40;

  useEffect(() => {
    setCurrentOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!debugEnabled) {
      return;
    }

    let active = true;

    async function loadAuthDebug() {
      try {
        const response = await fetch("/api/auth-debug");
        const data = (await response.json()) as AuthDebugResult;

        if (!active) {
          return;
        }

        setAuthDebugResponse(data);
      } catch (error) {
        if (!active) {
          return;
        }

        setLastError(error instanceof Error ? error.message : "Unknown error");
      }
    }

    loadAuthDebug();

    return () => {
      active = false;
    };
  }, [debugEnabled]);

  const statusMessage = useMemo(() => {
    if (isLoggedIn) {
      return copy.loggedIn;
    }

    if (authState === "sent") {
      return copy.sentMessage;
    }

    if (authState === "error") {
      return lastError ? `${copy.errorMessage} (${lastError})` : copy.errorMessage;
    }

    if (authState === "unavailable") {
      return copy.unavailableMessage;
    }

    return copy.fallback;
  }, [authState, copy, isLoggedIn, lastError]);

  async function handleMagicLinkSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setLastError(copy.invalidEmail);
      setAuthState("error");
      return;
    }

    if (!hasSupabaseUrl || !hasSupabaseAnonKey) {
      setLastError("Supabase server env unavailable");
      setAuthState("unavailable");
      return;
    }

    setAuthState("sending");
    setLastError("");
    setLastApiResult("");
    setApiResponse(null);

    try {
      const response = await fetch("/api/send-magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: normalizedEmail })
      });

      const data = (await response.json()) as MagicLinkApiResult;

      setLastApiResult(data.success ? "success" : "error");
      setApiResponse(data);

      if (!response.ok || !data.success) {
        setLastError(data.error || "Unknown error");
        setAuthState("error");
        return;
      }

      setAuthState("sent");
    } catch (error) {
      console.error("Unexpected magic link error:", error);
      setLastError(error instanceof Error ? error.message : "Unknown error");
      setAuthState("error");
    }
  }

  return (
    <div className="section-shell py-12 sm:py-16">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.14),transparent_22%),linear-gradient(180deg,#0a1716_0%,#0d1824_54%,#08131d_100%)] px-5 py-8 shadow-[0_28px_90px_rgba(7,17,31,0.28)] sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-gold/20 bg-gold/[0.08] px-4 py-2 text-sm font-medium text-gold">
            {copy.badge}
          </div>
          <h1 className="mt-5 font-serif text-3xl leading-tight text-white sm:text-4xl">{copy.title}</h1>
          <p className="mt-4 text-sm leading-8 text-white/74 sm:text-base">{copy.description}</p>
        </div>

        {isLoggedIn ? (
          <div className="mx-auto mt-8 max-w-5xl space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-gold/80">{copy.dashboard.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{copy.dashboard.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">{copy.dashboard.description}</p>
                </div>
                <div className="rounded-[24px] border border-gold/20 bg-gold/[0.08] px-4 py-4 text-left">
                  <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.planLabel}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{copy.planLabels[initialPlan]}</p>
                  <p className="mt-2 text-sm text-white/62">{initialEmail || copy.loggedInBox}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.dashboard.journeyTitle}</p>
                </div>
                <span className="text-xs text-white/48">Life OS</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-5">
                {copy.dashboard.journeySteps.map((step, index) => (
                  <div
                    key={step}
                    className="rounded-[20px] border border-white/10 bg-[#0b1520] px-4 py-3 text-sm text-white/74"
                  >
                    <span className="mr-2 text-gold/80">0{index + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <h3 className="text-xl font-semibold text-white">{copy.dashboard.stateTitle}</h3>
                <p className="mt-3 text-sm leading-7 text-white/68">{copy.dashboard.stateDescription}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {copy.dashboard.states.map((state) => {
                    const active = selectedState.key === state.key;

                    return (
                      <button
                        key={state.key}
                        type="button"
                        onClick={() => setSelectedStateKey(state.key)}
                        className={`rounded-[22px] border px-4 py-4 text-left text-sm transition duration-300 ${
                          active
                            ? "border-gold/40 bg-gold/[0.10] text-white shadow-[0_14px_30px_rgba(212,186,117,0.08)]"
                            : "border-white/10 bg-[#09131d] text-white/74 hover:bg-white/[0.05]"
                        }`}
                      >
                        <p className="font-medium">{state.label}</p>
                        <p className="mt-2 leading-6 text-white/58">{state.support}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[28px] border border-gold/20 bg-[linear-gradient(180deg,rgba(212,186,117,0.12),rgba(255,255,255,0.02))] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.dashboard.recoveryTitle}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{selectedState.label}</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">{copy.dashboard.recoveryDescription}</p>
                <p className="mt-4 rounded-[22px] border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-white/78">
                  {selectedState.support}
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <Link
                    href="/#one-minute-meditation"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
                  >
                    {copy.dashboard.recoveryCta}
                  </Link>
                  <Link
                    href={recommendedProgramHref}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
                  >
                    {copy.actions.myProgram}
                  </Link>
                </div>
              </section>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.dashboard.rhythmTitle}</p>
                    <p className="mt-3 text-sm leading-7 text-white/68">{copy.dashboard.rhythmDescription}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/48">{copy.dashboard.rhythmScoreLabel}</p>
                    <p className="mt-1 text-3xl font-semibold text-white">{rhythmScore}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  {copy.dashboard.rhythmItems.map((item) => (
                    <div key={item} className="rounded-[18px] border border-white/10 bg-[#0a141d] px-4 py-3 text-sm text-white/74">
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.dashboard.bosTitle}</p>
                <p className="mt-3 text-sm leading-7 text-white/68">{copy.dashboard.bosDescription}</p>
                <div className="mt-5 space-y-3">
                  {copy.dashboard.bosQuestions.map((question) => (
                    <div key={question} className="rounded-[18px] border border-white/10 bg-[#0a141d] px-4 py-4 text-sm leading-7 text-white/78">
                      {question}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.dashboard.coexistenceTitle}</p>
                <p className="mt-3 text-sm leading-7 text-white/68">{copy.dashboard.coexistenceDescription}</p>
                <div className="mt-5 rounded-[22px] border border-gold/20 bg-gold/[0.08] px-4 py-4 text-sm leading-7 text-white/86">
                  {copy.dashboard.coexistenceAction}
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/community"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
                  >
                    {copy.actions.community}
                  </Link>
                  <a
                    href={lineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-gold/20 bg-gold/[0.08] px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12]"
                  >
                    {copy.actions.line}
                  </a>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.dashboard.founderTitle}</p>
                <p className="mt-3 text-sm leading-7 text-white/68">{copy.dashboard.founderDescription}</p>
                <blockquote className="mt-5 rounded-[22px] border border-white/10 bg-black/15 px-4 py-4 text-base leading-8 text-white/86">
                  {founderWisdom}
                </blockquote>
              </section>
            </div>
          </div>
        ) : null}

        <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
          <Link
            href="/#one-minute-meditation"
            className="relative z-20 inline-flex min-h-[60px] items-center justify-center rounded-[24px] bg-gold px-5 py-4 text-center text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
          >
            {copy.actions.minute}
          </Link>
          <Link
            href="/#rhythm-challenge"
            className="relative z-20 inline-flex min-h-[60px] items-center justify-center rounded-[24px] border border-white/12 bg-white/[0.04] px-5 py-4 text-center text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
          >
            {copy.actions.rhythm}
          </Link>
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-20 inline-flex min-h-[60px] items-center justify-center rounded-[24px] border border-gold/20 bg-gold/[0.08] px-5 py-4 text-center text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12]"
          >
            {copy.actions.line}
          </a>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="relative z-20 inline-flex min-h-[60px] items-center justify-center rounded-[24px] border border-white/12 bg-white/[0.04] px-5 py-4 text-center text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
            >
              {copy.actions.dashboard}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogin((current) => !current)}
              className="relative z-20 inline-flex min-h-[60px] cursor-pointer items-center justify-center rounded-[24px] border border-white/12 bg-white/[0.04] px-5 py-4 text-center text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
            >
              {copy.actions.login}
            </button>
          )}
        </div>

        <div className="mx-auto mt-4 max-w-4xl rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm leading-7 text-white/78">{statusMessage}</p>
          <p className="mt-2 text-sm leading-7 text-white/60">{copy.lineNote}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-gold/20 bg-gold/[0.08] px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12]"
            >
              {copy.supportCta}
            </a>
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
              >
                {copy.actions.dashboard}
              </Link>
            ) : null}
          </div>
        </div>

        {!isLoggedIn && showLogin ? (
          <div className="mx-auto mt-5 max-w-4xl rounded-[24px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-white">{copy.loginTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-white/68">{copy.loginDescription}</p>
            <form onSubmit={handleMagicLinkSubmit} className="mt-5">
              <label className="block">
                <span className="text-sm font-medium text-white/78">{copy.emailLabel}</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={copy.emailPlaceholder}
                  className="mt-2 min-h-[52px] w-full rounded-2xl border border-white/12 bg-[#09131d] px-4 py-3 text-base text-white outline-none transition duration-300 placeholder:text-white/28 focus:border-gold/40"
                />
              </label>
              {authState === "sent" ? (
                <div className="mt-4 rounded-2xl border border-emerald-300/18 bg-emerald-400/[0.08] px-4 py-4 text-sm leading-7 text-emerald-100">
                  {copy.sentBox}
                </div>
              ) : null}
              {authState === "error" ? (
                <div className="mt-4 rounded-2xl border border-rose-300/18 bg-rose-400/[0.08] px-4 py-4 text-sm leading-7 text-rose-100">
                  {lastError || copy.errorMessage}
                </div>
              ) : null}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={authState === "sending"}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {authState === "sending" ? copy.submitLoading : copy.submit}
                </button>
                <a
                  href={lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
                >
                  {copy.supportCta}
                </a>
              </div>
            </form>
            {apiResponse ? (
              <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-[#07111a] p-3 text-xs leading-6 text-white/72">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            ) : null}
            <p className="mt-4 text-sm leading-7 text-white/56">{copy.inboxHelp}</p>
            {debugEnabled ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-4 text-left text-sm text-white/66">
                <p className="font-semibold text-white/84">{copy.debug.title}</p>
                <dl className="mt-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <dt>{copy.debug.supabaseUrl}</dt>
                    <dd>{hasSupabaseUrl ? copy.debug.yes : copy.debug.no}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>{copy.debug.anonKey}</dt>
                    <dd>{hasSupabaseAnonKey ? copy.debug.yes : copy.debug.no}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>{copy.debug.serverApi}</dt>
                    <dd>{lastApiResult || copy.debug.none}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>{copy.debug.origin}</dt>
                    <dd className="max-w-[60%] truncate text-right">{currentOrigin || copy.debug.none}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>{copy.debug.authDebug}</dt>
                    <dd className="max-w-[60%] truncate text-right">
                      {authDebugResponse ? JSON.stringify(authDebugResponse) : copy.debug.none}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>{copy.debug.lastError}</dt>
                    <dd className="max-w-[60%] truncate text-right">{lastError || copy.debug.none}</dd>
                  </div>
                </dl>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
