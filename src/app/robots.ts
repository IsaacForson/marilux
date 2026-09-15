import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/data/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The dashboard is private, and confirmation pages carry booking
        // references — neither belongs in a search index.
        disallow: ['/api/', '/admin', '/admin/', '/booking/confirm'],
      },
    ],
    sitemap: SITE.url + '/sitemap.xml',
    host: SITE.url,
  };
}
