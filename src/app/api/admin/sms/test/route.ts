import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isSignedIn } from '@/lib/admin/auth';
import { activeSmsProvider, sendSms, SMS_PROVIDERS } from '@/lib/integrations/sms';
import { smsSegments } from '@/lib/integrations/messages';
import { toE164 } from '@/lib/integrations/phone';
import { SITE } from '@/lib/data/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ to: z.string().trim().min(9).max(20).optional() });

/** Sends a real SMS and reports the provider's answer verbatim. */
export async function POST(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }

  const provider = activeSmsProvider();
  if (!provider) {
    return NextResponse.json({
      ok: false,
      configured: false,
      error:
        'No SMS provider is configured. Add credentials for one of: ' +
        SMS_PROVIDERS.filter((p) => p.id !== 'console')
          .map((p) => p.name)
          .join(', ') +
        '.',
      hint: 'For Ghana, Arkesel or Hubtel are the cheapest. Set SMS_PROVIDER=console to test the flow without an account.',
    });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  const to =
    parsed.success && parsed.data.to
      ? parsed.data.to
      : process.env.OWNER_SMS || SITE.contact.phone;

  const body =
    SITE.shortName + ': test message. If you can read this, SMS notifications are working.';

  const result = await sendSms(to, body);

  return NextResponse.json({
    ok: result.ok,
    configured: true,
    provider: provider.name,
    to: toE164(to),
    segments: smsSegments(body),
    id: result.id,
    error: result.detail,
    hint: result.ok ? undefined : hintFor(result.detail ?? ''),
  });
}

/** Turns the common provider errors into the actual next step. */
function hintFor(detail: string) {
  const d = detail.toLowerCase();
  if (d.includes('insufficient') || d.includes('balance') || d.includes('credit')) {
    return 'The account has no SMS credit. Top up with your provider — Brevo SMS in particular is credit-based, not part of its free email tier.';
  }
  if (d.includes('sender') && (d.includes('not') || d.includes('invalid') || d.includes('approve'))) {
    return 'The sender ID is not registered. Ghanaian networks require alphanumeric sender IDs to be approved first — register "MARILUX" with your provider, or set SMS_SENDER_ID to one that is approved.';
  }
  if (d.includes('unauthor') || d.includes('invalid api') || d.includes('401') || d.includes('forbidden')) {
    return 'The API key is wrong or inactive. Copy it again from the provider dashboard.';
  }
  if (d.includes('recipient') || d.includes('number') || d.includes('msisdn')) {
    return 'The provider rejected the number. It is sent in international format (+233…) — check the number is correct and active.';
  }
  return 'Check the provider dashboard for the account status and delivery logs.';
}
