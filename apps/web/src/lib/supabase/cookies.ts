import type { CookieOptions } from "@supabase/ssr";

/**
 * Set when someone signs in without "remember me": the auth cookies are then
 * written without an expiry and end with the browser session. Kept in a cookie
 * of its own because the token refresh that rewrites the auth cookies happens
 * later, on requests that no longer know what the sign-in form said.
 */
export const SESSION_ONLY_COOKIE = "englow-session-only";

type Context = {
  /** The request arrived over HTTPS (directly or through a proxy). */
  secure: boolean;
  /** Drop the expiry so the cookie ends with the browser session. */
  sessionOnly: boolean;
};

/**
 * What every auth cookie is written with.
 *
 * `@supabase/ssr` defaults to `httpOnly: false` because its browser client has
 * to read the session from JavaScript. This app has no browser client any
 * more - the server holds the session - so nothing running in the page needs
 * the token, and a script that gets injected cannot read what it cannot see.
 *
 * `Secure` follows the request rather than the build: a production build run
 * on http://localhost would otherwise write cookies the browser refuses to
 * keep, logging every developer straight out.
 */
export function hardenedCookieOptions(
  options: CookieOptions | undefined,
  { secure, sessionOnly }: Context,
): CookieOptions {
  const hardened: CookieOptions = {
    ...options,
    path: options?.path ?? "/",
    httpOnly: true,
    sameSite: "lax",
    secure,
  };
  // A cookie being deleted (maxAge 0) must keep its expiry or it would linger.
  if (sessionOnly && (options?.maxAge === undefined || options.maxAge > 0)) {
    delete hardened.maxAge;
    delete hardened.expires;
  }
  return hardened;
}

export function isHttps(headers: Headers, protocol?: string): boolean {
  return (
    headers.get("x-forwarded-proto")?.split(",")[0].trim() === "https" ||
    protocol === "https:"
  );
}
