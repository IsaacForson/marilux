import { readMediaBytes } from '@/lib/media/storage';

export const runtime = 'nodejs';

/**
 * Serves an image stored in Postgres.
 *
 * Filenames carry a timestamp and the bytes never change, so the response is
 * immutable — the browser and any CDN in front of it fetch each image exactly
 * once, which is what makes the Postgres backend viable.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return new Response('Not found', { status: 404 });
  }

  const row = await readMediaBytes(id).catch(() => null);

  // A record stored in Supabase has no bytes here — send the caller there.
  if (row && !row.data && row.url.startsWith('http')) {
    return Response.redirect(row.url, 308);
  }
  if (!row?.data) return new Response('Not found', { status: 404 });

  return new Response(new Uint8Array(row.data), {
    headers: {
      'Content-Type': row.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': String(row.data.byteLength),
    },
  });
}
