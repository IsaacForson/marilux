'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STEPS, isStepComplete, useBooking } from './BookingContext';

export default function ProgressRail() {
  const { step, furthest, goTo, draft, resolved } = useBooking();
  const accent = resolved.category?.mood.accent ?? '#D9BC8C';

  return (
    <nav aria-label="Booking progress">
      {/* Desktop: a vertical ladder that doubles as navigation. */}
      <ol className="hidden lg:block">
        {STEPS.map((s, i) => {
          const done = i < step && isStepComplete(s.id, draft);
          const current = i === step;
          const reachable = i <= furthest;

          return (
            <li key={s.id} className="relative pb-7 last:pb-0">
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-[0.6875rem] top-6 h-full w-px transition-colors duration-700',
                    done ? 'bg-accent/45' : 'bg-fill-2',
                  )}
                />
              )}

              <button
                type="button"
                onClick={() => reachable && goTo(i)}
                disabled={!reachable}
                aria-current={current ? 'step' : undefined}
                className="group relative flex items-center gap-4 text-left disabled:cursor-not-allowed"
              >
                <span
                  className={cn(
                    'relative z-10 grid h-[1.375rem] w-[1.375rem] shrink-0 place-items-center rounded-full border text-[0.6rem] transition-all duration-500 ease-luxe',
                    done
                      ? 'border-transparent text-onaccent'
                      : current
                        ? 'border-accent text-accent'
                        : 'border-line-2 text-ivory/30',
                  )}
                  style={done ? { backgroundColor: accent } : undefined}
                >
                  {done ? (
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  ) : (
                    i + 1
                  )}
                </span>

                <span
                  className={cn(
                    'font-sans text-2xs uppercase tracking-luxe transition-colors duration-500',
                    current
                      ? 'text-accent'
                      : done
                        ? 'text-ivory/60 group-hover:text-ivory'
                        : 'text-ivory/25',
                  )}
                >
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Mobile: a compact counter plus a progress bar. */}
      <div className="lg:hidden">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="font-sans text-2xs uppercase tracking-luxe text-accent">
            {STEPS[step].label}
          </p>
          <p className="font-sans text-2xs uppercase tracking-luxe text-ivory/35">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>
        <div
          className="h-px w-full overflow-hidden bg-fill-2"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label="Booking progress"
        >
          <span
            className="block h-full origin-left transition-transform duration-700 ease-luxe"
            style={{
              backgroundColor: accent,
              transform: 'scaleX(' + (step + 1) / STEPS.length + ')',
              width: '100%',
            }}
          />
        </div>
      </div>
    </nav>
  );
}
