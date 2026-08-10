/* READ-ONLY post-deployment BASIC Garden invariant verification.
   Aggregate output only; no auth_user_id or individual application rows. */
WITH completion_totals AS (
  SELECT auth_user_id, count(*)::bigint AS ledger_count
  FROM public.basic_garden_gate_completions
  GROUP BY auth_user_id
), visit_totals AS (
  SELECT auth_user_id, count(*)::bigint AS ledger_count
  FROM public.basic_garden_visits
  GROUP BY auth_user_id
), completion_days AS (
  SELECT
    auth_user_id,
    activity_date,
    count(DISTINCT gate_key)::bigint AS distinct_gate_count,
    count(*) FILTER (WHERE reward_granted)::bigint AS reward_marker_count
  FROM public.basic_garden_gate_completions
  GROUP BY auth_user_id, activity_date
), recovery_candidates AS (
  SELECT auth_user_id FROM public.basic_garden_progress_baselines
  UNION
  SELECT auth_user_id FROM completion_totals
), visit_candidates AS (
  SELECT auth_user_id FROM public.basic_garden_visit_baselines
  UNION
  SELECT auth_user_id FROM visit_totals
), recovery_metrics AS (
  SELECT
    c.auth_user_id,
    coalesce(b.preserved_check_in_count, 0)::bigint
      + greatest(coalesce(l.ledger_count, 0)::bigint - coalesce(b.ledger_count_at_baseline, 0)::bigint, 0)
      AS cumulative_recovery_records
  FROM recovery_candidates c
  LEFT JOIN public.basic_garden_progress_baselines b ON b.auth_user_id = c.auth_user_id
  LEFT JOIN completion_totals l ON l.auth_user_id = c.auth_user_id
), visit_metrics AS (
  SELECT
    c.auth_user_id,
    coalesce(b.preserved_visit_day_count, 0)::bigint
      + greatest(coalesce(l.ledger_count, 0)::bigint - coalesce(b.ledger_count_at_baseline, 0)::bigint, 0)
      AS cumulative_visit_days
  FROM visit_candidates c
  LEFT JOIN public.basic_garden_visit_baselines b ON b.auth_user_id = c.auth_user_id
  LEFT JOIN visit_totals l ON l.auth_user_id = c.auth_user_id
)
SELECT jsonb_pretty(
  jsonb_build_object(
    'aggregate_cumulative_recovery_records', (SELECT coalesce(sum(cumulative_recovery_records), 0)::bigint FROM recovery_metrics),
    'aggregate_cumulative_visit_days', (SELECT coalesce(sum(cumulative_visit_days), 0)::bigint FROM visit_metrics),
    'progress_baseline_rows', (SELECT count(*)::bigint FROM public.basic_garden_progress_baselines),
    'visit_baseline_rows', (SELECT count(*)::bigint FROM public.basic_garden_visit_baselines),
    'daily_reward_rows', (SELECT count(*)::bigint FROM public.basic_garden_daily_rewards),
    'eligible_jst_user_days_without_daily_reward', (
      SELECT count(*)::bigint
      FROM completion_days d
      LEFT JOIN public.basic_garden_daily_rewards r ON r.auth_user_id = d.auth_user_id AND r.activity_date = d.activity_date
      WHERE d.distinct_gate_count >= 3 AND r.auth_user_id IS NULL
    ),
    'ineligible_jst_user_days_with_daily_reward', (
      SELECT count(*)::bigint
      FROM completion_days d
      JOIN public.basic_garden_daily_rewards r ON r.auth_user_id = d.auth_user_id AND r.activity_date = d.activity_date
      WHERE d.distinct_gate_count < 3
    ),
    'jst_user_days_with_multiple_legacy_reward_markers', (
      SELECT count(*)::bigint FROM completion_days WHERE reward_marker_count > 1
    )
  )
) AS basic_garden_post_deploy_verification;
