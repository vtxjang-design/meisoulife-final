/*
 * Forward-only membership schema alignment.
 *
 * Existing membership identity, plan, status, and history are preserved. The
 * nullable billing columns let verified Stripe webhook events enrich the
 * canonical user_id membership row without making email an entitlement key.
 */
alter table public.memberships
  add column if not exists email text,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists current_period_end timestamptz;

create index if not exists memberships_stripe_customer_id_idx
  on public.memberships (stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists memberships_stripe_subscription_id_idx
  on public.memberships (stripe_subscription_id)
  where stripe_subscription_id is not null;
