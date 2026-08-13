-- Switches order payment from Stripe to Bizum: stripe_session_id is no
-- longer required (Bizum orders don't have one), and payment_method
-- distinguishes the two paths. Run this once in the Supabase SQL Editor if
-- the orders table already existed before this migration (schema.sql
-- already has it for fresh setups).

alter table public.orders alter column stripe_session_id drop not null;
alter table public.orders add column if not exists payment_method text not null default 'stripe';
