/**
 * In-memory per-IP rate limiter. Suitable for single-instance or low-traffic.
 * For serverless with multiple instances, use a shared store (e.g. Vercel KV, Upstash).
 */

const windowMs = 60 * 1000; // 1 minute
const limits = {
  submit: 10,
  export: 5,
} as const;

type Key = keyof typeof limits;

const store = new Map<string, { count: number; resetAt: number }>();

function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function getKey(clientId: string, key: Key): string {
  return `${key}:${clientId}`;
}

export function checkRateLimit(request: Request, key: Key): { ok: true } | { ok: false; status: 429 } {
  const clientId = getClientId(request);
  const k = getKey(clientId, key);
  const now = Date.now();
  const entry = store.get(k);

  if (!entry) {
    store.set(k, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (now >= entry.resetAt) {
    store.set(k, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (entry.count >= limits[key]) {
    return { ok: false, status: 429 };
  }

  entry.count += 1;
  return { ok: true };
}
