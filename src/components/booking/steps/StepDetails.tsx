'use client';

import { Copy } from 'lucide-react';
import { useBooking } from '../BookingContext';
import Field from '../Field';

export default function StepDetails() {
  const { draft, set, errors } = useBooking();

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Full name" required error={errors.name} className="sm:col-span-2">
        {(props) => (
          <input
            {...props}
            type="text"
            autoComplete="name"
            placeholder="Ama Owusu"
            value={draft.name ?? ''}
            onChange={(e) => set({ name: e.target.value })}
          />
        )}
      </Field>

      <Field
        label="Phone number"
        required
        error={errors.phone}
        hint="We call only if something changes on the day."
      >
        {(props) => (
          <input
            {...props}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0545489200"
            value={draft.phone ?? ''}
            onChange={(e) => set({ phone: e.target.value })}
          />
        )}
      </Field>

      <Field label="WhatsApp number" required error={errors.whatsapp}>
        {(props) => (
          <div className="relative">
            <input
              {...props}
              type="tel"
              inputMode="tel"
              placeholder="0545489200"
              value={draft.whatsapp ?? ''}
              onChange={(e) => set({ whatsapp: e.target.value })}
              className={props.className + ' pr-32'}
            />
            <button
              type="button"
              onClick={() => set({ whatsapp: draft.phone ?? '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-white/12 px-3 py-2 font-sans text-2xs uppercase tracking-luxe text-ivory/50 transition-colors duration-500 hover:border-champagne/50 hover:text-champagne"
            >
              <Copy className="mr-1.5 inline h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
              Same
            </button>
          </div>
        )}
      </Field>

      <Field
        label="Email address"
        required
        error={errors.email}
        hint="Your confirmation and reminder are sent here."
        className="sm:col-span-2"
      >
        {(props) => (
          <input
            {...props}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={draft.email ?? ''}
            onChange={(e) => set({ email: e.target.value })}
          />
        )}
      </Field>

      {/* Honeypot — invisible to people, irresistible to bots. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={draft.company ?? ''}
          onChange={(e) => set({ company: e.target.value })}
        />
      </div>

      <p className="text-xs leading-relaxed text-ivory/35 sm:col-span-2">
        Your details are used to manage this appointment and nothing else. We never sell or share
        them.
      </p>
    </div>
  );
}
