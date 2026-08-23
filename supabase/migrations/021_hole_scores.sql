-- Hole-by-hole scorecard (distance/par/stroke-index) per tee, for the
-- "Ver tarjeta" button in CourseTeeSelect.tsx. One level below tees, same
-- select-all / write-admin RLS pattern as the rest of the course tables.
create table if not exists public.hole_scores (
  id uuid primary key default gen_random_uuid(),
  tee_id uuid not null references public.tees (id) on delete cascade,
  hole_number integer not null,
  meters integer not null,
  par integer not null,
  hcp integer not null,
  unique (tee_id, hole_number)
);

alter table public.hole_scores enable row level security;

create policy "hole_scores_select_all" on public.hole_scores for select using (true);

create policy "hole_scores_write_admin" on public.hole_scores for all
  using (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');

create index if not exists hole_scores_tee_id_idx on public.hole_scores (tee_id);
