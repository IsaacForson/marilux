import Link from 'next/link';
import BeforeAfter from '@/components/gallery/BeforeAfter';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import { ButtonLink } from '@/components/ui/Button';

const CASES = [
  {
    alt: 'Combination brows',
    caption: 'Combination brows — two sessions, eight weeks apart. Corrective work over old pigment.',
    beforeSeed: 12,
    afterSeed: 40,
  },
  {
    alt: 'Brightening facial course',
    caption: 'Brightening course — six treatments across sixteen weeks, plus a three-step home routine.',
    beforeSeed: 200,
    afterSeed: 44,
  },
  {
    alt: 'Frontal wig installation',
    caption: 'Full customisation and frontal install — knots bleached, lace tinted, cut to the jaw.',
    beforeSeed: 268,
    afterSeed: 36,
  },
];

export default function Transformations() {
  return (
    <section className="relative py-24 sm:py-36" aria-labelledby="transformations-title">
      <div className="shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="Real results, real timelines"
            title="Drag the line. See the work."
            accent={[[3, 4]]}
            as="h2"
            size="display-lg"
            className="lg:max-w-[18ch]"
          />
          <Reveal y={18} delay={0.1}>
            <p className="lede max-w-[40ch] lg:pb-4">
              No filters, no flattering angles. Every result below is documented in the same light,
              at the same distance, with the honest number of sessions it took.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {CASES.map((c, i) => (
            <Reveal key={c.alt} y={40} delay={i * 0.08}>
              <BeforeAfter
                alt={c.alt}
                caption={c.caption}
                beforeSeed={c.beforeSeed}
                afterSeed={c.afterSeed}
              />
            </Reveal>
          ))}
        </div>

        <Reveal y={20} className="mt-14 flex flex-wrap items-center gap-4">
          <ButtonLink href="/gallery" variant="outline" size="lg" arrow>
            The full portfolio
          </ButtonLink>
          <Link
            href="/booking"
            className="font-sans text-2xs uppercase tracking-luxe text-ivory/45 underline decoration-champagne/40 underline-offset-8 transition-colors hover:text-champagne"
          >
            Or start your own
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
