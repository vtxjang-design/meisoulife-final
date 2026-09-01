import "server-only";

type WebhookLedgerClient = {
  rpc: (
    functionName: string,
    params: Record<string, unknown>
  ) => PromiseLike<{ data: unknown; error: { message?: string } | null }>;
};

export type WebhookClaimOutcome = "claimed" | "completed" | "processing";

export type WebhookClaim = {
  outcome: WebhookClaimOutcome;
  claimToken: string | null;
  attemptCount: number;
};

export class WebhookLedgerError extends Error {
  readonly category: string;

  constructor(category: string) {
    super(`Stripe webhook ledger unavailable: ${category}`);
    this.name = "WebhookLedgerError";
    this.category = category;
  }
}

function firstRpcRow(data: unknown) {
  if (Array.isArray(data)) {
    return data[0] as Record<string, unknown> | undefined;
  }

  if (data && typeof data === "object") {
    return data as Record<string, unknown>;
  }

  return undefined;
}

export async function claimStripeWebhookEvent(
  client: WebhookLedgerClient | null,
  eventId: string,
  eventType: string
): Promise<WebhookClaim> {
  if (!client) {
    throw new WebhookLedgerError("missing_supabase_admin");
  }

  const { data, error } = await client.rpc("claim_stripe_webhook_event", {
    p_event_id: eventId,
    p_event_type: eventType
  });

  if (error) {
    throw new WebhookLedgerError("claim_failed");
  }

  const row = firstRpcRow(data);
  const outcome = row?.outcome;
  const claimToken = typeof row?.claim_token === "string" ? row.claim_token : null;
  const attemptCount = typeof row?.attempt_count === "number" ? row.attempt_count : 0;

  if (outcome !== "claimed" && outcome !== "completed" && outcome !== "processing") {
    throw new WebhookLedgerError("invalid_claim_result");
  }

  if (outcome === "claimed" && !claimToken) {
    throw new WebhookLedgerError("missing_claim_token");
  }

  return {
    outcome,
    claimToken,
    attemptCount
  };
}

async function transitionWebhookEvent(
  client: WebhookLedgerClient | null,
  functionName: "complete_stripe_webhook_event" | "fail_stripe_webhook_event",
  eventId: string,
  claimToken: string,
  errorCategory?: string
) {
  if (!client) {
    throw new WebhookLedgerError("missing_supabase_admin");
  }

  const params: Record<string, unknown> = {
    p_event_id: eventId,
    p_claim_token: claimToken
  };

  if (functionName === "fail_stripe_webhook_event") {
    params.p_error_category = errorCategory || "processing_failed";
  }

  const { data, error } = await client.rpc(functionName, params);

  if (error || data !== true) {
    throw new WebhookLedgerError(
      functionName === "complete_stripe_webhook_event" ? "completion_failed" : "failure_record_failed"
    );
  }
}

export async function completeStripeWebhookEvent(
  client: WebhookLedgerClient | null,
  eventId: string,
  claimToken: string
) {
  await transitionWebhookEvent(client, "complete_stripe_webhook_event", eventId, claimToken);
}

export async function failStripeWebhookEvent(
  client: WebhookLedgerClient | null,
  eventId: string,
  claimToken: string,
  errorCategory: string
) {
  await transitionWebhookEvent(
    client,
    "fail_stripe_webhook_event",
    eventId,
    claimToken,
    errorCategory
  );
}
