-- AfterGolf: profiles + round history
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create table if not exists public.rounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_name text not null,
  course_location text not null,
  tee_color text not null,
  tee_gender text not null,
  course_rating numeric not null,
  slope_rating numeric not null,
  par integer not null,
  handicap_index numeric not null,
  course_handicap integer not null,
  gross_score integer not null,
  strokes_received integer not null,
  net_score integer not null,
  stableford_points integer not null,
  differential numeric not null,
  date_played date not null,
  player_label text,
  created_at timestamptz not null default now()
);

alter table public.rounds enable row level security;

create policy "rounds_select_own" on public.rounds
  for select using (auth.uid() = user_id);

create policy "rounds_insert_own" on public.rounds
  for insert with check (auth.uid() = user_id);

create policy "rounds_delete_own" on public.rounds
  for delete using (auth.uid() = user_id);

create index if not exists rounds_user_id_idx on public.rounds (user_id);
