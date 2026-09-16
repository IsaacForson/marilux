-- Marilux Beauty Bar — bookings schema
--
-- Applied with: npm run db:migrate
-- Safe to re-run: every statement is idempotent.

create table if not exists public.bookings (
  -- The human-readable reference (MLX-YYMMDD-XXXXX) is the natural key: it is
  -- what the client quotes and what the payment provider echoes back.
  reference          text primary key,

  -- Who
  name               text        not null,
  email              text        not null,
  phone              text        not null,
  whatsapp           text        not null,

  -- What
  category_slug      text        not null,
  category_name      text        not null,
  service_slug       text        not null,
  service_name       text        not null,
  specialist_slug    text        not null,
  specialist_name    text        not null,
  duration_minutes   integer     not null check (duration_minutes > 0),

  -- When. Stored as a plain date + minutes-from-midnight rather than a
  -- timestamptz: the studio thinks in local wall-clock time, and a timezone
  -- conversion is the classic way to move an appointment by an hour.
  booking_date       date        not null,
  booking_time       integer     not null check (booking_time between 0 and 1439),

  -- Money, in whole Ghana Cedis.
  price              integer     not null check (price >= 0),
  deposit            integer     not null check (deposit >= 0),
  deposit_status     text        not null default 'pending'
                       check (deposit_status in ('pending','paid','awaiting-link','refunded','failed')),
  payment_provider   text,
  payment_reference  text,

  -- Lifecycle
  status             text        not null default 'pending'
                       check (status in ('pending','confirmed','declined','completed','cancelled','no-show')),

  notes              text,
  staff_note         text,
  policies_accepted  boolean     not null default true,

  confirmation_sent_at timestamptz,
  reminder_sent_at     timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- The diary view and the double-booking check both read by date.
create index if not exists bookings_date_idx
  on public.bookings (booking_date, booking_time);

-- The dashboard filters by status constantly.
create index if not exists bookings_status_idx
  on public.bookings (status);

-- "Every previous booking by this client" on the detail page.
create index if not exists bookings_email_idx
  on public.bookings (lower(email));

-- Newest-first listing.
create index if not exists bookings_created_idx
  on public.bookings (created_at desc);

-- Keep updated_at honest without the application having to remember.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_touch_updated_at on public.bookings;
create trigger bookings_touch_updated_at
  before update on public.bookings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- This table holds client names, phone numbers, emails and medical disclosures.
-- RLS is enabled with NO permissive policies, so the anon and authenticated
-- roles (the keys that ship to browsers) can read nothing at all.
--
-- The application connects as the `postgres` role over the pooler, which
-- bypasses RLS — so this is a hard backstop against the PostgREST endpoint
-- ever exposing client data, not a mechanism the app relies on.
-- ---------------------------------------------------------------------------
alter table public.bookings enable row level security;
alter table public.bookings force row level security;

revoke all on public.bookings from anon, authenticated;

-- Newsletter signups, kept separate: different retention, different consent.
create table if not exists public.newsletter_subscribers (
  email        text primary key,
  created_at   timestamptz not null default now(),
  unsubscribed boolean not null default false
);

alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_subscribers force row level security;
revoke all on public.newsletter_subscribers from anon, authenticated;
