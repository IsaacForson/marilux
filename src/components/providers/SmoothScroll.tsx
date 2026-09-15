'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/** Exposed so any component can pause scroll (modals, lightbox, mobile menu). */
let lenisInstance: Lenis | null = null;

export const lockScroll = () => lenisInstance?.stop();
export const unlockScroll = () => lenisInstance?.start();
export const scrollTo = (target: string | number | HTMLElement, offset = 0) => {
  if (lenisInstance) lenisInstance.scrollTo(target, { offset, duration: 1.4 });
  else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  }
};

/**
 * Lenis smooth scrolling, driven by the GSAP ticker.
 *
 * Running both on one rAF loop is the difference between silk and jitter —
 * two independent loops fight each other and drop frames on scroll-linked
 * animations. Native scrolling is kept on touch devices, where it is both
 * smoother and cheaper than a JS-driven emulation.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });

    lenisInstance = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  // A route change must reset scroll position and re-measure every trigger,
  // otherwise pinned sections on the new page inherit stale start/end values.
  useEffect(() => {
    lenisInstance?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 180);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return <>{children}</>;
}
