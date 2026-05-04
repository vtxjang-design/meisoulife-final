"use client";

import { useEffect, useMemo, useState } from "react";
import OneMinuteMeditation from "@/components/one-minute-meditation";

const MEMBER_RETURNED_KEY = "meisoulife_member_returned";
const LINE_CONNECT_URL = process.env.NEXT_PUBLIC_LINE_FREE_URL || "https://lin.ee/z8Lzvvs";

type Language = "ja" | "ko" | "en";

const copy = {
  ja: {
    eyebrow: "Welcome back",
    firstTitle: "おかえりなさい。\nここからは、途切れないリズムです。",
    returningTitle: "おかえりなさい。\n今日も1分だけ整えましょう。",
    body: "何かを買ったのではなく、自分に戻る場所へ静かに帰ってきました。",
    primary: "今すぐ1分を始める",
    secondary: "LINEでつながる"
  },
  ko: {
    eyebrow: "Welcome back",
    firstTitle: "다시 돌아왔습니다.\n여기서부터는 끊기지 않는 리듬입니다.",
    returningTitle: "다시 돌아오셨습니다.\n오늘도 1분만 정돈해봅시다.",
    body: "무언가를 산 것이 아니라, 나에게 돌아오는 자리로 다시 온 것입니다.",
    primary: "지금 1분 시작하기",
    secondary: "LINE으로 함께 이어가기"
  },
  en: {
    eyebrow: "Welcome back",
    firstTitle: "Welcome back.\nFrom here, the rhythm continues.",
    returningTitle: "Welcome back.\nLet’s take just one minute today.",
    body: "You did not buy something. You simply returned to a place that helps you come back to yourself.",
    primary: "Start your 1 minute now",
    secondary: "Continue on LINE"
  }
} as const;

function detectLanguage(): Language {
  if (typeof window === "undefined") {
    return "ja";
  }

  const language = window.navigator.language.toLowerCase();

  if (language.startsWith("ko")) {
    return "ko";
  }

  if (language.startsWith("en")) {
    return "en";
  }

  return "ja";
}

export default function WelcomeMemberPage() {
  const [meditationOpen, setMeditationOpen] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [language, setLanguage] = useState<Language>("ja");

  useEffect(() => {
    setLanguage(detectLanguage());

    const hasReturned = window.localStorage.getItem(MEMBER_RETURNED_KEY) === "true";

    if (hasReturned) {
      setIsReturning(true);
    }

    window.localStorage.setItem(MEMBER_RETURNED_KEY, "true");
  }, []);

  const t = useMemo(() => copy[language], [language]);

  return (
    <div className="section-shell py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <section className="premium-card rounded-[28px] p-8 text-center sm:p-12">
          <p className="text-sm uppercase tracking-[0.34em] text-gold">{t.eyebrow}</p>
          <h1 className="mt-6 whitespace-pre-line font-serif text-4xl leading-tight text-white sm:text-5xl">
            {isReturning ? t.returningTitle : t.firstTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">{t.body}</p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setMeditationOpen(true)}
              className="inline-flex min-h-[56px] min-w-[240px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
            >
              {t.primary}
            </button>

            <a
              href={LINE_CONNECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] min-w-[240px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
            >
              {t.secondary}
            </a>
          </div>
        </section>
      </div>

      <OneMinuteMeditation open={meditationOpen} onClose={() => setMeditationOpen(false)} />
    </div>
  );
}
