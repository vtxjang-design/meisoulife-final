-- Canonical BASIC accounting uses immutable completion events. The legacy
-- counter is frozen at this cutover and preserved only through a baseline.
begin;

create table if not exists public.basic_garden_progress_baselines (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  preserved_check_in_count integer not null check (preserved_check_in_count >= 0),
  ledger_count_at_baseline integer not null check (ledger_count_at_baseline >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.basic_garden_daily_rewards (
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  rewarded_gate_key text not null,
  created_at timestamptz not null default now(),
  primary key (auth_user_id, activity_date),
  constraint basic_garden_daily_rewards_gate_key_check check (
    rewarded_gate_key in ('affirmation', 'energy', 'vision', 'focus', 'rest', 'recharge', 'release', 'gratitude', 'sleep')
  )
);

alter table public.basic_garden_progress_baselines enable row level security;
alter table public.basic_garden_daily_rewards enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'basic_garden_progress_baselines'
      and policyname = 'Basic garden progress baselines self select'
  ) then
    create policy "Basic garden progress baselines self select"
      on public.basic_garden_progress_baselines
      for select to authenticated
      using (auth.uid() = auth_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'basic_garden_daily_rewards'
      and policyname = 'Basic garden daily rewards self select'
  ) then
    create policy "Basic garden daily rewards self select"
      on public.basic_garden_daily_rewards
      for select to authenticated
      using (auth.uid() = auth_user_id);
  end if;
end
$$;

-- The baseline is inserted once. It preserves a counter that may include
-- pre-ledger practice while preventing existing ledger rows being added twice.
with ledger_counts as (
  select bgc.auth_user_id, count(*)::integer as ledger_count
  from public.basic_garden_gate_completions as bgc
  group by bgc.auth_user_id
), candidates as (
  select bgp.auth_user_id from public.basic_garden_progress as bgp
  union
  select lc.auth_user_id from ledger_counts as lc
)
insert into public.basic_garden_progress_baselines (
  auth_user_id,
  preserved_check_in_count,
  ledger_count_at_baseline
)
select
  c.auth_user_id,
  greatest(coalesce(bgp.check_in_count, 0), coalesce(lc.ledger_count, 0)),
  coalesce(lc.ledger_count, 0)
from candidates as c
left join public.basic_garden_progress as bgp on bgp.auth_user_id = c.auth_user_id
left join ledger_counts as lc on lc.auth_user_id = c.auth_user_id
on conflict (auth_user_id) do nothing;

-- Retain existing reward markers as separate, idempotent reward records.
insert into public.basic_garden_daily_rewards (auth_user_id, activity_date, rewarded_gate_key)
select
  bgc.auth_user_id,
  bgc.activity_date,
  min(bgc.gate_key)
from public.basic_garden_gate_completions as bgc
where bgc.reward_granted = true
group by bgc.auth_user_id, bgc.activity_date
on conflict (auth_user_id, activity_date) do nothing;

create or replace function public.initialize_basic_garden_progress_baseline(
  p_auth_user_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public, auth
as $$
declare
  v_ledger_count integer := 0;
  v_stored_count integer := 0;
begin
  insert into public.basic_garden_progress as bgp (auth_user_id, challenge_day, check_in_count, updated_at)
  values (p_auth_user_id, 1, 0, now())
  on conflict (auth_user_id) do nothing;

  select count(*)::integer
  into v_ledger_count
  from public.basic_garden_gate_completions as bgc
  where bgc.auth_user_id = p_auth_user_id;

  select bgp.check_in_count
  into v_stored_count
  from public.basic_garden_progress as bgp
  where bgp.auth_user_id = p_auth_user_id;

  insert into public.basic_garden_progress_baselines as bgb (
    auth_user_id,
    preserved_check_in_count,
    ledger_count_at_baseline
  )
  values (
    p_auth_user_id,
    greatest(coalesce(v_stored_count, 0), v_ledger_count),
    v_ledger_count
  )
  on conflict (auth_user_id) do nothing;
end
$$;

create or replace function public.get_basic_garden_progress(
  p_auth_user_id uuid
)
returns table (
  auth_user_id uuid,
  challenge_day integer,
  check_in_count integer,
  today_distinct_gate_count integer,
  completed_day_count integer,
  preserved_check_in_count integer,
  ledger_count_at_baseline integer
)
language plpgsql
stable
security invoker
set search_path = public, auth
as $$
begin
  if auth.role() <> 'service_role' and auth.uid() is distinct from p_auth_user_id then
    raise exception 'Basic garden progress is only available to its owner' using errcode = '42501';
  end if;

  return query
  with ledger_totals as (
    select
      count(*)::integer as ledger_count,
      count(*) filter (
        where bgc.activity_date = timezone('Asia/Tokyo', now())::date
      )::integer as today_count
    from public.basic_garden_gate_completions as bgc
    where bgc.auth_user_id = p_auth_user_id
  ), completed_days as (
    select count(*)::integer as day_count
    from (
      select bgc.activity_date
      from public.basic_garden_gate_completions as bgc
      where bgc.auth_user_id = p_auth_user_id
      group by bgc.activity_date
      having count(*) >= 3
    ) as completed
  )
  select
    p_auth_user_id,
    coalesce(bgp.challenge_day, 0),
    coalesce(bgb.preserved_check_in_count, 0) + greatest(
      coalesce(lt.ledger_count, 0) - coalesce(bgb.ledger_count_at_baseline, 0),
      0
    ),
    least(coalesce(lt.today_count, 0), 3),
    coalesce(cd.day_count, 0),
    coalesce(bgb.preserved_check_in_count, 0),
    coalesce(bgb.ledger_count_at_baseline, 0)
  from ledger_totals as lt
  cross join completed_days as cd
  left join public.basic_garden_progress as bgp on bgp.auth_user_id = p_auth_user_id
  left join public.basic_garden_progress_baselines as bgb on bgb.auth_user_id = p_auth_user_id;
end
$$;

create or replace function public.record_basic_garden_visit(
  p_auth_user_id uuid
)
returns table (
  auth_user_id uuid,
  visit_date date,
  challenge_day integer,
  check_in_count integer,
  visit_recorded boolean
)
language plpgsql
security invoker
set search_path = public, auth
as $$
declare
  v_visit_date date := timezone('Asia/Tokyo', now())::date;
  v_visit_inserted integer := 0;
begin
  perform public.initialize_basic_garden_progress_baseline(p_auth_user_id);

  insert into public.basic_garden_visits as bgv (auth_user_id, visit_date)
  values (p_auth_user_id, v_visit_date)
  on conflict do nothing;

  get diagnostics v_visit_inserted = row_count;

  if v_visit_inserted > 0 then
    update public.basic_garden_progress as bgp
    set challenge_day = bgp.challenge_day + 1,
        updated_at = now()
    where bgp.auth_user_id = p_auth_user_id;
  end if;

  return query
  select
    bgp.auth_user_id,
    v_visit_date,
    bgp.challenge_day,
    bgp.check_in_count,
    v_visit_inserted > 0
  from public.get_basic_garden_progress(p_auth_user_id) as bgp;
end
$$;

create or replace function public.record_basic_garden_completion(
  p_auth_user_id uuid,
  p_gate_key text
)
returns table (
  auth_user_id uuid,
  activity_date date,
  gate_key text,
  challenge_day integer,
  check_in_count integer,
  completion_recorded boolean,
  reward_granted boolean,
  distinct_gate_count integer
)
language plpgsql
security invoker
set search_path = public, auth
as $$
declare
  v_activity_date date := timezone('Asia/Tokyo', now())::date;
  v_completion_inserted integer := 0;
  v_reward_inserted integer := 0;
  v_distinct_gate_count integer := 0;
begin
  if p_gate_key not in (
    'affirmation', 'energy', 'vision', 'focus', 'rest', 'recharge', 'release', 'gratitude', 'sleep'
  ) then
    raise exception 'Invalid basic garden gate key' using errcode = '22023';
  end if;

  perform public.initialize_basic_garden_progress_baseline(p_auth_user_id);

  insert into public.basic_garden_gate_completions as bgc (auth_user_id, activity_date, gate_key)
  values (p_auth_user_id, v_activity_date, p_gate_key)
  on conflict do nothing;

  get diagnostics v_completion_inserted = row_count;

  select count(*)::integer
  into v_distinct_gate_count
  from public.basic_garden_gate_completions as bgc
  where bgc.auth_user_id = p_auth_user_id
    and bgc.activity_date = v_activity_date;

  if v_completion_inserted > 0 and v_distinct_gate_count >= 3 then
    insert into public.basic_garden_daily_rewards as bgdr (
      auth_user_id,
      activity_date,
      rewarded_gate_key
    )
    values (p_auth_user_id, v_activity_date, p_gate_key)
    on conflict do nothing;

    get diagnostics v_reward_inserted = row_count;

    if v_reward_inserted > 0 then
      update public.basic_garden_gate_completions as bgc
      set reward_granted = true
      where bgc.auth_user_id = p_auth_user_id
        and bgc.activity_date = v_activity_date
        and bgc.gate_key = p_gate_key;
    end if;
  end if;

  return query
  select
    bgp.auth_user_id,
    v_activity_date,
    p_gate_key,
    bgp.challenge_day,
    bgp.check_in_count,
    v_completion_inserted > 0,
    v_reward_inserted > 0,
    bgp.today_distinct_gate_count
  from public.get_basic_garden_progress(p_auth_user_id) as bgp;
end
$$;

-- Keep the legacy RPC signature callable without allowing it to mutate the
-- frozen counter. No application path currently calls this function.
create or replace function public.upsert_basic_garden_progress(
  p_auth_user_id uuid,
  p_challenge_day integer default 1
)
returns table (
  auth_user_id uuid,
  challenge_day integer,
  check_in_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  was_created boolean
)
language plpgsql
security invoker
set search_path = public, auth
as $$
declare
  v_was_created boolean := false;
  v_inserted integer := 0;
begin
  insert into public.basic_garden_progress as bgp (auth_user_id, challenge_day, check_in_count, updated_at)
  values (p_auth_user_id, greatest(coalesce(p_challenge_day, 1), 1), 0, now())
  on conflict do nothing;

  get diagnostics v_inserted = row_count;
  v_was_created := v_inserted > 0;
  perform public.initialize_basic_garden_progress_baseline(p_auth_user_id);

  return query
  select
    bgp.auth_user_id,
    greatest(bgp.challenge_day, coalesce(p_challenge_day, 1)),
    bgp.check_in_count,
    legacy.created_at,
    legacy.updated_at,
    v_was_created
  from public.get_basic_garden_progress(p_auth_user_id) as bgp
  join public.basic_garden_progress as legacy on legacy.auth_user_id = bgp.auth_user_id;
end
$$;

revoke all on function public.initialize_basic_garden_progress_baseline(uuid) from public;
revoke all on function public.record_basic_garden_visit(uuid) from public;
revoke all on function public.record_basic_garden_completion(uuid, text) from public;
revoke all on function public.upsert_basic_garden_progress(uuid, integer) from public;
revoke all on function public.get_basic_garden_progress(uuid) from public;

grant execute on function public.initialize_basic_garden_progress_baseline(uuid) to service_role;
grant execute on function public.record_basic_garden_visit(uuid) to service_role;
grant execute on function public.record_basic_garden_completion(uuid, text) to service_role;
grant execute on function public.upsert_basic_garden_progress(uuid, integer) to service_role;
grant execute on function public.get_basic_garden_progress(uuid) to authenticated, service_role;
grant select on public.basic_garden_progress_baselines, public.basic_garden_daily_rewards to authenticated;
grant all on public.basic_garden_progress_baselines, public.basic_garden_daily_rewards to service_role;

-- Recovery: do not delete completion or reward ledgers. If this change must be
-- reversed, restore the prior reader in a new migration and retain this
-- baseline table as the audited cutover snapshot for a later correction.
commit;
