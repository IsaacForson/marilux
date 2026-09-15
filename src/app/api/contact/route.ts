import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SITE } from '@/lib/data/site';
import { emailAdapter } from '@/lib/integrations/email';
import { escapeHtml } from '@/lib/integrations/format';
import { clientKey, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(5).max(2000),
  company: z.string().max(0).optional().or(z.literal('')),
});

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, 'contact'), 4, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many messages. Please try again shortly.' },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Please check the form and try again.' },
      { status: 422 },
    );
  }

  const { name, email, phone, subject, message, company } = parsed.data;
  if (company) return NextResponse.json({ ok: true });

  // The contact form reuses the Gmail adapter's transport via a synthetic
  // record so there is exactly one place that knows how to send mail.
  const sent = await emailAdapter
    .notifyOwner({
      reference: 'ENQUIRY',
      name,
      email,
      phone: phone || '—',
      whatsapp: phone || '—',
      serviceName: subject,
      categoryName: 'Website enquiry',
      specialistName: '—',
      date: new Date().toISOString().slice(0, 10),
      time: 0,
      duration: 0,
      price: 0,
      deposit: 0,
      depositStatus: 'pending',
      status: 'pending',
      notes: message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categorySlug: 'enquiry',
      serviceSlug: 'enquiry',
      specialistSlug: 'any',
      policiesAccepted: true,
    })
    .catch(() => ({ delivered: false, detail: 'send threw' }));

  if (!sent.delivered) {
    console.warn(
      '[contact] undelivered enquiry from ' +
        escapeHtml(email) +
        ' — ' +
        ('detail' in sent ? sent.detail : '') +
        '. Studio inbox: ' +
        SITE.contact.email,
    );
  }

  // The enquiry is logged either way; never make the visitor retype it.
  return NextResponse.json({ ok: true });
}
