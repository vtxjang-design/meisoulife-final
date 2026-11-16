import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  formatMorningGateRemainingTime,
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
    { at: 66.75, key: "second", text: "Second" }
  ];

  assert.equal(resolveMorningGateCaption(lines, 59.999), null);
  assert.equal(resolveMorningGateCaption(lines, 60)?.key, "first");
  assert.equal(resolveMorningGateCaption(lines, 66.749)?.key, "first");
  assert.equal(resolveMorningGateCaption(lines, 66.75)?.key, "second");
  assert.equal(getMorningGateRemainingSeconds(66.75), 113.25);
});

test("Morning timer floors the audio timeline and always formats strict MM:SS", () => {
  assert.equal(formatMorningGateRemainingTime(0), "03:00");
  assert.equal(formatMorningGateRemainingTime(32.291811500683565), "02:27");
  assert.equal(formatMorningGateRemainingTime(179.001), "00:00");
  assert.equal(formatMorningGateRemainingTime(180), "00:00");
  assert.match(formatMorningGateRemainingTime(147.708188499316435), /^\d{2}:\d{2}$/);
  assert.doesNotMatch(formatMorningGateRemainingTime(147.708188499316435), /\./);
});

test("Morning playback uses one stable persistent audio element and preserves currentTime on resume", () => {
  assert.match(meditationPageSource, /const morningAudioRef = useRef<HTMLAudioElement \| null>\(null\)/);
  assert.match(meditationPageSource, /<audio\s+ref=\{morningAudioRef\}\s+src=\{structuredMorningAudioSource\}/);
  assert.doesNotMatch(morningPlaybackRegion, /new Audio\(|createElement\(["']audio/);
  assert.doesNotMatch(morningResumeRegion, /currentTime\s*=/);
  assert.match(morningResumeRegion, /restartFromBeginning: false/);
});

test("Morning timeline follows audio currentTime for playback, seeking, completion, and video sync", () => {
  assert.match(meditationPageSource, /function syncStructuredMorningTimeline\(audio: HTMLAudioElement\)/);
  assert.match(meditationPageSource, /morningPlaybackPositionRef\.current = currentTime/);
  assert.match(meditationPageSource, /setSecondsLeft\(getMorningGateRemainingSeconds\(currentTime\)\)/);
  assert.match(meditationPageSource, /video\.currentTime = currentTime/);
  assert.match(meditationPageSource, /onTimeUpdate=\{\(event\) => \{[\s\S]*syncStructuredMorningTimeline\(event\.currentTarget\)/);
  assert.match(meditationPageSource, /onSeeking=\{\(event\) => \{[\s\S]*syncStructuredMorningTimeline\(event\.currentTarget\)/);
  assert.match(meditationPageSource, /onSeeked=\{\(event\) => \{[\s\S]*syncStructuredMorningTimeline\(event\.currentTarget\)/);
  assert.match(meditationPageSource, /onEnded=\{\(\) => \{[\s\S]*morningPlaybackPositionRef\.current = AFFIRMATION_TOTAL_SECONDS;[\s\S]*setSecondsLeft\(0\)/);
});

test("Morning language changes restore the same audio position without remounting the element", () => {
  assert.match(meditationPageSource, /const sourceChanged = morningPlaybackSourceRef\.current !== structuredMorningAudioSource/);
  assert.match(meditationPageSource, /const sameGate = morningPlaybackGateRef\.current === structuredMorningGate/);
  assert.match(meditationPageSource, /const restoreTime = sourceChanged && sameGate \? morningPlaybackPositionRef\.current : 0/);
  assert.match(meditationPageSource, /audio\.currentTime = restoreTime/);
  assert.doesNotMatch(meditationPageSource, /key=\{`morning-gate-audio/);
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
