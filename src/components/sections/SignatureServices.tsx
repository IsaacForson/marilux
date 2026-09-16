'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { formatDuration, formatPrice } from '@/lib/data/services';
import Reveal from '@/components/ui/Reveal';
import { themeFor } from '@/lib/data/images';
import SectionHeader from '@/components/ui/SectionHeader';
import Plate from '@/components/ui/Plate';
import { ButtonLink } from '@/components/ui/Button';



/**
 * Most-requested treatments.
 *
 * A native scroll-snap rail rather than a JS carousel: momentum, keyboard
 * navigation and accessibility come free from the platform, and the scroll
 * runs on the compositor.
 */
export type SignaturePick = {
  slug: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  priceFrom?: boolean;
  category: string;
  categorySlug: string;
  imageUrl?: string;
};

export default function SignatureServices({ picks }: { picks: SignaturePick[] }) {
  const rail = useRef<HTMLUListElement>(null);

  const nudge = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector('li');
    const step = card ? card.getBoundingClientRect().width + 16 : 380;
    el.scrollBy({ left: step * dir, behavior: 'smooth' });
  };

  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="signature-title"
    >
      <div className="shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="Most requested"
            title="The signatures."
            accent={[[1, 1]]}
            as="h2"
            size="display-lg"
            className="lg:max-w-[20ch]"
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => nudge(-1)}
              aria-label="Previous treatments"
              className="grid h-12 w-12 place-items-center rounded-full border border-line-2 text-ivory/70 transition-all duration-500 hover:border-accent/60 hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              aria-label="More treatments"
              className="grid h-12 w-12 place-items-center rounded-full border border-line-2 text-ivory/70 transition-all duration-500 hover:border-accent/60 hover:text-accent"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <Reveal y={40} delay={0.1}>
        <ul
          ref={rail}
          className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--edge)] pb-4"
          style={{ scrollPaddingInline: 'var(--edge)' }}
        >
          {picks.map((service, i) => (
            <li
              key={service.categorySlug + service.slug}
              className="w-[80vw] shrink-0 snap-start sm:w-[42vw] lg:w-[25vw] xl:w-[22rem]"
            >
              <Link
                href={'/booking?category=' + service.categorySlug + '&service=' + service.slug}
                data-cursor="view"
                className="group block h-full"
              >
                <Plate
                  src={service.imageUrl}
                  alt={service.name}
                  theme={themeFor(service.categorySlug)}
                  index={i}
                  ratio="aspect-[4/5]"
                  scrim
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 42vw, 22rem"
                  className="transition-transform duration-[1100ms] ease-luxe group-hover:scale-[1.05]"
                >
                  <span className="absolute left-5 top-5 rounded-full border border-line-2 bg-ink/40 px-3 py-1.5 font-sans text-2xs uppercase tracking-luxe text-ivory/70 backdrop-blur-md">
                    {service.category.split(' ')[0].replace(',', '')}
                  </span>
                </Plate>

                <div className="flex items-start justify-between gap-4 pt-5">
                  <div>
                    <h3 className="font-display text-xl font-light leading-snug text-ivory transition-colors duration-500 group-hover:text-accent">
                      {service.name}
                    </h3>
                    <p className="mt-2 flex items-center gap-2 font-sans text-2xs uppercase tracking-luxe text-ivory/40">
                      <Clock className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                      {formatDuration(service.duration)}
                    </p>
                  </div>
                  <span className="whitespace-nowrap pt-1 font-display text-lg text-accent">
                    {formatPrice(service)}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ivory/45">
                  {service.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>

      <div className="shell mt-12">
        <Reveal y={20}>
          <ButtonLink href="/services" variant="outline" size="lg" arrow>
            See all treatments
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
