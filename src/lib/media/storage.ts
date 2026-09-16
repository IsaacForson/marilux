import 'server-only';
import sharp from 'sharp';
import { db, dbConfigured } from '@/lib/store/db';

/**
 * Media library.
 *
 * Uploads are normalised before they are stored: a 4 MB phone photograph
 * becomes a ~150 KB WebP at a sensible dimension. That matters more than it
 * sounds — the studio will upload straight from a phone, and unprocessed
 * images would be the single biggest thing slowing the site down.
 *
 * Two backends, chosen by configuration:
 *   * Supabase Storage — used when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *     are set. Served from Supabase's CDN.
 *   * Postgres — the fallback. Bytes live in a bytea column and are served by
 *     /api/media/[id] with immutable caching. Works with nothing but
 *     DATABASE_URL, which is why it is the default.
 */

export type MediaRecord = {
  id: string;
  filename: string;
  mime: string;
  bytes: number;
  width: number | null;
  height: number | null;
  url: string;
  alt: string;
  folder: string;
  provider: 'postgres' | 'supabase';
  createdAt: string;
};

type Row = {
  id: string;
  filename: string;
  mime: string;
  bytes: number;
  width: number | null;
  height: number | null;
  url: string;
  alt: string;
  folder: string;
  provider: 'postgres' | 'supabase';
  created_at: Date;
};

const toRecord = (r: Row): MediaRecord => ({
  id: r.id,
  filename: r.filename,
  mime: r.mime,
  bytes: r.bytes,
  width: r.width,
  height: r.height,
  url: r.url,
  alt: r.alt,
  folder: r.folder,
  provider: r.provider,
  createdAt: new Date(r.created_at).toISOString(),
});

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic'];

/** Longest edge after processing. Enough for a full-bleed hero on a 2× screen. */
const MAX_EDGE = 2000;

/**
 * The server-side Storage key.
 *
 * Supabase renamed these: `service_role` is now the "secret" key, and `anon`
 * is the "publishable" key. Both names are accepted so an older or newer
 * project works without edits.
 *
 * A publishable key is deliberately NOT usable here — it is RLS-bound, and the
 * bucket grants public read only. Uploads must carry the secret key, which is
 * why this module is server-only.
 */
export function storageSecret() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

/** True when a publishable key was supplied where a secret one is needed. */
export function storageKeyLooksPublishable() {
  return storageSecret().startsWith('sb_publishable_');
}

/**
 * Whether uploads should go to Supabase Storage.
 *
 * A publishable key is treated as "not configured" rather than as a valid
 * credential. Pasting the wrong key is an easy mistake, and degrading to the
 * Postgres backend keeps uploads working while the dashboard's storage test
 * explains exactly what to change — far better than every upload failing.
 */
export function supabaseStorageConfigured() {
  return Boolean(process.env.SUPABASE_URL && storageSecret() && !storageKeyLooksPublishable());
}

export const storageBackend = () => (supabaseStorageConfigured() ? 'supabase' : 'postgres');

export type UploadResult =
  | { ok: true; media: MediaRecord }
  | { ok: false; error: string };

export async function uploadMedia({
  file,
  alt,
  folder = 'general',
}: {
  file: File;
  alt?: string;
  folder?: string;
}): Promise<UploadResult> {
  if (!dbConfigured()) {
    return { ok: false, error: 'A database is required to store images.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error:
        'That image is ' +
        Math.round(file.size / 1024 / 1024) +
        ' MB. The limit is ' +
        MAX_UPLOAD_BYTES / 1024 / 1024 +
        ' MB.',
    };
  }

  const input = Buffer.from(await file.arrayBuffer());

  let processed: Buffer;
  let width: number | null = null;
  let height: number | null = null;

  try {
    const pipeline = sharp(input, { failOn: 'none' })
      // Phone photographs carry orientation in EXIF; without this they upload
      // sideways.
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 });

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    processed = data;
    width = info.width;
    height = info.height;
  } catch {
    return { ok: false, error: 'That file could not be read as an image.' };
  }

  const base = (file.name || 'image')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .toLowerCase();
  const filename = (base || 'image') + '-' + Date.now().toString(36) + '.webp';

  const sql = db();

  if (supabaseStorageConfigured()) {
    const path = folder + '/' + filename;
    const uploaded = await putToSupabase(path, processed);
    if (!uploaded.ok) return { ok: false, error: uploaded.error };

    const rows = await sql<Row[]>`
      insert into public.media
        (filename, mime, bytes, width, height, storage_path, provider, url, alt, folder)
      values
        (${filename}, 'image/webp', ${processed.byteLength}, ${width}, ${height},
         ${path}, 'supabase', ${uploaded.url}, ${alt ?? ''}, ${folder})
      returning ${sql.unsafe(RETURNING)}`;
    return { ok: true, media: toRecord(rows[0]) };
  }

  // Postgres backend. The row is inserted first so the id can form the URL.
  const rows = await sql<Row[]>`
    insert into public.media
      (filename, mime, bytes, width, height, data, provider, url, alt, folder)
    values
      (${filename}, 'image/webp', ${processed.byteLength}, ${width}, ${height},
       ${processed}, 'postgres', '', ${alt ?? ''}, ${folder})
    returning ${sql.unsafe(RETURNING)}`;

  const id = rows[0].id;
  const url = '/api/media/' + id;
  await sql`update public.media set url = ${url} where id = ${id}`;

  return { ok: true, media: toRecord({ ...rows[0], url }) };
}

