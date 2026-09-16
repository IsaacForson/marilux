'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Eye, EyeOff, RotateCcw, Search } from 'lucide-react';
import type { LiveCategory } from '@/lib/catalogue';
import { formatDuration } from '@/lib/data/services';
import { cn, GHS } from '@/lib/utils';
import SaveBar from './SaveBar';

type Edit = {
  price?: number;
  durationMinutes?: number;
  name?: string;
  badge?: string;
  isActive?: boolean;
};

/**
 * Price and availability editor.
 *
 * Only what the studio has actually changed is sent — an untouched service
 * produces no override row, so it keeps following the shipped catalogue and
 * "reset" genuinely restores the original rather than an old copy.
 */
export default function PriceEditor({ categories }: { categories: LiveCategory[] }) {
  const router = useRouter();
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [open, setOpen] = useState<string | null>(categories[0]?.slug ?? null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = Object.keys(edits).length > 0;

  const key = (c: string, s: string) => c + '/' + s;

  const setEdit = (c: string, s: string, patch: Edit) => {
    setEdits((prev) => {
      const k = key(c, s);
      const next = { ...prev, [k]: { ...prev[k], ...patch } };
      return next;
    });
    setMessage(null);
    setError(null);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((c) => ({
        ...c,
        services: c.services.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            s.slug.includes(q),
        ),
      }))
      .filter((c) => c.services.length > 0);
  }, [categories, query]);

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);

    // Send the full resulting state for each touched service, so the server
    // writes one complete override row rather than a partial patch.
    const services = Object.entries(edits).map(([k, edit]) => {
      const [categorySlug, serviceSlug] = k.split('/');
      const category = categories.find((c) => c.slug === categorySlug);
      const current = category?.services.find((s) => s.slug === serviceSlug);
      return {
        categorySlug,
        serviceSlug,
        price: edit.price ?? current?.price ?? null,
        durationMinutes: edit.durationMinutes ?? current?.duration ?? null,
        name: (edit.name ?? current?.name) || null,
        badge: (edit.badge ?? current?.badge) || null,
        isActive: edit.isActive ?? current?.isActive ?? true,
      };
    });

    try {
      const res = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not save.');
      setEdits({});
      setMessage(
        services.length + (services.length === 1 ? ' service' : ' services') + ' updated and live.',
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  async function resetService(categorySlug: string, serviceSlug: string) {
    setSaving(true);
    try {
      await fetch(
        '/api/admin/services?category=' + categorySlug + '&service=' + serviceSlug,
        { method: 'DELETE' },
      );
      setEdits((prev) => {
        const next = { ...prev };
        delete next[key(categorySlug, serviceSlug)];
        return next;
      });
      setMessage('Restored to the original price.');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="relative mb-6">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/30"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <label htmlFor="svc-search" className="sr-only">
          Search services
        </label>
        <input
          id="svc-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a treatment or category"
          className="w-full rounded-xl border border-line bg-fill py-3 pl-11 pr-4 text-sm text-ivory placeholder:text-ivory/30 transition-colors focus:border-accent/60 focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((category) => {
          const isOpen = query.trim() ? true : open === category.slug;
          const changed = category.services.filter(
            (s) => edits[key(category.slug, s.slug)],
          ).length;

          return (
            <section key={category.slug} className="overflow-hidden rounded-2xl border border-line">
              <h2>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen && !query ? null : category.slug)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 bg-fill px-5 py-4 text-left transition-colors hover:bg-fill-2"
                >
                  <span>
                    <span className="block font-display text-lg font-light text-ivory">
                      {category.name}
                    </span>
                    <span className="mt-0.5 block font-sans text-2xs uppercase tracking-luxe text-ivory/35">
                      {category.services.length} treatments
                      {changed > 0 && ' · ' + changed + ' edited'}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-ivory/40 transition-transform duration-300',
                      isOpen && 'rotate-180',
                    )}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </button>
              </h2>

              {isOpen && (
                <ul className="divide-y divide-line">
                  {category.services.map((service) => {
                    const k = key(category.slug, service.slug);
                    const edit = edits[k] ?? {};
                    const price = edit.price ?? service.price;
                    const duration = edit.durationMinutes ?? service.duration;
                    const active = edit.isActive ?? service.isActive;
                    const touched = Boolean(edits[k]);

                    return (
                      <li
                        key={service.slug}
                        className={cn(
                          'grid gap-3 px-5 py-4 transition-colors sm:grid-cols-[1fr,7rem,7rem,auto] sm:items-center sm:gap-4',
                          touched && 'bg-accent/[0.04]',
                          !active && 'opacity-55',
                        )}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-ivory">{service.name}</p>
                          <p className="mt-0.5 truncate font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                            was {GHS(service.overridden ? service.price : service.price)} ·{' '}
                            {formatDuration(service.duration)}
                            {service.priceFrom && ' · from'}
                          </p>
                        </div>

                        <label className="block">
                          <span className="sr-only">Price for {service.name}</span>
                          <span className="flex items-center gap-1.5 rounded-lg border border-line bg-fill px-3 py-2 focus-within:border-accent/60">
                            <span className="font-sans text-2xs text-ivory/35">GHS</span>
                            <input
                              type="number"
                              min={0}
                              value={price}
                              onChange={(e) =>
                                setEdit(category.slug, service.slug, {
                                  price: Number(e.target.value),
                                })
                              }
                              className="w-full bg-transparent text-sm tabular-nums text-ivory focus:outline-none"
                            />
                          </span>
                        </label>

                        <label className="block">
                          <span className="sr-only">Duration for {service.name} in minutes</span>
                          <span className="flex items-center gap-1.5 rounded-lg border border-line bg-fill px-3 py-2 focus-within:border-accent/60">
                            <input
                              type="number"
                              min={5}
                              step={5}
                              value={duration}
                              onChange={(e) =>
                                setEdit(category.slug, service.slug, {
                                  durationMinutes: Number(e.target.value),
                                })
                              }
                              className="w-full bg-transparent text-sm tabular-nums text-ivory focus:outline-none"
                            />
                            <span className="font-sans text-2xs text-ivory/35">min</span>
                          </span>
                        </label>

                        <div className="flex items-center gap-1.5 sm:justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setEdit(category.slug, service.slug, { isActive: !active })
                            }
                            aria-label={
                              (active ? 'Hide' : 'Show') + ' ' + service.name + ' on the website'
                            }
                            title={active ? 'Visible on the website' : 'Hidden from the website'}
                            className={cn(
                              'grid h-9 w-9 place-items-center rounded-lg border transition-colors',
                              active
                                ? 'border-line text-ivory/45 hover:text-ivory'
                                : 'border-warn/45 text-warn',
                            )}
                          >
                            {active ? (
                              <Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                            ) : (
                              <EyeOff className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                            )}
                          </button>

                          {service.overridden && (
                            <button
                              type="button"
                              onClick={() => resetService(category.slug, service.slug)}
                              disabled={saving}
                              aria-label={'Reset ' + service.name + ' to its original price'}
                              title="Reset to the original"
                              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ivory/40 transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-40"
                            >
                              <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-line bg-fill px-6 py-12 text-center text-sm text-ivory/40">
          Nothing matches that search.
        </p>
      )}

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onReset={() => setEdits({})}
        message={message}
        error={error}
      />
    </div>
  );
}
