'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Single registration point for GSAP plugins.
 *
 * Importing this module anywhere on the client guarantees ScrollTrigger is
 * registered exactly once, and that our global defaults apply everywhere.
 */
if (typeof window !== 'undefined' && !(gsap.core as unknown as { __marilux?: boolean }).__marilux) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 0.9 });
  // Only recalculate on width changes; mobile URL-bar height changes must not
  // trigger a full ScrollTrigger refresh mid-scroll.
  ScrollTrigger.config({ ignoreMobileResize: true });
  (gsap.core as unknown as { __marilux?: boolean }).__marilux = true;
}

export { gsap, ScrollTrigger };
