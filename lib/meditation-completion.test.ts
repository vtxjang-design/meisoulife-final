import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { shouldPlayMeditationCompletionChime } from "./meditation-completion.ts";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

test("completion chime stays disabled for the three BASIC Evening Gates only", () => {
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
    shouldPlayMeditationCompletionChime({ meditationType: "morning", meditationDoor: "affirmation", playSoundOnComplete: true }),
    true
  );
  assert.equal(
    shouldPlayMeditationCompletionChime({ meditationType: "day", meditationDoor: "focus", playSoundOnComplete: true }),
    true
  );
  assert.equal(
    shouldPlayMeditationCompletionChime({ meditationType: "night", meditationDoor: "rest", playSoundOnComplete: true }),
    true
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
