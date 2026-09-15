'use client';

import { useRef, type ElementType } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { cn } from '@/lib/utils';

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Word index ranges rendered in the gold sheen, e.g. [[2, 4]]. */
  accent?: Array<[number, number]>;
  delay?: number;
  stagger?: number;
  /** Play immediately on mount rather than waiting for scroll. */
  immediate?: boolean;
  start?: string;
  /** Forwarded to the rendered element (e.g. an id referenced by aria-labelledby). */
  id?: string;
};

/**
 * Word-by-word rise animation.
 *
 * Each word sits in its own clipping wrapper, so words emerge from behind a
 * hard edge rather than simply fading — the detail that reads as "expensive".
 * Splitting by word (not character) keeps the node count low and leaves the
 * text fully selectable and legible to screen readers via aria-label.
 */
export default function SplitHeading({
  text,
  as: Tag = 'h2',
  className,
  accent = [],
  delay = 0,
  stagger = 0.055,
  immediate = false,
  start = 'top 85%',
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(' ');

  const isAccent = (i: number) => accent.some(([a, b]) => i >= a && i <= b);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(
        el.querySelectorAll('[data-word]'),
        { yPercent: 118 },
        {
          yPercent: 0,
          duration: 1.15,
          ease: 'expo.out',
          stagger,
          delay,
          ...(immediate
            ? {}
            : { scrollTrigger: { trigger: el, start, once: true, invalidateOnRefresh: true } }),
        },
      );
    }, ref);

    return () => ctx.revert();
  }, [text, delay, stagger, immediate, start]);

  return (
    <Tag ref={ref} id={id} data-anim="" className={cn('gpu', className)} aria-label={text}>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span
            key={word + i}
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBottom: '0.08em', marginBottom: '-0.08em' }}
          >
            <span
              data-word
              className={cn('inline-block gpu', isAccent(i) && 'gold-text')}
            >
              {word}
            </span>
            {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </span>
    </Tag>
  );
}
