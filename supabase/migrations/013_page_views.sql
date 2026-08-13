-- Lightweight page-view log for the admin "Resumen" tab. Anyone (including
-- anonymous visitors) can insert a row for a page they load; only the admin
-- can read them back. No user_id / IP is stored — just path + timestamp.
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  created_at timestamptz not null default now()
);

alter table public.page_views enable row level security;

create policy "page_views_insert_anyone" on public.page_views
  for insert with check (true);

create policy "page_views_select_admin" on public.page_views
  for select using (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');
