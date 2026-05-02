"use client";

import { useState } from "react";

export default function OneMinuteMeditation() {
  const [started, setStarted] = useState(false);

  return (
    <section className="p-6">
      {!started ? (
        <div className="text-center">
          <h2>1-Minute Meditation</h2>
          <button onClick={() => setStarted(true)}>
            Start
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p>Take a deep breath...</p>

          <button onClick={() => setStarted(false)}>
            Back
          </button>
        </div>
      )}
    </section>
  );
}
