import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

test("Japanese Focus and Calm narration use the same lower pitch", () => {
  const focusSettingsSource = meditationPageSource.slice(
    meditationPageSource.indexOf("function getFocusGateSpeechSettings"),
    meditationPageSource.indexOf("function getCalmGateSpeechSettings")
  );
  const calmSettingsSource = meditationPageSource.slice(
    meditationPageSource.indexOf("function getCalmGateSpeechSettings"),
    meditationPageSource.indexOf("function getReleaseGateSpeechSettings")
  );

  assert.match(focusSettingsSource, /lang: "ja-JP",[\s\S]*?rate: 0\.72,[\s\S]*?pitch: 0\.9,[\s\S]*?volume: 0\.9/);
  assert.match(calmSettingsSource, /lang: "ja-JP",[\s\S]*?rate: 0\.64,[\s\S]*?pitch: 0\.9,[\s\S]*?volume: 1/);
});
