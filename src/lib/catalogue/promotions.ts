import 'server-only';
import { cache } from 'react';
import { db, dbConfigured, queryOrNull } from '@/lib/store/db';
import { invalidateRead, READ_KEYS, readThrough } from '@/lib/store/readCache';
import type { PublicOffer } from './offers';

/**
 * Discounts, promotions and coupon codes.
 *
 * Two flavours share one table:
 *   - an **automatic promotion** has no code and applies to everything in
 *     its scope (a category-wide 15% off, say);
 *   - a **coupon** has a code the client types at checkout.
 *
 * Every figure the client sees is recomputed on the server before a booking is
 * accepted. The browser is never trusted with a price.
 */

export type Promotion = {
  id: string;
  code: string | null;
  label: string;
  description: string | null;
  kind: 'percent' | 'amount';
  value: number;
  scope: 'all' | 'category' | 'service';
  scopeValue: string | null;
  startsAt: string | null;
  endsAt: string | null;
  maxUses: number | null;
  usedCount: number;
  minSpend: number;
  isActive: boolean;
  createdAt: string;
};

type Row = {
  id: string;
  code: string | null;
  label: string;
  description: string | null;
  kind: 'percent' | 'amount';
  value: number;
  scope: 'all' | 'category' | 'service';
  scope_value: string | null;
  starts_at: Date | null;
  ends_at: Date | null;
  max_uses: number | null;
  used_count: number;
  min_spend: number;
  is_active: boolean;
  created_at: Date;
};

const toPromotion = (r: Row): Promotion => ({
  id: r.id,
  code: r.code,
  label: r.label,
  description: r.description,
  kind: r.kind,
  value: r.value,
  scope: r.scope,
  scopeValue: r.scope_value,
  startsAt: r.starts_at ? new Date(r.starts_at).toISOString() : null,
  endsAt: r.ends_at ? new Date(r.ends_at).toISOString() : null,
  maxUses: r.max_uses,
  usedCount: r.used_count,
  minSpend: r.min_spend,
  isActive: r.is_active,
  createdAt: new Date(r.created_at).toISOString(),
});

export const listPromotions = cache(async (): Promise<Promotion[]> => {
  if (!dbConfigured()) return [];
  const sql = db();
  const rows = await queryOrNull(
    'promotions',
    () =>
      sql<Row[]>`
        select * from public.promotions order by is_active desc, created_at desc`,
  );
  return rows ? rows.map(toPromotion) : [];
});

/** Live automatic promotions — no code required, shown on the site. */
export const activeAutoPromotions = cache(async (): Promise<Promotion[]> => {
  if (!dbConfigured()) return [];

  return readThrough(READ_KEYS.promotionsAuto, [] as Promotion[], async () => {
    const sql = db();
    const rows = await queryOrNull(
      'promotions',
      () =>
        sql<Row[]>`
          select * from public.promotions
          where is_active = true and code is null
          order by created_at desc`,
    );
    return rows ? rows.map(toPromotion).filter((p) => isLive(p)) : null;
  });
});

/** Automatic offers the booking flow can apply as soon as a treatment is chosen. */
export const listActiveOffers = cache(async (): Promise<PublicOffer[]> => {
  return (await activeAutoPromotions()).map((p) => ({
    label: p.label,
    kind: p.kind,
    value: p.value,
    scope: p.scope,
    scopeValue: p.scopeValue,
    minSpend: p.minSpend,
  }));
});

function isLive(p: Promotion, now = new Date()) {
  if (!p.isActive) return false;
  if (p.startsAt && new Date(p.startsAt) > now) return false;
  if (p.endsAt && new Date(p.endsAt) < now) return false;
  if (p.maxUses !== null && p.usedCount >= p.maxUses) return false;
  return true;
}

function inScope(p: Promotion, categorySlug: string, serviceSlug: string) {
  if (p.scope === 'all') return true;
  if (p.scope === 'category') return p.scopeValue === categorySlug;
  return p.scopeValue === categorySlug + '/' + serviceSlug;
}

export type DiscountResult = {
  /** The amount taken off, in whole Ghana Cedis. */
  amount: number;
  finalPrice: number;
  promotion: Promotion | null;
  /** Populated when a typed code could not be used. */
  error?: string;
  /** Present when a typed code was valid, even if an automatic offer won. */
  coupon?: { code: string; label: string; amount: number } | null;
};

/**
 * Work out the discount for one booking.
 *
 * A typed coupon and an automatic promotion never stack — the client gets
 * whichever is worth more, which is what they would expect and avoids a
 * discount the studio did not intend.
 */
