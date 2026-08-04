import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

const tempDir = mkdtempSync(join(tmpdir(), "basic-garden-sync-test-"));

const basicGardenSource = readFileSync(new URL("./basic-garden.ts", import.meta.url), "utf8");
const basicGardenSyncSource = readFileSync(new URL("./basic-garden-sync.ts", import.meta.url), "utf8")
  .replace('./basic-garden"', './basic-garden.mjs"');
const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");
const migrationSource = readFileSync(
  new URL("../supabase/migrations/20260727_add_basic_garden_ledgers.sql", import.meta.url),
  "utf8"
);
const rewardUpdateMigrationSource = readFileSync(
  new URL("../supabase/migrations/20260731_fix_basic_garden_completion_reward_update.sql", import.meta.url),
  "utf8"
);

for (const [name, source] of [
  ["basic-garden.mjs", basicGardenSource],
  ["basic-garden-sync.mjs", basicGardenSyncSource]
] as const) {
  writeFileSync(
    join(tempDir, name),
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ES2022,
        target: ts.ScriptTarget.ES2022
      }
    }).outputText
  );
}

const moduleUnderTest = await import(pathToFileURL(join(tempDir, "basic-garden-sync.mjs")).href);
const {
  syncBasicGardenVisit,
  syncBasicGardenCompletion
} = moduleUnderTest;

process.on("exit", () => {
  rmSync(tempDir, { recursive: true, force: true });
});

type ProgressRow = {
  auth_user_id: string;
  challenge_day: number;
  check_in_count: number;
};

type CompletionRow = {
  auth_user_id: string;
  activity_date: string;
  gate_key: string;
  reward_granted: boolean;
};

function createClient(initial: {
  today: string;
  progressRows?: ProgressRow[];
  visitKeys?: string[];
  completionRows?: CompletionRow[];
  visitErrorMessage?: string;
  completionErrorMessage?: string;
}) {
  const progressRows = [...(initial.progressRows ?? [])];
  const visits = new Set(initial.visitKeys ?? []);
  const completions = [...(initial.completionRows ?? [])];
  const rpcCalls: Array<{ fn: string; params: Record<string, unknown> }> = [];

  function findProgress(authUserId: string) {
    return progressRows.find((row) => row.auth_user_id === authUserId) ?? null;
  }

  return {
    rpcCalls,
    setToday(nextToday: string) {
      initial.today = nextToday;
    },
    getProgress(authUserId: string) {
      return findProgress(authUserId);
    },
    getCompletionRows(authUserId: string, date: string) {
      return completions.filter((row) => row.auth_user_id === authUserId && row.activity_date === date);
    },
    client: {
      async rpc(fn: string, params: Record<string, unknown>) {
        rpcCalls.push({ fn, params });

        if (fn === "record_basic_garden_visit") {
          if (initial.visitErrorMessage) {
            return {
              data: null,
              error: { message: initial.visitErrorMessage }
            };
          }

          const authUserId = String(params.p_auth_user_id);
          const visitKey = `${authUserId}|${initial.today}`;
          const visitRecorded = !visits.has(visitKey);
          if (visitRecorded) {
            visits.add(visitKey);
          }

          let progress = findProgress(authUserId);
          if (!progress) {
            progress = {
              auth_user_id: authUserId,
              challenge_day: 1,
              check_in_count: 0
            };
            progressRows.push(progress);
          } else if (visitRecorded) {
            progress.challenge_day += 1;
          }

          return {
            data: {
              auth_user_id: authUserId,
              visit_date: initial.today,
              challenge_day: progress.challenge_day,
              check_in_count: progress.check_in_count,
              visit_recorded: visitRecorded
            },
            error: null
          };
        }

        if (fn === "record_basic_garden_completion") {
          if (initial.completionErrorMessage) {
            return {
              data: null,
              error: { message: initial.completionErrorMessage }
            };
          }

          const authUserId = String(params.p_auth_user_id);
          const gateKey = String(params.p_gate_key);
          const completionKey = `${authUserId}|${initial.today}|${gateKey}`;
          const completionRecorded = !completions.some(
            (row) =>
              `${row.auth_user_id}|${row.activity_date}|${row.gate_key}` === completionKey
          );

          if (completionRecorded) {
            completions.push({
              auth_user_id: authUserId,
              activity_date: initial.today,
              gate_key: gateKey,
              reward_granted: false
            });
          }

          const todayRows = completions.filter(
            (row) => row.auth_user_id === authUserId && row.activity_date === initial.today
          );
          const distinctGateCount = new Set(todayRows.map((row) => row.gate_key)).size;
          const rewardAlreadyGranted = todayRows.some((row) => row.reward_granted);
          const rewardGranted = completionRecorded && distinctGateCount >= 3 && !rewardAlreadyGranted;

          let progress = findProgress(authUserId);

          if (rewardGranted) {
            const rewardedRow = todayRows.find((row) => row.gate_key === gateKey);
            if (rewardedRow) {
              rewardedRow.reward_granted = true;
            }

            if (!progress) {
              progress = {
                auth_user_id: authUserId,
                challenge_day: 1,
                check_in_count: 1
              };
              progressRows.push(progress);
            } else {
              progress.check_in_count += 1;
            }
          }

          return {
            data: {
              auth_user_id: authUserId,
              activity_date: initial.today,
              gate_key: gateKey,
              challenge_day: progress?.challenge_day ?? 1,
              check_in_count: progress?.check_in_count ?? 0,
              completion_recorded: completionRecorded,
              reward_granted: rewardGranted,
              distinct_gate_count: distinctGateCount
            },
            error: null
          };
        }

        throw new Error(`Unexpected RPC: ${fn}`);
      }
    }
  };
}

