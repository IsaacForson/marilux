'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Ticket, Trash2 } from 'lucide-react';
import type { Promotion } from '@/lib/catalogue/promotions';
import type { LiveCategory } from '@/lib/catalogue';
import { cn, GHS } from '@/lib/utils';
import { Panel, Select, TextArea, TextInput, Toggle } from './Form';

type Draft = {
  id?: string;
  code: string;
  label: string;
  description: string;
  kind: 'percent' | 'amount';
  value: number;
  scope: 'all' | 'category' | 'service';
  scopeValue: string;
  startsAt: string;
  endsAt: string;
  maxUses: string;
  minSpend: number;
  isActive: boolean;
};

const blank: Draft = {
  code: '',
  label: '',
  description: '',
  kind: 'percent',
  value: 10,
  scope: 'all',
  scopeValue: '',
  startsAt: '',
  endsAt: '',
  maxUses: '',
  minSpend: 0,
  isActive: true,
};

export default function PromotionsEditor({
  promotions,
  categories,
}: {
  promotions: Promotion[];
  categories: LiveCategory[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (p: Partial<Draft>) => {
    setDraft((d) => (d ? { ...d, ...p } : d));
    setError(null);
  };

  async function save() {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draft.id,
          code: draft.code.trim() || null,
          label: draft.label.trim(),
          description: draft.description.trim() || null,
          kind: draft.kind,
          value: Number(draft.value),
          scope: draft.scope,
          scopeValue: draft.scope === 'all' ? null : draft.scopeValue || null,
          startsAt: draft.startsAt ? new Date(draft.startsAt).toISOString() : null,
          endsAt: draft.endsAt ? new Date(draft.endsAt).toISOString() : null,
          maxUses: draft.maxUses ? Number(draft.maxUses) : null,
          minSpend: Number(draft.minSpend) || 0,
          isActive: draft.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not save.');
      setDraft(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, label: string) {
    if (!window.confirm('Delete "' + label + '"? Bookings that already used it are unaffected.')) {
      return;
    }
    setBusy(true);
    try {
      await fetch('/api/admin/promotions?id=' + id, { method: 'DELETE' });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const edit = (p: Promotion) =>
    setDraft({
      id: p.id,
      code: p.code ?? '',
      label: p.label,
      description: p.description ?? '',
      kind: p.kind,
      value: p.value,
      scope: p.scope,
      scopeValue: p.scopeValue ?? '',
      startsAt: p.startsAt ? p.startsAt.slice(0, 10) : '',
      endsAt: p.endsAt ? p.endsAt.slice(0, 10) : '',
      maxUses: p.maxUses ? String(p.maxUses) : '',
      minSpend: p.minSpend,
      isActive: p.isActive,
    });

  return (
    <div className="space-y-4">
      {!draft && (
        <button
          type="button"
          onClick={() => setDraft({ ...blank })}
          className="inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3 font-sans text-2xs uppercase tracking-luxe text-onaccent transition-colors hover:bg-champagne-light"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
          New promotion
        </button>
      )}

      {draft && (
        <Panel
          title={draft.id ? 'Edit promotion' : 'New promotion'}
          description="Leave the code blank for an automatic discount that applies to everyone. Add a code and it becomes a coupon clients type at checkout."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <TextInput
              label="Name"
              hint="What you call it. Clients see this on their booking summary."
              placeholder="September facial offer"
              value={draft.label}
              onChange={(e) => patch({ label: e.target.value })}
            />
            <TextInput
              label="Coupon code"
              hint="Optional. Leave empty for an automatic discount."
              placeholder="GLOW20"
              value={draft.code}
              onChange={(e) => patch({ code: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <Select
              label="Discount type"
              value={draft.kind}
              onChange={(e) => patch({ kind: e.target.value as Draft['kind'] })}
            >
              <option value="percent">Percentage off</option>
              <option value="amount">Fixed amount off</option>
            </Select>
            <TextInput
              label={draft.kind === 'percent' ? 'Percent off' : 'Cedis off'}
              type="number"
              min={1}
              max={draft.kind === 'percent' ? 100 : undefined}
              value={draft.value}
              onChange={(e) => patch({ value: Number(e.target.value) })}
            />
            <TextInput
              label="Minimum spend"
              hint="0 for no minimum."
              type="number"
              min={0}
              value={draft.minSpend}
              onChange={(e) => patch({ minSpend: Number(e.target.value) })}
            />
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Select
              label="Applies to"
              value={draft.scope}
              onChange={(e) =>
                patch({ scope: e.target.value as Draft['scope'], scopeValue: '' })
              }
            >
              <option value="all">Every treatment</option>
              <option value="category">One category</option>
              <option value="service">One treatment</option>
            </Select>

            {draft.scope === 'category' && (
              <Select
                label="Category"
                value={draft.scopeValue}
                onChange={(e) => patch({ scopeValue: e.target.value })}
              >
                <option value="">Choose a category…</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}

            {draft.scope === 'service' && (
              <Select
                label="Treatment"
                value={draft.scopeValue}
                onChange={(e) => patch({ scopeValue: e.target.value })}
              >
                <option value="">Choose a treatment…</option>
                {categories.map((c) => (
                  <optgroup key={c.slug} label={c.name}>
                    {c.services.map((s) => (
                      <option key={s.slug} value={c.slug + '/' + s.slug}>
                        {s.name} — {GHS(s.price)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            )}
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <TextInput
              label="Starts"
              hint="Optional."
              type="date"
              value={draft.startsAt}
              onChange={(e) => patch({ startsAt: e.target.value })}
            />
            <TextInput
              label="Ends"
              hint="Optional."
              type="date"
              value={draft.endsAt}
              onChange={(e) => patch({ endsAt: e.target.value })}
            />
            <TextInput
              label="Maximum uses"
              hint="Blank for unlimited."
              type="number"
              min={1}
              value={draft.maxUses}
              onChange={(e) => patch({ maxUses: e.target.value })}
            />
          </div>

          <div className="mt-6">
            <TextArea
              label="Description"
              hint="Optional. For your own reference."
              rows={2}
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </div>

          <div className="mt-6">
            <Toggle
              label="Active"
              hint="Switch off to pause without deleting."
              checked={draft.isActive}
              onChange={(isActive) => patch({ isActive })}
            />
          </div>

          {error && (
            <p role="alert" className="mt-5 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={save}
              disabled={busy || !draft.label.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3 font-sans text-2xs uppercase tracking-luxe text-onaccent transition-colors hover:bg-champagne-light disabled:opacity-40"
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              {draft.id ? 'Save promotion' : 'Create promotion'}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-full border border-line-2 px-6 py-3 font-sans text-2xs uppercase tracking-luxe text-ivory/55 transition-colors hover:border-accent/60 hover:text-accent"
            >
              Cancel
            </button>
          </div>
        </Panel>
      )}

      {promotions.length === 0 && !draft ? (
        <div className="rounded-2xl border border-line bg-fill px-6 py-14 text-center">
          <Ticket className="mx-auto h-6 w-6 text-ivory/25" strokeWidth={1.3} aria-hidden="true" />
          <p className="mt-4 font-display text-xl font-light text-ivory">No promotions yet.</p>
          <p className="mx-auto mt-2 max-w-[46ch] text-sm text-ivory/40">
            Create a percentage off a category, a fixed amount off one treatment, or a coupon
            code for a campaign.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {promotions.map((p) => {
            const live =
              p.isActive &&
              (!p.endsAt || new Date(p.endsAt) >= new Date()) &&
              (p.maxUses === null || p.usedCount < p.maxUses);

            return (
              <li
                key={p.id}
                className={cn(
                  'rounded-2xl border p-5 transition-colors',
                  live ? 'border-success/30 bg-success/[0.04]' : 'border-line',
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-display text-lg text-ivory">{p.label}</span>
                      {p.code && (
                        <code className="rounded-md border border-accent/35 bg-accent/10 px-2 py-0.5 font-sans text-2xs tracking-luxe text-accent">
                          {p.code}
                        </code>
                      )}
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 font-sans text-2xs uppercase tracking-luxe',
                          live
                            ? 'border-success/45 text-success'
                            : 'border-line-3 text-ivory/40',
                        )}
                      >
                        {live ? 'Live' : 'Inactive'}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-ivory/55">
                      {p.kind === 'percent' ? p.value + '% off' : GHS(p.value) + ' off'}
                      {p.scope === 'all'
                        ? ' everything'
                        : p.scope === 'category'
                          ? ' · ' + (categories.find((c) => c.slug === p.scopeValue)?.name ?? p.scopeValue)
                          : ' · ' + (p.scopeValue ?? '').split('/')[1]}
                      {p.minSpend > 0 && ' · min ' + GHS(p.minSpend)}
                    </p>

                    <p className="mt-1.5 font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                      {p.usedCount} used
                      {p.maxUses !== null && ' of ' + p.maxUses}
                      {p.endsAt && ' · ends ' + p.endsAt.slice(0, 10)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => edit(p)}
                      className="rounded-full border border-line-2 px-4 py-2 font-sans text-2xs uppercase tracking-luxe text-ivory/55 transition-colors hover:border-accent/60 hover:text-accent"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(p.id, p.label)}
                      disabled={busy}
                      aria-label={'Delete ' + p.label}
                      className="grid h-9 w-9 place-items-center rounded-full border border-line-2 text-ivory/40 transition-colors hover:border-danger/50 hover:text-danger disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    </button>
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
