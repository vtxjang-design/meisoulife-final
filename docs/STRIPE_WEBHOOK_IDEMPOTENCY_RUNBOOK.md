# Stripe Webhook Idempotency Runbook

## Purpose

This runbook deploys the durable Stripe event claim ledger without changing
prices, Checkout UX, Customer Portal UX, or existing membership history.

The contract is:

- a verified Stripe event is atomically claimed before business processing;
- a completed event is acknowledged without running business logic again;
- a concurrent delivery observes `processing` and does not run business logic;
- a failed event, or a claim older than 15 minutes, can be claimed again;
- only the holder of the active claim token can mark an event completed or failed;
- membership, subscription, or user-plan sync failure returns a retryable non-2xx response;
- notification failure does not undo a successful membership sync.

## Production deployment order

1. Verify the code PR and all Vercel Preview checks.
2. Apply `20260902090000_harden_stripe_webhook_idempotency.sql` to Production Supabase.
3. Run `supabase/verification/stripe_webhook_idempotency_post_deploy.sql`.
4. Confirm that all three functions exist as `SECURITY DEFINER` and only
   `service_role` has execute access.
5. Merge the code PR so Production starts using the new RPC contract.
6. Confirm the Production deployment succeeds.
7. Send one Stripe test-mode event and verify a successful 2xx delivery.
8. Resend the same test event and verify it is acknowledged as a completed duplicate.

Do not paste event IDs, emails, Stripe customer IDs, subscription IDs, secrets,
or row data into chat, PR comments, screenshots, or logs.

## Expected failure behavior

- Invalid signature: HTTP 400, no ledger claim, no business query.
- Ledger unavailable: HTTP 503 with `Retry-After: 60`.
- Core sync failure: HTTP 500 with `Retry-After: 60`; the ledger records `failed`.
- Notification failure after core sync: HTTP 200; the ledger records `completed`.
- Concurrent duplicate: HTTP 200 with no second business execution.

Stripe retries non-2xx deliveries. A failed row is reclaimed on the next delivery.
A `processing` row is reclaimable after 15 minutes to recover from a terminated
serverless invocation.

## Rollback

If the application change causes a regression, revert the single application
commit. Leave the additive columns and RPC functions in place. The previous
`insert({ event_id })` behavior remains compatible because new ledger columns
have safe defaults and an event inserted by the old code is classified as
`completed`.

Do not drop the ledger table, delete event history, or rewrite membership data as
part of rollback. Any later schema cleanup requires a separate reviewed migration.

## Post-deploy observation

Monitor aggregate state and error categories without exposing event or customer
identifiers. Escalate if:

- `failed` events continue failing after Stripe retry;
- `processing` events remain older than 15 minutes;
- completion transition failures occur; or
- Stripe reports repeated non-2xx responses after Supabase recovery.
