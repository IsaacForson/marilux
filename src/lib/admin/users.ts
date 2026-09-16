import 'server-only';
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { db, dbConfigured } from '@/lib/store/db';

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

/**
 * Dashboard accounts.
 *
 * Passwords are hashed with scrypt — a memory-hard KDF built into Node, so no
 * extra dependency and no chance of shipping a plain SHA of someone's
 * password. Parameters are stored alongside each hash, which means they can be
 * raised later without invalidating existing accounts.
 */
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'staff';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

type Row = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: 'owner' | 'staff';
  is_active: boolean;
  sessions_valid_from: Date;
  last_login_at: Date | null;
  created_at: Date;
};

const toUser = (r: Row): AdminUser => ({
  id: r.id,
  email: r.email,
  name: r.name,
  role: r.role,
  isActive: r.is_active,
  lastLoginAt: r.last_login_at ? new Date(r.last_login_at).toISOString() : null,
  createdAt: new Date(r.created_at).toISOString(),
});

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize('NFKC'), salt, SCRYPT.keylen);
  return [
    'scrypt',
    SCRYPT.N,
    SCRYPT.r,
    SCRYPT.p,
    salt.toString('base64'),
    hash.toString('base64'),
  ].join('$');
}

export async function verifyPassword(password: string, stored: string) {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, , , , saltB64, hashB64] = parts;
  try {
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(hashB64, 'base64');
    const actual = await scrypt(password.normalize('NFKC'), salt, expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

const COLUMNS =
  'id, email, name, password_hash, role, is_active, sessions_valid_from, last_login_at, created_at';

export async function countUsers() {
  if (!dbConfigured()) return 0;
  try {
    const sql = db();
    const rows = await sql<Array<{ n: number }>>`
      select count(*)::int as n from public.admin_users where is_active`;
    return rows[0]?.n ?? 0;
  } catch {
    // A database that cannot be reached must not lock the owner out — the
    // caller falls back to the environment password.
    return 0;
  }
}

export async function listUsers(): Promise<AdminUser[]> {
  if (!dbConfigured()) return [];
  const sql = db();
  const rows = await sql<Row[]>`
    select ${sql.unsafe(COLUMNS)} from public.admin_users
    order by is_active desc, created_at`;
  return rows.map(toUser);
}

export async function findByEmail(email: string) {
  if (!dbConfigured()) return null;
  const sql = db();
  const rows = await sql<Row[]>`
    select ${sql.unsafe(COLUMNS)} from public.admin_users
    where lower(email) = ${email.trim().toLowerCase()}`;
  return rows[0] ?? null;
}

export async function findById(id: string) {
  if (!dbConfigured()) return null;
  const sql = db();
  const rows = await sql<Row[]>`
    select ${sql.unsafe(COLUMNS)} from public.admin_users where id = ${id}`;
  return rows[0] ?? null;
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role?: 'owner' | 'staff';
}) {
  const sql = db();
  const rows = await sql<Row[]>`
    insert into public.admin_users (email, name, password_hash, role)
    values (
      ${input.email.trim()},
      ${input.name.trim()},
      ${await hashPassword(input.password)},
      ${input.role ?? 'staff'}
    )
    returning ${sql.unsafe(COLUMNS)}`;
  return toUser(rows[0]);
}

/**
 * Sets a new password and invalidates every existing session for that user.
 *
 * The second part matters: a password change after a suspected compromise is
 * worthless if the attacker's cookie keeps working.
 */
export async function setPassword(userId: string, password: string) {
  const sql = db();
  await sql`
    update public.admin_users
    set password_hash = ${await hashPassword(password)}, sessions_valid_from = now()
    where id = ${userId}`;
}

export async function updateUser(
  id: string,
  patch: { name?: string; email?: string; role?: 'owner' | 'staff'; isActive?: boolean },
) {
  const sql = db();
  const rows = await sql<Row[]>`
    update public.admin_users set
      name = coalesce(${patch.name ?? null}, name),
      email = coalesce(${patch.email ?? null}, email),
      role = coalesce(${patch.role ?? null}, role),
      is_active = coalesce(${patch.isActive ?? null}, is_active),
      sessions_valid_from =
        case when ${patch.isActive === false} then now() else sessions_valid_from end
    where id = ${id}
    returning ${sql.unsafe(COLUMNS)}`;
  return rows[0] ? toUser(rows[0]) : null;
}

export async function deleteUser(id: string) {
  const sql = db();
  await sql`delete from public.admin_users where id = ${id}`;
}

export async function recordLogin(id: string) {
  const sql = db();
  await sql`update public.admin_users set last_login_at = now() where id = ${id}`;
}

/** Is this session still valid for the user it names? */
export async function sessionStillValid(userId: string, issuedAtMs: number) {
  const user = await findById(userId);
  if (!user || !user.is_active) return null;
  if (new Date(user.sessions_valid_from).getTime() > issuedAtMs) return null;
  return toUser(user);
}

/* ------------------------------------------------------------------ */
/* Password resets                                                     */
/* ------------------------------------------------------------------ */

const RESET_TTL_MINUTES = 45;

/** Returns the raw token — the only time it exists outside the email. */
export async function createResetToken(userId: string) {
  const sql = db();
  const token = randomBytes(32).toString('base64url');
  const hash = await hashToken(token);
  const expires = new Date(Date.now() + RESET_TTL_MINUTES * 60_000);

  // One live token per person: requesting a new link retires the old one.
  await sql`
    update public.admin_password_resets set used_at = now()
    where user_id = ${userId} and used_at is null`;

  await sql`
    insert into public.admin_password_resets (user_id, token_hash, expires_at)
    values (${userId}, ${hash}, ${expires.toISOString()})`;

  return { token, expiresAt: expires.toISOString() };
}

export async function consumeResetToken(token: string) {
  if (!dbConfigured()) return null;
  const sql = db();
  const hash = await hashToken(token);

  const rows = await sql<Array<{ id: string; user_id: string }>>`
    update public.admin_password_resets set used_at = now()
    where token_hash = ${hash}
      and used_at is null
      and expires_at > now()
    returning id, user_id`;

  return rows[0]?.user_id ?? null;
}

/**
 * Hashes a reset token for storage.
 *
 * A fixed salt is correct here, unlike for passwords: the token is already 32
 * random bytes, so there is nothing to brute-force, and a deterministic hash
 * is what makes lookup possible.
 */
async function hashToken(token: string) {
  const salt = Buffer.from('marilux-reset-v1');
  const hash = await scrypt(token, salt, 32);
  return hash.toString('base64');
}
