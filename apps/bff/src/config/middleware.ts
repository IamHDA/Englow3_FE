import cors, { type CorsOptions } from "cors";
import rateLimit from "express-rate-limit";

import { env } from "./env.js";

/**
 * Shared between the long-running server and the serverless entry point, so the
 * two cannot drift into having different security postures - which is exactly
 * what happened when each called `cors()` for itself.
 */
let warnedAboutOpenCors = false;

export function corsMiddleware() {
  if (
    env.production &&
    env.allowedOrigins.length === 0 &&
    !warnedAboutOpenCors
  ) {
    warnedAboutOpenCors = true;
    // Not fatal, so a deployment missing the variable keeps serving; loud, so
    // it does not stay missing. Set CORS_ALLOWED_ORIGINS to the web origin.
    console.warn(
      "[security] CORS_ALLOWED_ORIGINS is not set: any website may call this API.",
    );
  }
  const options: CorsOptions =
    env.allowedOrigins.length === 0
      ? {}
      : { origin: env.allowedOrigins, methods: ["GET", "POST", "OPTIONS"] };

  return cors(options);
}

/**
 * A ceiling on how fast one address can call - best-effort anti-abuse, not a
 * quota. Keyed on IP, which is the only thing available before a request is
 * parsed. That makes it a blunt instrument - a university behind one NAT looks
 * like one caller - which is why the limit is set well above what a person
 * browsing could reach.
 *
 * Its store (`express-rate-limit`'s default, in memory) is per process, and
 * this app runs as a Vercel function (`apps/bff/api/index.ts`), not one
 * long-lived server: concurrent instances each keep their own counter, and a
 * cold start resets it to zero. Phase 12 reviewed this on purpose - it is not
 * a global/shared quota across the deployment, and nothing here should be
 * relied on as one.
 *
 * That is fine for what this guards against (scripted abuse from one
 * address), which is why it stays as-is rather than gaining a shared store.
 * Anything that actually needs a global ceiling - AI/account usage quotas
 * included - is enforced on the backend, where the token has been verified
 * and the user, not just an IP, is known.
 *
 * ponytail: instance-local memory store, move to a shared store (e.g. Redis)
 * or platform-level protection if IP-based abuse ever needs a true global
 * limit instead of an outer, best-effort one.
 */
export function rateLimitMiddleware() {
  return rateLimit({
    windowMs: env.rateLimitWindowMs,
    limit: env.rateLimitMax,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      errors: [
        {
          message: "Too many requests, slow down and try again shortly",
          extensions: { code: "RATE_LIMITED" },
        },
      ],
    },
  });
}