test("first visit of the day increments challenge day once", async () => {
  const { client } = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 5, check_in_count: 2 }]
  });

  const result = await syncBasicGardenVisit({
    client,
    authUserId: "auth-1"
  });

  assert.equal(result.ok, true);
  assert.equal(result.recordedVisit, true);
  assert.equal(result.stats.challengeDay, 6);
  assert.equal(result.stats.checkInCount, 2);
});

test("repeated visit on the same JST day does not increment again", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 5, check_in_count: 2 }]
  });

  await syncBasicGardenVisit({ client: state.client, authUserId: "auth-1" });
  const second = await syncBasicGardenVisit({ client: state.client, authUserId: "auth-1" });

  assert.equal(second.recordedVisit, false);
  assert.equal(second.stats.challengeDay, 6);
});

test("visit on the next JST day increments again", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 5, check_in_count: 2 }]
  });

  await syncBasicGardenVisit({ client: state.client, authUserId: "auth-1" });
  state.setToday("2026-07-28");
  const nextDay = await syncBasicGardenVisit({ client: state.client, authUserId: "auth-1" });

  assert.equal(nextDay.recordedVisit, true);
  assert.equal(nextDay.stats.challengeDay, 7);
});

test("first and second distinct Gate completions do not grant a check-in", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 5, check_in_count: 2 }]
  });

  const first = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" });
  const second = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "energy" });

  assert.equal(first.rewardGranted, false);
  assert.equal(second.rewardGranted, false);
  assert.equal(second.distinctGateCount, 2);
  assert.equal(state.getProgress("auth-1")?.check_in_count, 2);
});

test("third distinct Gate completion grants exactly +1", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 5, check_in_count: 2 }]
  });

  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "energy" });
  const third = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "vision" });

  assert.equal(third.rewardGranted, true);
  assert.equal(third.stats.checkInCount, 3);
});

test("a malformed completion RPC return is rejected before the client can report success", async () => {
  const result = await syncBasicGardenCompletion({
    client: {
      async rpc() {
        return {
          data: {
            activity_date: "2026-07-27",
            check_in_count: "not-a-number"
          },
          error: null
        };
      }
    } as never,
    authUserId: "auth-1",
    gateKey: "affirmation"
  });

  assert.equal(result.ok, false);
  assert.equal(result.failureCategory, "response_contract");
});

test("repeating the same Gate does not satisfy the three-distinct requirement", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 5, check_in_count: 2 }]
  });

  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" });
  const third = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "energy" });

  assert.equal(third.rewardGranted, false);
  assert.equal(third.distinctGateCount, 2);
  assert.equal(state.getProgress("auth-1")?.check_in_count, 2);
});

