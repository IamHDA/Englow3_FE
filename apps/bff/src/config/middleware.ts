import cors, { type CorsOptions } from "cors";
import rateLimit from "express-rate-limit";

import { env } from "./env.js";

/**
 * Shared between the long-running server and the serverless entry point, so the
 * two cannot drift into having different security postures - which is exactly
 * what happened when each called `cors()` for itself.
 */
export function corsMiddleware() {
  const options: CorsOptions =
    env.allowedOrigins.length === 0
      ? {}
      : { origin: env.allowedOrigins, methods: ["GET", "POST", "OPTIONS"] };

  return cors(options);
}

/**
 * A ceiling on how fast one address can call.
 *
 * <p>Keyed on IP, which is the only thing available before a request is
 * parsed. That makes it a blunt instrument - a university behind one NAT looks
 * like one caller - which is why the limit is set well above what a person
 * browsing could reach. The limits that matter per account live on the backend,
 * where the token has been verified and the user is known.
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
