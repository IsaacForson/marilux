/**
 * Cross-request read cache.
 *
 * React `cache()` only lasts for a single RSC render. Every client navigation
 * is a new request, so without this the public site re-hits Postgres on every
 * click — and against a cold pool that wait is several seconds.
 *
 * In-flight promises are shared across concurrent prefetches so seven nav
 * links do not open seven identical queries.
 */

type Entry = { value: unknown; until: number };

declare global {
  var __mariluxReadCache: Map<string, Entry> | undefined;
  var __mariluxReadInflight: Map<string, Promise<unknown>> | undefined;
}

export const READ_KEYS = {
  settings: 'settings',
  catalogue: 'catalogue',
  gallery: 'gallery',
  promotionsAuto: 'promotions:auto',
} as const;

function store() {
  if (!globalThis.__mariluxReadCache) globalThis.__mariluxReadCache = new Map();
  return globalThis.__mariluxReadCache;
}

function inflight() {
  if (!globalThis.__mariluxReadInflight) globalThis.__mariluxReadInflight = new Map();
  return globalThis.__mariluxReadInflight;
}

export async function readThrough<T>(
  key: string,
  fallback: T,
  load: () => Promise<T | null>,
  { freshMs = 45_000, missMs = 4_000 }: { freshMs?: number; missMs?: number } = {},
): Promise<T> {
  const now = Date.now();
  const hit = store().get(key);
  if (hit && hit.until > now) return hit.value as T;

  const pending = inflight().get(key);
  if (pending) return pending as Promise<T>;

  const promise = (async () => {
    try {
      const loaded = await load();
      const value = loaded ?? fallback;
      store().set(key, {
        value,
        until: Date.now() + (loaded == null ? missMs : freshMs),
      });
      return value;
    } catch {
      store().set(key, { value: fallback, until: Date.now() + missMs });
      return fallback;
    } finally {
      inflight().delete(key);
    }
  })();

  inflight().set(key, promise);
  return promise;
}

export function invalidateRead(...keys: string[]) {
  const map = store();
  if (keys.length === 0) {
    map.clear();
    return;
  }
  for (const key of keys) map.delete(key);
}
