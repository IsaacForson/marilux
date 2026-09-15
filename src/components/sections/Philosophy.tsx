'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import Reveal from '@/components/ui/Reveal';
import Marquee from '@/components/ui/Marquee';

const STATEMENT =
  'We believe beauty is not applied. It is revealed — through measurement, through patience, and through hands that have done this ten thousand times before yours.';

const PROOF = [
  'Medical-grade sterilisation',
  'Trained for deep complexions',
  'Single-use tooling',
  'Certified specialists',
  'Honest timelines',
  'Private treatment suites',
];

/**
 * Scroll-linked statement.
 *
 * Words illuminate as the section passes through the viewport. Only opacity is
 * animated — a scrubbed stagger across inline spans — so the effect costs one
 * compositor pass per frame regardless of word count.
 */
export default function Philosophy() {
  const root = useRef<HTMLElement>(null);
  const words = STATEMENT.split(' ');

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el.querySelectorAll('[data-lit]'), { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-lit]',
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.4,
          scrollTrigger: {
            trigger: '[data-statement]',
            start: 'top 78%',
            end: 'bottom 58%',
            scrub: 0.5,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="philosophy"
      className="relative border-y border-white/[0.07] py-24 sm:py-36"
      aria-labelledby="philosophy-title"
    >
      <div className="shell">
        <Reveal y={14}>
          <p className="eyebrow mb-10 flex items-center gap-3">
            <span className="h-px w-10 bg-champagne/45" aria-hidden="true" />
            Our philosophy
          </p>
        </Reveal>

        <h2
          id="philosophy-title"
          data-statement
          className="font-display text-[clamp(1.7rem,4.4vw,3.6rem)] font-light leading-[1.22] tracking-[-0.01em] text-ivory"
        >
          {words.map((w, i) => (
            <span key={w + i} data-lit className="inline-block">
              {w}
              {i < words.length - 1 && <span>&nbsp;</span>}
            </span>
          ))}
        </h2>
      </div>

      <div className="mt-20 border-t border-white/[0.07] py-6">
        <Marquee
          items={PROOF}
          className="font-sans text-2xs uppercase tracking-wide2 text-ivory/45"
        />
      </div>
    </section>
  );
}
