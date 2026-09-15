'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

export default function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': boolean;
    className: string;
  }) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = hint ? id + '-hint' : undefined;
  const errorId = error ? id + '-error' : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col', className)}>
      <label htmlFor={id} className="eyebrow mb-2.5">
        {label}
        {required && (
          <span className="ml-1 text-rosegold-light" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error),
        className: cn(
          'w-full rounded-xl border bg-white/[0.02] px-4 py-3.5 text-[0.95rem] text-ivory placeholder:text-ivory/25 transition-colors duration-500 focus:outline-none focus:ring-0',
          error
            ? 'border-rosegold/70 focus:border-rosegold'
            : 'border-white/[0.09] focus:border-champagne/60',
        ),
      })}

      {hint && !error && (
        <p id={hintId} className="mt-2 text-xs leading-relaxed text-ivory/35">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-xs text-rosegold-light">
          {error}
        </p>
      )}
    </div>
  );
}
