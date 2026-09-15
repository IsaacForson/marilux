'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';

/**
 * Route transition.
 *
 * `template.tsx` remounts on every navigation, so a mount animation here gives
 * us an entry curtain without the exit-animation gymnastics AnimatePresence
 * requires in the App Router. The curtain is removed from the tree as soon as
 * it finishes so nothing composites over the page during scroll.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const curtain = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add('js-ready');
  }, []);

  useIsomorphicLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      if (curtain.current) curtain.current.style.display = 'none';
      return;
    }

    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .set(curtain.current, { display: 'block' })
        .fromTo(
          curtain.current,
          { yPercent: 0 },
          {
            yPercent: -101,
            duration: 0.95,
            ease: 'expo.inOut',
            onComplete: () => {
              gsap.set(curtain.current, { display: 'none' });
            },
          },
        )
        .from(content.current, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.25);
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div
        ref={curtain}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[140] hidden bg-ink gpu"
      />
      <div ref={content}>{children}</div>
    </>
  );
}
