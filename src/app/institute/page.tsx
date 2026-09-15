import type { Metadata } from 'next';
import Link from 'next/link';
import { Award, BriefcaseBusiness, GraduationCap, Users2 } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { SITE, whatsappLink } from '@/lib/data/site';
import { getCategory, formatDuration, formatPrice, depositFor } from '@/lib/data/services';
import { TESTIMONIALS } from '@/lib/data/testimonials';
import { GHS } from '@/lib/utils';
import PageHero from '@/components/sections/PageHero';
import CtaBand from '@/components/sections/CtaBand';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import Plate from '@/components/ui/Plate';
import Accordion from '@/components/ui/Accordion';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = buildMetadata({
  title: 'Beauty Institute & Training',
  description:
    'Certified beauty training in Accra — microblading, lashes, nails, makeup artistry, wig making and a twelve-week beauty therapy diploma, with live models and mentorship.',
  path: '/institute',
  keywords: [
    'beauty school Accra',
    'microblading training Ghana',
    'lash extension course Accra',
    'makeup artistry course Ghana',
  ],
});

const PILLARS = [
  {
    icon: Users2,
    title: 'Capped cohorts',
    body: 'Never more than six students to a trainer. If you cannot get your hands corrected mid-stroke, you are not being taught.',
  },
  {
    icon: GraduationCap,
    title: 'Live models, every course',
    body: 'You will work on real people under supervision before you are certified. Practice skin does not behave like skin.',
  },
  {
    icon: Award,
    title: 'Certification that means it',
    body: 'Assessed on healed results and sanitation practice, not attendance. We have asked students to repeat modules — and they thanked us later.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Twelve months of mentorship',
    body: 'Graduates join the alumni circle: pricing help, difficult-client advice, supplier contacts, and answers within the hour.',
  },
];

const ADMISSIONS = [
  {
    id: 'who',
    title: 'Who can enrol?',
    meta: 'Entry requirements',
    body: [
      'Most courses are open to complete beginners aged eighteen and over — no prior experience is required.',
      'The Business of Beauty masterclass is open to practising technicians at any level.',
      'For permanent makeup, you must be comfortable working with needles and pass a short steadiness assessment during the first day.',
    ],
  },
  {
    id: 'included',
    title: 'What is included?',
    meta: 'Kits, materials and certification',
    body: [
      'A professional starter kit where indicated, all practice materials, printed course manual, and your certificate on successful assessment.',
      'Live models are arranged by us — you do not need to find your own.',
      'Twelve months of alumni mentorship, plus discounted supply rates through our distributors.',
    ],
  },
  {
    id: 'payment',
    title: 'How do I pay?',
    meta: 'Deposits and instalments',
    body: [
      'A 50% deposit secures your seat in a cohort; the balance is due on the first day of the course.',
      'For the twelve-week diploma, a three-part instalment plan is available — ask us when you enquire.',
      'Deposits are non-refundable but may be transferred once to a later cohort with at least fourteen days notice.',
    ],
  },
  {
    id: 'after',
    title: 'What happens after I graduate?',
    meta: 'Placement and support',
    body: [
      'Diploma graduates complete a supervised placement in the studio, working alongside our specialists on real appointments.',
      'We help with portfolio building, pricing structures and your first month of bookings.',
      'We hire from our own graduates first — several of our current specialists trained here.',
    ],
  },
];

