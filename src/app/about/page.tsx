import type { Metadata } from 'next';
import { Compass, Eye, Gem, HandHeart, Microscope, Users } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/data/site';
import { SPECIALISTS } from '@/lib/data/team';
import { STATS } from '@/lib/data/testimonials';
import { TOTAL_SERVICE_COUNT } from '@/lib/data/services';
import PageHero from '@/components/sections/PageHero';
import CtaBand from '@/components/sections/CtaBand';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import SplitHeading from '@/components/ui/SplitHeading';
import Counter from '@/components/ui/Counter';
import Plate from '@/components/ui/Plate';
import Aura from '@/components/ui/Aura';

export const metadata: Metadata = buildMetadata({
  title: 'The Marilux Story',
  description:
    'How Marilux Beauty Bar became one of Accra’s most trusted luxury beauty destinations — our story, our standards, and the specialists behind the work.',
  path: '/about',
  keywords: ['about Marilux Beauty Bar', 'luxury salon Hebron Accra'],
});

const CHAPTERS = [
  {
    year: String(SITE.founded),
    title: 'One chair, one standard',
    body: 'Marilux began as a single brow chair in Hebron and one refusal: never to send a client home with work we would not photograph. That refusal is still the whole business model.',
  },
  {
    year: '2021',
    title: 'The house grows',
    body: 'Lashes, then nails, then skin. Each discipline was only added once we had found a specialist who did that one thing better than we could — never to fill a menu.',
  },
  {
    year: '2023',
    title: 'The Institute opens',
    body: 'Too many technicians were being certified in a weekend and sent out unprepared. We started training the artists we would want to hire, with live models and real mentorship.',
  },
  {
    year: 'Today',
    title: 'A destination, not a salon',
    body: TOTAL_SERVICE_COUNT +
      ' treatments across ten disciplines, six specialists, and a studio built so that the hour you spend here is the calmest hour of your week.',
  },
];

