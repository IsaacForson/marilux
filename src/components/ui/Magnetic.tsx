'use client';

import { useRef, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { cn } from '@/lib/utils';

/**
 * Magnetic pull toward the pointer.
 *
 * The inner content lags slightly behind the wrapper, which is what makes the
 * effect feel like weight rather than a snap. Pointer events are only bound on
 * fine pointers — on touch it is dead weight and a source of jank.
 */
export default function Magnetic({
  children,
  className,
  strength = 0.32,
  innerStrength = 0.16,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  innerStrength?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = wrap.current;
    const child = inner.current;
    if (!el || !child) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
    const cxTo = gsap.quickTo(child, 'x', { duration: 1.1, ease: 'elastic.out(1, 0.5)' });
    const cyTo = gsap.quickTo(child, 'y', { duration: 1.1, ease: 'elastic.out(1, 0.5)' });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      cxTo(dx * innerStrength);
      cyTo(dy * innerStrength);
    };

    const reset = () => {
      xTo(0);
      yTo(0);
      cxTo(0);
      cyTo(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', reset);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', reset);
    };
  }, [strength, innerStrength]);

  return (
    <div ref={wrap} className={cn('inline-block gpu', className)}>
      <div ref={inner} className="gpu">
        {children}
      </div>
    </div>
  );
}
