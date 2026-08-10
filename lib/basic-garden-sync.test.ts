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
const independentGateCountMigrationSource = readFileSync(
  new URL("../supabase/migrations/20260810_count_each_basic_garden_gate_completion.sql", import.meta.url),
  "utf8"
);
const ledgerDerivedMigrationSource = readFileSync(
  new URL("../supabase/migrations/20260810080801_derive_basic_garden_progress_from_ledger.sql", import.meta.url),
  "utf8"
);
const separatedMetricsMigrationSource = readFileSync(
  new URL(
    "../supabase/migrations/20260810084016_separate_basic_garden_visit_and_recovery_metrics.sql",
    import.meta.url
  ),
  "utf8"
);
const reconciliationMigrationSource = readFileSync(
  new URL(
    "../supabase/migrations/20260810093000_reconcile_basic_garden_production_drift.sql",
    import.meta.url
  ),
  "utf8"
);
const postDeployVerificationSource = readFileSync(
  new URL("../supabase/verification/basic_garden_reconciliation_post_deploy.sql", import.meta.url),
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

type BaselineRow = {
  preserved_check_in_count: number;
  ledger_count_at_baseline: number;
};

type VisitBaselineRow = {
  preserved_visit_day_count: number;
  ledger_count_at_baseline: number;
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
  const baselines = new Map<string, BaselineRow>();
  const visitBaselines = new Map<string, VisitBaselineRow>();
  const rpcCalls: Array<{ fn: string; params: Record<string, unknown> }> = [];

  function findProgress(authUserId: string) {
    return progressRows.find((row) => row.auth_user_id === authUserId) ?? null;
  }

  function ledgerCount(authUserId: string) {
    return completions.filter((row) => row.auth_user_id === authUserId).length;
  }

  function ensureBaseline(authUserId: string) {
    const existing = baselines.get(authUserId);
    if (existing) return existing;

    let progress = findProgress(authUserId);
    if (!progress) {
      progress = { auth_user_id: authUserId, challenge_day: 1, check_in_count: 0 };
      progressRows.push(progress);
    }

    const snapshot = ledgerCount(authUserId);
    const baseline = {
      preserved_check_in_count: Math.max(progress.check_in_count, snapshot),
      ledger_count_at_baseline: snapshot
    };
    baselines.set(authUserId, baseline);
    return baseline;
  }

  function canonicalCount(authUserId: string) {
    const baseline = ensureBaseline(authUserId);
    return baseline.preserved_check_in_count + Math.max(ledgerCount(authUserId) - baseline.ledger_count_at_baseline, 0);
  }

  function visitCount(authUserId: string) {
    return [...visits].filter((key) => key.startsWith(`${authUserId}|`)).length;
  }

  function ensureVisitBaseline(authUserId: string) {
    const existing = visitBaselines.get(authUserId);
    if (existing) return existing;

    const baseline = {
      preserved_visit_day_count: Math.max(findProgress(authUserId)?.challenge_day ?? 0, visitCount(authUserId)),
      ledger_count_at_baseline: visitCount(authUserId)
    };
    visitBaselines.set(authUserId, baseline);
    return baseline;
  }

  function canonicalVisitDays(authUserId: string) {
    const baseline = ensureVisitBaseline(authUserId);
    return baseline.preserved_visit_day_count + Math.max(visitCount(authUserId) - baseline.ledger_count_at_baseline, 0);
  }

  return {
    rpcCalls,
    setToday(nextToday: string) {
      initial.today = nextToday;
    },
    getProgress(authUserId: string) {
      return findProgress(authUserId);
    },
    getCanonicalCount(authUserId: string) {
      return canonicalCount(authUserId);
    },
    getBaseline(authUserId: string) {
      return ensureBaseline(authUserId);
    },
    getCompletedDayCount(authUserId: string) {
      const dates = new Map<string, Set<string>>();
      for (const completion of completions) {
        if (completion.auth_user_id !== authUserId) continue;
        const gates = dates.get(completion.activity_date) ?? new Set<string>();
        gates.add(completion.gate_key);
        dates.set(completion.activity_date, gates);
      }
      return [...dates.values()].filter((gates) => gates.size >= 3).length;
    },
    rerunBaselineReconciliation(authUserId: string) {
      return ensureBaseline(authUserId);
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
          ensureVisitBaseline(authUserId);
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
            progress.challenge_day = Math.max(canonicalVisitDays(authUserId), 1);
          }

          return {
            data: {
              auth_user_id: authUserId,
              visit_date: initial.today,
              challenge_day: progress.challenge_day,
              check_in_count: progress.check_in_count,
              visit_recorded: visitRecorded,
              cumulative_visit_days: canonicalVisitDays(authUserId),
              cumulative_recovery_records: canonicalCount(authUserId)
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
          ensureVisitBaseline(authUserId);
          ensureBaseline(authUserId);
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

          const progress = findProgress(authUserId);

          if (rewardGranted) {
            const rewardedRow = todayRows.find((row) => row.gate_key === gateKey);
            if (rewardedRow) {
              rewardedRow.reward_granted = true;
            }
          }

          return {
            data: {
              auth_user_id: authUserId,
              activity_date: initial.today,
              gate_key: gateKey,
              challenge_day: progress?.challenge_day ?? 1,
              check_in_count: canonicalCount(authUserId),
              completion_recorded: completionRecorded,
              reward_granted: rewardGranted,
              distinct_gate_count: distinctGateCount,
              cumulative_visit_days: canonicalVisitDays(authUserId),
              cumulative_recovery_records: canonicalCount(authUserId)
            },
            error: null
          };
        }

        throw new Error(`Unexpected RPC: ${fn}`);
      }
    }
  };
}

