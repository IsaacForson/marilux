'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import Field from '@/components/booking/Field';
import { Button } from '@/components/ui/Button';

const SUBJECTS = [
  'General enquiry',
  'Booking help',
  'Bridal or group booking',
  'Institute & training',
  'Careers',
  'Press & collaboration',
];

type State = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
  const [state, setState] = useState<State>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: SUBJECTS[0],
    message: '',
    company: '',
  });

  const update = (patch: Partial<typeof form>) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors({});
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.message.trim().length < 5) next.message = 'Tell us a little more';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('failed');
      setState('sent');
      setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '', company: '' });
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="glass rounded-[1.75rem] p-10 text-center" role="status">
        <p className="display-sm gold-text">Message received.</p>
        <p className="mx-auto mt-4 max-w-[44ch] leading-relaxed text-ivory/55">
          Thank you. We read every message and reply within one working day — usually far sooner.
          For anything urgent, WhatsApp is always fastest.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-7 font-sans text-2xs uppercase tracking-luxe text-accent underline decoration-accent/40 underline-offset-8"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field label="Your name" required error={errors.name}>
        {(props) => (
          <input
            {...props}
            type="text"
            autoComplete="name"
            placeholder="Ama Owusu"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        )}
      </Field>

      <Field label="Email address" required error={errors.email}>
        {(props) => (
          <input
            {...props}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => update({ email: e.target.value })}
          />
        )}
      </Field>

      <Field label="Phone or WhatsApp" hint="Optional — but it is the fastest way to reach you.">
        {(props) => (
          <input
            {...props}
            type="tel"
            autoComplete="tel"
            placeholder="0545489200"
            value={form.phone}
            onChange={(e) => update({ phone: e.target.value })}
          />
        )}
      </Field>

      <Field label="What is this about?">
        {(props) => (
          <select
            {...props}
            value={form.subject}
            onChange={(e) => update({ subject: e.target.value })}
            className={props.className + ' appearance-none bg-ink-800'}
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="Message" required error={errors.message} className="sm:col-span-2">
        {(props) => (
          <textarea
            {...props}
            rows={6}
            maxLength={2000}
            placeholder="Tell us what you need and we will come back to you with a straight answer."
            value={form.message}
            onChange={(e) => update({ message: e.target.value })}
            className={props.className + ' resize-none leading-relaxed'}
          />
        )}
      </Field>

      {/* Honeypot */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={(e) => update({ company: e.target.value })}
        />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={state === 'sending'} aria-busy={state === 'sending'}>
          {state === 'sending' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
              Send message
            </>
          )}
        </Button>

        {state === 'error' && (
          <p role="alert" className="mt-4 text-sm text-danger">
            That did not go through. Please try again, or message us on WhatsApp.
          </p>
        )}

        <p className="mt-5 text-xs leading-relaxed text-ivory/30">
          We use your details only to answer this message. We never sell or share them.
        </p>
      </div>
    </form>
  );
}
