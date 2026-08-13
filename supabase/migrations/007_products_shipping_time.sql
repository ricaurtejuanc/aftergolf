-- Estimated delivery time per product (varies per product, not shop-wide),
-- shown in its detail view and editable by the admin.
-- Run this once in the Supabase SQL Editor if the products table already
-- existed before this migration (schema.sql already has it for fresh setups).

alter table public.products add column if not exists shipping_time text;

update public.products
set shipping_time = 'Entregas en España en 3-5 días laborables.'
where shipping_time is null;
