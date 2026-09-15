'use client';

import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { getAvailability } from '@/lib/booking/availability';
import { formatDuration } from '@/lib/data/services';
import { cn, formatTime } from '@/lib/utils';
import { useBooking } from '../BookingContext';

export default function StepTime() {
  const { draft, set, next, resolved } = useBooking();
  const accent = resolved.category?.mood.accent ?? '#D9BC8C';
  const duration = resolved.service?.duration ?? 60;

  const slots = useMemo(
    () =>
      draft.date ? getAvailability(draft.date, duration, draft.specialistSlug ?? 'any') : [],
    [draft.date, duration, draft.specialistSlug],
  );

  const grouped = useMemo(
    () => ({
      Morning: slots.filter((s) => s.minutes < 12 * 60),
      Afternoon: slots.filter((s) => s.minutes >= 12 * 60 && s.minutes < 17 * 60),
      Evening: slots.filter((s) => s.minutes >= 17 * 60),
    }),
    [slots],
  );

  const openCount = slots.filter((s) => s.available).length;

  if (!draft.date) return <p className="text-ivory/50">Choose a date first.</p>;

  return (
    <div>
      <p className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-2xs uppercase tracking-luxe text-ivory/40">
        <Clock className="h-3.5 w-3.5 text-champagne" strokeWidth={1.5} aria-hidden="true" />
        <span>{formatDuration(duration)} appointment</span>
        <span className="text-ivory/20" aria-hidden="true">
          /
        </span>
        <span aria-live="polite">
          {openCount} {openCount === 1 ? 'time' : 'times'} available
        </span>
      </p>

      {openCount === 0 && (
        <div className="rounded-2xl border border-white/[0.09] bg-white/[0.015] p-7 text-center">
          <p className="font-display text-xl font-light text-ivory">
            Nothing left on this day.
          </p>
          <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-ivory/50">
            Choose another date, or select &ldquo;first available specialist&rdquo; to open up
            more times.
          </p>
        </div>
      )}

      <div className="space-y-9">
        {Object.entries(grouped).map(([label, group]) =>
          group.length === 0 ? null : (
            <fieldset key={label}>
              <legend className="eyebrow mb-4">{label}</legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                {group.map((slot) => {
                  const selected = draft.time === slot.minutes;
                  return (
                    <button
                      key={slot.minutes}
                      type="button"
                      disabled={!slot.available}
                      aria-pressed={selected}
                      onClick={() => {
                        set({ time: slot.minutes });
                        window.setTimeout(next, 240);
                      }}
                      className={cn(
                        'rounded-xl border py-3.5 text-sm tabular-nums transition-all duration-400 ease-luxe',
                        !slot.available
                          ? 'cursor-not-allowed border-white/[0.04] text-ivory/15 line-through'
                          : selected
                            ? 'border-transparent font-medium text-ink'
                            : 'border-white/[0.09] text-ivory/75 hover:border-champagne/50 hover:text-champagne',
                      )}
                      style={selected ? { backgroundColor: accent } : undefined}
                    >
                      {formatTime(slot.minutes)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ),
        )}
      </div>
    </div>
  );
}
