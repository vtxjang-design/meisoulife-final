-- Each distinct daily Gate is a completed practice record. Keep the existing
-- third-Gate celebration marker, while counting every newly inserted Gate once.
-- The completion ledger primary key remains the idempotency boundary.
with uncounted_ledger_completions as (
  select
    bgc.auth_user_id,
    count(*)::integer as missing_check_in_count
  from public.basic_garden_gate_completions as bgc
  where not bgc.reward_granted
  group by bgc.auth_user_id
)
insert into public.basic_garden_progress as bgp (
  auth_user_id,
  challenge_day,
  check_in_count,
  updated_at
)
select
  ulc.auth_user_id,
  1,
  ulc.missing_check_in_count,
  now()
from uncounted_ledger_completions as ulc
on conflict on constraint basic_garden_progress_pkey do update
  set check_in_count = bgp.check_in_count + excluded.check_in_count,
      updated_at = now();

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
    'affirmation', 'energy', 'vision', 'focus', 'rest', 'recharge', 'release', 'gratitude', 'sleep'
  ) then
    raise exception 'Invalid basic garden gate key' using errcode = '22023';
  end if;

  insert into public.basic_garden_gate_completions (auth_user_id, activity_date, gate_key)
  values (p_auth_user_id, v_activity_date, p_gate_key)
  on conflict do nothing;

  get diagnostics v_completion_inserted = row_count;

  if v_completion_inserted > 0 then
    insert into public.basic_garden_progress as bgp (auth_user_id, challenge_day, check_in_count, updated_at)
    values (p_auth_user_id, 1, 1, now())
    on conflict on constraint basic_garden_progress_pkey do update
      set check_in_count = bgp.check_in_count + 1,
          updated_at = now()
    returning bgp.auth_user_id, bgp.challenge_day, bgp.check_in_count
    into v_row_auth_user_id, v_row_challenge_day, v_row_check_in_count;
  else
    select bgp.auth_user_id, bgp.challenge_day, bgp.check_in_count
    into v_row_auth_user_id, v_row_challenge_day, v_row_check_in_count
    from public.basic_garden_progress as bgp
    where bgp.auth_user_id = p_auth_user_id;
  end if;

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
  ) into v_reward_exists;

  v_reward_granted := v_completion_inserted > 0 and v_distinct_gate_count >= 3 and not v_reward_exists;

  if v_reward_granted then
    update public.basic_garden_gate_completions as bgc
    set reward_granted = true
    where bgc.auth_user_id = p_auth_user_id
      and bgc.activity_date = v_activity_date
      and bgc.gate_key = p_gate_key;
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
