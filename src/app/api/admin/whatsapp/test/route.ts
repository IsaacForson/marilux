import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isSignedIn } from '@/lib/admin/auth';
import {
  customerTemplate,
  normaliseGhanaNumber,
  ownerNumber,
  sendText,
  sendTemplate,
  whatsappConfigured,
} from '@/lib/integrations/whatsapp';
import { SITE } from '@/lib/data/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  to: z.string().trim().min(9).max(20).optional(),
  useTemplate: z.boolean().optional(),
});

/**
 * Sends a test WhatsApp message and reports Meta's answer verbatim.
 *
 * The point is diagnosis: when a send fails, the studio sees the real API
 * error ("Recipient phone number not in allowed list", "Template name does
 * not exist") rather than a generic failure.
 */
export async function POST(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }

  if (!whatsappConfigured()) {
    return NextResponse.json({
      ok: false,
      configured: false,
      error:
        'WhatsApp is not configured. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID, then restart.',
    });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  const to = normaliseGhanaNumber(parsed.success && parsed.data.to ? parsed.data.to : ownerNumber());
  const template = customerTemplate();
  const wantsTemplate = parsed.success ? parsed.data.useTemplate : false;

  const result =
    wantsTemplate && template
      ? await sendTemplate(to, template, [
          'Marilux',
          'This is a test message from your website.',
          'Volume Set',
          'Friday, 1 January',
          '10:00 AM',
          'MLX-TEST-00000',
        ])
      : await sendText(
          to,
          'Test message from ' +
            SITE.name +
            '. If you can read this, WhatsApp notifications are working.',
        );

  return NextResponse.json({
    ok: result.ok,
    configured: true,
    to,
    mode: wantsTemplate && template ? 'template: ' + template : 'free-form text',
    messageId: result.messageId,
    error: result.detail,
    hint: result.ok
      ? undefined
      : hintFor(result.detail ?? '', Boolean(template)),
  });
}

/** Turns the common Meta errors into the actual next step. */
function hintFor(detail: string, hasTemplate: boolean) {
  const d = detail.toLowerCase();

  if (d.includes('not in allowed list') || d.includes('recipient phone number not')) {
    return 'While your app is in development mode, Meta only delivers to numbers you have added as test recipients. Add this number under WhatsApp → API Setup → "To", or publish the app.';
  }
  if (d.includes('re-engagement') || d.includes('24') || d.includes('outside') || d.includes('window')) {
    return hasTemplate
      ? 'Outside the 24-hour window. Your template exists — retry with "Send as template".'
      : 'Outside Meta’s 24-hour window, so free-form text is blocked. Get a template approved and set WHATSAPP_CUSTOMER_TEMPLATE.';
  }
  if (d.includes('template name does not exist') || d.includes('template not found')) {
    return 'The template name or language does not match an approved template. Check WHATSAPP_CUSTOMER_TEMPLATE and WHATSAPP_TEMPLATE_LOCALE (often "en" vs "en_US").';
  }
  if (d.includes('access token') || d.includes('oauth') || d.includes('session has expired') || d.includes('code 190')) {
    return 'The access token is invalid or expired. Temporary tokens last 24 hours — create a permanent System User token instead.';
  }
  if (d.includes('param') && d.includes('number')) {
    return 'The number of template variables sent does not match the approved template. This site sends exactly 6.';
  }
  return 'Check WHATSAPP-SETUP.md for the full walkthrough.';
}
