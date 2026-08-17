-- Replaced by an open-ended photo gallery per color (add/delete/reorder
-- any number of photos from the admin "Fotos" panel) instead of a rigid
-- front/back pair, so the checkbox controlling whether a back slot showed
-- is no longer needed.
alter table public.products drop column if exists has_back_design;
