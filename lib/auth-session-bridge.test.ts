import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const browserClientSource = readFileSync(new URL("./supabase/client.ts", import.meta.url), "utf8");
const memberPageSource = readFileSync(new URL("../app/member/page.tsx", import.meta.url), "utf8");
const memberContentSource = readFileSync(
  new URL("../components/member-entry-content.tsx", import.meta.url),
  "utf8"
);
const authCardSource = readFileSync(new URL("../components/auth-card.tsx", import.meta.url), "utf8");
const middlewareSource = readFileSync(new URL("../middleware.ts", import.meta.url), "utf8");
const serverLoginRouteSource = readFileSync(new URL("../app/auth/login/route.ts", import.meta.url), "utf8");

test("browser authentication uses the SSR cookie bridge", () => {
  assert.match(browserClientSource, /createBrowserClient/);
  assert.doesNotMatch(browserClientSource, /createClient\(url, anonKey/);
});

test("member routes refresh cookie-backed authentication", () => {
  assert.match(middlewareSource, /"\/member"/);
  assert.match(middlewareSource, /request\.cookies\.set\(name, value\)/);
  assert.match(middlewareSource, /response = NextResponse\.next\(\{\s*request\s*\}\)/);
});

test("password login is submitted to the server instead of creating a browser-only session", () => {
  assert.match(authCardSource, /action=\{mode === "login" \? "\/auth\/login" : undefined\}/);
  assert.match(authCardSource, /method=\{mode === "login" \? "post" : undefined\}/);
  assert.doesNotMatch(authCardSource, /auth\.signInWithPassword/);
});

test("server password login validates origin and next before setting cookies and redirecting", () => {
  assert.match(serverLoginRouteSource, /function isSameOriginPost/);
  assert.match(serverLoginRouteSource, /originUrl\.host === host/);
  assert.match(serverLoginRouteSource, /originUrl\.protocol === requestUrl\.protocol/);
  assert.match(serverLoginRouteSource, /resolveSafeReturnPath/);
  assert.match(serverLoginRouteSource, /response\.cookies\.set\(name, value, options as never\)/);
  assert.match(serverLoginRouteSource, /await supabase\.auth\.signInWithPassword\(\{ email, password \}\)/);
  assert.match(serverLoginRouteSource, /auth_error", "invalid_credentials"/);
  assert.doesNotMatch(serverLoginRouteSource, /console\.(log|warn|error)/);
});

test("member entry resolves entitlement without repairing membership records", () => {
  assert.match(memberPageSource, /resolveMembershipEntitlementReadOnly/);
  assert.doesNotMatch(memberPageSource, /resolveMembershipEntitlement\(/);
});

test("member diagnostics derive their labels from the same guard decision", () => {
  assert.match(memberPageSource, /resolveMemberGuardDecision\(authenticated, result\)/);
  assert.match(memberPageSource, /final guard decision: \{guard\.decision\}/);
  assert.match(memberPageSource, /redirect reason: \{guard\.redirectReason\}/);
  assert.doesNotMatch(memberPageSource, /final guard decision: blocked_to_member/);
  assert.match(
    memberPageSource,
    /if \(params\?\.membershipDebug === "1"\) \{\s+return <MembershipDebugPanel authenticated=\{Boolean\(user\)\} result=\{membershipDebugResult\} \/>;\s+\}/
  );
});

test("member return destinations reject authentication loops", () => {
  assert.match(memberContentSource, /resolveSafeReturnPath\(nextParam\)/);
  assert.match(memberContentSource, /resolveSafeReturnPath\(requestedNextPath\)/);
  assert.doesNotMatch(memberPageSource, /resolveSafeInternalNextPath/);
  assert.doesNotMatch(memberContentSource, /resolveSafeInternalNextPath/);
});
