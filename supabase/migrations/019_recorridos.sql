-- A club can have several distinct 18-hole layouts (e.g. "Abajo",
-- "Buenavista", "Arriba"), each with its own set of tees — recorridos sit
-- between courses and tees for that reason. Run against an empty
-- courses/tees table (this migration is paired with a full wipe + CSV
-- reimport of course data, done separately, not as part of this file).

create table if not exists public.recorridos (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses (id) on delete cascade,
  name text not null,
  position integer not null default 0
);

alter table public.recorridos enable row level security;

create policy "recorridos_select_all" on public.recorridos
  for select using (true);

create policy "recorridos_write_admin" on public.recorridos
  for all using (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');

create index if not exists recorridos_course_id_idx on public.recorridos (course_id);

alter table public.tees drop constraint if exists tees_course_id_fkey;
drop index if exists tees_course_id_idx;
alter table public.tees drop column if exists course_id;
alter table public.tees add column if not exists recorrido_id uuid references public.recorridos (id) on delete cascade;
alter table public.tees alter column recorrido_id set not null;
create index if not exists tees_recorrido_id_idx on public.tees (recorrido_id);
