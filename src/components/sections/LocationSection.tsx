'use client';

import { useState } from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { SITE, mailLink, telLink, whatsappLink } from '@/lib/data/site';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import { ButtonLink } from '@/components/ui/Button';
import Aura from '@/components/ui/Aura';

const MAPS_QUERY = encodeURIComponent('Hebron, Accra, Ghana');
const MAPS_LINK = 'https://www.google.com/maps/search/?api=1&query=' + MAPS_QUERY;

/**
 * Visit us.
 *
 * The map iframe is loaded on demand. A third-party embed in the initial
 * document would cost several hundred kilobytes and set cookies before the
 * visitor has asked for a map — so we show our own plate until they do.
 */
export default function LocationSection() {
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <section className="relative overflow-hidden py-24 sm:py-32" aria-labelledby="location-title">
      <Aura className="-left-32 bottom-0" color="rgba(192,138,126,0.14)" size={600} />

      <div className="shell relative grid gap-12 lg:grid-cols-[0.9fr,1.1fr] lg:gap-16">
        <div>
          <SectionHeader
            eyebrow="Find us"
            title="Hebron, Accra."
            accent={[[1, 1]]}
            as="h2"
            size="display-lg"
            lede="Street parking is available directly outside. Once your booking is confirmed we send the exact pin and arrival notes by WhatsApp."
          />

          <dl className="mt-12 space-y-7">
            <Reveal y={18}>
              <div className="flex gap-4">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-champagne"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
                <div>
                  <dt className="eyebrow mb-1.5">Studio</dt>
                  <dd className="text-ivory/70">{SITE.address.display}</dd>
                </div>
              </div>
            </Reveal>

            <Reveal y={18} delay={0.05}>
              <div className="flex gap-4">
                <Clock
                  className="mt-0.5 h-4 w-4 shrink-0 text-champagne"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
                <div>
                  <dt className="eyebrow mb-1.5">Hours</dt>
                  <dd className="space-y-1 text-ivory/70">
                    {SITE.hours.map((h) => (
                      <p key={h.days}>
                        <span className="text-ivory/45">{h.days}</span>
                        {'  '}
                        {h.open} – {h.close}
                      </p>
                    ))}
                  </dd>
                </div>
              </div>
            </Reveal>

            <Reveal y={18} delay={0.1}>
              <div className="flex gap-4">
                <Phone
                  className="mt-0.5 h-4 w-4 shrink-0 text-champagne"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
                <div>
                  <dt className="eyebrow mb-1.5">Phone & WhatsApp</dt>
                  <dd>
                    <a
                      href={telLink}
                      className="text-ivory/70 transition-colors hover:text-champagne"
                    >
                      {SITE.contact.phone}
                    </a>
                  </dd>
                </div>
              </div>
            </Reveal>

            <Reveal y={18} delay={0.15}>
              <div className="flex gap-4">
                <Mail
                  className="mt-0.5 h-4 w-4 shrink-0 text-champagne"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
                <div>
                  <dt className="eyebrow mb-1.5">Email</dt>
                  <dd>
                    <a
                      href={mailLink}
                      className="break-all text-ivory/70 transition-colors hover:text-champagne"
                    >
                      {SITE.contact.email}
                    </a>
                  </dd>
                </div>
              </div>
            </Reveal>
          </dl>

          <div className="mt-11 flex flex-wrap gap-3">
            <ButtonLink href="/booking" size="lg" magnetic arrow>
              Book an appointment
            </ButtonLink>
            <ButtonLink
              href={whatsappLink('Hello Marilux, could you share your location pin?')}
              variant="outline"
              size="lg"
            >
              Ask for directions
            </ButtonLink>
          </div>
        </div>

        <Reveal y={40} className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/[0.08] lg:aspect-auto lg:h-full lg:min-h-[32rem]">
            {mapLoaded ? (
              <iframe
                title={'Map showing ' + SITE.name + ' in Hebron, Accra'}
                src={'https://www.google.com/maps?q=' + MAPS_QUERY + '&output=embed'}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full grayscale-[0.6] contrast-[1.1]"
              />
            ) : (
              <>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 grain"
                  style={{
                    backgroundColor: '#14120F',
                    backgroundImage: [
                      'radial-gradient(60% 50% at 50% 46%, rgba(217,188,140,0.22) 0%, transparent 68%)',
                      'repeating-linear-gradient(0deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 58px)',
                      'repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 58px)',
                    ].join(','),
                  }}
                />

                <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2">
                  <span className="relative grid h-14 w-14 place-items-center rounded-full border border-champagne/50 bg-ink/70 text-champagne backdrop-blur-md">
                    <MapPin className="h-5 w-5" strokeWidth={1.4} aria-hidden="true" />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 animate-ping rounded-full border border-champagne/30"
                      style={{ animationDuration: '3.2s' }}
                    />
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-t from-ink via-ink/80 to-transparent p-6 sm:p-8">
                  <p className="font-display text-xl font-light text-ivory">
                    {SITE.address.display}
                  </p>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setMapLoaded(true)}
                      className="rounded-full border border-white/15 px-5 py-2.5 font-sans text-2xs uppercase tracking-luxe text-ivory/70 transition-colors duration-500 hover:border-champagne/60 hover:text-champagne"
                    >
                      Load map
                    </button>
                    <a
                      href={MAPS_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-champagne px-5 py-2.5 font-sans text-2xs uppercase tracking-luxe text-ink transition-colors duration-500 hover:bg-champagne-light"
                    >
                      Directions
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
