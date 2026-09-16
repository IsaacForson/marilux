'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Field from '@/components/booking/Field';
import Wordmark from '@/components/layout/Wordmark';

export default function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Those passwords do not match.');
      return;
    }
    if (password.length < 10) {
      setError('Use at least 10 characters.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Could not set that password.');
        setBusy(false);
        return;
      }
      setDone(true);
      // The reset signs you in, so go straight to the dashboard.
      setTimeout(() => {
        router.replace('/admin');
        router.refresh();
      }, 1200);
    } catch {
      setError('Network error. Please try again.');
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <div className="glass rounded-[1.75rem] p-8 text-center">
        <h1 className="display-sm">That link is incomplete.</h1>
        <p className="mx-auto mt-4 max-w-[34ch] text-sm leading-relaxed text-ivory/55">
          Open the reset link from your email exactly as it was sent, or request a new one.
        </p>
        <Link
          href="/admin/login"
          className="mt-7 inline-block font-sans text-2xs uppercase tracking-luxe text-accent underline decoration-accent/40 underline-offset-8"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="glass rounded-[1.75rem] p-8 text-center" role="status">
        <span className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full border border-success/45 bg-success/10 text-success">
          <Check className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </span>
        <h1 className="display-sm">Password changed.</h1>
        <p className="mt-4 text-sm text-ivory/55">Taking you to the dashboard…</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-[1.75rem] p-8" noValidate>
      <div className="mb-8 flex justify-center">
        <Wordmark />
      </div>

      <h1 className="display-sm text-center">Set a new password</h1>
      <p className="mx-auto mt-3 max-w-[34ch] text-center text-sm leading-relaxed text-ivory/50">
        Choose something long rather than complicated — four unrelated words is stronger than a
        short scramble.
      </p>

      <div className="mt-8 space-y-5">
        <Field label="New password" required hint="At least 10 characters.">
          {(props) => (
            <input
              {...props}
              type="password"
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
            />
          )}
        </Field>

        <Field label="Confirm password" required error={error ?? undefined}>
          {(props) => (
            <input
              {...props}
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError(null);
              }}
            />
          )}
        </Field>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy} aria-busy={busy}>
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Lock className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
        )}
        Set password
      </Button>
    </form>
  );
}
