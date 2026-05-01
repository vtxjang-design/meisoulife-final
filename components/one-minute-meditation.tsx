"use client";

import { useState } from "react";

export default function OneMinuteMeditation() {

const YOUTUBE_SHORTS_URL = "https://youtube.com/shorts/BSz3w5wq-gM?si=UW9ZlVNBA3yEc4GX";
const YOUTUBE_EMBED_URL =
  "https://www.youtube.com/embed/BSz3w5wq-gM?autoplay=1&mute=0&playsinline=1";

export default function OneMinuteMeditation() {
  const [started, setStarted] = useState(false);

  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl rounded-[28px] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] sm:p-10">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-[#166534]">1-Minute Meditation</p>
          <h2 className="mt-4 text-3xl font-semibold text-[#111111] sm:text-4xl">Take one quiet minute to return.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#4b5563] sm:text-base">
            Press start, breathe gently, and let this one minute bring you back to yourself.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center">
          {!started ? (
            <div className="flex w-full max-w-md flex-col items-center">
              <div className="flex h-56 w-56 items-center justify-center rounded-full bg-[#dcfce7] shadow-inner sm:h-64 sm:w-64">
                <div className="flex h-44 w-44 items-center justify-center rounded-full border border-[#86efac] bg-white text-center shadow-sm sm:h-52 sm:w-52">
                  <div className="px-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-[#15803d]">Ready</p>
                    <p className="mt-3 text-2xl font-semibold text-[#111111] sm:text-3xl">1 minute</p>
                    <p className="mt-3 text-sm leading-6 text-[#4b5563]">A calm reset begins with one tap.</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStarted(true)}
                className="mt-8 inline-flex min-h-[52px] w-full max-w-md items-center justify-center rounded-full bg-[#166534] px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-[#15803d]"
              >
                Start
              </button>
            </div>
          ) : (
            <div className="w-full max-w-md animate-fade-in">
              <div className="overflow-hidden rounded-[24px] bg-[#f3f4f6] shadow-[0_18px_48px_rgba(15,23,42,0.10)]">
                <div className="aspect-[9/16] w-full">
                  <iframe
                    className="h-full w-full"
                    src={YOUTUBE_EMBED_URL}
                    title="1-Minute Meditation Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col items-center gap-3">
                <a
                  href={YOUTUBE_SHORTS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#166534] underline underline-offset-4 transition hover:text-[#15803d]"
                >
                  YouTubeで開く
                </a>

                <button
                  type="button"
                  onClick={() => setStarted(false)}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#111111] transition duration-300 hover:bg-zinc-50"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
