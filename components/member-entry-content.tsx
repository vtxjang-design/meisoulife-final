"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useLanguage } from "@/lib/i18n";
import {
  SUPABASE_BROWSER_ANON_KEY,
  SUPABASE_BROWSER_URL
} from "@/lib/supabase/client";

type MemberEntryContentProps = {
  lineUrl: string;
  debug?: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

type AuthState = "idle" | "sending" | "sent" | "error" | "unavailable";

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
      dashboard: "メンバーの続きへ進む"
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
    debug: {
      title: "接続確認",
      supabaseUrl: "Supabase URL",
      anonKey: "Anon key",
      browserClient: "Browser client",
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
      dashboard: "멤버 이어서 보기"
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
    debug: {
      title: "연결 확인",
      supabaseUrl: "Supabase URL",
      anonKey: "Anon key",
      browserClient: "Browser client",
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
      dashboard: "Continue as a member"
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
    debug: {
      title: "Connection check",
      supabaseUrl: "Supabase URL",
      anonKey: "Anon key",
      browserClient: "Browser client",
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
  supabaseUrl = "",
  supabaseAnonKey = ""
}: MemberEntryContentProps) {
  const { language } = useLanguage();
  const copy = memberEntryCopy[language];
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [email, setEmail] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastError, setLastError] = useState("");
  const [hasSupabaseUrl, setHasSupabaseUrl] = useState(false);
  const [hasAnonKey, setHasAnonKey] = useState(false);
  const [hasBrowserClient, setHasBrowserClient] = useState(false);
  const [currentOrigin, setCurrentOrigin] = useState("");
  const debugEnabled = process.env.NODE_ENV !== "production" || debug;

  useEffect(() => {
    let active = true;

    async function loadSession() {
      setHasSupabaseUrl(Boolean(supabaseUrl || SUPABASE_BROWSER_URL));
      setHasAnonKey(Boolean(supabaseAnonKey || SUPABASE_BROWSER_ANON_KEY));
      setCurrentOrigin(window.location.origin);

      const supabase = getSupabaseBrowserClient({
        url: supabaseUrl || undefined,
        anonKey: supabaseAnonKey || undefined
      });

      setHasBrowserClient(Boolean(supabase));

      if (!supabase) {
        if (active) {
          setAuthState((current) => (current === "sent" ? current : "unavailable"));
        }
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      setIsLoggedIn(Boolean(session?.user));
    }

    loadSession();

    return () => {
      active = false;
    };
  }, [supabaseAnonKey, supabaseUrl]);

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

    const supabase = getSupabaseBrowserClient({
      url: supabaseUrl || undefined,
      anonKey: supabaseAnonKey || undefined
    });

    if (!supabase) {
      setLastError("Supabase browser client unavailable");
      setAuthState("unavailable");
      return;
    }

    setAuthState("sending");
    setLastError("");
    console.log("Sending magic link", normalizedEmail);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/member`
        }
      });

      if (error) {
        console.error("Magic link error:", error);
        setLastError(error.message);
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
                    <dd>{hasAnonKey ? copy.debug.yes : copy.debug.no}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>{copy.debug.browserClient}</dt>
                    <dd>{hasBrowserClient ? copy.debug.yes : copy.debug.no}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>{copy.debug.origin}</dt>
                    <dd className="max-w-[60%] truncate text-right">{currentOrigin || copy.debug.none}</dd>
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
