import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const headerSource = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
const memberPageSource = readFileSync(new URL("../app/member/page.tsx", import.meta.url), "utf8");
const centerSource = readFileSync(new URL("../components/member-account-center.tsx", import.meta.url), "utf8");

test("authenticated desktop navigation stays calm and routes account work through My Page", () => {
  assert.match(headerSource, /href="\/member"/);
  assert.doesNotMatch(headerSource, /href="\/account\/security"/);
  assert.doesNotMatch(headerSource, /console\.log/);
});

test("My Page groups program, membership, password security, and logout", () => {
  assert.match(memberPageSource, /<MemberAccountCenter email=\{initialEmail \|\| null\} membership=\{membershipSummary\}/);
  assert.match(centerSource, /<AccountSecurityCard email=\{email\}/);
  assert.match(centerSource, /fetch\("\/api\/stripe\/customer-portal"/);
  assert.match(centerSource, /await signOut\(\{ redirectTo: "\/" \}\)/);
});

test("My Page remains read-only with respect to membership and payment records", () => {
  assert.doesNotMatch(centerSource, /\.from\(|\.rpc\(|insert\(|update\(|delete\(|service_role/i);
  assert.match(memberPageSource, /resolveMembershipEntitlementReadOnly/);
});

test("My Page provides localized Japanese, Korean, and English copy", () => {
  assert.match(centerSource, /jp: \{/);
  assert.match(centerSource, /kr: \{/);
  assert.match(centerSource, /en: \{/);
});
