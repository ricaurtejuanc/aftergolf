-- AfterGolf: profiles + round history
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create table if not exists public.rounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_name text not null,
  course_location text not null,
  tee_color text not null,
  tee_gender text not null,
  course_rating numeric not null,
  slope_rating numeric not null,
  par integer not null,
  handicap_index numeric not null,
  course_handicap integer not null,
  gross_score integer not null,
  strokes_received integer not null,
  net_score integer not null,
  stableford_points integer not null,
  differential numeric not null,
  pcc numeric not null default 0,
  date_played date not null,
  player_label text,
  created_at timestamptz not null default now()
);

alter table public.rounds enable row level security;

create policy "rounds_select_own" on public.rounds
  for select using (auth.uid() = user_id);

create policy "rounds_insert_own" on public.rounds
  for insert with check (auth.uid() = user_id);

create policy "rounds_delete_own" on public.rounds
  for delete using (auth.uid() = user_id);

create index if not exists rounds_user_id_idx on public.rounds (user_id);

-- Campos de golf y tees: lectura pública, escritura solo para el admin
-- (identificado por email, ver ADMIN_EMAIL en src/lib/admin.ts).

create table if not exists public.courses (
  id text primary key,
  name text not null,
  location text not null,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "courses_select_all" on public.courses
  for select using (true);

create policy "courses_write_admin" on public.courses
  for all using (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');

create table if not exists public.tees (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses (id) on delete cascade,
  color text not null,
  gender text not null,
  cr numeric not null,
  slope numeric not null,
  par integer not null,
  position integer not null default 0
);

alter table public.tees enable row level security;

create policy "tees_select_all" on public.tees
  for select using (true);

create policy "tees_write_admin" on public.tees
  for all using (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');

create index if not exists tees_course_id_idx on public.tees (course_id);

-- Productos del Shop: misma idea, lectura pública / escritura solo admin.
-- "images" se deja vacío por ahora (no hay subida de fotos todavía); los
-- productos con fotos ya subidas (bolas, polo) las siguen sirviendo desde
-- src/assets vía un mapa local, ver src/data/productImages.ts.

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null,
  price numeric not null,
  category text not null,
  placeholder_emoji text,
  images text[],
  specs text[],
  sizes text[],
  -- Color variants imported from Printful: [{ name, images, sizes }]. Null
  -- for products with no color options (or not imported from Printful).
  colors jsonb,
  -- Estimated delivery time for this specific product (varies per product,
  -- not shop-wide), shown in its detail view. Editable by the admin.
  shipping_time text,
  -- Lets the admin create/import a product and keep working on it without
  -- it showing in the public Shop yet, instead of deleting and re-adding it.
  visible boolean not null default true,
  position integer not null default 0,
  printful_id integer,
  -- Sync variant IDs from Printful, needed to place an order through their
  -- Orders API: [{ syncVariantId, size, color }]. Populated on import.
  printful_variants jsonb,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products_select_all" on public.products
  for select using (true);

create policy "products_write_admin" on public.products
  for all using (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');

-- Orders. Rows are written only by edge functions using the service-role
-- key (bypasses RLS) — there is no insert/update policy for regular
-- clients by design. payment_method is 'bizum' (status starts 'pending'
-- until the admin confirms receipt via confirm-bizum-order) or the now-
-- unused legacy 'stripe' path (status was always 'paid', written by the
-- since-removed stripe-webhook function).
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  stripe_session_id text unique,
  payment_method text not null default 'stripe',
  customer_email text not null,
  shipping_address jsonb,
  items jsonb not null,
  amount_total numeric not null,
  currency text not null default 'eur',
  status text not null default 'paid',
  -- Set once a draft order has been created in Printful for this order (best
  -- effort, from bizum-order). Null if creation failed or wasn't possible.
  printful_order_id text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

create policy "orders_select_admin" on public.orders
  for select using (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');

-- Lets the admin clean up test orders directly from the Pedidos tab.
create policy "orders_delete_admin" on public.orders
  for delete using (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');

-- Lightweight page-view log for the admin "Resumen" tab. Anyone (including
-- anonymous visitors) can insert a row for a page they load; only the admin
-- can read them back. No user_id / IP is stored — just path + timestamp.
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  created_at timestamptz not null default now()
);

alter table public.page_views enable row level security;

create policy "page_views_insert_anyone" on public.page_views
  for insert with check (true);

create policy "page_views_select_admin" on public.page_views
  for select using (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');

-- Home for manually-uploaded product photo galleries (per color, or per
-- product when it has no color variants) — the admin uploads these
-- directly from the browser, so this bucket needs both public read
-- (product photos are public) and admin-only write policies.
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
