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
