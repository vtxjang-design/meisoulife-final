import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const resolverSource = readFileSync(new URL("./membership-resolver.ts", import.meta.url), "utf8");
const migrationSource = readFileSync(
  new URL("../supabase/migrations/20260824080000_align_membership_entitlement_schema.sql", import.meta.url),
  "utf8"
);
const ownerSelectPolicySource = readFileSync(
  new URL("../supabase/migrations/20260824090000_allow_membership_owner_select.sql", import.meta.url),
  "utf8"
);

test("membership schema alignment is additive and preserves existing rows", () => {
  for (const column of ["email", "stripe_customer_id", "stripe_subscription_id", "current_period_end"]) {
    assert.match(migrationSource, new RegExp(`add column if not exists ${column}`));
  }

  assert.doesNotMatch(migrationSource, /\b(update|delete|truncate|drop)\b/i);
});

test("resolver falls back to the production five-column membership schema", () => {
  assert.match(
    resolverSource,
    /extendedSchema[\s\S]*?"id, user_id, plan, status, created_at"[\s\S]*?\.eq\("user_id", userId\)/
  );
});

test("resolver selects active user_id membership before deterministic historical fallback", () => {
  assert.match(resolverSource, /queryMembership\(true, true\)/);
  assert.match(resolverSource, /query\.in\("status", \["active", "trialing"\]\)/);
  assert.match(resolverSource, /\.order\("created_at", \{ ascending: false \}\)[\s\S]*?\.order\("id", \{ ascending: false \}\)/);
  assert.match(resolverSource, /queryMembership\(false, true\)/);
});

test("resolver does not consult legacy profile mirrors after a canonical user_id match", () => {
  assert.match(
    resolverSource,
    /if \(!membership\) \{[\s\S]*?\.from\("users"\)[\s\S]*?\.eq\("auth_user_id", userId\)/
  );
});

test("schema alignment indexes billing identifiers without imposing an unsafe uniqueness rule", () => {
  assert.match(migrationSource, /memberships_stripe_customer_id_idx/);
  assert.match(migrationSource, /memberships_stripe_subscription_id_idx/);
  assert.doesNotMatch(migrationSource, /create unique index/i);
});

test("membership RLS policy permits authenticated users to select only their own rows", () => {
  assert.match(ownerSelectPolicySource, /create policy "memberships_select_own"/i);
  assert.match(ownerSelectPolicySource, /on public\.memberships/i);
  assert.match(ownerSelectPolicySource, /for select\s+to authenticated/i);
  assert.match(ownerSelectPolicySource, /using \(auth\.uid\(\) = user_id\)/i);
  assert.doesNotMatch(ownerSelectPolicySource, /\bto anon\b/i);
});

test("membership owner policy does not grant writes or alter membership data", () => {
  assert.doesNotMatch(ownerSelectPolicySource, /\b(grant|revoke|update|delete|truncate|drop)\b/i);
  assert.doesNotMatch(ownerSelectPolicySource, /\bfor\s+(insert|update|delete|all)\b/i);
});
