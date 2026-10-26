import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  getGuidedSpeechQueueAction,
  GUIDED_SPEECH_UNLOCK_TEXT,
  GUIDED_SPEECH_UNLOCK_VOLUME
} from "./guided-speech.ts";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

test("mobile speech priming uses an audible-engine-safe punctuation utterance", () => {
  assert.equal(GUIDED_SPEECH_UNLOCK_TEXT, ".");
  assert.ok(GUIDED_SPEECH_UNLOCK_VOLUME > 0);
  assert.ok(GUIDED_SPEECH_UNLOCK_VOLUME <= 0.01);
});

test("guided speech waits for a busy queue before speaking", () => {
  assert.equal(
    getGuidedSpeechQueueAction({ speaking: true, pending: false }, 0, 12),
    "retry"
  );
  assert.equal(
    getGuidedSpeechQueueAction({ speaking: false, pending: true }, 11, 12),
    "retry"
  );
});

test("guided speech performs one delayed recovery after the retry limit", () => {
  assert.equal(
    getGuidedSpeechQueueAction({ speaking: true, pending: true }, 12, 12),
    "cancel-and-retry"
  );
  assert.equal(
    getGuidedSpeechQueueAction({ speaking: true, pending: true }, 13, 12),
    "stop"
  );
});

test("guided speech starts immediately when the queue is ready", () => {
  assert.equal(
    getGuidedSpeechQueueAction({ speaking: false, pending: false }, 0, 12),
    "speak"
  );
});

test("program start primes narration inside the user gesture before the first await", () => {
  const handlerStart = meditationPageSource.indexOf("async function handleProgramAudioStart()");
  const handlerEnd = meditationPageSource.indexOf("function handlePauseToggle()", handlerStart);
  const handlerSource = meditationPageSource.slice(handlerStart, handlerEnd);
  const firstUnlock = handlerSource.indexOf("unlockStructuredMorningSpeech();");
  const firstAwait = handlerSource.indexOf("await unlockCompletionChime();");

  assert.ok(handlerStart >= 0);
  assert.ok(firstUnlock >= 0);
  assert.ok(firstAwait > firstUnlock);
});

test("guided narration never speaks immediately after canceling the mobile queue", () => {
  assert.doesNotMatch(meditationPageSource, /synth\.cancel\(\);\s*synth\.speak\(/);
  assert.match(meditationPageSource, /if \(synth\.paused\) \{\s*synth\.resume\(\);/);
});

test("mobile media interruptions do not become user pause actions", () => {
  for (const gate of ["release", "gratitude", "sleep"]) {
    assert.match(
      meditationPageSource,
      new RegExp(`\\[${gate}-gate\\] media yielded to narration`)
    );
  }

  assert.doesNotMatch(
    meditationPageSource,
    /onPause=\{\(\) => \{\s*if \(!isCompleteRef\.current\) \{\s*setIsPaused\(true\);/
  );
});

test("guided media resumes after narration without changing the session timer", () => {
  assert.match(
    meditationPageSource,
    /function markGuidedNarrationFinished\(\)[\s\S]*?resumeActiveGateMediaAfterNarration\(\);/
  );
  assert.match(meditationPageSource, /utterance\.onstart = markGuidedNarrationStarted;/);
  assert.match(meditationPageSource, /markGuidedNarrationFinished\(\);/);
});
