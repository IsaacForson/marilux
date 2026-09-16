-- Dashboard accounts.
--
-- Replaces the single shared password with named users who can be added,
-- deactivated and reset independently. ADMIN_PASSWORD stays as a bootstrap and
-- recovery route: it only works while no account exists, so you can never be
-- locked out of your own studio.

create table if not exists public.admin_users (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null,
  name                text not null,

  -- scrypt, salted per user. Format: scrypt$N$r$p$<salt b64>$<hash b64>
  password_hash       text not null,

  role                text not null default 'staff' check (role in ('owner', 'staff')),
  is_active           boolean not null default true,

  -- Any session issued before this moment is rejected, so changing a password
  -- or deactivating an account signs that person out everywhere immediately.
  sessions_valid_from timestamptz not null default now(),

  last_login_at       timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Email is the login, so it must be unique regardless of how it was typed.
create unique index if not exists admin_users_email_idx
  on public.admin_users (lower(email));

drop trigger if exists admin_users_touch on public.admin_users;
create trigger admin_users_touch
  before update on public.admin_users
  for each row execute function public.touch_updated_at();

-- Password reset tokens.
--
-- Only the hash is stored: a leaked database row cannot be used to reset a
-- password, because the token itself was only ever in the email.
create table if not exists public.admin_password_resets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.admin_users(id) on delete cascade,
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists admin_password_resets_user_idx
  on public.admin_password_resets (user_id, created_at desc);

do $$
declare t text;
begin
  foreach t in array array['admin_users', 'admin_password_resets']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;
