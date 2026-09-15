'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BellRing, Check, Loader2 } from 'lucide-react';

/**
 * Sends tomorrow's reminders.
 *
 * The endpoint skips anyone already reminded, so pressing this twice cannot
 * message a client twice — but we still disable it while in flight and report
 * exactly how many went out.
 */
export default function SendRemindersButton({ due }: { due: number }) {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function send() {
    setState('sending');
    setMessage(null);
    try {
      const res = await fetch('/api/admin/reminders', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setState('error');
        setMessage(data.error || 'Could not send reminders.');
        return;
      }
      setState('done');
      setMessage(
        data.sent === 0
          ? 'No reminders were due.'
          : data.sent + ' of ' + data.considered + ' sent for ' + data.date + '.',
      );
      router.refresh();
    } catch {
      setState('error');
      setMessage('Network error.');
    }
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={send}
        disabled={state === 'sending' || due === 0}
        className="inline-flex items-center gap-2.5 rounded-full bg-champagne px-6 py-3 font-sans text-2xs uppercase tracking-luxe text-onaccent transition-colors duration-300 hover:bg-champagne-light disabled:cursor-not-allowed disabled:opacity-40"
      >
        {state === 'sending' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : state === 'done' ? (
          <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        ) : (
          <BellRing className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
        )}
        {due === 0 ? 'No reminders due' : 'Send ' + due + ' reminder' + (due === 1 ? '' : 's')}
      </button>

      <p
        role="status"
        aria-live="polite"
        className={
          'mt-2 text-xs ' + (state === 'error' ? 'text-danger' : 'text-ivory/40')
        }
      >
        {message ?? 'For tomorrow’s confirmed appointments'}
      </p>
    </div>
  );
}
