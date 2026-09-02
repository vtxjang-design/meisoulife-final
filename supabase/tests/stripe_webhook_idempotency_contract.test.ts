import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../migrations/20260902090000_harden_stripe_webhook_idempotency.sql", import.meta.url),
  "utf8"
).toLowerCase();

test("migration preserves existing events as completed and defines durable states", () => {
  assert.match(migration, /status text not null default 'completed'/);
  assert.match(migration, /status in \('processing', 'completed', 'failed'\)/);
  assert.match(migration, /completed_at = coalesce\(completed_at, created_at\)/);
  assert.doesNotMatch(migration, /delete\s+from\s+public\.stripe_webhook_events/);
  assert.doesNotMatch(migration, /drop\s+table/);
});

test("claim serializes concurrent inserts and returns active duplicate states", () => {
  assert.match(migration, /for update/);
  assert.match(migration, /when unique_violation then/);
  assert.match(migration, /return query select 'completed'::text/);
  assert.match(migration, /return query select 'processing'::text/);
  assert.match(migration, /interval '15 minutes'/);
  assert.match(migration, /attempt_count = events\.attempt_count \+ 1/);
});

test("only the active claim token can complete or fail an event", () => {
  const tokenPredicates = migration.match(/events\.claim_token = p_claim_token/g) ?? [];
  assert.equal(tokenPredicates.length, 2);
  assert.match(migration, /create or replace function public\.complete_stripe_webhook_event/);
  assert.match(migration, /create or replace function public\.fail_stripe_webhook_event/);
});

test("ledger table and RPC execution are restricted to service_role", () => {
  assert.match(migration, /revoke all on table public\.stripe_webhook_events from anon, authenticated/);
  assert.match(migration, /grant select, insert, update on table public\.stripe_webhook_events to service_role/);
  assert.match(migration, /revoke all on function public\.claim_stripe_webhook_event\(text, text\) from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.claim_stripe_webhook_event\(text, text\) to service_role/);
});
