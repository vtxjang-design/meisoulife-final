import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const tempDir = mkdtempSync(join(tmpdir(), "garden-visit-route-test-"));
const originalBasicGardenWritesPaused = process.env.BASIC_GARDEN_WRITES_PAUSED;

const routeSource = readFileSync(new URL("./route.ts", import.meta.url), "utf8")
  .replace('from "next/server"', 'from "./next-server.mjs"')
  .replace('from "@/lib/basic-garden-maintenance"', 'from "./basic-garden-maintenance.mjs"')
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
export function __setServerClient(client) { currentClient = client; }
export async function getSupabaseServerClient() { return currentClient; }
`;

const supabaseAdminSource = `
let currentClient = null;
let callCount = 0;
export function __setAdminClient(client) { currentClient = client; callCount = 0; }
export function __getAdminClientCallCount() { return callCount; }
export function getSupabaseAdminClient() { callCount += 1; return currentClient; }
`;

const basicGardenSyncSource = `
let currentImpl = async () => ({ ok: true, matchedBy: "auth_user_id", writeAction: "visit", activityDate: "2026-07-27", stats: { challengeDay: 1, checkInCount: 1, cumulativeVisitDays: 1, cumulativeRecoveryRecords: 1 }, recordedVisit: true, recordedCompletion: false, rewardGranted: false, distinctGateCount: 0, errorMessage: null });
export function __setSyncImpl(fn) { currentImpl = fn; }
export async function syncBasicGardenVisit(params) { return currentImpl(params); }
`;

for (const [name, source] of [
  ["route.mjs", routeSource],
  ["next-server.mjs", nextServerSource],
  ["supabase-server.mjs", supabaseServerSource],
  ["supabase-admin.mjs", supabaseAdminSource],
  ["basic-garden-maintenance.mjs", maintenanceSource],
  ["basic-garden-sync.mjs", basicGardenSyncSource]
] as const) {
  writeFileSync(join(tempDir, name), ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText);
}

const routeModule = await import(pathToFileURL(join(tempDir, "route.mjs")).href);
const serverModule = await import(pathToFileURL(join(tempDir, "supabase-server.mjs")).href);
const adminModule = await import(pathToFileURL(join(tempDir, "supabase-admin.mjs")).href);
const syncModule = await import(pathToFileURL(join(tempDir, "basic-garden-sync.mjs")).href);
const { POST } = routeModule;
const { __setServerClient } = serverModule;
const { __getAdminClientCallCount, __setAdminClient } = adminModule;
const { __setSyncImpl } = syncModule;

process.on("exit", () => rmSync(tempDir, { recursive: true, force: true }));

beforeEach(() => {
  delete process.env.BASIC_GARDEN_WRITES_PAUSED;
});

afterEach(() => {
  if (originalBasicGardenWritesPaused === undefined) delete process.env.BASIC_GARDEN_WRITES_PAUSED;
  else process.env.BASIC_GARDEN_WRITES_PAUSED = originalBasicGardenWritesPaused;
});

function createSupabaseAuthMock(user: { id: string } | null) {
  return { auth: { async getUser() { return { data: { user }, error: null }; } } };
}

async function readJson(response: Response) {
  return JSON.parse(await response.text()) as Record<string, unknown>;
}

test("normalized true maintenance values reject authenticated visits before admin or RPC use", async () => {
  let syncCallCount = 0;
  let rpcCallCount = 0;
  __setServerClient(createSupabaseAuthMock({ id: "auth-cookie" }));
  __setAdminClient({ rpc: async () => { rpcCallCount += 1; throw new Error("admin RPC must not run while paused"); } });
  __setSyncImpl(async () => { syncCallCount += 1; throw new Error("visit sync must not run while paused"); });

  for (const value of ["true", " TRUE ", "\tTrUe\n"]) {
    process.env.BASIC_GARDEN_WRITES_PAUSED = value;
    const response = await POST(new Request("https://www.meisoulife.com/api/basic/garden-visit", { method: "POST" }));
    const payload = await readJson(response);

    assert.equal(response.status, 503);
    assert.equal(payload.ok, false);
    assert.equal(payload.error, "BASIC_GARDEN_MAINTENANCE");
    assert.equal(payload.errorMessage, "Garden updates are temporarily unavailable.");
    assert.equal(response.headers.get("Retry-After"), "120");
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  }

  assert.equal(syncCallCount, 0);
  assert.equal(rpcCallCount, 0);
  assert.equal(__getAdminClientCallCount(), 0);
});

test("unset and non-true maintenance values preserve successful visit behavior", async () => {
  let syncCallCount = 0;
  let progressRpcCallCount = 0;
  __setServerClient(createSupabaseAuthMock({ id: "auth-cookie" }));
  __setAdminClient({ rpc: async () => { progressRpcCallCount += 1; return { data: { today_distinct_gate_count: 0 }, error: null }; } });
  __setSyncImpl(async () => {
    syncCallCount += 1;
    return { ok: true, matchedBy: "auth_user_id", writeAction: "visit", activityDate: "2026-07-27", stats: { challengeDay: 1, checkInCount: 1, cumulativeVisitDays: 1, cumulativeRecoveryRecords: 1 }, recordedVisit: true, recordedCompletion: false, rewardGranted: false, distinctGateCount: 0, errorMessage: null };
  });

  for (const value of [undefined, "false", "FALSE", "0", "yes"]) {
    if (value === undefined) delete process.env.BASIC_GARDEN_WRITES_PAUSED;
    else process.env.BASIC_GARDEN_WRITES_PAUSED = value;
    const response = await POST(new Request("https://www.meisoulife.com/api/basic/garden-visit", { method: "POST" }));
    assert.equal(response.status, 200);
  }

  assert.equal(syncCallCount, 5);
  assert.equal(progressRpcCallCount, 5);
});

test("unauthenticated visit remains rejected before the maintenance guard", async () => {
  process.env.BASIC_GARDEN_WRITES_PAUSED = "true";
  let syncCallCount = 0;
  __setServerClient(createSupabaseAuthMock(null));
  __setAdminClient({ rpc: async () => { throw new Error("admin RPC must not run"); } });
  __setSyncImpl(async () => { syncCallCount += 1; throw new Error("visit sync must not run"); });

  const response = await POST(new Request("https://www.meisoulife.com/api/basic/garden-visit", { method: "POST" }));
  const payload = await readJson(response);

  assert.equal(response.status, 401);
  assert.equal(payload.errorMessage, "Authenticated user is required");
  assert.equal(syncCallCount, 0);
});
