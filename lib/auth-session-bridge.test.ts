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

test("browser authentication uses the SSR cookie bridge", () => {
  assert.match(browserClientSource, /createBrowserClient/);
  assert.doesNotMatch(browserClientSource, /createClient\(url, anonKey/);
});

test("member routes refresh cookie-backed authentication", () => {
  assert.match(middlewareSource, /"\/member"/);
  assert.match(middlewareSource, /request\.cookies\.set\(name, value\)/);
  assert.match(middlewareSource, /response = NextResponse\.next\(\{\s*request\s*\}\)/);
});

test("password login starts a fresh server request after cookie persistence", () => {
  assert.match(authCardSource, /window\.location\.assign\(redirectTarget\)/);
});

test("member entry resolves entitlement without repairing membership records", () => {
  assert.match(memberPageSource, /resolveMembershipEntitlementReadOnly/);
  assert.doesNotMatch(memberPageSource, /resolveMembershipEntitlement\(/);
});

test("member return destinations reject authentication loops", () => {
  assert.match(memberPageSource, /resolveSafeReturnPath\(params\?\.next\)/);
  assert.match(memberContentSource, /resolveSafeReturnPath\(nextParam\)/);
  assert.match(memberContentSource, /resolveSafeReturnPath\(requestedNextPath\)/);
  assert.doesNotMatch(memberPageSource, /resolveSafeInternalNextPath/);
  assert.doesNotMatch(memberContentSource, /resolveSafeInternalNextPath/);
});
