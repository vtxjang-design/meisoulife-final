import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

function getSettingsSource(functionName: string, nextFunctionName: string) {
  return meditationPageSource.slice(
    meditationPageSource.indexOf(`function ${functionName}`),
    meditationPageSource.indexOf(`function ${nextFunctionName}`)
  );
}

function getLanguageNarrationSource(language: "kr" | "en") {
  const gratitudeSource = meditationPageSource.slice(
    meditationPageSource.indexOf("const gratitudeGateNarration"),
    meditationPageSource.indexOf("const sleepGateNarration")
  );
  const startMarker = `  ${language}: [`;
  const endMarker = language === "kr" ? "  en: [" : "  ]\n};";

  return gratitudeSource.slice(
    gratitudeSource.indexOf(startMarker),
    gratitudeSource.indexOf(endMarker, gratitudeSource.indexOf(startMarker) + startMarker.length)
  );
}

test("Korean and English Evening Gate voices use the approved relaxed pacing", () => {
  const releaseSettings = getSettingsSource("getReleaseGateSpeechSettings", "getGratitudeGateSpeechSettings");
  const gratitudeSettings = getSettingsSource("getGratitudeGateSpeechSettings", "getSleepGateSpeechSettings");
  const sleepSettings = getSettingsSource("getSleepGateSpeechSettings", "pickStructuredMorningVoice");

  assert.match(releaseSettings, /lang: "ko-KR",[\s\S]*?rate: 0\.65/);
  assert.match(releaseSettings, /lang: "en-US",[\s\S]*?rate: 0\.67/);
  assert.match(gratitudeSettings, /lang: "ko-KR",[\s\S]*?rate: 0\.63/);
  assert.match(gratitudeSettings, /lang: "en-US",[\s\S]*?rate: 0\.65/);
  assert.match(sleepSettings, /lang: "ko-KR",[\s\S]*?rate: 0\.6/);
  assert.match(sleepSettings, /lang: "en-US",[\s\S]*?rate: 0\.62/);
});

test("Korean and English Gratitude narration completes its compassionate arc before the final ten seconds", () => {
  const expectedTimeline = [12, 28, 45, 64, 84, 105, 121, 135, 154];
  const koreanSource = getLanguageNarrationSource("kr");
  const englishSource = getLanguageNarrationSource("en");
  const extractTimeline = (source: string) =>
    [...source.matchAll(/at:\s*(\d+),\s*key:\s*"gratitude-\d+"/g)].map((match) => Number(match[1]));

  assert.deepEqual(extractTimeline(koreanSource), expectedTimeline);
  assert.deepEqual(extractTimeline(englishSource), expectedTimeline);
  assert.match(koreanSource, /나 자신만으로도 충분합니다/);
  assert.match(koreanSource, /이제, 편안히 쉬세요/);
  assert.match(englishSource, /the simple fact that you are here/);
  assert.match(englishSource, /Now, rest gently/);
  assert.doesNotMatch(koreanSource, /at:\s*(184|200)/);
  assert.doesNotMatch(englishSource, /at:\s*(184|200)/);
});
