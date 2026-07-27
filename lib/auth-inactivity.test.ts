import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  AUTH_ACTIVITY_THROTTLE_MS,
  AUTH_INACTIVITY_LIMIT_MS,
  hasRecentLogoutBroadcast,
  isProtectedInactivityPath,
  parseActivityTimestamp,
  parseDeferredLogout,
  parseLogoutBroadcast,
  resolveInactivityAction,
  serializeDeferredLogout,
  serializeLogoutBroadcast,
  shouldRefreshActivityTimestamp
} from "./auth-inactivity.ts";
import { buildLoginHref, DEFAULT_AUTH_NEXT_PATH, resolveSafeReturnPath } from "./auth-next.ts";

const authProviderSource = readFileSync(new URL("../components/auth-provider.tsx", import.meta.url), "utf8");
const siteHeaderSource = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
const membershipGuardSource = readFileSync(new URL("../components/membership-guard.tsx", import.meta.url), "utf8");
const resetPasswordCardSource = readFileSync(new URL("../components/reset-password-card.tsx", import.meta.url), "utf8");

test("active session within 7 days remains signed in", () => {
  const now = Date.UTC(2026, 6, 27, 12, 0, 0);
  const sixDaysAgo = now - (6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000);

  assert.deepEqual(
    resolveInactivityAction({
      authResolved: true,
      isAuthenticated: true,
      currentPath: "/program/basic",
      rawActivityTimestamp: String(sixDaysAgo),
      rawDeferredLogout: null,
      rawLogoutBroadcast: null,
      now
    }),
    { type: "none" }
  );
});

test("exactly 7 days and beyond expires consistently", () => {
  const now = Date.UTC(2026, 6, 27, 12, 0, 0);
  const exactlySevenDaysAgo = now - AUTH_INACTIVITY_LIMIT_MS;
  const parsed = parseActivityTimestamp(String(exactlySevenDaysAgo), now);

  assert.equal(parsed.state, "expired");
  assert.equal(parsed.isExpired, true);
});

test("missing timestamp initializes safely for an authenticated session", () => {
  assert.deepEqual(
    resolveInactivityAction({
      authResolved: true,
      isAuthenticated: true,
      currentPath: "/program/basic",
      rawActivityTimestamp: null,
      rawDeferredLogout: null,
      rawLogoutBroadcast: null,
      now: Date.UTC(2026, 6, 27, 12, 0, 0)
    }),
    { type: "initialize" }
  );
});

test("malformed and future timestamps initialize safely instead of forcing logout", () => {
  const now = Date.UTC(2026, 6, 27, 12, 0, 0);

  assert.equal(parseActivityTimestamp("not-a-number", now).state, "malformed");
  assert.equal(parseActivityTimestamp(String(now + 600_000), now).state, "future");
});

test("meaningful activity refreshes the timestamp with throttling", () => {
  const now = Date.UTC(2026, 6, 27, 12, 0, 0);
  const recent = now - (AUTH_ACTIVITY_THROTTLE_MS - 1);
  const stale = now - AUTH_ACTIVITY_THROTTLE_MS;

  assert.equal(shouldRefreshActivityTimestamp(recent, now), false);
  assert.equal(shouldRefreshActivityTimestamp(stale, now), true);
});

test("passive time passing alone does not refresh activity", () => {
  const now = Date.UTC(2026, 6, 27, 12, 0, 0);
  const parsed = parseActivityTimestamp(String(now - 120_000), now);

  assert.equal(parsed.state, "valid");
  assert.equal(shouldRefreshActivityTimestamp(parsed.timestampMs, now - 61_000), false);
});

