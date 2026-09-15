'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * A restrained pointer companion: a hairline ring that trails the cursor and
 * opens up over interactive elements.
 *
 * Mounted only for fine pointers, and driven entirely by gsap.quickTo — which
 * writes a single transform per frame instead of triggering React renders.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(fine && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled || !ring.current || !dot.current) return;

    const ringX = gsap.quickTo(ring.current, 'x', { duration: 0.55, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring.current, 'y', { duration: 0.55, ease: 'power3.out' });
    const dotX = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3.out' });

    let visible = false;

    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([ring.current, dot.current], { opacity: 1, duration: 0.3 });
      }
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };

    const onLeave = () => {
      visible = false;
      gsap.to([ring.current, dot.current], { opacity: 0, duration: 0.25 });
    };

    const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, [data-cursor]';

    const onOver = (e: Event) => {
      const el = (e.target as HTMLElement)?.closest?.(INTERACTIVE);
      if (!el) return;
      const label = el.getAttribute('data-cursor');
      gsap.to(ring.current, {
        scale: label === 'view' ? 3.2 : 1.9,
        borderColor: 'rgba(217,188,140,0.85)',
        duration: 0.4,
        ease: 'power3.out',
      });
      gsap.to(dot.current, { scale: 0, duration: 0.3 });
    };

    const onOut = (e: Event) => {
      if (!(e.target as HTMLElement)?.closest?.(INTERACTIVE)) return;
      gsap.to(ring.current, {
        scale: 1,
        borderColor: 'rgba(244,239,231,0.35)',
        duration: 0.4,
        ease: 'power3.out',
      });
      gsap.to(dot.current, { scale: 1, duration: 0.3 });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerover', onOver, true);
    document.addEventListener('pointerout', onOut, true);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerover', onOver, true);
      document.removeEventListener('pointerout', onOut, true);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[150]">
      <div
        ref={ring}
        className="absolute -left-4 -top-4 h-8 w-8 rounded-full border opacity-0"
        style={{ borderColor: 'rgba(244,239,231,0.35)' }}
      />
      <div
        ref={dot}
        className="absolute -left-[2px] -top-[2px] h-1 w-1 rounded-full bg-champagne opacity-0"
      />
    </div>
  );
}
