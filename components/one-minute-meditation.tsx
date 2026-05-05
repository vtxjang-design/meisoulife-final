"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSiteCopy } from "@/lib/i18n";
import { markDailyRhythmCompleted } from "@/lib/return-rhythm";

type OneMinuteMeditationProps = {
  open: boolean;
  onClose: () => void;
};

const MEDITATION_DURATION = 60;
const MEDITATION_EMBED_URL = "https://www.youtube.com/embed/5RTxWODbmak?autoplay=1&mute=1&playsinline=1";
const BREATHING_FADE_MS = 600;
const LINE_RHYTHM_URL = process.env.NEXT_PUBLIC_LINE_FREE_URL || "https://lin.ee/z8Lzvvs";
const LAST_REFLECTION_KEY = "meisoulife_last_reflection";
const LAST_REFLECTION_AT_KEY = "meisoulife_last_reflection_at";
type ReflectionOption = "calm" | "deepen" | "together";

export default function OneMinuteMeditation({ open, onClose }: OneMinuteMeditationProps) {
  const copy = useSiteCopy();
  const breathingGuides = copy.modal.breathingGuides;
  const reflectionOptions = copy.modal.reflections;
  const reflectionMap = {
    calm: reflectionOptions[0],
    deepen: reflectionOptions[1],
    together: reflectionOptions[2]
  } as const;
  const [secondsLeft, setSecondsLeft] = useState(MEDITATION_DURATION);
  const [isComplete, setIsComplete] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [videoSrc, setVideoSrc] = useState("");
  const [breathingGuideIndex, setBreathingGuideIndex] = useState(0);
  const [isGuideVisible, setIsGuideVisible] = useState(true);
  const [isTimerVisible, setIsTimerVisible] = useState(true);
  const [selectedReflection, setSelectedReflection] = useState<ReflectionOption | null>(null);

  function startMeditation() {
    setSecondsLeft(MEDITATION_DURATION);
    setIsComplete(false);
    setIframeKey((current) => current + 1);
    setVideoSrc(MEDITATION_EMBED_URL);
    setBreathingGuideIndex(0);
    setIsGuideVisible(true);
    setIsTimerVisible(true);
    setSelectedReflection(null);
  }

  function completeMeditation() {
    setSecondsLeft(0);
    setIsComplete(true);
    markDailyRhythmCompleted();
  }

  function handleReflectionSelect(reflectionKey: ReflectionOption) {
    setSelectedReflection(reflectionKey);
    window.localStorage.setItem(LAST_REFLECTION_KEY, reflectionKey);
    window.localStorage.setItem(LAST_REFLECTION_AT_KEY, new Date().toISOString());
  }

  function handleTogetherContinue() {
    window.open(LINE_RHYTHM_URL, "_blank", "noopener,noreferrer");
  }

  useEffect(() => {
    if (!open) {
      setSecondsLeft(MEDITATION_DURATION);
      setIsComplete(false);
      setVideoSrc("");
      setBreathingGuideIndex(0);
      setIsGuideVisible(true);
      setIsTimerVisible(true);
      setSelectedReflection(null);
      return;
    }

    startMeditation();
  }, [open]);

  useEffect(() => {
    if (!open || isComplete || !videoSrc) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setIsComplete(true);
          markDailyRhythmCompleted();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open, isComplete, videoSrc, iframeKey]);

  useEffect(() => {
    if (!open || isComplete) {
      setIsTimerVisible(true);
      return;
    }

    setIsTimerVisible(false);
    const timer = window.setTimeout(() => {
      setIsTimerVisible(true);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [secondsLeft, open, isComplete]);

  useEffect(() => {
    if (!open || isComplete || !videoSrc) {
      return;
    }

    const currentGuide = breathingGuides[breathingGuideIndex];
    const fadeOutTimer = window.setTimeout(() => {
      setIsGuideVisible(false);
    }, Math.max(currentGuide.duration - BREATHING_FADE_MS, 1200));

    const timer = window.setTimeout(() => {
      setBreathingGuideIndex((current) => (current + 1) % breathingGuides.length);
      setIsGuideVisible(true);
    }, currentGuide.duration);

    return () => {
      window.clearTimeout(fadeOutTimer);
      window.clearTimeout(timer);
    };
  }, [open, isComplete, videoSrc, breathingGuideIndex, breathingGuides]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#07111f]/70 px-4 py-6 transition-all duration-300 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-2xl rounded-[28px] border border-white/15 bg-[#0b1728] p-4 shadow-[0_28px_80px_rgba(7,17,31,0.42)] transition-all duration-300 sm:p-6 ${
          open ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.98]"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#d8bf83]">{copy.modal.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{copy.modal.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white/80 transition hover:bg-white/10"
            aria-label="Close meditation modal"
          >
            ×
          </button>
        </div>

        {!isComplete ? (
          <>
            <div className="mt-5 overflow-hidden rounded-[20px] border border-white/10 bg-black">
              <div className="border-b border-white/10 px-5 py-4 text-center">
                <p
                  className={`text-3xl font-medium text-white/78 transition-all duration-500 ease-in-out sm:text-4xl ${
                    isTimerVisible ? "scale-100 opacity-100" : "scale-[0.975] opacity-55"
                  }`}
                >
                  {secondsLeft}
                </p>
              </div>
              <div className="relative flex min-h-[420px] w-full items-center justify-center overflow-hidden bg-[#050b14] sm:min-h-[560px]">
                {open && videoSrc ? (
                  <>
                    <div className="absolute inset-0 scale-[1.8] opacity-35 blur-2xl">
                      <iframe
                        key={`ambient-${iframeKey}`}
                        className="h-full w-full"
                        src={videoSrc}
                        title="1 minute meditation ambient"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_18%,rgba(5,11,20,0.38)_56%,rgba(5,11,20,0.88)_100%)]" />
                    <div className="relative z-10 aspect-[9/16] h-full max-h-[78vh] w-full max-w-[340px] overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:max-w-[360px]">
                      <iframe
                        key={iframeKey}
                        className="h-full w-full"
                        src={videoSrc}
                        title="1 minute meditation"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-6">
                      <p
                        className={`rounded-full bg-black/22 px-4 py-1.5 text-center text-xs font-medium tracking-[0.18em] text-white/70 backdrop-blur-[2px] transition-all duration-700 sm:text-sm ${
                          isGuideVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                        }`}
                      >
                        {breathingGuides[breathingGuideIndex].text}
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={completeMeditation}
                className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-emerald-500"
              >
                {copy.modal.endButton}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-6 text-center text-white animate-fade-in sm:px-8 sm:py-8">
            <p className="text-xl font-semibold sm:text-2xl">{copy.modal.completeTitle}</p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/72 sm:text-base">{copy.modal.completeBody}</p>

            <div className="mt-6 flex flex-col gap-3">
              <p className="text-sm leading-7 text-white/64 sm:text-base">{copy.modal.reflectionQuestion}</p>
              {reflectionOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleReflectionSelect(option.key)}
                  className={`inline-flex min-h-[50px] w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition duration-300 ${
                    selectedReflection === option.key
                      ? "border border-emerald-300/30 bg-emerald-400/12 text-white"
                      : "border border-white/10 bg-white/5 text-white/78 hover:bg-white/8"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {selectedReflection ? (
              <div className="mt-7 border-t border-white/10 pt-6 animate-fade-in">
                <p className="text-sm leading-7 text-white/72 sm:text-base">
                  {reflectionMap[selectedReflection].message}
                </p>
                <div className="mt-4 animate-fade-in">
                  {selectedReflection === "calm" ? (
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0b1728] transition duration-300 hover:bg-stone-100"
                    >
                      {reflectionMap[selectedReflection].ctaLabel}
                    </button>
                  ) : null}

                  {selectedReflection === "deepen" ? (
                    <Link
                      href="/pricing?focus=growth"
                      className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0b1728] transition duration-300 hover:bg-stone-100"
                    >
                      {reflectionMap[selectedReflection].ctaLabel}
                    </Link>
                  ) : null}

                  {selectedReflection === "together" ? (
                    <button
                      type="button"
                      onClick={handleTogetherContinue}
                      className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0b1728] transition duration-300 hover:bg-stone-100"
                    >
                      {reflectionMap[selectedReflection].ctaLabel}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
