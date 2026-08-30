import assert from "node:assert/strict";
import test from "node:test";
import { getStructuredMorningSpeechSettings } from "./morning-gate-voice.ts";

test("Morning Gate uses a stable lower voice profile across all three doors", () => {
  for (const door of ["affirmation", "energy", "vision"] as const) {
    assert.equal(getStructuredMorningSpeechSettings("jp", door).pitch, 0.87);
    assert.equal(getStructuredMorningSpeechSettings("kr", door).pitch, 0.9);
    assert.equal(getStructuredMorningSpeechSettings("en", door).pitch, 0.93);
  }

  assert.equal(getStructuredMorningSpeechSettings("jp", "affirmation").preferredNames[0], "Otoya");
  assert.equal(getStructuredMorningSpeechSettings("kr", "affirmation").preferredNames[0], "InJoon");
  assert.equal(getStructuredMorningSpeechSettings("en", "affirmation").preferredNames[0], "Daniel");
});

test("Awakening stays calm, Energy is slightly clearer, and Vision is the most spacious", () => {
  for (const language of ["jp", "kr", "en"] as const) {
    const awakening = getStructuredMorningSpeechSettings(language, "affirmation");
    const energy = getStructuredMorningSpeechSettings(language, "energy");
    const vision = getStructuredMorningSpeechSettings(language, "vision");

    assert.ok(energy.rate > awakening.rate);
    assert.ok(vision.rate < awakening.rate);
  }

  assert.deepEqual(
    ["affirmation", "energy", "vision"].map((door) =>
      getStructuredMorningSpeechSettings("jp", door as "affirmation" | "energy" | "vision").rate
    ),
    [0.66, 0.68, 0.63]
  );
});
