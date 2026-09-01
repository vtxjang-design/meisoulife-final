import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const membershipRoute = readFileSync(
  new URL("../app/api/membership/resolve/route.ts", import.meta.url),
  "utf8"
);
const customerPortalRoute = readFileSync(
  new URL("../app/api/stripe/customer-portal/route.ts", import.meta.url),
  "utf8"
);

test("membership resolution uses the request identity's RLS client", () => {
  assert.match(membershipRoute, /resolveRequestAuthContext\s*\(/);
  assert.match(membershipRoute, /createBearerClient:\s*getSupabaseBearerServerClient/);
  assert.match(membershipRoute, /supabase:\s*auth\.rlsClient/);
  assert.doesNotMatch(membershipRoute, /function\s+resolveBearerToken/);
  assert.doesNotMatch(membershipRoute, /\.auth\.getUser\s*\(/);
});

test("customer portal completes local RLS reads with the resolved auth client", () => {
  const authResolutionIndex = customerPortalRoute.indexOf("resolveRequestAuthContext({");
  const rlsClientIndex = customerPortalRoute.indexOf("const supabase = auth.rlsClient;");
  const firstMembershipReadIndex = customerPortalRoute.indexOf('.from("memberships")');

  assert.ok(authResolutionIndex >= 0);
  assert.match(customerPortalRoute, /createBearerClient:\s*getSupabaseBearerServerClient/);
  assert.ok(rlsClientIndex > authResolutionIndex);
  assert.ok(firstMembershipReadIndex > rlsClientIndex);
  assert.doesNotMatch(customerPortalRoute, /function\s+resolveBearerToken/);
  assert.doesNotMatch(customerPortalRoute, /\.auth\.getUser\s*\(/);
});
