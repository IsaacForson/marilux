'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, SlidersHorizontal } from 'lucide-react';
import { GALLERY_FILTERS, type GalleryItem } from '@/lib/data/gallery';
import { BEZIER } from '@/lib/motion';
import { cn } from '@/lib/utils';
import Plate from '@/components/ui/Plate';
import Lightbox from './Lightbox';

/** Varied aspect ratios are what give a columns masonry its rhythm. */
const RATIO: Record<GalleryItem['span'], string> = {
  tall: 'aspect-[3/5]',
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
  wide: 'aspect-[16/11]',
};

/**
 * Filterable portfolio.
 *
 * A CSS columns/grid masonry keeps layout on the browser rather than in JS, so
 * filtering never triggers a measure-and-reposition pass. Items animate with
 * transform and opacity only, which keeps the re-flow at 60fps.
 */
export default function MasonryGrid({ items: source }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<string>('all');
  const [active, setActive] = useState<number | null>(null);

  const items = useMemo(
    () => (filter === 'all' ? source : source.filter((g) => g.categorySlug === filter)),
    [filter, source],
  );

  return (
    <>
      {/* Filters */}
      <div className="mb-12">
        <p className="mb-5 flex items-center gap-2.5 font-sans text-2xs uppercase tracking-luxe text-ivory/35">
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          Filter the portfolio
        </p>

        <div
          role="tablist"
          aria-label="Gallery categories"
          className="no-scrollbar -mx-[var(--edge)] flex items-center gap-2 overflow-x-auto px-[var(--edge)]"
        >
          {GALLERY_FILTERS.map((f) => {
            const selected = filter === f.slug;
            return (
              <button
                key={f.slug}
                role="tab"
                aria-selected={selected}
                onClick={() => setFilter(f.slug)}
                className={cn(
                  'inline-flex shrink-0 items-center rounded-full border px-5 py-2.5 font-sans text-2xs uppercase leading-none tracking-luxe transition-all duration-500 ease-luxe',
                  selected
                    ? 'border-accent bg-champagne text-onaccent'
                    : 'border-line text-ivory/50 hover:border-accent/50 hover:text-accent',
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        Showing {items.length} items
      </p>

      {/* A columns masonry lets the browser do the packing: filtering never
          triggers a JS measure-and-reposition pass. */}
      <div className="columns-2 gap-3 sm:gap-4 lg:columns-3 xl:columns-4">
        {items.map((item, i) => (
          <motion.figure
            key={item.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: BEZIER.luxe, delay: Math.min(i, 8) * 0.04 }}
            className="group relative mb-3 break-inside-avoid gpu sm:mb-4"
          >
            <button
              type="button"
              onClick={() => setActive(source.indexOf(item))}
              data-cursor="view"
              className="block h-full w-full text-left"
              aria-label={'View ' + item.title}
            >
              <Plate
                src={item.src}
                alt={item.title}
                theme={item.theme}
                index={item.index}
                ratio={RATIO[item.span]}
                scrim
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="h-full transition-transform duration-[1100ms] ease-luxe group-hover:scale-[1.06]"
              >
                {item.kind === 'video' && (
                  <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-line-3 bg-ink/50 text-ivory backdrop-blur-md">
                    <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  </span>
                )}
                {item.kind === 'before-after' && (
                  <span className="absolute right-4 top-4 rounded-full border border-accent/40 bg-ink/50 px-3 py-1.5 font-sans text-2xs uppercase tracking-luxe text-accent backdrop-blur-md">
                    Before / After
                  </span>
                )}
              </Plate>

              <figcaption className="on-media absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-700 ease-luxe group-hover:translate-y-0 group-hover:opacity-100 sm:p-5">
                <span className="block font-sans text-2xs uppercase tracking-luxe text-accent/80">
                  {item.category}
                </span>
                <span className="mt-1.5 block font-display text-base font-light leading-snug text-ivory sm:text-lg">
                  {item.title}
                </span>
              </figcaption>
            </button>
          </motion.figure>
        ))}
      </div>

      <Lightbox
        items={source}
        index={active}
        onClose={() => setActive(null)}
        onNavigate={setActive}
      />
    </>
  );
}
