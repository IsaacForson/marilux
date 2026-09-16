'use client';

import { formatDuration, formatPrice } from '@/lib/data/services';
import { GHS } from '@/lib/utils';
import { useBooking } from '../BookingContext';
import OptionCard from '../OptionCard';

export default function StepService() {
  const { draft, set, next, catalogue, depositPercent } = useBooking();
  const category = draft.categorySlug
    ? catalogue.find((c) => c.slug === draft.categorySlug)
    : undefined;

  if (!category) {
    return <p className="text-ivory/50">Choose a category first.</p>;
  }

  return (
    <fieldset>
      <legend className="sr-only">Choose a treatment in {category.name}</legend>

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
        {category.services.map((s) => (
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
                <span className="block whitespace-nowrap font-display text-lg text-accent">
                  {formatPrice(s)}
                </span>
                <span className="mt-1 block whitespace-nowrap font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                  {GHS(Math.round((s.price * depositPercent) / 100))} deposit
                </span>
              </span>
            }
            onSelect={(value) => {
              set({ serviceSlug: value });
              window.setTimeout(next, 220);
            }}
          />
        ))}
      </div>
    </fieldset>
  );
}
