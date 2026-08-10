import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

const tempDir = mkdtempSync(join(tmpdir(), "basic-garden-progress-test-"));

const membershipSource = readFileSync(new URL("./membership.ts", import.meta.url), "utf8");
const basicHomeEntrySource = readFileSync(new URL("./basic-home-entry.ts", import.meta.url), "utf8").replace(
  './basic-rhythm"',
  './basic-rhythm.mjs"'
);
const basicRhythmSource = readFileSync(new URL("./basic-rhythm.ts", import.meta.url), "utf8");
const basicGardenProgressSource = readFileSync(new URL("./basic-garden-progress.ts", import.meta.url), "utf8")
  .replace('./basic-home-entry"', './basic-home-entry.mjs"')
  .replace('./membership"', './membership.mjs"');

writeFileSync(
  join(tempDir, "membership.mjs"),
  ts.transpileModule(membershipSource, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText
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

writeFileSync(
  join(tempDir, "basic-garden-progress.mjs"),
  ts.transpileModule(basicGardenProgressSource, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText
);

const moduleUnderTest = await import(pathToFileURL(join(tempDir, "basic-garden-progress.mjs")).href);
const {
  deriveBasicGardenViewModel,
  matchBasicGardenProfile,
  resolveBasicGardenStats
} = moduleUnderTest;

const basicProgramPageSource = readFileSync(new URL("../app/program/basic/page.tsx", import.meta.url), "utf8");
const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

process.on("exit", () => {
  rmSync(tempDir, { recursive: true, force: true });
});

test("two authenticated users with different completion histories resolve different garden values", () => {
  const profiles = [
    { id: "profile-a", auth_user_id: "auth-a", email: "first@example.com", challenge_day: 2, check_in_count: 1 },
    { id: "profile-b", auth_user_id: "auth-b", email: "second@example.com", challenge_day: 5, check_in_count: 7 }
  ];

  const first = matchBasicGardenProfile(profiles, "auth-a", "first@example.com");
  const second = matchBasicGardenProfile(profiles, "auth-b", "second@example.com");

  assert.equal(first.matchedBy, "auth_user_id");
  assert.equal(second.matchedBy, "auth_user_id");
  assert.deepEqual(resolveBasicGardenStats(first.profile), { currentDay: 2, cumulativeCheckIns: 1 });
  assert.deepEqual(resolveBasicGardenStats(second.profile), { currentDay: 5, cumulativeCheckIns: 7 });
});

test("plant and recovery-light state derive from the matched user's own cumulative check-ins", () => {
  const first = deriveBasicGardenViewModel({ challenge_day: 2, check_in_count: 1 });
  const second = deriveBasicGardenViewModel({ challenge_day: 2, check_in_count: 6 });

  assert.equal(first.visual.recordedCheckIns, 1);
  assert.equal(first.visual.visibleMarkCount, 1);
  assert.equal(first.visual.milestoneStage, "lights");
  assert.equal(second.visual.recordedCheckIns, 6);
  assert.equal(second.visual.visibleMarkCount, 4);
  assert.equal(second.visual.milestoneStage, "sprout");
});

test("a new user receives the intended empty initial garden state", () => {
  assert.deepEqual(resolveBasicGardenStats(null), {
    currentDay: 0,
    cumulativeCheckIns: 0
  });

  const empty = deriveBasicGardenViewModel(undefined);
  assert.equal(empty.visual.recordedCheckIns, 0);
  assert.equal(empty.visual.visibleMarkCount, 0);
});

test("missing data does not fall back to a fake shared 1/3 garden", () => {
  const missing = resolveBasicGardenStats({
    challenge_day: null,
    check_in_count: null
  });

  assert.deepEqual(missing, {
    currentDay: 0,
    cumulativeCheckIns: 0
  });
  assert.match(basicProgramPageSource, /rpc\("get_basic_garden_progress"/);
  assert.doesNotMatch(basicProgramPageSource, /from\("basic_garden_progress"\)/);
  assert.doesNotMatch(basicProgramPageSource, /from\("users"\)\s*\.select\("id, auth_user_id, email, check_in_count, challenge_day"\)/);
  assert.doesNotMatch(basicProgramPageSource, /\.eq\("email",/);
});

test("current progress day semantics are preserved while user matching can fall back by normalized email", () => {
  const profiles = [{ id: "profile-email", auth_user_id: null, email: "Member@Example.com", challenge_day: 6, check_in_count: 4 }];
  const matched = matchBasicGardenProfile(profiles, "missing-auth", "member@example.com");

  assert.equal(matched.matchedBy, "email");
  assert.deepEqual(resolveBasicGardenStats(matched.profile), {
    currentDay: 6,
    cumulativeCheckIns: 4
  });
});

test("plant milestone stages and visible light cap remain stable through 180 earned check-ins", () => {
  const checkpoints = [
    [0, "seed", 0],
    [1, "lights", 1],
    [3, "lights", 3],
    [4, "sprout", 4],
    [7, "sprout", 4],
    [8, "branching", 5],
    [14, "branching", 5],
    [15, "leaf-glow", 6],
    [21, "leaf-glow", 6],
    [22, "mature-glow", 6],
    [29, "mature-glow", 6],
    [30, "first-flower", 7],
    [60, "first-flower", 7],
    [90, "second-flower", 7],
    [120, "ground-presence", 7],
    [150, "mature-companion", 7],
    [180, "six-month-bloom", 7]
  ] as const;

  for (const [count, stage, visibleMarks] of checkpoints) {
    const model = deriveBasicGardenViewModel({ challenge_day: 12, check_in_count: count }).visual;
    assert.equal(model.milestoneStage, stage);
    assert.equal(model.visibleMarkCount, visibleMarks);
    assert.ok(model.marks.length <= 7);
  }
});

test("basic gate completion flow is wired to persist garden check-ins for the authenticated user", () => {
  assert.match(meditationPageSource, /void ensureBasicGardenCompletionSynced\(\)/);
  assert.match(meditationPageSource, /fetch\("\/api\/basic\/garden-completion"/);
  assert.match(meditationPageSource, /await ensureBasicGardenCompletionSynced\(\)/);
});
