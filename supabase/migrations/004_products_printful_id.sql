-- Links a product to the Printful sync product it was imported from, so
-- re-importing updates the same row instead of creating a duplicate.
-- Run this once in the Supabase SQL Editor if the products table already
-- existed before this migration (schema.sql already has it for fresh setups).

alter table public.products add column if not exists printful_id integer;
