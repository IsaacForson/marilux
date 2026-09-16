import 'server-only';
import { cache } from 'react';
import { db, dbConfigured } from '@/lib/store/db';
import { GALLERY, type GalleryItem } from '@/lib/data/gallery';

/**
 * The portfolio.
 *
 * Same pattern as the catalogue: the shipped `GALLERY` is the default, and
 * anything the studio adds in the dashboard replaces it wholesale. Replacing
 * rather than merging is the right call here — a gallery is a curated set, and
 * a studio that has uploaded their own work does not want ours mixed in.
 */
export type LiveGalleryItem = GalleryItem & {
  /** Present only for studio-managed items. */
  dbId?: string;
  imageUrl?: string;
  beforeUrl?: string;
};

type Row = {
  id: string;
  title: string;
  caption: string | null;
  category_slug: string;
  image_url: string | null;
  before_url: string | null;
  kind: 'image' | 'video' | 'before-after';
  span: 'tall' | 'wide' | 'square' | 'portrait';
  sort_order: number;
  is_active: boolean;
};

const CATEGORY_LABEL: Record<string, string> = {
  'brows-permanent-makeup': 'Brows',
  lashes: 'Lashes',
  'hair-wigs-installation': 'Hair',
  'nails-manicure-pedicure': 'Nails',
  'facials-skincare': 'Skin',
  'aesthetic-enhancement': 'Makeup',
  'body-spa-wellness': 'Spa',
  all: 'Marilux',
};

const toItem = (r: Row): LiveGalleryItem => ({
  id: 'db-' + r.id,
  dbId: r.id,
  title: r.title,
  caption: r.caption ?? undefined,
  categorySlug: r.category_slug,
  category: CATEGORY_LABEL[r.category_slug] ?? 'Marilux',
  kind: r.kind,
  span: r.span,
  // `theme`/`index` only matter when no real image exists; the picker
  // guarantees one, so these are a harmless fallback.
  theme: 'portrait',
  index: 0,
  src: r.image_url ?? undefined,
  beforeSrc: r.before_url ?? undefined,
  imageUrl: r.image_url ?? undefined,
  beforeUrl: r.before_url ?? undefined,
});

async function loadRows(includeHidden = false): Promise<Row[]> {
  if (!dbConfigured()) return [];
  try {
    const sql = db();
    const timeoutMs = Number(process.env.CATALOGUE_TIMEOUT_MS || 8000);
    const read = includeHidden
      ? sql<Row[]>`select * from public.gallery_items order by sort_order, created_at desc`
      : sql<Row[]>`select * from public.gallery_items
                   where is_active order by sort_order, created_at desc`;

    const rows = await Promise.race([
      read,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    if (!rows) {
      console.warn('[gallery] read timed out — using the shipped gallery');
      return [];
    }
    return rows;
  } catch (error) {
    console.error('[gallery] read failed, using the shipped gallery:', error);
    return [];
  }
}

/** What the public gallery renders. */
export const getGallery = cache(async function getGallery(): Promise<LiveGalleryItem[]> {
  const rows = await loadRows();
  return rows.length ? rows.map(toItem) : GALLERY;
});

/** Everything, including hidden items. Admin view. */
export const getGalleryForAdmin = cache(async function getGalleryForAdmin() {
  const rows = await loadRows(true);
  return rows.map((r) => ({ ...toItem(r), isActive: r.is_active, sortOrder: r.sort_order }));
});

/** True once the studio has taken over the gallery. */
export async function galleryIsCustom() {
  return (await loadRows(true)).length > 0;
}

export async function upsertGalleryItem(input: {
  id?: string;
  title: string;
  caption: string | null;
  categorySlug: string;
  imageUrl: string | null;
  beforeUrl: string | null;
  kind: 'image' | 'video' | 'before-after';
  span: 'tall' | 'wide' | 'square' | 'portrait';
  sortOrder: number;
  isActive: boolean;
}) {
  const sql = db();
  const rows = input.id
    ? await sql<Row[]>`
        update public.gallery_items set
          title = ${input.title}, caption = ${input.caption},
          category_slug = ${input.categorySlug}, image_url = ${input.imageUrl},
          before_url = ${input.beforeUrl}, kind = ${input.kind}, span = ${input.span},
          sort_order = ${input.sortOrder}, is_active = ${input.isActive}
        where id = ${input.id} returning *`
    : await sql<Row[]>`
        insert into public.gallery_items
          (title, caption, category_slug, image_url, before_url, kind, span, sort_order, is_active)
        values
          (${input.title}, ${input.caption}, ${input.categorySlug}, ${input.imageUrl},
           ${input.beforeUrl}, ${input.kind}, ${input.span}, ${input.sortOrder}, ${input.isActive})
        returning *`;
  if (!rows[0]) throw new Error('Gallery item not found.');
  return toItem(rows[0]);
}

export async function deleteGalleryItem(id: string) {
  const sql = db();
  await sql`delete from public.gallery_items where id = ${id}`;
}

/**
 * Copies the shipped gallery into the database.
 *
 * Gives the studio a populated starting point to edit rather than a blank
 * page, which is a much better first experience than "add your first item".
 */
export async function seedGalleryFromDefaults() {
  const sql = db();
  const existing = await sql<Array<{ n: number }>>`
    select count(*)::int as n from public.gallery_items`;
  if (existing[0].n > 0) return { seeded: 0 };

  let order = 0;
  for (const item of GALLERY) {
    await sql`
      insert into public.gallery_items
        (title, caption, category_slug, image_url, kind, span, sort_order, is_active)
      values
        (${item.title}, ${item.caption ?? null}, ${item.categorySlug}, ${null},
         ${item.kind ?? 'image'}, ${item.span}, ${order}, true)`;
    order += 1;
  }
  return { seeded: GALLERY.length };
}
