import { NextResponse } from "next/server";

const MAX_BODY_BYTES = 12_000;
const MAX_FIELD_LENGTH = 4_000;
const DEDUPE_WINDOW_MS = 60_000;

type AllowedErrorPayload = {
  errorName?: string;
  message?: string;
  stack?: string;
  digest?: string;
  componentStack?: string;
  pathname?: string;
  search?: string;
  meditationType?: string;
  language?: string;
  userAgent?: string;
  timestamp?: string;
  buildId?: string;
};

type DedupeEntry = {
  firstSeenAt: number;
  lastSeenAt: number;
  count: number;
};

const dedupeCache = new Map<string, DedupeEntry>();

function truncate(value: string, maxLength = MAX_FIELD_LENGTH) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function sanitizeField(value: unknown, maxLength = MAX_FIELD_LENGTH) {
  if (typeof value !== "string") {
    return undefined;
  }

  return truncate(value.trim(), maxLength);
}

function sanitizePayload(value: unknown): AllowedErrorPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  return {
    errorName: sanitizeField(candidate.errorName, 240),
    message: sanitizeField(candidate.message, 1_500),
    stack: sanitizeField(candidate.stack),
    digest: sanitizeField(candidate.digest, 240),
    componentStack: sanitizeField(candidate.componentStack),
    pathname: sanitizeField(candidate.pathname, 512),
    search: sanitizeField(candidate.search, 1_200),
    meditationType: sanitizeField(candidate.meditationType, 128),
    language: sanitizeField(candidate.language, 16),
    userAgent: sanitizeField(candidate.userAgent, 768),
    timestamp: sanitizeField(candidate.timestamp, 128),
    buildId: sanitizeField(candidate.buildId, 128)
  };
}

function createDedupeKey(payload: AllowedErrorPayload) {
  return JSON.stringify({
    errorName: payload.errorName ?? "",
    message: payload.message ?? "",
    digest: payload.digest ?? "",
    pathname: payload.pathname ?? "",
    search: payload.search ?? "",
    meditationType: payload.meditationType ?? "",
    language: payload.language ?? ""
  });
}

function pruneDedupeCache(now: number) {
  for (const [key, entry] of dedupeCache.entries()) {
    if (now - entry.lastSeenAt > DEDUPE_WINDOW_MS * 2) {
      dedupeCache.delete(key);
    }
  }
}

export async function POST(request: Request) {
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : null;

  if (contentLength !== null && Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let rawBody = "";

  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!rawBody || rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payload = sanitizePayload(parsedBody);

  if (!payload || !payload.message) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const now = Date.now();
  pruneDedupeCache(now);

  const dedupeKey = createDedupeKey(payload);
  const existing = dedupeCache.get(dedupeKey);

  if (existing && now - existing.firstSeenAt < DEDUPE_WINDOW_MS) {
    existing.lastSeenAt = now;
    existing.count += 1;
    dedupeCache.set(dedupeKey, existing);
    return NextResponse.json({ ok: true, deduped: true });
  }

  dedupeCache.set(dedupeKey, {
    firstSeenAt: now,
    lastSeenAt: now,
    count: 1
  });

  console.error("[meditation-client-error]", {
    ...payload,
    dedupeKey,
    receivedAt: new Date(now).toISOString()
  });

  return NextResponse.json({ ok: true });
}
