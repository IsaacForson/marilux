import { NextResponse } from 'next/server';
import { bookingSchema, makeReference, type BookingRecord } from '@/lib/booking/types';
import { resolveServiceForBooking } from '@/lib/catalogue';
import { calculateDiscount, redeemPromotion } from '@/lib/catalogue/promotions';
import { getSetting } from '@/lib/settings/store';
import { SPECIALISTS } from '@/lib/data/team';
import { getAvailability, isPastSlot } from '@/lib/booking/availability';
import { notifyAll } from '@/lib/integrations/notify';
import { bookings } from '@/lib/store/bookings';
import { clientKey, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Create a booking.
 *
 * Pricing, duration and specialist names are resolved server-side from the
 * catalogue rather than trusted from the request body — a client could
 * otherwise submit its own deposit figure.
 */
/** Do two appointments on the same day collide? */
function overlaps(aStart: number, aMins: number, bStart: number, bMins: number) {
  return aStart < bStart + bMins && bStart < aStart + aMins;
}

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, 'booking'), 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter ?? 60) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Some details need attention.',
        issues: parsed.error.issues.map((i) => ({
          field: String(i.path[0] ?? ''),
          message: i.message,
        })),
      },
      { status: 422 },
    );
  }

  const input = parsed.data;

  // Silently accept honeypot hits so bots do not learn they were caught.
  if (input.company) {
    return NextResponse.json({ ok: true, reference: makeReference() });
  }

  // Resolved from the live catalogue, which includes any price the studio has
  // changed. Never from the request body — a client could otherwise name its
  // own price.
  const resolved = await resolveServiceForBooking(input.categorySlug, input.serviceSlug);
  if (!resolved) {
    return NextResponse.json(
      { ok: false, error: 'That service is no longer available.' },
      { status: 422 },
    );
  }
  const { category, service } = resolved;

  const bookingSettings = await getSetting('booking');
  if (!bookingSettings.bookingOpen) {
    return NextResponse.json(
      { ok: false, error: bookingSettings.closedMessage },
      { status: 503 },
    );
  }

  const specialist =
    input.specialistSlug === 'any'
      ? { name: 'First available specialist' }
      : SPECIALISTS.find((s) => s.slug === input.specialistSlug);
  if (!specialist) {
    return NextResponse.json(
      { ok: false, error: 'That specialist is not available.' },
      { status: 422 },
    );
  }

  // Re-check the slot: the grid the client saw may be minutes out of date.
  const slot = getAvailability(input.date, service.duration, input.specialistSlug).find(
    (s) => s.minutes === input.time,
  );
  if (!slot || !slot.available || isPastSlot(input.date, input.time)) {
    return NextResponse.json(
      { ok: false, error: 'That time has just been taken. Please choose another.' },
      { status: 409 },
    );
  }

  // Double-booking guard: the availability grid is advisory, the store is
  // authoritative. Two guests submitting the same slot seconds apart must not
  // both succeed.
  const sameDay = await bookings.activeOn(input.date);
  const clash = sameDay.find(
    (b) =>
      b.specialistSlug === input.specialistSlug &&
      input.specialistSlug !== 'any' &&
      overlaps(b.time, b.duration, input.time, service.duration),
  );
  if (clash) {
    return NextResponse.json(
      { ok: false, error: 'That time has just been taken. Please choose another.' },
      { status: 409 },
    );
  }

  // Discounts are recalculated here too. The figure the browser displayed is
  // advisory; this one is what the client is actually charged.
  const discount = await calculateDiscount({
    categorySlug: category.slug,
    serviceSlug: service.slug,
    price: service.price,
    code: input.promoCode,
  });

  const finalPrice = discount.finalPrice;
  const depositPercent = bookingSettings.depositPercent;
  const deposit = Math.round((finalPrice * depositPercent) / 100);

  const now = new Date().toISOString();
  const record: BookingRecord = {
    ...input,
    reference: makeReference(),
    serviceName: service.name,
    categoryName: category.name,
    specialistName: specialist.name,
    duration: service.duration,
    price: finalPrice,
    originalPrice: discount.amount > 0 ? service.price : undefined,
    discountAmount: discount.amount,
    promoCode: discount.promotion?.code ?? undefined,
    deposit,
    depositStatus: 'pending',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  // Persist first: a booking the studio cannot see is worse than one that was
  // not announced, and notification failures must not lose the record.
  try {
    await bookings.create(record);
  } catch (error) {
    console.error('[booking] could not persist ' + record.reference, error);
    return NextResponse.json(
      { ok: false, error: 'We could not save that booking. Please try again.' },
      { status: 500 },
    );
  }

  if (discount.promotion) {
    await redeemPromotion(discount.promotion.id, record.reference, discount.amount);
  }

  const deliveries = await notifyAll(record);
  if (deliveries.some((d) => d.channel === 'email' && d.target === 'customer' && d.delivered)) {
    await bookings.update(record.reference, { confirmationSentAt: new Date().toISOString() });
  }

  const failures = deliveries.filter((d) => !d.delivered);
  if (failures.length) {
    console.warn(
      '[booking] ' +
        record.reference +
        ' — undelivered: ' +
        failures.map((f) => f.channel + '/' + f.target + ' (' + f.detail + ')').join('; '),
    );
  }

  return NextResponse.json({
    ok: true,
    reference: record.reference,
    deposit: record.deposit,
    price: record.price,
    originalPrice: record.originalPrice,
    discount: record.discountAmount,
    promoCode: record.promoCode,
    promoLabel: discount.promotion?.label,
    // Channel status only, never the failure detail — that is for our logs.
    delivery: deliveries.map(({ channel, target, delivered }) => ({
      channel,
      target,
      delivered,
    })),
  });
}
