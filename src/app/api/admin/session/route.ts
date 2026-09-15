import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  adminConfigured,
  checkPassword,
  createSessionToken,
  sessionCookie,
} from '@/lib/admin/auth';
import { clientKey, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ password: z.string().min(1).max(200) });

/** Sign in. Deliberately slow to brute-force: five attempts per ten minutes. */
export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Admin access is not configured on this deployment.' },
      { status: 503 },
    );
  }

  const limit = rateLimit(clientKey(req, 'admin-login'), 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Try again in a few minutes.' },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !checkPassword(parsed.data.password)) {
    // One message for both cases: never reveal which part was wrong.
    return NextResponse.json({ ok: false, error: 'Incorrect password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie.name, createSessionToken(), sessionCookie.options);
  return res;
}

/** Sign out. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie.name, '', { ...sessionCookie.options, maxAge: 0 });
  return res;
}
