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
