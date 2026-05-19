# PROJECT BRIEF

## Product

`瞑想life` is a meditation membership platform built for a calm, daily rhythm.

It is not just a content site. It is a place for:

- 함께 깨어있는 장
- 공생 생활 문화
- AI 시대 정신문명

The platform is meant to help people return to themselves through small, repeatable practice, while making paid membership, access, and support feel stable and trustworthy.

## Technical Stack

- Next.js App Router
- Vercel
- Supabase Auth
- Supabase `memberships` table
- Stripe subscriptions

## Core Product Priorities

1. Stable login and logout
2. Reliable paid membership recognition
3. Clean multilingual UX across Japanese, Korean, and English
4. Backward-compatible production changes only

## Production Rules

- This is a live paid platform.
- Avoid risky refactors in payment, auth, and membership code paths.
- Reuse the current auth and membership system instead of adding parallel logic.
- Keep Stripe checkout, Stripe webhook, and Supabase membership sync stable.
- Treat `auth.users.id` and `memberships.user_id` alignment as critical infrastructure.

## Current Architectural Focus

- Supabase Auth is the login source of truth
- Stripe subscription state must land in Supabase memberships
- UI should reflect:
  - guest state
  - logged-in free state
  - logged-in paid state
- Language switching must remain consistent in JP / KR / EN without breaking auth state
