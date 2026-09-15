'use client';

import { useCallback, useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';
import Plate from '@/components/ui/Plate';
import type { ImageTheme } from '@/lib/data/images';
import { clamp, cn } from '@/lib/utils';

/**
 * Before / after comparison.
 *
 * The divider is driven by a real range input, so it is keyboard operable and
 * announced correctly, with pointer dragging layered on top. Position is held
 * in a CSS custom property and applied with clip-path — no layout, no reflow.
 */
export default function BeforeAfter({
  beforeSrc,
  afterSrc,
  theme = 'portrait',
  beforeIndex = 0,
  afterIndex = 1,
  alt,
  caption,
  ratio = 'aspect-[4/5]',
  className,
}: {
  beforeSrc?: string;
  afterSrc?: string;
  /** Photography pool both panes draw from. */
  theme?: ImageTheme;
  beforeIndex?: number;
  afterIndex?: number;
  alt: string;
  caption?: string;
  ratio?: string;
  className?: string;
}) {
  const [pos, setPos] = useState(52);
  const frame = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(clamp(((clientX - rect.left) / rect.width) * 100, 2, 98));
  }, []);

  return (
    <figure className={cn('group', className)}>
      <div
        ref={frame}
        className={cn('relative select-none overflow-hidden rounded-[1.75rem]', ratio)}
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        style={{ ['--pos' as string]: pos + '%' }}
      >
        {/* After (base layer) */}
        <Plate
          src={afterSrc}
          alt={alt + ' — after'}
          theme={theme}
          index={afterIndex}
          ratio="absolute inset-0"
          rounded="rounded-none"
          className="h-full w-full"
        />

        {/* Before (clipped to the left of the divider) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: 'inset(0 calc(100% - var(--pos)) 0 0)' }}
        >
          <Plate
            src={beforeSrc}
            alt={alt + ' — before'}
            theme={theme}
            index={beforeIndex}
            ratio="absolute inset-0"
            rounded="rounded-none"
            className="h-full w-full grayscale-[0.35]"
          />
        </div>

        {/* Labels */}
        <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-line-2 bg-ink/50 px-3 py-1.5 font-sans text-2xs uppercase tracking-luxe text-ivory/75 backdrop-blur-md">
          Before
        </span>
        <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-accent/30 bg-ink/50 px-3 py-1.5 font-sans text-2xs uppercase tracking-luxe text-accent backdrop-blur-md">
          After
        </span>

        {/* Divider */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px bg-accent/80 shadow-[0_0_24px_rgba(217,188,140,0.55)]"
          style={{ left: 'var(--pos)' }}
        >
          <span className="absolute top-1/2 left-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-accent/60 bg-ink/70 text-accent backdrop-blur-md transition-transform duration-500 ease-luxe group-hover:scale-110">
            <MoveHorizontal className="h-4 w-4" strokeWidth={1.4} />
          </span>
        </div>

        {/* Accessible control */}
        <label className="sr-only" htmlFor={'ba-' + alt.replace(/\W+/g, '-')}>
          {alt} — drag to compare before and after
        </label>
        <input
          id={'ba-' + alt.replace(/\W+/g, '-')}
          type="range"
          min={2}
          max={98}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-valuetext={Math.round(pos) + '% of the before image shown'}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>

      {caption && (
        <figcaption className="mt-4 text-sm leading-relaxed text-ivory/45">{caption}</figcaption>
      )}
    </figure>
  );
}
