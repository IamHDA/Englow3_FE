/**
 * Response headers sent on every page.
 *
 * Kept out of next.config.ts so the reasoning has somewhere to live and so the
 * list can be asserted in a test rather than eyeballed.
 */

/**
 * What the browser may load, and from where.
 *
 * `script-src` carries 'unsafe-inline' and that is the weak point, stated
 * plainly: Next.js App Router injects inline scripts to hand hydration data to
 * the client, and without a per-request nonce they are indistinguishable from
 * an injected one. Removing it means generating a nonce in middleware and
 * threading it through every render - worth doing, and not something to change
 * without being able to click through the result.
 *
 * What it still buys with 'unsafe-inline' in place: a script injected into the
 * page cannot pull a payload from another origin, the page cannot be framed,
 * and <object>/<embed> are gone. That covers the common shape of a script
 * injection even though it does not cover all of them.
 *
 * `connect-src`, `img-src` and `media-src` allow any https origin. They point
 * at Supabase, the BFF and object storage, all of which differ per
 * environment, and a list built from environment variables would be a list
 * that is wrong in whichever environment nobody checked. These directives
 * limit exfiltration rather than execution, so the looser setting costs less
 * than a broken page.
 *
 * Local development is the one place those services are plain http - the BFF
 * on :4000, object storage on :9000 - and "https:" alone blocked every request
 * the app made, so no screen could load data locally. `next dev` also needs
 * eval for React's debugging. Both are added for development only; a
 * production build gets exactly the policy above.
 */
export function contentSecurityPolicy(development: boolean): string {
  const local = development ? " http://localhost:* ws://localhost:*" : "";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}`,
    // Mantine writes styles into the document at runtime.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https:${local}`,
    // blob: is the recording the learner just made, played back before upload.
    `media-src 'self' blob: https:${local}`,
    "font-src 'self' data:",
    `connect-src 'self' https: wss:${local}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // The modern replacement for X-Frame-Options; both are sent because older
    // browsers honour only the latter.
    "frame-ancestors 'none'",
    // Would rewrite the local http services to https, which they do not serve.
    ...(development ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export const SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy(process.env.NODE_ENV === "development"),
  },

  /**
   * Nothing here is meant to be framed, and clickjacking a page that can start
   * an exam or approve content is worth ruling out.
   */
  { key: "X-Frame-Options", value: "DENY" },

  /** Stops a response being executed as a type it did not declare. */
  { key: "X-Content-Type-Options", value: "nosniff" },

  /**
   * Full URL to our own origin, only the origin to anyone else. Exam and
   * attempt ids live in paths, and they should not travel in a Referer header
   * to whatever a learner clicks next.
   */
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  /**
   * The microphone is allowed because speaking practice needs it. Everything
   * else a page could ask for is switched off - not because anything asks
   * today, but because a dependency that starts asking should fail rather than
   * succeed quietly.
   */
  {
    key: "Permissions-Policy",
    value: "microphone=(self), camera=(), geolocation=(), payment=()",
  },

  /**
   * Code cannot force a deployment to serve HTTPS; this tells a browser that
   * has seen HTTPS once never to try HTTP again. Ignored entirely when served
   * over HTTP, so it is safe to send everywhere including locally.
   *
   * No `preload`: that is a one-way submission to a browser-vendor list and
   * belongs to whoever owns the domain, not to this file.
   */
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];
