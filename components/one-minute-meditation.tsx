"use client";

import { useState } from "react";

export default function OneMinuteMeditation() {
  const [started, setStarted] = useState(false);

  return (
    <section className="p-6">
      {!started ? (
        <div className="text-center">
          <h2>1-Minute Meditation</h2>
          <button onClick={() => setStarted(true)}>Start</button>
        </div>
      ) : (
        <div className="text-center">
          <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black">
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/5RTxWODbmak?autoplay=1&playsinline=1&rel=0"
                title="1 minute meditation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          <button onClick={() => setStarted(false)}>Back</button>
        </div>
      )}
    </section>
  );
}
