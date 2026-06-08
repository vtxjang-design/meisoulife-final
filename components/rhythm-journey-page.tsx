"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  clampRhythmJourneyDay,
  journeyAudioMap,
  rhythmJourneyDays,
  readRhythmJourneyProgress,
  writeRhythmJourneyProgress,
  type RhythmJourneyProgress
} from "@/lib/rhythm-journey";

const DAILY_RHYTHM_ROUTE = "/program/basic";
const JOURNEY_AUDIO_PENDING_KEY = "meisoulife_journey_audio_pending";

const emptyProgress: RhythmJourneyProgress = {
  journeyStarted: false,
  currentDay: 1,
  completedDays: [],
  selectedOptions: {}
};

export function RhythmJourneyPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<RhythmJourneyProgress>(emptyProgress);
  const [hydrated, setHydrated] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showNaturePause, setShowNaturePause] = useState(false);
  const currentDay = useMemo(
    () => rhythmJourneyDays.find((item) => item.day === clampRhythmJourneyDay(progress.currentDay)) ?? rhythmJourneyDays[0],
    [progress.currentDay]
  );
  const selectedValue = progress.selectedOptions[String(currentDay.day)] ?? "";
  const isCompleted = progress.completedDays.includes(currentDay.day);
  const day7RhythmSelection = progress.selectedOptions["7"] ?? "";
  const day7RhythmMessage =
    day7RhythmSelection === "☀️ 朝を整えたい"
      ? "朝のリズムを\n育てていきましょう。"
      : day7RhythmSelection === "🌿 昼を整えたい"
        ? "昼のリズムを\n育てていきましょう。"
        : day7RhythmSelection === "🌙 夜を整えたい"
          ? "夜のリズムを\n育てていきましょう。"
          : "";
  const rhythmButtonLabel =
    day7RhythmSelection === "☀️ 朝を整えたい"
      ? "Morning Rhythmへ"
      : day7RhythmSelection === "🌿 昼を整えたい"
        ? "Day Rhythmへ"
        : day7RhythmSelection === "🌙 夜を整えたい"
          ? "Night Rhythmへ"
          : "私のDaily Rhythmへ";

  useEffect(() => {
    const stored = readRhythmJourneyProgress();
    const searchParams = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
    const completedDayParam = Number(searchParams?.get("completedDay"));
    const nextProgress =
      Number.isInteger(completedDayParam) && completedDayParam >= 1 && completedDayParam <= rhythmJourneyDays.length
        ? {
            ...stored,
            journeyStarted: true,
            currentDay: clampRhythmJourneyDay(completedDayParam),
            completedDays: Array.from(new Set([...stored.completedDays, completedDayParam])).sort((a, b) => a - b)
          }
        : stored;

    setProgress(nextProgress);
    writeRhythmJourneyProgress(nextProgress);
    setShowIntro(!nextProgress.journeyStarted);
    setShowNaturePause(false);
    setHydrated(true);
  }, []);

  function updateProgress(next: RhythmJourneyProgress) {
    setProgress(next);
    writeRhythmJourneyProgress(next);
  }

  function startJourney() {
    const next = {
      ...progress,
      journeyStarted: true
    };

    updateProgress(next);
    setShowIntro(false);
  }

  function handleSelectOption(option: string) {
    const next = {
      ...progress,
      selectedOptions: {
        ...progress.selectedOptions,
        [String(currentDay.day)]: option
      }
    };

    updateProgress(next);
  }

  function handleCompleteDay() {
    const next = {
      ...progress,
      completedDays: Array.from(new Set([...progress.completedDays, currentDay.day])).sort((a, b) => a - b)
    };

    updateProgress(next);
  }

  function handleNext() {
    if (currentDay.day >= rhythmJourneyDays.length) {
      router.push(DAILY_RHYTHM_ROUTE);
      return;
    }

    const next = {
      ...progress,
      currentDay: currentDay.day + 1
    };

    updateProgress(next);
    setShowNaturePause(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startRecoveryMinute() {
    const meditationType = currentDay.day === 7 ? "morning" : currentDay.day === 6 ? "night" : "default";

    if (typeof window !== "undefined") {
      const src = journeyAudioMap[currentDay.day];
      window.sessionStorage.setItem(
        JOURNEY_AUDIO_PENDING_KEY,
        JSON.stringify({
          day: currentDay.day,
          src,
          requestedAt: Date.now()
        })
      );
    }

    router.push(
      `/meditation?duration=60&type=${meditationType}&journey=1&journeyDay=${currentDay.day}&returnTo=${encodeURIComponent(
        `/rhythm-journey?completedDay=${currentDay.day}`
      )}`
    );
  }

  function handleDay7RhythmSelect(option: string) {
    const next = {
      ...progress,
      selectedOptions: {
        ...progress.selectedOptions,
        "7": option
      }
    };

    updateProgress(next);
  }

  if (!hydrated) {
    return (
      <div className="section-shell py-20 sm:py-24">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-white/[0.06] px-6 py-10 text-center shadow-[0_24px_80px_rgba(7,17,31,0.16)] sm:px-8 sm:py-12">
          <p className="text-sm tracking-[0.24em] text-gold/80">7日間の小さな回復</p>
          <p className="mt-4 text-base leading-8 text-white/62">静かに準備しています。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell py-14 sm:py-18">
      <div className="mx-auto max-w-3xl">
        {showIntro ? (
          <section className="overflow-hidden rounded-[34px] border border-[#f3e8c8]/20 bg-[radial-gradient(circle_at_top,rgba(244,232,198,0.18),transparent_22%),linear-gradient(180deg,rgba(246,239,226,0.18),rgba(196,219,205,0.08))] px-6 py-8 shadow-[0_24px_80px_rgba(7,17,31,0.14)] backdrop-blur-[14px] sm:px-8 sm:py-10">
            <p className="text-sm uppercase tracking-[0.28em] text-[#f0d79c]">毎日の小さなリズム</p>
            <h1 className="mt-4 font-serif text-[34px] leading-[1.24] text-white sm:text-[44px]">
              7日間の小さな回復
            </h1>
            <p className="mt-3 text-lg leading-8 text-[#f4ead1]/92">自分のリズムを取り戻す旅</p>
            <div className="mt-7 rounded-[28px] border border-white/10 bg-[#f6f0e3]/10 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="whitespace-pre-line text-base leading-8 text-white/82">
                {"頑張らなくて大丈夫です。\n\n今日は、\nひとつだけ整えてみましょう。"}
              </p>
            </div>
            <button
              type="button"
              onClick={startJourney}
              className="mt-8 inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3e0af,#d4ba75)] px-6 py-4 text-base font-semibold text-ink shadow-[0_18px_40px_rgba(212,186,117,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(212,186,117,0.26)] sm:w-auto sm:min-w-[280px]"
            >
              始める
            </button>
            <p className="mt-4 text-sm text-white/54">約1分</p>
          </section>
        ) : (
          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4 px-1">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-[#f0d79c]">今日の小さな回復</p>
                <h1 className="mt-3 font-serif text-[30px] leading-[1.24] text-white sm:text-[40px]">{currentDay.title}</h1>
                <p className="mt-2 text-base leading-7 text-white/70">{currentDay.subtitle}</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/68">
                {currentDay.day} / 7
              </div>
            </div>

            <article className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(244,232,198,0.14),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.028))] p-5 shadow-[0_24px_80px_rgba(7,17,31,0.16)] sm:p-7">
              {!isCompleted ? (
                <div className="space-y-6">
                  <div className="rounded-[26px] border border-white/10 bg-[#f6f0e3]/10 px-5 py-5 backdrop-blur-[10px]">
                    <p className="whitespace-pre-line text-base leading-8 text-white/82">{currentDay.intro}</p>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-white/[0.03] px-5 py-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-[#f0d79c]">今日の小さな実践</p>
                    <ul className="mt-4 grid gap-3">
                      {currentDay.practices.map((practice) => (
                        <li key={practice} className="flex items-start gap-3 rounded-2xl bg-white/[0.028] px-4 py-3 text-sm leading-7 text-white/76">
                          <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#d8caa0]/28 bg-[#f3e0af]/10 text-[11px] text-[#f3e0af]">
                            ✓
                          </span>
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-white/[0.03] px-5 py-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-[#f0d79c]">感じてみる</p>
                    <p className="mt-4 text-base leading-8 text-white/82">{currentDay.question}</p>

                    {currentDay.options?.length ? (
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        {currentDay.options.map((option) => {
                          const selected = selectedValue === option;

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleSelectOption(option)}
                              className={`rounded-full px-4 py-2.5 text-sm transition duration-200 ${
                                selected
                                  ? "border border-[#f0d79c]/30 bg-[#f3e0af]/16 text-[#fff8e6]"
                                  : "border border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.07]"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    {currentDay.freeTextPlaceholder ? (
                      <textarea
                        value={selectedValue}
                        onChange={(event) => handleSelectOption(event.target.value)}
                        placeholder={currentDay.freeTextPlaceholder}
                        rows={3}
                        className="mt-4 w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white placeholder:text-white/38 focus:border-[#f0d79c]/30 focus:outline-none"
                      />
                    ) : null}

                    {currentDay.specialNote ? (
                      <div className="mt-5 rounded-[22px] border border-[#d8caa0]/16 bg-[#d8caa0]/8 px-4 py-4">
                        <p className="whitespace-pre-line text-sm leading-7 text-[#f4ead1]/88">{currentDay.specialNote}</p>
                      </div>
                    ) : null}
                  </div>

                  {currentDay.day === 4 ? (
                    showNaturePause ? (
                      <div className="animate-meditation-fade-up rounded-[28px] border border-[#d8caa0]/18 bg-[linear-gradient(180deg,rgba(243,224,175,0.12),rgba(255,255,255,0.05))] px-5 py-6 text-center">
                        <p className="whitespace-pre-line font-serif text-[24px] leading-[1.8] text-white sm:text-[28px]">
                          {"今日は、\nスマホを少し休ませましょう。\n\n10分後に\n戻ってきてください。"}
                        </p>
                        <button
                          type="button"
                          onClick={handleCompleteDay}
                          className="mt-6 inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3e0af,#d4ba75)] px-6 py-4 text-base font-semibold text-ink shadow-[0_18px_40px_rgba(212,186,117,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(212,186,117,0.24)]"
                        >
                          今日の小さな回復を終える
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowNaturePause(true)}
                        className="inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3e0af,#d4ba75)] px-6 py-4 text-base font-semibold text-ink shadow-[0_18px_40px_rgba(212,186,117,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(212,186,117,0.24)]"
                      >
                        画面を閉じる
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={startRecoveryMinute}
                      className="inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3e0af,#d4ba75)] px-6 py-4 text-base font-semibold text-ink shadow-[0_18px_40px_rgba(212,186,117,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(212,186,117,0.24)]"
                    >
                      60秒の回復へ
                    </button>
                  )}
                </div>
              ) : (
                <div className="animate-meditation-fade-up space-y-6">
                  <div className="rounded-[28px] border border-[#d8caa0]/18 bg-[linear-gradient(180deg,rgba(243,224,175,0.12),rgba(255,255,255,0.05))] px-5 py-6 text-center">
                    {currentDay.day < rhythmJourneyDays.length ? (
                      <>
                        <p className="text-sm uppercase tracking-[0.28em] text-[#f0d79c]">今日の分だけで十分です</p>
                        <p className="mt-5 whitespace-pre-line font-serif text-[24px] leading-[1.8] text-white sm:text-[28px]">
                          {currentDay.completion}
                        </p>
                      </>
                    ) : (
                      <div className="space-y-5">
                        <p className="whitespace-pre-line font-serif text-[24px] leading-[1.8] text-white sm:text-[28px]">
                          {"7日間、\nお疲れさまでした。"}
                        </p>
                        <p className="whitespace-pre-line text-base leading-8 text-white/82">
                          {"あなたは変わったのではなく、\n\n本来のリズムを\n思い出し始めました。"}
                        </p>
                        <p className="whitespace-pre-line text-base leading-8 text-[#f4ead1]/86">
                          {"これから、\nどのリズムを育てたいですか？"}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2.5">
                          {["☀️ 朝を整えたい", "🌿 昼を整えたい", "🌙 夜を整えたい"].map((option) => {
                            const selected = day7RhythmSelection === option;

                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => handleDay7RhythmSelect(option)}
                                className={`rounded-full px-4 py-2.5 text-sm transition duration-200 ${
                                  selected
                                    ? "border border-[#f0d79c]/30 bg-[#f3e0af]/16 text-[#fff8e6]"
                                    : "border border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.07]"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                        {day7RhythmMessage ? (
                          <p className="whitespace-pre-line text-base leading-8 text-white/82">{day7RhythmMessage}</p>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {currentDay.day < rhythmJourneyDays.length ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3e0af,#d4ba75)] px-6 py-3 text-sm font-semibold text-ink transition duration-300 hover:-translate-y-0.5"
                    >
                      次へ
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!day7RhythmSelection}
                        className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3e0af,#d4ba75)] px-6 py-3 text-sm font-semibold text-ink transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {rhythmButtonLabel}
                      </button>
                      <Link
                        href="/"
                        className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.07]"
                      >
                        戻ってきましょう
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </article>
          </section>
        )}
      </div>
    </div>
  );
}
