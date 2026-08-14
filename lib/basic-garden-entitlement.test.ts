import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

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

const { hasBasicGardenEntitlement } = await import(pathToFileURL(join(tempDir, "basic-garden-entitlement.mjs")).href);

process.on("exit", () => rmSync(tempDir, { recursive: true, force: true }));

function createMembershipClient(rows: Array<{ user_id: string; plan: string | null; status: string | null; created_at: string }>) {
  return {
    from(table: string) {
      assert.equal(table, "memberships");
      return {
        select() {
          return this;
        },
        eq(_column: string, userId: string) {
          const matchingUser = rows.filter((row) => row.user_id === userId);
          return {
            in(_statusColumn: string, statuses: readonly string[]) {
              const active = matchingUser.filter((row) => row.status !== null && statuses.includes(row.status));
              return {
                order() {
                  return {
                    limit() {
                      return {
                        async maybeSingle() {
                          return {
                            data: [...active].sort((left, right) => right.created_at.localeCompare(left.created_at))[0] ?? null,
                            error: null
                          };
                        }
                      };
                    }
                  };
                }
              };
            }
          };
        }
      };
    }
  };
}

async function check(rows: Array<{ user_id: string; plan: string | null; status: string | null; created_at: string }>) {
  return hasBasicGardenEntitlement({
    client: createMembershipClient(rows),
    authUserId: "authenticated-user"
  });
}

test("BASIC Garden entitlement accepts active and trialing BASIC-or-higher memberships", async () => {
  for (const [plan, status] of [
    ["basic", "active"],
    ["basic_annual", "trialing"],
    ["growth", "active"],
    ["inner circle", "trialing"]
  ] as const) {
    assert.equal(await check([{ user_id: "authenticated-user", plan, status, created_at: "2026-08-14T00:00:00Z" }]), true);
  }
});

test("BASIC Garden entitlement rejects missing, free, non-BASIC, expired, and inactive memberships", async () => {
  assert.equal(await check([]), false);

  for (const [plan, status] of [
    ["free", "active"],
    ["unknown", "active"],
    ["basic", "expired"],
    ["basic", "canceled"],
    ["basic", "inactive"]
  ] as const) {
    assert.equal(await check([{ user_id: "authenticated-user", plan, status, created_at: "2026-08-14T00:00:00Z" }]), false);
  }
});

test("BASIC Garden entitlement uses the latest active or trialing membership for the authenticated user only", async () => {
  assert.equal(
    await check([
      { user_id: "other-user", plan: "basic", status: "active", created_at: "2026-08-15T00:00:00Z" },
      { user_id: "authenticated-user", plan: "basic", status: "active", created_at: "2026-08-01T00:00:00Z" },
      { user_id: "authenticated-user", plan: "growth", status: "trialing", created_at: "2026-08-14T00:00:00Z" }
    ]),
    true
  );
});
