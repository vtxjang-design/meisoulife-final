import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

type Row = Record<string, unknown>;

const tempDir = mkdtempSync(join(tmpdir(), "membership-resolver-read-only-test-"));
const resolverSource = readFileSync(new URL("./membership-resolver.ts", import.meta.url), "utf8")
  .replace('import "server-only";\n\n', "")
  .replace('import type Stripe from "stripe";\n', "")
  .replace('from "@/lib/membership"', 'from "./membership.mjs"')
  .replace('from "@/lib/stripe"', 'from "./stripe.mjs"')
  .replace('from "@/lib/supabase/admin"', 'from "./supabase-admin.mjs"')
  .replace('from "@/lib/stripe-billing"', 'from "./stripe-billing.mjs"');
const membershipSource = readFileSync(new URL("./membership.ts", import.meta.url), "utf8");
const stripeSource = `export function getStripeClient() { return null; }`;
const adminSource = `
let calls = 0;
export function getSupabaseAdminClient() { calls += 1; return null; }
export function __getAdminCallCount() { return calls; }
`;
const stripeBillingSource = `
let currentImpl = async () => ({ customerId: null, subscriptionId: null, plan: "free", status: null, currentPeriodEnd: null, customerSource: null, lookupStatus: "not_found", matchedCustomerCount: 0 });
export function __setStripeBillingImpl(fn) { currentImpl = fn; }
export async function resolveStripeBillingDetails(params) { return currentImpl(params); }
export function maskStripeCustomerId(value) { return value ? "masked" : null; }
`;

for (const [name, source] of [
  ["membership-resolver.mjs", resolverSource],
  ["membership.mjs", membershipSource],
  ["stripe.mjs", stripeSource],
  ["supabase-admin.mjs", adminSource],
  ["stripe-billing.mjs", stripeBillingSource]
] as const) {
  writeFileSync(
    join(tempDir, name),
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
    }).outputText
  );
}

const resolverModule = await import(pathToFileURL(join(tempDir, "membership-resolver.mjs")).href);
const stripeBillingModule = await import(pathToFileURL(join(tempDir, "stripe-billing.mjs")).href);
const adminModule = await import(pathToFileURL(join(tempDir, "supabase-admin.mjs")).href);
const { resolveMembershipEntitlement, resolveMembershipEntitlementReadOnly } = resolverModule;
const { __setStripeBillingImpl } = stripeBillingModule;
const { __getAdminCallCount } = adminModule;

process.on("exit", () => rmSync(tempDir, { recursive: true, force: true }));

class Query {
  private filters: Array<(row: Row) => boolean> = [];
  private orderColumn: string | null = null;
  private limitCount: number | null = null;
  private readonly rows: Row[];
  private readonly error: { message: string } | null;
  private readonly writeCounter: { count: number };

  constructor(rows: Row[], error: { message: string } | null, writeCounter: { count: number }) {
    this.rows = rows;
    this.error = error;
    this.writeCounter = writeCounter;
  }

  select() { return this; }
  eq(column: string, value: unknown) { this.filters.push((row) => row[column] === value); return this; }
  in(column: string, values: unknown[]) { this.filters.push((row) => values.includes(row[column])); return this; }
  order(column: string) { this.orderColumn = column; return this; }
  limit(count: number) { this.limitCount = count; return this; }
  update() { this.writeCounter.count += 1; throw new Error("read-only resolver attempted update"); }
  insert() { this.writeCounter.count += 1; throw new Error("read-only resolver attempted insert"); }

  private execute() {
    const rows = this.rows.filter((row) => this.filters.every((filter) => filter(row)));
    if (this.orderColumn) rows.sort((left, right) => String(right[this.orderColumn!]).localeCompare(String(left[this.orderColumn!])));
    return this.limitCount === null ? rows : rows.slice(0, this.limitCount);
  }

  async maybeSingle() { return { data: this.execute()[0] ?? null, error: this.error }; }
  then(resolve: (value: { data: Row[]; error: { message: string } | null }) => unknown) {
    return Promise.resolve(resolve({ data: this.execute(), error: this.error }));
  }
}

function createSupabase(options: { databaseError?: string } = {}) {
  const writes = { count: 0 };
  const rows: Record<string, Row[]> = {
    users: [{ id: "profile_1", auth_user_id: "auth_1", email: "member@example.com", current_plan: "free" }],
    memberships: [],
    subscriptions: []
  };
  return {
    writes,
    client: {
      from(table: string) {
        return new Query(rows[table] ?? [], options.databaseError ? { message: options.databaseError } : null, writes);
      }
    }
  };
}

test("read-only resolver authorizes trusted Stripe BASIC-or-higher results with no admin or writes", async () => {
  for (const plan of ["basic", "growth", "inner_circle"]) {
    const supabase = createSupabase();
    __setStripeBillingImpl(async () => ({
      customerId: "cus_test",
      subscriptionId: "sub_test",
      plan,
      status: "active",
      currentPeriodEnd: null,
      customerSource: "stripe_email",
      lookupStatus: "found",
      matchedCustomerCount: 1
    }));

    const result = await resolveMembershipEntitlementReadOnly({
      supabase: supabase.client,
      userId: "auth_1",
      email: "member@example.com",
      stripe: {} 
    });

    assert.equal(result.plan, plan);
    assert.equal(result.hasActiveSubscription, true);
    assert.equal(result.repaired, false);
    assert.equal(supabase.writes.count, 0);
  }

  assert.equal(__getAdminCallCount(), 0);

  const reconcilingSupabase = createSupabase();
  await resolveMembershipEntitlement({
    supabase: reconcilingSupabase.client,
    userId: "auth_1",
    email: "member@example.com",
    stripe: {}
  });
  assert.equal(__getAdminCallCount(), 1);
});

test("read-only resolver reports database or RLS failures as unresolved without writes", async () => {
  const supabase = createSupabase({ databaseError: "permission denied" });
  const adminCallsBefore = __getAdminCallCount();
  const result = await resolveMembershipEntitlementReadOnly({
    supabase: supabase.client,
    userId: "auth_1",
    email: "member@example.com",
    stripe: null
  });

  assert.equal(result.resolved, false);
  assert.notEqual(result.errorMessage, null);
  assert.equal(supabase.writes.count, 0);
  assert.equal(__getAdminCallCount(), adminCallsBefore);
});
