"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n";

type ZeroExperienceModalProps = {
  open: boolean;
  onClose: () => void;
};

const TOTAL_SECONDS = 60;

const zeroCopy = {
  jp: {
    eyebrow: "ZERO Experience",
    title: "1分だけ、情報から離れて戻りましょう",
    phases: [
      { label: "呼吸", description: "息を吸って、吐いて、いまここに戻ります。" },
      { label: "Brain Wave Vibration", description: "首と肩の力をゆるめ、身体感覚をやさしく目覚めさせます。" },
      { label: "静かな感覚回復", description: "静けさの中で、自分の中心をそっと感じます。" }
    ],
    messagePrimary: "あなたは情報ではありません。情報を見つめる脳の主人です。",
    messageSecondary: "おかえりなさい。",
    complete: "おかえりなさい。今の静けさを、そのまま今日のリズムに連れていきましょう。",
    continue: "1分呼吸へ進む",
    close: "閉じる"
  },
  kr: {
    eyebrow: "ZERO Experience",
    title: "1분만, 정보에서 떨어져 다시 돌아옵니다",
    phases: [
      { label: "호흡", description: "숨을 들이쉬고 내쉬며 지금 이곳으로 돌아옵니다." },
      { label: "Brain Wave Vibration", description: "목과 어깨의 힘을 풀고 몸의 감각을 부드럽게 깨웁니다." },
      { label: "조용한 감각 회복", description: "고요함 속에서 내 중심을 천천히 느껴봅니다." }
    ],
    messagePrimary: "당신은 정보가 아닙니다. 정보를 바라보는 뇌의 주인입니다。",
    messageSecondary: "다시 돌아왔습니다。",
    complete: "다시 돌아왔습니다. 지금의 고요함을 오늘의 리듬으로 천천히 이어가보세요.",
    continue: "1분 호흡으로 이어가기",
    close: "닫기"
  },
  en: {
    eyebrow: "ZERO Experience",
    title: "For one minute, step out of the information stream and return.",
    phases: [
      { label: "Breath", description: "Inhale, exhale, and come back to the present moment." },
      { label: "Brain Wave Vibration", description: "Release the neck and shoulders and gently wake the body." },
      { label: "Quiet Recovery", description: "Stay in the stillness and feel your own center again." }
    ],
    messagePrimary: "You are not the information. You are the one who observes it.",
    messageSecondary: "Welcome back.",
    complete: "Welcome back. Carry this quiet feeling into the rest of your day.",
    continue: "Continue with one-minute breathing",
    close: "Close"
  }
} as const;

export function ZeroExperienceModal({ open, onClose }: ZeroExperienceModalProps) {
  const { language } = useLanguage();
  const copy = zeroCopy[language];
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!open) {
      setElapsed(0);
      return;
    }

    setElapsed(0);
    const interval = window.setInterval(() => {
      setElapsed((current) => {
        if (current >= TOTAL_SECONDS) {
          window.clearInterval(interval);
          return TOTAL_SECONDS;
        }

        return current + 1;
      });
    }, 1000);

    document.body.style.overflow = "hidden";

    return () => {
      window.clearInterval(interval);
      document.body.style.overflow = "";
    };
  }, [open]);

  const progress = useMemo(() => Math.min((elapsed / TOTAL_SECONDS) * 100, 100), [elapsed]);
  const phaseIndex = elapsed >= 40 ? 2 : elapsed >= 20 ? 1 : 0;
  const activePhase = copy.phases[phaseIndex];
  const isComplete = elapsed >= TOTAL_SECONDS;
  const remaining = Math.max(TOTAL_SECONDS - elapsed, 0);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#040a0f]/84 px-4 py-6 backdrop-blur-xl">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.16),transparent_24%),linear-gradient(180deg,#0d1a1c_0%,#081014_100%)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.42)] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm text-white/80 transition hover:bg-white/[0.08]"
        >
          {copy.close}
        </button>

        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.28em] text-gold/82">{copy.eyebrow}</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">{copy.title}</h2>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#d4ba75_0%,#9cc68c_100%)] transition-[width] duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="rounded-[28px] border border-gold/20 bg-gold/[0.08] p-5">
            <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full border border-gold/30 bg-[radial-gradient(circle,rgba(212,186,117,0.28),rgba(212,186,117,0.06)_55%,transparent_72%)] text-center shadow-[0_0_80px_rgba(212,186,117,0.12)]">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-gold/80">{activePhase.label}</p>
                <p className="mt-3 text-4xl font-semibold text-white">{remaining}s</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm leading-7 text-white/84">{activePhase.description}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
              <p className="whitespace-pre-line text-lg leading-8 text-white/90">{copy.messagePrimary}</p>
              <p className="mt-4 text-sm leading-7 text-gold/85">{copy.messageSecondary}</p>
            </div>
            {isComplete ? (
              <div className="rounded-[28px] border border-emerald-200/12 bg-emerald-200/[0.08] p-5">
                <p className="text-base leading-8 text-white/88">{copy.complete}</p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="#one-minute-experience"
                    onClick={onClose}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
                  >
                    {copy.continue}
                  </Link>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
                  >
                    {copy.close}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
