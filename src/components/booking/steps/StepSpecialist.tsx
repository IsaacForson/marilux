'use client';

import { specialistsFor } from '@/lib/data/team';
import { useBooking } from '../BookingContext';
import OptionCard from '../OptionCard';

export default function StepSpecialist() {
  const { draft, set, next, resolved } = useBooking();
  const options = specialistsFor(draft.categorySlug);
  const accent = resolved.category?.mood.accent;

  return (
    <fieldset>
      <legend className="sr-only">Choose a specialist — optional</legend>

      <div className="grid gap-3">
        <OptionCard
          name="specialist"
          value="any"
          checked={draft.specialistSlug === 'any' || !draft.specialistSlug}
          accent={accent}
          meta="Recommended"
          title="First available specialist"
          description="We will match you with the artist best suited to your treatment, and you will see more available times."
          onSelect={(value) => {
            set({ specialistSlug: value });
            window.setTimeout(next, 220);
          }}
        />

        {options.map((s) => (
          <OptionCard
            key={s.slug}
            name="specialist"
            value={s.slug}
            checked={draft.specialistSlug === s.slug}
            accent={accent}
            meta={s.role + ' · ' + s.years + ' years'}
            title={s.name}
            description={s.bio}
            trailing={
              <span className="whitespace-nowrap font-sans text-2xs uppercase tracking-luxe text-ivory/35">
                {s.signature}
              </span>
            }
            onSelect={(value) => {
              set({ specialistSlug: value });
              window.setTimeout(next, 220);
            }}
          />
        ))}
      </div>
    </fieldset>
  );
}
