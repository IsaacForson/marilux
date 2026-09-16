import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateDiscount } from '@/lib/catalogue/promotions';
import { resolveServiceForBooking } from '@/lib/catalogue';
import { clientKey, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  categorySlug: z.string().min(1),
  serviceSlug: z.string().min(1),
  code: z.string().trim().max(40).optional(),
});

/**
 * Checks a coupon during checkout.
 *
 * Public, so it is rate limited — otherwise it is an oracle for guessing
 * valid codes. The price comes from the catalogue, never from the caller.
 */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, 'promo'), 12, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Please wait a moment.' },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 422 });
  }

  const resolved = await resolveServiceForBooking(
    parsed.data.categorySlug,
    parsed.data.serviceSlug,
  );
  if (!resolved) {
    return NextResponse.json({ ok: false, error: 'Unknown service.' }, { status: 404 });
  }

  const discount = await calculateDiscount({
    categorySlug: parsed.data.categorySlug,
    serviceSlug: parsed.data.serviceSlug,
    price: resolved.service.price,
    code: parsed.data.code,
  });

  return NextResponse.json({
    ok: !discount.error,
    error: discount.error,
    price: resolved.service.price,
    discount: discount.amount,
    finalPrice: discount.finalPrice,
    label: discount.promotion?.label ?? null,
    code: discount.promotion?.code ?? null,
  });
}
