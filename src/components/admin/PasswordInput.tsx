'use client';

import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Password field with a reveal toggle.
 *
 * Typing a long passphrase blind is the main reason people pick short, weak
 * passwords — being able to check what you typed is a security feature, not a
 * convenience. The toggle is a button so it is reachable by keyboard, and it
 * announces its state rather than relying on the icon alone.
 */
export default function PasswordInput({
  label,
  hint,
  error,
  required,
  className,
  autoComplete = 'current-password',
  ...props
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  const hintId = hint ? id + '-hint' : undefined;
  const errorId = error ? id + '-error' : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="eyebrow mb-2 block">
          {label}
          {required && (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={cn(
            'w-full rounded-xl border bg-fill px-4 py-3.5 pr-12 text-[0.95rem] text-ivory placeholder:text-ivory/25 transition-colors duration-500 focus:outline-none',
            error ? 'border-danger/70 focus:border-danger' : 'border-line focus:border-accent/60',
          )}
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          // Not in the tab order: it sits between the password field and the
          // submit button, and stopping there on every sign-in is friction.
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          title={visible ? 'Hide password' : 'Show password'}
          className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ivory/35 transition-colors hover:text-accent focus-visible:text-accent"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          )}
        </button>
      </div>

      {hint && !error && (
        <p id={hintId} className="mt-2 text-xs leading-relaxed text-ivory/35">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
