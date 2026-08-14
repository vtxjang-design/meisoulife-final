import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, test } from "node:test";
import ts from "typescript";

const tempDir = mkdtempSync(join(tmpdir(), "garden-completion-route-test-"));
const originalBasicGardenWritesPaused = process.env.BASIC_GARDEN_WRITES_PAUSED;

const routeSource = readFileSync(new URL("./route.ts", import.meta.url), "utf8")
  .replace('from "next/server"', 'from "./next-server.mjs"')
  .replace('from "@/lib/basic-garden"', 'from "./basic-garden.mjs"')
  .replace('from "@/lib/basic-garden-maintenance"', 'from "./basic-garden-maintenance.mjs"')
  .replace('from "@/lib/basic-garden-entitlement"', 'from "./basic-garden-entitlement.mjs"')
  .replace('from "@/lib/basic-garden-sync"', 'from "./basic-garden-sync.mjs"')
  .replace('from "@/lib/supabase/admin"', 'from "./supabase-admin.mjs"')
  .replace('from "@/lib/supabase/server"', 'from "./supabase-server.mjs"');
const maintenanceSource = readFileSync(new URL("../../../../lib/basic-garden-maintenance.ts", import.meta.url), "utf8");

const nextServerSource = `
export const NextResponse = {
  json(body, init = {}) {
    return new Response(JSON.stringify(body), {
      status: init.status ?? 200,
      headers: { "content-type": "application/json", ...(init.headers ?? {}) }
    });
  }
};
`;

const supabaseServerSource = `
let currentClient = null;
export function __setServerClient(client) {
  currentClient = client;
}
export async function getSupabaseServerClient() {
  return currentClient;
}
`;

const supabaseAdminSource = `
let currentClient = null;
let callCount = 0;
export function __setAdminClient(client) {
  currentClient = client;
  callCount = 0;
}
export function __getAdminClientCallCount() {
  return callCount;
}
export function getSupabaseAdminClient() {
  callCount += 1;
  return currentClient;
}
`;

const basicGardenSyncSource = `
let currentImpl = async () => ({
  ok: true,
  matchedBy: "auth_user_id",
  writeAction: "completion",
  activityDate: "2026-07-27",
  stats: {
    challengeDay: 1,
    checkInCount: 1,
    cumulativeVisitDays: 1,
    cumulativeRecoveryRecords: 1
  },
  recordedVisit: false,
  recordedCompletion: true,
  rewardGranted: false,
  distinctGateCount: 1,
  errorMessage: null
});

export function __setSyncImpl(fn) {
  currentImpl = fn;
}

export async function syncBasicGardenCompletion(params) {
  return currentImpl(params);
}
`;

const basicGardenSource = `
export function isEligibleBasicGardenGateKey(value) {
  return [
    "affirmation",
    "energy",
    "vision",
    "focus",
    "rest",
    "recharge",
    "release",
    "gratitude",
    "sleep"
  ].includes(value);
}
`;

const basicGardenEntitlementSource = `
let currentImpl = async () => ({ status: "entitled" });
export function __setEntitlementImpl(fn) { currentImpl = fn; }
export async function resolveBasicGardenEntitlement(params) { return currentImpl(params); }
`;

for (const [name, source] of [
  ["route.mjs", routeSource],
  ["next-server.mjs", nextServerSource],
  ["supabase-server.mjs", supabaseServerSource],
  ["supabase-admin.mjs", supabaseAdminSource],
  ["basic-garden-maintenance.mjs", maintenanceSource],
  ["basic-garden-entitlement.mjs", basicGardenEntitlementSource],
  ["basic-garden-sync.mjs", basicGardenSyncSource],
  ["basic-garden.mjs", basicGardenSource]
] as const) {
  writeFileSync(
    join(tempDir, name),
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ES2022,
        target: ts.ScriptTarget.ES2022
      }
    }).outputText
  );
}

const routeModule = await import(pathToFileURL(join(tempDir, "route.mjs")).href);
const supabaseServerModule = await import(pathToFileURL(join(tempDir, "supabase-server.mjs")).href);
const supabaseAdminModule = await import(pathToFileURL(join(tempDir, "supabase-admin.mjs")).href);
const basicGardenSyncModule = await import(pathToFileURL(join(tempDir, "basic-garden-sync.mjs")).href);
const basicGardenEntitlementModule = await import(pathToFileURL(join(tempDir, "basic-garden-entitlement.mjs")).href);

