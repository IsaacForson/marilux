'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

type State = 'idle' | 'loading' | 'done' | 'error';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState('error');
      return;
    }
    setState('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? 'done' : 'error');
      if (res.ok) setEmail('');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="glass rounded-[1.75rem] p-8 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
      <div className="max-w-[46ch]">
        <h2 className="display-sm">The Marilux Letter</h2>
        <p className="mt-3 text-sm leading-relaxed text-ivory/55">
          Seasonal offers, new treatments and early access to Institute cohorts. Sent rarely,
          never shared.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 w-full max-w-md lg:mt-0" noValidate>
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <div className="flex items-center gap-2 rounded-full border border-line-2 bg-ink/40 p-1.5 pl-5 transition-colors duration-500 focus-within:border-accent/60">
          <input
            id="newsletter-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            placeholder="you@example.com"
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === 'error') setState('idle');
            }}
            aria-invalid={state === 'error'}
            aria-describedby="newsletter-status"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:outline-none"
          />
          <button
            type="submit"
            disabled={state === 'loading' || state === 'done'}
            aria-label="Subscribe"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-champagne text-onaccent transition-all duration-500 hover:bg-champagne-light disabled:opacity-60"
          >
            {state === 'done' ? (
              <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            ) : (
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        </div>

        <p
          id="newsletter-status"
          role="status"
          aria-live="polite"
          className="mt-2.5 min-h-[1.25rem] pl-5 text-2xs uppercase tracking-luxe"
        >
          {state === 'done' && <span className="text-accent">Welcome. Check your inbox.</span>}
          {state === 'error' && (
            <span className="text-danger">Please enter a valid email address.</span>
          )}
        </p>
      </form>
    </div>
  );
}
