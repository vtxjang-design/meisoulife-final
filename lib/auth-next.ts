export const DEFAULT_AUTH_NEXT_PATH = "/program/basic";

export function resolveSafeInternalNextPath(
  value: string | null | undefined,
  fallback: string = DEFAULT_AUTH_NEXT_PATH
) {
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

export function isUnsafeAuthReturnPath(path: string) {
  const pathname = resolveSafeInternalNextPath(path, fallbackPathForUnsafeCheck(path)).split(/[?#]/)[0] ?? "/";

  return pathname === "/login" || pathname === "/signup" || pathname === "/auth/callback" || pathname === "/auth/update-password";
}

function fallbackPathForUnsafeCheck(path: string) {
  return path.startsWith("/") ? path : DEFAULT_AUTH_NEXT_PATH;
}

export function resolveSafeReturnPath(
  value: string | null | undefined,
  fallback: string = DEFAULT_AUTH_NEXT_PATH
) {
  const safePath = resolveSafeInternalNextPath(value, fallback);

  return isUnsafeAuthReturnPath(safePath) ? fallback : safePath;
}

export function buildLoginHref(next: string | null | undefined) {
  return `/login?next=${encodeURIComponent(resolveSafeReturnPath(next))}`;
}
