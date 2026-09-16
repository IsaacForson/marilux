/**
 * Studio offers that apply without a coupon code.
 *
 * Kept free of server-only imports so the booking flow can price a treatment
 * the moment it is selected. The booking API still recomputes the discount
 * before anything is charged.
 */

export type PublicOffer = {
  label: string;
  kind: 'percent' | 'amount';
  value: number;
  scope: 'all' | 'category' | 'service';
  scopeValue: string | null;
  minSpend: number;
};

export type AppliedDiscount = {
  label: string;
  amount: number;
  code: string | null;
  source: 'auto' | 'coupon';
};

export function offerAmount(offer: PublicOffer, price: number) {
  if (price < offer.minSpend) return 0;
  const raw =
    offer.kind === 'percent'
      ? Math.round((price * offer.value) / 100)
      : Math.min(offer.value, price);
  return Math.min(raw, price);
}

export function offerApplies(
  offer: PublicOffer,
  categorySlug: string,
  serviceSlug: string,
) {
  if (offer.scope === 'all') return true;
  if (offer.scope === 'category') return offer.scopeValue === categorySlug;
  return offer.scopeValue === categorySlug + '/' + serviceSlug;
}

export function offerHeadline(offer: PublicOffer) {
  return offer.kind === 'percent' ? offer.value + '% off' : 'GHS ' + offer.value + ' off';
}

export function autoDiscount(
  offers: PublicOffer[],
  categorySlug: string,
  serviceSlug: string,
  price: number,
): AppliedDiscount | null {
  let best: AppliedDiscount | null = null;
  for (const offer of offers) {
    if (!offerApplies(offer, categorySlug, serviceSlug)) continue;
    const amount = offerAmount(offer, price);
    if (amount <= 0) continue;
    if (!best || amount > best.amount) {
      best = { label: offer.label, amount, code: null, source: 'auto' };
    }
  }
  return best;
}

/** A coupon and an automatic offer never stack — the guest gets the better one. */
export function pickDiscount(
  auto: AppliedDiscount | null,
  coupon: AppliedDiscount | null,
): AppliedDiscount | null {
  if (!auto) return coupon;
  if (!coupon) return auto;
  return coupon.amount >= auto.amount ? coupon : auto;
}

/** Best site-wide or category-wide offer, for badges on the category step. */
export function categoryOffer(
  offers: PublicOffer[],
  categorySlug: string,
): PublicOffer | null {
  let best: { offer: PublicOffer; amount: number } | null = null;
  for (const offer of offers) {
    if (offer.scope === 'service') continue;
    if (offer.scope === 'category' && offer.scopeValue !== categorySlug) continue;
    const amount = offerAmount(offer, 1000);
    if (amount <= 0) continue;
    if (!best || amount > best.amount) best = { offer, amount };
  }
  return best?.offer ?? null;
}