test("first authenticated BASIC visit on a JST date increases cumulative visit days once", async () => {
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
  assert.equal(result.stats.cumulativeVisitDays, 6);
  assert.equal(result.stats.checkInCount, 2);
  assert.equal(result.stats.cumulativeRecoveryRecords, 2);
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
  assert.equal(nextDay.stats.cumulativeVisitDays, 7);
});

test("concurrent duplicate visits create one JST visit record and one cumulative increment", async () => {
  const state = createClient({ today: "2026-07-27" });

  const [first, second] = await Promise.all([
    syncBasicGardenVisit({ client: state.client, authUserId: "auth-1" }),
    syncBasicGardenVisit({ client: state.client, authUserId: "auth-1" })
  ]);

  assert.equal(Number(first.recordedVisit) + Number(second.recordedVisit), 1);
  assert.equal(first.stats.cumulativeVisitDays, 1);
  assert.equal(second.stats.cumulativeVisitDays, 1);
});

test("visit date is supplied by the RPC contract instead of a client clock", async () => {
  const state = createClient({ today: "2026-07-27" });
  const result = await syncBasicGardenVisit({ client: state.client, authUserId: "auth-1" });

  assert.equal(result.activityDate, "2026-07-27");
  assert.match(ledgerDerivedMigrationSource, /timezone\('Asia\/Tokyo', now\(\)\)::date/);
});

test("anonymous BASIC visits do not fabricate a successful increment", async () => {
  const result = await syncBasicGardenVisit({ client: createClient({ today: "2026-07-27" }).client, authUserId: "" });

  assert.equal(result.ok, false);
  assert.equal(result.stats.cumulativeVisitDays, 0);
});

test("each distinct Gate completion increments the cumulative check-in count", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 5, check_in_count: 2 }]
  });

  const first = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" });
  const second = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "energy" });

  assert.equal(first.rewardGranted, false);
  assert.equal(second.rewardGranted, false);
  assert.equal(second.distinctGateCount, 2);
  assert.equal(first.stats.checkInCount, 3);
  assert.equal(second.stats.checkInCount, 4);
  assert.equal(state.getCanonicalCount("auth-1"), 4);
});

test("the third distinct Gate is stored and counted independently", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 5, check_in_count: 2 }]
  });

  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "energy" });
  const third = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "vision" });

  assert.equal(third.rewardGranted, true);
  assert.equal(third.recordedCompletion, true);
  assert.equal(third.stats.checkInCount, 5);
  assert.deepEqual(
    state.getCompletionRows("auth-1", "2026-07-27").map((row) => row.gate_key).sort(),
    ["affirmation", "energy", "vision"]
  );
});

