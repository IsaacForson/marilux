'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ImagePlus, Loader2, Trash2, Upload, X } from 'lucide-react';
import type { MediaRecord } from '@/lib/media/storage';
import { BEZIER } from '@/lib/motion';
import { cn } from '@/lib/utils';
import ConfirmBar from './ConfirmBar';

/**
 * Choose or upload an image.
 *
 * Opens over the page rather than navigating, because it is always used from
 * inside another form — a price row, a category, a gallery item — and losing
 * that form's unsaved state to pick a picture would be maddening.
 */
export default function MediaPicker({
  value,
  onChange,
  folder = 'general',
  label = 'Image',
  compact,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'group relative overflow-hidden rounded-xl border border-line transition-colors hover:border-accent/50',
          compact ? 'h-11 w-11' : 'aspect-[4/3] w-full',
        )}
        aria-label={value ? 'Change ' + label.toLowerCase() : 'Add ' + label.toLowerCase()}
        title={value ? 'Change image' : 'Add image'}
      >
        {value ? (
          // A plain img, not next/image: these are arbitrary runtime URLs and
          // the picker is admin-only, so optimisation buys nothing here.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center bg-fill text-ivory/30 transition-colors group-hover:text-accent">
            <ImagePlus
              className={compact ? 'h-4 w-4' : 'h-6 w-6'}
              strokeWidth={1.4}
              aria-hidden="true"
            />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <Library
            folder={folder}
            current={value ?? null}
            onClose={() => setOpen(false)}
            onPick={(url) => {
              onChange(url);
              setOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function Library({
  folder,
  current,
  onClose,
  onPick,
}: {
  folder: string;
  current: string | null;
  onClose: () => void;
  onPick: (url: string | null) => void;
}) {
  const [items, setItems] = useState<MediaRecord[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backend, setBackend] = useState<string>('');
  const [urlInput, setUrlInput] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; url: string } | null>(
    null,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.ok) {
        setItems(data.media);
        setBackend(data.backend);
      } else {
        setError(data.error || 'Could not load the library.');
        setItems([]);
      }
    } catch {
      setError('Could not load the library.');
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);

    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', folder);
      try {
        const res = await fetch('/api/admin/media', { method: 'POST', body: form });
        const data = await res.json();
        if (!data.ok) {
          setError(data.error || 'Upload failed.');
          break;
        }
        setItems((prev) => [data.media, ...(prev ?? [])]);
      } catch {
        setError('Upload failed. Please try again.');
        break;
      }
    }

    setBusy(false);
  }

  async function confirmRemove() {
    if (!pendingDelete) return;
    setBusy(true);
    await fetch('/api/admin/media?id=' + pendingDelete.id, { method: 'DELETE' });
    setItems((prev) => (prev ?? []).filter((m) => m.id !== pendingDelete.id));
    if (current === pendingDelete.url) onPick(null);
    setPendingDelete(null);
    setBusy(false);
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Image library"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-xl"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.35, ease: BEZIER.luxe }}
        className="glass flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.75rem]"
      >
        <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-light text-ivory">Images</h2>
            <p className="mt-0.5 font-sans text-2xs uppercase tracking-luxe text-ivory/35">
              {backend === 'supabase' ? 'Supabase Storage' : 'Stored in your database'}
              {items && ' · ' + items.length + ' uploaded'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-full border border-line-2 text-ivory/60 transition-colors hover:border-accent/60 hover:text-accent"
          >
            <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-3 border-b border-line px-6 py-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
            multiple
            className="sr-only"
            onChange={(e) => upload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-2.5 font-sans text-2xs uppercase tracking-luxe text-onaccent transition-colors hover:bg-champagne-light disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
            )}
            Upload
          </button>

          <span className="font-sans text-2xs uppercase tracking-luxe text-ivory/25">or</span>

          <div className="flex min-w-[15rem] flex-1 gap-2">
            <label htmlFor="media-url" className="sr-only">
              Paste an image address
            </label>
            <input
              id="media-url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste an image address"
              className="w-full rounded-xl border border-line bg-fill px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-accent/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => urlInput.trim() && onPick(urlInput.trim())}
              disabled={!urlInput.trim()}
              className="shrink-0 rounded-xl border border-line-2 px-4 font-sans text-2xs uppercase tracking-luxe text-ivory/60 transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-40"
            >
              Use
            </button>
          </div>

          {current && (
            <button
              type="button"
              onClick={() => onPick(null)}
              className="inline-flex items-center gap-2 rounded-full border border-line-2 px-4 py-2.5 font-sans text-2xs uppercase tracking-luxe text-ivory/55 transition-colors hover:border-danger/50 hover:text-danger"
            >
              Use the default
            </button>
          )}
        </div>

        {error && (
          <p role="alert" className="border-b border-line px-6 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {items === null ? (
            <p className="py-12 text-center text-sm text-ivory/30">Loading…</p>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <ImagePlus
                className="mx-auto h-7 w-7 text-ivory/20"
                strokeWidth={1.3}
                aria-hidden="true"
              />
              <p className="mt-4 font-display text-xl font-light text-ivory">No images yet.</p>
              <p className="mx-auto mt-2 max-w-[44ch] text-sm text-ivory/40">
                Upload straight from your phone — pictures are resized and compressed
                automatically, so a large photo will not slow the site down.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((m) => {
                const selected = current === m.url;
                return (
                  <li key={m.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => onPick(m.url)}
                      className={cn(
                        'block w-full overflow-hidden rounded-xl border transition-colors',
                        selected ? 'border-accent' : 'border-line hover:border-line-3',
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.url}
                        alt={m.alt || m.filename}
                        loading="lazy"
                        className="aspect-square w-full object-cover"
                      />
                    </button>

                    {selected && (
                      <span className="pointer-events-none absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-champagne text-onaccent">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setPendingDelete({ id: m.id, url: m.url })}
                      aria-label={'Delete ' + m.filename}
                      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border border-line-2 bg-ink/70 text-ivory/50 opacity-0 backdrop-blur-md transition-all focus-visible:opacity-100 group-hover:opacity-100 hover:border-danger/60 hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    </button>

                    <p className="mt-1.5 truncate font-sans text-2xs text-ivory/30">
                      {m.width}×{m.height} · {Math.round(m.bytes / 1024)} KB
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <ConfirmBar
          open={Boolean(pendingDelete)}
          message="Delete this image? Anywhere it is used will fall back to the default."
          confirming={busy}
          className="mx-4 mb-4 mt-0"
          onConfirm={confirmRemove}
          onCancel={() => setPendingDelete(null)}
        />
      </motion.div>
    </motion.div>
  );
}
