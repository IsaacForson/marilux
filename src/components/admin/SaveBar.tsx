'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import { BEZIER } from '@/lib/motion';

/**
 * Sticky save bar.
 *
 * Appears only when something has changed, so the studio always knows whether
 * their edits are live — the most common anxiety in an admin form.
 */
export default function SaveBar({
  dirty,
  saving,
  onSave,
  onReset,
  message,
  error,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset?: () => void;
  message?: string | null;
  error?: string | null;
}) {
  return (
    <AnimatePresence>
      {(dirty || saving || message || error) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.35, ease: BEZIER.luxe }}
          className="sticky bottom-4 z-40 mt-8"
        >
          <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.9)]">
            <p
              role="status"
              aria-live="polite"
              className={
                'text-sm ' +
                (error ? 'text-danger' : message ? 'text-success' : 'text-ivory/60')
              }
            >
              {error ?? message ?? 'You have unsaved changes.'}
            </p>

            <div className="flex items-center gap-2.5">
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full border border-line-2 px-4 py-2.5 font-sans text-2xs uppercase tracking-luxe text-ivory/55 transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-40"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
                  Discard
                </button>
              )}
              <button
                type="button"
                onClick={onSave}
                disabled={saving || !dirty}
                className="inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-2.5 font-sans text-2xs uppercase tracking-luxe text-onaccent transition-colors hover:bg-champagne-light disabled:opacity-40"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
                )}
                Save changes
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
