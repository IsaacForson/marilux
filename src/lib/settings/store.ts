import 'server-only';
import { cache } from 'react';
import { db, dbConfigured, queryOrNull } from '@/lib/store/db';
import {
  SETTINGS_DEFAULTS,
  type SettingsKey,
  type SettingsShape,
} from './types';

/**
 * Settings storage.
 *
 * All groups are read in one query and cached per request, so a page that
 * asks for notifications, booking and the banner still hits the database once.
 *
 * Stored values are merged *over* the defaults rather than replacing them, so
 * adding a new setting in a later release does not read as undefined for a
 * studio whose row predates it.
 */
export const getAllSettings = cache(async function getAllSettings(): Promise<SettingsShape> {
  const fallback = structuredClone(SETTINGS_DEFAULTS);
  if (!dbConfigured()) return fallback;

  const sql = db();
  const rows = await queryOrNull(
    'settings',
    () => sql<Array<{ key: SettingsKey; value: unknown }>>`
      select key, value from public.settings`,
  );

  if (!rows) return fallback;

  const next = { ...fallback };
  for (const row of rows) {
    if (row.key in SETTINGS_DEFAULTS) {
      next[row.key] = merge(fallback[row.key], row.value) as never;
    }
  }
  return next;
});

export const getSetting = cache(async function getSetting<K extends SettingsKey>(
  key: K,
): Promise<SettingsShape[K]> {
  const all = await getAllSettings();
  return all[key];
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
