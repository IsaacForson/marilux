import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/lib/data/site';
import { formatDuration, formatPrice } from '@/lib/data/services';
import { getCatalogue } from '@/lib/catalogue';
import PageHero from '@/components/sections/PageHero';
import { themeFor } from '@/lib/data/images';
import CtaBand from '@/components/sections/CtaBand';
import Reveal from '@/components/ui/Reveal';
import Plate from '@/components/ui/Plate';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = buildMetadata({
  title: 'Services & Price List',
  description:
    'Explore every treatment at Marilux Beauty Bar — brows and permanent makeup, lashes, hair and wigs, nails, facials, waxing, spa, aesthetics, training and packages.',
  path: '/services',
  keywords: ['beauty services Accra', 'salon price list Ghana', 'spa treatments Accra'],
});

function catalogueJsonLd(SERVICE_CATEGORIES: Awaited<ReturnType<typeof getCatalogue>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: SITE.name + ' — Treatments',
    url: SITE.url + '/services',
    itemListElement: SERVICE_CATEGORIES.map((c, i) => ({
      '@type': 'OfferCatalog',
      position: i + 1,
      name: c.name,
      url: SITE.url + '/services/' + c.slug,
      itemListElement: c.services.map((s) => ({
        '@type': 'Offer',
        name: s.name,
        description: s.description,
        priceCurrency: 'GHS',
        price: s.price,
      })),
    })),
  };
}

export default async function ServicesPage() {
  const SERVICE_CATEGORIES = await getCatalogue();
  const TOTAL_SERVICE_COUNT = SERVICE_CATEGORIES.reduce((n, c) => n + c.services.length, 0);

  return (
    <>
      <JsonLd data={catalogueJsonLd(SERVICE_CATEGORIES)} />

      <PageHero
        eyebrow={TOTAL_SERVICE_COUNT + ' treatments · 10 disciplines'}
        title="The full catalogue."
        accent={[[1, 1]]}
        lede="Every room has its own specialists, its own tooling and its own light. Prices are indicative — the final figure depends on length, density and condition, and we will always confirm before we begin."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Services' }]}
      />

      {/* Category index */}
      <section className="shell pb-8">
        <Reveal y={20} stagger={0.04}>
          <div className="flex flex-wrap gap-2">
            {SERVICE_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={'#' + c.slug}
                className="rounded-full border border-line px-4 py-2.5 font-sans text-2xs uppercase tracking-luxe text-ivory/50 transition-all duration-500 ease-luxe hover:border-accent/50 hover:text-accent"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Category sections */}
      {SERVICE_CATEGORIES.map((category, ci) => (
        <section
          key={category.slug}
          id={category.slug}
          className="relative scroll-mt-28 border-t border-line py-20 sm:py-28"
          aria-labelledby={'cat-' + category.slug}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-64"
            style={{
              background:
                'radial-gradient(60% 100% at 18% 0%, rgb(' +
                category.mood.rgb +
                ' / 0.10) 0%, transparent 72%)',
            }}
          />

          <div className="shell relative">
            <div className="grid gap-10 lg:grid-cols-[0.85fr,1.15fr] lg:gap-16">
              {/* Category card */}
              <div className="lg:sticky lg:top-32 lg:self-start">
                <Reveal y={30}>
                  <Link href={'/services/' + category.slug} className="group block">
                    <Plate
                      src={category.imageUrl}
                      alt={category.name}
                      theme={themeFor(category.slug)}
                      index={ci}
                      ratio="aspect-[5/4] lg:aspect-[4/5]"
                      scrim
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="transition-transform duration-[1100ms] ease-luxe group-hover:scale-[1.03]"
                    >
                      <span className="absolute left-5 top-5 font-sans text-2xs tracking-luxe text-ivory/40">
                        {String(ci + 1).padStart(2, '0')}
                      </span>
                    </Plate>
                  </Link>
                </Reveal>

                <Reveal y={20} delay={0.08}>
                  <p
                    className="eyebrow mt-7"
                    style={{ color: category.mood.accent }}
                  >
                    {category.tagline}
                  </p>
                  <h2 id={'cat-' + category.slug} className="display-md mt-3">
                    {category.name}
                  </h2>
                  <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-ivory/50">
                    {category.intro}
                  </p>

                  <Link
                    href={'/services/' + category.slug}
                    className="group mt-7 inline-flex items-center gap-2.5 font-sans text-2xs uppercase tracking-luxe transition-colors duration-500"
                    style={{ color: category.mood.accent }}
                  >
                    Enter this room
                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </Link>
                </Reveal>
              </div>

              {/* Price list */}
              <div>
                <ul className="divide-y divide-line border-y border-line">
                  {category.services.map((s, i) => (
                    <li key={s.slug}>
                      <Reveal y={16} delay={Math.min(i, 6) * 0.03}>
                        <div className="group flex flex-col gap-3 py-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                          <div className="min-w-0">
                            <h3 className="font-display text-xl font-light text-ivory">
                              {s.name}
                            </h3>
                            <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-ivory/45">
                              {s.description}
                            </p>
                            <p className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-line-2 px-2.5 py-1 font-sans text-2xs uppercase tracking-luxe text-ivory/40">
                                {formatDuration(s.duration)}
                              </span>
                              {s.tags?.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full border px-2.5 py-1 font-sans text-2xs uppercase tracking-luxe"
                                  style={{
                                    borderColor: 'rgb(' + category.mood.rgb + ' / 0.28)',
                                    color: category.mood.accent,
                                  }}
                                >
                                  {t}
                                </span>
                              ))}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-3">
                            <span className="whitespace-nowrap font-display text-xl text-accent">
                              {formatPrice(s)}
                            </span>
                            <Link
                              href={
                                '/booking?category=' + category.slug + '&service=' + s.slug
                              }
                              className="whitespace-nowrap rounded-full border border-line-2 px-4 py-2 font-sans text-2xs uppercase tracking-luxe text-ivory/60 transition-all duration-500 ease-luxe hover:border-accent/60 hover:bg-champagne hover:text-onaccent"
                            >
                              Book
                            </Link>
                          </div>
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="shell py-20">
        <Reveal y={20}>
          <div className="glass rounded-2xl px-7 py-8 sm:px-10">
            <h2 className="display-sm">A note on our prices</h2>
            <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-ivory/55">
              Figures shown are indicative starting prices in Ghana Cedis. Where a treatment is
              priced &ldquo;from&rdquo;, the final cost depends on length, density, condition or
              complexity — and we will always quote you before we begin, never after. A 50%
              deposit secures every appointment, and the balance is settled in studio.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/booking" size="lg" arrow>
                Book a treatment
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline" size="lg">
                Ask for a quote
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>

      <CtaBand />
    </>
  );
}