const RETURNING =
  'id, filename, mime, bytes, width, height, url, alt, folder, provider, created_at';

async function putToSupabase(
  path: string,
  body: Buffer,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const bucket = process.env.SUPABASE_BUCKET || 'marilux';
  const base = (process.env.SUPABASE_URL as string).replace(/\/$/, '');

  try {
    const res = await fetch(base + '/storage/v1/object/' + bucket + '/' + path, {
      method: 'POST',
      headers: {
        apikey: storageSecret(),
        Authorization: 'Bearer ' + storageSecret(),
        'Content-Type': 'image/webp',
        'x-upsert': 'true',
        // Supabase defaults uploaded objects to `no-cache`, which sends every
        // request back to the origin and throws away most of the CDN. The
        // bytes behind a given filename never change, so cache them for a year.
        'cache-control': 'public, max-age=31536000, immutable',
      },
      body: new Uint8Array(body),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      const hint = /row-level security|Unauthorized/i.test(detail)
        ? ' — this looks like a publishable key. Storage uploads need the secret ' +
          '(service_role) key from Project Settings → API Keys.'
        : '';
      return {
        ok: false,
        error: 'Supabase Storage: ' + (detail.slice(0, 160) || res.status) + hint,
      };
    }

    return { ok: true, url: base + '/storage/v1/object/public/' + bucket + '/' + path };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function listMedia(folder?: string): Promise<MediaRecord[]> {
  if (!dbConfigured()) return [];
  try {
    const sql = db();
    const rows = folder
      ? await sql<Row[]>`select ${sql.unsafe(RETURNING)} from public.media
                         where folder = ${folder} order by created_at desc limit 300`
      : await sql<Row[]>`select ${sql.unsafe(RETURNING)} from public.media
                         order by created_at desc limit 300`;
    return rows.map(toRecord);
  } catch (error) {
    console.error('[media] list failed:', error);
    return [];
  }
}

/** Raw bytes, for the Postgres-backed serving route. */
export async function readMediaBytes(id: string) {
  if (!dbConfigured()) return null;
  const sql = db();
  const rows = await sql<Array<{ data: Buffer | null; mime: string; url: string }>>`
    select data, mime, url from public.media where id = ${id}`;
  return rows[0] ?? null;
}

export async function deleteMedia(id: string) {
  const sql = db();
  const rows = await sql<Array<{ storage_path: string | null; provider: string }>>`
    delete from public.media where id = ${id}
    returning storage_path, provider`;

  const row = rows[0];
  if (row?.provider === 'supabase' && row.storage_path && supabaseStorageConfigured()) {
    const bucket = process.env.SUPABASE_BUCKET || 'marilux';
    const base = (process.env.SUPABASE_URL as string).replace(/\/$/, '');
    // Best effort: the database row is already gone, and an orphaned object is
    // better than a broken delete.
    await fetch(base + '/storage/v1/object/' + bucket + '/' + row.storage_path, {
      method: 'DELETE',
      headers: { apikey: storageSecret(), Authorization: 'Bearer ' + storageSecret() },
    }).catch(() => undefined);
  }
}

export async function updateMediaAlt(id: string, alt: string) {
  const sql = db();
  await sql`update public.media set alt = ${alt} where id = ${id}`;
}
