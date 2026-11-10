import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

test("Japanese Focus narration keeps its lower pitch", () => {
  const focusSettingsSource = meditationPageSource.slice(
    meditationPageSource.indexOf("function getFocusGateSpeechSettings"),
    meditationPageSource.indexOf("function getReleaseGateSpeechSettings")
  );

  assert.match(focusSettingsSource, /lang: "ja-JP",[\s\S]*?rate: 0\.72,[\s\S]*?pitch: 0\.9,[\s\S]*?volume: 0\.9/);
});

test("Calm Gate uses localized iPhone-safe audio masters instead of browser speech synthesis", () => {
  const calmEffectSource = meditationPageSource.slice(
    meditationPageSource.indexOf("if (!isCalmGate || isComplete || isPaused || needsUserStart"),
    meditationPageSource.indexOf("if (!isReleaseGate || isComplete || isPaused || needsUserStart")
  );

  assert.match(meditationPageSource, /calm-gate-jp\.m4a/);
  assert.match(meditationPageSource, /calm-gate-kr\.m4a/);
  assert.match(meditationPageSource, /calm-gate-en\.m4a/);
  assert.match(meditationPageSource, /const calmGateAudioSource = CALM_GATE_AUDIO_SRC\[localizedLanguage\]/);
  assert.doesNotMatch(meditationPageSource, /function unlockCalmGateSpeech/);
  assert.doesNotMatch(meditationPageSource, /function getCalmGateSpeechSettings/);
  assert.doesNotMatch(calmEffectSource, /speechSynthesis|SpeechSynthesisUtterance/);
  assert.match(meditationPageSource, /このナレーションにはAI生成音声を使用しています/);

  for (const language of ["jp", "kr", "en"]) {
    const asset = new URL(`../public/one-minute-reset/basic/daytime/calm-gate-${language}.m4a`, import.meta.url);
    assert.ok(statSync(asset).size > 1_000_000, `${language} Calm Gate master audio should contain production media`);
  }

  const videoAsset = new URL("../public/one-minute-reset/basic/daytime/calm-gate-video.mp4", import.meta.url);
  assert.ok(statSync(videoAsset).size > 500_000, "Calm Gate muted video should contain production media");
});

test("Calm Gate keeps its authorized iOS media element alive after an unexpected pause", () => {
  const calmMediaMarkup = meditationPageSource.slice(
    meditationPageSource.indexOf('key="calm-gate-muted-video"'),
    meditationPageSource.indexOf(") : !ambientVideoFailed && !isStructuredMorningGate")
  );
  const recoverySource = meditationPageSource.slice(
    meditationPageSource.indexOf("function scheduleCalmGatePlaybackRecovery"),
    meditationPageSource.indexOf("async function playRechargeGateVideo")
  );

  assert.match(calmMediaMarkup, /src=\{calmGateVideoSource\}[\s\S]*?muted/);
  assert.match(calmMediaMarkup, /<audio[\s\S]*?src=\{calmGateAudioSource\}/);
  assert.doesNotMatch(calmMediaMarkup, /<source|autoPlay|loop/);
  assert.match(calmMediaMarkup, /onPause=\{scheduleCalmGatePlaybackRecovery\}/);
  assert.match(calmMediaMarkup, /onStalled=\{scheduleCalmGatePlaybackRecovery\}/);
  assert.match(calmMediaMarkup, /onWaiting=\{scheduleCalmGatePlaybackRecovery\}/);
  assert.match(recoverySource, /isPausedRef\.current/);
  assert.match(recoverySource, /isCompleteRef\.current/);
  assert.match(recoverySource, /audio\.play\(\)/);
  assert.match(recoverySource, /setRequiresExplicitAudioStart\(true\)/);
});
