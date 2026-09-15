'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { requestScrollRefresh } from '@/lib/scrollRefresh';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { cn } from '@/lib/utils';

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Distance travelled, in pixels. */
  y?: number;
  delay?: number;
  duration?: number;
  /** Stagger direct children instead of animating the container as one block. */
  stagger?: number;
  /** ScrollTrigger start position. */
  start?: string;
  once?: boolean;
  blur?: boolean;
};

/**
 * The workhorse scroll reveal.
 *
 * Only opacity and transform are animated, so every reveal stays on the
 * compositor and off the main thread. Elements carry `data-anim`, which the
 * stylesheet hides *only* when JS has booted — so the page is fully readable
 * without JavaScript and there is no flash of hidden content.
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  className,
  y = 28,
  delay = 0,
  duration = 0.95,
  stagger,
  start = 'top 85%',
  once = true,
  blur = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const targets = stagger ? Array.from(el.children) : [el];
      if (stagger) {
        gsap.set(el, { opacity: 1 });
        targets.forEach((c) => (c as HTMLElement).setAttribute('data-anim', ''));
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y, filter: blur ? 'blur(8px)' : 'none' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration,
          delay,
          ease: 'power3.out',
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: el, start, once, invalidateOnRefresh: true },
        },
      );
    }, ref);

    // Batched with every other reveal mounting in the same tick.
    requestScrollRefresh();
    return () => ctx.revert();
  }, [y, delay, duration, stagger, start, once, blur]);

  return (
    <Tag ref={ref} data-anim="" className={cn('gpu', className)}>
      {children}
    </Tag>
  );
}
