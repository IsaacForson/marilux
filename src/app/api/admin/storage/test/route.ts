import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { isSignedIn } from '@/lib/admin/auth';
import {
  storageBackend,
  storageKeyLooksPublishable,
  storageSecret,
  supabaseStorageConfigured,
} from '@/lib/media/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Round-trips a tiny image through Supabase Storage.
 *
 * Uploads, fetches back over the public URL, then deletes — so it proves the
 * key, the bucket and the public-read policy all work together, rather than
 * just that a request was accepted.
 */
export async function POST() {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }

  if (storageKeyLooksPublishable()) {
    return NextResponse.json({
      ok: false,
      backend: storageBackend(),
      error: 'That is a publishable key, which cannot write to Storage.',
      hint:
        'Uploads are still working — they are going to your database instead. ' +
        'Swap SUPABASE_SECRET_KEY for the secret (service_role) key from ' +
        'Project Settings → API Keys to move them to the CDN.',
    });
  }

  if (!supabaseStorageConfigured()) {
    return NextResponse.json({
      ok: false,
      backend: storageBackend(),
      error:
        'Supabase Storage is not configured. Images are being stored in your database, ' +
        'which works — this is only needed to move them to the CDN.',
      hint: 'Set SUPABASE_URL and SUPABASE_SECRET_KEY (Project Settings → API Keys → secret).',
    });
  }

  const base = (process.env.SUPABASE_URL as string).replace(/\/$/, '');
  const bucket = process.env.SUPABASE_BUCKET || 'marilux';
  const path = '_healthcheck/probe-' + Date.now() + '.webp';

  try {
    const bytes = await sharp({
      create: { width: 8, height: 8, channels: 3, background: { r: 217, g: 188, b: 140 } },
    })
      .webp()
      .toBuffer();

    const put = await fetch(base + '/storage/v1/object/' + bucket + '/' + path, {
      method: 'POST',
      headers: {
        apikey: storageSecret(),
        Authorization: 'Bearer ' + storageSecret(),
        'Content-Type': 'image/webp',
        'x-upsert': 'true',
      },
      body: new Uint8Array(bytes),
      signal: AbortSignal.timeout(20_000),
    });

    if (!put.ok) {
      const detail = await put.text().catch(() => '');
      return NextResponse.json({
        ok: false,
        backend: storageBackend(),
        error: 'Upload rejected: ' + detail.slice(0, 200),
        hint: /row-level security|Unauthorized/i.test(detail)
          ? 'The key cannot write. Use the secret (service_role) key.'
          : 'Check the bucket name matches SUPABASE_BUCKET.',
      });
    }

    const publicUrl = base + '/storage/v1/object/public/' + bucket + '/' + path;
    const read = await fetch(publicUrl, { signal: AbortSignal.timeout(15_000) });

    // Clean up regardless of whether the read succeeded.
    await fetch(base + '/storage/v1/object/' + bucket + '/' + path, {
      method: 'DELETE',
      headers: { apikey: storageSecret(), Authorization: 'Bearer ' + storageSecret() },
    }).catch(() => undefined);

    if (!read.ok) {
      return NextResponse.json({
        ok: false,
        backend: storageBackend(),
        error: 'Uploaded, but the public URL returned ' + read.status + '.',
        hint: 'The bucket needs to be public. Run npm run db:migrate to apply the read policy.',
      });
    }

    return NextResponse.json({
      ok: true,
      backend: 'supabase',
      bucket,
      message: 'Upload, public read and delete all worked. New images will go to the CDN.',
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      backend: storageBackend(),
      error: error instanceof Error ? error.message : 'Storage test failed.',
    });
  }
}
