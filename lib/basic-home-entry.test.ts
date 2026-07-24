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
  BASIC_GARDEN_VISIBLE_MARK_CAP,
  BASIC_HOME_SECTION_ORDER,
  getBasicGardenCountMessage,
  getBasicGardenMeaningLine,
  getBasicGardenVisualModel,
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
const siteHeaderSource = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
const globalsCssSource = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

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
  assert.match(basicHomeSource, /現在の進行日/);
  assert.match(basicHomeSource, /累計チェックイン数/);
  assert.match(basicHomeSource, /현재 진행 일차/);
  assert.match(basicHomeSource, /누적 체크인/);
  assert.match(basicHomeSource, /Current program day/);
  assert.match(basicHomeSource, /Total check-ins/);
});

test("garden visual model stays truthful for zero one multiple and capped check-ins", () => {
  assert.deepEqual(getBasicGardenVisualModel(0), {
    recordedCheckIns: 0,
    visibleMarkCount: 0,
    hasRecordedRecovery: false,
    marks: []
  });

  const single = getBasicGardenVisualModel(1);
  assert.equal(single.recordedCheckIns, 1);
  assert.equal(single.visibleMarkCount, 1);
  assert.equal(single.hasRecordedRecovery, true);
  assert.equal(single.marks.length, 1);
  assert.deepEqual(single.marks[0], {
    x: 152,
    y: 158,
    radius: 7,
    anchorX: 146,
    anchorY: 165
  });

  const multiple = getBasicGardenVisualModel(5);
  assert.equal(multiple.recordedCheckIns, 5);
  assert.equal(multiple.visibleMarkCount, 5);
  assert.equal(multiple.marks.length, 5);

  const capped = getBasicGardenVisualModel(99);
  assert.equal(capped.recordedCheckIns, 99);
  assert.equal(capped.visibleMarkCount, BASIC_GARDEN_VISIBLE_MARK_CAP);
  assert.equal(capped.marks.length, BASIC_GARDEN_VISIBLE_MARK_CAP);
});

test("garden explanation copy stays calm and localized in all three languages", () => {
  assert.equal(getBasicGardenMeaningLine("jp"), "ひとつの回復が、ひとつの光として庭に残ります。");
  assert.equal(getBasicGardenMeaningLine("kr"), "한 번의 회복이, 하나의 빛으로 가든에 남습니다.");
  assert.equal(getBasicGardenMeaningLine("en"), "Each recovery remains in your Garden as a light.");
});

test("garden count message uses the real cumulative recovery count in each language", () => {
  assert.equal(getBasicGardenCountMessage("jp", 0), "まだこの庭に残っている回復はありません。");
  assert.equal(getBasicGardenCountMessage("jp", 3), "3回の回復が、この庭に残っています。");

  assert.equal(getBasicGardenCountMessage("kr", 0), "아직 이 가든에 남아 있는 회복은 없습니다.");
  assert.equal(getBasicGardenCountMessage("kr", 3), "3번의 회복이 이 가든에 남아 있습니다.");

  assert.equal(getBasicGardenCountMessage("en", 0), "No recorded recoveries remain in this Garden yet.");
  assert.equal(getBasicGardenCountMessage("en", 1), "1 recovery remains in this Garden.");
  assert.equal(getBasicGardenCountMessage("en", 3), "3 recoveries remain in this Garden.");
});

test("garden copy and source do not invent percentages or named growth stages", () => {
  assert.doesNotMatch(basicHomeSource, /Forest|Tree|Sprout|Seed|Next growth|next level|progress percentage/i);
});

test("recommended gate uses the dedicated recommendation marker and keeps the same route helper", () => {
  assert.match(basicHomeSource, /data-basic-recommendation-primary="true"/);
  assert.match(basicHomeSource, /router\.prefetch\(getBasicGateShortcutHref\(gate\.key\)\)/);
  assert.match(basicHomeSource, /handleGateCardClick\(event, gate\.key, href\)/);
});

test("compact gate dock keeps exactly three high-level gate options with the existing routes", () => {
  assert.match(basicHomeSource, /data-basic-gate-dock="desktop"/);
  assert.match(basicHomeSource, /data-basic-gate-dock="mobile"/);
  assert.match(basicHomeSource, /data-basic-gate-dock-segment=\{gate\.key\}/);
  assert.match(basicHomeSource, /data-basic-gate-dock-primary=\{gate\.key\}/);
  assert.match(basicHomeSource, /data-basic-gate-dock-alternative=\{gate\.key\}/);
  assert.match(basicHomeSource, /getBasicGateShortcutHref\(gate\.key\)/);
  assert.equal(getBasicGateShortcutHref("morning"), "/program/basic?rhythm=morning#gate-morning");
  assert.equal(getBasicGateShortcutHref("daytime"), "/program/basic?rhythm=daytime#gate-daytime");
  assert.equal(getBasicGateShortcutHref("evening"), "/program/basic?rhythm=evening#gate-evening");
});

