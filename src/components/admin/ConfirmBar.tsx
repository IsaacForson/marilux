'use client';

import { useEffect, useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Trash2, X } from 'lucide-react';
import { BEZIER } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Confirm a destructive action with the same sticky glass card as SaveBar.
 *
 * Native `window.confirm` is refused on this site — it breaks the room.
 */
export default function ConfirmBar({
  open,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  confirming = false,
  className,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
  className?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const messageId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || confirming) return;
      e.stopImmediatePropagation();
      onCancel();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, confirming, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="alertdialog"
          aria-describedby={messageId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.35, ease: BEZIER.luxe }}
          className={cn('sticky bottom-4 z-40 mt-8', className)}
        >
          <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.9)]">
            <p id={messageId} className="max-w-[54ch] text-sm text-ivory/60">
              {message}
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                disabled={confirming}
                className="inline-flex items-center gap-2 rounded-full border border-line-2 px-4 py-2.5 font-sans text-2xs uppercase tracking-luxe text-ivory/55 transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-40"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={confirming}
                className="inline-flex items-center gap-2 rounded-full border border-danger/45 bg-danger/15 px-6 py-2.5 font-sans text-2xs uppercase tracking-luxe text-danger transition-colors hover:bg-danger/25 disabled:opacity-40"
              >
                {confirming ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
                )}
                {confirmLabel}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
