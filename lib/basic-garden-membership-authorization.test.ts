import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

type Row = Record<string, unknown>;

const tempDir = mkdtempSync(join(tmpdir(), "basic-garden-membership-authorization-test-"));
const source = readFileSync(new URL("./basic-garden-membership-authorization.ts", import.meta.url), "utf8")
  .replace('import "server-only";\n\n', "")
  .replace('from "./membership-access"', 'from "./membership-access.mjs"')
  .replace('from "./membership"', 'from "./membership.mjs"')
  .replace('from "./stripe"', 'from "./stripe.mjs"')
  .replace('from "./stripe-billing"', 'from "./stripe-billing.mjs"');
const membershipSource = `
export function normalizeMembershipPlan(plan) { return ["basic", "growth", "inner_circle"].includes(plan) ? plan : "free"; }
export function isActiveMembershipStatus(status) { return ["active", "trialing"].includes((status || "").toLowerCase()); }
`;
const membershipAccessSource = `
import { isActiveMembershipStatus } from "./membership.mjs";
const levels = { free: 0, basic: 1, growth: 2, inner_circle: 3 };
export function hasProtectedMembershipAccess(params) { return isActiveMembershipStatus(params.membershipStatus) && levels[params.plan] >= levels[params.requiredPlan]; }
`;
const stripeSource = `let currentStripe = null; export function __setStripe(value) { currentStripe = value; } export function getStripeClient() { return currentStripe; }`;
const stripeBillingSource = `let currentImpl = async () => ({ lookupStatus: "not_found", plan: "free", status: null }); export function __setStripeBillingImpl(fn) { currentImpl = fn; } export async function resolveStripeBillingDetails(params) { return currentImpl(params); }`;

for (const [name, fileSource] of [
  ["authorization.mjs", source],
  ["membership.mjs", membershipSource],
  ["membership-access.mjs", membershipAccessSource],
  ["stripe.mjs", stripeSource],
  ["stripe-billing.mjs", stripeBillingSource]
] as const) {
  writeFileSync(join(tempDir, name), ts.transpileModule(fileSource, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText);
}

const authorizationModule = await import(pathToFileURL(join(tempDir, "authorization.mjs")).href);
const stripeModule = await import(pathToFileURL(join(tempDir, "stripe.mjs")).href);
const stripeBillingModule = await import(pathToFileURL(join(tempDir, "stripe-billing.mjs")).href);
const { resolveBasicGardenMembershipAuthorization } = authorizationModule;
const { __setStripe } = stripeModule;
const { __setStripeBillingImpl } = stripeBillingModule;

process.on("exit", () => rmSync(tempDir, { recursive: true, force: true }));

function createClient(options: { errors?: string[]; memberships?: Row[]; users?: Row[]; subscriptions?: Row[] } = {}) {
  const writes = { count: 0 };
  const rows: Record<string, Row[]> = {
    memberships: options.memberships ?? [],
    users: options.users ?? [{ id: "profile_1" }],
    subscriptions: options.subscriptions ?? []
  };
  const errors = new Set(options.errors ?? []);
  return {
    writes,
    from(table: string) {
      const result = { data: rows[table] ?? [], error: errors.has(table) ? { message: "permission denied" } : null };
      const query: any = {
        select: () => query,
        eq: () => query,
        order: () => query,
        maybeSingle: async () => ({ data: result.data[0] ?? null, error: result.error }),
        update: () => { writes.count += 1; throw new Error("write attempted"); },
        insert: () => { writes.count += 1; throw new Error("write attempted"); },
        delete: () => { writes.count += 1; throw new Error("write attempted"); },
        then: (resolve: (value: typeof result) => unknown) => Promise.resolve(resolve(result))
      };
      return query;
    }
  };
}

async function authorize(client: ReturnType<typeof createClient>) {
  return resolveBasicGardenMembershipAuthorization({
    supabase: client,
    authUserId: "auth_1",
    authUserEmail: "member@example.com"
  });
}

test("Stripe BASIC-or-higher remains entitled when local reads are RLS-hidden or fail", async () => {
  __setStripe({});
  for (const plan of ["basic", "growth", "inner_circle"]) {
    const client = createClient({ errors: ["users", "memberships", "subscriptions"] });
    __setStripeBillingImpl(async () => ({ lookupStatus: "found", plan, status: "ACTIVE" }));
    assert.deepEqual(await authorize(client), { status: "entitled" });
    assert.equal(client.writes.count, 0);
  }
});

test("clean local BASIC authorizes when Stripe is unavailable", async () => {
  __setStripe(null);
  const client = createClient({ memberships: [{ plan: "basic", status: "trialing" }] });
  assert.deepEqual(await authorize(client), { status: "entitled" });
  assert.equal(client.writes.count, 0);
});

test("clean free or inactive access is confirmed not entitled when Stripe has no entitlement", async () => {
  __setStripe({});
  __setStripeBillingImpl(async () => ({ lookupStatus: "not_found", plan: "free", status: null }));
  for (const memberships of [[], [{ plan: "basic", status: "canceled" }]]) {
    assert.deepEqual(await authorize(createClient({ memberships })), { status: "not_entitled" });
  }
});

test("local failure without a trusted Stripe result remains unavailable", async () => {
  const client = createClient({ errors: ["memberships"] });
  __setStripe(null);
  assert.deepEqual(await authorize(client), { status: "unavailable" });

  __setStripe({});
  __setStripeBillingImpl(async () => ({ lookupStatus: "ambiguous", plan: "free", status: null }));
  assert.deepEqual(await authorize(client), { status: "unavailable" });
  assert.equal(client.writes.count, 0);
});

test("authorization resolver has no admin, repair, or write dependency", () => {
  assert.doesNotMatch(source, /getSupabaseAdminClient|repairMembershipRecords|\.update\(|\.insert\(|\.upsert\(|\.delete\(/);
});