export async function calculateDiscount({
  categorySlug,
  serviceSlug,
  price,
  code,
}: {
  categorySlug: string;
  serviceSlug: string;
  price: number;
  code?: string | null;
}): Promise<DiscountResult> {
  const none: DiscountResult = { amount: 0, finalPrice: price, promotion: null };
  if (!dbConfigured()) return none;

  const all = await listPromotions();
  const candidates: Promotion[] = [];

  const auto = all.filter(
    (p) => !p.code && isLive(p) && inScope(p, categorySlug, serviceSlug) && price >= p.minSpend,
  );
  candidates.push(...auto);

  let couponError: string | undefined;
  let validCoupon: Promotion | undefined;
  if (code?.trim()) {
    const wanted = code.trim().toLowerCase();
    const coupon = all.find((p) => p.code?.toLowerCase() === wanted);

    if (!coupon) couponError = 'That code was not recognised.';
    else if (!coupon.isActive) couponError = 'That code is no longer active.';
    else if (coupon.startsAt && new Date(coupon.startsAt) > new Date())
      couponError = 'That code is not active yet.';
    else if (coupon.endsAt && new Date(coupon.endsAt) < new Date())
      couponError = 'That code has expired.';
    else if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
      couponError = 'That code has been fully redeemed.';
    else if (!inScope(coupon, categorySlug, serviceSlug))
      couponError = 'That code does not apply to this treatment.';
    else if (price < coupon.minSpend)
      couponError = 'That code needs a minimum spend of GHS ' + coupon.minSpend + '.';
    else {
      candidates.push(coupon);
      validCoupon = coupon;
    }
  }

  const couponInfo = validCoupon?.code
    ? {
        code: validCoupon.code,
        label: validCoupon.label,
        amount: amountFor(validCoupon, price),
      }
    : null;

  if (candidates.length === 0) return { ...none, error: couponError, coupon: couponInfo };

  const best = candidates
    .map((p) => ({ promotion: p, amount: amountFor(p, price) }))
    .sort((a, b) => b.amount - a.amount)[0];

  const amount = Math.min(best.amount, price);
  return {
    amount,
    finalPrice: price - amount,
    promotion: best.promotion,
    error: couponError,
    coupon: couponInfo,
  };
}

function amountFor(p: Promotion, price: number) {
  return p.kind === 'percent'
    ? Math.round((price * p.value) / 100)
    : Math.min(p.value, price);
}

/** Records a redemption. Called once a booking is actually created. */
export async function redeemPromotion(
  promotionId: string,
  bookingReference: string,
  amount: number,
) {
  if (!dbConfigured()) return;
  try {
    const sql = db();
    await sql.begin(async (tx) => {
      // The unique constraint makes this idempotent: a retried booking write
      // cannot inflate the usage count.
      const inserted = await tx`
        insert into public.promotion_redemptions (promotion_id, booking_reference, amount)
        values (${promotionId}, ${bookingReference}, ${amount})
        on conflict (promotion_id, booking_reference) do nothing
        returning id`;
      if (inserted.length > 0) {
        await tx`
          update public.promotions set used_count = used_count + 1 where id = ${promotionId}`;
      }
    });
  } catch (error) {
    // A booking must never fail because its discount could not be logged.
    console.error('[promotions] redemption failed for ' + bookingReference, error);
  }
}

export async function upsertPromotion(input: {
  id?: string;
  code: string | null;
  label: string;
  description: string | null;
  kind: 'percent' | 'amount';
  value: number;
  scope: 'all' | 'category' | 'service';
  scopeValue: string | null;
  startsAt: string | null;
  endsAt: string | null;
  maxUses: number | null;
  minSpend: number;
  isActive: boolean;
}): Promise<Promotion> {
  const sql = db();
  const code = input.code?.trim() ? input.code.trim().toUpperCase() : null;

  const rows = input.id
    ? await sql<Row[]>`
        update public.promotions set
          code = ${code}, label = ${input.label}, description = ${input.description},
          kind = ${input.kind}, value = ${input.value},
          scope = ${input.scope}, scope_value = ${input.scopeValue},
          starts_at = ${input.startsAt}, ends_at = ${input.endsAt},
          max_uses = ${input.maxUses}, min_spend = ${input.minSpend},
          is_active = ${input.isActive}
        where id = ${input.id}
        returning *`
    : await sql<Row[]>`
        insert into public.promotions
          (code, label, description, kind, value, scope, scope_value,
           starts_at, ends_at, max_uses, min_spend, is_active)
        values
          (${code}, ${input.label}, ${input.description}, ${input.kind}, ${input.value},
           ${input.scope}, ${input.scopeValue}, ${input.startsAt}, ${input.endsAt},
           ${input.maxUses}, ${input.minSpend}, ${input.isActive})
        returning *`;

  if (!rows[0]) throw new Error('Promotion not found.');
  invalidateRead(READ_KEYS.promotionsAuto);
  return toPromotion(rows[0]);
}

export async function deletePromotion(id: string) {
  const sql = db();
  await sql`delete from public.promotions where id = ${id}`;
  invalidateRead(READ_KEYS.promotionsAuto);
}
