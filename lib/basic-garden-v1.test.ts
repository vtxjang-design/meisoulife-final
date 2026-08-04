import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempDir = mkdtempSync(join(tmpdir(), "basic-garden-v1-test-"));
const entrySource = readFileSync(new URL("./basic-home-entry.ts", import.meta.url), "utf8").replace('./basic-rhythm"', './basic-rhythm.mjs"');
const rhythmSource = readFileSync(new URL("./basic-rhythm.ts", import.meta.url), "utf8");
const gardenV1Source = readFileSync(new URL("./basic-garden-v1.ts", import.meta.url), "utf8").replace('./basic-home-entry"', './basic-home-entry.mjs"');

for (const [name, source] of [["basic-rhythm.mjs", rhythmSource], ["basic-home-entry.mjs", entrySource], ["basic-garden-v1.mjs", gardenV1Source]] as const) {
  writeFileSync(join(tempDir, name), ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText);
}

const garden = await import(pathToFileURL(join(tempDir, "basic-garden-v1.mjs")).href);
const meditationSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");
const basicProgramSource = readFileSync(new URL("../app/program/basic/page.tsx", import.meta.url), "utf8");
const basicHomeSource = readFileSync(new URL("../components/basic-home.tsx", import.meta.url), "utf8");

process.on("exit", () => rmSync(tempDir, { recursive: true, force: true }));

test("today's Garden has calm, first-light, brighter, and complete states", () => {
  assert.deepEqual(garden.resolveTodayGardenState(0), { completedGateCount: 0, isComplete: false });
  assert.deepEqual(garden.resolveTodayGardenState(1), { completedGateCount: 1, isComplete: false });
  assert.deepEqual(garden.resolveTodayGardenState(2), { completedGateCount: 2, isComplete: false });
  assert.deepEqual(garden.resolveTodayGardenState(3), { completedGateCount: 3, isComplete: true });
  assert.deepEqual(garden.resolveTodayGardenState(9), { completedGateCount: 3, isComplete: true });
});

test("the next change reuses existing plant-stage calculation and has no final-stage pressure", () => {
  assert.deepEqual(garden.getNextBasicGardenChange(1), { checkInCount: 4, remainingCount: 3, milestoneStage: "sprout" });
  assert.deepEqual(garden.getNextBasicGardenChange(29), { checkInCount: 30, remainingCount: 1, milestoneStage: "first-flower" });
  assert.equal(garden.getNextBasicGardenChange(151), null);
});

test("only a confirmed reward writes the one-time Garden growth handoff", () => {
  assert.match(meditationSource, /payload\.rewardGranted &&[\s\S]*isCurrentBasicGardenGrowthMoment[\s\S]*BASIC_GARDEN_GROWTH_MOMENT_KEY/);
  assert.doesNotMatch(meditationSource, /if \(payload\.distinctGateCount === 3\)/);
});

test("a stale or malformed growth handoff cannot replay", () => {
  assert.equal(
    garden.isCurrentBasicGardenGrowthMoment(
      { activityDate: "2026-08-03", checkInCount: 4 },
      new Date("2026-08-04T00:00:00.000Z")
    ),
    false
  );
  assert.equal(
    garden.isCurrentBasicGardenGrowthMoment(
      { activityDate: "2026-08-04", checkInCount: 0 },
      new Date("2026-08-04T00:00:00.000Z")
    ),
    false
  );
  assert.match(basicProgramSource, /if \(pendingGrowthMoment\) \{[\s\S]*safeSessionStorageRemove\(BASIC_GARDEN_GROWTH_MOMENT_KEY\)/);
});

test("BASIC reads today's distinct ledger rows and consumes a matching growth handoff once", () => {
  assert.match(basicProgramSource, /from\("basic_garden_gate_completions"\)/);
  assert.match(basicProgramSource, /eq\("activity_date", payload\.activityDate\)/);
  assert.match(basicProgramSource, /safeSessionStorageRemove\(BASIC_GARDEN_GROWTH_MOMENT_KEY\)/);
});

test("the Garden renders accessible daily lights and reduced-motion growth behavior", () => {
  assert.match(basicHomeSource, /todayGarden\.completedGateCount/);
  assert.match(basicHomeSource, /role="status" aria-live="polite"/);
  const styles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
