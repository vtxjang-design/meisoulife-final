import assert from "node:assert/strict";
import test from "node:test";
import { resolveRequestAuthContext, type RequestAuthClient, type RequestAuthUser } from "./request-auth.ts";

function createAuthClient(options: {
  cookieUser?: RequestAuthUser | null;
  bearerUser?: RequestAuthUser | null;
  cookieThrows?: boolean;
  bearerThrows?: boolean;
  cookieError?: boolean;
  bearerError?: boolean;
}) {
  const calls: Array<string | undefined> = [];
  const client: RequestAuthClient = {
    auth: {
      async getUser(accessToken?: string) {
        calls.push(accessToken);

        if (accessToken) {
          if (options.bearerThrows) throw new Error("bearer lookup failed");
          return {
            data: { user: options.bearerUser ?? null },
            error: options.bearerError ? { message: "invalid bearer" } : null
          };
        }

        if (options.cookieThrows) throw new Error("cookie lookup failed");
        return {
          data: { user: options.cookieUser ?? null },
          error: options.cookieError ? { message: "invalid cookie" } : null
        };
      }
    },
    from() {
      throw new Error("database reads are not part of request auth resolution");
    }
  };

  return { calls, client };
}

test("valid cookie identity keeps the cookie RLS client and ignores a conflicting bearer", async () => {
  const cookie = createAuthClient({
    cookieUser: { id: "cookie-user", email: "cookie@example.com" },
    bearerUser: { id: "different-bearer-user", email: "bearer@example.com" }
  });
  let bearerClientCalls = 0;

  const result = await resolveRequestAuthContext({
    cookieClient: cookie.client,
    authorizationHeader: "Bearer different-user-token",
    createBearerClient() {
      bearerClientCalls += 1;
      return createAuthClient({ cookieUser: null }).client;
    }
  });

  assert.equal(result.status, "authenticated");
  if (result.status !== "authenticated") return;
  assert.equal(result.source, "cookie");
  assert.equal(result.user.id, "cookie-user");
  assert.equal(result.rlsClient, cookie.client);
  assert.deepEqual(cookie.calls, [undefined]);
  assert.equal(bearerClientCalls, 0);
});

test("bearer-only identity uses a bearer-scoped RLS client", async () => {
  const cookie = createAuthClient({ cookieUser: null, bearerUser: { id: "bearer-user" } });
  const bearerClient = createAuthClient({ cookieUser: null }).client;
  const tokens: string[] = [];

  const result = await resolveRequestAuthContext({
    cookieClient: cookie.client,
    authorizationHeader: "Bearer valid-token",
    createBearerClient(token) {
      tokens.push(token);
      return bearerClient;
    }
  });

  assert.equal(result.status, "authenticated");
  if (result.status !== "authenticated") return;
  assert.equal(result.source, "bearer");
  assert.equal(result.user.id, "bearer-user");
  assert.equal(result.rlsClient, bearerClient);
  assert.deepEqual(cookie.calls, [undefined, "valid-token"]);
  assert.deepEqual(tokens, ["valid-token"]);
});

test("expired cookie lookup can fall back to a valid bearer identity", async () => {
  const cookie = createAuthClient({ cookieThrows: true, bearerUser: { id: "bearer-user" } });
  const bearerClient = createAuthClient({ cookieUser: null }).client;

  const result = await resolveRequestAuthContext({
    cookieClient: cookie.client,
    authorizationHeader: "bearer valid-token",
    createBearerClient: () => bearerClient
  });

  assert.equal(result.status, "authenticated");
  if (result.status !== "authenticated") return;
  assert.equal(result.source, "bearer");
  assert.equal(result.rlsClient, bearerClient);
});

test("auth lookup errors do not accept a returned user identity", async () => {
  const cookie = createAuthClient({
    cookieUser: { id: "untrusted-cookie-user" },
    cookieError: true,
    bearerUser: { id: "untrusted-bearer-user" },
    bearerError: true
  });

  const result = await resolveRequestAuthContext({
    cookieClient: cookie.client,
    authorizationHeader: "Bearer invalid-token",
    createBearerClient: () => createAuthClient({ cookieUser: null }).client
  });

  assert.deepEqual(result, { status: "invalid" });
});

test("missing credentials resolve as anonymous without creating a bearer client", async () => {
  const cookie = createAuthClient({ cookieUser: null });
  let bearerClientCalls = 0;
  const result = await resolveRequestAuthContext({
    cookieClient: cookie.client,
    authorizationHeader: null,
    createBearerClient() {
      bearerClientCalls += 1;
      return null;
    }
  });

  assert.deepEqual(result, { status: "anonymous" });
  assert.equal(bearerClientCalls, 0);
});

test("malformed or invalid bearer credentials fail without an RLS client", async () => {
  for (const authorizationHeader of ["Basic abc", "Bearer", "Bearer   ", "Bearer invalid-token"]) {
    const cookie = createAuthClient({ cookieUser: null, bearerUser: null });
    let bearerClientCalls = 0;
    const result = await resolveRequestAuthContext({
      cookieClient: cookie.client,
      authorizationHeader,
      createBearerClient() {
        bearerClientCalls += 1;
        return createAuthClient({ cookieUser: null }).client;
      }
    });

    assert.deepEqual(result, { status: "invalid" }, authorizationHeader);
    assert.equal(bearerClientCalls, 0, authorizationHeader);
  }
});

test("validated bearer identity fails closed when its RLS client is unavailable", async () => {
  const cookie = createAuthClient({ cookieUser: null, bearerUser: { id: "bearer-user" } });
  const result = await resolveRequestAuthContext({
    cookieClient: cookie.client,
    authorizationHeader: "Bearer valid-token",
    createBearerClient: () => null
  });

  assert.deepEqual(result, { status: "unavailable" });
});

test("bearer verification errors fail as invalid credentials without throwing", async () => {
  const cookie = createAuthClient({ cookieUser: null, bearerThrows: true });
  const result = await resolveRequestAuthContext({
    cookieClient: cookie.client,
    authorizationHeader: "Bearer expired-token",
    createBearerClient: () => createAuthClient({ cookieUser: null }).client
  });

  assert.deepEqual(result, { status: "invalid" });
});