test("recovery records do not add visit days, including after three distinct gates", async () => {
  const state = createClient({ today: "2026-07-27" });

  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "energy" });
  const third = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "vision" });

  assert.equal(third.stats.cumulativeRecoveryRecords, 3);
  assert.equal(third.stats.cumulativeVisitDays, 0);
  assert.equal(state.getCompletedDayCount("auth-1"), 1);
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
  assert.equal(state.getCanonicalCount("auth-1"), 4);
});

test("a fourth distinct Gate counts once without duplicating a prior Gate", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 5, check_in_count: 2 }]
  });

  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "energy" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "vision" });
  const extra = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "focus" });

  assert.equal(extra.rewardGranted, false);
  assert.equal(extra.stats.checkInCount, 6);
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
  assert.equal(first.stats.checkInCount, 3);
  assert.equal(retry.stats.checkInCount, 3);
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
  assert.equal(retry.stats.checkInCount, 3);
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
  assert.equal(thirdNextDay.stats.checkInCount, 8);
});

test("legacy aggregate values are preserved as the baseline for independent Gate activity", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-legacy", challenge_day: 9, check_in_count: 14 }]
  });

  const visit = await syncBasicGardenVisit({ client: state.client, authUserId: "auth-legacy" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-legacy", gateKey: "affirmation" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-legacy", gateKey: "energy" });
  const completion = await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-legacy", gateKey: "vision" });

  assert.equal(visit.stats.challengeDay, 10);
  assert.equal(completion.stats.checkInCount, 17);
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

  assert.equal(state.getCanonicalCount("auth-1"), 3);
  assert.equal(state.getCanonicalCount("auth-2"), 5);
  assert.equal(state.getProgress("auth-2")?.challenge_day, 7);
});

test("concurrent retries create one canonical completion and one count increase", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 1, check_in_count: 0 }]
  });

  const results = await Promise.all(
    Array.from({ length: 4 }, () =>
      syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" })
    )
  );

  assert.equal(results.filter((result) => result.recordedCompletion).length, 1);
  assert.equal(state.getCompletionRows("auth-1", "2026-07-27").length, 1);
  assert.equal(state.getCanonicalCount("auth-1"), 1);
});

test("out-of-order Gates complete a day only after three distinct records", async () => {
  const state = createClient({ today: "2026-07-27" });

  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "sleep" });
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "vision" });
  assert.equal(state.getCompletedDayCount("auth-1"), 0);
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "focus" });

  assert.equal(state.getCanonicalCount("auth-1"), 3);
  assert.equal(state.getCompletedDayCount("auth-1"), 1);
});

test("three Gates on multiple activity dates derive cumulative and completed-day totals", async () => {
  const state = createClient({ today: "2026-07-27" });

  for (const gateKey of ["affirmation", "energy", "vision"] as const) {
    await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey });
  }
  state.setToday("2026-07-28");
  for (const gateKey of ["focus", "rest", "recharge"] as const) {
    await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey });
  }

  assert.equal(state.getCanonicalCount("auth-1"), 6);
  assert.equal(state.getCompletedDayCount("auth-1"), 2);
});

test("baseline preserves stored history without double-counting ledger rows", () => {
  const equal = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "equal", challenge_day: 1, check_in_count: 2 }],
    completionRows: [
      { auth_user_id: "equal", activity_date: "2026-07-26", gate_key: "affirmation", reward_granted: false },
      { auth_user_id: "equal", activity_date: "2026-07-26", gate_key: "energy", reward_granted: false }
    ]
  });
  const legacyHigher = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "higher", challenge_day: 1, check_in_count: 9 }],
    completionRows: [{ auth_user_id: "higher", activity_date: "2026-07-26", gate_key: "affirmation", reward_granted: false }]
  });
  const ledgerHigher = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "ledger", challenge_day: 1, check_in_count: 1 }],
    completionRows: [
      { auth_user_id: "ledger", activity_date: "2026-07-26", gate_key: "affirmation", reward_granted: false },
      { auth_user_id: "ledger", activity_date: "2026-07-26", gate_key: "energy", reward_granted: false },
      { auth_user_id: "ledger", activity_date: "2026-07-26", gate_key: "vision", reward_granted: true }
    ]
  });

  assert.equal(equal.getCanonicalCount("equal"), 2);
  assert.deepEqual(equal.getBaseline("equal"), { preserved_check_in_count: 2, ledger_count_at_baseline: 2 });
  assert.equal(legacyHigher.getCanonicalCount("higher"), 9);
  assert.deepEqual(legacyHigher.getBaseline("higher"), { preserved_check_in_count: 9, ledger_count_at_baseline: 1 });
  assert.equal(ledgerHigher.getCanonicalCount("ledger"), 3);
  assert.deepEqual(ledgerHigher.getBaseline("ledger"), { preserved_check_in_count: 3, ledger_count_at_baseline: 3 });
});

