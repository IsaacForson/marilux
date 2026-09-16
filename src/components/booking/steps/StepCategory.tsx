'use client';

import { useBooking } from '../BookingContext';
import OptionCard from '../OptionCard';

export default function StepCategory() {
  const { draft, set, next, catalogue } = useBooking();

  return (
    <fieldset>
      <legend className="sr-only">Choose a service category</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {catalogue.map((c, i) => (
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
              <span className="font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                {c.services.length} options
              </span>
            }
            onSelect={(value) => {
              set({ categorySlug: value });
              // Advance on selection: one tap per step is the whole point.
              window.setTimeout(next, 220);
            }}
          />
        ))}
      </div>
    </fieldset>
  );
}
