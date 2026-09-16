'use client';

import { useState } from 'react';
import { Check, Loader2, Lock } from 'lucide-react';
import { Panel } from './Form';
import PasswordInput from './PasswordInput';

/** Change your own password. Requires the current one, as it should. */
export default function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (next !== confirm) {
      setError('Those passwords do not match.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not change it.');
      setCurrent('');
      setNext('');
      setConfirm('');
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not change it.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel
      title="Your password"
      description="Changing this signs you out of every other device, but keeps you signed in here."
    >
      <div className="grid gap-6 sm:grid-cols-3">
        <PasswordInput
          label="Current password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => {
            setCurrent(e.target.value);
            setError(null);
            setDone(false);
          }}
        />
        <PasswordInput
          label="New password"
          autoComplete="new-password"
          hint="At least 10 characters."
          value={next}
          onChange={(e) => {
            setNext(e.target.value);
            setError(null);
            setDone(false);
          }}
        />
        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setError(null);
            setDone(false);
          }}
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={busy || !current || next.length < 10}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3 font-sans text-2xs uppercase tracking-luxe text-onaccent transition-colors hover:bg-champagne-light disabled:opacity-40"
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : done ? (
          <Check className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
        ) : (
          <Lock className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
        )}
        {done ? 'Password changed' : 'Change password'}
      </button>

      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}
    </Panel>
  );
}
