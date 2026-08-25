/*
 * Authenticated members may read only membership history linked to their
 * Supabase Auth identity. Billing synchronization continues through trusted
 * server-side paths; this policy grants no write access.
 */
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'memberships'
      and policyname = 'memberships_select_own'
  ) then
    execute $policy$
      create policy "memberships_select_own"
      on public.memberships
      for select
      to authenticated
      using (auth.uid() = user_id)
    $policy$;
  end if;
end
$$;
