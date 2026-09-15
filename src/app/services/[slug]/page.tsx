import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Clock } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/lib/data/site';
import {
  SERVICE_CATEGORIES,
  formatDuration,
  formatPrice,
  getCategory,
  depositFor,
} from '@/lib/data/services';
import { specialistsFor } from '@/lib/data/team';
import { TESTIMONIALS } from '@/lib/data/testimonials';
import { GHS } from '@/lib/utils';
import PageHero from '@/components/sections/PageHero';
import CtaBand from '@/components/sections/CtaBand';
import Reveal from '@/components/ui/Reveal';
import Plate from '@/components/ui/Plate';
import { ButtonLink } from '@/components/ui/Button';
import SectionHeader from '@/components/ui/SectionHeader';

/** Every category is known at build time, so all ten pages ship as static HTML. */
export function generateStaticParams() {
  return SERVICE_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: 'Not found' };

  return buildMetadata({
    title: category.name,
    description: category.summary,
    path: '/services/' + category.slug,
    keywords: category.services.slice(0, 6).map((s) => s.name + ' Accra'),
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const specialists = specialistsFor(category.slug);
  const stories = TESTIMONIALS.filter((t) => t.categorySlug === category.slug).slice(0, 2);
  const others = SERVICE_CATEGORIES.filter((c) => c.slug !== category.slug).slice(0, 3);
  const featured = category.services.filter((s) => s.featured).slice(0, 3);
  const accent = category.mood.accent;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: category.name,
          description: category.summary,
          provider: { '@type': 'BeautySalon', name: SITE.name, '@id': SITE.url + '#business' },
          areaServed: { '@type': 'City', name: 'Accra' },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: category.name,
            itemListElement: category.services.map((s) => ({
              '@type': 'Offer',
              name: s.name,
              description: s.description,
              priceCurrency: 'GHS',
              price: s.price,
            })),
          },
        }}
      />

      <PageHero
        eyebrow={category.tagline}
        title={category.name}
        lede={category.intro}
        mood={category.mood}
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/services', label: 'Services' },
          { label: category.name },
        ]}
      >
        <Reveal y={20} delay={0.4}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href={'/booking?category=' + category.slug} size="lg" magnetic arrow>
              Book in this room
            </ButtonLink>
            <span className="font-sans text-2xs uppercase tracking-luxe text-ivory/35">
              {category.services.length} treatments · from{' '}
              {formatPrice(
                category.services.reduce((min, s) => (s.price < min.price ? s : min)),
              ).replace('from ', '')}
            </span>
          </div>
        </Reveal>
      </PageHero>

      {/* The ritual */}
      <section
        className="relative border-y border-white/[0.07] py-20"
        aria-labelledby="ritual-title"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 100% at 50% 0%, rgb(' +
              category.mood.rgb +
              ' / 0.09) 0%, transparent 70%)',
          }}
        />
        <div className="shell relative">
          <h2 id="ritual-title" className="eyebrow mb-10" style={{ color: accent }}>
            How this room works
          </h2>
          <ol className="grid gap-10 sm:grid-cols-3">
            {category.ritual.map((step, i) => (
              <Reveal key={step} y={24} delay={i * 0.08}>
                <li>
                  <span
                    className="font-display text-4xl font-light"
                    style={{ color: accent, opacity: 0.55 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-4 max-w-[30ch] font-display text-xl font-light leading-snug text-ivory">
                    {step}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="shell py-20 sm:py-28" aria-labelledby="featured-title">
          <SectionHeader
            eyebrow="Most booked here"
            title="Where most guests begin."
            as="h2"
            size="display-md"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {featured.map((s, i) => (
              <Reveal key={s.slug} y={34} delay={i * 0.07}>
                <Link
                  href={'/booking?category=' + category.slug + '&service=' + s.slug}
                  data-cursor="view"
                  className="group block h-full overflow-hidden rounded-[1.75rem] border border-white/[0.08] transition-colors duration-700 hover:border-white/20"
                >
                  <Plate
                    alt={s.name}
                    seed={30 + i * 47}
                    ratio="aspect-[4/3]"
                    rounded="rounded-none"
                    scrim
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="transition-transform duration-[1100ms] ease-luxe group-hover:scale-[1.05]"
                  />
                  <div className="p-6">
                    <h3 className="font-display text-xl font-light text-ivory">{s.name}</h3>
                    <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ivory/45">
                      {s.description}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                      <span className="flex items-center gap-2 font-sans text-2xs uppercase tracking-luxe text-ivory/35">
                        <Clock className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                        {formatDuration(s.duration)}
                      </span>
                      <span className="font-display text-lg" style={{ color: accent }}>
                        {formatPrice(s)}
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Full list */}
      <section
        className="shell border-t border-white/[0.07] py-20 sm:py-28"
        aria-labelledby="menu-title"
      >
        <SectionHeader
          eyebrow="The full menu"
          title="Everything in this room."
          as="h2"
          size="display-md"
        />

        <ul className="mt-12 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {category.services.map((s, i) => (
            <li key={s.slug}>
              <Reveal y={16} delay={Math.min(i, 8) * 0.025}>
                <div className="flex flex-col gap-4 py-7 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
                  <div className="min-w-0 lg:max-w-[58%]">
                    <h3 className="font-display text-[1.35rem] font-light text-ivory">
                      {s.name}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-ivory/45">
                      {s.description}
                    </p>
                    <p className="mt-3.5 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 px-2.5 py-1 font-sans text-2xs uppercase tracking-luxe text-ivory/40">
                        {formatDuration(s.duration)}
                      </span>
                      {s.tags?.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border px-2.5 py-1 font-sans text-2xs uppercase tracking-luxe"
                          style={{
                            borderColor: 'rgb(' + category.mood.rgb + ' / 0.3)',
                            color: accent,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-6 lg:flex-col lg:items-end lg:gap-3">
                    <div className="text-right">
                      <p className="whitespace-nowrap font-display text-2xl text-champagne">
                        {formatPrice(s)}
                      </p>
                      <p className="mt-1 whitespace-nowrap font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                        {GHS(depositFor(s.price))} deposit
                      </p>
                    </div>
                    <ButtonLink
                      href={'/booking?category=' + category.slug + '&service=' + s.slug}
                      variant="outline"
                      size="sm"
                    >
                      Book
                    </ButtonLink>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Specialists */}
      {specialists.length > 0 && (
        <section
          className="shell border-t border-white/[0.07] py-20 sm:py-28"
          aria-labelledby="team-title"
        >
          <SectionHeader
            eyebrow="Who you will meet"
            title="The specialists in this room."
            as="h2"
            size="display-md"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {specialists.map((s, i) => (
              <Reveal key={s.slug} y={30} delay={i * 0.07}>
                <article className="h-full rounded-[1.75rem] border border-white/[0.08] p-6">
                  <Plate
                    alt={s.name}
                    seed={70 + i * 53}
                    ratio="aspect-[4/5]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <p className="eyebrow mt-6" style={{ color: accent }}>
                    {s.role}
                  </p>
                  <h3 className="mt-2.5 font-display text-2xl font-light text-ivory">
                    {s.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ivory/45">{s.bio}</p>
                  <p className="mt-5 border-t border-white/[0.07] pt-4 font-sans text-2xs uppercase tracking-luxe text-ivory/35">
                    Signature — {s.signature}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Stories */}
      {stories.length > 0 && (
        <section className="shell border-t border-white/[0.07] py-20" aria-label="Client stories">
          <div className="grid gap-6 md:grid-cols-2">
            {stories.map((t, i) => (
              <Reveal key={t.id} y={26} delay={i * 0.08}>
                <figure className="h-full rounded-[1.75rem] border border-white/[0.08] p-7 sm:p-9">
                  <blockquote className="font-display text-xl font-light leading-relaxed text-ivory">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 font-sans text-2xs uppercase tracking-luxe">
                    <span style={{ color: accent }}>{t.name}</span>
                    <span className="text-ivory/30"> · {t.service}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Onward */}
      <section className="shell border-t border-white/[0.07] py-20" aria-labelledby="next-title">
        <h2 id="next-title" className="eyebrow mb-10">
          Continue through the house
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {others.map((c, i) => (
            <Reveal key={c.slug} y={24} delay={i * 0.06}>
              <Link
                href={'/services/' + c.slug}
                className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-white/[0.08] p-6 transition-colors duration-500 hover:border-white/20"
              >
                <span>
                  <span
                    className="block font-sans text-2xs uppercase tracking-luxe"
                    style={{ color: c.mood.accent }}
                  >
                    {c.tagline}
                  </span>
                  <span className="mt-2 block font-display text-lg font-light text-ivory">
                    {c.name}
                  </span>
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-ivory/30 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-champagne"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand
        eyebrow={category.name}
        title="Ready for this one?"
        accent={[[2, 2]]}
        body={category.summary}
        primaryHref={'/booking?category=' + category.slug}
        primaryLabel="Book this treatment"
      />
    </>
  );
}
