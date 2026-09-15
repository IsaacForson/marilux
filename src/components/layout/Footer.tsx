import Link from 'next/link';
import { FaInstagram, FaSnapchatGhost, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { SITE, mailLink, telLink, whatsappLink } from '@/lib/data/site';
import { SERVICE_CATEGORIES } from '@/lib/data/services';
import Reveal from '@/components/ui/Reveal';
import SplitHeading from '@/components/ui/SplitHeading';
import { ButtonLink } from '@/components/ui/Button';
import Newsletter from './Newsletter';
import Wordmark from './Wordmark';

const SOCIALS = [
  { icon: FaInstagram, label: 'Instagram', ...SITE.socials.instagram },
  { icon: FaTiktok, label: 'TikTok', ...SITE.socials.tiktok },
  { icon: FaSnapchatGhost, label: 'Snapchat', ...SITE.socials.snapchat },
  {
    icon: FaWhatsapp,
    label: 'WhatsApp',
    handle: SITE.contact.phone,
    url: whatsappLink('Hello Marilux, I would like to make an enquiry.'),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink">
      <div
        aria-hidden="true"
        className="aura absolute -left-40 top-0 h-[560px] w-[560px]"
        style={{ background: 'radial-gradient(circle, rgba(217,188,140,0.12) 0%, transparent 68%)' }}
      />

      <div className="shell relative py-20 sm:py-28">
        {/* Closing invitation */}
        <div className="grid gap-12 border-b border-line pb-16 lg:grid-cols-[1.25fr,0.75fr] lg:items-end">
          <div>
            <Reveal y={14}>
              <span className="eyebrow">Ready when you are</span>
            </Reveal>
            <SplitHeading
              text="Your seat is waiting."
              accent={[[2, 2]]}
              className="display-lg mt-6"
            />
          </div>
          <Reveal y={20} className="lg:pb-3">
            <p className="lede mb-8 max-w-[42ch]">
              Reserve online in under two minutes, or send us a message and we will build the
              appointment around your day.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/booking" size="lg" magnetic arrow>
                Book now
              </ButtonLink>
              <ButtonLink
                href={whatsappLink('Hello Marilux, I would like to book an appointment.')}
                variant="outline"
                size="lg"
              >
                WhatsApp us
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        {/* Directory */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr,1fr,1fr,1.2fr]">
          <div>
            <Wordmark />
            <p className="mt-6 max-w-[34ch] text-sm leading-relaxed text-ivory/50">
              A luxury beauty destination in Hebron, Accra. Brows, lashes, hair, nails, skin and
              spa — delivered with clinical precision and genuine warmth.
            </p>
            <div className="mt-7 flex gap-2.5">
              {SOCIALS.map(({ icon: Icon, label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-line-2 text-ivory/60 transition-all duration-500 ease-luxe hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn
            title="Explore"
            links={[
              { href: '/about', label: 'The house' },
              { href: '/services', label: 'Services' },
              { href: '/gallery', label: 'Gallery' },
              { href: '/testimonials', label: 'Client stories' },
              { href: '/institute', label: 'Institute' },
              { href: '/contact', label: 'Contact' },
              { href: '/booking', label: 'Book an appointment' },
            ]}
          />

          <FooterColumn
            title="Treatments"
            links={SERVICE_CATEGORIES.slice(0, 7).map((c) => ({
              href: '/services/' + c.slug,
              label: c.name.replace(' & Training', '').replace(', Manicure & Pedicure', ''),
            }))}
          />

          <div>
            <h2 className="eyebrow mb-5">Visit & contact</h2>
            <address className="space-y-3 text-sm not-italic text-ivory/55">
              <p>{SITE.address.display}</p>
              <p>
                <a href={telLink} className="transition-colors hover:text-accent">
                  {SITE.contact.phone}
                </a>
              </p>
              <p>
                <a href={mailLink} className="break-all transition-colors hover:text-accent">
                  {SITE.contact.email}
                </a>
              </p>
            </address>

            <h2 className="eyebrow mb-4 mt-8">Hours</h2>
            <dl className="space-y-2 text-sm text-ivory/55">
              {SITE.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4 border-b border-line pb-2">
                  <dt>{h.days}</dt>
                  <dd className="whitespace-nowrap text-ivory/75">
                    {h.open} – {h.close}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <Newsletter />

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-2xs uppercase tracking-luxe text-ivory/35 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/booking#policy" className="transition-colors hover:text-accent">
              Booking policy
            </Link>
            <Link href="/contact" className="transition-colors hover:text-accent">
              Careers & enquiries
            </Link>
            <span>Made in Accra</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h2 className="eyebrow mb-5">{title}</h2>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group inline-flex items-center gap-2 text-sm text-ivory/55 transition-colors duration-500 hover:text-accent"
            >
              <span
                aria-hidden="true"
                className="h-px w-0 bg-champagne transition-all duration-500 ease-luxe group-hover:w-3"
              />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
