import type { Metadata } from 'next';
import { Quote, Star } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/lib/data/site';
import { TESTIMONIALS, STATS } from '@/lib/data/testimonials';
import BeforeAfter from '@/components/gallery/BeforeAfter';
import PageHero from '@/components/sections/PageHero';
import CtaBand from '@/components/sections/CtaBand';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import Counter from '@/components/ui/Counter';
import Plate from '@/components/ui/Plate';

export const metadata: Metadata = buildMetadata({
  title: 'Client Stories & Reviews',
  description:
    'Read what Marilux Beauty Bar clients say about brows, lashes, hair, nails, skin and spa treatments in Accra.',
  path: '/testimonials',
  keywords: ['Marilux Beauty Bar reviews', 'best beauty salon Accra reviews'],
});

const STORIES = TESTIMONIALS.filter((t) => t.story);

export default function TestimonialsPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: TESTIMONIALS.map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Review',
              author: { '@type': 'Person', name: t.name },
              reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 },
              reviewBody: t.quote,
              itemReviewed: { '@type': 'BeautySalon', name: SITE.name, '@id': SITE.url + '#business' },
            },
          })),
        }}
      />

      <PageHero
        eyebrow="Client stories"
        title="Said better than we could."
        accent={[[1, 1]]}
        lede="Every review below is from a real client of this studio. We have not edited them for flattery, and we have kept the ones that mention how long things actually took."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Stories' }]}
      />

      {/* Rating summary */}
      <section className="shell pb-12" aria-label="Rating summary">
        <Reveal y={22}>
          <div className="glass grid gap-8 rounded-[1.75rem] p-8 sm:grid-cols-2 lg:grid-cols-4 sm:p-10">
            <div>
              <p className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-light text-accent">4.9</span>
                <span className="font-sans text-2xs uppercase tracking-luxe text-ivory/35">
                  / 5
                </span>
              </p>
              <div className="mt-3 flex gap-1" aria-label="4.9 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-accent text-accent"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="mt-3 font-sans text-2xs uppercase tracking-luxe text-ivory/35">
                Across 187 reviews
              </p>
            </div>

            {STATS.slice(1).map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-5xl font-light text-ivory">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-3 max-w-[20ch] font-sans text-2xs uppercase tracking-luxe text-ivory/35">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Long-form stories */}
      <section className="shell py-16 sm:py-24" aria-labelledby="stories-title">
        <SectionHeader
          eyebrow="In full"
          title="Four stories worth the read."
          accent={[[3, 3]]}
          as="h2"
          size="display-lg"
        />

        <div className="mt-16 space-y-6">
          {STORIES.map((t, i) => (
            <Reveal key={t.id} y={34} delay={(i % 2) * 0.07}>
              <article
                className={
                  'grid gap-8 rounded-[1.75rem] border border-line p-7 sm:p-10 lg:grid-cols-[0.8fr,1.2fr] lg:items-center lg:gap-12 ' +
                  (i % 2 ? 'lg:[direction:rtl]' : '')
                }
              >
                <div className={i % 2 ? 'lg:[direction:ltr]' : ''}>
                  <Plate
                    alt={'A portrait of ' + t.name}
                    theme="portrait"
                    index={i}
                    ratio="aspect-[4/3] lg:aspect-square"
                    sizes="(max-width: 1024px) 100vw, 30vw"
                  />
                </div>

                <div className={i % 2 ? 'lg:[direction:ltr]' : ''}>
                  <Quote
                    className="h-7 w-7 text-accent/40"
                    strokeWidth={1.2}
                    aria-hidden="true"
                  />
                  <div
                    className="mt-5 flex gap-1"
                    aria-label={t.rating + ' out of 5 stars'}
                  >
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star
                        key={s}
                        className="h-3.5 w-3.5 fill-accent text-accent"
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  <blockquote className="mt-6 font-display text-[clamp(1.2rem,2.2vw,1.75rem)] font-light leading-[1.45] text-ivory">
                    &ldquo;{t.story}&rdquo;
                  </blockquote>

                  <figcaption className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-2xs uppercase tracking-luxe">
                    <span className="text-accent">{t.name}</span>
                    <span className="text-ivory/20" aria-hidden="true">/</span>
                    <span className="text-ivory/40">{t.location}</span>
                    <span className="text-ivory/20" aria-hidden="true">/</span>
                    <span className="text-ivory/40">{t.service}</span>
                    <span className="text-ivory/20" aria-hidden="true">/</span>
                    <span className="text-ivory/40">{t.since}</span>
                  </figcaption>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* All reviews */}
      <section
        className="shell border-t border-line py-20 sm:py-28"
        aria-labelledby="all-title"
      >
        <SectionHeader
          eyebrow="Every review"
          title="The rest of the room."
          as="h2"
          size="display-md"
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.id} y={26} delay={(i % 3) * 0.06}>
              <figure className="flex h-full flex-col rounded-2xl border border-line p-6 transition-colors duration-700 hover:border-accent/30">
                <div className="flex gap-1" aria-label={t.rating + ' out of 5 stars'}>
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star
                      key={s}
                      className="h-3 w-3 fill-accent text-accent"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 font-display text-lg font-light leading-relaxed text-ivory/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <span className="block font-sans text-2xs uppercase tracking-luxe text-accent">
                    {t.name}
                  </span>
                  <span className="mt-1.5 block font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                    {t.service} · {t.location}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Transformations */}
      <section
        className="shell border-t border-line py-20 sm:py-28"
        aria-labelledby="proof-title"
      >
        <SectionHeader
          eyebrow="The proof"
          title="Words are easy. Here is the work."
          accent={[[4, 5]]}
          as="h2"
          size="display-md"
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { alt: 'Brow correction', caption: 'Two corrective sessions over four months.', theme: 'brows' as const, b: 2, a: 4 },
            { alt: 'Even-tone course', caption: 'Six brightening treatments across sixteen weeks.', theme: 'skin' as const, b: 1, a: 3 },
            { alt: 'Volume lash set', caption: 'First set, photographed the same afternoon.', theme: 'lashes' as const, b: 1, a: 4 },
          ].map((c, i) => (
            <Reveal key={c.alt} y={34} delay={i * 0.07}>
              <BeforeAfter
                alt={c.alt}
                caption={c.caption}
                theme={c.theme}
                beforeIndex={c.b}
                afterIndex={c.a}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand
        eyebrow="Join them"
        title="Write the next one."
        accent={[[2, 2]]}
        body="Book your first appointment and see whether we live up to what our clients say. We think we will."
      />
    </>
  );
}
