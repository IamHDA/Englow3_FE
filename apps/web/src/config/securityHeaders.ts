/**
 * Response headers sent on every page.
 *
 * Kept out of next.config.ts so the reasoning has somewhere to live and so the
 * list can be asserted in a test rather than eyeballed.
 */

/**
 * What the browser may load, and from where.
 *
 * Built per request, because `script-src` carries a nonce: a random value that
 * proxy.ts generates for each response and that Next.js stamps on the inline
 * scripts it writes (hydration data and the like). A script an attacker
 * manages to inject into the page does not know it, so the browser refuses to
 * run it - which `'unsafe-inline'`, the setting this replaces, could not do.
 * `'strict-dynamic'` lets those trusted scripts load the chunks they need
 * without listing hosts; `'self'` stays as the fallback for a browser too old
 * to understand it.
 *
 * `style-src` still carries 'unsafe-inline', stated plainly: Mantine sets
 * `style` attributes on its components at runtime, and a nonce does not cover
 * an attribute. Style injection is far less dangerous than script injection -
 * it cannot run code - and `connect-src` below limits what injected CSS could
 * send out through other channels.
 *
 * `connect-src`, `img-src` and `media-src` allow any https origin. The browser
 * no longer calls Supabase or the BFF (it talks to this origin only), but the
 * recording and audio uploads go straight to object storage on a presigned
 * address that differs per environment, and a list built from environment
 * variables would be a list that is wrong in whichever environment nobody
 * checked. These directives limit exfiltration rather than execution, so the
 * looser setting costs less than a broken page.
 *
 * Local development is the one place those services are plain http - object
 * storage on :9000 - and "https:" alone blocked every request the app made.
 * `next dev` also needs eval for React's debugging. Both are added for
 * development only; a production build gets exactly the policy above.
 */
export function contentSecurityPolicy({
  nonce,
  development,
}: {
  nonce: string;
  development: boolean;
}): string {
  const local = development ? " http://localhost:* ws://localhost:*" : "";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
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

/** A fresh, unguessable value for one response's script nonce. */
export function createNonce(): string {
  return btoa(crypto.randomUUID());
}

/**
 * Everything except the Content-Security-Policy, which proxy.ts sets per
 * request because it carries a nonce. A static copy here as well would make the
 * browser enforce both, and the stricter of two policies wins.
 */
export const SECURITY_HEADERS = [
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
