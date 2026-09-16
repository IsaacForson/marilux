import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isSignedIn } from '@/lib/admin/auth';
import { invalidateRead, READ_KEYS } from '@/lib/store/readCache';
import {
  ACCEPTED_TYPES,
  deleteMedia,
  listMedia,
  MAX_UPLOAD_BYTES,
  storageBackend,
  updateMediaAlt,
  uploadMedia,
} from '@/lib/media/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function revalidateSite() {
  invalidateRead(READ_KEYS.catalogue, READ_KEYS.gallery);
  for (const path of ['/', '/services', '/gallery', '/about']) revalidatePath(path);
  revalidatePath('/services/[slug]', 'page');
}

export async function GET(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  const folder = new URL(req.url).searchParams.get('folder') || undefined;
  return NextResponse.json({
    ok: true,
    backend: storageBackend(),
    media: await listMedia(folder),
  });
}

export async function POST(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed upload.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: 'No image was attached.' }, { status: 422 });
  }

  // Trust the sniffed type over the extension; sharp re-encodes anyway, so a
  // mislabelled file simply fails to decode rather than being stored as-is.
  if (file.type && !ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { ok: false, error: 'That file type is not supported. Use JPG, PNG, WebP or HEIC.' },
      { status: 422 },
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { ok: false, error: 'That image is too large. The limit is 12 MB.' },
      { status: 413 },
    );
  }

  const result = await uploadMedia({
    file,
    alt: String(form.get('alt') ?? ''),
    folder: String(form.get('folder') ?? 'general'),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  revalidateSite();
  return NextResponse.json({ ok: true, media: result.media });
}

export async function PATCH(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { id?: string; alt?: string } | null;
  if (!body?.id) {
    return NextResponse.json({ ok: false, error: 'No image specified.' }, { status: 422 });
  }
  await updateMediaAlt(body.id, (body.alt ?? '').slice(0, 300));
  revalidateSite();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ ok: false, error: 'No image specified.' }, { status: 422 });
  }
  await deleteMedia(id);
  revalidateSite();
  return NextResponse.json({ ok: true });
}
