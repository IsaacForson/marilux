-- Studio-editable content: settings, catalogue overrides and promotions.
--
-- Design note: the service catalogue in src/lib/data/services.ts stays the
-- source of *structure*. These tables hold OVERRIDES layered on top of it, so
-- an empty database renders exactly the site we ship, and "reset to default"
-- is simply deleting a row. Nothing here can break the site by being absent.

-- ---------------------------------------------------------------------------
-- Key/value settings. One row per settings group, JSON payload.
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch
  before update on public.settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Category overrides. Every column is nullable: null means "use the default".
-- ---------------------------------------------------------------------------
create table if not exists public.category_overrides (
  slug        text primary key,
  name        text,
  tagline     text,
  summary     text,
  intro       text,
  image_url   text,
  sort_order  integer,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

drop trigger if exists category_overrides_touch on public.category_overrides;
create trigger category_overrides_touch
  before update on public.category_overrides
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Service overrides — price, duration, copy, availability.
-- ---------------------------------------------------------------------------
create table if not exists public.service_overrides (
  category_slug    text not null,
  service_slug     text not null,
  name             text,
  description      text,
  price            integer check (price is null or price >= 0),
  price_from       boolean,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  image_url        text,
  badge            text,
  is_active        boolean not null default true,
  updated_at       timestamptz not null default now(),
  primary key (category_slug, service_slug)
);

drop trigger if exists service_overrides_touch on public.service_overrides;
create trigger service_overrides_touch
  before update on public.service_overrides
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Promotions: discounts, promos and coupon codes.
--
-- `code` null  -> an automatic promotion, applied to everything in scope.
-- `code` set   -> a coupon the client types in at checkout.
-- ---------------------------------------------------------------------------
create table if not exists public.promotions (
  id           uuid primary key default gen_random_uuid(),
  code         text unique,
  label        text not null,
  description  text,

  -- 'percent' takes `value` as 0-100; 'amount' takes whole Ghana Cedis.
  kind         text not null default 'percent'
                 check (kind in ('percent', 'amount')),
  value        integer not null check (value > 0),

  -- What it applies to.
  scope        text not null default 'all'
                 check (scope in ('all', 'category', 'service')),
  scope_value  text,

  starts_at    timestamptz,
  ends_at      timestamptz,
  max_uses     integer check (max_uses is null or max_uses > 0),
  used_count   integer not null default 0,
  min_spend    integer not null default 0,

  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists promotions_touch on public.promotions;
create trigger promotions_touch
  before update on public.promotions
  for each row execute function public.touch_updated_at();

create index if not exists promotions_active_idx on public.promotions (is_active, ends_at);
-- Coupon lookup is case-insensitive: nobody types SUMMER20 the same way twice.
create unique index if not exists promotions_code_lower_idx
  on public.promotions (lower(code)) where code is not null;

-- Which booking used which promotion, so `used_count` can be audited.
create table if not exists public.promotion_redemptions (
  id                uuid primary key default gen_random_uuid(),
  promotion_id      uuid not null references public.promotions(id) on delete cascade,
  booking_reference text not null,
  amount            integer not null,
  created_at        timestamptz not null default now(),
  unique (promotion_id, booking_reference)
);

-- ---------------------------------------------------------------------------
-- Bookings gain the discount columns.
-- ---------------------------------------------------------------------------
alter table public.bookings
  add column if not exists promo_code       text,
  add column if not exists discount_amount  integer not null default 0,
  add column if not exists original_price   integer;

-- ---------------------------------------------------------------------------
-- Security: same posture as bookings. These tables are written only by the
-- server, which connects as `postgres` and bypasses RLS. Enabling RLS with no
-- policies means the public anon/authenticated keys can read nothing.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'settings', 'category_overrides', 'service_overrides',
    'promotions', 'promotion_redemptions'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;
