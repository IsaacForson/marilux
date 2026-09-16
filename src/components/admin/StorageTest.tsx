'use client';

import { useState } from 'react';
import { Database, HardDrive, Loader2 } from 'lucide-react';

type Result = {
  ok: boolean;
  backend?: string;
  bucket?: string;
  message?: string;
  error?: string;
  hint?: string;
};

/**
 * Storage round-trip check.
 *
 * Uploads a tiny image, reads it back over the public URL and deletes it, so
 * a green result means the key, the bucket and the public-read policy all
 * work — not merely that a request was accepted.
 */
export default function StorageTest({ backend }: { backend: string }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/storage/test', { method: 'POST' });
      setResult(await res.json());
    } catch {
      setResult({ ok: false, error: 'Network error.' });
    } finally {
      setBusy(false);
    }
  }

  const onSupabase = backend === 'supabase';

  return (
    <div className="rounded-2xl border border-line p-6">
      <p className="eyebrow mb-2 flex items-center gap-2">
        {onSupabase ? (
          <HardDrive className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Database className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} aria-hidden="true" />
        )}
        Image storage
      </p>

      <p className="mb-5 max-w-[62ch] text-sm leading-relaxed text-ivory/45">
        {onSupabase
          ? 'Images go to Supabase Storage and are served from its CDN.'
          : 'Images are stored in your database and served with long-term caching. That works well at this scale — moving to Supabase Storage is optional, and only needs two environment variables.'}
      </p>

      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full border border-line-2 px-5 py-2.5 font-sans text-2xs uppercase tracking-luxe text-ivory/60 transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-50"
      >
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
        Test Supabase Storage
      </button>

      {result && (
        <div
          role="status"
          aria-live="polite"
          className={
            'mt-5 rounded-xl border p-4 text-sm leading-relaxed ' +
            (result.ok
              ? 'border-success/40 bg-success/[0.07] text-success'
              : 'border-warn/40 bg-warn/[0.07] text-ivory/75')
          }
        >
          {result.ok ? (
            <p>{result.message}</p>
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
