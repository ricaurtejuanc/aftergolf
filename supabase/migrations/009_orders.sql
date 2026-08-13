-- Orders paid through Stripe Checkout. Rows are written only by the
-- stripe-webhook edge function using the service-role key (bypasses RLS) —
-- there is no insert/update policy for regular clients by design.
-- Run this once in the Supabase SQL Editor if the project already existed
-- before this migration (schema.sql already has it for fresh setups).

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  stripe_session_id text not null unique,
  customer_email text not null,
  shipping_address jsonb,
  items jsonb not null,
  amount_total numeric not null,
  currency text not null default 'eur',
  status text not null default 'paid',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

create policy "orders_select_admin" on public.orders
  for select using (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');