export default function InstitutePage() {
  const institute = getCategory('beauty-institute');
  const courses = institute?.services ?? [];
  const graduate = TESTIMONIALS.find((t) => t.categorySlug === 'beauty-institute');

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          name: 'Marilux Beauty Institute',
          url: SITE.url + '/institute',
          parentOrganization: { '@type': 'BeautySalon', name: SITE.name, '@id': SITE.url + '#business' },
          address: {
            '@type': 'PostalAddress',
            streetAddress: SITE.address.street,
            addressLocality: SITE.address.locality,
            addressRegion: SITE.address.region,
            addressCountry: SITE.address.country,
          },
          telephone: SITE.contact.phoneIntl,
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Courses',
            itemListElement: courses.map((c) => ({
              '@type': 'Offer',
              name: c.name,
              description: c.description,
              priceCurrency: 'GHS',
              price: c.price,
            })),
          },
        }}
      />

      <PageHero
        eyebrow="Marilux Beauty Institute"
        title="Become the artist people wait for."
        accent={[[2, 2]]}
        lede="We train the technicians we would hire. Small cohorts, live models, honest assessment, and a year of mentorship after you leave — because a certificate on its own has never built anyone a career."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Institute' }]}
        mood={institute?.mood}
      >
        <Reveal y={20} delay={0.4}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="#courses" size="lg" magnetic arrow>
              See the courses
            </ButtonLink>
            <ButtonLink
              href={whatsappLink('Hello Marilux Institute, I would like to enquire about training.')}
              variant="outline"
              size="lg"
            >
              Speak to admissions
            </ButtonLink>
          </div>
        </Reveal>
      </PageHero>

      {/* Why here */}
      <section className="shell py-16 sm:py-24" aria-labelledby="why-title">
        <SectionHeader
          eyebrow="Why train here"
          title="Four things most courses skip."
          accent={[[1, 1]]}
          as="h2"
          size="display-lg"
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} y={30} delay={i * 0.07}>
              <article className="group h-full rounded-[1.75rem] border border-white/[0.08] p-8 transition-colors duration-700 hover:border-champagne/30">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-champagne/25 text-champagne transition-colors duration-500 group-hover:border-champagne/60">
                  <p.icon className="h-5 w-5" strokeWidth={1.3} aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-display text-2xl font-light text-ivory">{p.title}</h3>
                <p className="mt-3 max-w-[48ch] leading-relaxed text-ivory/50">{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section
        id="courses"
        className="relative scroll-mt-28 border-y border-white/[0.07] py-20 sm:py-28"
        aria-labelledby="courses-title"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72"
          style={{
            background:
              'radial-gradient(60% 100% at 25% 0%, rgba(235,214,179,0.10) 0%, transparent 72%)',
          }}
        />
        <div className="shell relative">
          <SectionHeader
            eyebrow={courses.length + ' programmes'}
            title="The curriculum."
            accent={[[1, 1]]}
            as="h2"
            size="display-lg"
            lede="Every course ends in an assessed certification. Where a kit is included, it is a professional kit you can open on your first paying client."
          />

          <div className="mt-16 grid gap-5 lg:grid-cols-2">
            {courses.map((course, i) => (
              <Reveal key={course.slug} y={34} delay={(i % 2) * 0.07}>
                <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.08] transition-colors duration-700 hover:border-champagne/30">
                  <Plate
                    alt={course.name}
                    seed={24 + i * 37}
                    ratio="aspect-[16/9]"
                    rounded="rounded-none"
                    scrim
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="transition-transform duration-[1100ms] ease-luxe group-hover:scale-[1.04]"
                  >
                    <span className="absolute left-5 top-5 font-sans text-2xs tracking-luxe text-ivory/40">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </Plate>

                  <div className="flex flex-1 flex-col p-7 sm:p-8">
                    <h3 className="font-display text-2xl font-light leading-snug text-ivory">
                      {course.name}
                    </h3>
                    <p className="mt-3 flex-1 leading-relaxed text-ivory/50">
                      {course.description}
                    </p>

                    <ul className="mt-6 flex flex-wrap gap-2">
                      <li className="rounded-full border border-white/10 px-3 py-1.5 font-sans text-2xs uppercase tracking-luxe text-ivory/45">
                        {formatDuration(course.duration)}
                      </li>
                      {course.tags?.map((t) => (
                        <li
                          key={t}
                          className="rounded-full border border-champagne/25 px-3 py-1.5 font-sans text-2xs uppercase tracking-luxe text-champagne/85"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7 flex items-end justify-between gap-4 border-t border-white/[0.07] pt-6">
                      <div>
                        <p className="font-display text-2xl text-champagne">
                          {formatPrice(course)}
                        </p>
                        <p className="mt-1 font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                          {GHS(depositFor(course.price))} secures your seat
                        </p>
                      </div>
                      <ButtonLink
                        href={'/booking?category=beauty-institute&service=' + course.slug}
                        variant="outline"
                        size="sm"
                      >
                        Enrol
                      </ButtonLink>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Graduate story */}
      {graduate && (
        <section className="shell py-20 sm:py-28" aria-label="Graduate story">
          <Reveal y={34}>
            <figure className="grid gap-10 rounded-[2rem] border border-white/[0.08] p-8 sm:p-12 lg:grid-cols-[0.75fr,1.25fr] lg:items-center lg:gap-16">
              <Plate
                alt={graduate.name}
                seed={64}
                ratio="aspect-square"
                sizes="(max-width: 1024px) 100vw, 28vw"
                rounded="rounded-[1.5rem]"
              />
              <div>
                <p className="eyebrow mb-6">Graduate, {graduate.since?.split(', ')[1]}</p>
                <blockquote className="font-display text-[clamp(1.35rem,2.6vw,2.1rem)] font-light leading-[1.4] text-ivory">
                  &ldquo;{graduate.story}&rdquo;
                </blockquote>
                <figcaption className="mt-7 font-sans text-2xs uppercase tracking-luxe">
                  <span className="text-champagne">{graduate.name}</span>
                  <span className="text-ivory/35"> · {graduate.service}</span>
                </figcaption>
              </div>
            </figure>
          </Reveal>
        </section>
      )}

      {/* Admissions */}
      <section
        className="shell border-t border-white/[0.07] py-20 sm:py-28"
        aria-labelledby="admissions-title"
      >
        <div className="grid gap-12 lg:grid-cols-[0.9fr,1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeader
              eyebrow="Admissions"
              title="How enrolment works."
              accent={[[2, 2]]}
              as="h2"
              size="display-md"
              lede="Cohorts are small and fill early. Secure your seat with a 50% deposit, and we will send your pre-course reading and kit list straight away."
            />
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/booking?category=beauty-institute" size="lg" arrow>
                Secure a seat
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline" size="lg">
                Ask a question
              </ButtonLink>
            </div>
          </div>

          <Accordion
            items={ADMISSIONS}
            defaultOpen="who"
          />
        </div>
      </section>

      <CtaBand
        eyebrow="Enrolment"
        title="Your first client is closer than you think."
        accent={[[5, 6]]}
        body="Choose your programme, secure your seat with a 50% deposit, and we will take it from there."
        primaryHref="/booking?category=beauty-institute"
        primaryLabel="Enrol now"
      />

      <p className="sr-only">
        Marilux Beauty Institute is located at {SITE.address.display}. Enquiries:{' '}
        {SITE.contact.phone}. <Link href="/contact">Contact us</Link>.
      </p>
    </>
  );
}
