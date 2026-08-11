-- Disposable-database BASIC Garden reconciliation contract test.
-- Run only against a fresh local PostgreSQL/Supabase database, for example:
--   psql "$LOCAL_TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/basic_garden_reconciliation_contract.sql
-- This file never links to or references a hosted project. It loads the reviewed
-- migration through psql's local-file include, then rolls back RPC-call fixtures.
\set ON_ERROR_STOP on

create schema if not exists auth;
create table if not exists auth.users (id uuid primary key);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create or replace function auth.role() returns text language sql stable as $$
  select nullif(current_setting('request.jwt.claim.role', true), '')
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role; end if;
end
$$;

drop table if exists public.basic_garden_daily_rewards cascade;
drop table if exists public.basic_garden_visit_baselines cascade;
drop table if exists public.basic_garden_progress_baselines cascade;
drop table if exists public.basic_garden_gate_completions cascade;
drop table if exists public.basic_garden_visits cascade;
drop table if exists public.basic_garden_progress cascade;

create table public.basic_garden_progress (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  challenge_day integer not null default 1 check (challenge_day >= 1),
  check_in_count integer not null default 0 check (check_in_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.basic_garden_visits (
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  visit_date date not null,
  created_at timestamptz not null default now(),
  primary key (auth_user_id, visit_date)
);
create table public.basic_garden_gate_completions (
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  gate_key text not null check (gate_key in ('affirmation', 'energy', 'vision', 'focus', 'rest', 'recharge', 'release', 'gratitude', 'sleep')),
  reward_granted boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (auth_user_id, activity_date, gate_key)
);
grant all on public.basic_garden_progress, public.basic_garden_visits, public.basic_garden_gate_completions to service_role;

insert into auth.users (id) values
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0000-000000000006'),
  ('00000000-0000-0000-0000-000000000007');

-- Production-shaped pre-reconciliation fixture:
-- 001: progress only; 002: ledger below legacy; 003: equal; 004: ledger above;
-- 005: visit baseline offset; 006: RPC completion; 007: authorization check.
insert into public.basic_garden_progress (auth_user_id, challenge_day, check_in_count) values
  ('00000000-0000-0000-0000-000000000001', 7, 5),
  ('00000000-0000-0000-0000-000000000002', 2, 5),
  ('00000000-0000-0000-0000-000000000003', 2, 2),
  ('00000000-0000-0000-0000-000000000004', 1, 1),
  ('00000000-0000-0000-0000-000000000005', 3, 0);
insert into public.basic_garden_visits (auth_user_id, visit_date) values
  ('00000000-0000-0000-0000-000000000002', date '2026-08-01'),
  ('00000000-0000-0000-0000-000000000002', date '2026-08-02'),
  ('00000000-0000-0000-0000-000000000003', date '2026-08-01'),
  ('00000000-0000-0000-0000-000000000003', date '2026-08-02'),
  ('00000000-0000-0000-0000-000000000005', date '2026-08-01'),
  ('00000000-0000-0000-0000-000000000005', date '2026-08-02');
insert into public.basic_garden_gate_completions (auth_user_id, activity_date, gate_key) values
  ('00000000-0000-0000-0000-000000000002', date '2026-08-01', 'affirmation'),
  ('00000000-0000-0000-0000-000000000002', date '2026-08-01', 'energy'),
  ('00000000-0000-0000-0000-000000000003', date '2026-08-02', 'affirmation'),
  ('00000000-0000-0000-0000-000000000003', date '2026-08-02', 'energy'),
  ('00000000-0000-0000-0000-000000000004', date '2026-08-01', 'affirmation'),
  ('00000000-0000-0000-0000-000000000004', date '2026-08-02', 'energy'),
  ('00000000-0000-0000-0000-000000000004', date '2026-08-03', 'vision');
create temporary table pre_reconciliation_counts as
select
  (select count(*) from public.basic_garden_progress) as progress_rows,
  (select count(*) from public.basic_garden_visits) as visit_rows,
  (select count(*) from public.basic_garden_gate_completions) as completion_rows;

\ir ../migrations/20260810093000_reconcile_basic_garden_production_drift.sql

begin;
create or replace function public._basic_garden_assert(p_condition boolean, p_message text)
returns void language plpgsql as $$
begin
  if not coalesce(p_condition, false) then raise exception 'BASIC Garden contract assertion failed: %', p_message; end if;
end
$$;

-- A. Baselines seed once, preserve historical rows, and do not double-count ledgers.
do $$
declare v_count_before integer; v_count_after integer;
begin
  perform public._basic_garden_assert(
    (select progress_rows = 5 and visit_rows = 6 and completion_rows = 7 from pre_reconciliation_counts),
    'pre-reconciliation fixture shape'
  );
  perform public._basic_garden_assert((select count(*) = 5 from public.basic_garden_progress), 'historical progress rows preserved');
  perform public._basic_garden_assert((select count(*) = 6 from public.basic_garden_visits), 'historical visit rows preserved');
  perform public._basic_garden_assert((select count(*) = 7 from public.basic_garden_gate_completions), 'historical completion rows preserved');
  perform public._basic_garden_assert(
    (select preserved_check_in_count = 5 and ledger_count_at_baseline = 0 from public.basic_garden_progress_baselines where auth_user_id = '00000000-0000-0000-0000-000000000001'),
    'progress without ledger baseline'
  );
  perform public._basic_garden_assert(
    (select preserved_check_in_count = 5 and ledger_count_at_baseline = 2 from public.basic_garden_progress_baselines where auth_user_id = '00000000-0000-0000-0000-000000000002'),
    'legacy counter above ledger baseline'
  );
  perform public._basic_garden_assert(
    (select preserved_check_in_count = 2 and ledger_count_at_baseline = 2 from public.basic_garden_progress_baselines where auth_user_id = '00000000-0000-0000-0000-000000000003'),
    'equal counter and ledger baseline'
  );
  perform public._basic_garden_assert(
    (select preserved_check_in_count = 3 and ledger_count_at_baseline = 3 from public.basic_garden_progress_baselines where auth_user_id = '00000000-0000-0000-0000-000000000004'),
    'ledger above legacy counter baseline'
  );
  perform public._basic_garden_assert(
    (select preserved_visit_day_count = 3 and ledger_count_at_baseline = 2 from public.basic_garden_visit_baselines where auth_user_id = '00000000-0000-0000-0000-000000000005'),
    'visit baseline offset'
  );
  select count(*) into v_count_before from public.basic_garden_progress_baselines;
  perform public.initialize_basic_garden_progress_baseline('00000000-0000-0000-0000-000000000002');
  perform public.initialize_basic_garden_progress_baseline('00000000-0000-0000-0000-000000000002');
  select count(*) into v_count_after from public.basic_garden_progress_baselines;
  perform public._basic_garden_assert(v_count_before = v_count_after, 'repeated progress initializer is idempotent');
  perform public.initialize_basic_garden_visit_baseline('00000000-0000-0000-0000-000000000005');
  perform public.initialize_basic_garden_visit_baseline('00000000-0000-0000-0000-000000000005');
  perform public._basic_garden_assert(
    (select preserved_visit_day_count = 3 and ledger_count_at_baseline = 2 from public.basic_garden_visit_baselines where auth_user_id = '00000000-0000-0000-0000-000000000005'),
    'repeated visit initializer is idempotent'
  );
end
$$;

-- B. Exact returned columns, order, and types are checked from actual function calls.
select set_config('request.jwt.claim.role', 'service_role', true);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
create temporary table get_contract as select * from public.get_basic_garden_progress('00000000-0000-0000-0000-000000000002') limit 0;
create temporary table visit_contract as select * from public.record_basic_garden_visit('00000000-0000-0000-0000-000000000002') limit 0;
create temporary table completion_contract as select * from public.record_basic_garden_completion('00000000-0000-0000-0000-000000000002', 'focus') limit 0;
do $$
declare v_get text; v_visit text; v_completion text;
begin
  select string_agg(attname || ':' || format_type(atttypid, atttypmod), ',' order by attnum) into v_get
  from pg_attribute where attrelid = 'get_contract'::regclass and attnum > 0 and not attisdropped;
  select string_agg(attname || ':' || format_type(atttypid, atttypmod), ',' order by attnum) into v_visit
  from pg_attribute where attrelid = 'visit_contract'::regclass and attnum > 0 and not attisdropped;
  select string_agg(attname || ':' || format_type(atttypid, atttypmod), ',' order by attnum) into v_completion
  from pg_attribute where attrelid = 'completion_contract'::regclass and attnum > 0 and not attisdropped;
  perform public._basic_garden_assert(v_get = 'auth_user_id:uuid,challenge_day:integer,check_in_count:integer,today_distinct_gate_count:integer,completed_day_count:integer,preserved_check_in_count:integer,ledger_count_at_baseline:integer,cumulative_visit_days:integer,cumulative_recovery_records:integer,preserved_visit_day_count:integer,visit_ledger_count_at_baseline:integer', '11-field get-progress contract');
  perform public._basic_garden_assert(v_visit = 'auth_user_id:uuid,visit_date:date,challenge_day:integer,check_in_count:integer,visit_recorded:boolean,cumulative_visit_days:integer,cumulative_recovery_records:integer', '7-field visit contract');
  perform public._basic_garden_assert(v_completion = 'auth_user_id:uuid,activity_date:date,gate_key:text,challenge_day:integer,check_in_count:integer,completion_recorded:boolean,reward_granted:boolean,distinct_gate_count:integer,cumulative_visit_days:integer,cumulative_recovery_records:integer', '10-field completion contract');
end
$$;

-- C/D. Calls exercise first, second, third, retry, reward, visit, and canonical totals.
do $$
declare v_first record; v_second record; v_third record; v_retry record; v_visit_first record; v_visit_retry record;
begin
  select * into v_first from public.record_basic_garden_completion('00000000-0000-0000-0000-000000000006', 'affirmation');
  select * into v_second from public.record_basic_garden_completion('00000000-0000-0000-0000-000000000006', 'energy');
  select * into v_third from public.record_basic_garden_completion('00000000-0000-0000-0000-000000000006', 'vision');
  perform public._basic_garden_assert(v_first.completion_recorded and v_first.cumulative_recovery_records = 1 and not v_first.reward_granted, 'first gate persists and counts');
  perform public._basic_garden_assert(v_second.completion_recorded and v_second.cumulative_recovery_records = 2 and not v_second.reward_granted, 'second gate persists and counts');
  perform public._basic_garden_assert(v_third.completion_recorded and v_third.cumulative_recovery_records = 3 and v_third.reward_granted and v_third.distinct_gate_count = 3, 'third gate persists, counts, and rewards');
  perform public._basic_garden_assert((select count(*) = 3 from public.basic_garden_gate_completions where auth_user_id = '00000000-0000-0000-0000-000000000006'), 'three unique completion rows');
  perform public._basic_garden_assert((select count(*) = 1 from public.basic_garden_daily_rewards where auth_user_id = '00000000-0000-0000-0000-000000000006'), 'one daily reward row');
  select * into v_retry from public.record_basic_garden_completion('00000000-0000-0000-0000-000000000006', 'vision');
  perform public._basic_garden_assert(not v_retry.completion_recorded and not v_retry.reward_granted and v_retry.cumulative_recovery_records = 3, 'completion retry is idempotent');
  perform public._basic_garden_assert((select count(*) = 3 from public.basic_garden_gate_completions where auth_user_id = '00000000-0000-0000-0000-000000000006'), 'completion retry creates no duplicate ledger row');
  select * into v_visit_first from public.record_basic_garden_visit('00000000-0000-0000-0000-000000000001');
  select * into v_visit_retry from public.record_basic_garden_visit('00000000-0000-0000-0000-000000000001');
  perform public._basic_garden_assert(v_visit_first.visit_recorded and v_visit_first.cumulative_visit_days = 8, 'first visit adds one day after preserved offset');
  perform public._basic_garden_assert(not v_visit_retry.visit_recorded and v_visit_retry.cumulative_visit_days = 8, 'same JST visit retry is idempotent');
  begin
    insert into public.basic_garden_gate_completions (auth_user_id, activity_date, gate_key)
    values ('00000000-0000-0000-0000-000000000006', v_third.activity_date, 'vision');
    raise exception 'completion unique constraint did not reject duplicate';
  exception when unique_violation then null;
  end;
  begin
    insert into public.basic_garden_daily_rewards (auth_user_id, activity_date, rewarded_gate_key)
    values ('00000000-0000-0000-0000-000000000006', v_third.activity_date, 'vision');
    raise exception 'daily reward unique constraint did not reject duplicate';
  exception when unique_violation then null;
  end;
  insert into public.basic_garden_daily_rewards (auth_user_id, activity_date, rewarded_gate_key)
  values ('00000000-0000-0000-0000-000000000006', v_third.activity_date + 1, 'affirmation');
  perform public._basic_garden_assert((select count(*) = 2 from public.basic_garden_daily_rewards where auth_user_id = '00000000-0000-0000-0000-000000000006'), 'a distinct JST day can retain its own reward');
end
$$;

-- E. Executable UTC-to-JST boundary assertions; RPC definitions are inspected separately.
do $$
begin
  perform public._basic_garden_assert(timezone('Asia/Tokyo', timestamptz '2026-08-10 14:59:59+00')::date = date '2026-08-10', 'one second before JST midnight');
  perform public._basic_garden_assert(timezone('Asia/Tokyo', timestamptz '2026-08-10 15:00:00+00')::date = date '2026-08-11', 'JST midnight boundary');
  perform public._basic_garden_assert(pg_get_functiondef('public.record_basic_garden_visit(uuid)'::regprocedure) like '%timezone(''Asia/Tokyo'', now())::date%', 'visit RPC JST definition');
  perform public._basic_garden_assert(pg_get_functiondef('public.record_basic_garden_completion(uuid, text)'::regprocedure) like '%timezone(''Asia/Tokyo'', now())::date%', 'completion RPC JST definition');
  perform public._basic_garden_assert(pg_get_functiondef('public.get_basic_garden_progress(uuid)'::regprocedure) like '%timezone(''Asia/Tokyo'', now())::date%', 'progress RPC JST definition');
end
$$;

-- F. Final privileges and internal authorization checks.
do $$
begin
  perform public._basic_garden_assert(not has_function_privilege('anon', 'public.record_basic_garden_visit(uuid)', 'EXECUTE'), 'anon has no visit execute');
  perform public._basic_garden_assert(not has_function_privilege('anon', 'public.record_basic_garden_completion(uuid, text)', 'EXECUTE'), 'anon has no completion execute');
  perform public._basic_garden_assert(not has_function_privilege('anon', 'public.upsert_basic_garden_progress(uuid, integer)', 'EXECUTE'), 'anon has no upsert execute');
  perform public._basic_garden_assert(not has_function_privilege('anon', 'public.get_basic_garden_progress(uuid)', 'EXECUTE'), 'anon has no get execute');
  perform public._basic_garden_assert(has_function_privilege('service_role', 'public.record_basic_garden_visit(uuid)', 'EXECUTE'), 'service role visit execute');
  perform public._basic_garden_assert(has_function_privilege('service_role', 'public.record_basic_garden_completion(uuid, text)', 'EXECUTE'), 'service role completion execute');
  perform public._basic_garden_assert(has_function_privilege('service_role', 'public.upsert_basic_garden_progress(uuid, integer)', 'EXECUTE'), 'service role upsert execute');
  perform public._basic_garden_assert(has_function_privilege('service_role', 'public.get_basic_garden_progress(uuid)', 'EXECUTE'), 'service role get execute');
  perform public._basic_garden_assert(not has_function_privilege('authenticated', 'public.record_basic_garden_visit(uuid)', 'EXECUTE'), 'authenticated has no visit execute');
  perform public._basic_garden_assert(not has_function_privilege('authenticated', 'public.record_basic_garden_completion(uuid, text)', 'EXECUTE'), 'authenticated has no completion execute');
  perform public._basic_garden_assert(not has_function_privilege('authenticated', 'public.upsert_basic_garden_progress(uuid, integer)', 'EXECUTE'), 'authenticated has no upsert execute');
  perform public._basic_garden_assert(has_function_privilege('authenticated', 'public.get_basic_garden_progress(uuid)', 'EXECUTE'), 'authenticated get execute');
end
$$;
grant execute on function public.record_basic_garden_completion(uuid, text) to authenticated;
set role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000007', true);
do $$
begin
  begin
    perform public.record_basic_garden_completion('00000000-0000-0000-0000-000000000006', 'sleep');
    raise exception 'authorization guard did not reject a different authenticated user';
  exception when insufficient_privilege then null;
  end;
end
$$;
reset role;
revoke execute on function public.record_basic_garden_completion(uuid, text) from authenticated;

-- G. The committed aggregate-only verification query executes against the reconciled fixture.
\ir ../verification/basic_garden_reconciliation_post_deploy.sql

rollback;