test("re-running baseline reconciliation does not change a derived total", async () => {
  const state = createClient({
    today: "2026-07-27",
    progressRows: [{ auth_user_id: "auth-1", challenge_day: 1, check_in_count: 5 }]
  });

  assert.equal(state.getCanonicalCount("auth-1"), 5);
  assert.deepEqual(state.rerunBaselineReconciliation("auth-1"), state.getBaseline("auth-1"));
  await syncBasicGardenCompletion({ client: state.client, authUserId: "auth-1", gateKey: "affirmation" });
  assert.equal(state.getCanonicalCount("auth-1"), 6);
  assert.deepEqual(state.rerunBaselineReconciliation("auth-1"), state.getBaseline("auth-1"));
  assert.equal(state.getCanonicalCount("auth-1"), 6);
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

test("forward-only migration counts each unique Gate completion and preserves ledger idempotency", () => {
  assert.match(independentGateCountMigrationSource, /where not bgc\.reward_granted/);
  assert.match(independentGateCountMigrationSource, /if v_completion_inserted > 0 then/);
  assert.match(independentGateCountMigrationSource, /set check_in_count = bgp\.check_in_count \+ 1/);
  assert.match(independentGateCountMigrationSource, /on conflict do nothing/);
});

test("ledger-derived migration freezes a baseline and separates idempotent rewards", () => {
  assert.match(ledgerDerivedMigrationSource, /create table if not exists public\.basic_garden_progress_baselines/);
  assert.match(ledgerDerivedMigrationSource, /create table if not exists public\.basic_garden_daily_rewards/);
  assert.match(ledgerDerivedMigrationSource, /ledger_count_at_baseline/);
  assert.match(ledgerDerivedMigrationSource, /create or replace function public\.get_basic_garden_progress/);
  assert.match(ledgerDerivedMigrationSource, /on conflict \(auth_user_id\) do nothing/);
  assert.match(ledgerDerivedMigrationSource, /on conflict do nothing/);
  assert.match(ledgerDerivedMigrationSource, /grant execute on function public\.record_basic_garden_completion\(uuid, text\) to service_role/);
  assert.doesNotMatch(
    ledgerDerivedMigrationSource,
    /set check_in_count = bgp\.check_in_count \+ 1/
  );
});

test("separated-metrics migration derives visit days and recovery records from distinct ledgers", () => {
  assert.match(separatedMetricsMigrationSource, /create table if not exists public\.basic_garden_visit_baselines/);
  assert.match(separatedMetricsMigrationSource, /insert into public\.basic_garden_visits as bgv \(auth_user_id, visit_date\)/);
  assert.match(separatedMetricsMigrationSource, /cumulative_visit_days integer/);
  assert.match(separatedMetricsMigrationSource, /cumulative_recovery_records integer/);
  assert.match(separatedMetricsMigrationSource, /timezone\('Asia\/Tokyo', now\(\)\)::date/);
  assert.match(separatedMetricsMigrationSource, /on conflict do nothing/);
  assert.match(separatedMetricsMigrationSource, /having count\(\*\) >= 3/);
  assert.doesNotMatch(separatedMetricsMigrationSource, /set\s+check_in_count\s*=\s*.*\+/);
});

test("forward-only reconciliation restores ledger-derived RPC contracts without replaying the old backfill", () => {
  assert.match(reconciliationMigrationSource, /create table if not exists public\.basic_garden_progress_baselines/);
  assert.match(reconciliationMigrationSource, /create table if not exists public\.basic_garden_visit_baselines/);
  assert.match(reconciliationMigrationSource, /create table if not exists public\.basic_garden_daily_rewards/);
  assert.match(reconciliationMigrationSource, /select bgp\.auth_user_id from public\.basic_garden_progress as bgp\s+union\s+select cc\.auth_user_id/s);
  assert.match(reconciliationMigrationSource, /select bgp\.auth_user_id from public\.basic_garden_progress as bgp\s+union\s+select vc\.auth_user_id/s);
  assert.doesNotMatch(reconciliationMigrationSource, /where not bgc\.reward_granted/);
  assert.match(reconciliationMigrationSource, /returns table \(\s*auth_user_id uuid, challenge_day integer, check_in_count integer,\s*today_distinct_gate_count integer, completed_day_count integer,/);
  assert.match(reconciliationMigrationSource, /returns table \(\s*auth_user_id uuid, visit_date date, challenge_day integer, check_in_count integer,/);
  assert.match(reconciliationMigrationSource, /returns table \(\s*auth_user_id uuid, activity_date date, gate_key text, challenge_day integer,/);
  assert.match(reconciliationMigrationSource, /cumulative_visit_days integer, cumulative_recovery_records integer,\s+preserved_visit_day_count integer/);
  assert.match(reconciliationMigrationSource, /visit_recorded boolean, cumulative_visit_days integer, cumulative_recovery_records integer/);
  assert.match(reconciliationMigrationSource, /distinct_gate_count integer, cumulative_visit_days integer, cumulative_recovery_records integer/);
  assert.match(reconciliationMigrationSource, /timezone\('Asia\/Tokyo', now\(\)\)::date/g);
  assert.match(reconciliationMigrationSource, /update public\.basic_garden_gate_completions as bgc set reward_granted = true\s+where bgc\.auth_user_id = p_auth_user_id and bgc\.activity_date = v_activity_date and bgc\.gate_key = p_gate_key/);
  assert.match(reconciliationMigrationSource, /insert into public\.basic_garden_daily_rewards as bgdr[\s\S]*on conflict do nothing/);
});

test("forward-only reconciliation restricts writable RPCs and ships aggregate-only verification", () => {
  assert.match(reconciliationMigrationSource, /revoke all on function public\.record_basic_garden_visit\(uuid\) from public/);
  assert.match(reconciliationMigrationSource, /revoke all on function public\.record_basic_garden_completion\(uuid, text\) from public/);
  assert.match(reconciliationMigrationSource, /revoke all on function public\.upsert_basic_garden_progress\(uuid, integer\) from public/);
  assert.match(reconciliationMigrationSource, /revoke all on function public\.get_basic_garden_progress\(uuid\) from public/);
  assert.match(reconciliationMigrationSource, /grant execute on function public\.record_basic_garden_visit\(uuid\) to service_role/);
  assert.match(reconciliationMigrationSource, /grant execute on function public\.record_basic_garden_completion\(uuid, text\) to service_role/);
  assert.match(reconciliationMigrationSource, /grant execute on function public\.upsert_basic_garden_progress\(uuid, integer\) to service_role/);
  assert.match(reconciliationMigrationSource, /grant execute on function public\.get_basic_garden_progress\(uuid\) to authenticated, service_role/);
  assert.match(reconciliationMigrationSource, /security invoker/g);
  assert.match(reconciliationMigrationSource, /auth\.uid\(\) is distinct from p_auth_user_id/);
  assert.match(postDeployVerificationSource, /aggregate_cumulative_recovery_records/);
  assert.match(postDeployVerificationSource, /aggregate_cumulative_visit_days/);
  assert.match(postDeployVerificationSource, /eligible_jst_user_days_without_daily_reward/);
  assert.doesNotMatch(postDeployVerificationSource, /SELECT\s+auth_user_id\s+FROM\s+public\.basic_garden_\w+\s*;/i);
});
