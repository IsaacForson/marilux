'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The single selectable surface used across every choice step.
 *
 * Rendered as a real radio input so a keyboard user can arrow through options
 * and a screen reader announces the group, the selection and the count.
 */
export default function OptionCard({
  name,
  value,
  checked,
  onSelect,
  title,
  meta,
  description,
  trailing,
  accent = '#D9BC8C',
  index,
  className,
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: (value: string) => void;
  title: string;
  meta?: string;
  description?: string;
  trailing?: React.ReactNode;
  accent?: string;
  index?: number;
  className?: string;
}) {
  return (
    <label
      className={cn(
        'group relative block cursor-pointer overflow-hidden rounded-2xl border p-5 transition-all duration-500 ease-luxe sm:p-6',
        checked
          ? 'border-accent/70 bg-accent/[0.07]'
          : 'border-line bg-fill hover:border-line-3 hover:bg-fill-2',
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="peer sr-only"
      />

      {/* Selection wash in the category's own colour. */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 transition-opacity duration-700',
          checked ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          background:
            'radial-gradient(120% 100% at 0% 0%, ' + accent + '1f 0%, transparent 62%)',
        }}
      />

      <span className="relative flex items-start justify-between gap-4">
        <span className="min-w-0 flex-1">
          {meta && (
            <span
              className="mb-2 block font-sans text-2xs uppercase tracking-luxe"
              style={{ color: checked ? accent : undefined }}
            >
              <span className={checked ? '' : 'text-ivory/35'}>{meta}</span>
            </span>
          )}

          <span className="block font-display text-lg font-light leading-snug text-ivory sm:text-xl">
            {typeof index === 'number' && (
              <span className="mr-2.5 font-sans text-2xs tracking-luxe text-ivory/25">
                {String(index + 1).padStart(2, '0')}
              </span>
            )}
            {title}
          </span>

          {description && (
            <span className="mt-2 block max-w-[52ch] text-sm leading-relaxed text-ivory/45">
              {description}
            </span>
          )}
        </span>

        <span className="flex shrink-0 flex-col items-end gap-3">
          {trailing}
          <span
            aria-hidden="true"
            className={cn(
              'grid h-6 w-6 place-items-center rounded-full border transition-all duration-500',
              checked
                ? 'border-accent bg-champagne text-onaccent'
                : 'border-line-3 text-transparent group-hover:border-line-3',
            )}
          >
            <Check className="h-3 w-3" strokeWidth={2.5} />
          </span>
        </span>
      </span>
    </label>
  );
}
