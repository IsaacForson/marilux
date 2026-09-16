'use client';

import { categoryOffer, offerHeadline } from '@/lib/catalogue/offers';
import { useBooking } from '../BookingContext';
import OptionCard from '../OptionCard';

export default function StepCategory() {
  const { draft, set, next, catalogue, offers } = useBooking();

  return (
    <fieldset>
      <legend className="sr-only">Choose a service category</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {catalogue.map((c, i) => {
          const offer = categoryOffer(offers, c.slug);
          return (
            <OptionCard
              key={c.slug}
              name="category"
              value={c.slug}
              index={i}
              checked={draft.categorySlug === c.slug}
              accent={c.mood.accent}
              meta={c.tagline}
              title={c.name}
              description={c.summary}
              trailing={
                <span className="text-right">
                  {offer && (
                    <span className="mb-1.5 block font-sans text-2xs uppercase tracking-luxe text-success">
                      {offerHeadline(offer)}
                    </span>
                  )}
                  <span className="font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                    {c.services.length} options
                  </span>
                </span>
              }
              onSelect={(value) => {
                set({ categorySlug: value });
                window.setTimeout(next, 220);
              }}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
