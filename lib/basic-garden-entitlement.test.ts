import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

type MembershipRow = {
  user_id: string;
  plan: string | null;
  status: string | null;
  created_at: string;
};

const tempDir = mkdtempSync(join(tmpdir(), "basic-garden-entitlement-test-"));
const entitlementSource = readFileSync(new URL("./basic-garden-entitlement.ts", import.meta.url), "utf8")
  .replace('from "./membership-access"', 'from "./membership-access.mjs"')
  .replace('from "./membership"', 'from "./membership.mjs"');
const membershipSource = readFileSync(new URL("./membership.ts", import.meta.url), "utf8");
const membershipAccessSource = readFileSync(new URL("./membership-access.ts", import.meta.url), "utf8")
  .replace('from "@/lib/basic-rhythm"', 'from "./basic-rhythm.mjs"')
  .replace('from "@/lib/membership"', 'from "./membership.mjs"');

for (const [name, source] of [
  ["basic-garden-entitlement.mjs", entitlementSource],
  ["membership.mjs", membershipSource],
  ["membership-access.mjs", membershipAccessSource],
  ["basic-rhythm.mjs", "export function getBasicPracticeByRouteType() { return null; }"]
] as const) {
  writeFileSync(
    join(tempDir, name),
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
    }).outputText
  );
}

const { resolveBasicGardenEntitlement } = await import(
  pathToFileURL(join(tempDir, "basic-garden-entitlement.mjs")).href
);

process.on("exit", () => rmSync(tempDir, { recursive: true, force: true }));

function createMembershipClient(
  rows: MembershipRow[],
  options: { error?: { message: string } | null; throwError?: boolean } = {}
) {
  return {
    from(table: string) {
      assert.equal(table, "memberships");
      return {
        select() {
          return this;
        },
        eq(column: string, userId: string) {
          assert.equal(column, "user_id");
          const matchingUser = rows
            .filter((row) => row.user_id === userId)
            .sort((left, right) => right.created_at.localeCompare(left.created_at));
          return {
            async order(orderColumn: string, orderOptions: { ascending: boolean }) {
              assert.equal(orderColumn, "created_at");
              assert.deepEqual(orderOptions, { ascending: false });
              if (options.throwError) throw new Error("database unavailable");
              return { data: matchingUser, error: options.error ?? null };
            }
          };
        }
      };
    }
  };
}

async function check(rows: MembershipRow[], options?: { error?: { message: string } | null; throwError?: boolean }) {
  return resolveBasicGardenEntitlement({
    client: createMembershipClient(rows, options),
    authUserId: "authenticated-user"
  });
}

test("BASIC Garden entitlement accepts status casing and BASIC-or-higher plans", async () => {
  for (const [plan, status] of [
    ["basic", "active"],
    ["basic", "ACTIVE"],
    ["basic", "Active"],
    ["basic_annual", "trialing"],
    ["growth", "TRIALING"],
    ["inner circle", "Trialing"]
  ] as const) {
    assert.deepEqual(
      await check([{ user_id: "authenticated-user", plan, status, created_at: "2026-08-14T00:00:00Z" }]),
      { status: "entitled" }
    );
  }
});

test("BASIC Garden entitlement rejects missing, free, inactive, canceled, and expired memberships", async () => {
  assert.deepEqual(await check([]), { status: "not_entitled" });

  for (const [plan, status] of [
    ["free", "active"],
    ["unknown", "active"],
    ["basic", "expired"],
    ["basic", "canceled"],
    ["basic", "inactive"]
  ] as const) {
    assert.deepEqual(
      await check([{ user_id: "authenticated-user", plan, status, created_at: "2026-08-14T00:00:00Z" }]),
      { status: "not_entitled" }
    );
  }
});

test("BASIC Garden entitlement preserves latest-valid membership selection without maybeSingle", async () => {
  assert.deepEqual(
    await check([
      { user_id: "other-user", plan: "basic", status: "active", created_at: "2026-08-15T00:00:00Z" },
      { user_id: "authenticated-user", plan: "free", status: "canceled", created_at: "2026-08-15T00:00:00Z" },
      { user_id: "authenticated-user", plan: "basic", status: "ACTIVE", created_at: "2026-08-14T00:00:00Z" },
      { user_id: "authenticated-user", plan: "growth", status: "trialing", created_at: "2026-08-01T00:00:00Z" }
    ]),
    { status: "entitled" }
  );
});

test("BASIC Garden entitlement reports membership query failures as unavailable", async () => {
  assert.deepEqual(await check([], { error: { message: "permission denied" } }), { status: "unavailable" });
  assert.deepEqual(await check([], { throwError: true }), { status: "unavailable" });
});
