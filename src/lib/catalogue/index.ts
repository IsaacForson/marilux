import 'server-only';
import { cache } from 'react';
import { db, dbConfigured } from '@/lib/store/db';
import {
  SERVICE_CATEGORIES,
  type Service,
  type ServiceCategory,
} from '@/lib/data/services';

/**
 * The live catalogue.
 *
 * `src/lib/data/services.ts` is the source of structure and the default copy.
 * The database holds *overrides*: a price the studio changed, a service they
 * turned off, an image they uploaded. They are layered on at read time.
 *
 * Consequences worth knowing:
 *  - An empty database renders exactly the catalogue we ship.
 *  - "Reset to default" is deleting a row, not restoring a backup.
 *  - A database outage degrades to the shipped prices rather than to an error.
 */

export type LiveService = Service & {
  /** Present when the studio has overridden this service. */
  overridden?: boolean;
  imageUrl?: string;
  badge?: string;
  isActive: boolean;
};

export type LiveCategory = Omit<ServiceCategory, 'services'> & {
  services: LiveService[];
  overridden?: boolean;
  imageUrl?: string;
  isActive: boolean;
};

type CategoryRow = {
  slug: string;
  name: string | null;
  tagline: string | null;
  summary: string | null;
  intro: string | null;
  image_url: string | null;
  sort_order: number | null;
  is_active: boolean;
};

type ServiceRow = {
  category_slug: string;
  service_slug: string;
  name: string | null;
  description: string | null;
  price: number | null;
  price_from: boolean | null;
  duration_minutes: number | null;
  image_url: string | null;
  badge: string | null;
  is_active: boolean;
};

const EMPTY = { categories: [] as CategoryRow[], services: [] as ServiceRow[] };

/**
 * Read the overrides, but never block on them.
 *
 * This runs during static generation as well as at request time. A slow or
 * unreachable database at build time must degrade to the shipped catalogue
 * rather than stall the build — the page is revalidated on the first request
 * afterwards, so live prices appear regardless.
 */
async function loadOverrides() {
  if (!dbConfigured()) return EMPTY;

  const timeoutMs = Number(process.env.CATALOGUE_TIMEOUT_MS || 8000);

  try {
    const sql = db();
    // Capture rather than race away a rejection: a Promise.race that only sees
    // the timeout hides the actual database error, which is exactly the
    // information needed when a read stops working.
    const read = Promise.all([
      sql<CategoryRow[]>`select * from public.category_overrides`,
      sql<ServiceRow[]>`select * from public.service_overrides`,
    ]).then(
      (rows) => ({ rows, error: null as unknown }),
      (error: unknown) => ({ rows: null, error }),
    );

    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
    const result = await Promise.race([read, timeout]);

    if (!result) {
      console.warn(
        '[catalogue] overrides timed out after ' + timeoutMs + 'ms — using shipped prices',
      );
      return EMPTY;
    }
    if (result.error || !result.rows) {
      console.error('[catalogue] override read failed:', result.error);
      return EMPTY;
    }

    const [categories, services] = result.rows;
    return { categories, services };
  } catch (error) {
    console.error('[catalogue] override read failed, using shipped prices:', error);
    return EMPTY;
  }
}

/** The full catalogue including anything the studio has hidden. Admin views. */
export const getFullCatalogue = cache(async function getFullCatalogue(): Promise<
  LiveCategory[]
> {
  const { categories, services } = await loadOverrides();
  const catByslug = new Map(categories.map((c) => [c.slug, c]));
  const svcByKey = new Map(services.map((s) => [s.category_slug + '/' + s.service_slug, s]));

  const merged = SERVICE_CATEGORIES.map((category) => {
    const co = catByslug.get(category.slug);

    const mergedServices: LiveService[] = category.services.map((service) => {
      const so = svcByKey.get(category.slug + '/' + service.slug);
      if (!so) return { ...service, isActive: true };
      return {
        ...service,
        name: so.name ?? service.name,
        description: so.description ?? service.description,
        price: so.price ?? service.price,
        priceFrom: so.price_from ?? service.priceFrom,
        duration: so.duration_minutes ?? service.duration,
        imageUrl: so.image_url ?? undefined,
        badge: so.badge ?? undefined,
        isActive: so.is_active,
        overridden: true,
      };
    });

    return {
      ...category,
      name: co?.name ?? category.name,
      tagline: co?.tagline ?? category.tagline,
      summary: co?.summary ?? category.summary,
      intro: co?.intro ?? category.intro,
      imageUrl: co?.image_url ?? undefined,
      isActive: co?.is_active ?? true,
      overridden: Boolean(co),
      services: mergedServices,
      sortOrder: co?.sort_order ?? null,
    } as LiveCategory & { sortOrder: number | null };
  });

  // A studio-set order wins; anything unordered keeps its shipped position.
  return merged.sort((a, b) => {
    const ao = (a as { sortOrder: number | null }).sortOrder;
    const bo = (b as { sortOrder: number | null }).sortOrder;
    if (ao == null && bo == null) return 0;
    if (ao == null) return 1;
    if (bo == null) return -1;
    return ao - bo;
  });
});

/** What the public site sees: hidden categories and services removed. */
export const getCatalogue = cache(async function getCatalogue(): Promise<LiveCategory[]> {
  const all = await getFullCatalogue();
  return all
    .filter((c) => c.isActive)
    .map((c) => ({ ...c, services: c.services.filter((s) => s.isActive) }))
    .filter((c) => c.services.length > 0);
});

export const getLiveCategory = cache(async function getLiveCategory(slug: string) {
  return (await getCatalogue()).find((c) => c.slug === slug);
});

export const getLiveService = cache(async function getLiveService(
  categorySlug: string,
  serviceSlug: string,
) {
  const category = await getLiveCategory(categorySlug);
  return category?.services.find((s) => s.slug === serviceSlug);
});

/**
 * Resolve a service for booking, including hidden ones.
 *
 * A guest mid-flow when the studio hides a service should still be able to
 * complete — pricing comes from here, not from the client.
 */
export const resolveServiceForBooking = cache(async function resolveServiceForBooking(
  categorySlug: string,
  serviceSlug: string,
) {
  const all = await getFullCatalogue();
  const category = all.find((c) => c.slug === categorySlug);
  const service = category?.services.find((s) => s.slug === serviceSlug);
  return category && service ? { category, service } : null;
});

export const getLiveServices = cache(async function getLiveServices() {
  const categories = await getCatalogue();
  return categories.flatMap((c) =>
    c.services.map((s) => ({ ...s, category: c.name, categorySlug: c.slug })),
  );
});

export const getFeaturedServices = cache(async function getFeaturedServices() {
  return (await getLiveServices()).filter((s) => s.featured);
});
