/**
 * Simple in-memory rate limiter using a fixed window strategy.
 *
 * Note: in serverless environments (Vercel) each function instance has its own
 * memory, so limits are per-instance rather than globally shared. For a personal
 * tool this is sufficient — it still blocks bursts within the same instance and
 * makes large-scale abuse significantly harder.
 */

interface Entry {
  count: number;
  windowStart: number;
}

const store = new Map<string, Entry>();

// Purge entries older than 5 minutes to avoid unbounded memory growth
function cleanup(windowMs: number) {
  const cutoff = Date.now() - windowMs * 5;
  store.forEach((entry, key) => {
    if (entry.windowStart < cutoff) store.delete(key);
  });
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets (only set when blocked) */
  retryAfter: number;
}

/**
 * @param key      Unique identifier — typically the client IP + route
 * @param limit    Max requests allowed per window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  cleanup(windowMs);

  const now = Date.now();
  const entry = store.get(key);

  // Start a fresh window
  if (!entry || now - entry.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  // Window is active and limit exceeded
  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, retryAfter: 0 };
}

/** Extracts the real client IP from a Next.js request */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
