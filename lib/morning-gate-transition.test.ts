import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");
const rhythmSource = readFileSync(new URL("./basic-rhythm.ts", import.meta.url), "utf8");

test("Awakening completion uses one guarded action to continue to the existing Energy Gate route", () => {
  assert.match(meditationPageSource, /const continueToEnergyHref = `\/meditation\?duration=180&type=morning-energy&returnTo=\$\{encodeURIComponent\(morningGateReturnHref\)\}`/);
  assert.match(meditationPageSource, /function handleContinueToEnergy\(\) \{[\s\S]*setNavigationPendingAction\("continue"\);[\s\S]*router\.push\(continueToEnergyHref\);/);
  assert.match(meditationPageSource, /onClick=\{handleContinueToEnergy\}/);
  assert.match(meditationPageSource, /disabled=\{navigationPendingAction !== null\}/);
  assert.doesNotMatch(meditationPageSource, /<Link\s+href=\{continueToEnergyHref\}/);
});

test("Energy Gate keeps the existing morning-energy route and secondary Awakening completion actions", () => {
  assert.match(rhythmSource, /routeType: "morning-energy"/);
  assert.match(meditationPageSource, /isEnergyGate = meditationType === "morning" && meditationDoor === "energy"/);
  assert.match(meditationPageSource, /href=\{morningGateReturnHref\}/);
  assert.match(meditationPageSource, /href=\{finishForTodayHref\}/);
});

test("the continuation contract is shared by Japanese, Korean, and English without new completion writes", () => {
  assert.match(meditationPageSource, /continueCta: "Energy Gateへ進む"/);
  assert.match(meditationPageSource, /continueCta: "Energy Gate로 이어가기"/);
  assert.match(meditationPageSource, /continueCta: "Continue to Energy Gate"/);
  const continuationHandler = meditationPageSource.slice(
    meditationPageSource.indexOf("function handleContinueToEnergy"),
    meditationPageSource.indexOf("function logStructuredMorningAmbientState")
  );
  assert.doesNotMatch(continuationHandler, /ensureBasicGardenCompletionSynced|runMeditationComplete|triggerMeditationCompletion/);
});
