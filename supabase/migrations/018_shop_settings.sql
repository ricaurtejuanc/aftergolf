-- Shop-wide settings (shipping cost and free-shipping threshold). Single
-- row, id fixed at 1. Not to be confused with the old shop_settings table
-- (dropped in 008) which held a single shipping *time* string — that's now
-- per-product (see products.shipping_time) instead.
create table if not exists public.shop_settings (
  id smallint primary key default 1,
  shipping_cost numeric not null default 4.99,
  free_shipping_threshold numeric not null default 100,
  constraint shop_settings_single_row check (id = 1)
);

insert into public.shop_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.shop_settings enable row level security;

create policy "shop_settings_select_all" on public.shop_settings
  for select using (true);

create policy "shop_settings_write_admin" on public.shop_settings
  for all using (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');
