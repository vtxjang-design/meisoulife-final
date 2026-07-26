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
    select 1 as found
    from public.basic_garden_progress as bgp_existing
    where bgp_existing.auth_user_id = p_auth_user_id
  ),
  upserted as (
    insert into public.basic_garden_progress as bgp (
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
    on conflict on constraint basic_garden_progress_pkey do update
      set challenge_day = greatest(
            bgp.challenge_day,
            greatest(coalesce(excluded.challenge_day, 1), 1)
          ),
          check_in_count = bgp.check_in_count + 1,
          updated_at = now()
    returning
      bgp.auth_user_id as row_auth_user_id,
      bgp.challenge_day as row_challenge_day,
      bgp.check_in_count as row_check_in_count,
      bgp.created_at as row_created_at,
      bgp.updated_at as row_updated_at
  )
  select
    upserted.row_auth_user_id,
    upserted.row_challenge_day,
    upserted.row_check_in_count,
    upserted.row_created_at,
    upserted.row_updated_at,
    not exists (select 1 from existing)
  from upserted;
end
$$;
