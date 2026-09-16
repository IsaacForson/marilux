'use client';

import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BEZIER } from '@/lib/motion';
import { lockScroll, unlockScroll } from '@/components/providers/SmoothScroll';

export default function LeaveBookingModal({
  open,
  onStay,
  onLeave,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  const titleId = useId();
  const stayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    document.body.style.overflow = 'hidden';
    stayRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onStay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      unlockScroll();
    };
  }, [open, onStay]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: BEZIER.luxe }}
          className="fixed inset-0 z-[140] flex items-center justify-center bg-ink/80 p-5 backdrop-blur-xl"
          onClick={(e) => {
            if (e.target === e.currentTarget) onStay();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.4, ease: BEZIER.luxe }}
            className="glass w-full max-w-md rounded-[1.75rem] px-7 py-8 sm:px-9 sm:py-9"
          >
            <p className="eyebrow mb-4">Unfinished booking</p>
            <h2 id={titleId} className="display-sm">
              Leave this page?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ivory/55">
              If you leave now, everything you have entered will be cleared and you will start
              again next time.
            </p>

            <div className="mt-8 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onLeave}
                className="inline-flex items-center justify-center rounded-full border border-line-2 px-6 py-3 font-sans text-2xs uppercase tracking-luxe text-ivory/55 transition-colors hover:border-danger/50 hover:text-danger"
              >
                Leave and clear
              </button>
              <button
                ref={stayRef}
                type="button"
                onClick={onStay}
                className="inline-flex items-center justify-center rounded-full bg-champagne px-6 py-3 font-sans text-2xs uppercase tracking-luxe text-onaccent transition-colors hover:bg-champagne-light"
              >
                Stay
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
