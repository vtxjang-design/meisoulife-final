import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

const tempDir = mkdtempSync(join(tmpdir(), "garden-completion-route-test-"));

const routeSource = readFileSync(new URL("./route.ts", import.meta.url), "utf8")
  .replace('from "next/server"', 'from "./next-server.mjs"')
  .replace('from "@/lib/basic-garden-sync"', 'from "./basic-garden-sync.mjs"')
  .replace('from "@/lib/supabase/admin"', 'from "./supabase-admin.mjs"')
  .replace('from "@/lib/supabase/server"', 'from "./supabase-server.mjs"');

const nextServerSource = `
export const NextResponse = {
  json(body, init = {}) {
    return new Response(JSON.stringify(body), {
      status: init.status ?? 200,
      headers: { "content-type": "application/json" }
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
export function __setAdminClient(client) {
  currentClient = client;
}
export function getSupabaseAdminClient() {
  return currentClient;
}
`;

const basicGardenSyncSource = `
let currentImpl = async () => ({
  ok: true,
  matchedBy: "auth_user_id",
  writeAction: "update",
  profileFound: true,
  profileId: "profile-1",
  stats: {
    challengeDay: 1,
    checkInCount: 1
  },
  errorMessage: null
});

export function __setSyncImpl(fn) {
  currentImpl = fn;
}

export async function syncBasicGardenCompletion(params) {
  return currentImpl(params);
}
`;

for (const [name, source] of [
  ["route.mjs", routeSource],
  ["next-server.mjs", nextServerSource],
  ["supabase-server.mjs", supabaseServerSource],
  ["supabase-admin.mjs", supabaseAdminSource],
  ["basic-garden-sync.mjs", basicGardenSyncSource]
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

const { POST } = routeModule;
const { __setServerClient } = supabaseServerModule;
const { __setAdminClient } = supabaseAdminModule;
const { __setSyncImpl } = basicGardenSyncModule;

process.on("exit", () => {
  rmSync(tempDir, { recursive: true, force: true });
});

function createSupabaseAuthMock(options: {
  cookieUser?: { id: string; email: string } | null;
  cookieErrorMessage?: string | null;
  bearerUser?: { id: string; email: string } | null;
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
      writeAction: "update",
      profileFound: true,
      profileId: "profile-1",
      stats: {
        challengeDay: 1,
        checkInCount: 1
      },
      errorMessage: null
    };
  });

  const response = await POST(new Request("https://www.meisoulife.com/api/basic/garden-completion", { method: "POST" }));
  const payload = await readJson(response);

  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.deepEqual(supabase.calls, [undefined]);
  assert.equal(syncCalls.length, 1);
  assert.equal(syncCalls[0].authUserId, "auth-cookie");
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
      writeAction: "update",
      profileFound: true,
      profileId: "profile-2",
      stats: {
        challengeDay: 1,
        checkInCount: 1
      },
      errorMessage: null
    };
  });

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: {
        Authorization: "Bearer valid-access-token"
      }
    })
  );

  assert.equal(response.status, 200);
  assert.deepEqual(supabase.calls, [undefined, "valid-access-token"]);
  assert.equal(syncCalls.length, 1);
  assert.equal(syncCalls[0].authUserId, "auth-bearer");
  assert.equal(syncCalls[0].email, "bearer@example.com");
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
      writeAction: "update",
      profileFound: true,
      profileId: "profile-1",
      stats: {
        challengeDay: 1,
        checkInCount: 1
      },
      errorMessage: null
    };
  });

  const response = await POST(new Request("https://www.meisoulife.com/api/basic/garden-completion", { method: "POST" }));
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
      writeAction: "update",
      profileFound: true,
      profileId: "profile-1",
      stats: {
        challengeDay: 1,
        checkInCount: 1
      },
      errorMessage: null
    };
  });

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: {
        Authorization: "Token invalid-format"
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
      writeAction: "update",
      profileFound: true,
      profileId: "profile-1",
      stats: {
        challengeDay: 1,
        checkInCount: 1
      },
      errorMessage: null
    };
  });

  const response = await POST(
    new Request("https://www.meisoulife.com/api/basic/garden-completion", {
      method: "POST",
      headers: {
        Authorization: "Bearer expired-token"
      }
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
      writeAction: "update",
      profileFound: true,
      profileId: "profile-verified",
      stats: {
        challengeDay: 1,
        checkInCount: 1
      },
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
        checkInCount: 999
      })
    })
  );

  assert.equal(response.status, 200);
  assert.equal(syncCalls.length, 1);
  assert.equal(syncCalls[0].authUserId, "verified-user");
  assert.equal(syncCalls[0].email, "verified@example.com");
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
    writeAction: "update",
    profileFound: true,
    profileId: "profile-1",
    stats: {
      challengeDay: 1,
      checkInCount: 1
    },
    errorMessage: null
  }));

  const response = await POST(new Request("https://www.meisoulife.com/api/basic/garden-completion", { method: "POST" }));
  const payload = await readJson(response);

  assert.equal(response.status, 200);
  assert.equal(payload.checkInCount, 1);
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
    writeAction: "update",
    profileFound: true,
    profileId: "profile-1",
    stats: {
      challengeDay: 1,
      checkInCount: 0
    },
    errorMessage: "write failed"
  }));

  const response = await POST(new Request("https://www.meisoulife.com/api/basic/garden-completion", { method: "POST" }));
  const payload = await readJson(response);

  assert.equal(response.status, 500);
  assert.equal(payload.ok, false);
});

test("route source never logs Authorization headers, access tokens, emails, or full user ids", () => {
  const consoleStatements = routeSource.match(/console\.(warn|log|error)\([\s\S]*?\);/g)?.join("\n") ?? "";
  assert.doesNotMatch(consoleStatements, /authorization/i);
  assert.doesNotMatch(consoleStatements, /access_token/i);
  assert.doesNotMatch(consoleStatements, /userEmail/i);
  assert.doesNotMatch(consoleStatements, /userId:/);
});
