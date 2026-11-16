import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  getMorningGateRemainingSeconds,
  resolveMorningGateCaption,
  resolveMorningGateMasterSource
} from "./morning-gate-playback.ts";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");
const morningPlaybackRegion = meditationPageSource.slice(
  meditationPageSource.indexOf("function logStructuredMorningAmbientState"),
  meditationPageSource.indexOf("useEffect(() => {\n    isPausedRef.current")
);
const morningResumeRegion = meditationPageSource.slice(
  meditationPageSource.indexOf("async function resumeStructuredMorningAmbient"),
  meditationPageSource.indexOf("async function stopStructuredMorningAmbient")
);

test("selects the dedicated pre-mixed master for every Morning Gate language", () => {
  for (const gate of ["awakening", "energy", "vision"] as const) {
    for (const language of ["jp", "kr", "en"] as const) {
      assert.equal(
        resolveMorningGateMasterSource(gate, language),
        `/audio/morning-gate/${gate}-${language}.m4a`
      );
    }
  }
});

test("captions resolve from the audible audio timeline at canonical cue onsets", () => {
  const lines = [
    { at: 60, key: "first", text: "First" },
    { at: 66.5, key: "second", text: "Second" }
  ];

  assert.equal(resolveMorningGateCaption(lines, 59.999), null);
  assert.equal(resolveMorningGateCaption(lines, 60)?.key, "first");
  assert.equal(resolveMorningGateCaption(lines, 66.499)?.key, "first");
  assert.equal(resolveMorningGateCaption(lines, 66.5)?.key, "second");
  assert.equal(getMorningGateRemainingSeconds(66.5), 113.5);
});

test("Morning playback uses one stable persistent audio element and preserves currentTime on resume", () => {
  assert.match(meditationPageSource, /const morningAudioRef = useRef<HTMLAudioElement \| null>\(null\)/);
  assert.match(meditationPageSource, /<audio\s+ref=\{morningAudioRef\}\s+src=\{structuredMorningAudioSource\}/);
  assert.doesNotMatch(morningPlaybackRegion, /new Audio\(|createElement\(["']audio/);
  assert.doesNotMatch(morningResumeRegion, /currentTime\s*=/);
  assert.match(morningResumeRegion, /restartFromBeginning: false/);
});

test("Morning production playback does not synthesize or Web-Audio-decode narration", () => {
  assert.doesNotMatch(morningPlaybackRegion, /speechSynthesis|SpeechSynthesisUtterance|decodeAudioData|AudioBufferSourceNode/);
  assert.match(morningPlaybackRegion, /await audio\.play\(\)/);
});

test("Morning videos stay muted and playback failure remains recoverable by a new user tap", () => {
  for (const ref of ["affirmationVideoRef", "energyVideoRef", "visionVideoRef"]) {
    assert.match(meditationPageSource, new RegExp(`ref=\\{${ref}\\}[\\s\\S]{0,260}muted`));
  }
  assert.match(meditationPageSource, /onError=\{\(\) => \{[\s\S]*setShowAmbientRetry\(true\);[\s\S]*setRequiresExplicitAudioStart\(true\)/);
  assert.match(meditationPageSource, /onClick=\{handleAmbientRetry\}/);
});

test("Morning implementation remains isolated from other Gate media paths", () => {
  assert.doesNotMatch(morningPlaybackRegion, /calmAudioRef|focusVideoRef|rechargeVideoRef|releaseVideoRef|journeyAudioRef/);
  assert.match(meditationPageSource, /if \(isStructuredMorningGate\) \{[\s\S]*startStructuredMorningAmbient\(\{ restartFromBeginning: true \}\)[\s\S]*return;/);
});
