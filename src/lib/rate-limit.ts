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
  /** True only when no safe rate-limit strategy is available */
  error?: boolean;
}

/**
 * @param key      Unique identifier — typically the client IP + route
 * @param limit    Max requests allowed per window
 * @param windowMs Window duration in milliseconds
 */
function rateLimitInMemory(
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

async function rateLimitWithUpstash(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!restUrl || !token) {
    // A shared Redis store is optional. On deployments without it, keep the
    // endpoint available with a best-effort per-instance limit.
    return rateLimitInMemory(key, limit, windowMs);
  }

  const response = await fetch(`${restUrl.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["PEXPIRE", key, windowMs, "NX"],
      ["PTTL", key],
    ]),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Rate limit backend unavailable");
  }

  const [incrementResult, , ttlResult] = (await response.json()) as Array<{
    result?: number;
  }>;
  const count = Number(incrementResult?.result ?? limit + 1);
  const ttl = Number(ttlResult?.result ?? windowMs);
  const retryAfter = Math.max(1, Math.ceil(ttl / 1000));

  if (count > limit) {
    return { allowed: false, remaining: 0, retryAfter };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - count),
    retryAfter: 0,
  };
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    return await rateLimitWithUpstash(key, limit, windowMs);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[rate-limit] unavailable:", error);
    }

    // Do not take the YouTube lookup offline when the optional shared limiter
    // has a transient failure. The local fallback still protects each instance.
    return rateLimitInMemory(key, limit, windowMs);
  }
}

/** Extracts the real client IP from a Next.js request */
export function getClientIp(request: Request): string {
  const ip = (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );

  return ip.replace(/[^a-fA-F0-9:.,\s-]/g, "").slice(0, 64) || "unknown";
}
