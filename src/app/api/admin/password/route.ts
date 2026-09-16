import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, sessionCookie, createSessionToken } from '@/lib/admin/auth';
import {
  consumeResetToken,
  createResetToken,
  findByEmail,
  findById,
  setPassword,
  verifyPassword,
} from '@/lib/admin/users';
import { sendResetEmail } from '@/lib/admin/resetEmail';
import { clientKey, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const changeSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(10, 'Use at least 10 characters').max(200),
});

const requestSchema = z.object({ email: z.string().trim().email().max(200) });

const resetSchema = z.object({
  token: z.string().min(10).max(200),
  password: z.string().min(10, 'Use at least 10 characters').max(200),
});

/** Change your own password while signed in. */
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json(
      { ok: false, error: 'Sign in with an account to change a password.' },
      { status: 401 },
    );
  }

  const parsed = changeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid request.' },
      { status: 422 },
    );
  }

  const row = await findById(session.user.id);
  if (!row || !(await verifyPassword(parsed.data.currentPassword, row.password_hash))) {
    return NextResponse.json(
      { ok: false, error: 'Your current password is not right.' },
      { status: 401 },
    );
  }

  await setPassword(session.user.id, parsed.data.newPassword);

  // setPassword invalidates every session, including this one — so issue a
  // fresh cookie rather than signing the person out of the page they are on.
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie.name, createSessionToken(session.user.id), sessionCookie.options);
  return res;
}

/** Request a reset link. */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, 'admin-reset'), 4, 15 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Try again shortly.' },
      { status: 429 },
    );
  }

  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email.' }, { status: 422 });
  }

  const user = await findByEmail(parsed.data.email);

  // Always the same answer: this endpoint must not reveal which addresses
  // have accounts.
  const generic = {
    ok: true,
    message: 'If that address has an account, a reset link is on its way.',
  };

  if (!user || !user.is_active) return NextResponse.json(generic);

  const { token } = await createResetToken(user.id);
  const sent = await sendResetEmail({ to: user.email, name: user.name, token });

  if (!sent.ok) {
    console.error('[admin] reset email failed for ' + user.email + ': ' + sent.detail);
  }

  return NextResponse.json(generic);
}

/** Complete a reset using the emailed token. */
export async function PUT(req: Request) {
  const limit = rateLimit(clientKey(req, 'admin-reset-use'), 8, 15 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: 'Too many attempts.' }, { status: 429 });
  }

  const parsed = resetSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid request.' },
      { status: 422 },
    );
  }

  const userId = await consumeResetToken(parsed.data.token);
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: 'That link has expired or has already been used.' },
      { status: 400 },
    );
  }

  await setPassword(userId, parsed.data.password);

  // Sign them straight in — they have just proved control of the mailbox.
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie.name, createSessionToken(userId), sessionCookie.options);
  return res;
}
