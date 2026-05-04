"use client";

import { useEffect, useState } from "react";

type OneMinuteMeditationProps = {
  open: boolean;
  onClose: () => void;
};

const MEDITATION_DURATION = 60;
const MEDITATION_EMBED_URL = "https://www.youtube.com/embed/5RTxWODbmak?autoplay=1&mute=1&playsinline=1";

export default function OneMinuteMeditation({ open, onClose }: OneMinuteMeditationProps) {
  const [secondsLeft, setSecondsLeft] = useState(MEDITATION_DURATION);
  const [isComplete, setIsComplete] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [videoSrc, setVideoSrc] = useState("");

  function startMeditation() {
    setSecondsLeft(MEDITATION_DURATION);
    setIsComplete(false);
    setIframeKey((current) => current + 1);
    setVideoSrc(MEDITATION_EMBED_URL);
  }

  useEffect(() => {
    if (!open) {
      setSecondsLeft(MEDITATION_DURATION);
      setIsComplete(false);
      setVideoSrc("");
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
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open, isComplete, videoSrc, iframeKey]);

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
            <p className="text-sm uppercase tracking-[0.28em] text-[#d8bf83]">1分瞑想</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">今この1分で、呼吸を整えましょう</h2>
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

        <div className="mt-5 overflow-hidden rounded-[20px] border border-white/10 bg-black">
          <div className="border-b border-white/10 px-5 py-4 text-center">
            <p className="text-3xl font-semibold text-white transition-all duration-300 sm:text-4xl">{secondsLeft}</p>
          </div>
          <div className="aspect-video w-full">
            {open && videoSrc ? (
              <iframe
                key={iframeKey}
                className="h-full w-full"
                src="https://www.youtube.com/embed/5RTxWODbmak?autoplay=1&mute=1&playsinline=1"
                title="1 minute meditation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {!isComplete ? (
            <button
              type="button"
              onClick={() => {
                setSecondsLeft(0);
                setIsComplete(true);
              }}
              className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-emerald-500"
            >
              1分を終える
            </button>
          ) : (
            <div className="rounded-[20px] border border-emerald-400/25 bg-emerald-400/10 px-5 py-5 text-center text-white transition duration-300">
              <p className="text-lg font-semibold">今日、あなたは自分に戻りました。</p>
              <p className="mt-2 text-sm leading-7 text-white/78">この小さな1分が、共生の始まりです。</p>
              <button
                type="button"
                onClick={startMeditation}
                className="mt-4 inline-flex min-h-[50px] items-center justify-center rounded-full border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-[#0b1728] transition duration-300 hover:bg-stone-100"
              >
                もう一度1分
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
