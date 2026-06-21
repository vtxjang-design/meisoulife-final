"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { getBasicGateForCurrentTime, getBasicRhythmGates, type BasicGateKey } from "@/lib/basic-rhythm";

type PlanKey = "free" | "basic" | "growth" | "inner_circle";
type BasicHomeProps = {
  currentDay?: number;
  streakCount?: number;
  planKey?: PlanKey;
  membershipResolved?: boolean;
  defaultRhythm?: "morning" | "day" | "night";
};

const pageCopy = {
  jp: {
    badge: "BASIC Rhythm Space",
    title: "今日は、\nひとつの門から始めれば十分です。",
    body: "ここはライブラリではありません。\n朝・昼・夜のリズムへ静かに戻るための場所です。",
    current: "今日の入口",
    gatesTitle: "3つのリズムゲート",
    gatesBody: "いまの自分に合う扉を、ひとつ選びましょう。",
    enter: "この扉に入る",
    journeyTitle: "Rhythm Journey",
    journeyBody: "一日一回。\n小さく戻る。",
    daily: "Day 1",
    weekly: "また明日、戻りましょう。",
    monthly: "リズムは、一日では育ちません。",
    journeyDay: "旅の日",
    streak: "戻ってきた日々",
    returnTitle: "また戻るために",
    returnBody: "迷わなくて大丈夫です。明日も、ひとつの扉から始めれば十分です。"
  },
  kr: {
    badge: "BASIC Rhythm Space",
    title: "오늘은,\n하나의 문으로 시작하면 충분합니다.",
    body: "이곳은 라이브러리가 아닙니다.\n아침 · 낮 · 저녁의 리듬으로 조용히 돌아오는 공간입니다.",
    current: "오늘의 입구",
    gatesTitle: "3개의 리듬 게이트",
    gatesBody: "지금의 나에게 맞는 문을 하나 고르세요.",
    enter: "이 문으로 들어가기",
    journeyTitle: "Rhythm Journey",
    journeyBody: "하루 한 번.\n작게 돌아오기.",
    daily: "Day 1",
    weekly: "내일도 돌아오세요.",
    monthly: "리듬은 하루에 만들어지지 않습니다.",
    journeyDay: "여정의 날",
    streak: "돌아온 날들",
    returnTitle: "다시 돌아오기",
    returnBody: "많이 읽지 않아도 됩니다. 내일도, 하나의 문이면 충분합니다."
  },
  en: {
    badge: "BASIC Rhythm Space",
    title: "Today,\none gate is enough.",
    body: "This is not a library.\nIt is a quiet place to return to morning, daytime, and evening rhythm.",
    current: "Today’s entrance",
    gatesTitle: "Three Rhythm Gates",
    gatesBody: "Choose one door that fits you now.",
    enter: "Enter this door",
    journeyTitle: "Rhythm Journey",
    journeyBody: "Once a day.\nReturn in a small way.",
    daily: "Day 1",
    weekly: "Come back tomorrow.",
    monthly: "Rhythm is not made in one day.",
    journeyDay: "Journey day",
    streak: "Days returned",
    returnTitle: "Return again",
    returnBody: "You do not need to read much. Tomorrow, one door is enough."
  }
} as const;

function resolveLanguage(language: string) {
  if (language === "kr" || language === "en" || language === "jp") {
    return language;
  }

  return "jp";
}

function mapDefaultRhythm(defaultRhythm?: "morning" | "day" | "night"): BasicGateKey | undefined {
  if (defaultRhythm === "morning") return "morning";
  if (defaultRhythm === "day") return "daytime";
  if (defaultRhythm === "night") return "evening";
  return undefined;
}

function getGateClasses(gate: BasicGateKey, active: boolean) {
  const activeRing = active ? "ring-1 ring-gold/34 border-gold/22" : "border-white/10";

  if (gate === "morning") {
    return `${activeRing} bg-[radial-gradient(circle_at_top,rgba(238,199,113,0.20),transparent_34%),linear-gradient(180deg,rgba(43,53,84,0.86),rgba(16,22,38,0.94))]`;
  }

  if (gate === "daytime") {
    return `${activeRing} bg-[radial-gradient(circle_at_top,rgba(121,178,141,0.18),transparent_36%),linear-gradient(180deg,rgba(18,47,50,0.90),rgba(9,24,28,0.96))]`;
  }

  return `${activeRing} bg-[radial-gradient(circle_at_top,rgba(110,140,212,0.18),transparent_34%),linear-gradient(180deg,rgba(18,31,54,0.92),rgba(8,16,30,0.98))]`;
}