test("fourth or later completion on the same day does not exceed +1", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 5, check_in_count: 2 }]
  });

  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "energy" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "vision" });
  const extra = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "focus" });

  assert.equal(extra.rewardGranted, false);
  assert.equal(extra.stats.checkInCount, 3);
});

test("retrying the same completion request remains idempotent", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 5, check_in_count: 2 }]
  });

  const first = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" });
  const retry = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" });

  assert.equal(first.recordedCompletion, true);
  assert.equal(retry.recordedCompletion, false);
  assert.equal(retry.rewardGranted, false);
});

test("a same-day Vision retry remains idempotent", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 5, check_in_count: 2 }]
  });

  const first = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "vision" });
  const retry = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "vision" });

  assert.equal(first.recordedCompletion, true);
  assert.equal(retry.recordedCompletion, false);
  assert.equal(state.getCompletionRows("auth-1", "2026-07-27").length, 1);
});

test("the next JST day resets eligibility and can grant another +1", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 5, check_in_count: 2 }]
  });

  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "energy" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "vision" });
  state.setToday("2026-07-28");
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "focus" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "rest" });
  const thirdNextDay = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "recharge" });

  assert.equal(thirdNextDay.rewardGranted, true);
  assert.equal(thirdNextDay.stats.checkInCount, 4);
});

test("legacy aggregate values are preserved as the baseline for new visit and reward activity", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-legacy", challenge_day: 9, check_in_count: 14 }]
  });

  const visit = await syncBasicGardenVisit({ client: state.client, authUserId: "auth-legacy" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-legacy", gateKey: "affirmation" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-legacy", gateKey: "energy" });
  const completion = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-legacy", gateKey: "vision" });

  assert.equal(visit.stats.challengeDay, 10);
  assert.equal(completion.stats.checkInCount, 15);
});

test("different users remain isolated for visits and earned check-ins", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [
      { auth_user_id: "auth-1", challenge_day: 1, check_in_count: 0 },
      { auth_user_id: "auth-2", challenge_day: 7, check_in_count: 5 }
    ]
  });

  await syncBasicGardenVisit({ client: state.client, authUserId: "auth-1" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "energy" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "vision" });

  assert.equal(state.getProgress("auth-1")?.check_in_count, 1);
  assert.equal(state.getProgress("auth-2")?.check_in_count, 5);
  assert.equal(state.getProgress("auth-2")?.challenge_day, 7);
});

test("meditation completion sends only the validated gate key to the Garden endpoint", () => {
  assert.match(meditationPageSource, /isEligibleBasicGardenGateKey\(mappedDoor\) \? mappedDoor : null/);
  assert.match(meditationPageSource, /body: JSON\.stringify\(\{\s*gateKey: basicGardenGateKey\s*\}\)/);
  assert.match(meditationPageSource, /"Content-Type": "application\/json"/);
  assert.match(meditationPageSource, /Authorization: `Bearer \$\{accessToken\}`/);
});

test("migration adds JST-based visit and completion ledgers with unique daily keys", () => {
  assert.match(migrationSource, /create table if not exists public\.basic_garden_visits/);
  assert.match(migrationSource, /primary key \(auth_user_id, visit_date\)/);
  assert.match(migrationSource, /create table if not exists public\.basic_garden_gate_completions/);
  assert.match(migrationSource, /primary key \(auth_user_id, activity_date, gate_key\)/);
  assert.match(migrationSource, /timezone\('Asia\/Tokyo', now\(\)\)::date/);
  assert.match(migrationSource, /create or replace function public\.record_basic_garden_visit/);
  assert.match(migrationSource, /create or replace function public\.record_basic_garden_completion/);
});

test("forward-only reward update migration removes the Vision third-Gate RPC ambiguity", () => {
  assert.match(rewardUpdateMigrationSource, /update public\.basic_garden_gate_completions as bgc/);
  assert.match(rewardUpdateMigrationSource, /where bgc\.auth_user_id = p_auth_user_id/);
  assert.match(rewardUpdateMigrationSource, /and bgc\.activity_date = v_activity_date/);
  assert.match(rewardUpdateMigrationSource, /and bgc\.gate_key = p_gate_key/);
  assert.match(rewardUpdateMigrationSource, /v_distinct_gate_count >= 3 and not v_reward_exists/);
});
