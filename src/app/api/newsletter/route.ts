import { NextResponse } from 'next/server';
import { z } from 'zod';
import { clientKey, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ email: z.string().email().max(120) });

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, 'news'), 4, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid email address.' }, { status: 422 });
  }

  // TODO(integration): forward to the studio's list provider (Mailchimp,
  // Brevo, Resend Audiences). Logged for now so no address is silently lost.
  console.info('[newsletter] subscribe: ' + parsed.data.email);

  return NextResponse.json({ ok: true });
}