const VALUES = [
  {
    icon: Microscope,
    title: 'Precision over speed',
    body: 'We book fewer appointments per day than we could, because rushing a brow map or an extraction is how results go wrong.',
  },
  {
    icon: Gem,
    title: 'Professional-grade only',
    body: 'Every product is professional-use, chosen for deep complexions and for Ghana’s humidity — not for what looks best on a shelf.',
  },
  {
    icon: HandHeart,
    title: 'Care you can feel',
    body: 'Warm towels, tea, a room that is actually quiet. Comfort is not decoration; it is what lets a treatment do its work.',
  },
  {
    icon: Users,
    title: 'Specialists, always',
    body: 'Nobody here does a little of everything. Each artist trains in one discipline and keeps training in it.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={"Est. " + SITE.founded + " — Hebron, Accra"}
        title="A house built on standards."
        accent={[[4, 4]]}
        lede="Marilux Beauty Bar exists because too much of this industry is built on speed and photographs. We built the opposite: a studio where the work is measured, the products are honest, and the result still looks right eight weeks later."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'About' }]}
      />

      {/* Portrait + mission */}
      <section className="shell py-16 sm:py-24" aria-labelledby="mission-title">
        <div className="grid gap-12 lg:grid-cols-[1.05fr,0.95fr] lg:gap-20">
          <Reveal y={40} className="relative">
            <Plate
              alt="The Marilux studio in Hebron, Accra"
              seed={22}
              ratio="aspect-[4/5]"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="shadow-[0_60px_140px_-60px_rgba(0,0,0,0.95)]"
            />
            <div className="glass absolute -bottom-7 left-6 right-6 rounded-2xl p-6 sm:left-auto sm:right-[-2rem] sm:max-w-[17rem]">
              <p className="font-display text-lg leading-snug text-ivory">
                &ldquo;We would rather lose a booking than your trust.&rdquo;
              </p>
              <p className="mt-3 font-sans text-2xs uppercase tracking-luxe text-champagne/70">
                Mariam — Founder
              </p>
            </div>
          </Reveal>

          <div className="pt-10 lg:pt-0">
            <SectionHeader
              eyebrow="Mission"
              title="To make excellence the ordinary experience."
              accent={[[3, 3]]}
              as="h2"
              size="display-md"
              lede="Our mission is simple and difficult: that every single guest — first visit or hundredth — receives work that is technically correct, honestly priced, and delivered in a room that feels like a privilege to sit in."
            />

            <div className="mt-12 space-y-8">
              <Reveal y={22}>
                <div className="flex gap-5 border-t border-white/[0.07] pt-8">
                  <Eye
                    className="mt-1 h-5 w-5 shrink-0 text-champagne"
                    strokeWidth={1.3}
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="display-sm">Our vision</h3>
                    <p className="mt-3 max-w-[54ch] leading-relaxed text-ivory/55">
                      To be the beauty destination Ghana measures others against — and to send
                      out a generation of technicians who carry that standard into their own
                      studios.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal y={22} delay={0.08}>
                <div className="flex gap-5 border-t border-white/[0.07] pt-8">
                  <Compass
                    className="mt-1 h-5 w-5 shrink-0 text-champagne"
                    strokeWidth={1.3}
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="display-sm">What guides us</h3>
                    <p className="mt-3 max-w-[54ch] leading-relaxed text-ivory/55">
                      If it would not pass on our own faces, it does not leave the studio. That
                      single test decides our products, our training, our pricing and our
                      willingness to say no.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Story timeline */}
      <section
        className="relative border-y border-white/[0.07] py-24 sm:py-32"
        aria-labelledby="story-title"
      >
        <Aura className="-right-40 top-10" color="rgba(217,188,140,0.12)" size={620} />
        <div className="shell relative">
          <SectionHeader
            eyebrow="The story"
            title="How we got here."
            accent={[[2, 2]]}
            as="h2"
            size="display-lg"
          />

          <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {CHAPTERS.map((c, i) => (
              <Reveal key={c.year} y={28} delay={i * 0.08}>
                <li className="border-t border-champagne/25 pt-7">
                  <p className="font-display text-3xl font-light text-champagne">{c.year}</p>
                  <h3 className="mt-4 font-display text-xl font-light text-ivory">{c.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ivory/50">{c.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Values */}
      <section className="shell py-24 sm:py-32" aria-labelledby="values-title">
        <SectionHeader
          eyebrow="Why choose us"
          title="Four things we will not compromise."
          accent={[[1, 1]]}
          as="h2"
          size="display-lg"
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} y={30} delay={i * 0.07}>
              <article className="group h-full rounded-[1.75rem] border border-white/[0.08] p-8 transition-colors duration-700 hover:border-champagne/30">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-champagne/25 text-champagne transition-colors duration-500 group-hover:border-champagne/60">
                  <v.icon className="h-5 w-5" strokeWidth={1.3} aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-display text-2xl font-light text-ivory">{v.title}</h3>
                <p className="mt-3 max-w-[48ch] leading-relaxed text-ivory/50">{v.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* The team */}
      <section
        className="shell border-t border-white/[0.07] py-24 sm:py-32"
        aria-labelledby="team-title"
      >
        <SectionHeader
          eyebrow="The specialists"
          title="The hands behind the work."
          accent={[[1, 2]]}
          as="h2"
          size="display-lg"
          lede="Six artists, each trained in a single discipline, each still training in it. You can request any of them by name when you book."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SPECIALISTS.map((s, i) => (
            <Reveal key={s.slug} y={34} delay={(i % 3) * 0.07}>
              <article className="group h-full overflow-hidden rounded-[1.75rem] border border-white/[0.08] transition-colors duration-700 hover:border-white/20">
                <Plate
                  alt={s.name + ', ' + s.role}
                  seed={40 + i * 43}
                  ratio="aspect-[4/5]"
                  rounded="rounded-none"
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="transition-transform duration-[1200ms] ease-luxe group-hover:scale-[1.04]"
                />
                <div className="p-7">
                  <p className="eyebrow">{s.role}</p>
                  <h3 className="mt-3 font-display text-2xl font-light text-ivory">{s.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ivory/50">{s.bio}</p>
                  <dl className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-4 font-sans text-2xs uppercase tracking-luxe">
                    <div className="flex gap-2">
                      <dt className="text-ivory/30">Signature</dt>
                      <dd className="text-champagne/80">{s.signature}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="sr-only">Experience</dt>
                      <dd className="text-ivory/30">{s.years} yrs</dd>
                    </div>
                  </dl>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section className="relative border-y border-white/[0.07] py-20" aria-label="By the numbers">
        <div className="shell">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} y={20} delay={i * 0.07}>
                <div>
                  <dd className="font-display text-[clamp(2.2rem,4.6vw,3.6rem)] font-light leading-none">
                    <span className="gold-text-anim">
                      <Counter value={stat.value} suffix={stat.suffix} />
                    </span>
                  </dd>
                  <dt className="mt-4 max-w-[18ch] font-sans text-2xs uppercase tracking-luxe text-ivory/40">
                    {stat.label}
                  </dt>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Environment */}
      <section className="shell py-24 sm:py-32" aria-labelledby="environment-title">
        <div className="grid gap-12 lg:grid-cols-[0.95fr,1.05fr] lg:gap-20">
          <div>
            <SplitHeading
              as="h2"
              id="environment-title"
              text="The room matters as much as the work."
              accent={[[1, 1]]}
              className="display-md"
            />
            <Reveal y={20} delay={0.1}>
              <div className="mt-8 space-y-5 leading-relaxed text-ivory/55">
                <p>
                  Private treatment suites. Light warm enough to see true colour but soft enough
                  to rest under. A scent developed for the space rather than bought off a shelf.
                  Music low enough that you can hear yourself think.
                </p>
                <p>
                  Every tool is sterilised in a medical-grade autoclave between guests, and
                  anything that touches skin and cannot be sterilised is single-use and opened in
                  front of you.
                </p>
                <p>
                  You will be offered tea. Please take it — the first ten minutes of doing nothing
                  are genuinely part of the treatment.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Reveal y={36}>
              <Plate alt="The reception at Marilux" seed={16} ratio="aspect-[3/4]" />
            </Reveal>
            <Reveal y={36} delay={0.1} className="pt-10">
              <Plate alt="A private treatment suite" seed={52} ratio="aspect-[3/4]" />
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Come and see"
        title="The best way to understand us is to sit down."
        accent={[[6, 7]]}
        body="Book any treatment, or start with a consultation — thirty minutes, a proper analysis and a written plan, redeemable against your first appointment."
      />
    </>
  );
}
