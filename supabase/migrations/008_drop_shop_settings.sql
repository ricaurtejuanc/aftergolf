-- Shipping time moved from a single shop-wide setting to a per-product
-- field (see 007_products_shipping_time.sql), so this table is no longer
-- used. Run this once in the Supabase SQL Editor for projects that already
-- had it (schema.sql no longer creates it for fresh setups).

drop table if exists public.shop_settings;
