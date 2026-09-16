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
 * LCP is unaffected and the reveal is purely transform and opacity.
 *
 * A single curtain rather than staggered panels: panels reveal the hero's
 * ambient gradient at different moments, which reads as rectangular seams
 * rather than as a wipe, and is especially obvious in light mode where the
 * panel and the page share a background colour.
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

      // Each word rises, holds, then leaves exactly as the next arrives — the
      // three share one clipping window, so their timings must interlock
      // rather than overlap. ENTER is the travel time, STEP the cadence; the
      // difference between them is how long a word stands still.
      const ENTER = 0.5;
      const STEP = 0.72;
      const last = WORDS.length - 1;

      tl.to(count, {
        v: 100,
        duration: STEP * last + ENTER,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (counter.current) {
            counter.current.textContent = String(Math.round(count.v)).padStart(3, '0');
          }
        },
      });

      const words = gsap.utils.toArray<HTMLElement>('[data-intro-word]');
      words.forEach((word, i) => {
        tl.fromTo(
          word,
          { yPercent: 115 },
          { yPercent: 0, duration: ENTER, ease: 'expo.out' },
          i * STEP,
        );
        // The final word is carried away by the curtain instead of exiting.
        if (i < last) {
          tl.to(word, { yPercent: -115, duration: ENTER, ease: 'expo.in' }, (i + 1) * STEP);
        }
      });

      tl.to('[data-intro-rule]', { scaleX: 1, duration: STEP * last + ENTER, ease: 'power2.inOut' }, 0)
        .to('[data-intro-meta]', { opacity: 0, duration: 0.3 }, '>-0.15')
        .to('[data-intro-curtain]', { yPercent: -100, duration: 0.85, ease: 'expo.inOut' }, '>-0.1');
    }, root);

    return () => ctx.revert();
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-0 z-[200]"
      aria-hidden="true"
    >
      <div
        data-intro-curtain
        className="grain absolute inset-0 flex items-center justify-center bg-ink gpu"
      >
        <div className="flex flex-col items-center">
          {/* The clip height must resolve against the display size, not the
              inherited body size, or each word is sliced in half. */}
          <div className="display-md h-[1.15em] overflow-hidden leading-[1.15]">
            {/* `gold-text` must sit on each word, not on a shared wrapper:
                background-clip:text on an inline element that contains block
                children fragments its background box, and the text paints
                transparent with nothing behind it. */}
            {WORDS.map((w) => (
              <span key={w} data-intro-word className="gold-text block gpu">
                {w}
              </span>
            ))}
          </div>

          <div
            data-intro-rule
            className="mt-7 h-px w-[min(38vw,320px)] origin-left scale-x-0 bg-accent/45"
          />

          <span
            data-intro-meta
            className="mt-5 font-sans text-2xs uppercase tracking-wide2 text-ivory/45"
          >
            <span ref={counter}>000</span> — Accra
          </span>
        </div>
      </div>
    </div>
  );
}
