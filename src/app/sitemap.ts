import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/data/site';
import { SERVICE_CATEGORIES } from '@/lib/data/services';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: Array<{ path: string; priority: number; freq: 'weekly' | 'monthly' }> = [
    { path: '', priority: 1, freq: 'weekly' },
    { path: '/booking', priority: 0.95, freq: 'weekly' },
    { path: '/services', priority: 0.9, freq: 'weekly' },
    { path: '/gallery', priority: 0.8, freq: 'weekly' },
    { path: '/institute', priority: 0.8, freq: 'monthly' },
    { path: '/about', priority: 0.7, freq: 'monthly' },
    { path: '/testimonials', priority: 0.7, freq: 'monthly' },
    { path: '/contact', priority: 0.7, freq: 'monthly' },
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: SITE.url + r.path,
      lastModified: now,
      changeFrequency: r.freq,
      priority: r.priority,
    })),
    ...SERVICE_CATEGORIES.map((c) => ({
      url: SITE.url + '/services/' + c.slug,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
  ];
}
