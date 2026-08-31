-- Mystic Crystal Workshop — e-commerce schema
-- Lives in the shared self-hosted Supabase (supabase.zenithacct.com).
-- Every table is prefixed `crystal_` so it never collides with the
-- MCW Apple shop or zenith-invoice tables already in this database.
--
-- Model note: crystals are one-of-a-kind. There is no variant table and
-- no stock quantity — a product row IS a single physical piece, and its
-- `status` carries the whole lifecycle: active -> reserved -> sold_out.

create table if not exists crystal_collections (
  slug        text primary key,
  name_en     text not null,
  name_zh     text not null,
  desc_en     text not null default '',
  desc_zh     text not null default '',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists crystal_products (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name_en       text not null,
  name_zh       text not null,
  desc_en       text not null default '',
  desc_zh       text not null default '',
  collection_slug text references crystal_collections(slug) on delete set null,
  price_hkd     numeric(10,2) not null check (price_hkd >= 0),
  compare_price_hkd numeric(10,2) check (compare_price_hkd >= 0),
  -- attributes of this exact piece
  weight_g      numeric(10,1),
  size_cm       text,
  origin_en     text not null default '',
  origin_zh     text not null default '',
  status        text not null default 'active'
                check (status in ('active','reserved','sold_out','hidden')),
  is_new        boolean not null default false,
  featured      boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists crystal_products_status_idx     on crystal_products (status);
create index if not exists crystal_products_collection_idx on crystal_products (collection_slug);

create table if not exists crystal_product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references crystal_products(id) on delete cascade,
  url         text not null,
  is_primary  boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists crystal_product_images_product_idx on crystal_product_images (product_id);

create table if not exists crystal_orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text unique not null,
  customer_name     text not null,
  customer_email    text not null,
  customer_phone    text not null,
  shipping_address  text not null default '',
  delivery_method   text not null default 'post'
                    check (delivery_method in ('post','pickup')),
  customer_note     text not null default '',
  payment_method    text not null check (payment_method in ('stripe','fps','payme')),
  payment_status    text not null default 'pending'
                    check (payment_status in ('pending','paid','failed','refunded')),
  -- FPS / PayMe are settled by hand: the customer gives a reference and/or
  -- a screenshot, and the shop owner marks the order paid in the admin.
  payment_ref       text not null default '',
  payment_proof_url text,
  stripe_payment_intent_id text,
  fulfillment_status text not null default 'pending'
                    check (fulfillment_status in ('pending','processing','shipped','delivered','cancelled')),
  tracking_number   text not null default '',
  subtotal_hkd      numeric(10,2) not null default 0,
  shipping_hkd      numeric(10,2) not null default 0,
  total_hkd         numeric(10,2) not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists crystal_orders_created_idx on crystal_orders (created_at desc);

create table if not exists crystal_order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references crystal_orders(id) on delete cascade,
  product_id     uuid references crystal_products(id) on delete set null,
  -- names are copied in, so an order stays readable even if the product
  -- row is later renamed or deleted
  name_en        text not null,
  name_zh        text not null,
  image_url      text not null default '',
  unit_price_hkd numeric(10,2) not null,
  quantity       int not null default 1 check (quantity > 0),
  total_hkd      numeric(10,2) not null
);

create index if not exists crystal_order_items_order_idx on crystal_order_items (order_id);

create table if not exists crystal_settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row level security.
-- The shop front reads the catalogue with the anon key, so the catalogue
-- gets public read policies. Orders and settings have NO policies at all:
-- only the service role (which bypasses RLS) touches them, and that key
-- lives server-side in the API routes.
-- ---------------------------------------------------------------------
alter table crystal_collections    enable row level security;
alter table crystal_products       enable row level security;
alter table crystal_product_images enable row level security;
alter table crystal_orders         enable row level security;
alter table crystal_order_items    enable row level security;
alter table crystal_settings       enable row level security;

drop policy if exists crystal_collections_public_read on crystal_collections;
create policy crystal_collections_public_read
  on crystal_collections for select to anon, authenticated using (true);

drop policy if exists crystal_products_public_read on crystal_products;
create policy crystal_products_public_read
  on crystal_products for select to anon, authenticated
  using (status <> 'hidden');

drop policy if exists crystal_product_images_public_read on crystal_product_images;
create policy crystal_product_images_public_read
  on crystal_product_images for select to anon, authenticated using (true);

-- keep updated_at honest
create or replace function crystal_touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists crystal_products_touch on crystal_products;
create trigger crystal_products_touch before update on crystal_products
  for each row execute function crystal_touch_updated_at();

drop trigger if exists crystal_orders_touch on crystal_orders;
create trigger crystal_orders_touch before update on crystal_orders
  for each row execute function crystal_touch_updated_at();

-- Every key in crystal_settings is meant for the shopper to see (brand
-- name, shipping thresholds, the FPS ID and PayMe link they pay to), so
-- the table is publicly readable. Never put a credential in here.
drop policy if exists crystal_settings_public_read on crystal_settings;
create policy crystal_settings_public_read
  on crystal_settings for select to anon, authenticated using (true);
