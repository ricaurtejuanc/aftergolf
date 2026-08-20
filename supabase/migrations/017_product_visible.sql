-- Lets the admin create/import a product and keep working on it without it
-- showing in the public Shop yet, instead of deleting and re-adding it.
alter table public.products add column if not exists visible boolean not null default true;
