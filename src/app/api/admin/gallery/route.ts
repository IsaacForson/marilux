import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isSignedIn } from '@/lib/admin/auth';
import { dbConfigured } from '@/lib/store/db';
import {
  deleteGalleryItem,
  getGalleryForAdmin,
  seedGalleryFromDefaults,
  upsertGalleryItem,
} from '@/lib/media/gallery';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(160),
  caption: z.string().trim().max(500).nullable().optional(),
  categorySlug: z.string().trim().min(1).max(60),
  imageUrl: z.string().trim().max(600).nullable().optional(),
  beforeUrl: z.string().trim().max(600).nullable().optional(),
  kind: z.enum(['image', 'video', 'before-after']),
  span: z.enum(['tall', 'wide', 'square', 'portrait']),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true),
});

const revalidateGallery = () => {
  revalidatePath('/gallery');
  revalidatePath('/');
};

export async function GET() {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, items: await getGalleryForAdmin() });
}

export async function PUT(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  if (!dbConfigured()) {
    return NextResponse.json({ ok: false, error: 'A database is required.' }, { status: 503 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid item.' },
      { status: 422 },
    );
  }

  try {
    await upsertGalleryItem({
      ...parsed.data,
      caption: parsed.data.caption ?? null,
      imageUrl: parsed.data.imageUrl || null,
      beforeUrl: parsed.data.beforeUrl || null,
    });
    revalidateGallery();
    return NextResponse.json({ ok: true, items: await getGalleryForAdmin() });
  } catch (error) {
    console.error('[gallery] save failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not save that item.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ ok: false, error: 'No item specified.' }, { status: 422 });
  }
  await deleteGalleryItem(id);
  revalidateGallery();
  return NextResponse.json({ ok: true, items: await getGalleryForAdmin() });
}

/** Copies the shipped gallery in, so the studio edits rather than starts blank. */
export async function POST() {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  if (!dbConfigured()) {
    return NextResponse.json({ ok: false, error: 'A database is required.' }, { status: 503 });
  }
  const result = await seedGalleryFromDefaults();
  revalidateGallery();
  return NextResponse.json({ ok: true, ...result, items: await getGalleryForAdmin() });
}