const { POST } = routeModule;
const { __setServerClient } = supabaseServerModule;
const { __getAdminClientCallCount, __setAdminClient } = supabaseAdminModule;
const { __setSyncImpl } = basicGardenSyncModule;
const { __setEntitlementImpl } = basicGardenEntitlementModule;

process.on("exit", () => {
  rmSync(tempDir, { recursive: true, force: true });
});

beforeEach(() => {
  delete process.env.BASIC_GARDEN_WRITES_PAUSED;
  __setEntitlementImpl(async () => ({ status: "entitled" }));
});

afterEach(() => {
  if (originalBasicGardenWritesPaused === undefined) {
    delete process.env.BASIC_GARDEN_WRITES_PAUSED;
  } else {
    process.env.BASIC_GARDEN_WRITES_PAUSED = originalBasicGardenWritesPaused;
  }
});

function createSupabaseAuthMock(options: {
  cookieUser?: { id: string; email?: string } | null;
  cookieErrorMessage?: string | null;
  bearerUser?: { id: string; email?: string } | null;
  bearerErrorMessage?: string | null;
}) {
  const calls: Array<string | undefined> = [];

  return {
    client: {
      auth: {
        async getUser(token?: string) {
          calls.push(token);

          if (token) {
            return {
              data: {
                user: options.bearerUser ?? null
              },
              error: options.bearerErrorMessage ? { message: options.bearerErrorMessage } : null
            };
          }

          return {
            data: {
              user: options.cookieUser ?? null
            },
            error: options.cookieErrorMessage ? { message: options.cookieErrorMessage } : null
          };
        }
      }
    },
    calls
  };
}

async function readJson(response: Response) {
  return JSON.parse(await response.text()) as Record<string, unknown>;
}

test("normalized true maintenance values reject authenticated completions before admin or RPC use", async () => {
  const supabase = createSupabaseAuthMock({ cookieUser: { id: "auth-cookie" } });
  let syncCallCount = 0;

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async () => {
    syncCallCount += 1;
    throw new Error("completion sync must not run while paused");
  });

  for (const value of ["true", " TRUE ", "\tTrUe\n"]) {
    process.env.BASIC_GARDEN_WRITES_PAUSED = value;
    const response = await POST(
      new Request("https://www.meisoulife.com/api/basic/garden-completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateKey: "affirmation" })
      })
    );
    const payload = await readJson(response);

    assert.equal(response.status, 503);
    assert.equal(payload.ok, false);
    assert.equal(payload.error, "BASIC_GARDEN_MAINTENANCE");
    assert.equal(payload.errorMessage, "Garden updates are temporarily unavailable.");
    assert.equal(response.headers.get("Retry-After"), "120");
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  }

  assert.equal(syncCallCount, 0);
  assert.equal(__getAdminClientCallCount(), 0);
});

test("values not normalized to true preserve authenticated completion behavior", async () => {
  const supabase = createSupabaseAuthMock({ cookieUser: { id: "auth-cookie" } });
  let syncCallCount = 0;

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async () => {
    syncCallCount += 1;
    return {
      ok: true,
      matchedBy: "auth_user_id",
      writeAction: "completion",
      activityDate: "2026-07-27",
      stats: { challengeDay: 1, checkInCount: 1, cumulativeVisitDays: 1, cumulativeRecoveryRecords: 1 },
      recordedVisit: false,
      recordedCompletion: true,
      rewardGranted: false,
      distinctGateCount: 1,
      errorMessage: null
    };
  });

  for (const value of [undefined, "false", "FALSE", "0", "yes"]) {
    if (value === undefined) {
      delete process.env.BASIC_GARDEN_WRITES_PAUSED;
    } else {
      process.env.BASIC_GARDEN_WRITES_PAUSED = value;
    }

    const response = await POST(
      new Request("https://www.meisoulife.com/api/basic/garden-completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateKey: "affirmation" })
      })
    );
    assert.equal(response.status, 200);
  }

  assert.equal(syncCallCount, 5);
});

test("unauthenticated completion remains rejected before the maintenance guard", async () => {
  process.env.BASIC_GARDEN_WRITES_PAUSED = "true";
  const supabase = createSupabaseAuthMock({ cookieUser: null });
  let syncCallCount = 0;

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async () => {
    syncCallCount += 1;
    throw new Error("completion sync must not run for an unauthenticated request");
  });

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gateKey: "affirmation" })
    })
  );
  const payload = await readJson(response);

  assert.equal(response.status, 401);
  assert.equal(payload.error, "authentication");
  assert.equal(syncCallCount, 0);
});

