import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminConfigured, sessionCookie, signIn } from '@/lib/admin/auth';
import { countUsers } from '@/lib/admin/users';
import { clientKey, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  email: z.string().trim().max(200).optional(),
  password: z.string().min(1).max(200),
});

/** Sign in. Five attempts per ten minutes, per address. */
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
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Enter your password.' }, { status: 422 });
  }

  const result = await signIn(parsed.data.email ?? '', parsed.data.password);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, bootstrap: result.bootstrap, name: result.name });
  res.cookies.set(sessionCookie.name, result.token, sessionCookie.options);
  return res;
}

/** Tells the login form whether to ask for an email address. */
export async function GET() {
  return NextResponse.json({ ok: true, hasAccounts: (await countUsers()) > 0 });
}

/** Sign out. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie.name, '', { ...sessionCookie.options, maxAge: 0 });
  return res;
}
