import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

const tempDir = mkdtempSync(join(tmpdir(), "account-security-test-"));
const callbackSource = readFileSync(new URL("./account-security.ts", import.meta.url), "utf8").replace(
  'from "@/lib/env"',
  'from "./env.mjs"'
);

writeFileSync(
  join(tempDir, "account-security.mjs"),
  ts.transpileModule(callbackSource, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
  }).outputText
);
writeFileSync(join(tempDir, "env.mjs"), 'export function getSiteUrl() { return "https://www.meisoulife.com"; }');

const { buildOfficialPasswordRecoveryUrl } = await import(pathToFileURL(join(tempDir, "account-security.mjs")).href);
const accountPageSource = readFileSync(new URL("../app/account/security/page.tsx", import.meta.url), "utf8");
const loginPageSource = readFileSync(new URL("../app/login/page.tsx", import.meta.url), "utf8");
const cardSource = readFileSync(new URL("../components/account-security-card.tsx", import.meta.url), "utf8");
const resetPasswordCardSource = readFileSync(new URL("../components/reset-password-card.tsx", import.meta.url), "utf8");
const authCallbackSource = readFileSync(new URL("../app/auth/callback/route.ts", import.meta.url), "utf8");
const headerSource = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
const memberCenterSource = readFileSync(new URL("../components/member-account-center.tsx", import.meta.url), "utf8");
const middlewareSource = readFileSync(new URL("../middleware.ts", import.meta.url), "utf8");
const sitemapSource = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
const copySource = readFileSync(new URL("./i18n.tsx", import.meta.url), "utf8");

process.on("exit", () => rmSync(tempDir, { recursive: true, force: true }));

test("account security validates the browser session and redirects guests through the safe login-next flow", () => {
  assert.match(accountPageSource, /await supabase\.auth\.getUser\(\)/);
  assert.match(accountPageSource, /router\.replace\(buildLoginHref\(ACCOUNT_SECURITY_PATH\)\)/);
  assert.match(accountPageSource, /getSupabaseBrowserClient\(\)/);
  assert.doesNotMatch(accountPageSource, /getSupabaseServerClient|service_role|\.from\(|\.rpc\(/i);
  assert.match(callbackSource, /ACCOUNT_SECURITY_PATH = "\/account\/security"/);
});

test("a verified browser session supplies the account email and the login page honors a safe next path", () => {
  assert.match(accountPageSource, /setState\(\{ status: "authenticated", email: user\.email \?\? null \}\)/);
  assert.match(accountPageSource, /<AccountSecurityCard email=\{state\.email\}/);
  assert.match(loginPageSource, /new URLSearchParams\(window\.location\.search\)\.get\("next"\)/);
  assert.match(loginPageSource, /setNextPath\(resolveSafeReturnPath\(requestedNext\)\)/);
  assert.match(loginPageSource, /router\.replace\(nextPath\)/);
});

test("password-change emails target the registered email through Supabase and the official callback", () => {
  assert.match(cardSource, /resetPasswordForEmail\(email,/);
  assert.match(cardSource, /redirectTo: buildOfficialPasswordRecoveryUrl\(\)/);
  assert.doesNotMatch(cardSource, /window\.location\.origin/);
  assert.doesNotMatch(cardSource, /<input/);
  assert.equal(
    buildOfficialPasswordRecoveryUrl(),
    "https://www.meisoulife.com/auth/update-password"
  );
});

test("direct recovery links stay on the update-password route and support every configured Supabase recovery form", () => {
  assert.match(authCallbackSource, /resolveSafeInternalNextPath/);
  assert.match(resetPasswordCardSource, /exchangeCodeForSession\(code\)/);
  assert.match(resetPasswordCardSource, /verifyOtp\(\{[\s\S]*token_hash: tokenHash,[\s\S]*type: "recovery"/);
  assert.match(resetPasswordCardSource, /setSession\(\{[\s\S]*access_token: accessToken/);
  assert.doesNotMatch(resetPasswordCardSource, /router\.(push|replace)\([^)]*program\/basic/);
});

test("recovery failures keep tokens and internal errors out of the member UI and logs", () => {
  assert.match(resetPasswordCardSource, /category: "recovery_session_preparation_failed"/);
  assert.match(resetPasswordCardSource, /category: "recovery_session_unavailable"/);
  assert.match(resetPasswordCardSource, /category: "password_update_failed"/);
  assert.doesNotMatch(resetPasswordCardSource, /\$\{copy\.loginPage\.resetPageError\} \(\$\{error\.message\}\)/);
  assert.match(resetPasswordCardSource, /setMessage\(copy\.loginPage\.resetPageInvalid\)/);
  assert.match(resetPasswordCardSource, /await signOut\(\{ redirectTo: loginHref \}\)/);
});

test("password change is progressively disclosed inside My Page", () => {
  assert.match(headerSource, /href="\/member"/);
  assert.doesNotMatch(headerSource, /href="\/account\/security"/);
  assert.match(memberCenterSource, /<AccountSecurityCard email=\{email\}/);
});

test("account routes refresh authentication cookies and remain outside the sitemap", () => {
  assert.match(middlewareSource, /"\/account\/:path\*"/);
  assert.doesNotMatch(sitemapSource, /account\/security/);
});

test("account-security copy is available in Japanese, Korean, and English", () => {
  assert.equal((copySource.match(/accountSecurity: \{/g) ?? []).length, 3);
  assert.match(copySource, /changePassword: "パスワードを変更"/);
  assert.match(copySource, /changePassword: "비밀번호 변경"/);
  assert.match(copySource, /changePassword: "Change Password"/);
});

test("account-security has no direct membership, table, or RPC persistence path", () => {
  for (const source of [accountPageSource, cardSource, callbackSource]) {
    assert.doesNotMatch(source, /\.from\(|\.rpc\(|memberships|service_role/i);
  }
});
