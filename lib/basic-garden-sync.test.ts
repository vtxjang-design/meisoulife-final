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

class MockUsersQuery {
  private readonly rows: UserRow[];
  private readonly options: {
    readErrorMessage?: string | null;
    writeErrorMessage?: string | null;
    writes: Array<{ type: "update" | "upsert"; values: Record<string, unknown>; matchValue: unknown }>;
  };

  constructor(
    rows: UserRow[],
    options: {
      readErrorMessage?: string | null;
      writeErrorMessage?: string | null;
      writes: Array<{ type: "update" | "upsert"; values: Record<string, unknown>; matchValue: unknown }>;
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

  update(values: Record<string, unknown>) {
    return {
      eq: (column: string, value: unknown) => ({
        select: () => ({
          maybeSingle: async () => {
            this.options.writes.push({ type: "update", values, matchValue: value });

            if (this.options.writeErrorMessage) {
              return { data: null, error: { message: this.options.writeErrorMessage } };
            }

            const row = this.rows.find((entry) => entry[column] === value) ?? null;

            if (!row) {
              return { data: null, error: { message: "row not found" } };
            }

            Object.assign(row, values);
            return { data: row, error: null };
          }
        })
      })
    };
  }

  upsert(values: Record<string, unknown>, options: { onConflict: string }) {
    return {
      select: () => ({
        maybeSingle: async () => {
          this.options.writes.push({ type: "upsert", values, matchValue: options.onConflict });

          if (this.options.writeErrorMessage) {
            return { data: null, error: { message: this.options.writeErrorMessage } };
          }

          const conflictValue = values[options.onConflict];
          const existing = this.rows.find((row) => row[options.onConflict] === conflictValue);

          if (existing) {
            Object.assign(existing, values);
            return { data: existing, error: null };
          }

          const inserted = { id: "inserted-profile", ...values };
          this.rows.push(inserted);
          return { data: inserted, error: null };
        }
      })
    };
  }
}

function createClient(rows: UserRow[], config?: { readErrorMessage?: string | null; writeErrorMessage?: string | null }) {
  const writes: Array<{ type: "update" | "upsert"; values: Record<string, unknown>; matchValue: unknown }> = [];
  const query = new MockUsersQuery(rows, {
    readErrorMessage: config?.readErrorMessage ?? null,
    writeErrorMessage: config?.writeErrorMessage ?? null,
    writes
  });

  return {
    client: {
      from() {
        return query;
      }
    },
    writes
  };
}

test("successful Morning Gate completion updates check-ins from 0 to 1 for the authenticated user", async () => {
  const rows = [{ id: "profile-1", auth_user_id: "auth-1", email: "member@example.com", challenge_day: 1, check_in_count: 0 }];
  const { client } = createClient(rows);

  const result = await syncBasicGardenCompletion({
    client,
    authUserId: "auth-1",
    email: "member@example.com"
  });

  assert.equal(result.ok, true);
  assert.equal(result.writeAction, "update");
  assert.equal(result.stats.checkInCount, 1);
  assert.equal(rows[0].check_in_count, 1);
});

test("database update targets the correct authenticated user and preserves user isolation", async () => {
  const rows = [
    { id: "profile-1", auth_user_id: "auth-1", email: "first@example.com", challenge_day: 2, check_in_count: 0 },
    { id: "profile-2", auth_user_id: "auth-2", email: "second@example.com", challenge_day: 5, check_in_count: 4 }
  ];
  const { client, writes } = createClient(rows);

  await syncBasicGardenCompletion({
    client,
    authUserId: "auth-1",
    email: "first@example.com"
  });

  assert.equal(writes.length, 1);
  assert.equal(writes[0].type, "update");
  assert.equal(writes[0].matchValue, "profile-1");
  assert.equal(rows[0].check_in_count, 1);
  assert.equal(rows[1].check_in_count, 4);
});

test("write errors are not silently treated as success", async () => {
  const rows = [{ id: "profile-1", auth_user_id: "auth-1", email: "member@example.com", challenge_day: 1, check_in_count: 0 }];
  const { client } = createClient(rows, { writeErrorMessage: "new row violates row-level security policy" });

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
});

test("meditation completion navigation awaits garden sync and surfaces a safe error state", () => {
  assert.match(meditationPageSource, /await ensureBasicGardenCompletionSynced\(\)/);
  assert.match(meditationPageSource, /setBasicGardenSyncError\(/);
  assert.match(meditationPageSource, /fetch\("\/api\/basic\/garden-completion"/);
});

test("failed basic garden sync still allows Back to BASIC navigation without marking the save as successful", () => {
  assert.match(meditationPageSource, /destination === basicCompletionReturnHref && basicGardenSyncStatus === "error"/);
  assert.match(
    meditationPageSource,
    /destination === basicCompletionReturnHref && basicGardenSyncStatus === "error"\) \{\s+router\.push\(destination\);\s+return;/
  );
});
