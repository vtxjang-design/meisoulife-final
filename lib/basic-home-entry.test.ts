import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

const tempDir = mkdtempSync(join(tmpdir(), "basic-home-entry-test-"));

const basicRhythmSource = readFileSync(new URL("./basic-rhythm.ts", import.meta.url), "utf8");
const basicHomeEntrySource = readFileSync(new URL("./basic-home-entry.ts", import.meta.url), "utf8").replace(
  './basic-rhythm"',
  './basic-rhythm.mjs"'
);

writeFileSync(
  join(tempDir, "basic-rhythm.mjs"),
  ts.transpileModule(basicRhythmSource, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText
);

writeFileSync(
  join(tempDir, "basic-home-entry.mjs"),
  ts.transpileModule(basicHomeEntrySource, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText
);

const basicHomeEntryModule = await import(pathToFileURL(join(tempDir, "basic-home-entry.mjs")).href);
const {
  BASIC_HOME_GATE_FALLBACK,
  BASIC_HOME_SECTION_ORDER,
  getAlternativeBasicGateKeys,
  getBasicGateShortcutHref,
  getBasicHomeRecommendedGateForDate,
  mapDefaultRhythmToBasicGateKey,
  mapRhythmParamToBasicGateKey,
  resolveBasicHomeRecommendedGate
} = basicHomeEntryModule;

const basicHomeSource = readFileSync(new URL("../components/basic-home.tsx", import.meta.url), "utf8");
const basicProgramPageSource = readFileSync(new URL("../app/program/basic/page.tsx", import.meta.url), "utf8");
const basicRhythmSourceForAssertions = readFileSync(new URL("./basic-rhythm.ts", import.meta.url), "utf8");

process.on("exit", () => {
  rmSync(tempDir, { recursive: true, force: true });
});

test("query rhythm values map to the existing BASIC gate keys", () => {
  assert.equal(mapRhythmParamToBasicGateKey("morning"), "morning");
  assert.equal(mapRhythmParamToBasicGateKey("day"), "daytime");
  assert.equal(mapRhythmParamToBasicGateKey("daytime"), "daytime");
  assert.equal(mapRhythmParamToBasicGateKey("night"), "evening");
  assert.equal(mapRhythmParamToBasicGateKey("evening"), "evening");
  assert.equal(mapRhythmParamToBasicGateKey("unknown"), null);
});

test("default rhythm values map to the existing BASIC gate keys", () => {
  assert.equal(mapDefaultRhythmToBasicGateKey("morning"), "morning");
  assert.equal(mapDefaultRhythmToBasicGateKey("day"), "daytime");
  assert.equal(mapDefaultRhythmToBasicGateKey("night"), "evening");
  assert.equal(mapDefaultRhythmToBasicGateKey(undefined), null);
});

test("time-of-day recommendation reuses the existing BASIC boundaries", () => {
  assert.equal(getBasicHomeRecommendedGateForDate(new Date("2026-07-23T05:00:00+09:00")), "morning");
  assert.equal(getBasicHomeRecommendedGateForDate(new Date("2026-07-23T11:59:59+09:00")), "morning");
  assert.equal(getBasicHomeRecommendedGateForDate(new Date("2026-07-23T12:00:00+09:00")), "daytime");
  assert.equal(getBasicHomeRecommendedGateForDate(new Date("2026-07-23T17:59:59+09:00")), "daytime");
  assert.equal(getBasicHomeRecommendedGateForDate(new Date("2026-07-23T18:00:00+09:00")), "evening");
});

test("stable fallback is used before local time resolves", () => {
  assert.deepEqual(resolveBasicHomeRecommendedGate({}), {
    gate: BASIC_HOME_GATE_FALLBACK,
    source: "fallback",
    usedFallback: true
  });
});

test("query and default rhythm take precedence over local time", () => {
  assert.deepEqual(
    resolveBasicHomeRecommendedGate({
      highlightedRhythm: "night",
      defaultRhythm: "morning",
      localTimeGate: "daytime"
    }),
    {
      gate: "evening",
      source: "query",
      usedFallback: false
    }
  );

  assert.deepEqual(
    resolveBasicHomeRecommendedGate({
      defaultRhythm: "day",
      localTimeGate: "evening"
    }),
    {
      gate: "daytime",
      source: "default-rhythm",
      usedFallback: false
    }
  );
});

test("all three gate choices remain available through recommendation helpers", () => {
  assert.deepEqual(getAlternativeBasicGateKeys("morning"), ["daytime", "evening"]);
  assert.deepEqual(getAlternativeBasicGateKeys("daytime"), ["morning", "evening"]);
  assert.deepEqual(getAlternativeBasicGateKeys("evening"), ["morning", "daytime"]);
});

test("shortcut links use the existing BASIC route with rhythm highlighting", () => {
  assert.equal(getBasicGateShortcutHref("morning"), "/program/basic?rhythm=morning#gate-morning");
  assert.equal(getBasicGateShortcutHref("daytime"), "/program/basic?rhythm=daytime#gate-daytime");
  assert.equal(getBasicGateShortcutHref("evening"), "/program/basic?rhythm=evening#gate-evening");
});

test("section order keeps garden and recommendation ahead of the existing BASIC course", () => {
  assert.deepEqual(BASIC_HOME_SECTION_ORDER, ["garden", "recommendation", "course"]);

  const gardenIndex = basicHomeSource.indexOf("data-basic-garden");
  const recommendationIndex = basicHomeSource.indexOf("data-basic-recommendation");
  const courseIndex = basicHomeSource.indexOf("data-basic-course");

  assert.notEqual(gardenIndex, -1);
  assert.notEqual(recommendationIndex, -1);
  assert.notEqual(courseIndex, -1);
  assert.ok(gardenIndex < recommendationIndex);
  assert.ok(recommendationIndex < courseIndex);
});

test("recovery garden is rendered once and localized for JP KR and EN", () => {
  assert.equal((basicHomeSource.match(/data-basic-garden/g) ?? []).length, 1);
  assert.match(basicHomeSource, /MY RECOVERY GARDEN/);
  assert.match(basicHomeSource, /私のリカバリーガーデン/);
  assert.match(basicHomeSource, /나의 리커버리 가든/);
});

test("garden statistics use explicit journey and check-in labels in all three languages", () => {
  assert.match(basicHomeSource, /旅の日/);
  assert.match(basicHomeSource, /累計チェックイン数/);
  assert.match(basicHomeSource, /여정의 날/);
  assert.match(basicHomeSource, /누적 체크인 횟수/);
  assert.match(basicHomeSource, /Journey Day/);
  assert.match(basicHomeSource, /Total check-ins/);
});

test("recommended gate has one primary presentation and keeps the same route helper", () => {
  assert.equal((basicHomeSource.match(/data-basic-recommendation-primary/g) ?? []).length, 1);
  assert.equal((basicHomeSource.match(/getBasicGateShortcutHref\(currentGate\.key\)/g) ?? []).length, 1);
});

test("daytime gate label no longer uses the sun emoji", () => {
  assert.doesNotMatch(basicRhythmSourceForAssertions, /🌞 Daytime Gate/);
});

test("basic-only content stays behind the existing basic membership guard", () => {
  assert.match(basicProgramPageSource, /<MembershipGuard requiredPlan="basic" showLogout=\{false\}>/);
  assert.match(basicProgramPageSource, /<BasicHome/);
});

test("existing progress values continue to be passed through unchanged", () => {
  assert.match(basicProgramPageSource, /currentDay=\{dashboardState\.challengeDay\}/);
  assert.match(basicProgramPageSource, /streakCount=\{dashboardState\.streakCount\}/);
});
