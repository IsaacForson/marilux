'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';

type Result = {
  ok: boolean;
  configured?: boolean;
  provider?: string;
  to?: string;
  mode?: string;
  segments?: number;
  id?: string;
  messageId?: string;
  error?: string;
  hint?: string;
};

/**
 * Sends a real test message on a channel and shows the provider's own error
 * plus the next step — so setup can be debugged without reading server logs.
 */
export default function ChannelTest({
  channel,
  title,
  blurb,
  defaultTo,
  secondaryLabel,
}: {
  channel: 'sms' | 'whatsapp';
  title: string;
  blurb: string;
  defaultTo: string;
  /** Optional second button, e.g. WhatsApp's "send as template". */
  secondaryLabel?: string;
}) {
  const [to, setTo] = useState(defaultTo);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function run(useTemplate: boolean) {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/' + channel + '/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, useTemplate }),
      });
      setResult(await res.json());
    } catch {
      setResult({ ok: false, error: 'Network error.' });
    } finally {
      setBusy(false);
    }
  }

  const id = 'test-to-' + channel;

  return (
    <div className="rounded-2xl border border-line p-6">
      <p className="eyebrow mb-2">{title}</p>
      <p className="mb-5 max-w-[62ch] text-sm leading-relaxed text-ivory/45">{blurb}</p>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[13rem] flex-1">
          <label htmlFor={id} className="eyebrow mb-2 block">
            Send to
          </label>
          <input
            id={id}
            type="tel"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0545489200"
            className="w-full rounded-xl border border-line bg-fill px-4 py-3 text-sm text-ivory placeholder:text-ivory/30 transition-colors focus:border-accent/60 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => run(false)}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-3 font-sans text-2xs uppercase tracking-luxe text-onaccent transition-colors hover:bg-champagne-light disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
          )}
          Send test
        </button>

        {secondaryLabel && (
          <button
            type="button"
            onClick={() => run(true)}
            disabled={busy}
            className="rounded-full border border-line-2 px-5 py-3 font-sans text-2xs uppercase tracking-luxe text-ivory/60 transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-50"
          >
            {secondaryLabel}
          </button>
        )}
      </div>

      {result && (
        <div
          role="status"
          aria-live="polite"
          className={
            'mt-5 rounded-xl border p-4 text-sm leading-relaxed ' +
            (result.ok
              ? 'border-success/40 bg-success/[0.07]'
              : 'border-warn/40 bg-warn/[0.07]')
          }
        >
          {result.ok ? (
            <p className="text-success">
              Delivered to {result.to}
              {result.provider && ' via ' + result.provider}
              {result.mode && ' via ' + result.mode}
              {result.segments ? ' · ' + result.segments + ' SMS segment' + (result.segments > 1 ? 's' : '') : ''}
              .
              {(result.id || result.messageId) && (
                <span className="block text-ivory/45">ID {result.id ?? result.messageId}</span>
              )}
            </p>
          ) : (
            <>
              <p className="text-warn">{result.error}</p>
              {result.hint && <p className="mt-2 text-ivory/60">{result.hint}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
