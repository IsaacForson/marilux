import 'server-only';
import postgres from 'postgres';

/**
 * Shared Postgres connection.
 *
 * Cached on globalThis because Next.js re-evaluates modules on every hot
 * reload in development — without this, each edit would leak a pool and the
 * Supabase pooler would start refusing connections.
 */
declare global {
  var __mariluxSql: ReturnType<typeof postgres> | undefined;
  var __mariluxSqlVersion: string | undefined;
}

export function dbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Next runs static generation across several worker processes, each opening
 * its own pool. Against Supabase's **transaction** pooler (6543) those
 * connections queue and never resolve — a build read hangs indefinitely rather
 * than erroring, so pages silently prerender with shipped defaults.
 *
 * The **session** pooler (5432) handles it fine, so builds use that and a
 * single connection. At runtime the transaction pooler is correct and is what
 * serverless needs, so only the build is redirected.
 */
function connectionUrl() {
  const url = process.env.DATABASE_URL as string;
  return isBuild() ? url.replace(':6543/', ':5432/') : url;
}

const isBuild = () => process.env.NEXT_PHASE === 'phase-production-build';

/** Bump when the postgres client options or package version change, so HMR replaces the pool. */
const POOL_VERSION = '3.4.9';

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  if (!globalThis.__mariluxSql || globalThis.__mariluxSqlVersion !== POOL_VERSION) {
    if (globalThis.__mariluxSql) {
      void globalThis.__mariluxSql.end({ timeout: 0 });
    }
    globalThis.__mariluxSqlVersion = POOL_VERSION;
    globalThis.__mariluxSql = postgres(connectionUrl(), {
      ssl: 'require',
      // Supabase's transaction pooler (port 6543) multiplexes connections and
      // cannot hold prepared statements across them.
      prepare: false,
      max: isBuild() ? 1 : Number(process.env.DATABASE_POOL_MAX || 5),
      idle_timeout: 20,
      connect_timeout: 15,
      // Dates come back as strings; we format them explicitly in each query so
      // a timezone conversion can never shift an appointment by an hour.
      transform: { undefined: null },
    });
  }

  return globalThis.__mariluxSql;
}

function timeoutMs() {
  const ms = Number(process.env.CATALOGUE_TIMEOUT_MS || 8000);
  return Number.isFinite(ms) && ms > 0 ? ms : 8000;
}

function describeError(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Run a database read without stalling the request.
 *
 * Rejections are captured on the query itself, so a timeout cannot leave an
 * unhandled Postgres error for Next.js to paint as a red overlay. Callers
 * treat `null` as "use the fallback".
 */
type Cancellable<T> = Promise<T> & { cancel?: () => void };

export async function queryOrNull<T>(
  label: string,
  run: () => Promise<T>,
): Promise<T | null> {
  const ms = timeoutMs();
  let query: Cancellable<T> | undefined;

  const captured = Promise.resolve()
    .then(() => {
      query = run() as Cancellable<T>;
      return query;
    })
    .then(
      (value) => ({ status: 'ok' as const, value }),
      (error: unknown) => ({ status: 'error' as const, error }),
    );

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<{ status: 'timeout' }>((resolve) => {
    timer = setTimeout(() => resolve({ status: 'timeout' }), ms);
  });

  try {
    const result = await Promise.race([captured, timedOut]);
    if (result.status === 'timeout') {
      try {
        query?.cancel?.();
      } catch {
        /* best-effort: the connection is returned to the pool either way */
      }
      console.warn('[' + label + '] timed out after ' + ms + 'ms');
      return null;
    }
    if (result.status === 'error') {
      console.warn('[' + label + '] ' + describeError(result.error));
      return null;
    }
    return result.value;
  } catch (error) {
    console.warn('[' + label + '] ' + describeError(error));
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
