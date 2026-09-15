import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Payment provider webhook.
 *
 * The raw body is read before parsing so the signature can be verified against
 * the exact bytes the provider signed. An unverified webhook must never be
 * allowed to mark a deposit as paid.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('x-paystack-signature');
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.warn('[payments] webhook received but no provider secret is configured.');
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (!signature || !verify(raw, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; status?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Malformed payload' }, { status: 400 });
  }

  if (event.event === 'charge.success' && event.data?.reference) {
    // TODO(persistence): mark this booking's depositStatus as 'paid' and send
    // the studio a paid-confirmation on WhatsApp.
    console.info('[payments] deposit cleared for ' + event.data.reference);
  }

  // Always 200 on a verified event — providers retry aggressively otherwise.
  return NextResponse.json({ received: true });
}

function verify(raw: string, signature: string, secret: string) {
  const expected = createHmac('sha512', secret).update(raw).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
