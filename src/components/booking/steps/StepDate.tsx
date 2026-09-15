'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SITE } from '@/lib/data/site';
import { isSelectableDate } from '@/lib/booking/availability';
import { cn, toISODate } from '@/lib/utils';
import { useBooking } from '../BookingContext';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StepDate() {
  const { draft, set, next, resolved } = useBooking();
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const accent = resolved.category?.mood.accent ?? '#D9BC8C';

  const grid = useMemo(() => buildMonth(cursor), [cursor]);

  const monthLabel = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(cursor);

  const canGoBack = cursor > new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1);
  const canGoForward = cursor < maxMonth;

  return (
    <div>
      <div className="rounded-2xl border border-line bg-fill p-5 sm:p-7">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCursor(shiftMonth(cursor, -1))}
            disabled={!canGoBack}
            aria-label="Previous month"
            className="grid h-10 w-10 place-items-center rounded-full border border-line-2 text-ivory/70 transition-colors duration-500 hover:border-accent/60 hover:text-accent disabled:pointer-events-none disabled:opacity-25"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>

          <p aria-live="polite" className="font-display text-xl font-light text-ivory">
            {monthLabel}
          </p>

          <button
            type="button"
            onClick={() => setCursor(shiftMonth(cursor, 1))}
            disabled={!canGoForward}
            aria-label="Next month"
            className="grid h-10 w-10 place-items-center rounded-full border border-line-2 text-ivory/70 transition-colors duration-500 hover:border-accent/60 hover:text-accent disabled:pointer-events-none disabled:opacity-25"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <div
          className="mb-2 grid grid-cols-7 gap-1"
          aria-hidden="true"
        >
          {WEEKDAYS.map((d) => (
            <span
              key={d}
              className="py-2 text-center font-sans text-2xs uppercase tracking-luxe text-ivory/30"
            >
              {d.charAt(0)}
            </span>
          ))}
        </div>

        <div role="group" aria-label="Choose a date" className="grid grid-cols-7 gap-1">
          {grid.map((cell, i) => {
            if (!cell) return <span key={'pad' + i} />;

            const iso = toISODate(cell);
            const selected = draft.date === iso;
            const selectable = isSelectableDate(cell);
            const closed = !SITE.openingHours[cell.getDay()];
            const isToday = toISODate(today) === iso;
            const disabled = !selectable || closed;

            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                aria-label={new Intl.DateTimeFormat('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                }).format(cell)}
                onClick={() => {
                  set({ date: iso });
                  window.setTimeout(next, 240);
                }}
                className={cn(
                  'relative grid aspect-square place-items-center rounded-xl border text-sm transition-all duration-400 ease-luxe',
                  disabled
                    ? 'cursor-not-allowed border-transparent text-ivory/15'
                    : selected
                      ? 'border-transparent font-medium text-onaccent'
                      : 'border-line text-ivory/75 hover:border-accent/50 hover:text-accent',
                )}
                style={selected ? { backgroundColor: accent } : undefined}
              >
                {cell.getDate()}
                {isToday && !selected && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1.5 h-1 w-1 rounded-full bg-champagne"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <dl className="mt-6 grid gap-2 sm:grid-cols-2">
        {SITE.hours.map((h) => (
          <div
            key={h.days}
            className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm"
          >
            <dt className="text-ivory/45">{h.days}</dt>
            <dd className="text-ivory/75">
              {h.open} – {h.close}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-ivory/35">
        Same-day bookings close two hours ahead so we can prepare your room properly. For anything
        sooner, message us on WhatsApp and we will do our best.
      </p>
    </div>
  );
}

function shiftMonth(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/** Month grid padded to a Monday start. */
function buildMonth(cursor: Date): Array<Date | null> {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingPad = (first.getDay() + 6) % 7;

  return [
    ...Array.from({ length: leadingPad }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
}
