import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const tempDir = mkdtempSync(join(tmpdir(), "stripe-webhook-route-test-"));
const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const originalAdminEmail = process.env.ADMIN_EMAIL;

const routeSource = readFileSync(new URL("./route.ts", import.meta.url), "utf8")
  .replace('from "next/server"', 'from "./next-server.mjs"')
  .replace('from "stripe"', 'from "./stripe-sdk.mjs"')
  .replace('from "@/lib/membership"', 'from "./membership.mjs"')
  .replace('from "@/lib/resend"', 'from "./resend.mjs"')
  .replace('from "@/lib/stripe"', 'from "./stripe-client.mjs"')
  .replace('from "@/lib/stripe-webhook-ledger"', 'from "./stripe-webhook-ledger.mjs"')
  .replace('from "@/lib/supabase/admin"', 'from "./supabase-admin.mjs"');

const modules = {
  "next-server.mjs": `
    export const NextResponse = {
      json(body, init = {}) {
        return new Response(JSON.stringify(body), {
          status: init.status ?? 200,
          headers: { "content-type": "application/json", ...(init.headers ?? {}) }
        });
      }
    };
  `,
  "stripe-sdk.mjs": `
    class StripeSignatureVerificationError extends Error {}
    class StripeInvalidRequestError extends Error {
      constructor(message, code) { super(message); this.code = code; }
    }
    export default class Stripe {
      static errors = { StripeSignatureVerificationError, StripeInvalidRequestError };
    }
  `,
  "membership.mjs": `
    export function normalizeLookupEmail(value) { return typeof value === "string" ? value.trim().toLowerCase() : null; }
    export function normalizeMembershipPlan(value) {
      return ["basic", "growth", "inner_circle"].includes(value) ? value : "free";
    }
  `,
  "resend.mjs": `
    let customerImpl = async () => {};
    let adminImpl = async () => {};
    const customerCalls = [];
    export function __setCustomerImpl(fn) { customerImpl = fn; }
    export function __setAdminImpl(fn) { adminImpl = fn; }
    export function __resetResend() { customerCalls.length = 0; customerImpl = async () => {}; adminImpl = async () => {}; }
    export function __getCustomerCalls() { return customerCalls; }
    export async function sendPaymentConfirmationEmail(payload) { customerCalls.push(payload); return customerImpl(payload); }
    export async function sendAdminPaymentNotification(payload) { return adminImpl(payload); }
  `,
  "stripe-client.mjs": `
    let client = null;
    export function __setStripeClient(value) { client = value; }
    export function getStripeClient() { return client; }
  `,
  "supabase-admin.mjs": `
    let client = null;
    export function __setAdminClient(value) { client = value; }
    export function getSupabaseAdminClient() { return client; }
  `,
  "stripe-webhook-ledger.mjs": `
    export class WebhookLedgerError extends Error {
      constructor(category) { super(category); this.category = category; }
    }
    let claimImpl = async () => ({ outcome: "claimed", claimToken: "claim-default", attemptCount: 1 });
    let completeImpl = async () => {};
    const completeCalls = [];
    const failCalls = [];
    export function __setClaimImpl(fn) { claimImpl = fn; }
    export function __setCompleteImpl(fn) { completeImpl = fn; }
    export function __resetLedger() {
      claimImpl = async () => ({ outcome: "claimed", claimToken: "claim-default", attemptCount: 1 });
      completeImpl = async () => {};
      completeCalls.length = 0;
      failCalls.length = 0;
    }
    export function __getCompleteCalls() { return completeCalls; }
    export function __getFailCalls() { return failCalls; }
    export async function claimStripeWebhookEvent(client, eventId, eventType) { return claimImpl(client, eventId, eventType); }
    export async function completeStripeWebhookEvent(client, eventId, claimToken) { completeCalls.push({ client, eventId, claimToken }); return completeImpl(client, eventId, claimToken); }
    export async function failStripeWebhookEvent(client, eventId, claimToken, category) { failCalls.push({ client, eventId, claimToken, category }); }
  `
};

writeFileSync(
  join(tempDir, "route.mjs"),
  ts.transpileModule(routeSource, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
  }).outputText
);

for (const [name, source] of Object.entries(modules)) {
  writeFileSync(join(tempDir, name), source);
}

const routeModule = await import(pathToFileURL(join(tempDir, "route.mjs")).href);
const stripeModule = await import(pathToFileURL(join(tempDir, "stripe-client.mjs")).href);
const adminModule = await import(pathToFileURL(join(tempDir, "supabase-admin.mjs")).href);
const ledgerModule = await import(pathToFileURL(join(tempDir, "stripe-webhook-ledger.mjs")).href);
const resendModule = await import(pathToFileURL(join(tempDir, "resend.mjs")).href);
const { POST } = routeModule;
const { __setStripeClient } = stripeModule;
const { __setAdminClient } = adminModule;
const {
  __getCompleteCalls,
  __getFailCalls,
  __resetLedger,
  __setClaimImpl,
  __setCompleteImpl,
  WebhookLedgerError
} = ledgerModule;
const { __getCustomerCalls, __resetResend, __setCustomerImpl, __setAdminImpl } = resendModule;

