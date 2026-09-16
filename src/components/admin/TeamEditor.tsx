'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2, Plus, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import type { AdminUser } from '@/lib/admin/users';
import { cn } from '@/lib/utils';
import { Panel, Select, TextInput, Toggle } from './Form';

export default function TeamEditor({
  users,
  me,
  bootstrap,
}: {
  users: AdminUser[];
  me: AdminUser | null;
  bootstrap: boolean;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(bootstrap && users.length === 0);
  const [draft, setDraft] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isOwner = bootstrap || me?.role === 'owner';
  const first = users.length === 0;

  async function addUser() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not add that account.');

      setDraft({ name: '', email: '', password: '', role: 'staff' });
      setAdding(false);
      setNotice(
        data.first
          ? 'Owner account created. Sign out and back in with it — the studio password will no longer work.'
          : 'Account created. Share the password with them and ask them to change it.',
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add that account.');
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not save that.');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save that.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(user: AdminUser) {
    if (!window.confirm('Remove ' + user.name + "'s account? They lose access immediately.")) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users?id=' + user.id, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not remove that account.');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove that account.');
    } finally {
      setBusy(false);
    }
  }

  async function sendReset(user: AdminUser) {
    setBusy(true);
    setError(null);
    await fetch('/api/admin/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    });
    setNotice('If ' + user.email + ' has an account, a reset link is on its way.');
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      {bootstrap && (
        <div className="rounded-2xl border border-warn/40 bg-warn/[0.06] p-6">
          <p className="font-display text-xl font-light text-ivory">
            You are signed in with the studio password.
          </p>
          <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-ivory/55">
            Create your owner account below. Once it exists the environment password stops
            working for sign-in and becomes recovery only — so you can never be locked out, but
            nobody can use it as a back door either.
          </p>
        </div>
      )}

      {notice && (
        <p role="status" className="rounded-xl border border-success/40 bg-success/[0.07] p-4 text-sm text-success">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger/[0.07] p-4 text-sm text-danger">
          {error}
        </p>
      )}

      {isOwner && !adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3 font-sans text-2xs uppercase tracking-luxe text-onaccent transition-colors hover:bg-champagne-light"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
          {first ? 'Create your owner account' : 'Add someone'}
        </button>
      )}

      {adding && (
        <Panel
          title={first ? 'Create the owner account' : 'Add someone to the studio'}
          description={
            first
              ? 'This is you. Owners can add and remove people; staff can manage bookings, prices and content.'
              : 'They sign in with this email and password, and can change the password themselves afterwards.'
          }
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <TextInput
              label="Name"
              placeholder="Mariam"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="name@example.com"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
            <TextInput
              label="Password"
              type="text"
              hint="At least 10 characters. They can change it once signed in."
              value={draft.password}
              onChange={(e) => setDraft({ ...draft, password: e.target.value })}
            />
            {!first && (
              <Select
                label="Role"
                hint="Owners can manage accounts."
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              >
                <option value="staff">Staff</option>
                <option value="owner">Owner</option>
              </Select>
            )}
          </div>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={addUser}
              disabled={
                busy || !draft.name.trim() || !draft.email.trim() || draft.password.length < 10
              }
              className="inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3 font-sans text-2xs uppercase tracking-luxe text-onaccent transition-colors hover:bg-champagne-light disabled:opacity-40"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
              )}
              Create account
            </button>
            {!first && (
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="rounded-full border border-line-2 px-6 py-3 font-sans text-2xs uppercase tracking-luxe text-ivory/55 transition-colors hover:border-accent/60 hover:text-accent"
              >
                Cancel
              </button>
            )}
          </div>
        </Panel>
      )}

      {users.length > 0 && (
        <ul className="space-y-3">
          {users.map((u) => {
            const isMe = me?.id === u.id;
            return (
              <li
                key={u.id}
                className={cn(
                  'rounded-2xl border p-5',
                  u.isActive ? 'border-line' : 'border-line opacity-60',
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2.5">
                      <span className="font-display text-lg text-ivory">{u.name}</span>
                      {u.role === 'owner' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-2.5 py-0.5 font-sans text-2xs uppercase tracking-luxe text-accent">
                          <ShieldCheck className="h-3 w-3" strokeWidth={1.7} aria-hidden="true" />
                          Owner
                        </span>
                      )}
                      {isMe && (
                        <span className="rounded-full border border-line-3 px-2.5 py-0.5 font-sans text-2xs uppercase tracking-luxe text-ivory/45">
                          You
                        </span>
                      )}
                      {!u.isActive && (
                        <span className="rounded-full border border-warn/45 px-2.5 py-0.5 font-sans text-2xs uppercase tracking-luxe text-warn">
                          Disabled
                        </span>
                      )}
                    </p>
                    <p className="mt-1.5 truncate text-sm text-ivory/55">{u.email}</p>
                    <p className="mt-1 font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                      {u.lastLoginAt
                        ? 'Last signed in ' +
                          new Intl.DateTimeFormat('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(u.lastLoginAt))
                        : 'Never signed in'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => sendReset(u)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line-2 px-4 py-2 font-sans text-2xs uppercase tracking-luxe text-ivory/55 transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-40"
                    >
                      <KeyRound className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
                      Send reset
                    </button>

                    {isOwner && !isMe && (
                      <>
                        <Toggle
                          label=""
                          checked={u.isActive}
                          onChange={(isActive) => patch(u.id, { isActive })}
                        />
                        <button
                          type="button"
                          onClick={() => remove(u)}
                          disabled={busy}
                          aria-label={'Remove ' + u.name}
                          className="grid h-9 w-9 place-items-center rounded-full border border-line-2 text-ivory/40 transition-colors hover:border-danger/50 hover:text-danger disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
