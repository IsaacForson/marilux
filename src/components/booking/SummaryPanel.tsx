'use client';

import { formatDuration, formatPrice } from '@/lib/data/services';
import { formatTime, GHS } from '@/lib/utils';
import { useBooking } from './BookingContext';

/** Running order, always visible so the guest never loses the thread. */
export default function SummaryPanel() {
  const { draft, resolved } = useBooking();
  const { service, category } = resolved;

  if (!category) {
    return (
      <div className="glass rounded-2xl p-6">
        <p className="eyebrow mb-3">Your appointment</p>
        <p className="text-sm leading-relaxed text-ivory/45">
          Choose a category to begin. You can change anything before you confirm.
        </p>
      </div>
    );
  }

  const rows = [
    { label: 'Category', value: category.name },
    { label: 'Treatment', value: service?.name },
    { label: 'Specialist', value: resolved.specialistName },
    { label: 'Date', value: draft.date ? shortDate(draft.date) : undefined },
    { label: 'Time', value: typeof draft.time === 'number' ? formatTime(draft.time) : undefined },
    { label: 'Duration', value: service ? formatDuration(service.duration) : undefined },
  ].filter((r) => r.value);

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div
        className="h-1"
        style={{ background: 'linear-gradient(90deg,' + category.mood.accent + ', transparent)' }}
        aria-hidden="true"
      />
      <div className="p-6">
        <p className="eyebrow mb-5">Your appointment</p>

        <dl className="space-y-3.5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-4">
              <dt className="font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                {r.label}
              </dt>
              <dd className="min-w-0 flex-1 text-right text-sm text-ivory/85">{r.value}</dd>
            </div>
          ))}
        </dl>

        {service && (
          <div className="mt-6 space-y-3 border-t border-line pt-5">
            <div className="flex items-baseline justify-between">
              <span className="font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                Total
              </span>
              <span className="font-display text-lg text-ivory">{formatPrice(service)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-sans text-2xs uppercase tracking-luxe text-accent">
                Deposit now
              </span>
              <span className="font-display text-xl text-accent">
                {GHS(resolved.deposit)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function shortDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(y, m - 1, d));
}
