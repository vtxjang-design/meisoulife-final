create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text unique not null,
  full_name text,
  line_id text,
  stress_level integer default 5,
  role text default 'free',
  current_plan text default 'free',
  challenge_day integer default 1,
  paid_days integer default 0,
  check_in_count integer default 0,
  helpful_comments integer default 0,
  candidate_leader boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan_key text,
  status text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.challenge_progress (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid references public.users(id) on delete set null,
  day_number integer not null,
  title text not null,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique (email, day_number)
);

create table if not exists public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  user_message text not null,
  assistant_message text not null,
  created_at timestamptz default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text,
  starts_at timestamptz,
  community_url text,
  created_at timestamptz default now()
);

create table if not exists public.community_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  channel text not null,
  activity_type text not null,
  helpful boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.leader_candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete cascade,
  qualified_at timestamptz default now(),
  invite_sent boolean default false,
  status text default 'candidate'
);

alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.challenge_progress enable row level security;
alter table public.coach_messages enable row level security;
alter table public.events enable row level security;
alter table public.community_activity enable row level security;
alter table public.leader_candidates enable row level security;

create policy if not exists "Public challenge signup"
on public.users for insert
to anon
with check (true);

create policy if not exists "Public challenge progress insert"
on public.challenge_progress for insert
to anon
with check (true);

create policy if not exists "Users can read own profile"
on public.users for select
to authenticated
using (auth.uid() = auth_user_id);

create policy if not exists "Users can read own challenge progress"
on public.challenge_progress for select
to authenticated
using (auth.uid() = user_id);

create policy if not exists "Users can read own coach messages"
on public.coach_messages for select
to authenticated
using (auth.uid() = user_id);
