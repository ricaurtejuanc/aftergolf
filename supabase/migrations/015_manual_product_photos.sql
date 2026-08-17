-- Manual front/back photo uploads per color, as a reliable alternative to
-- Printful's Mockup Generator (which produced inconsistent results).
alter table public.products
  add column if not exists has_back_design boolean not null default false;

-- The admin's browser needs to upload directly to the product-mockups
-- bucket (public read policy already exists from migration 014).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'product_mockups_admin_insert'
  ) then
    create policy "product_mockups_admin_insert"
    on storage.objects for insert
    with check (bucket_id = 'product-mockups' and auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'product_mockups_admin_update'
  ) then
    create policy "product_mockups_admin_update"
    on storage.objects for update
    using (bucket_id = 'product-mockups' and auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com')
    with check (bucket_id = 'product-mockups' and auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');
  end if;
end $$;
