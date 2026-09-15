import 'server-only';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Minimal in-memory rate limiter.
 *
 * Good enough to stop casual abuse of the public form endpoints on a single
 * instance. Swap the Map for Redis or Upstash when the site scales past one
 * server — the call signature is intentionally trivial to re-implement.
 */
export function rateLimit(key: string, limit = 6, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: limit - bucket.count };
}

export function clientKey(req: Request, scope: string) {
  const fwd = req.headers.get('x-forwarded-for') || '';
  const ip = fwd.split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';
  return scope + ':' + ip;
}
