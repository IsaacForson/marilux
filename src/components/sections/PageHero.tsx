import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Reveal from '@/components/ui/Reveal';
import SplitHeading from '@/components/ui/SplitHeading';
import Aura from '@/components/ui/Aura';

export type Crumb = { href?: string; label: string };

/**
 * Interior page opening.
 *
 * Accepts an optional mood so each service room can carry its own light
 * without duplicating the layout.
 */
export default function PageHero({
  eyebrow,
  title,
  accent,
  lede,
  crumbs = [],
  mood,
  children,
  className,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  accent?: Array<[number, number]>;
  lede?: string;
  crumbs?: Crumb[];
  mood?: { accent: string; rgb: string };
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center';
}) {
  const glow = mood ? 'rgb(' + mood.rgb + ' / 0.18)' : 'rgba(217,188,140,0.17)';

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden pb-16 pt-36 sm:pb-24 sm:pt-44',
        className,
      )}
    >
      <Aura className="-left-32 top-[-12%]" color={glow} size={680} />
      <Aura className="-right-40 top-[20%]" color="rgba(192,138,126,0.12)" size={560} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grain" />

      <div className={cn('shell relative', align === 'center' && 'text-center')}>
        {crumbs.length > 0 && (
          <Reveal y={10} duration={0.6}>
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol
                className={cn(
                  'flex flex-wrap items-center gap-1.5 font-sans text-2xs uppercase tracking-luxe text-ivory/35',
                  align === 'center' && 'justify-center',
                )}
              >
                {crumbs.map((c, i) => (
                  <li key={c.label} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <ChevronRight className="h-3 w-3 text-ivory/20" aria-hidden="true" />
                    )}
                    {c.href ? (
                      <Link href={c.href} className="transition-colors hover:text-accent">
                        {c.label}
                      </Link>
                    ) : (
                      <span aria-current="page" className="text-ivory/60">
                        {c.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </Reveal>
        )}

        <Reveal y={14} duration={0.7}>
          <p
            className={cn(
              'eyebrow mb-6 flex items-center gap-3',
              align === 'center' && 'justify-center',
            )}
            style={mood ? { color: mood.accent } : undefined}
          >
            <span
              className="h-px w-10"
              style={{ background: (mood?.accent ?? '#D9BC8C') + '73' }}
              aria-hidden="true"
            />
            {eyebrow}
          </p>
        </Reveal>

        <SplitHeading
          as="h1"
          text={title}
          accent={accent}
          className={cn('display-xl max-w-[15ch]', align === 'center' && 'mx-auto')}
          immediate
          delay={0.15}
        />

        {lede && (
          <Reveal y={20} delay={0.3}>
            <p
              className={cn(
                'lede mt-8 max-w-[58ch] sm:mt-10',
                align === 'center' && 'mx-auto',
              )}
            >
              {lede}
            </p>
          </Reveal>
        )}

        {children}
      </div>
    </section>
  );
}