test("membership-denied completions return a generic 403 before admin or Garden RPC use", async () => {
  const deniedCases = ["no membership", "free plan", "non-BASIC plan", "inactive membership", "expired membership"];
  const supabase = createSupabaseAuthMock({ cookieUser: { id: "authenticated-user" } });
  let syncCallCount = 0;

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async () => { syncCallCount += 1; throw new Error("completion sync must not run"); });

  for (const deniedCase of deniedCases) {
    __setEntitlementImpl(async () => ({ status: "not_entitled" }));
    const response = await POST(
      new Request("https://www.meisoulife.com/api/basic/garden-completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateKey: "affirmation" })
      })
    );
    const payload = await readJson(response);

    assert.equal(response.status, 403, deniedCase);
    assert.equal(payload.ok, false, deniedCase);
    assert.equal(payload.error, "authorization", deniedCase);
    assert.equal(payload.errorMessage, "Access to this Garden is unavailable", deniedCase);
  }

  assert.equal(syncCallCount, 0);
  assert.equal(__getAdminClientCallCount(), 0);
});

test("active and trialing BASIC entitlement permits completions", async () => {
  const supabase = createSupabaseAuthMock({ cookieUser: { id: "authenticated-user" } });
  let syncCallCount = 0;
  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async () => {
    syncCallCount += 1;
    return {
      ok: true,
      matchedBy: "auth_user_id",
      writeAction: "completion",
      activityDate: "2026-07-27",
      stats: { challengeDay: 1, checkInCount: 1, cumulativeVisitDays: 1, cumulativeRecoveryRecords: 1 },
      recordedVisit: false,
      recordedCompletion: true,
      rewardGranted: false,
      distinctGateCount: 1,
      errorMessage: null
    };
  });

  for (const status of ["active", "trialing"]) {
    __setEntitlementImpl(async () => ({ status: "entitled" }));
    const response = await POST(
      new Request("https://www.meisoulife.com/api/basic/garden-completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateKey: "affirmation" })
      })
    );
    assert.equal(response.status, 200, status);
  }

  assert.equal(syncCallCount, 2);
});

test("unavailable membership lookups return 503 before admin or Garden RPC use", async () => {
  const supabase = createSupabaseAuthMock({ cookieUser: { id: "authenticated-user" } });
  let syncCallCount = 0;

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async () => { syncCallCount += 1; throw new Error("completion sync must not run"); });
  __setEntitlementImpl(async () => ({ status: "unavailable" }));

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gateKey: "affirmation" })
    })
  );
  const payload = await readJson(response);

  assert.equal(response.status, 503);
  assert.equal(payload.ok, false);
  assert.equal(payload.error, "service_unavailable");
  assert.equal(syncCallCount, 0);
  assert.equal(__getAdminClientCallCount(), 0);
});

test("cookie-authenticated request continues to work", async () => {
  const supabase = createSupabaseAuthMock({
    cookieUser: { id: "auth-cookie", email: "member@example.com" }
  });
  const syncCalls: Array<Record<string, unknown>> = [];

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async (params: Record<string, unknown>) => {
    syncCalls.push(params);
    return {
      ok: true,
      matchedBy: "auth_user_id",
      writeAction: "completion",
      activityDate: "2026-07-27",
      stats: {
        challengeDay: 1,
        checkInCount: 1
      },
      recordedVisit: false,
      recordedCompletion: true,
      rewardGranted: false,
      distinctGateCount: 1,
      errorMessage: null
    };
  });

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ gateKey: "affirmation" })
    })
  );
  const payload = await readJson(response);

  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.deepEqual(supabase.calls, [undefined]);
  assert.equal(syncCalls.length, 1);
  assert.equal(syncCalls[0].authUserId, "auth-cookie");
  assert.equal(syncCalls[0].gateKey, "affirmation");
});

test("a verified authenticated user without an email can persist a completion", async () => {
  const supabase = createSupabaseAuthMock({
    cookieUser: { id: "auth-without-email" }
  });
  const syncCalls: Array<Record<string, unknown>> = [];

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async (params: Record<string, unknown>) => {
    syncCalls.push(params);
    return {
      ok: true,
      matchedBy: "auth_user_id",
      writeAction: "completion",
      activityDate: "2026-07-27",
      stats: { challengeDay: 1, checkInCount: 0 },
      recordedVisit: false,
      recordedCompletion: true,
      rewardGranted: false,
      distinctGateCount: 1,
      failureCategory: null,
      errorMessage: null
    };
  });

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gateKey: "affirmation" })
    })
  );

  assert.equal(response.status, 200);
  assert.equal(syncCalls.length, 1);
  assert.equal(syncCalls[0].authUserId, "auth-without-email");
});

