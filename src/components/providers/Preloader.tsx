'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';

const WORDS = ['Precision', 'Artistry', 'Marilux'];

/**
 * First-visit curtain.
 *
 * Shown once per session so returning navigation never pays the cost twice.
 * The DOM behind it is already painted — this is an overlay, not a gate — so
 * LCP is unaffected and the reveal is purely a transform/opacity animation.
 */
export default function Preloader() {
  const [active, setActive] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem('marilux:intro');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduced) {
      document.documentElement.classList.add('intro-done');
      return;
    }
    setActive(true);
    document.body.style.overflow = 'hidden';
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!active) return;

    const ctx = gsap.context(() => {
      const count = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem('marilux:intro', '1');
          document.body.style.overflow = '';
          document.documentElement.classList.add('intro-done');
          setActive(false);
        },
      });

      tl.to(count, {
        v: 100,
        duration: 1.9,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (counter.current) {
            counter.current.textContent = String(Math.round(count.v)).padStart(3, '0');
          }
        },
      })
        .from(
          '[data-intro-word]',
          { yPercent: 115, duration: 0.9, stagger: 0.42, ease: 'expo.out' },
          0.1,
        )
        .to('[data-intro-word]', { yPercent: -115, duration: 0.7, stagger: 0.42 }, 0.72)
        .to('[data-intro-rule]', { scaleX: 1, duration: 1.8, ease: 'power2.inOut' }, 0.1)
        .to('[data-intro-meta]', { opacity: 0, duration: 0.4 }, '-=0.3')
        .to('[data-intro-panel]', {
          yPercent: -100,
          duration: 1.1,
          ease: 'expo.inOut',
          stagger: 0.06,
        });
    }, root);

    return () => ctx.revert();
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} data-intro-panel className="h-full flex-1 bg-ink gpu" />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="h-[1.15em] overflow-hidden">
          <div className="display-md gold-text">
            {WORDS.map((w) => (
              <span key={w} data-intro-word className="block gpu">
                {w}
              </span>
            ))}
          </div>
        </div>
        <div
          data-intro-rule
          className="mt-8 h-px w-[min(38vw,320px)] origin-left scale-x-0 bg-champagne/40"
        />
        <span
          data-intro-meta
          className="mt-5 font-sans text-2xs uppercase tracking-wide2 text-ivory/40"
        >
          <span ref={counter}>000</span> — Accra
        </span>
      </div>
    </div>
  );
}
