import type { Metadata } from 'next';
import { FaInstagram, FaSnapchatGhost, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { SITE, mailLink, telLink, whatsappLink } from '@/lib/data/site';
import { FAQS } from '@/lib/data/policies';
import JsonLd from '@/components/seo/JsonLd';
import PageHero from '@/components/sections/PageHero';
import LocationSection from '@/components/sections/LocationSection';
import ContactForm from '@/components/sections/ContactForm';
import CtaBand from '@/components/sections/CtaBand';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import Accordion from '@/components/ui/Accordion';

export const metadata: Metadata = buildMetadata({
  title: 'Contact & Visit',
  description:
    'Find Marilux Beauty Bar in Hebron, Accra. Phone and WhatsApp 0545489200, opening hours, directions and a direct contact form.',
  path: '/contact',
  keywords: ['contact Marilux Beauty Bar', 'beauty salon Hebron Accra contact'],
});

const CHANNELS = [
  {
    icon: FaWhatsapp,
    label: 'WhatsApp',
    value: SITE.contact.phone,
    href: whatsappLink('Hello Marilux, I would like to make an enquiry.'),
    note: 'Fastest reply — usually within the hour',
  },
  {
    icon: Phone,
    label: 'Telephone',
    value: SITE.contact.phone,
    href: telLink,
    note: 'During opening hours',
  },
  {
    icon: Mail,
    label: 'Email',
    value: SITE.contact.email,
    href: mailLink,
    note: 'Replies within one working day',
  },
];

const SOCIALS = [
  { icon: FaInstagram, label: 'Instagram', ...SITE.socials.instagram },
  { icon: FaTiktok, label: 'TikTok', ...SITE.socials.tiktok },
  { icon: FaSnapchatGhost, label: 'Snapchat', ...SITE.socials.snapchat },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }}
      />

      <PageHero
        eyebrow="Say hello"
        title="We would love to hear from you."
        accent={[[4, 5]]}
        lede="Whether it is a question about a treatment, a bridal timeline, a group booking or a place in the Institute — write to us, or simply message the studio directly."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Contact' }]}
      />

      {/* Channels */}
      <section className="shell pb-16" aria-label="Contact channels">
        <div className="grid gap-4 sm:grid-cols-3">
          {CHANNELS.map((c, i) => (
            <Reveal key={c.label} y={26} delay={i * 0.07}>
              <a
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group flex h-full flex-col rounded-[1.75rem] border border-line p-7 transition-all duration-700 ease-luxe hover:-translate-y-0.5 hover:border-accent/40"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full border border-accent/25 text-accent transition-colors duration-500 group-hover:border-accent/60">
                  <c.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="eyebrow mt-6">{c.label}</span>
                <span className="mt-2.5 break-all font-display text-xl font-light text-ivory transition-colors duration-500 group-hover:text-accent">
                  {c.value}
                </span>
                <span className="mt-3 text-sm text-ivory/40">{c.note}</span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Form + practical details */}
      <section
        className="shell border-t border-line py-20 sm:py-28"
        aria-labelledby="form-title"
      >
        <div className="grid gap-14 lg:grid-cols-[1.15fr,0.85fr] lg:gap-20">
          <div>
            <SectionHeader
              eyebrow="Write to us"
              title="Send a message."
              accent={[[1, 1]]}
              as="h2"
              size="display-md"
              className="mb-12"
            />
            <ContactForm />
          </div>

          <aside className="space-y-10">
            <Reveal y={22}>
              <div className="glass rounded-[1.75rem] p-7">
                <h2 className="eyebrow mb-5 flex items-center gap-2.5">
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  Opening hours
                </h2>
                <dl className="space-y-3">
                  {SITE.hours.map((h) => (
                    <div
                      key={h.days}
                      className="flex items-baseline justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0"
                    >
                      <dt className="text-sm text-ivory/50">{h.days}</dt>
                      <dd className="whitespace-nowrap text-sm text-ivory/85">
                        {h.open} – {h.close}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            <Reveal y={22} delay={0.07}>
              <div className="glass rounded-[1.75rem] p-7">
                <h2 className="eyebrow mb-5 flex items-center gap-2.5">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  The studio
                </h2>
                <address className="not-italic leading-relaxed text-ivory/60">
                  {SITE.address.display}
                </address>
                <p className="mt-4 text-sm leading-relaxed text-ivory/40">
                  Street parking is available directly outside. Once your booking is confirmed we
                  send the exact pin and arrival notes by WhatsApp.
                </p>
              </div>
            </Reveal>

            <Reveal y={22} delay={0.14}>
              <div className="glass rounded-[1.75rem] p-7">
                <h2 className="eyebrow mb-5">Follow the work</h2>
                <ul className="space-y-3">
                  {SOCIALS.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between gap-4 border-b border-line pb-3 transition-colors duration-500 last:border-0 last:pb-0 hover:text-accent"
                      >
                        <span className="flex items-center gap-3 text-sm text-ivory/60 transition-colors group-hover:text-accent">
                          <s.icon className="h-4 w-4" aria-hidden="true" />
                          {s.label}
                        </span>
                        <span className="font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                          {s.handle}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      <LocationSection />

      {/* FAQ */}
      <section
        className="shell border-t border-line py-20 sm:py-28"
        aria-labelledby="faq-title"
      >
        <div className="grid gap-12 lg:grid-cols-[0.8fr,1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeader
              eyebrow="Common questions"
              title="Answers, before you ask."
              accent={[[0, 0]]}
              as="h2"
              size="display-md"
            />
          </div>
          <Accordion
            items={FAQS.map((f, i) => ({ id: 'faq-' + i, title: f.q, body: f.a }))}
            defaultOpen="faq-0"
          />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
