-- deleteColorPhoto() (and the photo-optimization reprocessing pass) both
-- call storage.remove() on the product-mockups bucket, but no delete policy
-- ever existed for storage.objects there — only select/insert/update
-- (014_product_mockups_bucket.sql, 015_manual_product_photos.sql) — so that
-- cleanup has always failed silently.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'product_mockups_admin_delete'
  ) then
    create policy "product_mockups_admin_delete"
    on storage.objects for delete
    using (bucket_id = 'product-mockups' and auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');
  end if;
end $$;
