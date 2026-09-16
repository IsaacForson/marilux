'use client';

import { useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { SITE } from '@/lib/data/site';
import { TOTAL_SERVICE_COUNT } from '@/lib/data/services';
import { scrollTo } from '@/components/providers/SmoothScroll';
import SplitHeading from '@/components/ui/SplitHeading';
import { ButtonLink } from '@/components/ui/Button';
import Plate from '@/components/ui/Plate';
import Aura from '@/components/ui/Aura';

const MARKS = [
  { value: '6', label: 'years in practice' },
  { value: String(TOTAL_SERVICE_COUNT), label: 'treatments offered' },
  { value: '4.9', label: 'average rating' },
];

/**
 * Opening frame.
 *
 * The LCP element is type, not an image, so the first paint is immediate. All
 * scroll-linked motion here is scrubbed transform/opacity on three elements —
 * enough to feel cinematic, cheap enough to never touch the frame budget.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.set('[data-hero-fade]', { opacity: 1 });

      gsap
        .timeline({ delay: 0.35 })
        .from('[data-hero-eyebrow]', { opacity: 0, y: 16, duration: 0.9 })
        .from('[data-hero-lede]', { opacity: 0, y: 22, duration: 1 }, 0.75)
        .from('[data-hero-cta] > *', { opacity: 0, y: 24, duration: 0.9, stagger: 0.1 }, 0.9)
        .from('[data-hero-mark]', { opacity: 0, y: 18, duration: 0.8, stagger: 0.08 }, 1.05)
        .from(
          '[data-hero-plate]',
          { opacity: 0, y: 60, scale: 0.96, duration: 1.4, stagger: 0.12, ease: 'expo.out' },
          0.5,
        )
        .from('[data-hero-cue]', { opacity: 0, duration: 0.8 }, 1.4);

      // Depth on scroll: the headline drifts slower than the plates.
      gsap.to('[data-hero-copy]', {
        yPercent: 14,
        opacity: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
      });

      gsap.to('[data-hero-plate="back"]', {
        yPercent: -16,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
      });

      gsap.to('[data-hero-plate="front"]', {
        yPercent: -34,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-36"
      aria-labelledby="hero-title"
    >
      <Aura className="-left-40 top-[-10%]" color="rgba(217,188,140,0.20)" size={720} />
      <Aura className="-right-32 bottom-[-18%]" color="rgba(192,138,126,0.17)" size={640} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grain" />

      <div className="shell relative grid w-full items-center gap-14 lg:grid-cols-[1.1fr,0.9fr] lg:gap-8">
        {/* Copy */}
        <div data-hero-copy className="relative z-10 gpu">
          <p
            data-hero-eyebrow
            data-hero-fade
            className="eyebrow mb-7 flex items-center gap-3 opacity-0"
          >
            <span className="h-px w-10 bg-accent/45" aria-hidden="true" />
            Hebron, Accra — est. {SITE.founded}
          </p>

          <SplitHeading
            as="h1"
            id="hero-title"
            text="Beauty held to a higher standard."
            accent={[[3, 4]]}
            className="display-xl max-w-[13ch]"
            immediate
            delay={0.45}
            stagger={0.07}
          />

          <p
            data-hero-lede
            data-hero-fade
            className="lede mt-8 max-w-[46ch] opacity-0 sm:mt-10"
          >
            Brows, lashes, hair, nails, skin and spa — performed by specialists who treat
            precision as a form of care. This is not a salon visit. It is an appointment with
            your own reflection.
          </p>

          <div
            data-hero-cta
            data-hero-fade
            className="mt-10 flex flex-wrap items-center gap-3 opacity-0 sm:mt-12"
          >
            <ButtonLink href="/booking" size="lg" magnetic arrow>
              Reserve your seat
            </ButtonLink>
            <ButtonLink href="/services" variant="outline" size="lg">
              Explore the house
            </ButtonLink>
          </div>

          <dl className="mt-12 flex flex-wrap gap-x-8 gap-y-5 sm:mt-16 sm:gap-x-10 sm:gap-y-6">
            {MARKS.map((m) => (
              <div key={m.label} data-hero-mark data-hero-fade className="opacity-0">
                <dt className="sr-only">{m.label}</dt>
                <dd>
                  <span className="block font-display text-3xl font-light text-accent sm:text-4xl">
                    {m.value}
                  </span>
                  <span className="mt-1.5 block font-sans text-2xs uppercase tracking-luxe text-ivory/40">
                    {m.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Floating plate cluster */}
        <div className="relative hidden h-[560px] lg:block xl:h-[640px]" aria-hidden="true">
          <div
            data-hero-plate="back"
            className="absolute right-[6%] top-0 w-[62%] gpu"
          >
            <Plate
              theme="portrait"
              index={0}
              priority
              sizes="(max-width: 1024px) 0px, 34vw"
              ratio="aspect-[3/4]"
              className="shadow-[0_50px_120px_-45px_rgba(0,0,0,0.95)]"
            />
          </div>

          <div
            data-hero-plate="front"
            className="absolute bottom-4 left-0 w-[52%] animate-float gpu"
          >
            <Plate
              theme="makeup"
              index={1}
              sizes="(max-width: 1024px) 0px, 28vw"
              ratio="aspect-[4/5]"
              className="shadow-[0_50px_120px_-45px_rgba(0,0,0,0.95)]"
            />
          </div>

          {/* This card floats over photography whose brightness we do not
              control, so it carries its own dark backing rather than relying on
              `glass` — over a pale image the translucent version left the quote
              unreadable. `on-media` pins the type light in both themes. */}
          <div
            data-hero-plate="tag"
            className="on-media absolute bottom-[22%] right-[2%] max-w-[13rem] rounded-2xl border border-white/12 bg-[#0B0A09]/85 p-5 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          >
            <p className="font-display text-lg leading-snug text-ivory">
              &ldquo;They measured my face for twenty minutes before they touched me.&rdquo;
            </p>
            <p className="mt-3 font-sans text-2xs uppercase tracking-luxe text-accent">
              Adwoa M. — East Legon
            </p>
          </div>
        </div>
      </div>

      <button
        data-hero-cue
        data-hero-fade
        type="button"
        onClick={() => scrollTo('#philosophy', -40)}
        className="group absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2.5 opacity-0 sm:flex"
        aria-label="Scroll to content"
      >
        <span className="font-sans text-2xs uppercase tracking-wide2 text-ivory/35 transition-colors group-hover:text-accent">
          Scroll
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-full border border-line-2 text-ivory/50 transition-all duration-500 group-hover:translate-y-0.5 group-hover:border-accent/60 group-hover:text-accent">
          <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.4} aria-hidden="true" />
        </span>
      </button>
    </section>
  );
}