test("missing cookie session plus valid Bearer token authenticates the correct user", async () => {
  const supabase = createSupabaseAuthMock({
    cookieUser: null,
    cookieErrorMessage: "Auth session missing!",
    bearerUser: { id: "auth-bearer", email: "bearer@example.com" }
  });
  const syncCalls: Array<Record<string, unknown>> = [];

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async (params: Record<string, unknown>) => {
    syncCalls.push(params);
    return {
      ok: true,
      matchedBy: "auth_user_id",
      writeAction: "completion",
      activityDate: "2026-07-27",
      stats: {
        challengeDay: 1,
        checkInCount: 1
      },
      recordedVisit: false,
      recordedCompletion: true,
      rewardGranted: false,
      distinctGateCount: 1,
      errorMessage: null
    };
  });

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: {
        Authorization: "Bearer valid-access-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ gateKey: "affirmation" })
    })
  );

  assert.equal(response.status, 200);
  assert.deepEqual(supabase.calls, [undefined, "valid-access-token"]);
  assert.equal(syncCalls.length, 1);
  assert.equal(syncCalls[0].authUserId, "auth-bearer");
  assert.equal(syncCalls[0].gateKey, "affirmation");
});

test("missing both cookie session and Bearer token returns 401 without writing progress", async () => {
  const supabase = createSupabaseAuthMock({
    cookieUser: null,
    cookieErrorMessage: "Auth session missing!"
  });
  let syncCallCount = 0;

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async () => {
    syncCallCount += 1;
    return {
      ok: true,
      matchedBy: "auth_user_id",
      writeAction: "completion",
      activityDate: "2026-07-27",
      stats: {
        challengeDay: 1,
        checkInCount: 1
      },
      recordedVisit: false,
      recordedCompletion: true,
      rewardGranted: false,
      distinctGateCount: 1,
      errorMessage: null
    };
  });

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ gateKey: "affirmation" })
    })
  );
  const payload = await readJson(response);

  assert.equal(response.status, 401);
  assert.equal(payload.ok, false);
  assert.equal(syncCallCount, 0);
});

test("malformed Bearer header returns 401 without writing progress", async () => {
  const supabase = createSupabaseAuthMock({
    cookieUser: null,
    cookieErrorMessage: "Auth session missing!"
  });
  let syncCallCount = 0;

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async () => {
    syncCallCount += 1;
    return {
      ok: true,
      matchedBy: "auth_user_id",
      writeAction: "completion",
      activityDate: "2026-07-27",
      stats: {
        challengeDay: 1,
        checkInCount: 1
      },
      recordedVisit: false,
      recordedCompletion: true,
      rewardGranted: false,
      distinctGateCount: 1,
      errorMessage: null
    };
  });

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: {
        Authorization: "Token invalid-format",
        "Content-Type": "application/json"
      }
    })
  );
  const payload = await readJson(response);

  assert.equal(response.status, 401);
  assert.equal(payload.ok, false);
  assert.equal(syncCallCount, 0);
  assert.deepEqual(supabase.calls, [undefined]);
});

test("invalid or expired token returns 401", async () => {
  const supabase = createSupabaseAuthMock({
    cookieUser: null,
    cookieErrorMessage: "Auth session missing!",
    bearerUser: null,
    bearerErrorMessage: "JWT expired"
  });
  let syncCallCount = 0;

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async () => {
    syncCallCount += 1;
    return {
      ok: true,
      matchedBy: "auth_user_id",
      writeAction: "completion",
      activityDate: "2026-07-27",
      stats: {
        challengeDay: 1,
        checkInCount: 1
      },
      recordedVisit: false,
      recordedCompletion: true,
      rewardGranted: false,
      distinctGateCount: 1,
      errorMessage: null
    };
  });

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: {
        Authorization: "Bearer expired-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ gateKey: "affirmation" })
    })
  );

  assert.equal(response.status, 401);
  assert.equal(syncCallCount, 0);
});

