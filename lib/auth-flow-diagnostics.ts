"use client";

const DIAGNOSTIC_STORAGE_KEY = "meisoulife_auth_flow_diagnostics";

type DiagnosticValue = string | number | boolean | null | undefined;

export type AuthDiagnosticPayload = Record<string, DiagnosticValue>;

function sanitizeDiagnosticValue(key: string, value: DiagnosticValue): DiagnosticValue {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedKey = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const containsSensitiveIdentifier = [
    "email",
    "userid",
    "profileid",
    "customerid",
    "subscriptionid",
    "sessionid",
    "accesstoken",
    "refreshtoken",
    "metadata"
  ].some((fragment) => normalizedKey.includes(fragment));

  if (containsSensitiveIdentifier || normalizedKey === "token" || normalizedKey.includes("error")) {
    return Boolean(value);
  }

  if (normalizedKey.includes("route") || normalizedKey.includes("destination") || normalizedKey.includes("path")) {
    try {
      return new URL(value, window.location.origin).pathname;
    } catch {
      return value.split(/[?#]/, 1)[0] || "/";
    }
  }

  return value;
}

function sanitizeDiagnosticPayload(payload: AuthDiagnosticPayload): AuthDiagnosticPayload {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, sanitizeDiagnosticValue(key, value)])
  );
}

export function recordAuthDiagnostic(event: string, payload: AuthDiagnosticPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const entry = {
    event,
    payload: sanitizeDiagnosticPayload(payload),
    path: window.location.pathname,
    recordedAt: new Date().toISOString()
  };

  try {
    const existingRaw = window.sessionStorage.getItem(DIAGNOSTIC_STORAGE_KEY);
    const existing = existingRaw ? (JSON.parse(existingRaw) as typeof entry[]) : [];
    const next = [...existing.slice(-39), entry];
    window.sessionStorage.setItem(DIAGNOSTIC_STORAGE_KEY, JSON.stringify(next));
  } catch {
    console.warn("[auth-diagnostic] failed to persist diagnostic entry", {
      category: "storage"
    });
  }

  console.info("[auth-diagnostic]", entry);
}
