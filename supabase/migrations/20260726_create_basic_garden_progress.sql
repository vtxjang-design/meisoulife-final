create table if not exists public.basic_garden_progress (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  challenge_day integer not null default 1,
  check_in_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'basic_garden_progress_challenge_day_check'
      and conrelid = 'public.basic_garden_progress'::regclass
  ) then
    alter table public.basic_garden_progress
      add constraint basic_garden_progress_challenge_day_check
      check (challenge_day >= 1);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'basic_garden_progress_check_in_count_check'
      and conrelid = 'public.basic_garden_progress'::regclass
  ) then
    alter table public.basic_garden_progress
      add constraint basic_garden_progress_check_in_count_check
      check (check_in_count >= 0);
  end if;
end
$$;

alter table public.basic_garden_progress enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'basic_garden_progress'
      and policyname = 'Basic garden progress self select'
  ) then
    create policy "Basic garden progress self select"
      on public.basic_garden_progress
      for select
      to authenticated
      using (auth.uid() = auth_user_id);
  end if;
end
$$;

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
as $$
begin
  return query
  with existing as (
    select 1
    from public.basic_garden_progress
    where basic_garden_progress.auth_user_id = p_auth_user_id
  ),
  upserted as (
    insert into public.basic_garden_progress (
      auth_user_id,
      challenge_day,
      check_in_count,
      updated_at
    )
    values (
      p_auth_user_id,
      greatest(coalesce(p_challenge_day, 1), 1),
      1,
      now()
    )
    on conflict (auth_user_id) do update
      set challenge_day = greatest(
            public.basic_garden_progress.challenge_day,
            greatest(coalesce(excluded.challenge_day, 1), 1)
          ),
          check_in_count = public.basic_garden_progress.check_in_count + 1,
          updated_at = now()
    returning
      public.basic_garden_progress.auth_user_id,
      public.basic_garden_progress.challenge_day,
      public.basic_garden_progress.check_in_count,
      public.basic_garden_progress.created_at,
      public.basic_garden_progress.updated_at
  )
  select
    upserted.auth_user_id,
    upserted.challenge_day,
    upserted.check_in_count,
    upserted.created_at,
    upserted.updated_at,
    not exists (select 1 from existing)
  from upserted;
end
$$;
