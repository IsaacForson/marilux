'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Field from '@/components/booking/Field';
import PasswordInput from './PasswordInput';
import Wordmark from '@/components/layout/Wordmark';

type Mode = 'signin' | 'forgot' | 'sent';

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [hasAccounts, setHasAccounts] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Before any account exists the studio signs in with the environment
  // password alone, so asking for an email would be confusing.
  useEffect(() => {
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((d) => setHasAccounts(Boolean(d.hasAccounts)))
      .catch(() => setHasAccounts(true));
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Could not sign you in.');
        setBusy(false);
        return;
      }
      router.replace(data.bootstrap ? '/admin/team' : '/admin');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setBusy(false);
    }
  }

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not send that.');
      } else {
        setNotice(data.message);
        setMode('sent');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (mode === 'sent') {
    return (
      <div className="glass rounded-[1.75rem] p-8 text-center">
        <span className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full border border-accent/45 bg-accent/10 text-accent">
          <Mail className="h-5 w-5" strokeWidth={1.4} aria-hidden="true" />
        </span>
        <h1 className="display-sm">Check your email.</h1>
        <p className="mx-auto mt-4 max-w-[34ch] text-sm leading-relaxed text-ivory/55">{notice}</p>
        <p className="mx-auto mt-3 max-w-[34ch] text-xs leading-relaxed text-ivory/35">
          The link works once and expires in 45 minutes.
        </p>
        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setNotice(null);
          }}
          className="mt-7 inline-flex items-center gap-2 font-sans text-2xs uppercase tracking-luxe text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
          Back to sign in
        </button>
      </div>
    );
  }

  const forgot = mode === 'forgot';

  return (
    <form
      onSubmit={forgot ? requestReset : signIn}
      className="glass rounded-[1.75rem] p-8"
      noValidate
    >
      <div className="mb-8 flex justify-center">
        <Wordmark />
      </div>

      <h1 className="display-sm text-center">{forgot ? 'Reset your password' : 'Studio access'}</h1>
      <p className="mx-auto mt-3 max-w-[34ch] text-center text-sm leading-relaxed text-ivory/50">
        {forgot
          ? 'Enter your email address and we will send you a link to set a new password.'
          : hasAccounts === false
            ? 'No accounts yet — sign in with the studio password to create the first one.'
            : 'This dashboard is private. Sign in to continue.'}
      </p>

      <div className="mt-8 space-y-5">
        {(forgot || hasAccounts !== false) && (
          <Field label="Email address" required>
            {(props) => (
              <input
                {...props}
                type="email"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="you@example.com"
              />
            )}
          </Field>
        )}

        {!forgot && (
          <PasswordInput
            label="Password"
            required
            error={error ?? undefined}
            autoComplete="current-password"
            autoFocus={hasAccounts === false}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            placeholder="••••••••••"
          />
        )}
      </div>

      {forgot && error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy} aria-busy={busy}>
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {forgot ? 'Sending' : 'Checking'}
          </>
        ) : (
          <>
            <Lock className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            {forgot ? 'Send reset link' : 'Sign in'}
          </>
        )}
      </Button>

      {hasAccounts !== false && (
        <button
          type="button"
          onClick={() => {
            setMode(forgot ? 'signin' : 'forgot');
            setError(null);
          }}
          className="mx-auto mt-6 block font-sans text-2xs uppercase tracking-luxe text-ivory/45 transition-colors hover:text-accent"
        >
          {forgot ? 'Back to sign in' : 'Forgotten your password?'}
        </button>
      )}

      <p className="mt-6 text-center text-xs leading-relaxed text-ivory/30">
        Sessions last 12 hours. Sign out when using a shared device.
      </p>
    </form>
  );
}
