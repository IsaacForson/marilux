-- Media library and the editable gallery.
--
-- Images can live in one of two places, chosen by what is configured:
--   * Supabase Storage  — preferred; `storage_path` is set, `data` is null.
--   * Postgres          — the fallback; bytes live in `data`.
-- Either way `url` is what the site renders, so nothing downstream cares.

create table if not exists public.media (
  id           uuid primary key default gen_random_uuid(),
  filename     text not null,
  mime         text not null,
  bytes        integer not null,
  width        integer,
  height       integer,

  -- Exactly one of these is populated. See the provider column.
  data         bytea,
  storage_path text,
  provider     text not null default 'postgres' check (provider in ('postgres', 'supabase')),

  url          text not null,
  alt          text not null default '',
  folder       text not null default 'general',
  created_at   timestamptz not null default now()
);

create index if not exists media_folder_idx on public.media (folder, created_at desc);

-- The portfolio, so the studio can add and remove work without a deploy.
create table if not exists public.gallery_items (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  caption        text,
  category_slug  text not null default 'all',
  media_id       uuid references public.media(id) on delete set null,
  image_url      text,
  before_url     text,
  kind           text not null default 'image'
                   check (kind in ('image', 'video', 'before-after')),
  span           text not null default 'portrait'
                   check (span in ('tall', 'wide', 'square', 'portrait')),
  sort_order     integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists gallery_items_order_idx
  on public.gallery_items (is_active, sort_order, created_at desc);

drop trigger if exists gallery_items_touch on public.gallery_items;
create trigger gallery_items_touch
  before update on public.gallery_items
  for each row execute function public.touch_updated_at();

-- Same posture as every other table: the server connects as `postgres` and
-- bypasses RLS; the public keys can read nothing.
do $$
declare t text;
begin
  foreach t in array array['media', 'gallery_items']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;
