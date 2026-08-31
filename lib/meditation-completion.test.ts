import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { shouldPlayMeditationCompletionChime } from "./meditation-completion.ts";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

test("completion chime plays for all three Morning Gates", () => {
  for (const meditationDoor of ["affirmation", "energy", "vision"]) {
    assert.equal(
      shouldPlayMeditationCompletionChime({ meditationType: "morning", meditationDoor, playSoundOnComplete: true }),
      true
    );
  }
});

test("completion chime plays for all three Daytime Gates and their route aliases", () => {
  for (const meditationDoor of ["focus", "relax", "rest", "vitality", "recharge"]) {
    assert.equal(
      shouldPlayMeditationCompletionChime({ meditationType: "day", meditationDoor, playSoundOnComplete: true }),
      true
    );
  }
});

test("completion chime stays disabled for Evening Gates and unrelated sessions", () => {
  assert.equal(
    shouldPlayMeditationCompletionChime({ meditationType: "night", meditationDoor: "release", playSoundOnComplete: true }),
    false
  );
  assert.equal(
    shouldPlayMeditationCompletionChime({ meditationType: "night", meditationDoor: "gratitude", playSoundOnComplete: true }),
    false
  );
  assert.equal(
    shouldPlayMeditationCompletionChime({ meditationType: "night", meditationDoor: "sleep", playSoundOnComplete: true }),
    false
  );

  assert.equal(
    shouldPlayMeditationCompletionChime({ meditationType: "night", meditationDoor: "rest", playSoundOnComplete: true }),
    false
  );
  assert.equal(
    shouldPlayMeditationCompletionChime({ meditationType: "morning", meditationDoor: "other", playSoundOnComplete: true }),
    false
  );
  assert.equal(
    shouldPlayMeditationCompletionChime({ meditationType: "day", meditationDoor: "other", playSoundOnComplete: true }),
    false
  );
});

test("explicit sound disable still wins regardless of gate", () => {
  assert.equal(
    shouldPlayMeditationCompletionChime({ meditationType: "morning", meditationDoor: "affirmation", playSoundOnComplete: false }),
    false
  );
  assert.equal(
    shouldPlayMeditationCompletionChime({ meditationType: "night", meditationDoor: "sleep", playSoundOnComplete: false }),
    false
  );
});

test("meditation completion path uses the chime decision helper", () => {
  assert.match(meditationPageSource, /playSoundOnComplete:\s*shouldPlayMeditationCompletionChime\(\{/);
  assert.match(meditationPageSource, /meditationType,/);
  assert.match(meditationPageSource, /meditationDoor,/);
  assert.doesNotMatch(meditationPageSource, /if \(!isSleepGate\)\s*\{/);
});

test("completion chime is generated locally without missing audio-file dependencies", () => {
  const completionSource = readFileSync(new URL("./meditation-completion.ts", import.meta.url), "utf8");

  assert.doesNotMatch(completionSource, /ending-chime\.mp3|meditation-complete-chime\.mp3|new Audio\(/);
  assert.match(completionSource, /523\.25/);
  assert.match(completionSource, /783\.99/);
  assert.match(completionSource, /1046\.5/);
});

test("Morning and Daytime start gestures unlock the completion audio context", () => {
  assert.match(meditationPageSource, /async function unlockCompletionChime\(\)/);
  assert.match(
    meditationPageSource,
    /async function handleProgramAudioStart\(\)\s*\{\s*await unlockCompletionChime\(\);/
  );
});

test("completion stops pending narration before triggering the chime", () => {
  assert.match(
    meditationPageSource,
    /async function runMeditationComplete\(\)[\s\S]*?cancelGuidedSpeech\(\);[\s\S]*?await triggerMeditationCompletion\(\{/
  );
});
