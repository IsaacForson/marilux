import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getCatalogue } from '@/lib/catalogue';
import { themeFor } from '@/lib/data/images';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import Plate from '@/components/ui/Plate';

/**
 * The house, room by room.
 *
 * Deliberately asymmetric: the first two categories run wide, the rest settle
 * into a three-column rhythm, so the grid reads as an editorial spread rather
 * than a directory listing.
 */
export default async function Rooms() {
  const categories = await getCatalogue();

  return (
    <section className="relative py-24 sm:py-36" aria-labelledby="rooms-title">
      <div className="shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="Ten rooms, one standard"
            title="Every discipline, under one roof."
            accent={[[1, 1]]}
            as="h2"
            size="display-lg"
          />
          <Reveal y={18} delay={0.1}>
            <p className="lede max-w-[38ch] lg:pb-4">
              Each room has its own specialists, its own tooling and its own light. Choose the
              one that brought you here.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {categories.map((cat, i) => {
            // First two run half-width, the remainder in thirds.
            const wide = i < 2;
            return (
              <Reveal
                key={cat.slug}
                y={36}
                delay={(i % 3) * 0.06}
                className={wide ? 'lg:col-span-3' : 'lg:col-span-2'}
              >
                <Link
                  href={'/services/' + cat.slug}
                  data-cursor="view"
                  className="group relative block h-full overflow-hidden rounded-[1.75rem]"
                >
                  <Plate
                    alt={cat.name + ' at Marilux Beauty Bar'}
                    theme={themeFor(cat.slug)}
                    index={i}
                    ratio={wide ? 'aspect-[16/11]' : 'aspect-[4/5] sm:aspect-[5/6]'}
                    scrim
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="transition-transform duration-[1200ms] ease-luxe group-hover:scale-[1.04]"
                  />

                  {/* Category mood wash — the only thing that differs room to room. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 ease-luxe group-hover:opacity-100"
                    style={{
                      background:
                        'radial-gradient(120% 90% at 50% 100%, rgb(' +
                        cat.mood.rgb +
                        ' / 0.28) 0%, transparent 70%)',
                    }}
                  />

                  <div className="on-media absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-7">
                    <div>
                      <p
                        className="font-sans text-2xs uppercase tracking-luxe"
                        style={{ color: cat.mood.accent }}
                      >
                        {cat.tagline}
                      </p>
                      <h3 className="mt-2 font-display text-[clamp(1.25rem,2vw,1.85rem)] font-light leading-tight text-ivory">
                        {cat.name}
                      </h3>
                      <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-ivory/50 opacity-0 transition-opacity duration-700 ease-luxe group-hover:opacity-100">
                        {cat.summary}
                      </p>
                    </div>

                    <span
                      aria-hidden="true"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-2 text-ivory/70 transition-all duration-500 ease-luxe group-hover:border-accent/70 group-hover:bg-champagne group-hover:text-onaccent"
                    >
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.4} />
                    </span>
                  </div>

                  <span className="on-media absolute right-6 top-6 font-sans text-2xs tracking-luxe text-ivory/40">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
