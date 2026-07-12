"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  clampRhythmJourneyDay,
  RHYTHM_JOURNEY_DAY_COUNT,
  getRhythmJourneyChoice,
  getRhythmJourneyContent,
  getRhythmJourneyDay,
  readRhythmJourneyProgress,
  resolveJourneyOptionValue,
  writeRhythmJourneyProgress,
  type RhythmJourneyProgress
} from "@/lib/rhythm-journey";
import { useLanguage } from "@/lib/i18n";

const DAILY_RHYTHM_ROUTE = "/program/basic";
const JOURNEY_AUDIO_PENDING_KEY = "meisoulife_journey_audio_pending";
const JOURNEY_AUDIO_DAY_KEY = "meisoulife_journey_day";
const JOURNEY_OVERVIEW_IMAGE_SRC = "/7day-recovery/7day-recovery-overview.png";

const emptyProgress: RhythmJourneyProgress = {
  journeyStarted: false,
  currentDay: 1,
  completedDays: [],
  selectedOptions: {}
};

export function RhythmJourneyPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const journeyCopy = useMemo(() => getRhythmJourneyContent(language), [language]);
  const [progress, setProgress] = useState<RhythmJourneyProgress>(emptyProgress);
  const [hydrated, setHydrated] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showNaturePause, setShowNaturePause] = useState(false);
  const currentDay = useMemo(
    () => getRhythmJourneyDay(language, clampRhythmJourneyDay(progress.currentDay)),
    [language, progress.currentDay]
  );
  const rawSelectedValue = progress.selectedOptions[String(currentDay.day)] ?? "";
  const selectedValue = resolveJourneyOptionValue(currentDay.day, rawSelectedValue);
  const isCompleted = progress.completedDays.includes(currentDay.day);
  const day7RhythmSelection = resolveJourneyOptionValue(7, progress.selectedOptions["7"] ?? "");
  const selectedRhythmChoice = getRhythmJourneyChoice(language, day7RhythmSelection);
  const day7RhythmMessage = selectedRhythmChoice?.followUp ?? "";
  const rhythmButtonLabel = selectedRhythmChoice?.cta ?? journeyCopy.dailyRhythmCta;
  const dayNavLabel =
    language === "jp" ? "日を選ぶ" : language === "kr" ? "날짜 선택" : "Choose a day";
  const resetToDayOneLabel =
    language === "jp" ? "Day 1へ戻る" : language === "kr" ? "Day 1로 돌아가기" : "Return to Day 1";
  const overviewImageAlt =
    language === "jp"
      ? "7日間の小さな回復の7つのテーマ"
      : language === "kr"
        ? "7일간의 작은 회복 7가지 주제"
        : "Seven themes of the 7-Day Recovery Journey";

  useEffect(() => {
    const stored = readRhythmJourneyProgress();
    const searchParams = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
    const completedDayParam = Number(searchParams?.get("completedDay"));
    const requestedDayParam = Number(searchParams?.get("day"));
    const hasRequestedDay =
      Number.isInteger(requestedDayParam) &&
      requestedDayParam >= 1 &&
      requestedDayParam <= RHYTHM_JOURNEY_DAY_COUNT;
    const nextProgress =
      Number.isInteger(completedDayParam) && completedDayParam >= 1 && completedDayParam <= RHYTHM_JOURNEY_DAY_COUNT
        ? {
            ...stored,
            journeyStarted: true,
            currentDay: clampRhythmJourneyDay(completedDayParam),
            completedDays: Array.from(new Set([...stored.completedDays, completedDayParam])).sort((a, b) => a - b)
          }
        : hasRequestedDay
          ? {
              ...stored,
              journeyStarted: true,
              currentDay: clampRhythmJourneyDay(requestedDayParam)
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

  function handleSelectDay(day: number) {
    const next = {
      ...progress,
      journeyStarted: true,
      currentDay: clampRhythmJourneyDay(day)
    };

    updateProgress(next);
    setShowIntro(false);
    setShowNaturePause(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNext() {
    if (currentDay.day >= RHYTHM_JOURNEY_DAY_COUNT) {
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
      window.sessionStorage.setItem(JOURNEY_AUDIO_PENDING_KEY, "true");
      window.sessionStorage.setItem(JOURNEY_AUDIO_DAY_KEY, String(currentDay.day));
    }

    router.push(
      `/meditation?duration=60&type=${meditationType}&journey=1&day=${currentDay.day}&returnTo=${encodeURIComponent(
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

  function getDailyRhythmRoute(choice: string) {
    // TODO: Point these to dedicated morning/day/night destinations if those routes or anchors are added later.
    return `${DAILY_RHYTHM_ROUTE}?rhythm=${encodeURIComponent(choice)}`;
  }

  if (!hydrated) {
    return (
      <div className="section-shell py-20 sm:py-24">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-white/[0.06] px-6 py-10 text-center shadow-[0_24px_80px_rgba(7,17,31,0.16)] sm:px-8 sm:py-12">
          <p className="text-sm tracking-[0.24em] text-gold/80">{journeyCopy.title}</p>
          <p className="mt-4 text-base leading-8 text-white/62">{journeyCopy.preparing}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell py-14 sm:py-18">
      <div className="mx-auto max-w-3xl">
        {showIntro ? (
          <section className="overflow-hidden rounded-[34px] border border-[#f3e8c8]/20 bg-[radial-gradient(circle_at_top,rgba(244,232,198,0.18),transparent_22%),linear-gradient(180deg,rgba(246,239,226,0.18),rgba(196,219,205,0.08))] px-6 py-8 shadow-[0_24px_80px_rgba(7,17,31,0.14)] backdrop-blur-[14px] sm:px-8 sm:py-10">
            <p className="text-sm uppercase tracking-[0.28em] text-[#f0d79c]">{journeyCopy.entryEyebrow}</p>
            <h1 className="hero-measure word-balance keep-phrase mt-4 max-w-[10ch] whitespace-pre-line font-serif text-[clamp(2rem,10vw,4.5rem)] leading-[1.16] text-white sm:max-w-none sm:leading-[1.22]">
              {journeyCopy.title}
            </h1>
            <p className="hero-measure word-balance keep-phrase mt-3 max-w-[14ch] whitespace-pre-line text-lg leading-[1.7] text-[#f4ead1]/92 sm:max-w-[18ch] sm:leading-8">
              {journeyCopy.subtitle}
            </p>
            <div className="mt-7 rounded-[28px] border border-white/10 bg-[#f6f0e3]/10 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="whitespace-pre-line text-base leading-8 text-white/82">
                {journeyCopy.entryBody}
              </p>
            </div>
            <div className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(7,17,31,0.14)]">
              <img
                src={JOURNEY_OVERVIEW_IMAGE_SRC}
                alt={overviewImageAlt}
                className="block h-auto w-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={startJourney}
              className="button-nowrap mt-8 inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3e0af,#d4ba75)] px-6 py-4 text-base font-semibold text-ink shadow-[0_18px_40px_rgba(212,186,117,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(212,186,117,0.26)] sm:w-auto sm:min-w-[280px]"
            >
              {journeyCopy.startCta}
            </button>
            <p className="mt-4 text-sm text-white/54">{journeyCopy.approxMinute}</p>
          </section>
        ) : (
          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4 px-1">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-[#f0d79c]">{journeyCopy.todayEyebrow}</p>
                <h1 className="hero-measure word-balance keep-phrase mt-3 max-w-[12ch] font-serif text-[clamp(1.875rem,8vw,3rem)] leading-[1.18] text-white sm:max-w-none sm:leading-[1.24]">
                  {currentDay.title}
                </h1>
                <p className="body-measure word-balance keep-phrase mt-2 max-w-[16ch] whitespace-pre-line text-base leading-[1.68] text-white/70 sm:max-w-[22ch] sm:leading-7">
                  {currentDay.subtitle}
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/68">
                {currentDay.day} / {RHYTHM_JOURNEY_DAY_COUNT}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[#f0d79c]">{dayNavLabel}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from({ length: RHYTHM_JOURNEY_DAY_COUNT }, (_, index) => {
                  const day = index + 1;
                  const selected = day === currentDay.day;
                  const completed = progress.completedDays.includes(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`min-h-[40px] rounded-full px-3.5 py-2 text-sm transition duration-200 ${
                        selected
                          ? "border border-[#f0d79c]/30 bg-[#f3e0af]/16 text-[#fff8e6]"
                          : completed
                            ? "border border-white/10 bg-white/[0.06] text-white/82"
                            : "border border-white/10 bg-white/[0.03] text-white/62 hover:bg-white/[0.06]"
                      }`}
                    >
                      Day {day}
                    </button>
                  );
                })}
              </div>
              {currentDay.day !== 1 ? (
                <button
                  type="button"
                  onClick={() => handleSelectDay(1)}
                  className="mt-3 inline-flex min-h-[42px] items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/72 transition hover:bg-white/[0.06]"
                >
                  {resetToDayOneLabel}
                </button>
              ) : null}
            </div>

            <article className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(244,232,198,0.14),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.028))] p-5 shadow-[0_24px_80px_rgba(7,17,31,0.16)] sm:p-7">
              {!isCompleted ? (
                <div className="space-y-6">
                  <div className="rounded-[26px] border border-white/10 bg-[#f6f0e3]/10 px-5 py-5 backdrop-blur-[10px]">
                    <p className="whitespace-pre-line text-base leading-8 text-white/82">{currentDay.intro}</p>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-white/[0.03] px-5 py-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-[#f0d79c]">{journeyCopy.practicesLabel}</p>
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
                    <p className="text-sm uppercase tracking-[0.24em] text-[#f0d79c]">{journeyCopy.reflectionLabel}</p>
                    <p className="mt-4 text-base leading-8 text-white/82">{currentDay.question}</p>

                    {currentDay.options?.length ? (
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        {currentDay.options.map((option) => {
                          const selected = selectedValue === option.value;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleSelectOption(option.value)}
                            className={`button-nowrap rounded-full px-4 py-2.5 text-sm transition duration-200 ${
                                selected
                                  ? "border border-[#f0d79c]/30 bg-[#f3e0af]/16 text-[#fff8e6]"
                                  : "border border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.07]"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    {currentDay.freeTextPlaceholder ? (
                      <textarea
                        value={currentDay.options?.some((option) => option.value === selectedValue) ? "" : rawSelectedValue}
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
                          {journeyCopy.naturePauseMessage}
                        </p>
                        <button
                          type="button"
                          onClick={handleCompleteDay}
                        className="button-nowrap mt-6 inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3e0af,#d4ba75)] px-6 py-4 text-base font-semibold text-ink shadow-[0_18px_40px_rgba(212,186,117,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(212,186,117,0.24)]"
                      >
                        {journeyCopy.finishDayCta}
                      </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowNaturePause(true)}
                        className="button-nowrap inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3e0af,#d4ba75)] px-6 py-4 text-base font-semibold text-ink shadow-[0_18px_40px_rgba(212,186,117,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(212,186,117,0.24)]"
                      >
                        {journeyCopy.natureLeaveCta}
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={startRecoveryMinute}
                      className="button-nowrap inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3e0af,#d4ba75)] px-6 py-4 text-base font-semibold text-ink shadow-[0_18px_40px_rgba(212,186,117,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(212,186,117,0.24)]"
                    >
                      {journeyCopy.recoveryCta}
                    </button>
                  )}
                </div>
              ) : (
                <div className="animate-meditation-fade-up space-y-6">
                  <div className="rounded-[28px] border border-[#d8caa0]/18 bg-[linear-gradient(180deg,rgba(243,224,175,0.12),rgba(255,255,255,0.05))] px-5 py-6 text-center">
                    {currentDay.day < RHYTHM_JOURNEY_DAY_COUNT ? (
                      <>
                        <p className="text-sm uppercase tracking-[0.28em] text-[#f0d79c]">{journeyCopy.enoughEyebrow}</p>
                        <p className="mt-5 whitespace-pre-line font-serif text-[24px] leading-[1.8] text-white sm:text-[28px]">
                          {currentDay.completion}
                        </p>
                      </>
                    ) : (
                      <div className="space-y-5">
                        <p className="whitespace-pre-line font-serif text-[24px] leading-[1.8] text-white sm:text-[28px]">
                          {journeyCopy.day7Title}
                        </p>
                        <p className="whitespace-pre-line text-base leading-8 text-white/82">
                          {journeyCopy.day7Body}
                        </p>
                        <p className="whitespace-pre-line text-base leading-8 text-[#f4ead1]/86">
                          {journeyCopy.day7Transition}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {journeyCopy.rhythmChoices.map((option) => {
                            const selected = day7RhythmSelection === option.value;

                            return (
                              <Link
                                key={option.value}
                                href={getDailyRhythmRoute(option.value)}
                                onClick={() => handleDay7RhythmSelect(option.value)}
                              className={`button-nowrap flex min-h-[72px] items-center justify-center rounded-[24px] px-4 py-4 text-center text-sm font-semibold transition duration-200 ${
                                  selected
                                    ? "border border-[#f0d79c]/30 bg-[#f3e0af]/16 text-[#fff8e6]"
                                    : "border border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.07]"
                                }`}
                              >
                                {option.label}
                              </Link>
                            );
                          })}
                        </div>
                        {day7RhythmMessage ? (
                          <p className="whitespace-pre-line text-base leading-8 text-white/82">{day7RhythmMessage}</p>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {currentDay.day < RHYTHM_JOURNEY_DAY_COUNT ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="button-nowrap inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3e0af,#d4ba75)] px-6 py-3 text-sm font-semibold text-ink transition duration-300 hover:-translate-y-0.5"
                    >
                      {journeyCopy.nextCta}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {day7RhythmSelection ? (
                        <Link
                          href={getDailyRhythmRoute(day7RhythmSelection)}
                          className="button-nowrap inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3e0af,#d4ba75)] px-6 py-3 text-sm font-semibold text-ink transition duration-300 hover:-translate-y-0.5"
                        >
                          {rhythmButtonLabel}
                        </Link>
                      ) : null}
                      <Link
                        href="/"
                        className="button-nowrap inline-flex min-h-[54px] w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.07]"
                      >
                        {journeyCopy.returnHomeCta}
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
