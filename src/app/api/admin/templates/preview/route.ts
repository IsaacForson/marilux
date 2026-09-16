import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isSignedIn } from '@/lib/admin/auth';
import { buildMessage, SAMPLE_BOOKING, smsSegments } from '@/lib/integrations/messages';
import { unknownTokens } from '@/lib/integrations/render';
import { TEMPLATE_TOKENS } from '@/lib/settings/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  kind: z.enum(['received', 'confirmed', 'declined', 'reminder', 'cancelled']),
  emailSubject: z.string().max(300).default(''),
  emailBody: z.string().max(8000).default(''),
  sms: z.string().max(1000).default(''),
});

const KNOWN = TEMPLATE_TOKENS.map((t) => t.token.replace(/[{}]/g, '').trim());

/** Renders a template against a sample booking, so the studio sees it before saving. */
export async function POST(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid template.' }, { status: 422 });
  }

  const { kind, emailSubject, emailBody, sms } = parsed.data;
  const message = buildMessage(kind, SAMPLE_BOOKING, {
    emailSubject,
    emailBody,
    sms,
    enabled: true,
  });

  const unknown = [
    ...new Set([
      ...unknownTokens(emailSubject, KNOWN),
      ...unknownTokens(emailBody, KNOWN),
      ...unknownTokens(sms, KNOWN),
    ]),
  ];

  return NextResponse.json({
    ok: true,
    subject: message.subject,
    text: message.text,
    sms: message.sms,
    segments: smsSegments(message.sms),
    unknownTokens: unknown,
  });
}
