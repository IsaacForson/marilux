import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  countUsers,
  findByEmail,
  recordLogin,
  sessionStillValid,
  verifyPassword,
  type AdminUser,
} from './users';

/**
 * Dashboard authentication.
 *
 * Named accounts stored in Postgres, with a signed, expiring, HTTP-only
 * cookie. Two details are load-bearing:
 *
 *  1. ADMIN_PASSWORD still works, but **only while no account exists**. That
 *     bootstraps the first login and is the recovery route if every password
 *     is lost — without leaving a permanent back door once accounts are set up.
 *
 *  2. A session records who it belongs to and when it was issued, and is
 *     re-checked against the user on every request. Changing a password or
 *     deactivating someone signs them out everywhere immediately, rather than
 *     leaving a valid cookie in the wild.
 */
const COOKIE = 'marilux_admin';
const MAX_AGE_SECONDS = 60 * 60 * 12;

export type Session = {
  user: AdminUser | null;
  /** True when signed in via ADMIN_PASSWORD because no accounts exist yet. */
  bootstrap: boolean;
};

export function adminConfigured() {
  return Boolean(process.env.ADMIN_SESSION_SECRET) &&
    Boolean(process.env.ADMIN_PASSWORD || process.env.DATABASE_URL);
}

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error('ADMIN_SESSION_SECRET is not set');
  return value;
}

const sign = (payload: string) =>
  createHmac('sha256', secret()).update(payload).digest('base64url');

/** `<userId|'bootstrap'>.<issuedAt>.<nonce>.<signature>` */
export function createSessionToken(userId: string) {
  const payload = [userId, Date.now(), randomBytes(9).toString('base64url')].join('.');
  return payload + '.' + sign(payload);
}

type Parsed = { userId: string; issuedAt: number };

function parseToken(token: string | undefined): Parsed | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 4) return null;

  const [userId, issued, nonce, signature] = parts;
  const expected = sign([userId, issued, nonce].join('.'));

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const issuedAt = Number(issued);
  const age = (Date.now() - issuedAt) / 1000;
  if (!Number.isFinite(age) || age < 0 || age >= MAX_AGE_SECONDS) return null;

  return { userId, issuedAt };
}

export const sessionCookie = {
  name: COOKIE,
  options: {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  },
};

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const parsed = parseToken(store.get(COOKIE)?.value);
  if (!parsed) return null;

  if (parsed.userId === 'bootstrap') {
    // Only honoured while the studio still has no accounts. The moment one is
    // created, outstanding bootstrap sessions stop working.
    return (await countUsers()) === 0 ? { user: null, bootstrap: true } : null;
  }

  const user = await sessionStillValid(parsed.userId, parsed.issuedAt);
  return user ? { user, bootstrap: false } : null;
}

export async function isSignedIn() {
  return (await getSession()) !== null;
}

/** Server-component guard: redirects rather than rendering anything. */
export async function requireAdmin() {
  if (!adminConfigured()) redirect('/admin/setup');
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}

export type SignInResult =
  | { ok: true; token: string; bootstrap: boolean; name: string }
  | { ok: false; error: string };

/**
 * Verifies credentials.
 *
 * Both failure modes return the same message and take a comparable amount of
 * work, so the form cannot be used to discover which addresses have accounts.
 */
export async function signIn(email: string, password: string): Promise<SignInResult> {
  const users = await countUsers();

  if (users === 0) {
    const expected = process.env.ADMIN_PASSWORD;
    if (expected && constantTimeEquals(password, expected)) {
      return { ok: true, token: createSessionToken('bootstrap'), bootstrap: true, name: 'Studio' };
    }
    return { ok: false, error: 'Incorrect password.' };
  }

  const user = await findByEmail(email);
  if (!user || !user.is_active) {
    // Hash anyway so a missing account is not faster than a wrong password.
    await verifyPassword(password, DUMMY_HASH);
    return { ok: false, error: 'Those details are not right.' };
  }

  if (!(await verifyPassword(password, user.password_hash))) {
    return { ok: false, error: 'Those details are not right.' };
  }

  await recordLogin(user.id);
  return { ok: true, token: createSessionToken(user.id), bootstrap: false, name: user.name };
}

/** A real scrypt hash of a random value, used only to equalise timing. */
const DUMMY_HASH =
  'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$' +
  'ZGVjb3lkZWNveWRlY295ZGVjb3lkZWNveWRlY295ZGVjb3lkZWNveWRlY295ZGVjb3k=';

function constantTimeEquals(a: string, b: string) {
  const ha = createHmac('sha256', secret()).update(a).digest();
  const hb = createHmac('sha256', secret()).update(b).digest();
  return timingSafeEqual(ha, hb);
}
