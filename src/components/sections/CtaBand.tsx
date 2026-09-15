import { SITE, whatsappLink } from '@/lib/data/site';
import Reveal from '@/components/ui/Reveal';
import SplitHeading from '@/components/ui/SplitHeading';
import { ButtonLink } from '@/components/ui/Button';
import Aura from '@/components/ui/Aura';

export default function CtaBand({
  eyebrow = 'Booking',
  title = 'Two minutes now. A very good day later.',
  accent = [[0, 1]] as Array<[number, number]>,
  body = 'Choose your treatment, your specialist and your time. Secure it with a 50% deposit and we will take care of everything else.',
  primaryHref = '/booking',
  primaryLabel = 'Start your booking',
}: {
  eyebrow?: string;
  title?: string;
  accent?: Array<[number, number]>;
  body?: string;
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <Aura className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" color="rgba(217,188,140,0.15)" size={760} />

      <div className="shell relative">
        <div className="glass relative overflow-hidden rounded-[2rem] px-7 py-16 text-center sm:px-14 sm:py-24">
          <Reveal y={14}>
            <p className="eyebrow mb-7">{eyebrow}</p>
          </Reveal>

          <SplitHeading
            text={title}
            accent={accent}
            className="display-lg mx-auto max-w-[17ch] text-balance"
          />

          <Reveal y={20} delay={0.1}>
            <p className="lede mx-auto mt-7 max-w-[52ch]">{body}</p>
          </Reveal>

          <Reveal y={22} delay={0.16}>
            <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href={primaryHref} size="lg" magnetic arrow>
                {primaryLabel}
              </ButtonLink>
              <ButtonLink
                href={whatsappLink('Hello Marilux, I have a question before I book.')}
                variant="outline"
                size="lg"
              >
                Ask a question first
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal y={14} delay={0.24}>
            <p className="mt-9 font-sans text-2xs uppercase tracking-luxe text-ivory/35">
              {SITE.hours[0].short} &nbsp;·&nbsp; {SITE.hours[1].short} &nbsp;·&nbsp;{' '}
              {SITE.address.display}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