test("a client-provided user ID cannot select or update another user", async () => {
  const supabase = createSupabaseAuthMock({
    cookieUser: null,
    cookieErrorMessage: "Auth session missing!",
    bearerUser: { id: "verified-user", email: "verified@example.com" }
  });
  const syncCalls: Array<Record<string, unknown>> = [];

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async (params: Record<string, unknown>) => {
    syncCalls.push(params);
    return {
      ok: true,
      matchedBy: "auth_user_id",
      writeAction: "completion",
      activityDate: "2026-07-27",
      stats: {
        challengeDay: 1,
        checkInCount: 1
      },
      recordedVisit: false,
      recordedCompletion: true,
      rewardGranted: false,
      distinctGateCount: 1,
      errorMessage: null
    };
  });

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: {
        Authorization: "Bearer valid-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: "other-user",
        email: "other@example.com",
        checkInCount: 999,
        gateKey: "affirmation"
      })
    })
  );

  assert.equal(response.status, 200);
  assert.equal(syncCalls.length, 1);
  assert.equal(syncCalls[0].authUserId, "verified-user");
  assert.equal(syncCalls[0].gateKey, "affirmation");
});

test("successful completion returns 200 and persisted check-ins update from 0 to 1", async () => {
  const supabase = createSupabaseAuthMock({
    cookieUser: { id: "auth-cookie", email: "member@example.com" }
  });

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async () => ({
    ok: true,
    matchedBy: "auth_user_id",
    writeAction: "completion",
    activityDate: "2026-07-27",
    stats: {
      challengeDay: 1,
      checkInCount: 1,
      cumulativeVisitDays: 1,
      cumulativeRecoveryRecords: 1
    },
    recordedVisit: false,
    recordedCompletion: true,
    rewardGranted: true,
    distinctGateCount: 3,
    errorMessage: null
  }));

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ gateKey: "vision" })
    })
  );
  const payload = await readJson(response);

  assert.equal(response.status, 200);
  assert.equal(payload.checkInCount, 1);
  assert.equal(payload.cumulativeVisitDays, 1);
  assert.equal(payload.cumulativeRecoveryRecords, 1);
  assert.equal(payload.rewardGranted, true);
});

test("persistence failure remains a safe 500 and does not return ok true", async () => {
  const supabase = createSupabaseAuthMock({
    cookieUser: { id: "auth-cookie", email: "member@example.com" }
  });

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async () => ({
    ok: false,
    matchedBy: "auth_user_id",
    writeAction: "completion",
    activityDate: "2026-07-27",
    stats: {
      challengeDay: 1,
      checkInCount: 0
    },
    recordedVisit: false,
    recordedCompletion: false,
    rewardGranted: false,
    distinctGateCount: 2,
    errorMessage: "write failed"
  }));

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ gateKey: "affirmation" })
    })
  );
  const payload = await readJson(response);

  assert.equal(response.status, 500);
  assert.equal(payload.ok, false);
  assert.equal(payload.error, "rpc");
  assert.equal(typeof payload.requestId, "string");
});

test("missing or invalid gate key returns 400 without writing progress", async () => {
  const supabase = createSupabaseAuthMock({
    cookieUser: { id: "auth-cookie", email: "member@example.com" }
  });
  let syncCallCount = 0;

  __setServerClient(supabase.client);
  __setAdminClient({ admin: true });
  __setSyncImpl(async () => {
    syncCallCount += 1;
    return {
      ok: true,
      matchedBy: "auth_user_id",
      writeAction: "completion",
      activityDate: "2026-07-27",
      stats: {
        challengeDay: 1,
        checkInCount: 1
      },
      recordedVisit: false,
      recordedCompletion: true,
      rewardGranted: false,
      distinctGateCount: 1,
      errorMessage: null
    };
  });

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ gateKey: "invalid-gate" })
    })
  );

  assert.equal(response.status, 400);
  assert.equal(syncCallCount, 0);
});

test("route source never logs Authorization headers, access tokens, emails, or full user ids", () => {
  const consoleStatements = routeSource.match(/console\.(warn|log|error)\([\s\S]*?\);/g)?.join("\n") ?? "";
  assert.doesNotMatch(consoleStatements, /authorization/i);
  assert.doesNotMatch(consoleStatements, /access_token/i);
  assert.doesNotMatch(consoleStatements, /userEmail/i);
  assert.doesNotMatch(consoleStatements, /userId:/);
});

test("route returns a request ID and safe generic category for each failure response", () => {
  assert.match(routeSource, /error: params\.clientError \?\? params\.category/);
  assert.match(routeSource, /requestId: params\.requestId/);
  assert.match(routeSource, /result\.failureCategory === "response_contract" \? "response_contract" : "rpc"/);
});
