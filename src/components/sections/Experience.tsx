import { Award, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import { STATS } from '@/lib/data/testimonials';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import Counter from '@/components/ui/Counter';
import Plate from '@/components/ui/Plate';
import MediaCard from '@/components/ui/MediaCard';
import Aura from '@/components/ui/Aura';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Clinical hygiene, always',
    body: 'Medical-grade autoclave sterilisation, single-use tooling and a documented protocol for every treatment. Non-negotiable, every appointment.',
  },
  {
    icon: Sparkles,
    title: 'Products worth your skin',
    body: 'Professional-only formulations chosen for deep complexions and Ghana’s climate. We will tell you what a product cannot do.',
  },
  {
    icon: Award,
    title: 'Specialists, not generalists',
    body: 'Every artist trains in a single discipline before they touch a client, then keeps training. The person doing your brows does brows.',
  },
  {
    icon: HeartHandshake,
    title: 'Honest counsel',
    body: 'If a treatment is wrong for you, we say so and offer the one that is. We would rather lose a booking than your trust.',
  },
];

export default function Experience() {
  return (
    <section
      className="relative overflow-hidden border-y border-line py-24 sm:py-36"
      aria-labelledby="experience-title"
    >
      <Aura className="-right-40 top-10" color="rgba(217,188,140,0.13)" size={680} />

      <div className="shell relative">
        <div className="grid gap-16 lg:grid-cols-[0.95fr,1.05fr] lg:gap-20">
          {/* Imagery column */}
          <Reveal y={40} className="relative order-2 lg:order-1">
            <Plate
              alt="The treatment floor at Marilux Beauty Bar, warm and low-lit"
              theme="studio"
              index={2}
              ratio="aspect-[4/5]"
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="shadow-[0_60px_140px_-60px_rgba(0,0,0,0.95)]"
            />
            <MediaCard className="absolute -bottom-6 -right-4 max-w-[15rem] p-6 sm:-right-8">
              <p className="font-display text-4xl font-light text-accent">98%</p>
              <p className="mt-2 text-sm leading-relaxed text-ivory/75">
                of our guests book their next appointment before they leave.
              </p>
            </MediaCard>
          </Reveal>

          {/* Copy column */}
          <div className="order-1 lg:order-2">
            <SectionHeader
              eyebrow="Why clients stay"
              title="Trust is built in the details you never see."
              accent={[[1, 2]]}
              as="h2"
              size="display-md"
              lede="Anyone can post a good photograph. What separates a beauty destination from a beauty shop is what happens between the photographs — the sterilisation, the patch test, the honest no."
            />

            <ul className="mt-14 space-y-8">
              {PILLARS.map((p, i) => (
                <Reveal key={p.title} y={22} delay={i * 0.06}>
                  <li className="group flex gap-5 border-b border-line pb-8">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent/25 text-accent transition-colors duration-500 group-hover:border-accent/70">
                      <p.icon className="h-4 w-4" strokeWidth={1.35} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-light text-ivory">{p.title}</h3>
                      <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ivory/50">
                        {p.body}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>

        {/* Proof bar */}
        <dl className="mt-24 grid grid-cols-2 gap-x-6 gap-y-12 border-t border-line pt-16 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} y={20} delay={i * 0.07}>
              <div>
                <dd className="font-display text-[clamp(2.4rem,5vw,4rem)] font-light leading-none">
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
  );
}
