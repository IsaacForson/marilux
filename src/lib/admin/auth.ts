import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Admin session.
 *
 * A single shared studio password, exchanged for a signed, expiring, HTTP-only
 * cookie. No user table, because there is one studio and one owner — but the
 * cookie is signed with HMAC so it cannot be forged, and the password is
 * compared in constant time so it cannot be probed by timing.
 *
 * Required:
 *   ADMIN_PASSWORD        the studio password
 *   ADMIN_SESSION_SECRET  a long random string used to sign sessions
 */
const COOKIE = 'marilux_admin';
const MAX_AGE_SECONDS = 60 * 60 * 12;

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error('ADMIN_SESSION_SECRET is not set');
  return value;
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

/** `<issuedAt>.<nonce>.<signature>` */
export function createSessionToken() {
  const payload = Date.now() + '.' + randomBytes(12).toString('base64url');
  return payload + '.' + sign(payload);
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [issued, nonce, signature] = parts;
  const expected = sign(issued + '.' + nonce);

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const age = (Date.now() - Number(issued)) / 1000;
  return Number.isFinite(age) && age >= 0 && age < MAX_AGE_SECONDS;
}

export function checkPassword(candidate: string) {
  const actual = process.env.ADMIN_PASSWORD;
  if (!actual) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(actual);
  // Compare a fixed-length digest so length itself does not leak.
  const ha = createHmac('sha256', secret()).update(a).digest();
  const hb = createHmac('sha256', secret()).update(b).digest();
  return timingSafeEqual(ha, hb);
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

export async function isSignedIn() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE)?.value);
}

/** Server-component guard: redirects rather than rendering anything. */
export async function requireAdmin() {
  if (!adminConfigured()) redirect('/admin/setup');
  if (!(await isSignedIn())) redirect('/admin/login');
}
