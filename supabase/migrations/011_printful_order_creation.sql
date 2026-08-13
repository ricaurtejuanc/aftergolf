-- Sync variant IDs from Printful, needed to place an order through their
-- Orders API: [{ syncVariantId, size, color }]. Populated on import/re-import
-- from the "get" action of the printful edge function.
alter table public.products add column if not exists printful_variants jsonb;

-- Set once a draft order has been created in Printful for this order (best
-- effort, from bizum-order). Null if creation failed or wasn't possible
-- (e.g. product imported before this column existed).
alter table public.orders add column if not exists printful_order_id text;
