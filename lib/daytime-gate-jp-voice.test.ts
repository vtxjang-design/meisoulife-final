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

test("Calm Gate uses localized single-track videos instead of browser speech synthesis", () => {
  const calmEffectSource = meditationPageSource.slice(
    meditationPageSource.indexOf("if (!isCalmGate || isComplete || isPaused || needsUserStart"),
    meditationPageSource.indexOf("if (!isReleaseGate || isComplete || isPaused || needsUserStart")
  );

  assert.match(meditationPageSource, /calm-gate-jp\.mp4/);
  assert.match(meditationPageSource, /calm-gate-kr\.mp4/);
  assert.match(meditationPageSource, /calm-gate-en\.mp4/);
  assert.match(meditationPageSource, /const calmGateVideoSource = CALM_GATE_VIDEO_SRC\[localizedLanguage\]/);
  assert.doesNotMatch(meditationPageSource, /function unlockCalmGateSpeech/);
  assert.doesNotMatch(meditationPageSource, /function getCalmGateSpeechSettings/);
  assert.doesNotMatch(calmEffectSource, /speechSynthesis|SpeechSynthesisUtterance/);
  assert.match(meditationPageSource, /このナレーションにはAI生成音声を使用しています/);

  for (const language of ["jp", "kr", "en"]) {
    const asset = new URL(`../public/one-minute-reset/basic/daytime/calm-gate-${language}.mp4`, import.meta.url);
    assert.ok(statSync(asset).size > 1_000_000, `${language} Calm Gate master video should contain production media`);
  }
});
