export const AUTH_INACTIVITY_LIMIT_MS = 604_800_000;
export const AUTH_ACTIVITY_THROTTLE_MS = 60_000;
export const AUTH_ACTIVITY_STORAGE_KEY = "meisoulife_auth_last_activity_v1";
export const AUTH_DEFERRED_LOGOUT_STORAGE_KEY = "meisoulife_auth_deferred_logout_v1";
export const AUTH_LOGOUT_BROADCAST_STORAGE_KEY = "meisoulife_auth_logout_broadcast_v1";

const DEFAULT_AUTH_NEXT_PATH = "/program/basic";
const FUTURE_TIMESTAMP_TOLERANCE_MS = 300_000;
const LOGOUT_BROADCAST_TTL_MS = 30_000;

export type ParsedActivityTimestamp = {
  state: "missing" | "valid" | "expired" | "malformed" | "future";
  timestampMs: number | null;
  shouldInitialize: boolean;
  isExpired: boolean;
};

type DeferredLogoutPayload = {
  version: 1;
  nextPath: string;
  detectedAt: number;
};

type LogoutBroadcastPayload = {
  version: 1;
  nextPath: string;
  issuedAt: number;
  reason: "manual" | "inactivity";
};

export type InactivityAction =
  | { type: "none" }
  | { type: "initialize" }
  | { type: "deferred-pending"; nextPath: string }
  | { type: "defer-logout"; nextPath: string }
  | { type: "logout"; nextPath: string };

export function parseActivityTimestamp(
  rawValue: string | null | undefined,
  now: number,
  limitMs: number = AUTH_INACTIVITY_LIMIT_MS
): ParsedActivityTimestamp {
  if (typeof rawValue !== "string" || !rawValue.trim()) {
    return {
      state: "missing",
      timestampMs: null,
      shouldInitialize: true,
      isExpired: false
    };
  }

  const timestampMs = Number(rawValue);

  if (!Number.isFinite(timestampMs)) {
    return {
      state: "malformed",
      timestampMs: null,
      shouldInitialize: true,
      isExpired: false
    };
  }

  if (timestampMs > now + FUTURE_TIMESTAMP_TOLERANCE_MS) {
    return {
      state: "future",
      timestampMs,
      shouldInitialize: true,
      isExpired: false
    };
  }

  const elapsedMs = Math.max(0, now - timestampMs);
  const isExpired = elapsedMs >= limitMs;

  return {
    state: isExpired ? "expired" : "valid",
    timestampMs,
    shouldInitialize: false,
    isExpired
  };
}

export function shouldRefreshActivityTimestamp(
  timestampMs: number | null,
  now: number,
  throttleMs: number = AUTH_ACTIVITY_THROTTLE_MS
) {
  if (timestampMs === null) {
    return true;
  }

  return now - timestampMs >= throttleMs;
}

export function isProtectedInactivityPath(path: string | null | undefined) {
  const safePath = normalizeStoredPath(path, "/");
  const pathname = safePath.split(/[?#]/)[0] ?? "/";

  return (
    pathname === "/meditation" ||
    pathname === "/member" ||
    pathname === "/membership" ||
    pathname.startsWith("/membership/") ||
    pathname === "/success"
  );
}

export function serializeDeferredLogout(nextPath: string, detectedAt: number) {
  const payload: DeferredLogoutPayload = {
    version: 1,
    nextPath: normalizeStoredPath(nextPath, DEFAULT_AUTH_NEXT_PATH),
    detectedAt
  };

  return JSON.stringify(payload);
}

export function parseDeferredLogout(rawValue: string | null | undefined) {
  if (typeof rawValue !== "string" || !rawValue.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<DeferredLogoutPayload>;

    if (parsed.version !== 1 || typeof parsed.detectedAt !== "number") {
      return null;
    }

    return {
      nextPath: normalizeStoredPath(parsed.nextPath, DEFAULT_AUTH_NEXT_PATH),
      detectedAt: parsed.detectedAt
    };
  } catch {
    return null;
  }
}

export function serializeLogoutBroadcast(args: {
  nextPath: string;
  issuedAt: number;
  reason: "manual" | "inactivity";
}) {
  const payload: LogoutBroadcastPayload = {
    version: 1,
    nextPath: normalizeStoredPath(args.nextPath, DEFAULT_AUTH_NEXT_PATH),
    issuedAt: args.issuedAt,
    reason: args.reason
  };

  return JSON.stringify(payload);
}

export function parseLogoutBroadcast(rawValue: string | null | undefined) {
  if (typeof rawValue !== "string" || !rawValue.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<LogoutBroadcastPayload>;

    if (
      parsed.version !== 1 ||
      typeof parsed.issuedAt !== "number" ||
      (parsed.reason !== "manual" && parsed.reason !== "inactivity")
    ) {
      return null;
    }

    return {
      nextPath: normalizeStoredPath(parsed.nextPath, DEFAULT_AUTH_NEXT_PATH),
      issuedAt: parsed.issuedAt,
      reason: parsed.reason
    };
  } catch {
    return null;
  }
}

export function hasRecentLogoutBroadcast(
  rawValue: string | null | undefined,
  now: number,
  ttlMs: number = LOGOUT_BROADCAST_TTL_MS
) {
  const parsed = parseLogoutBroadcast(rawValue);

  if (!parsed) {
    return false;
  }

  return now - parsed.issuedAt <= ttlMs;
}

export function resolveInactivityAction(args: {
  authResolved: boolean;
  isAuthenticated: boolean;
  currentPath: string | null | undefined;
  rawActivityTimestamp: string | null | undefined;
  rawDeferredLogout: string | null | undefined;
  rawLogoutBroadcast: string | null | undefined;
  now: number;
}) {
  if (!args.authResolved || !args.isAuthenticated) {
    return { type: "none" } satisfies InactivityAction;
  }

  if (hasRecentLogoutBroadcast(args.rawLogoutBroadcast, args.now)) {
    return { type: "none" } satisfies InactivityAction;
  }

  const deferred = parseDeferredLogout(args.rawDeferredLogout);
  const currentPath = normalizeStoredPath(args.currentPath, DEFAULT_AUTH_NEXT_PATH);

  if (deferred) {
    if (isProtectedInactivityPath(currentPath)) {
      return {
        type: "deferred-pending",
        nextPath: deferred.nextPath
      } satisfies InactivityAction;
    }

    return {
      type: "logout",
      nextPath: deferred.nextPath
    } satisfies InactivityAction;
  }

  const parsedTimestamp = parseActivityTimestamp(args.rawActivityTimestamp, args.now);

  if (parsedTimestamp.shouldInitialize) {
    return { type: "initialize" } satisfies InactivityAction;
  }

  if (!parsedTimestamp.isExpired) {
    return { type: "none" } satisfies InactivityAction;
  }

  if (isProtectedInactivityPath(currentPath)) {
    return {
      type: "defer-logout",
      nextPath: currentPath
    } satisfies InactivityAction;
  }

  return {
    type: "logout",
    nextPath: currentPath
  } satisfies InactivityAction;
}

function normalizeStoredPath(value: string | null | undefined, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "https://www.meisoulife.local");

    if (parsed.origin !== "https://www.meisoulife.local") {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