test("protected flow defers logout and deferred logout fires after the flow ends", () => {
  const now = Date.UTC(2026, 6, 27, 12, 0, 0);
  const expired = String(now - AUTH_INACTIVITY_LIMIT_MS - 1);

  const deferAction = resolveInactivityAction({
    authResolved: true,
    isAuthenticated: true,
    currentPath: "/meditation?duration=180&type=night-release",
    rawActivityTimestamp: expired,
    rawDeferredLogout: null,
    rawLogoutBroadcast: null,
    now
  });

  assert.deepEqual(deferAction, {
    type: "defer-logout",
    nextPath: "/meditation?duration=180&type=night-release"
  });

  const deferred = serializeDeferredLogout("/meditation?duration=180&type=night-release", now);
  const logoutAction = resolveInactivityAction({
    authResolved: true,
    isAuthenticated: true,
    currentPath: "/program/basic",
    rawActivityTimestamp: expired,
    rawDeferredLogout: deferred,
    rawLogoutBroadcast: null,
    now: now + 5_000
  });

  assert.deepEqual(logoutAction, {
    type: "logout",
    nextPath: "/meditation?duration=180&type=night-release"
  });
});

test("safe return path is preserved and unsafe return paths fall back safely", () => {
  assert.equal(resolveSafeReturnPath("/program/basic?rhythm=evening"), "/program/basic?rhythm=evening");
  assert.equal(resolveSafeReturnPath("/login"), DEFAULT_AUTH_NEXT_PATH);
  assert.equal(resolveSafeReturnPath("/auth/callback?next=%2Fprogram%2Fbasic"), DEFAULT_AUTH_NEXT_PATH);
  assert.equal(buildLoginHref("/login"), "/login?next=%2Fprogram%2Fbasic");
});

test("repeated checks or multiple tabs do not cause repeated sign-out while a recent logout broadcast exists", () => {
  const now = Date.UTC(2026, 6, 27, 12, 0, 0);
  const broadcast = serializeLogoutBroadcast({
    nextPath: "/program/basic",
    issuedAt: now - 5_000,
    reason: "inactivity"
  });

  assert.equal(hasRecentLogoutBroadcast(broadcast, now), true);
  assert.deepEqual(
    resolveInactivityAction({
      authResolved: true,
      isAuthenticated: true,
      currentPath: "/program/basic",
      rawActivityTimestamp: String(now - AUTH_INACTIVITY_LIMIT_MS - 1),
      rawDeferredLogout: null,
      rawLogoutBroadcast: broadcast,
      now
    }),
    { type: "none" }
  );
});

test("protected path matching stays narrow and route-based", () => {
  assert.equal(isProtectedInactivityPath("/meditation"), true);
  assert.equal(isProtectedInactivityPath("/membership"), true);
  assert.equal(isProtectedInactivityPath("/membership/success"), true);
  assert.equal(isProtectedInactivityPath("/program/basic"), false);
});

test("serialized deferred and broadcast payloads stay versioned and safe", () => {
  const deferred = parseDeferredLogout(serializeDeferredLogout("/meditation?type=night-release", 123));
  const broadcast = parseLogoutBroadcast(
    serializeLogoutBroadcast({
      nextPath: "/program/basic",
      issuedAt: 456,
      reason: "manual"
    })
  );

  assert.deepEqual(deferred, {
    nextPath: "/meditation?type=night-release",
    detectedAt: 123
  });
  assert.deepEqual(broadcast, {
    nextPath: "/program/basic",
    issuedAt: 456,
    reason: "manual"
  });
});

test("manual logout cleanup is routed through the shared auth-provider signOut path", () => {
  assert.match(authProviderSource, /safeLocalStorageRemove\(AUTH_ACTIVITY_STORAGE_KEY\)/);
  assert.match(authProviderSource, /safeLocalStorageRemove\(AUTH_DEFERRED_LOGOUT_STORAGE_KEY\)/);
  assert.match(authProviderSource, /serializeLogoutBroadcast/);
  assert.match(siteHeaderSource, /await signOut\(\{ redirectTo: "\/" \}\)/);
  assert.match(membershipGuardSource, /await signOut\(\{ redirectTo: "\/" \}\)/);
  assert.match(resetPasswordCardSource, /await signOut\(\{ redirectTo: loginHref \}\)/);
});

test("auth-provider records meaningful activity only from explicit user-visible signals", () => {
  assert.match(authProviderSource, /visibilitychange/);
  assert.match(authProviderSource, /pointerdown/);
  assert.match(authProviderSource, /keydown/);
  assert.match(authProviderSource, /touchstart/);
  assert.doesNotMatch(authProviderSource, /setInterval/);
});