export function BasicHome({
  currentDay = 1,
  streakCount = 3,
  defaultRhythm
}: BasicHomeProps) {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const localizedLanguage = resolveLanguage(language);
  const copy = pageCopy[localizedLanguage];
  const gates = useMemo(() => getBasicRhythmGates(localizedLanguage), [localizedLanguage]);
  const highlighted = searchParams.get("rhythm") ?? searchParams.get("gate");
  const defaultGate = mapDefaultRhythm(defaultRhythm);
  const currentGateKey: BasicGateKey =
    highlighted === "morning" || highlighted === "daytime" || highlighted === "evening"
      ? highlighted
      : highlighted === "day"
        ? "daytime"
        : highlighted === "night"
          ? "evening"
          : defaultGate ?? getBasicGateForCurrentTime();
  const currentGate = gates.find((gate) => gate.key === currentGateKey) ?? gates[0];

  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(127,204,180,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(99,145,219,0.14),transparent_34%),linear-gradient(180deg,rgba(10,26,40,0.86),rgba(7,18,31,0.96))] px-5 py-6 shadow-[0_28px_90px_rgba(0,0,0,0.22)] sm:px-7 sm:py-8">
        <p className="text-xs uppercase tracking-[0.30em] text-gold/78">{copy.badge}</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <h1 className="whitespace-pre-line font-serif text-3xl leading-[1.25] text-white sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/72 sm:text-base">{copy.body}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-gold/70">{copy.current}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{currentGate.title}</p>
            <p className="mt-2 text-sm leading-7 text-white/68">{currentGate.question}</p>
            <Link
              href={`#gate-${currentGate.key}`}
              className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-full border border-gold/20 bg-gold/12 px-5 py-3 text-sm font-semibold text-gold transition hover:bg-gold/18 hover:text-[#f6e3b5]"
            >
              {copy.enter}
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-gold/70">{copy.gatesTitle}</p>
          <p className="text-sm leading-7 text-white/66">{copy.gatesBody}</p>
        </div>

        <div className="grid gap-4">
          {gates.map((gate) => {
            const active = gate.key === currentGateKey;

            return (
              <section
                key={gate.key}
                id={`gate-${gate.key}`}
                className={`rounded-[28px] border p-4 shadow-[0_24px_70px_rgba(0,0,0,0.18)] sm:p-5 ${getGateClasses(gate.key, active)}`}
              >
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-gold/74">{gate.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">{gate.title}</h2>
                  <p className="mt-2 text-base leading-7 text-white/86">{gate.question}</p>
                  <p className="mt-2 text-sm leading-7 text-white/62">{gate.atmosphere}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {gate.doors.map((door) => (
                    <Link
                      key={door.key}
                      href={door.href}
                      className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.07]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-2xl">{door.emoji}</div>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-white/56">
                          {Math.floor(door.durationSeconds / 60)} min
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-white">{door.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/72">“{door.state}”</p>
                      <span className="mt-5 inline-flex text-sm font-semibold text-white/84 transition group-hover:text-white">
                        {copy.enter}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,28,44,0.82),rgba(10,18,30,0.94))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
          <p className="text-xs uppercase tracking-[0.28em] text-gold/72">{copy.journeyTitle}</p>
          <p className="mt-3 text-sm leading-7 text-white/68">{copy.journeyBody}</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm leading-7 text-white/82">{copy.daily}</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm leading-7 text-white/82">{copy.weekly}</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm leading-7 text-white/82">{copy.monthly}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,26,38,0.84),rgba(7,16,28,0.96))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">{copy.journeyDay}</p>
              <p className="mt-3 text-3xl font-semibold text-white">Day {Math.min(Math.max(currentDay, 1), 30)}</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">{copy.streak}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{Math.max(streakCount, 0)}</p>
            </div>
          </div>
          <div className="mt-5 rounded-[22px] border border-gold/14 bg-gold/8 p-4">
            <p className="text-sm font-semibold text-white">{copy.returnTitle}</p>
            <p className="mt-3 text-sm leading-7 text-white/68">{copy.returnBody}</p>
          </div>
        </section>
      </div>
    </section>
  );
}
