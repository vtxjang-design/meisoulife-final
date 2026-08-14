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
  .replace('from "./basic-garden-membership-authorization"', 'from "./basic-garden-membership-authorization.mjs"');
const authorizationSource = `
let currentImpl = async () => ({ status: "not_entitled" });
export function __setAuthorizationImpl(fn) { currentImpl = fn; }
export async function resolveBasicGardenMembershipAuthorization(params) { return currentImpl(params); }
`;

for (const [name, source] of [
  ["basic-garden-entitlement.mjs", entitlementSource],
  ["basic-garden-membership-authorization.mjs", authorizationSource]
] as const) {
  writeFileSync(
    join(tempDir, name),
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
    }).outputText
  );
}

const entitlementModule = await import(pathToFileURL(join(tempDir, "basic-garden-entitlement.mjs")).href);
const authorizationModule = await import(pathToFileURL(join(tempDir, "basic-garden-membership-authorization.mjs")).href);
const { resolveBasicGardenEntitlement } = entitlementModule;
const { __setAuthorizationImpl } = authorizationModule;

process.on("exit", () => rmSync(tempDir, { recursive: true, force: true }));

async function check(resolution: CanonicalResolution) {
  __setAuthorizationImpl(async () => {
    if (!resolution.resolved || resolution.errorMessage) return { status: "unavailable" };
    if (resolution.plan === "free" || !["active", "trialing", "ACTIVE", "TRIALING"].includes(resolution.membershipStatus ?? "")) {
      return { status: "not_entitled" };
    }
    return { status: "entitled" };
  });
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

  __setAuthorizationImpl(async () => { throw new Error("Stripe unavailable"); });
  assert.deepEqual(
    await resolveBasicGardenEntitlement({
      client: { from: () => null },
      authUserId: "authenticated-user",
      authUserEmail: "member@example.com"
    }),
    { status: "unavailable" }
  );
});
