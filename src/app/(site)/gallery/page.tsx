import type { Metadata } from 'next';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/data/site';
import { getGallery } from '@/lib/media/gallery';
import MasonryGrid from '@/components/gallery/MasonryGrid';
import BeforeAfter from '@/components/gallery/BeforeAfter';
import PageHero from '@/components/sections/PageHero';
import CtaBand from '@/components/sections/CtaBand';
import InstagramStrip from '@/components/sections/InstagramStrip';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata: Metadata = buildMetadata({
  title: 'Gallery & Transformations',
  description:
    'Browse the Marilux Beauty Bar portfolio — brows, lashes, hair, nails, skin and makeup, with honest before-and-after comparisons.',
  path: '/gallery',
  keywords: ['beauty portfolio Accra', 'before and after microblading Ghana'],
});

const CASES = [
  {
    alt: 'Ombré powder brows',
    caption: 'Ombré powder brows — one session plus a six-week perfecting visit. Oily skin type.',
    theme: 'brows' as const,
    before: 1,
    after: 3,
  },
  {
    alt: 'Clarifying acne course',
    caption: 'Clarifying course — eight treatments over five months, alongside a simplified routine.',
    theme: 'skin' as const,
    before: 2,
    after: 4,
  },
  {
    alt: 'Wig customisation and install',
    caption: 'Raw unit to finished install — knots bleached, lace tinted, cut and laid in one visit.',
    theme: 'hair' as const,
    before: 5,
    after: 3,
  },
  {
    alt: 'Lash lift and tint',
    caption: 'Lash lift and tint — no extensions, six weeks of wear on the client’s own lashes.',
  },
];

export default async function GalleryPage() {
  const items = await getGallery();

  return (
    <>
      <PageHero
        eyebrow="The portfolio"
        title="The work, unretouched."
        accent={[[2, 2]]}
        lede="Every image here was taken in our studio, in our light, at the same distance. No filters, no borrowed photographs, no flattering angles. If we show it, we did it."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Gallery' }]}
      >
        <Reveal y={18} delay={0.4}>
          <div className="mt-9 flex flex-wrap gap-5">
            <a
              href={SITE.socials.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 font-sans text-2xs uppercase tracking-luxe text-ivory/50 transition-colors hover:text-accent"
            >
              <FaInstagram className="h-4 w-4" aria-hidden="true" />
              {SITE.socials.instagram.handle}
            </a>
            <a
              href={SITE.socials.tiktok.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 font-sans text-2xs uppercase tracking-luxe text-ivory/50 transition-colors hover:text-accent"
            >
              <FaTiktok className="h-4 w-4" aria-hidden="true" />
              {SITE.socials.tiktok.handle}
            </a>
          </div>
        </Reveal>
      </PageHero>

      <section className="shell py-12 sm:py-16" aria-label="Portfolio">
        <MasonryGrid items={items} />
      </section>

      <section
        className="shell border-t border-line py-24 sm:py-32"
        aria-labelledby="ba-title"
      >
        <SectionHeader
          eyebrow="Before & after"
          title="Drag the line."
          accent={[[2, 2]]}
          as="h2"
          size="display-lg"
          lede="Each comparison below states the honest number of sessions and the time it took. Results vary with skin, hair and aftercare — we will always give you a realistic timeline in consultation."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {CASES.map((c, i) => (
            <Reveal key={c.alt} y={38} delay={(i % 2) * 0.08}>
              <BeforeAfter
                alt={c.alt}
                caption={c.caption}
                theme={c.theme}
                beforeIndex={c.before}
                afterIndex={c.after}
                ratio="aspect-[4/3]"
              />
            </Reveal>
          ))}
        </div>
      </section>

      <InstagramStrip />

      <CtaBand
        eyebrow="Your turn"
        title="The next one could be yours."
        accent={[[4, 4]]}
        body="Book a treatment, or send us an inspiration photo on WhatsApp and we will tell you honestly what it will take to get there."
      />
    </>
  );
}
