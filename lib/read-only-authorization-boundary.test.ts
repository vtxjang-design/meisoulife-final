import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const membershipApiSource = readFileSync(
  new URL("../app/api/membership/resolve/route.ts", import.meta.url),
  "utf8"
);
const premiumPageSource = readFileSync(
  new URL("../app/premium/page.tsx", import.meta.url),
  "utf8"
);

function assertReadOnlyAuthorizationBoundary(source: string, label: string) {
  assert.match(source, /resolveMembershipEntitlementReadOnly\s*\(/, label);
  assert.doesNotMatch(source, /\bresolveMembershipEntitlement\s*\(/, label);
  assert.doesNotMatch(source, /getSupabaseAdminClient/, label);
  assert.doesNotMatch(source, /\.from\([^)]*\)\.\s*(?:insert|update|upsert|delete)\s*\(/s, label);
}

test("membership GET uses the read-only entitlement boundary", () => {
  assertReadOnlyAuthorizationBoundary(membershipApiSource, "membership API");
});

test("Premium page guard uses the read-only entitlement boundary", () => {
  assertReadOnlyAuthorizationBoundary(premiumPageSource, "Premium page");
});
