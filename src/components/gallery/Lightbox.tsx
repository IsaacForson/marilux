'use client';

import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { GalleryItem } from '@/lib/data/gallery';
import { BEZIER } from '@/lib/motion';
import { lockScroll, unlockScroll } from '@/components/providers/SmoothScroll';
import Plate from '@/components/ui/Plate';
import BeforeAfter from './BeforeAfter';

/**
 * Full-screen viewer.
 *
 * Focus is trapped by rendering the dialog as a modal overlay with scroll
 * locked, and arrow keys move between items — the two things that separate a
 * lightbox that feels considered from one that feels bolted on.
 */
export default function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const open = index !== null;
  const item = open ? items[index] : null;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onNavigate((index + delta + items.length) % items.length);
    },
    [index, items.length, onNavigate],
  );

  useEffect(() => {
    if (!open) return;
    lockScroll();
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      unlockScroll();
    };
  }, [open, onClose, step]);

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[160] flex flex-col bg-ink/95 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between px-[var(--edge)] py-5">
            <p className="font-sans text-2xs uppercase tracking-luxe text-ivory/45">
              {index + 1} / {items.length} — {item.category}
            </p>
            <button
              type="button"
              onClick={onClose}
              autoFocus
              aria-label="Close gallery"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/12 text-ivory/70 transition-colors duration-500 hover:border-champagne/60 hover:text-champagne"
            >
              <X className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center gap-3 px-[var(--edge)] pb-4 sm:gap-6">
            <NavButton dir="prev" onClick={() => step(-1)} />

            <motion.figure
              key={item.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: BEZIER.luxe }}
              className="flex min-h-0 flex-1 flex-col items-center"
            >
              <div className="flex min-h-0 w-full flex-1 items-center justify-center">
                <div className="max-h-full w-full max-w-2xl">
                  {item.kind === 'before-after' ? (
                    <BeforeAfter
                      alt={item.title}
                      beforeSeed={item.seed}
                      afterSeed={(item.seed + 90) % 360}
                      ratio="aspect-[4/5]"
                    />
                  ) : (
                    <Plate
                      src={item.src}
                      alt={item.title}
                      seed={item.seed}
                      ratio="aspect-[4/5]"
                      sizes="(max-width: 768px) 92vw, 42rem"
                    />
                  )}
                </div>
              </div>

              <figcaption className="mt-5 max-w-[60ch] text-center">
                <p className="font-display text-xl font-light text-ivory">{item.title}</p>
                {item.caption && (
                  <p className="mt-2 text-sm leading-relaxed text-ivory/45">{item.caption}</p>
                )}
              </figcaption>
            </motion.figure>

            <NavButton dir="next" onClick={() => step(1)} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NavButton({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  const Icon = dir === 'prev' ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Previous image' : 'Next image'}
      className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/12 text-ivory/70 transition-all duration-500 hover:border-champagne/60 hover:text-champagne"
    >
      <Icon className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
    </button>
  );
}
