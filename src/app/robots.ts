import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/data/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Confirmation pages carry booking references and must stay out of search.
        disallow: ['/api/', '/booking/confirm'],
      },
    ],
    sitemap: SITE.url + '/sitemap.xml',
    host: SITE.url,
  };
}
