import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

const tempDir = mkdtempSync(join(tmpdir(), "basic-garden-sync-test-"));

const membershipSource = readFileSync(new URL("./membership.ts", import.meta.url), "utf8");
const basicRhythmSource = readFileSync(new URL("./basic-rhythm.ts", import.meta.url), "utf8");
const basicHomeEntrySource = readFileSync(new URL("./basic-home-entry.ts", import.meta.url), "utf8").replace(
  './basic-rhythm"',
  './basic-rhythm.mjs"'
);
const basicGardenProgressSource = readFileSync(new URL("./basic-garden-progress.ts", import.meta.url), "utf8")
  .replace('./basic-home-entry"', './basic-home-entry.mjs"')
  .replace('./membership"', './membership.mjs"');
const basicGardenSyncSource = readFileSync(new URL("./basic-garden-sync.ts", import.meta.url), "utf8")
  .replace('./basic-garden-progress"', './basic-garden-progress.mjs"')
  .replace('./membership"', './membership.mjs"');
const basicGardenRepairMigrationSource = readFileSync(
  new URL("../supabase/migrations/20260726_fix_basic_garden_progress_rpc_ambiguity.sql", import.meta.url),
  "utf8"
);

for (const [name, source] of [
  ["membership.mjs", membershipSource],
  ["basic-rhythm.mjs", basicRhythmSource],
  ["basic-home-entry.mjs", basicHomeEntrySource],
  ["basic-garden-progress.mjs", basicGardenProgressSource],
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
const { syncBasicGardenCompletion } = moduleUnderTest;

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

process.on("exit", () => {
  rmSync(tempDir, { recursive: true, force: true });
});

type UserRow = Record<string, unknown>;

class MockGardenProgressQuery {
  private readonly rows: UserRow[];
  private readonly options: {
    readErrorMessage?: string | null;
    rpcErrorMessage?: string | null;
    rpcCalls: Array<{ fn: string; params: Record<string, unknown> }>;
  };

  constructor(
    rows: UserRow[],
    options: {
      readErrorMessage?: string | null;
      rpcErrorMessage?: string | null;
      rpcCalls: Array<{ fn: string; params: Record<string, unknown> }>;
    }
  ) {
    this.rows = rows;
    this.options = options;
  }

  select() {
    return {
      eq: (column: string, value: unknown) => ({
        maybeSingle: async () => {
          if (this.options.readErrorMessage) {
            return { data: null, error: { message: this.options.readErrorMessage } };
          }

          const row = this.rows.find((entry) => entry[column] === value) ?? null;
          return { data: row, error: null };
        }
      })
    };
  }
}

function createClient(rows: UserRow[], config?: { readErrorMessage?: string | null; rpcErrorMessage?: string | null }) {
  const rpcCalls: Array<{ fn: string; params: Record<string, unknown> }> = [];
  const query = new MockGardenProgressQuery(rows, {
    readErrorMessage: config?.readErrorMessage ?? null,
    rpcErrorMessage: config?.rpcErrorMessage ?? null,
    rpcCalls
  });

  return {
    client: {
      from(table: string) {
        assert.equal(table, "basic_garden_progress");
        return query;
      },
      async rpc(fn: string, params: Record<string, unknown>) {
        rpcCalls.push({ fn, params });

        if (config?.rpcErrorMessage) {
          return {
            data: null,
            error: { message: config.rpcErrorMessage }
          };
        }

        assert.equal(fn, "upsert_basic_garden_progress");

        const authUserId = params.p_auth_user_id;
        const challengeDay = params.p_challenge_day;
        const existing = rows.find((entry) => entry.auth_user_id === authUserId);

        if (existing) {
          existing.challenge_day = Math.max(
            typeof existing.challenge_day === "number" ? existing.challenge_day : 1,
            typeof challengeDay === "number" ? challengeDay : 1
          );
          existing.check_in_count = (typeof existing.check_in_count === "number" ? existing.check_in_count : 0) + 1;
          existing.updated_at = "2026-07-26T00:00:01.000Z";

          return {
            data: {
              auth_user_id: existing.auth_user_id,
              challenge_day: existing.challenge_day,
              check_in_count: existing.check_in_count,
              created_at: existing.created_at ?? "2026-07-26T00:00:00.000Z",
              updated_at: existing.updated_at,
              was_created: false
            },
            error: null
          };
        }

        const inserted = {
          auth_user_id: authUserId,
          challenge_day: typeof challengeDay === "number" ? challengeDay : 1,
          check_in_count: 1,
          created_at: "2026-07-26T00:00:00.000Z",
          updated_at: "2026-07-26T00:00:00.000Z"
        };
        rows.push(inserted);

        return {
          data: {
            ...inserted,
            was_created: true
          },
          error: null
        };
      }
    },
    rpcCalls
  };
}

test("successful Morning Gate completion updates check-ins from 0 to 1 for the authenticated user", async () => {
  const rows = [{ auth_user_id: "auth-1", challenge_day: 1, check_in_count: 0 }];
  const { client, rpcCalls } = createClient(rows);

  const result = await syncBasicGardenCompletion({
    client,
    authUserId: "auth-1",
    email: "member@example.com"
  });

  assert.equal(result.ok, true);
  assert.equal(result.writeAction, "update");
  assert.equal(result.stats.checkInCount, 1);
  assert.equal(rows[0].check_in_count, 1);
  assert.equal(rpcCalls.length, 1);
});

test("database update targets the correct authenticated user and preserves user isolation", async () => {
  const rows = [
    { auth_user_id: "auth-1", challenge_day: 2, check_in_count: 0 },
    { auth_user_id: "auth-2", challenge_day: 5, check_in_count: 4 }
  ];
  const { client, rpcCalls } = createClient(rows);

  await syncBasicGardenCompletion({
    client,
    authUserId: "auth-1",
    email: "first@example.com"
  });

  assert.equal(rpcCalls.length, 1);
  assert.equal(rpcCalls[0].params.p_auth_user_id, "auth-1");
  assert.equal(rows[0].check_in_count, 1);
  assert.equal(rows[1].check_in_count, 4);
});

test("write errors are not silently treated as success", async () => {
  const rows = [{ auth_user_id: "auth-1", challenge_day: 1, check_in_count: 0 }];
  const { client } = createClient(rows, { rpcErrorMessage: "new row violates row-level security policy" });

  const result = await syncBasicGardenCompletion({
    client,
    authUserId: "auth-1",
    email: "member@example.com"
  });

  assert.equal(result.ok, false);
  assert.match(result.errorMessage ?? "", /row-level security policy/);
});

test("new users receive an inserted initial state instead of shared fallback values", async () => {
  const rows: UserRow[] = [];
  const { client } = createClient(rows);

  const result = await syncBasicGardenCompletion({
    client,
    authUserId: "auth-3",
    email: "new@example.com"
  });

  assert.equal(result.ok, true);
  assert.equal(result.writeAction, "insert");
  assert.equal(result.stats.checkInCount, 1);
  assert.equal(rows[0].check_in_count, 1);
  assert.equal(rows[0].auth_user_id, "auth-3");
});

test("garden sync does not use email fallback and does not require a generic users row", async () => {
  const rows = [{ auth_user_id: "auth-9", challenge_day: 6, check_in_count: 4 }];
  const { client, rpcCalls } = createClient(rows);

  const result = await syncBasicGardenCompletion({
    client,
    authUserId: "auth-9",
    email: "different@example.com"
  });

  assert.equal(result.ok, true);
  assert.equal(result.matchedBy, "auth_user_id");
  assert.equal(rpcCalls.length, 1);
});

test("meditation completion navigation awaits garden sync and surfaces a safe error state", () => {
  assert.match(meditationPageSource, /await ensureBasicGardenCompletionSynced\(\)/);
  assert.match(meditationPageSource, /setBasicGardenSyncError\(/);
  assert.match(meditationPageSource, /getSupabaseBrowserClient\(\)/);
  assert.match(meditationPageSource, /auth\.getSession\(\)/);
  assert.match(meditationPageSource, /Authorization:\s*`Bearer \$\{accessToken\}`/);
  assert.match(meditationPageSource, /fetch\("\/api\/basic\/garden-completion"/);
  assert.match(basicGardenSyncSource, /from\("basic_garden_progress"\)/);
  assert.match(basicGardenSyncSource, /rpc\("upsert_basic_garden_progress"/);
  assert.doesNotMatch(basicGardenSyncSource, /\.eq\("email",/);
});

test("failed basic garden sync still allows Back to BASIC navigation without marking the save as successful", () => {
  assert.match(meditationPageSource, /destination === basicCompletionReturnHref && basicGardenSyncStatus === "error"/);
  assert.match(
    meditationPageSource,
    /destination === basicCompletionReturnHref && basicGardenSyncStatus === "error"\) \{\s+router\.push\(destination\);\s+return;/
  );
});

test("repair migration preserves RPC contract and removes ambiguous auth_user_id references", () => {
  assert.match(
    basicGardenRepairMigrationSource,
    /create or replace function public\.upsert_basic_garden_progress\(\s*p_auth_user_id uuid,\s*p_challenge_day integer default 1/s
  );
  assert.match(basicGardenRepairMigrationSource, /returns table \(\s*auth_user_id uuid,/s);
  assert.match(basicGardenRepairMigrationSource, /on conflict on constraint basic_garden_progress_pkey do update/);
  assert.match(basicGardenRepairMigrationSource, /insert into public\.basic_garden_progress as bgp/);
  assert.match(basicGardenRepairMigrationSource, /bgp\.auth_user_id as row_auth_user_id/);
});
