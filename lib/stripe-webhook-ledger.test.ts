import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

const tempDir = mkdtempSync(join(tmpdir(), "stripe-webhook-ledger-test-"));
const source = readFileSync(new URL("./stripe-webhook-ledger.ts", import.meta.url), "utf8")
  .replace('import "server-only";\n\n', "");

writeFileSync(
  join(tempDir, "stripe-webhook-ledger.mjs"),
  ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
  }).outputText
);

const ledger = await import(pathToFileURL(join(tempDir, "stripe-webhook-ledger.mjs")).href);
const {
  claimStripeWebhookEvent,
  completeStripeWebhookEvent,
  failStripeWebhookEvent,
  WebhookLedgerError
} = ledger;

process.on("exit", () => rmSync(tempDir, { recursive: true, force: true }));

function createClient(handler: (name: string, params: Record<string, unknown>) => unknown) {
  return {
    async rpc(name: string, params: Record<string, unknown>) {
      return handler(name, params);
    }
  };
}

test("claim normalizes claimed, completed, and processing RPC outcomes", async () => {
  for (const outcome of ["claimed", "completed", "processing"] as const) {
    const claimToken = outcome === "claimed" ? "claim-token" : null;
    const client = createClient((name, params) => {
      assert.equal(name, "claim_stripe_webhook_event");
      assert.deepEqual(params, { p_event_id: "evt_1", p_event_type: "invoice.paid" });
      return {
        data: [{ outcome, claim_token: claimToken, attempt_count: 2 }],
        error: null
      };
    });

    assert.deepEqual(await claimStripeWebhookEvent(client, "evt_1", "invoice.paid"), {
      outcome,
      claimToken,
      attemptCount: 2
    });
  }
});

test("claim fails closed without a durable client or valid RPC result", async () => {
  await assert.rejects(
    claimStripeWebhookEvent(null, "evt_1", "invoice.paid"),
    (error: unknown) => error instanceof WebhookLedgerError && error.category === "missing_supabase_admin"
  );

  const erroredClient = createClient(() => ({ data: null, error: { message: "unavailable" } }));
  await assert.rejects(
    claimStripeWebhookEvent(erroredClient, "evt_1", "invoice.paid"),
    (error: unknown) => error instanceof WebhookLedgerError && error.category === "claim_failed"
  );

  const invalidClient = createClient(() => ({
    data: [{ outcome: "claimed", claim_token: null, attempt_count: 1 }],
    error: null
  }));
  await assert.rejects(
    claimStripeWebhookEvent(invalidClient, "evt_1", "invoice.paid"),
    (error: unknown) => error instanceof WebhookLedgerError && error.category === "missing_claim_token"
  );
});

test("completion and failure transitions require the active claim token", async () => {
  const calls: Array<{ name: string; params: Record<string, unknown> }> = [];
  const client = createClient((name, params) => {
    calls.push({ name, params });
    return { data: true, error: null };
  });

  await completeStripeWebhookEvent(client, "evt_1", "claim-1");
  await failStripeWebhookEvent(client, "evt_2", "claim-2", "membership_upsert");

  assert.deepEqual(calls, [
    {
      name: "complete_stripe_webhook_event",
      params: { p_event_id: "evt_1", p_claim_token: "claim-1" }
    },
    {
      name: "fail_stripe_webhook_event",
      params: {
        p_event_id: "evt_2",
        p_claim_token: "claim-2",
        p_error_category: "membership_upsert"
      }
    }
  ]);
});

test("a rejected completion is retryable instead of silently accepted", async () => {
  const client = createClient(() => ({ data: false, error: null }));

  await assert.rejects(
    completeStripeWebhookEvent(client, "evt_1", "obsolete-token"),
    (error: unknown) => error instanceof WebhookLedgerError && error.category === "completion_failed"
  );
});