process.on("exit", () => rmSync(tempDir, { recursive: true, force: true }));

type MockDatabaseState = {
  membershipLookupError?: boolean;
  membershipWriteError?: boolean;
  membershipWrites: Array<Record<string, unknown>>;
  fromCalls: string[];
};

class Query {
  private operation = "select";
  private payload: Record<string, unknown> | null = null;
  private readonly table: string;
  private readonly state: MockDatabaseState;

  constructor(table: string, state: MockDatabaseState) {
    this.table = table;
    this.state = state;
  }

  select() { return this; }
  eq() { return this; }
  order() { return this; }
  limit() { return this; }
  update(payload: Record<string, unknown>) { this.operation = "update"; this.payload = payload; return this; }
  insert(payload: Record<string, unknown>) { this.operation = "insert"; this.payload = payload; return this; }

  async upsert(payload: Record<string, unknown>) {
    if (this.table === "users") return { error: null };
    this.payload = payload;
    return { error: null };
  }

  async maybeSingle() {
    if (this.table === "memberships") {
      if (this.operation === "select") {
        return {
          data: null,
          error: this.state.membershipLookupError ? { message: "membership lookup unavailable" } : null
        };
      }

      if (this.payload) this.state.membershipWrites.push(this.payload);
      return {
        data: this.payload,
        error: this.state.membershipWriteError ? { message: "membership write unavailable" } : null
      };
    }

    if (this.table === "users" && this.operation === "select") {
      return { data: null, error: null };
    }

    if (this.table === "subscriptions" && this.operation === "select") {
      return { data: null, error: null };
    }

    return { data: null, error: null };
  }

  then(resolve: (value: { error: null }) => unknown) {
    return Promise.resolve({ error: null }).then(resolve);
  }
}

function createSupabase(options: { membershipLookupError?: boolean; membershipWriteError?: boolean } = {}) {
  const state: MockDatabaseState = {
    ...options,
    membershipWrites: [],
    fromCalls: []
  };

  return {
    state,
    client: {
      auth: {
        admin: {
          async listUsers() {
            return { data: { users: [] }, error: null };
          }
        }
      },
      from(table: string) {
        state.fromCalls.push(table);
        return new Query(table, state);
      }
    }
  };
}

function createCheckoutEvent(id = "evt_checkout") {
  return {
    id,
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test",
        customer: "cus_test",
        subscription: "sub_test",
        customer_details: { email: "member@example.com", name: "Member" },
        customer_email: null,
        metadata: { user_id: "auth_user", plan: "basic", language: "ja" },
        amount_total: 1000,
        currency: "jpy"
      }
    }
  };
}

function createSubscription(status = "active") {
  return {
    id: "sub_test",
    customer: "cus_test",
    metadata: { user_id: "auth_user", plan: "basic" },
    status,
    items: { data: [{ current_period_end: 1_800_000_000 }] }
  };
}

function setStripeEvent(event: Record<string, unknown>, currentSubscription = createSubscription()) {
  __setStripeClient({
    webhooks: {
      constructEvent() { return event; }
    },
    subscriptions: {
      async retrieve() { return currentSubscription; }
    }
  });
}

function webhookRequest() {
  return new Request("https://www.meisoulife.com/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": "verified-signature" },
    body: "{}"
  });
}

async function readJson(response: Response) {
  return JSON.parse(await response.text()) as Record<string, unknown>;
}

beforeEach(() => {
  process.env.STRIPE_WEBHOOK_SECRET = "webhook-secret";
  delete process.env.ADMIN_EMAIL;
  __resetLedger();
  __resetResend();
  __setAdminClient(createSupabase().client);
  setStripeEvent({ id: "evt_default", type: "unhandled.test", data: { object: {} } });
});

