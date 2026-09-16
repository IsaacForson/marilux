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
}

export function dbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  if (!globalThis.__mariluxSql) {
    globalThis.__mariluxSql = postgres(url, {
      ssl: 'require',
      // Supabase's transaction pooler (port 6543) multiplexes connections and
      // cannot hold prepared statements across them.
      prepare: false,
      max: Number(process.env.DATABASE_POOL_MAX || 5),
      idle_timeout: 20,
      connect_timeout: 15,
      // Dates come back as strings; we format them explicitly in each query so
      // a timezone conversion can never shift an appointment by an hour.
      transform: { undefined: null },
    });
  }

  return globalThis.__mariluxSql;
}
