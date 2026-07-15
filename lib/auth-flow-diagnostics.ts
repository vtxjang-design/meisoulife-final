"use client";

const DIAGNOSTIC_STORAGE_KEY = "meisoulife_auth_flow_diagnostics";

type DiagnosticValue = string | number | boolean | null | undefined;

export type AuthDiagnosticPayload = Record<string, DiagnosticValue>;

export function recordAuthDiagnostic(event: string, payload: AuthDiagnosticPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const entry = {
    event,
    payload,
    path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    recordedAt: new Date().toISOString()
  };

  try {
    const existingRaw = window.sessionStorage.getItem(DIAGNOSTIC_STORAGE_KEY);
    const existing = existingRaw ? (JSON.parse(existingRaw) as typeof entry[]) : [];
    const next = [...existing.slice(-39), entry];
    window.sessionStorage.setItem(DIAGNOSTIC_STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn("[auth-diagnostic] failed to persist diagnostic entry", error);
  }

  console.info("[auth-diagnostic]", entry);
}
