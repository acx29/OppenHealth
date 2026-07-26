-- Run in Supabase: SQL Editor → New query → paste → Run
--
-- public.user_profiles stores app fields keyed by auth.users.id.
-- ON DELETE CASCADE removes the profile row when the auth user is deleted
-- (Authentication → Users), so you don't orphan profiles or leave ghost logins.

-- New projects: create table with cascade FK
create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  username text,
  setup_complete boolean not null default false,
  created_at timestamptz not null default now()
);

-- Existing projects: replace the FK so deletes in auth.users cascade here.
-- If this fails with "constraint ... already exists", your FK already cascades.
-- If drop does nothing, check the actual FK name on user_profiles and edit below.

alter table public.user_profiles
  drop constraint if exists user_profiles_id_fkey;

alter table public.user_profiles
  add constraint user_profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

-- v2 onboarding (run 2026-07): coach onboarding fields + onboarding timestamp.
-- Stable, query-worthy facts are real columns; fluid onboarding answers (activity level,
-- sports, goals, future questions) live in the onboarding jsonb and get promoted to
-- columns if/when they stabilize. onboarded_at replaces setup_complete (kept while
-- v1 is still live on main; drop it when v1 retires): null = onboarding not done,
-- a timestamp = done + when (lets us re-prompt old onboardings after future form changes).
alter table public.user_profiles
  add column if not exists dob date,
  add column if not exists height_cm numeric,
  add column if not exists weight_kg numeric,
  add column if not exists onboarding jsonb not null default '{}',
  add column if not exists onboarded_at timestamptz;