afterEach(() => {
  if (originalWebhookSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;

  if (originalAdminEmail === undefined) delete process.env.ADMIN_EMAIL;
  else process.env.ADMIN_EMAIL = originalAdminEmail;
});

test("completed and concurrent duplicates return without business processing", async () => {
  const supabase = createSupabase();
  __setAdminClient(supabase.client);

  for (const outcome of ["completed", "processing"] as const) {
    __resetLedger();
    __setClaimImpl(async () => ({ outcome, claimToken: null, attemptCount: 1 }));
    const response = await POST(webhookRequest());
    const payload = await readJson(response);

    assert.equal(response.status, 200);
    assert.equal(payload.duplicate, true);
    assert.equal(payload.processing, outcome === "processing" ? true : undefined);
    assert.equal(__getCompleteCalls().length, 0);
    assert.equal(__getFailCalls().length, 0);
  }

  assert.equal(supabase.state.fromCalls.length, 0);
});

test("a claimed event is completed exactly once", async () => {
  const response = await POST(webhookRequest());

  assert.equal(response.status, 200);
  assert.deepEqual(__getCompleteCalls().map((call: { eventId: string; claimToken: string }) => ({
    eventId: call.eventId,
    claimToken: call.claimToken
  })), [{ eventId: "evt_default", claimToken: "claim-default" }]);
  assert.equal(__getFailCalls().length, 0);
});

test("membership partial failure records failed and returns a retryable 500", async () => {
  const supabase = createSupabase({ membershipLookupError: true });
  __setAdminClient(supabase.client);
  setStripeEvent(createCheckoutEvent());

  const response = await POST(webhookRequest());
  const payload = await readJson(response);

  assert.equal(response.status, 500);
  assert.equal(response.headers.get("Retry-After"), "60");
  assert.equal(payload.error, "Webhook processing failed");
  assert.equal(__getCompleteCalls().length, 0);
  assert.equal(__getFailCalls()[0]?.category, "membership_lookup");
});

test("a failed event can be claimed again and completed on retry", async () => {
  let attempt = 0;
  __setClaimImpl(async () => {
    attempt += 1;
    return { outcome: "claimed", claimToken: `claim-${attempt}`, attemptCount: attempt };
  });
  setStripeEvent(createCheckoutEvent("evt_retry"));

  __setAdminClient(createSupabase({ membershipLookupError: true }).client);
  const firstResponse = await POST(webhookRequest());
  assert.equal(firstResponse.status, 500);
  assert.equal(__getFailCalls().length, 1);

  const recovered = createSupabase();
  __setAdminClient(recovered.client);
  const retryResponse = await POST(webhookRequest());

  assert.equal(retryResponse.status, 200);
  assert.equal(__getCompleteCalls().at(-1)?.claimToken, "claim-2");
  assert.equal(recovered.state.membershipWrites[0]?.status, "active");
});

test("notification failure does not roll back a successful membership sync", async () => {
  const supabase = createSupabase();
  __setAdminClient(supabase.client);
  setStripeEvent(createCheckoutEvent("evt_notification"));
  __setCustomerImpl(async () => { throw new Error("notification unavailable"); });

  const response = await POST(webhookRequest());

  assert.equal(response.status, 200);
  assert.equal(supabase.state.membershipWrites.length, 1);
  assert.equal(__getCompleteCalls().length, 1);
  assert.equal(__getFailCalls().length, 0);
});

test("notifications start only after the event is durably completed", async () => {
  const supabase = createSupabase();
  __setAdminClient(supabase.client);
  setStripeEvent(createCheckoutEvent("evt_completion_failure"));
  __setCompleteImpl(async () => { throw new WebhookLedgerError("completion_failed"); });

  const response = await POST(webhookRequest());

  assert.equal(response.status, 503);
  assert.equal(supabase.state.membershipWrites.length, 1);
  assert.equal(__getCustomerCalls().length, 0);
  assert.equal(__getFailCalls()[0]?.category, "completion_failed");
});

test("out-of-order subscription events use Stripe's current subscription status", async () => {
  const supabase = createSupabase();
  __setAdminClient(supabase.client);
  const staleSubscription = createSubscription("active");
  setStripeEvent(
    {
      id: "evt_stale_update",
      type: "customer.subscription.updated",
      data: { object: staleSubscription }
    },
    createSubscription("canceled")
  );

  const response = await POST(webhookRequest());

  assert.equal(response.status, 200);
  assert.equal(supabase.state.membershipWrites[0]?.status, "canceled");
});

test("a stale payment failure cannot downgrade a currently active subscription", async () => {
  const supabase = createSupabase();
  __setAdminClient(supabase.client);
  setStripeEvent(
    {
      id: "evt_stale_payment_failure",
      type: "invoice.payment_failed",
      data: {
        object: {
          customer: "cus_test",
          customer_email: null,
          amount_due: 1000,
          parent: { subscription_details: { subscription: "sub_test" } }
        }
      }
    },
    createSubscription("active")
  );

  const response = await POST(webhookRequest());

  assert.equal(response.status, 200);
  assert.equal(supabase.state.membershipWrites[0]?.status, "active");
});

test("ledger unavailability fails closed with a retryable 503", async () => {
  __setClaimImpl(async () => { throw new WebhookLedgerError("claim_failed"); });

  const response = await POST(webhookRequest());
  const payload = await readJson(response);

  assert.equal(response.status, 503);
  assert.equal(response.headers.get("Retry-After"), "60");
  assert.equal(payload.error, "Webhook processing failed");
  assert.equal(__getCompleteCalls().length, 0);
});
