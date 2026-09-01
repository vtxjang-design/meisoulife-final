import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { recordAuthDiagnostic } from "./auth-flow-diagnostics.ts";

const sourceFiles = [
  "../app/api/membership/resolve/route.ts",
  "../app/api/stripe/customer-portal/route.ts",
  "../app/api/stripe/checkout/route.ts",
  "../components/auth-provider.tsx",
  "./membership-resolver.ts",
  "./membership.ts",
  "./stripe-billing.ts",
  "./auth-flow-diagnostics.ts"
] as const;

const forbiddenLogProperty = /\b(?:userId|authUserId|profileId|email|customerId|subscriptionId|sessionId|metadata|currentPeriodStart|currentPeriodEnd|billingCycleAnchor|rawMembership|rawPlan)\s*:/;
const rawErrorArgument = /,\s*(?:error|[a-zA-Z]+Error)\s*\)$/;

function collectConsoleCalls(source: string, filename: string) {
  const sourceFile = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const calls: string[] = [];

  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === "console"
    ) {
      calls.push(node.getText(sourceFile));
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return calls;
}

test("auth and billing console logs exclude stable identifiers and raw records", () => {
  for (const relativePath of sourceFiles) {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
    const calls = collectConsoleCalls(source, relativePath);

    for (const call of calls) {
      assert.doesNotMatch(call, forbiddenLogProperty, `${relativePath}: ${call}`);
      assert.doesNotMatch(call, rawErrorArgument, `${relativePath}: ${call}`);
    }
  }
});

test("auth diagnostics strip query, hash, identifiers, and raw errors before persistence", () => {
  const storage = new Map<string, string>();
  const originalWindow = globalThis.window;
  const originalConsoleInfo = console.info;
  const loggedEntries: unknown[] = [];

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: {
        origin: "https://www.meisoulife.com",
        pathname: "/auth/callback",
        search: "?email=private@example.com&code=secret-code",
        hash: "#access_token=secret-token"
      },
      sessionStorage: {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        }
      }
    }
  });
  console.info = (...args: unknown[]) => {
    loggedEntries.push(args);
  };

  try {
    recordAuthDiagnostic("privacy_contract", {
      preservedNextRoute: "/member?email=private@example.com#secret",
      email: "private@example.com",
      userId: "stable-user-id",
      errorMessage: "provider failed for private@example.com",
      membershipSource: "local"
    });

    const serialized = storage.get("meisoulife_auth_flow_diagnostics") ?? "";
    const entries = JSON.parse(serialized) as Array<{
      path: string;
      payload: Record<string, unknown>;
    }>;

    assert.equal(entries[0]?.path, "/auth/callback");
    assert.equal(entries[0]?.payload.preservedNextRoute, "/member");
    assert.equal(entries[0]?.payload.email, true);
    assert.equal(entries[0]?.payload.userId, true);
    assert.equal(entries[0]?.payload.errorMessage, true);
    assert.equal(entries[0]?.payload.membershipSource, "local");
    assert.doesNotMatch(serialized, /private@example\.com|stable-user-id|secret-code|secret-token/);
    assert.equal(loggedEntries.length, 1);
    assert.doesNotMatch(JSON.stringify(loggedEntries), /private@example\.com|stable-user-id|secret-code|secret-token/);
  } finally {
    console.info = originalConsoleInfo;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow
    });
  }
});
