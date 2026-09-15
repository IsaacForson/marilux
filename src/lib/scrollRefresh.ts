'use client';

import { ScrollTrigger } from '@/lib/gsap';

let scheduled = 0;

/**
 * Coalesced ScrollTrigger refresh.
 *
 * `ScrollTrigger.refresh()` re-measures *every* registered trigger, so calling
 * it once per mounting component is quadratic — a page with seventy reveals
 * would do seventy full passes during hydration. Batching them into a single
 * trailing refresh gives identical correctness for one pass.
 */
export function requestScrollRefresh() {
  if (scheduled) window.clearTimeout(scheduled);
  scheduled = window.setTimeout(() => {
    scheduled = 0;
    ScrollTrigger.refresh();
  }, 120);
}
