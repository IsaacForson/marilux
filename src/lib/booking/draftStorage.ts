import type { BookingDraft } from '@/lib/booking/types';
import type { AppliedDiscount } from '@/lib/catalogue/offers';

const KEY = 'marilux:booking-draft';

export type BookingSession = {
  v: 1;
  draft: BookingDraft;
  step: number;
  furthest: number;
  coupon: AppliedDiscount | null;
};

export function loadBookingSession(): BookingSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BookingSession>;
    if (parsed?.v !== 1 || !parsed.draft || typeof parsed.draft !== 'object') return null;
    return {
      v: 1,
      draft: parsed.draft,
      step: typeof parsed.step === 'number' ? parsed.step : 0,
      furthest: typeof parsed.furthest === 'number' ? parsed.furthest : 0,
      coupon: isCoupon(parsed.coupon) ? parsed.coupon : null,
    };
  } catch {
    return null;
  }
}

export function saveBookingSession(session: Omit<BookingSession, 'v'>) {
  if (typeof window === 'undefined') return;
  try {
    const payload: BookingSession = { v: 1, ...session };
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* Private mode or a full store — the form still works for this visit. */
  }
}

export function clearBookingSession() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function bookingHasProgress(draft: BookingDraft, step: number) {
  return Boolean(
    step > 0 ||
      draft.categorySlug ||
      draft.serviceSlug ||
      (draft.specialistSlug && draft.specialistSlug !== 'any') ||
      draft.date ||
      typeof draft.time === 'number' ||
      draft.name?.trim() ||
      draft.phone?.trim() ||
      draft.whatsapp?.trim() ||
      draft.email?.trim() ||
      draft.notes?.trim() ||
      draft.promoCode ||
      draft.policiesAccepted,
  );
}

function isCoupon(value: unknown): value is AppliedDiscount {
  if (!value || typeof value !== 'object') return false;
  const coupon = value as AppliedDiscount;
  return (
    typeof coupon.label === 'string' &&
    typeof coupon.amount === 'number' &&
    coupon.source === 'coupon'
  );
}
