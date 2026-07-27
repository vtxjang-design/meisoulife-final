create table if not exists public.basic_garden_visits (
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  visit_date date not null,
  created_at timestamptz not null default now(),
  primary key (auth_user_id, visit_date)
);

create table if not exists public.basic_garden_gate_completions (
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  gate_key text not null,
  reward_granted boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (auth_user_id, activity_date, gate_key)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'basic_garden_gate_completions_gate_key_check'
      and conrelid = 'public.basic_garden_gate_completions'::regclass
  ) then
    alter table public.basic_garden_gate_completions
      add constraint basic_garden_gate_completions_gate_key_check
      check (
        gate_key in (
          'affirmation',
          'energy',
          'vision',
          'focus',
          'rest',
          'recharge',
          'release',
          'gratitude',
          'sleep'
        )
      );
  end if;
end
$$;

alter table public.basic_garden_visits enable row level security;
alter table public.basic_garden_gate_completions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'basic_garden_visits'
      and policyname = 'Basic garden visits self select'
  ) then
    create policy "Basic garden visits self select"
      on public.basic_garden_visits
      for select
      to authenticated
      using (auth.uid() = auth_user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'basic_garden_gate_completions'
      and policyname = 'Basic garden gate completions self select'
  ) then
    create policy "Basic garden gate completions self select"
      on public.basic_garden_gate_completions
      for select
      to authenticated
      using (auth.uid() = auth_user_id);
  end if;
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
as $$
declare
  v_visit_date date := timezone('Asia/Tokyo', now())::date;
  v_visit_inserted integer := 0;
begin
  insert into public.basic_garden_visits (
    auth_user_id,
    visit_date
  )
  values (
    p_auth_user_id,
    v_visit_date
  )
  on conflict do nothing;

  get diagnostics v_visit_inserted = row_count;

  return query
  with upserted as (
    insert into public.basic_garden_progress as bgp (
      auth_user_id,
      challenge_day,
      check_in_count,
      updated_at
    )
    values (
      p_auth_user_id,
      1,
      0,
      now()
    )
    on conflict on constraint basic_garden_progress_pkey do update
      set challenge_day = case
            when v_visit_inserted > 0 then bgp.challenge_day + 1
            else bgp.challenge_day
          end,
          updated_at = case
            when v_visit_inserted > 0 then now()
            else bgp.updated_at
          end
    returning
      bgp.auth_user_id as row_auth_user_id,
      bgp.challenge_day as row_challenge_day,
      bgp.check_in_count as row_check_in_count
  )
  select
    upserted.row_auth_user_id,
    v_visit_date,
    upserted.row_challenge_day,
    upserted.row_check_in_count,
    v_visit_inserted > 0
  from upserted;
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
as $$
declare
  v_activity_date date := timezone('Asia/Tokyo', now())::date;
  v_completion_inserted integer := 0;
  v_distinct_gate_count integer := 0;
  v_reward_exists boolean := false;
  v_reward_granted boolean := false;
  v_row_auth_user_id uuid := p_auth_user_id;
  v_row_challenge_day integer := 1;
  v_row_check_in_count integer := 0;
begin
  if p_gate_key not in (
    'affirmation',
    'energy',
    'vision',
    'focus',
    'rest',
    'recharge',
    'release',
    'gratitude',
    'sleep'
  ) then
    raise exception 'Invalid basic garden gate key'
      using errcode = '22023';
  end if;

  select
    bgp.auth_user_id,
    bgp.challenge_day,
    bgp.check_in_count
  into
    v_row_auth_user_id,
    v_row_challenge_day,
    v_row_check_in_count
  from public.basic_garden_progress as bgp
  where bgp.auth_user_id = p_auth_user_id;

  if not found then
    v_row_auth_user_id := p_auth_user_id;
    v_row_challenge_day := 1;
    v_row_check_in_count := 0;
  end if;

  insert into public.basic_garden_gate_completions (
    auth_user_id,
    activity_date,
    gate_key
  )
  values (
    p_auth_user_id,
    v_activity_date,
    p_gate_key
  )
  on conflict do nothing;

  get diagnostics v_completion_inserted = row_count;

  select count(*)
  into v_distinct_gate_count
  from public.basic_garden_gate_completions as bgc
  where bgc.auth_user_id = p_auth_user_id
    and bgc.activity_date = v_activity_date;

  select exists(
    select 1
    from public.basic_garden_gate_completions as bgc
    where bgc.auth_user_id = p_auth_user_id
      and bgc.activity_date = v_activity_date
      and bgc.reward_granted = true
  )
  into v_reward_exists;

  v_reward_granted := v_completion_inserted > 0 and v_distinct_gate_count >= 3 and not v_reward_exists;

  if v_reward_granted then
    update public.basic_garden_gate_completions
    set reward_granted = true
    where auth_user_id = p_auth_user_id
      and activity_date = v_activity_date
      and gate_key = p_gate_key;

    insert into public.basic_garden_progress as bgp (
      auth_user_id,
      challenge_day,
      check_in_count,
      updated_at
    )
    values (
      p_auth_user_id,
      greatest(v_row_challenge_day, 1),
      greatest(v_row_check_in_count, 0) + 1,
      now()
    )
    on conflict on constraint basic_garden_progress_pkey do update
      set check_in_count = bgp.check_in_count + 1,
          updated_at = now()
    returning
      bgp.auth_user_id,
      bgp.challenge_day,
      bgp.check_in_count
    into
      v_row_auth_user_id,
      v_row_challenge_day,
      v_row_check_in_count;
  end if;

  return query
  select
    v_row_auth_user_id,
    v_activity_date,
    p_gate_key,
    greatest(v_row_challenge_day, 1),
    greatest(v_row_check_in_count, 0),
    v_completion_inserted > 0,
    v_reward_granted,
    v_distinct_gate_count;
end
$$;
