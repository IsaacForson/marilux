import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SITE } from '@/lib/data/site';
import { getProvider, configuredProviders } from '@/lib/integrations/payments';
import { clientKey, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  provider: z.string().min(1),
  reference: z.string().min(4).max(40),
  amount: z.number().int().positive().max(5_000_000),
  email: z.string().email(),
  name: z.string().min(2).max(80),
  phone: z.string().min(9).max(20),
  service: z.string().max(120).optional(),
});

/** Starts a deposit payment and hands the client a hosted checkout URL. */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, 'pay'), 8, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ status: 'error', reason: 'Too many attempts.' }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { status: 'error', reason: 'Invalid payment request.' },
      { status: 422 },
    );
  }

  const provider = getProvider(parsed.data.provider);
  if (!provider) {
    return NextResponse.json(
      { status: 'error', reason: 'Unknown payment provider.', configured: configuredProviders() },
      { status: 422 },
    );
  }

  const result = await provider.initialize({
    reference: parsed.data.reference,
    // Providers bill in the minor unit — pesewas for GHS.
    amountMinor: parsed.data.amount * 100,
    currency: 'GHS',
    email: parsed.data.email,
    name: parsed.data.name,
    phone: parsed.data.phone,
    callbackUrl: SITE.url + '/booking/confirm?ref=' + encodeURIComponent(parsed.data.reference),
    metadata: { service: parsed.data.service ?? '', reference: parsed.data.reference },
  });

  if (result.status === 'error') {
    console.error('[payments] initialize failed:', result.reason);
    return NextResponse.json(
      { status: 'error', reason: 'We could not start the payment. Please try again.' },
      { status: 502 },
    );
  }

  return NextResponse.json(result);
}
