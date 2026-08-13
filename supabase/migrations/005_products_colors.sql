-- Color variants imported from Printful: [{ name, images, sizes }].
-- Run this once in the Supabase SQL Editor if the products table already
-- existed before this migration (schema.sql already has it for fresh setups).

alter table public.products add column if not exists colors jsonb;
