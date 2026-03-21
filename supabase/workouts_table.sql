-- Run this in Supabase: SQL Editor → New query → paste → Run
-- Stores logged workouts per user (matches auth.users.id)

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sport text not null check (sport in ('running', 'soccer', 'cycling')),
  distance_miles numeric,
  duration_minutes integer not null,
  avg_hr integer,
  created_at timestamptz not null default now()
);

create index if not exists workouts_user_id_created_at_idx
  on public.workouts (user_id, created_at desc);

-- Optional: Row Level Security (your server uses the service role key, which bypasses RLS,
-- but RLS protects direct client access if you ever query from the browser)
alter table public.workouts enable row level security;
