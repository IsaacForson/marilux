import { NextResponse } from 'next/server';
import { listActiveOffers } from '@/lib/catalogue/promotions';
import { clientKey, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Live automatic studio offers — no coupon required.
 *
 * The booking page uses this when the server render could not load promotions
 * (a pool timeout) so a guest still sees the discounted total before they pay.
 */
export async function GET(req: Request) {
  const limit = rateLimit(clientKey(req, 'offers'), 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, offers: [] }, { status: 429 });
  }

  const offers = await listActiveOffers();
  return NextResponse.json({ ok: true, offers });
}
