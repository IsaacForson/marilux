'use client';

import { useId } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const inputClass =
  'w-full rounded-xl border border-line bg-fill px-4 py-3 text-sm text-ivory placeholder:text-ivory/30 transition-colors focus:border-accent/60 focus:outline-none disabled:opacity-50';

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="eyebrow mb-2 block">
      {children}
    </label>
  );
}

/**
 * Helper text, rendered *below* its field.
 *
 * Above the input it reads as part of the label and pushes the control away
 * from its own name; below, it reads as guidance about what you just typed.
 */
function Hint({ id, children }: { id?: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2 text-xs leading-relaxed text-ivory/35">
      {children}
    </p>
  );
}

export function TextInput({
  label,
  hint,
  className,
  ...props
}: { label?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const hintId = hint ? id + '-hint' : undefined;
  return (
    <div className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <input id={id} aria-describedby={hintId} {...props} className={inputClass} />
      <Hint id={hintId}>{hint}</Hint>
    </div>
  );
}

export function TextArea({
  label,
  hint,
  className,
  ...props
}: { label?: string; hint?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const hintId = hint ? id + '-hint' : undefined;
  return (
    <div className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <textarea
        id={id}
        aria-describedby={hintId}
        {...props}
        className={cn(inputClass, 'resize-y leading-relaxed')}
      />
      <Hint id={hintId}>{hint}</Hint>
    </div>
  );
}

export function Select({
  label,
  hint,
  className,
  children,
  ...props
}: { label?: string; hint?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  const hintId = hint ? id + '-hint' : undefined;
  return (
    <div className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <select
        id={id}
        aria-describedby={hintId}
        {...props}
        className={cn(inputClass, 'appearance-none bg-ink-800')}
      >
        {children}
      </select>
      <Hint id={hintId}>{hint}</Hint>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-colors',
        checked ? 'border-accent/45 bg-accent/[0.05]' : 'border-line hover:border-line-2',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors',
          checked ? 'border-champagne bg-champagne text-onaccent' : 'border-line-3 text-transparent',
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span>
        <span className="block text-sm text-ivory">{label}</span>
        {hint && <span className="mt-1 block text-xs leading-relaxed text-ivory/40">{hint}</span>}
      </span>
    </label>
  );
}

/**
 * An editable list of short strings — the owner's email addresses, or phone
 * numbers. Rendered as real inputs rather than a comma-separated field, so
 * removing the middle entry is a click and not a text edit.
 */
export function ListInput({
  label,
  hint,
  values,
  onChange,
  placeholder,
  type = 'text',
  addLabel = 'Add another',
  max = 5,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  type?: string;
  addLabel?: string;
  max?: number;
}) {
  const rows = values.length ? values : [''];

  const update = (index: number, value: string) => {
    const next = [...rows];
    next[index] = value;
    onChange(next);
  };

  const remove = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    onChange(next.length ? next : ['']);
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="space-y-2">
        {rows.map((value, i) => (
          <div key={i} className="flex gap-2">
            <input
              type={type}
              value={value}
              placeholder={placeholder}
              onChange={(e) => update(i, e.target.value)}
              className={inputClass}
              aria-label={label + ' ' + (i + 1)}
            />
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={'Remove ' + (value || 'entry ' + (i + 1))}
                className="grid h-[3rem] w-[3rem] shrink-0 place-items-center rounded-xl border border-line text-ivory/40 transition-colors hover:border-danger/50 hover:text-danger"
              >
                <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>

      <Hint>{hint}</Hint>

      {rows.length < max && (
        <button
          type="button"
          onClick={() => onChange([...rows, ''])}
          className="mt-2.5 inline-flex items-center gap-2 font-sans text-2xs uppercase tracking-luxe text-ivory/45 transition-colors hover:text-accent"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
          {addLabel}
        </button>
      )}
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
  aside,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line p-6 sm:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-light text-ivory">{title}</h2>
          {description && (
            <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-ivory/45">
              {description}
            </p>
          )}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
