'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Field from '@/components/booking/Field';
import Wordmark from '@/components/layout/Wordmark';

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Could not sign you in.');
        setBusy(false);
        return;
      }
      // refresh() re-runs the server guards so the redirect lands authenticated.
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass rounded-[1.75rem] p-8" noValidate>
      <div className="mb-8 flex justify-center">
        <Wordmark />
      </div>

      <h1 className="display-sm text-center">Studio access</h1>
      <p className="mx-auto mt-3 max-w-[32ch] text-center text-sm leading-relaxed text-ivory/50">
        This dashboard is private. Enter the studio password to continue.
      </p>

      <div className="mt-8">
        <Field label="Password" required error={error ?? undefined}>
          {(props) => (
            <input
              {...props}
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="••••••••••"
            />
          )}
        </Field>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy} aria-busy={busy}>
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Checking
          </>
        ) : (
          <>
            <Lock className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            Sign in
          </>
        )}
      </Button>

      <p className="mt-6 text-center text-xs leading-relaxed text-ivory/30">
        Sessions last 12 hours. Sign out when using a shared device.
      </p>
    </form>
  );
}
