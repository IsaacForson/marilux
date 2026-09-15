import type { Metadata } from 'next';
import { SITE } from '@/lib/data/site';

export function buildMetadata({
  title,
  description,
  path = '/',
  keywords = [],
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
}): Metadata {
  const url = SITE.url + path;
  const fullTitle = path === '/' ? title : title + ' — ' + SITE.name;

  return {
    title: fullTitle,
    description,
    keywords: [
      'beauty salon Accra',
      'luxury beauty Ghana',
      'microblading Accra',
      'lash extensions Accra',
      'wig installation Accra',
      'facials Accra',
      'Marilux Beauty Bar',
      ...keywords,
    ],
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: SITE.locale,
      url,
      siteName: SITE.name,
      title: fullTitle,
      description,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}

/** LocalBusiness structured data — the single biggest local-SEO lever. */
export function businessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    '@id': SITE.url + '#business',
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    telephone: SITE.contact.phoneIntl,
    email: SITE.contact.email,
    priceRange: 'GHS 60 – GHS 18,000',
    image: SITE.url + '/opengraph-image',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.geo.lat,
      longitude: SITE.geo.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '07:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '13:00',
        closes: '19:00',
      },
    ],
    sameAs: [
      SITE.socials.instagram.url,
      SITE.socials.tiktok.url,
      SITE.socials.snapchat.url,
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '187',
    },
  };
}
