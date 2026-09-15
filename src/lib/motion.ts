/**
 * Shared motion language.
 *
 * One easing vocabulary across GSAP and Framer Motion keeps the whole site
 * feeling like it was choreographed by one hand.
 */

/** GSAP easing names. */
export const EASE = {
  out: 'power3.out',
  inOut: 'power2.inOut',
  expo: 'expo.out',
  silk: 'power4.out',
} as const;

/** Framer Motion cubic-bezier equivalents. */
export const BEZIER = {
  luxe: [0.22, 1, 0.36, 1] as const,
  silk: [0.65, 0, 0.35, 1] as const,
  soft: [0.33, 1, 0.68, 1] as const,
};

export const DURATION = {
  fast: 0.4,
  base: 0.7,
  slow: 1.1,
  cinema: 1.6,
} as const;

/** Standard reveal used by most sections. */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: BEZIER.luxe, delay: i * 0.07 },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.slow, ease: BEZIER.soft } },
};

export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
