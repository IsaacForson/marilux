import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isSignedIn } from '@/lib/admin/auth';
import { db, dbConfigured } from '@/lib/store/db';
import { getFullCatalogue, invalidateCatalogue } from '@/lib/catalogue';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const serviceSchema = z.object({
  categorySlug: z.string().min(1),
  serviceSlug: z.string().min(1),
  name: z.string().trim().max(120).nullable().optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  price: z.number().int().min(0).max(1_000_000).nullable().optional(),
  priceFrom: z.boolean().nullable().optional(),
  durationMinutes: z.number().int().min(5).max(40_000).nullable().optional(),
  imageUrl: z.string().trim().max(500).nullable().optional(),
  badge: z.string().trim().max(40).nullable().optional(),
  isActive: z.boolean().optional(),
});

const categorySchema = z.object({
  slug: z.string().min(1),
  name: z.string().trim().max(120).nullable().optional(),
  tagline: z.string().trim().max(160).nullable().optional(),
  summary: z.string().trim().max(500).nullable().optional(),
  intro: z.string().trim().max(2000).nullable().optional(),
  imageUrl: z.string().trim().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
});

const schema = z.object({
  services: z.array(serviceSchema).max(300).optional(),
  categories: z.array(categorySchema).max(50).optional(),
});

function revalidateCatalogue() {
  invalidateCatalogue();
  revalidatePath('/');
  revalidatePath('/services');
  revalidatePath('/services/[slug]', 'page');
  revalidatePath('/booking');
}

export async function GET() {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, categories: await getFullCatalogue() });
}

/**
 * Save catalogue overrides.
 *
 * Accepts a batch so the price editor can save a whole category in one call.
 * A null field means "use the shipped default" — the column is cleared rather
 * than set, which is what makes reset-to-default a delete.
 */
export async function PUT(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  if (!dbConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'A database is required. Set DATABASE_URL.' },
      { status: 503 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid payload.' }, { status: 422 });
  }

  const sql = db();
  try {
    await sql.begin(async (tx) => {
      for (const s of parsed.data.services ?? []) {
        await tx`
          insert into public.service_overrides
            (category_slug, service_slug, name, description, price, price_from,
             duration_minutes, image_url, badge, is_active)
          values
            (${s.categorySlug}, ${s.serviceSlug}, ${s.name ?? null}, ${s.description ?? null},
             ${s.price ?? null}, ${s.priceFrom ?? null}, ${s.durationMinutes ?? null},
             ${s.imageUrl ?? null}, ${s.badge ?? null}, ${s.isActive ?? true})
          on conflict (category_slug, service_slug) do update set
            name = excluded.name, description = excluded.description,
            price = excluded.price, price_from = excluded.price_from,
            duration_minutes = excluded.duration_minutes,
            image_url = excluded.image_url, badge = excluded.badge,
            is_active = excluded.is_active`;
      }

      for (const c of parsed.data.categories ?? []) {
        await tx`
          insert into public.category_overrides
            (slug, name, tagline, summary, intro, image_url, is_active)
          values
            (${c.slug}, ${c.name ?? null}, ${c.tagline ?? null}, ${c.summary ?? null},
             ${c.intro ?? null}, ${c.imageUrl ?? null}, ${c.isActive ?? true})
          on conflict (slug) do update set
            name = excluded.name, tagline = excluded.tagline,
            summary = excluded.summary, intro = excluded.intro,
            image_url = excluded.image_url, is_active = excluded.is_active`;
      }
    });

    revalidateCatalogue();
    return NextResponse.json({ ok: true, categories: await getFullCatalogue() });
  } catch (error) {
    console.error('[services] save failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Could not save those changes.' },
      { status: 500 },
    );
  }
}

/** Clear overrides, returning a service or category to its shipped values. */
export async function DELETE(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }

  const url = new URL(req.url);
  const categorySlug = url.searchParams.get('category');
  const serviceSlug = url.searchParams.get('service');
  if (!categorySlug) {
    return NextResponse.json({ ok: false, error: 'Nothing specified.' }, { status: 422 });
  }

  const sql = db();
  if (serviceSlug) {
    await sql`delete from public.service_overrides
              where category_slug = ${categorySlug} and service_slug = ${serviceSlug}`;
  } else {
    await sql`delete from public.service_overrides where category_slug = ${categorySlug}`;
    await sql`delete from public.category_overrides where slug = ${categorySlug}`;
  }

  revalidateCatalogue();
  return NextResponse.json({ ok: true, categories: await getFullCatalogue() });
}
