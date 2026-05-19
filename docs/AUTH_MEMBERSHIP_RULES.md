# AUTH MEMBERSHIP RULES

## Source of Truth

1. `auth.users.id` is the identity source of truth.
2. `memberships.user_id` must match `auth.users.id`.
3. Never use email as the main membership key.

## Membership Lookup Rules

1. Fetch membership by `user_id` only.
2. If duplicate membership rows exist, always use the latest row:
   - order by `created_at` descending
   - choose the newest valid row
3. Prefer active or trialing membership rows when available.
4. Normalize plans consistently:
   - `basic` -> `Basic`
   - `growth` -> `Growth`
   - `inner_circle` -> `Inner Circle`
5. Fallback to `Free` only when no valid membership exists.

## Header State Rules

### Guest

Show:

- Login
- Free Join

### Logged In

Show:

- My Page / Member Center
- Logout
- Membership badge

Do not show guest buttons once a valid Supabase session exists.

## Logout Rules

1. Logout must call `supabase.auth.signOut()`.
2. Logout must clear local UI auth state immediately.
3. Logout must return the user to home.
4. Header must update back to guest state without needing a hard refresh.

## Paid Content Rules

1. Paid content access must check membership plan, not email.
2. If not logged in:
   - redirect to login
3. If logged in but free:
   - redirect to pricing or show an upgrade path
4. If paid:
   - allow access

## Safety Rules

- Keep auth state centralized.
- Do not add separate cached membership truth sources unless absolutely necessary.
- Do not hardcode paid state in localStorage.
- Do not create a second membership model outside Supabase.
