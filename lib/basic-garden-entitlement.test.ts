import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

type CanonicalResolution = {
  plan: string;
  membershipStatus: string | null;
  resolved: boolean;
  errorMessage: string | null;
  source: string;
};

const tempDir = mkdtempSync(join(tmpdir(), "basic-garden-entitlement-test-"));
const entitlementSource = readFileSync(new URL("./basic-garden-entitlement.ts", import.meta.url), "utf8")
  .replace('from "./membership-access"', 'from "./membership-access.mjs"')
  .replace('from "./membership"', 'from "./membership.mjs"')
  .replace('from "./membership-resolver"', 'from "./membership-resolver.mjs"');
const membershipSource = readFileSync(new URL("./membership.ts", import.meta.url), "utf8");
const membershipAccessSource = readFileSync(new URL("./membership-access.ts", import.meta.url), "utf8")
  .replace('from "@/lib/basic-rhythm"', 'from "./basic-rhythm.mjs"')
  .replace('from "@/lib/membership"', 'from "./membership.mjs"');
const resolverSource = `
let currentImpl = async () => ({ plan: "free", membershipStatus: null, resolved: true, errorMessage: null, source: "local" });
export function __setResolverImpl(fn) { currentImpl = fn; }
export async function resolveMembershipEntitlementReadOnly(params) { return currentImpl(params); }
`;

for (const [name, source] of [
  ["basic-garden-entitlement.mjs", entitlementSource],
  ["membership.mjs", membershipSource],
  ["membership-access.mjs", membershipAccessSource],
  ["membership-resolver.mjs", resolverSource],
  ["basic-rhythm.mjs", "export function getBasicPracticeByRouteType() { return null; }"]
] as const) {
  writeFileSync(
    join(tempDir, name),
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
    }).outputText
  );
}

const entitlementModule = await import(pathToFileURL(join(tempDir, "basic-garden-entitlement.mjs")).href);
const resolverModule = await import(pathToFileURL(join(tempDir, "membership-resolver.mjs")).href);
const { resolveBasicGardenEntitlement } = entitlementModule;
const { __setResolverImpl } = resolverModule;

process.on("exit", () => rmSync(tempDir, { recursive: true, force: true }));

async function check(resolution: CanonicalResolution) {
  __setResolverImpl(async () => resolution);
  return resolveBasicGardenEntitlement({
    client: { from: () => { throw new Error("the client is owned by the trusted resolver"); } },
    authUserId: "authenticated-user",
    authUserEmail: "member@example.com"
  });
}

test("BASIC Garden entitlement accepts canonical Stripe-backed BASIC-or-higher access", async () => {
  for (const plan of ["basic", "growth", "inner_circle"]) {
    assert.deepEqual(
      await check({ plan, membershipStatus: "ACTIVE", resolved: true, errorMessage: null, source: "stripe" }),
      { status: "entitled" },
      plan
    );
  }
});

test("BASIC Garden entitlement preserves memberships-backed active BASIC access", async () => {
  assert.deepEqual(
    await check({ plan: "basic", membershipStatus: "trialing", resolved: true, errorMessage: null, source: "local" }),
    { status: "entitled" }
  );
});

test("BASIC Garden entitlement rejects canonical free, inactive, canceled, and missing access", async () => {
  for (const resolution of [
    { plan: "free", membershipStatus: "active", resolved: true, errorMessage: null, source: "local" },
    { plan: "basic", membershipStatus: "inactive", resolved: true, errorMessage: null, source: "stripe" },
    { plan: "growth", membershipStatus: "canceled", resolved: true, errorMessage: null, source: "stripe" },
    { plan: "free", membershipStatus: null, resolved: true, errorMessage: null, source: "local" }
  ]) {
    assert.deepEqual(await check(resolution), { status: "not_entitled" });
  }
});

test("BASIC Garden entitlement maps resolver and operational failures to unavailable", async () => {
  assert.deepEqual(
    await check({ plan: "free", membershipStatus: null, resolved: false, errorMessage: "database unavailable", source: "unavailable" }),
    { status: "unavailable" }
  );

  __setResolverImpl(async () => { throw new Error("Stripe unavailable"); });
  assert.deepEqual(
    await resolveBasicGardenEntitlement({
      client: { from: () => null },
      authUserId: "authenticated-user",
      authUserEmail: "member@example.com"
    }),
    { status: "unavailable" }
  );
});