test("desktop gate dock preserves chronological order while mobile keeps recommendation-first alternatives", () => {
  assert.match(basicHomeSource, /data-basic-gate-order=\{index\}/);
  assert.match(basicHomeSource, /const alternativeGateKeys = useMemo\(\(\) => getAlternativeBasicGateKeys\(currentGateKey\), \[currentGateKey\]\)/);
  assert.match(basicHomeSource, /gates\s*\.filter\(\(gate\) => gate\.key === currentGateKey\)/);
  assert.match(basicHomeSource, /alternativeGateKeys\.map\(\(gateKey\) => \{/);
});

test("mobile alternative gate layout stacks below 400px and avoids truncating official gate names", () => {
  assert.match(basicHomeSource, /className="grid grid-cols-1 gap-2 min-\[400px\]:grid-cols-2"/);
  assert.doesNotMatch(
    basicHomeSource,
    /<p className="mt-\[[0-9]+px\] text-\[[0-9.]+rem\] font-(?:medium|semibold) leading-tight[^"]*truncate[^"]*">\s*\{isPending \? copy\.movingToGate : gate\.title\}/
  );
});

test("gate dock keeps the refined compact height targets on desktop and mobile", () => {
  assert.match(basicHomeSource, /className="grid min-h-\[76px\] grid-cols-3"/);
  assert.match(basicHomeSource, /className=\{`group relative flex min-h-\[86px\] min-w-0 items-center gap-3 overflow-hidden rounded-\[16px\]/);
  assert.match(basicHomeSource, /className=\{`group relative flex min-h-\[54px\] min-w-0 items-center gap-2 rounded-\[14px\]/);
});

test("compact gate dock removes long descriptions while detailed BASIC Rhythm descriptions remain below", () => {
  const recommendationSection = basicHomeSource.slice(
    basicHomeSource.indexOf('data-basic-recommendation'),
    basicHomeSource.indexOf('data-basic-course')
  );

  assert.doesNotMatch(recommendationSection, /copy\.gateSummaries\[gate\.key\]/);
  assert.doesNotMatch(recommendationSection, /copy\.gateSummaries\[gateKey\]/);
  assert.match(basicHomeSource, /<p className="mt-2 text-sm leading-6 text-\[rgba\(242,248,252,0\.78\)\]">\{copy\.gateSummaries\[gate\.key\]\}<\/p>/);
});

test("compact gate dock keeps one interactive element per option with no nested button", () => {
  const recommendationSection = basicHomeSource.slice(
    basicHomeSource.indexOf('data-basic-recommendation'),
    basicHomeSource.indexOf('data-basic-course')
  );

  assert.doesNotMatch(recommendationSection, /<button/);
  assert.match(recommendationSection, /<Link/);
  assert.match(recommendationSection, /aria-disabled=\{anotherPending\}/);
});

test("localized recommendation copy remains available in JP KR and EN", () => {
  assert.match(basicHomeSource, /recommendationBadge: "今のおすすめ"/);
  assert.match(basicHomeSource, /recommendationBadge: "지금의 추천"/);
  assert.match(basicHomeSource, /recommendationBadge: "Recommended now"/);
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

test("program basic hides the duplicate mobile tab row while preserving the hamburger menu", () => {
  assert.match(siteHeaderSource, /const hideMobileTabs = pathname === "\/program\/basic"/);
  assert.match(siteHeaderSource, /<div className=\{cn\("lg:hidden", hideMobileTabs && "hidden"\)\}>/);
  assert.match(siteHeaderSource, /const mobileDropdownLinks = useMemo/);
});

test("garden motion styles remain present and respect reduced motion", () => {
  assert.match(globalsCssSource, /\.garden-plant-dance\s*\{/);
  assert.match(globalsCssSource, /animation:\s*gardenPlantDance 11\.2s ease-in-out infinite alternate;/);
  assert.match(globalsCssSource, /animation:\s*gardenStemDance 6\.9s ease-in-out infinite alternate;/);
  assert.match(globalsCssSource, /animation:\s*gardenBranchLeftDance 7\.4s ease-in-out infinite alternate;/);
  assert.match(globalsCssSource, /animation:\s*gardenBranchRightDance 8\.9s ease-in-out infinite alternate;/);
  assert.match(globalsCssSource, /animation:\s*gardenLightBreathe 5\.8s ease-in-out infinite alternate;/);
  assert.match(globalsCssSource, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(globalsCssSource, /\.garden-glow,\s*[\s\S]*?\.garden-ground-breathe\s*\{\s*animation:\s*none !important;/);
});
