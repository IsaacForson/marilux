import type { Metadata } from 'next';
import { Clock, MessageCircle, ShieldCheck } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { getCatalogue } from '@/lib/catalogue';
import { toClientCatalogue } from '@/lib/catalogue/shape';
import { listActiveOffers } from '@/lib/catalogue/promotions';
import { getSetting } from '@/lib/settings/store';
import { SITE, whatsappLink } from '@/lib/data/site';
import type { BookingDraft } from '@/lib/booking/types';
import BookingFlow from '@/components/booking/BookingFlow';
import PageHero from '@/components/sections/PageHero';
import { ButtonLink } from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';

export const metadata: Metadata = buildMetadata({
  title: 'Book an Appointment',
  description:
    'Reserve your seat at Marilux Beauty Bar in under two minutes. Choose your treatment, your specialist and your time, and secure it with a 50% deposit.',
  path: '/booking',
  keywords: ['book beauty appointment Accra', 'salon booking Ghana'],
});

const ASSURANCES = [
  { icon: Clock, text: 'Under two minutes, start to finish' },
  { icon: ShieldCheck, text: 'Secure deposit, no card details stored' },
  { icon: MessageCircle, text: 'Confirmation by email and WhatsApp' },
];

/**
 * Deep links such as /booking?category=lashes&service=volume-set arrive from
 * service cards and skip the guest straight to the first unanswered step.
 */
export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; service?: string; specialist?: string }>;
}) {
  const params = await searchParams;

  const [categories, bookingSettings, offers] = await Promise.all([
    getCatalogue(),
    getSetting('booking'),
    listActiveOffers(),
  ]);
  const catalogue = toClientCatalogue(categories);

  const category = params.category
    ? catalogue.find((c) => c.slug === params.category)
    : undefined;
  const service =
    category && params.service
      ? category.services.find((s) => s.slug === params.service)
      : undefined;

  const initial: BookingDraft = {
    ...(category ? { categorySlug: category.slug } : {}),
    ...(service ? { serviceSlug: service.slug } : {}),
    ...(params.specialist ? { specialistSlug: params.specialist } : {}),
  };

  return (
    <>
      <PageHero
        eyebrow="Reservations"
        title="Check in."
        accent={[[1, 1]]}
        lede="Nine short steps, and the room is yours. Change anything you like before you confirm — nothing is final until the deposit is made."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Booking' }]}
        mood={category?.mood}
      >
        <Reveal y={20} delay={0.4}>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {ASSURANCES.map((a) => (
              <li
                key={a.text}
                className="flex items-center gap-2.5 font-sans text-2xs uppercase tracking-luxe text-ivory/40"
              >
                <a.icon className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} aria-hidden="true" />
                {a.text}
              </li>
            ))}
          </ul>
        </Reveal>
      </PageHero>

      <section className="shell pb-28 pt-6 sm:pb-36">
        {bookingSettings.bookingOpen ? (
          <BookingFlow
            initial={initial}
            catalogue={catalogue}
            depositPercent={bookingSettings.depositPercent}
            offers={offers}
          />
        ) : (
          <div className="glass rounded-[1.75rem] px-7 py-14 text-center sm:px-12">
            <p className="eyebrow mb-5">Booking paused</p>
            <p className="display-sm mx-auto max-w-[24ch]">{bookingSettings.closedMessage}</p>
            <div className="mt-9">
              <ButtonLink
                href={whatsappLink('Hello Marilux, I would like to book an appointment.')}
                size="lg"
                arrow
              >
                Message us on WhatsApp
              </ButtonLink>
            </div>
          </div>
        )}
      </section>

      <section className="shell pb-28">
        <div className="glass rounded-2xl px-7 py-8 text-center sm:px-10">
          <p className="font-display text-xl font-light text-ivory">
            Prefer to speak to someone?
          </p>
          <p className="mx-auto mt-3 max-w-[54ch] text-sm leading-relaxed text-ivory/50">
            For group bookings, bridal parties, or anything that needs a custom timeline, message
            us and we will build the appointment around your day.
          </p>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-sans text-2xs uppercase tracking-luxe">
            <a
              href={whatsappLink('Hello Marilux, I would like help with a booking.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent transition-colors hover:text-accent"
            >
              WhatsApp {SITE.contact.phone}
            </a>
            <a
              href={'mailto:' + SITE.contact.email}
              className="text-ivory/45 transition-colors hover:text-accent"
            >
              {SITE.contact.email}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
