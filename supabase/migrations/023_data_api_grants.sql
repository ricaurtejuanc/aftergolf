-- From 2026-10-30, Supabase stops automatically granting Data API
-- (PostgREST/supabase-js/GraphQL) access to new tables created in
-- "public" (see https://github.com/orgs/supabase/discussions/45329).
-- These tables already have the grants below — made automatically when
-- each was created, before the change — so this is a no-op against the
-- live project. It just makes the grants explicit so a future
-- `supabase db reset`, preview branch, or fresh project (which replays
-- schema.sql/migrations from scratch after the cutoff) doesn't end up
-- with tables the Data API can't reach. RLS policies (see each table's
-- own migration/schema.sql block) remain the actual access control.
grant all on table public.profiles to anon, authenticated, service_role;
grant all on table public.rounds to anon, authenticated, service_role;
grant all on table public.courses to anon, authenticated, service_role;
grant all on table public.recorridos to anon, authenticated, service_role;
grant all on table public.tees to anon, authenticated, service_role;
grant all on table public.hole_scores to anon, authenticated, service_role;
grant all on table public.products to anon, authenticated, service_role;
grant all on table public.shop_settings to anon, authenticated, service_role;
grant all on table public.orders to anon, authenticated, service_role;
grant all on table public.page_views to anon, authenticated, service_role;
