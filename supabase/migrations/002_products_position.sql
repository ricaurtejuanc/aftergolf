-- Adds manual ordering to products (admin panel drag-free up/down reorder).
-- Run this once in the Supabase SQL Editor if the products table already
-- existed before this migration (schema.sql already has it for fresh setups).

alter table public.products add column if not exists position integer not null default 0;

with ordered as (
  select id, row_number() over (order by created_at) - 1 as rn
  from public.products
)
update public.products p
set position = ordered.rn
from ordered
where p.id = ordered.id;
