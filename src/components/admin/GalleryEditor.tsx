'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, GripVertical, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';
import { GALLERY_FILTERS } from '@/lib/data/gallery';
import { cn } from '@/lib/utils';
import { Panel, Select, TextArea, TextInput, Toggle } from './Form';
import MediaPicker from './MediaPicker';

export type AdminGalleryItem = {
  dbId?: string;
  title: string;
  caption?: string;
  categorySlug: string;
  imageUrl?: string;
  beforeUrl?: string;
  kind: 'image' | 'video' | 'before-after';
  span: 'tall' | 'wide' | 'square' | 'portrait';
  isActive?: boolean;
  sortOrder?: number;
};

type Draft = {
  id?: string;
  title: string;
  caption: string;
  categorySlug: string;
  imageUrl: string | null;
  beforeUrl: string | null;
  kind: 'image' | 'video' | 'before-after';
  span: 'tall' | 'wide' | 'square' | 'portrait';
  sortOrder: number;
  isActive: boolean;
};

const blank = (order: number): Draft => ({
  title: '',
  caption: '',
  categorySlug: 'brows-permanent-makeup',
  imageUrl: null,
  beforeUrl: null,
  kind: 'image',
  span: 'portrait',
  sortOrder: order,
  isActive: true,
});

export default function GalleryEditor({
  items,
  isCustom,
}: {
  items: AdminGalleryItem[];
  isCustom: boolean;
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
      const res = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          caption: draft.caption.trim() || null,
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

  async function remove(id: string, title: string) {
    if (!window.confirm('Remove "' + title + '" from the gallery?')) return;
    setBusy(true);
    await fetch('/api/admin/gallery?id=' + id, { method: 'DELETE' });
    router.refresh();
    setBusy(false);
  }

  async function takeOver() {
    setBusy(true);
    await fetch('/api/admin/gallery', { method: 'POST' });
    router.refresh();
    setBusy(false);
  }

  async function toggle(item: AdminGalleryItem) {
    if (!item.dbId) return;
    setBusy(true);
    await fetch('/api/admin/gallery', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: item.dbId,
        title: item.title,
        caption: item.caption ?? null,
        categorySlug: item.categorySlug,
        imageUrl: item.imageUrl ?? null,
        beforeUrl: item.beforeUrl ?? null,
        kind: item.kind,
        span: item.span,
        sortOrder: item.sortOrder ?? 0,
        isActive: !(item.isActive ?? true),
      }),
    });
    router.refresh();
    setBusy(false);
  }

  const nextOrder = items.length;

  return (
    <div className="space-y-4">
      {!isCustom && (
        <div className="rounded-2xl border border-accent/30 bg-accent/[0.05] p-6">
          <p className="font-display text-xl font-light text-ivory">
            The gallery is showing our placeholder set.
          </p>
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-ivory/50">
            Take it over and we will copy those {items.length} entries in as a starting point —
            then swap each picture for your own work, rename them, and remove anything you do
            not want. Nothing on the website changes until you start editing.
          </p>
          <button
            type="button"
            onClick={takeOver}
            disabled={busy}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3 font-sans text-2xs uppercase tracking-luxe text-onaccent transition-colors hover:bg-champagne-light disabled:opacity-50"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            Take over the gallery
          </button>
        </div>
      )}

      {isCustom && !draft && (
        <button
          type="button"
          onClick={() => setDraft(blank(nextOrder))}
          className="inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3 font-sans text-2xs uppercase tracking-luxe text-onaccent transition-colors hover:bg-champagne-light"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
          Add to the gallery
        </button>
      )}

      {draft && (
        <Panel
          title={draft.id ? 'Edit gallery item' : 'New gallery item'}
          description="Upload the photograph, describe the work, and choose how large it sits in the grid."
        >
          <div className="grid gap-6 lg:grid-cols-[14rem,1fr]">
            <div>
              <p className="eyebrow mb-2">
                {draft.kind === 'before-after' ? 'After' : 'Photograph'}
              </p>
              <MediaPicker
                folder="gallery"
                label="Gallery image"
                value={draft.imageUrl}
                onChange={(imageUrl) => patch({ imageUrl })}
              />

              {draft.kind === 'before-after' && (
                <>
                  <p className="eyebrow mb-2 mt-4">Before</p>
                  <MediaPicker
                    folder="gallery"
                    label="Before image"
                    value={draft.beforeUrl}
                    onChange={(beforeUrl) => patch({ beforeUrl })}
                  />
                </>
              )}
            </div>

            <div className="space-y-6">
              <TextInput
                label="Title"
                placeholder="Combination brows, healed at eight weeks"
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
              />

              <TextArea
                label="Caption"
                hint="Optional. Shown in the lightbox."
                rows={2}
                placeholder="Two sessions. No pencil since."
                value={draft.caption}
                onChange={(e) => patch({ caption: e.target.value })}
              />

              <div className="grid gap-6 sm:grid-cols-3">
                <Select
                  label="Category"
                  value={draft.categorySlug}
                  onChange={(e) => patch({ categorySlug: e.target.value })}
                >
                  {GALLERY_FILTERS.filter((f) => f.slug !== 'all').map((f) => (
                    <option key={f.slug} value={f.slug}>
                      {f.label}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Type"
                  value={draft.kind}
                  onChange={(e) => patch({ kind: e.target.value as Draft['kind'] })}
                >
                  <option value="image">Photograph</option>
                  <option value="before-after">Before &amp; after</option>
                  <option value="video">Video</option>
                </Select>

                <Select
                  label="Size in the grid"
                  value={draft.span}
                  onChange={(e) => patch({ span: e.target.value as Draft['span'] })}
                >
                  <option value="portrait">Portrait</option>
                  <option value="square">Square</option>
                  <option value="tall">Tall</option>
                  <option value="wide">Wide</option>
                </Select>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <TextInput
                  label="Position"
                  hint="Lower numbers appear first."
                  type="number"
                  min={0}
                  value={draft.sortOrder}
                  onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })}
                />
                <div className="flex items-end">
                  <Toggle
                    label="Show on the website"
                    checked={draft.isActive}
                    onChange={(isActive) => patch({ isActive })}
                  />
                </div>
              </div>
            </div>
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
              disabled={busy || !draft.title.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3 font-sans text-2xs uppercase tracking-luxe text-onaccent transition-colors hover:bg-champagne-light disabled:opacity-40"
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              {draft.id ? 'Save' : 'Add to gallery'}
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

      {items.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <li
              key={item.dbId ?? item.title + i}
              className={cn(
                'overflow-hidden rounded-2xl border transition-colors',
                item.isActive === false ? 'border-line opacity-55' : 'border-line',
              )}
            >
              <div className="relative aspect-[4/3] bg-fill">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center text-ivory/25">
                    <ImagePlus className="h-6 w-6" strokeWidth={1.3} aria-hidden="true" />
                  </span>
                )}

                {item.kind !== 'image' && (
                  <span className="absolute left-3 top-3 rounded-full border border-accent/40 bg-ink/60 px-2.5 py-1 font-sans text-2xs uppercase tracking-luxe text-accent backdrop-blur-md">
                    {item.kind === 'before-after' ? 'Before / after' : 'Video'}
                  </span>
                )}
              </div>

              <div className="p-4">
                <p className="truncate text-sm text-ivory">{item.title}</p>
                <p className="mt-1 flex items-center gap-1.5 font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                  <GripVertical className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                  {item.sortOrder ?? i} · {item.span}
                </p>

                {item.dbId && (
                  <div className="mt-3 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          id: item.dbId,
                          title: item.title,
                          caption: item.caption ?? '',
                          categorySlug: item.categorySlug,
                          imageUrl: item.imageUrl ?? null,
                          beforeUrl: item.beforeUrl ?? null,
                          kind: item.kind,
                          span: item.span,
                          sortOrder: item.sortOrder ?? i,
                          isActive: item.isActive ?? true,
                        })
                      }
                      className="flex-1 rounded-lg border border-line-2 py-2 font-sans text-2xs uppercase tracking-luxe text-ivory/55 transition-colors hover:border-accent/60 hover:text-accent"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(item)}
                      disabled={busy}
                      aria-label={
                        (item.isActive === false ? 'Show' : 'Hide') + ' ' + item.title
                      }
                      className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ivory/45 transition-colors hover:text-ivory disabled:opacity-40"
                    >
                      {item.isActive === false ? (
                        <EyeOff className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item.dbId as string, item.title)}
                      disabled={busy}
                      aria-label={'Delete ' + item.title}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ivory/40 transition-colors hover:border-danger/50 hover:text-danger disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
