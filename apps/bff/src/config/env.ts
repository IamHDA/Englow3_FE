/**
 * Origins allowed to call this BFF.
 *
 * Exported and pure so it can be checked without touching process.env or
 * fighting the module cache - the parsing is the part with rules in it, and
 * reading one variable is not.
 *
 * An empty list means "any", which is what `cors()` with no options did before
 * and is still right for local work: a developer running the web app on an
 * unpredictable port should not have to configure anything. A deployment must
 * set CORS_ALLOWED_ORIGINS. Every request here is authenticated by a Bearer
 * header rather than a cookie, so a permissive policy cannot be ridden by
 * another site - but it does let anyone point their own frontend at this API,
 * and there is no reason to allow that.
 */
export function parseAllowedOrigins(configured: string | undefined): string[] {
  if (!configured) return [];

  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin !== "");
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:8080",
  // Covers starting the backend call, not finishing async backend work.
  backendTimeoutMs: Number(process.env.BACKEND_TIMEOUT_MS ?? 10000),
  allowedOrigins: parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS),

  /**
   * Requests one IP may make per window.
   *
   * Generous on purpose: this is a ceiling on scripted abuse, not a quality of
   * service control, and every real screen makes several calls to draw one
   * page. The speaking practice screen alone polls while an assessment runs.
   */
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 300),
};
