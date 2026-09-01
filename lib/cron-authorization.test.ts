import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveCronAuthorization } from "./cron-authorization.ts";

test("cron authorization fails closed when CRON_SECRET is missing or blank", () => {
  for (const configuredSecret of [undefined, null, "", "   "]) {
    assert.deepEqual(
      resolveCronAuthorization({
        configuredSecret,
        authorizationHeader: null
      }),
      {
        ok: false,
        status: 503,
        error: "Cron service unavailable"
      }
    );
  }
});

test("cron authorization rejects missing, incorrect, or malformed credentials", () => {
  for (const authorizationHeader of [null, "", "Bearer wrong-secret", "Bearer  expected-secret", "bearer expected-secret"]) {
    assert.deepEqual(
      resolveCronAuthorization({
        configuredSecret: "expected-secret",
        authorizationHeader
      }),
      {
        ok: false,
        status: 401,
        error: "Unauthorized"
      }
    );
  }
});

test("cron authorization permits only the exact configured bearer credential", () => {
  assert.deepEqual(
    resolveCronAuthorization({
      configuredSecret: "expected-secret",
      authorizationHeader: "Bearer expected-secret"
    }),
    {
      ok: true
    }
  );
});

const cronRoutePaths = [
  "../app/api/cron/challenge-reminders/route.ts",
  "../app/api/cron/inactive-users/route.ts",
  "../app/api/cron/weekly-report/route.ts",
  "../app/api/cron/leader-scan/route.ts"
];

test("every cron route applies the shared fail-closed authorization contract", () => {
  for (const routePath of cronRoutePaths) {
    const source = readFileSync(new URL(routePath, import.meta.url), "utf8");
    const authorizationCall = source.indexOf("const authorization = resolveCronAuthorization(");
    const successResponse = source.indexOf("ok: true");

    assert.notEqual(authorizationCall, -1, `${routePath} must resolve cron authorization`);
    assert.notEqual(successResponse, -1, `${routePath} must retain its success response`);
    assert.ok(authorizationCall < successResponse, `${routePath} must authorize before reporting success`);
    assert.match(source, /configuredSecret:\s*process\.env\.CRON_SECRET/);
    assert.match(source, /authorizationHeader:\s*request\.headers\.get\("authorization"\)/);
    assert.match(source, /"Cache-Control":\s*"no-store"/);
    assert.doesNotMatch(source, /process\.env\.CRON_SECRET\s*&&/);
  }
});

test("leader scan authorizes before creating an admin client or querying data", () => {
  const source = readFileSync(new URL("../app/api/cron/leader-scan/route.ts", import.meta.url), "utf8");
  const authorizationCall = source.indexOf("const authorization = resolveCronAuthorization(");
  const adminClientCall = source.indexOf("const supabase = getSupabaseAdminClient()");

  assert.notEqual(authorizationCall, -1);
  assert.notEqual(adminClientCall, -1);
  assert.ok(authorizationCall < adminClientCall);
});
