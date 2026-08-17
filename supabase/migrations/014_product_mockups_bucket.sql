-- Permanent home for Printful Mockup Generator images. The Mockup
-- Generator's own URLs are temporary (expire ~72h after generation), so the
-- printful edge function downloads them and re-uploads here right at import
-- time; product rows then store these permanent public URLs instead.
insert into storage.buckets (id, name, public)
values ('product-mockups', 'product-mockups', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'product_mockups_public_read'
  ) then
    create policy "product_mockups_public_read"
    on storage.objects for select
    using (bucket_id = 'product-mockups');
  end if;
end $$;
