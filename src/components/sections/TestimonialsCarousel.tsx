'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { FEATURED_TESTIMONIALS } from '@/lib/data/testimonials';
import { BEZIER } from '@/lib/motion';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';
import Plate from '@/components/ui/Plate';

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const total = FEATURED_TESTIMONIALS.length;

  const go = useCallback(
    (next: number) => {
      setDir(next > index || (index === total - 1 && next === 0) ? 1 : -1);
      setIndex((next + total) % total);
    },
    [index, total],
  );

  // Advance slowly, and stop the moment the visitor takes control.
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % total);
    }, 7000);
    return () => window.clearInterval(id);
  }, [auto, total]);

  const t = FEATURED_TESTIMONIALS[index];

  return (
    <section
      className="relative overflow-hidden border-y border-white/[0.07] py-24 sm:py-36"
      aria-labelledby="testimonials-title"
      onMouseEnter={() => setAuto(false)}
      onFocusCapture={() => setAuto(false)}
    >
      <div className="shell">
        <SectionHeader
          eyebrow="Client stories"
          title="In their words."
          accent={[[2, 2]]}
          as="h2"
          size="display-lg"
          align="center"
          className="mx-auto"
        />

        <div className="relative mt-16 min-h-[26rem] sm:min-h-[22rem]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.figure
              key={t.id}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.6, ease: BEZIER.luxe }}
              className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-[auto,1fr] sm:items-center"
            >
              <Plate
                alt={t.name}
                seed={60 + index * 41}
                ratio="aspect-square"
                rounded="rounded-full"
                className="mx-auto w-28 sm:w-36"
                sizes="144px"
              />

              <div className="text-center sm:text-left">
                <div
                  className="mb-6 flex justify-center gap-1 sm:justify-start"
                  aria-label={t.rating + ' out of 5 stars'}
                >
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-champagne text-champagne"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <blockquote className="font-display text-[clamp(1.35rem,2.6vw,2.1rem)] font-light leading-[1.35] text-ivory">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <figcaption className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-2xs uppercase tracking-luxe sm:justify-start">
                  <span className="text-champagne">{t.name}</span>
                  <span className="text-ivory/25" aria-hidden="true">
                    /
                  </span>
                  <span className="text-ivory/40">{t.service}</span>
                  <span className="text-ivory/25" aria-hidden="true">
                    /
                  </span>
                  <span className="text-ivory/40">{t.since}</span>
                </figcaption>
              </div>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous story"
            className="grid h-12 w-12 place-items-center rounded-full border border-white/12 text-ivory/70 transition-all duration-500 hover:border-champagne/60 hover:text-champagne"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
          </button>

          <ol className="flex items-center gap-2" aria-label="Story navigation">
            {FEATURED_TESTIMONIALS.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={'Story ' + (i + 1) + ' of ' + total}
                  aria-current={i === index ? 'true' : undefined}
                  className="group grid h-6 w-6 place-items-center"
                >
                  <span
                    className={
                      'block h-1 rounded-full transition-all duration-500 ease-luxe ' +
                      (i === index
                        ? 'w-7 bg-champagne'
                        : 'w-1.5 bg-ivory/25 group-hover:bg-ivory/50')
                    }
                  />
                </button>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next story"
            className="grid h-12 w-12 place-items-center rounded-full border border-white/12 text-ivory/70 transition-all duration-500 hover:border-champagne/60 hover:text-champagne"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
          </button>
        </div>

        <Reveal y={16} className="mt-14 text-center">
          <a
            href="/testimonials"
            className="font-sans text-2xs uppercase tracking-luxe text-ivory/45 underline decoration-champagne/40 underline-offset-8 transition-colors hover:text-champagne"
          >
            Read every story
          </a>
        </Reveal>
      </div>
    </section>
  );
}
