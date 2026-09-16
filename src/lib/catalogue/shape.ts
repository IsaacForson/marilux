import type { LiveCategory } from './index';

/**
 * The catalogue as it crosses into client components.
 *
 * Deliberately narrow: the booking flow needs prices, durations and copy, not
 * the editorial fields the marketing pages use. Keeping this small keeps the
 * booking page's serialised payload small.
 */
export type ClientService = {
  slug: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  priceFrom?: boolean;
  featured?: boolean;
  tags?: string[];
};

export type ClientCategory = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  ritual: [string, string, string];
  mood: { accent: string; rgb: string };
  services: ClientService[];
};

export function toClientCatalogue(categories: LiveCategory[]): ClientCategory[] {
  return categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    tagline: c.tagline,
    summary: c.summary,
    ritual: c.ritual,
    mood: { accent: c.mood.accent, rgb: c.mood.rgb },
    services: c.services.map((s) => ({
      slug: s.slug,
      name: s.name,
      description: s.description,
      duration: s.duration,
      price: s.price,
      priceFrom: s.priceFrom,
      featured: s.featured,
      tags: s.tags,
    })),
  }));
}
