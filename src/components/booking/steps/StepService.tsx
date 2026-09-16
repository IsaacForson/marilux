'use client';

import { formatDuration, formatPrice } from '@/lib/data/services';
import { autoDiscount, categoryOffer, offerHeadline } from '@/lib/catalogue/offers';
import { GHS } from '@/lib/utils';
import { useBooking } from '../BookingContext';
import OptionCard from '../OptionCard';

export default function StepService() {
  const { draft, set, next, catalogue, depositPercent, offers } = useBooking();
  const category = draft.categorySlug
    ? catalogue.find((c) => c.slug === draft.categorySlug)
    : undefined;

  if (!category) {
    return <p className="text-ivory/50">Choose a category first.</p>;
  }

  const categoryWide = categoryOffer(offers, category.slug);

  return (
    <fieldset>
      <legend className="sr-only">Choose a treatment in {category.name}</legend>

      {categoryWide && (
        <p className="mb-6 rounded-2xl border border-success/25 bg-success/[0.06] px-5 py-4 text-sm leading-relaxed text-success">
          <span className="font-medium">{categoryWide.label}</span>
          {' — '}
          {offerHeadline(categoryWide)} is applied automatically. Prices below already include
          it.
        </p>
      )}

      <div className="mb-8 rounded-2xl border border-line bg-fill p-6">
        <p className="eyebrow mb-3" style={{ color: category.mood.accent }}>
          The {category.name} ritual
        </p>
        <ol className="grid gap-3 sm:grid-cols-3">
          {category.ritual.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed text-ivory/55">
              <span className="font-sans text-2xs tracking-luxe text-ivory/25">
                {String(i + 1).padStart(2, '0')}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-3">
        {category.services.map((s) => {
          const offer = autoDiscount(offers, category.slug, s.slug, s.price);
          const payable = Math.max(0, s.price - (offer?.amount ?? 0));
          const deposit = Math.round((payable * depositPercent) / 100);
          return (
            <OptionCard
              key={s.slug}
              name="service"
              value={s.slug}
              checked={draft.serviceSlug === s.slug}
              accent={category.mood.accent}
              meta={formatDuration(s.duration) + (s.tags?.length ? ' · ' + s.tags[0] : '')}
              title={s.name}
              description={s.description}
              trailing={
                <span className="text-right">
                  {offer ? (
                    <>
                      <span className="mb-1 block font-sans text-2xs uppercase tracking-luxe text-success">
                        {offer.label}
                      </span>
                      <span className="block whitespace-nowrap font-display text-sm text-ivory/35 line-through">
                        {formatPrice(s)}
                      </span>
                      <span className="block whitespace-nowrap font-display text-lg text-accent">
                        {formatDiscountedPrice(s.priceFrom, payable)}
                      </span>
                    </>
                  ) : (
                    <span className="block whitespace-nowrap font-display text-lg text-accent">
                      {formatPrice(s)}
                    </span>
                  )}
                  <span className="mt-1 block whitespace-nowrap font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                    {GHS(deposit)} deposit
                  </span>
                </span>
              }
              onSelect={(value) => {
                set({ serviceSlug: value });
                window.setTimeout(next, 220);
              }}
            />
          );
        })}
      </div>
    </fieldset>
  );
}

function formatDiscountedPrice(priceFrom: boolean | undefined, payable: number) {
  return priceFrom ? 'from ' + GHS(payable) : GHS(payable);
}
