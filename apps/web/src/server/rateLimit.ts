/**
 * A fixed-window ceiling per caller, kept in memory.
 *
 * Best effort and deliberately simple, like the BFF's own limiter: each server
 * instance counts for itself and a cold start resets it. It exists because the
 * BFF now sees only this app's servers, not the people behind them, so the
 * per-person ceiling has to be applied here, where the real address is known.
 */
export function createRateLimiter({
  windowMs,
  max,
}: {
  windowMs: number;
  max: number;
}) {
  const windows = new Map<string, { resetAt: number; count: number }>();

  return function allow(key: string, now = Date.now()): boolean {
    // Keeps the map from growing with every address ever seen.
    if (windows.size > 5000) {
      for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
    }
    const current = windows.get(key);
    if (!current || current.resetAt <= now) {
      windows.set(key, { resetAt: now + windowMs, count: 1 });
      return true;
    }
    current.count += 1;
    return current.count <= max;
  };
}

/**
 * The caller's address. On Vercel `x-vercel-forwarded-for` is set by the
 * platform and cannot be supplied by the caller; elsewhere the first hop of
 * `x-forwarded-for` is the best that is available.
 */
export function clientKey(request: Request): string {
  return (
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "local"
  );
}

export function tooManyRequests(): Response {
  return Response.json(
    { code: "TOO_MANY_REQUESTS" },
    { status: 429, headers: { "retry-after": "60" } },
  );
}
