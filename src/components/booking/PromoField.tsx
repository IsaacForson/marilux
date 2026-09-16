'use client';

import { useState } from 'react';
import { Check, Loader2, Tag, X } from 'lucide-react';
import { useBooking } from './BookingContext';
import { GHS } from '@/lib/utils';

/**
 * Coupon entry.
 *
 * Automatic studio offers apply on their own and are not removed from here.
 * The server recalculates the winning discount when the booking is submitted.
 */
export default function PromoField() {
  const { draft, set, resolved, discount, coupon, setCoupon } = useBooking();
  const [code, setCode] = useState(draft.promoCode ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    if (!code.trim() || !draft.categorySlug || !draft.serviceSlug) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categorySlug: draft.categorySlug,
          serviceSlug: draft.serviceSlug,
          code: code.trim(),
        }),
      });
      const data = await res.json();

      if (!data.ok || !data.code) {
        setError(data.error || 'That code could not be applied.');
        setCoupon(null);
        set({ promoCode: undefined });
        return;
      }

      setCoupon({
        code: data.code,
        label: data.label,
        amount: data.discount,
        source: 'coupon',
      });
      set({ promoCode: data.code });
    } catch {
      setError('Could not check that code. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    setCode('');
    setCoupon(null);
    set({ promoCode: undefined });
    setError(null);
  }

  if (!resolved.service) return null;

  const studioOffer = discount?.source === 'auto' ? discount : null;

  return (
    <div className="mt-4 rounded-2xl border border-line p-5 sm:p-6">
      {studioOffer && (
        <p className="mb-4 flex items-start gap-2.5 text-sm text-success">
          <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span>
            <span className="font-medium">{studioOffer.label}</span> is already on this
            treatment — {GHS(studioOffer.amount)} off. Deposit and balance use the new total.
          </span>
        </p>
      )}

      <p className="eyebrow mb-3 flex items-center gap-2">
        <Tag className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} aria-hidden="true" />
        Promotion code
      </p>

      {coupon ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2.5 text-sm text-success">
            <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            <span>
              <span className="font-medium">{coupon.label}</span> applied —{' '}
              {GHS(coupon.amount)} off
              {discount?.source === 'auto'
                ? '. The studio offer currently saves more, so that is what we are using.'
                : ''}
            </span>
          </p>
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1.5 font-sans text-2xs uppercase tracking-luxe text-ivory/45 transition-colors hover:text-danger"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            Remove
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <label htmlFor="promo" className="sr-only">
              Promotion code
            </label>
            <input
              id="promo"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  apply();
                }
              }}
              placeholder="Enter a code"
              autoComplete="off"
              className="w-full rounded-xl border border-line bg-fill px-4 py-3 text-sm uppercase tracking-luxe text-ivory placeholder:normal-case placeholder:tracking-normal placeholder:text-ivory/30 transition-colors focus:border-accent/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={apply}
              disabled={busy || !code.trim()}
              className="shrink-0 rounded-xl border border-line-2 px-5 font-sans text-2xs uppercase tracking-luxe text-ivory/60 transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-40"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                'Apply'
              )}
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-2.5 text-xs text-danger">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
