-- Singleton row of shop-wide settings editable from the admin panel (e.g.
-- the shipping-time estimate shown to shoppers).
-- Run this once in the Supabase SQL Editor if the project already existed
-- before this migration (schema.sql already has it for fresh setups).

create table if not exists public.shop_settings (
  id boolean primary key default true,
  shipping_time text not null default 'Entregas en España en 3-5 días laborables.',
  constraint shop_settings_singleton check (id)
);

insert into public.shop_settings (id) values (true) on conflict do nothing;

alter table public.shop_settings enable row level security;

create policy "shop_settings_select_all" on public.shop_settings
  for select using (true);

create policy "shop_settings_write_admin" on public.shop_settings
  for update using (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');
