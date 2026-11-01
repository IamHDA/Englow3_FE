import { timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

import cors, { type CorsOptions } from "cors";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import { env } from "./env.js";

/** Sent by the web app's server; the names are repeated in apps/web/src/server/bff.ts. */
export const PROXY_SECRET_HEADER = "x-englow-proxy-secret";
export const CLIENT_IP_HEADER = "x-englow-client-ip";

function sameSecret(presented: string | undefined, configured: string) {
  if (presented === undefined) return false;
  const a = Buffer.from(presented);
  const b = Buffer.from(configured);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Whose allowance a request is counted against. The browser reaches this app
 * through the web app's server, so the address a request connects from is
 * that server's, shared by everyone it serves at once. The web server names
 * the person's own address instead, and that is believed only alongside the
 * shared secret - anyone else could write the header too.
 */
export function callerAddress(
  configuredSecret: string | undefined,
  presentedSecret: string | undefined,
  forwardedIp: string | undefined,
  connectionIp: string | undefined,
): string {
  const trusted =
    configuredSecret !== undefined &&
    forwardedIp !== undefined &&
    isIP(forwardedIp) !== 0 &&
    sameSecret(presentedSecret, configuredSecret);
  return (trusted ? forwardedIp : connectionIp) ?? "unknown";
}

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
    keyGenerator: (req) =>
      ipKeyGenerator(
        callerAddress(
          env.proxySecret,
          req.get(PROXY_SECRET_HEADER),
          req.get(CLIENT_IP_HEADER),
          req.ip,
        ),
      ),
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
