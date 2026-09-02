/* Read-only post-deploy verification. Returns schema metadata, never event rows. */

select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'stripe_webhook_events'
order by ordinal_position;

select
  routine_name,
  security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'claim_stripe_webhook_event',
    'complete_stripe_webhook_event',
    'fail_stripe_webhook_event'
  )
order by routine_name;

select
  grantee,
  routine_name,
  privilege_type
from information_schema.routine_privileges
where specific_schema = 'public'
  and routine_name in (
    'claim_stripe_webhook_event',
    'complete_stripe_webhook_event',
    'fail_stripe_webhook_event'
  )
order by routine_name, grantee;
