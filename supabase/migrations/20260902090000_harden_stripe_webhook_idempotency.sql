/*
 * Durable Stripe webhook claim ledger.
 *
 * Forward-only: existing event IDs are preserved and classified as completed.
 * No membership, subscription, profile, or Stripe data is rewritten.
 * A claim token prevents an obsolete worker from completing a reclaimed event.
 */

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  created_at timestamptz default now()
);

alter table public.stripe_webhook_events
  add column if not exists event_type text,
  add column if not exists status text not null default 'completed',
  add column if not exists claim_token uuid,
  add column if not exists attempt_count integer not null default 1,
  add column if not exists processing_started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists failed_at timestamptz,
  add column if not exists last_error_category text,
  add column if not exists updated_at timestamptz not null default now();

update public.stripe_webhook_events
set
  status = 'completed',
  completed_at = coalesce(completed_at, created_at),
  updated_at = coalesce(updated_at, created_at, now())
where status = 'completed';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'stripe_webhook_events_status_check'
      and conrelid = 'public.stripe_webhook_events'::regclass
  ) then
    alter table public.stripe_webhook_events
      add constraint stripe_webhook_events_status_check
      check (status in ('processing', 'completed', 'failed'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'stripe_webhook_events_attempt_count_check'
      and conrelid = 'public.stripe_webhook_events'::regclass
  ) then
    alter table public.stripe_webhook_events
      add constraint stripe_webhook_events_attempt_count_check
      check (attempt_count >= 1);
  end if;
end;
$$;

alter table public.stripe_webhook_events enable row level security;
revoke all on table public.stripe_webhook_events from anon, authenticated;
grant select, insert, update on table public.stripe_webhook_events to service_role;

create or replace function public.claim_stripe_webhook_event(
  p_event_id text,
  p_event_type text
)
returns table (
  outcome text,
  claim_token uuid,
  attempt_count integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_event public.stripe_webhook_events%rowtype;
  v_claim_token uuid;
begin
  if nullif(btrim(p_event_id), '') is null then
    raise exception 'event_id_required';
  end if;

  loop
    select *
    into v_event
    from public.stripe_webhook_events as events
    where events.event_id = p_event_id
    for update;

    if found then
      exit;
    end if;

    v_claim_token := gen_random_uuid();

    begin
      insert into public.stripe_webhook_events (
        event_id,
        event_type,
        status,
        claim_token,
        attempt_count,
        processing_started_at,
        updated_at
      )
      values (
        p_event_id,
        p_event_type,
        'processing',
        v_claim_token,
        1,
        now(),
        now()
      );

      return query select 'claimed'::text, v_claim_token, 1;
      return;
    exception
      when unique_violation then
        null;
    end;
  end loop;

  if v_event.status = 'completed' then
    return query select 'completed'::text, null::uuid, v_event.attempt_count;
    return;
  end if;

  if v_event.status = 'processing'
    and v_event.processing_started_at > now() - interval '15 minutes' then
    return query select 'processing'::text, null::uuid, v_event.attempt_count;
    return;
  end if;

  v_claim_token := gen_random_uuid();

  update public.stripe_webhook_events as events
  set
    event_type = coalesce(p_event_type, events.event_type),
    status = 'processing',
    claim_token = v_claim_token,
    attempt_count = events.attempt_count + 1,
    processing_started_at = now(),
    completed_at = null,
    failed_at = null,
    last_error_category = null,
    updated_at = now()
  where events.event_id = p_event_id;

  return query select 'claimed'::text, v_claim_token, v_event.attempt_count + 1;
end;
$$;

create or replace function public.complete_stripe_webhook_event(
  p_event_id text,
  p_claim_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.stripe_webhook_events as events
  set
    status = 'completed',
    completed_at = now(),
    failed_at = null,
    last_error_category = null,
    claim_token = null,
    updated_at = now()
  where events.event_id = p_event_id
    and events.status = 'processing'
    and events.claim_token = p_claim_token;

  return found;
end;
$$;

create or replace function public.fail_stripe_webhook_event(
  p_event_id text,
  p_claim_token uuid,
  p_error_category text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.stripe_webhook_events as events
  set
    status = 'failed',
    failed_at = now(),
    last_error_category = left(coalesce(nullif(btrim(p_error_category), ''), 'processing_failed'), 100),
    claim_token = null,
    updated_at = now()
  where events.event_id = p_event_id
    and events.status = 'processing'
    and events.claim_token = p_claim_token;

  return found;
end;
$$;

revoke all on function public.claim_stripe_webhook_event(text, text) from public, anon, authenticated;
revoke all on function public.complete_stripe_webhook_event(text, uuid) from public, anon, authenticated;
revoke all on function public.fail_stripe_webhook_event(text, uuid, text) from public, anon, authenticated;

grant execute on function public.claim_stripe_webhook_event(text, text) to service_role;
grant execute on function public.complete_stripe_webhook_event(text, uuid) to service_role;
grant execute on function public.fail_stripe_webhook_event(text, uuid, text) to service_role;
