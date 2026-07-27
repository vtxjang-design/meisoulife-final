import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLoginHref,
  DEFAULT_AUTH_NEXT_PATH,
  resolveSafeInternalNextPath,
  resolveSafeReturnPath
} from "./auth-next.ts";

test("resolveSafeInternalNextPath preserves valid internal paths", () => {
  assert.equal(resolveSafeInternalNextPath("/program/basic"), "/program/basic");
  assert.equal(resolveSafeInternalNextPath("/program/basic?rhythm=morning"), "/program/basic?rhythm=morning");
  assert.equal(resolveSafeInternalNextPath("/program/basic#entry"), "/program/basic#entry");
});

test("resolveSafeInternalNextPath rejects external or malformed destinations", () => {
  assert.equal(resolveSafeInternalNextPath("https://example.com"), DEFAULT_AUTH_NEXT_PATH);
  assert.equal(resolveSafeInternalNextPath("//example.com"), DEFAULT_AUTH_NEXT_PATH);
  assert.equal(resolveSafeInternalNextPath("javascript:alert(1)"), DEFAULT_AUTH_NEXT_PATH);
  assert.equal(resolveSafeInternalNextPath(" program/basic "), DEFAULT_AUTH_NEXT_PATH);
});

test("resolveSafeReturnPath blocks auth-loop destinations for post-login return", () => {
  assert.equal(resolveSafeReturnPath("/login"), DEFAULT_AUTH_NEXT_PATH);
  assert.equal(resolveSafeReturnPath("/signup"), DEFAULT_AUTH_NEXT_PATH);
  assert.equal(resolveSafeReturnPath("/auth/callback?next=%2Fprogram%2Fbasic"), DEFAULT_AUTH_NEXT_PATH);
  assert.equal(resolveSafeReturnPath("/auth/update-password?next=%2Fprogram%2Fbasic"), DEFAULT_AUTH_NEXT_PATH);
});

test("buildLoginHref always encodes a safe internal next destination", () => {
  assert.equal(buildLoginHref("/program/basic"), "/login?next=%2Fprogram%2Fbasic");
  assert.equal(buildLoginHref("https://example.com"), "/login?next=%2Fprogram%2Fbasic");
  assert.equal(buildLoginHref("/login"), "/login?next=%2Fprogram%2Fbasic");
});
