import 'server-only';
import { cache } from 'react';
import { db, dbConfigured } from '@/lib/store/db';
import {
  SETTINGS_DEFAULTS,
  type SettingsKey,
  type SettingsShape,
} from './types';

/**
 * Settings storage.
 *
 * Reads are deduped per request with React `cache`, so a page that needs
 * notification settings in three components still issues one query.
 *
 * Stored values are merged *over* the defaults rather than replacing them, so
 * adding a new setting in a later release does not read as undefined for a
 * studio whose row predates it.
 */
export const getSetting = cache(async function getSetting<K extends SettingsKey>(
  key: K,
): Promise<SettingsShape[K]> {
  const fallback = SETTINGS_DEFAULTS[key];
  if (!dbConfigured()) return fallback;

  try {
    const sql = db();
    const read = sql<Array<{ value: unknown }>>`
      select value from public.settings where key = ${key}`;

    // Static generation must never stall on a settings read; defaults are a
    // perfectly good answer until the page revalidates.
    const timeoutMs = Number(process.env.CATALOGUE_TIMEOUT_MS || 8000);
    const rows = await Promise.race([
      read,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);

    if (!rows) {
      console.warn('[settings] "' + key + '" timed out — using defaults');
      return fallback;
    }
    if (!rows[0]) return fallback;
    return merge(fallback, rows[0].value) as SettingsShape[K];
  } catch (error) {
    // Never let a settings read take the site down — fall back to defaults.
    console.error('[settings] could not read "' + key + '":', error);
    return fallback;
  }
});

export async function setSetting<K extends SettingsKey>(
  key: K,
  value: Partial<SettingsShape[K]>,
): Promise<SettingsShape[K]> {
  if (!dbConfigured()) {
    throw new Error('A database is required to save settings. Set DATABASE_URL.');
  }

  const current = await getSetting(key);
  const next = merge(current, value) as SettingsShape[K];

  const sql = db();
  // `sql.json` sends this as a jsonb object. Passing JSON.stringify(...) with a
  // ::jsonb cast instead stores a jsonb *string scalar*, which then fails the
  // object check on read and silently falls back to defaults.
  await sql`
    insert into public.settings (key, value)
    values (${key}, ${sql.json(next as never)})
    on conflict (key) do update set value = excluded.value`;

  return next;
}

export async function resetSetting(key: SettingsKey) {
  if (!dbConfigured()) return;
  const sql = db();
  await sql`delete from public.settings where key = ${key}`;
}

/**
 * Shallow merge, one level deep into plain objects.
 *
 * Deep enough for the nested template groups, shallow enough that arrays
 * (owner emails, owner phones) are replaced wholesale rather than merged
 * index by index — which is what an editor expects when removing an entry.
 */
function merge<T>(base: T, incoming: unknown): T {
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return base;

  const result = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(incoming as Record<string, unknown>)) {
    if (v === undefined) continue;
    const existing = result[k];
    if (
      existing &&
      typeof existing === 'object' &&
      !Array.isArray(existing) &&
      v &&
      typeof v === 'object' &&
      !Array.isArray(v)
    ) {
      result[k] = { ...(existing as object), ...(v as object) };
    } else {
      result[k] = v;
    }
  }
  return result as T;
}
