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
  const activeRing = active
    ? "ring-1 ring-[rgba(127,255,212,0.22)] border-[rgba(127,255,212,0.22)]"
    : "border-white/10";

  if (gate === "morning") {
    return `${activeRing} bg-[radial-gradient(circle_at_top,rgba(216,192,138,0.18),transparent_36%),radial-gradient(circle_at_22%_18%,rgba(127,255,212,0.12),transparent_42%),linear-gradient(180deg,rgba(16,49,77,0.78),rgba(8,40,69,0.88)_54%,rgba(6,27,51,0.94))]`;
  }

  if (gate === "daytime") {
    return `${activeRing} bg-[radial-gradient(circle_at_top,rgba(77,182,172,0.18),transparent_38%),radial-gradient(circle_at_80%_24%,rgba(127,255,212,0.10),transparent_42%),linear-gradient(180deg,rgba(11,42,68,0.82),rgba(8,40,69,0.90)_52%,rgba(6,27,51,0.95))]`;
  }

  return `${activeRing} bg-[radial-gradient(circle_at_top,rgba(30,58,95,0.25),transparent_38%),radial-gradient(circle_at_76%_20%,rgba(127,255,212,0.08),transparent_42%),linear-gradient(180deg,rgba(9,34,59,0.86),rgba(7,27,50,0.94)_52%,rgba(5,18,34,0.98))]`;
}

function getDoorClasses(gate: BasicGateKey) {
  if (gate === "morning") {
    return "border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] shadow-[0_18px_48px_rgba(0,0,0,0.16),0_0_0_1px_rgba(216,192,138,0.05)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.05))]";
  }

  if (gate === "daytime") {
    return "border-[rgba(255,255,255,0.10)] bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.035))] shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_0_1px_rgba(77,182,172,0.06)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.045))]";
  }

  return "border-[rgba(255,255,255,0.10)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-[0_24px_56px_rgba(0,0,0,0.22),0_0_0_1px_rgba(30,58,95,0.10)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.085),rgba(255,255,255,0.04))]";
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
    <section className="space-y-10">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(216,192,138,0.16),transparent_24%),radial-gradient(circle_at_75%_18%,rgba(127,255,212,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(8,40,69,0.22),transparent_38%),linear-gradient(180deg,rgba(8,40,69,0.82),rgba(6,27,51,0.92)_58%,rgba(5,18,34,0.98))] px-5 py-6 shadow-[0_28px_100px_rgba(0,0,0,0.24)] sm:px-7 sm:py-8">
        <p className="text-xs uppercase tracking-[0.30em] text-[rgba(127,255,212,0.72)]">{copy.badge}</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <h1 className="whitespace-pre-line font-serif text-3xl leading-[1.3] text-[rgba(244,250,255,0.96)] sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-7 text-[rgba(233,242,248,0.74)] sm:text-base">
              {copy.body}
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-4 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-[rgba(127,255,212,0.68)]">{copy.current}</p>
            <p className="mt-3 text-2xl font-semibold text-[rgba(244,250,255,0.95)]">{currentGate.title}</p>
            <p className="mt-2 text-sm leading-7 text-[rgba(233,242,248,0.7)]">{currentGate.question}</p>
            <Link
              href={`#gate-${currentGate.key}`}
              className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-full border border-[rgba(127,255,212,0.22)] bg-[rgba(127,255,212,0.10)] px-5 py-3 text-sm font-semibold text-[rgba(225,255,247,0.92)] transition hover:bg-[rgba(127,255,212,0.16)] hover:text-white"
            >
              {copy.enter}
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-[rgba(127,255,212,0.68)]">{copy.gatesTitle}</p>
          <p className="text-sm leading-7 text-[rgba(233,242,248,0.64)]">{copy.gatesBody}</p>
        </div>

        <div className="grid gap-5">
          {gates.map((gate) => {
            const active = gate.key === currentGateKey;

            return (
              <section
                key={gate.key}
                id={`gate-${gate.key}`}
                className={`rounded-[30px] border p-5 shadow-[0_30px_88px_rgba(0,0,0,0.20)] sm:p-6 ${getGateClasses(gate.key, active)}`}
              >
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.30em] text-[rgba(127,255,212,0.66)]">{gate.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-[rgba(244,250,255,0.96)]">{gate.title}</h2>
                  <p className="mt-2 text-base leading-7 text-[rgba(242,248,252,0.88)]">{gate.question}</p>
                  <p className="mt-2 text-sm leading-7 text-[rgba(233,242,248,0.62)]">{gate.atmosphere}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {gate.doors.map((door) => (
                    <Link
                      key={door.key}
                      href={door.href}
                      className={`group rounded-[24px] border p-5 backdrop-blur-xl transition hover:-translate-y-0.5 ${getDoorClasses(gate.key)}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-2xl">{door.emoji}</div>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-[rgba(233,242,248,0.58)]">
                          {Math.floor(door.durationSeconds / 60)} min
                        </span>
                      </div>
                      <h3 className="mt-5 text-lg font-semibold text-[rgba(244,250,255,0.95)]">{door.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-[rgba(233,242,248,0.72)]">“{door.state}”</p>
                      <span className="mt-6 inline-flex text-sm font-semibold text-[rgba(225,255,247,0.86)] transition group-hover:text-white">
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

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(127,255,212,0.08),transparent_34%),linear-gradient(180deg,rgba(9,34,59,0.80),rgba(7,27,50,0.90)_52%,rgba(5,18,34,0.96))] p-5 shadow-[0_28px_78px_rgba(0,0,0,0.20)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[rgba(127,255,212,0.64)]">{copy.journeyTitle}</p>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[rgba(233,242,248,0.68)]">{copy.journeyBody}</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm leading-7 text-[rgba(242,248,252,0.84)]">{copy.daily}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm leading-7 text-[rgba(242,248,252,0.84)]">{copy.weekly}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm leading-7 text-[rgba(242,248,252,0.84)]">{copy.monthly}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(30,58,95,0.20),transparent_38%),linear-gradient(180deg,rgba(8,29,50,0.82),rgba(6,22,42,0.92)_54%,rgba(4,16,30,0.98))] p-5 shadow-[0_28px_78px_rgba(0,0,0,0.20)]">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[rgba(233,242,248,0.44)]">{copy.journeyDay}</p>
              <p className="mt-3 text-3xl font-semibold text-[rgba(244,250,255,0.94)]">Day {Math.min(Math.max(currentDay, 1), 30)}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[rgba(233,242,248,0.44)]">{copy.streak}</p>
              <p className="mt-3 text-3xl font-semibold text-[rgba(244,250,255,0.94)]">{Math.max(streakCount, 0)}</p>
            </div>
          </div>
          <div className="mt-5 rounded-[24px] border border-[rgba(127,255,212,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
            <p className="text-sm font-semibold text-[rgba(244,250,255,0.94)]">{copy.returnTitle}</p>
            <p className="mt-3 text-sm leading-7 text-[rgba(233,242,248,0.66)]">{copy.returnBody}</p>
          </div>
        </section>
      </div>
    </section>
  );
}
