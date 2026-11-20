import { stringFromBase64URL } from "@supabase/ssr";

/**
 * Remembers which sign-in this browser just ended, so it cannot come back.
 *
 * Signing out deletes the auth cookies, but a request that was already in
 * flight can still put them back. Every call to /api/bff refreshes an expired
 * token and writes the renewed cookies on its response - and that response
 * leaves only when the backend answers, which on a cold start is long after
 * the sign-out finished. The browser applies Set-Cookie in arrival order, so
 * the session it just deleted is written back, and the next page renders the
 * old account in the header again.
 *
 * Nothing on the server can stop a late response from reaching the browser,
 * so the check happens on the next read instead: a session whose id matches
 * the one recorded here is the one that was ended, and is treated as absent.
 * A new sign-in gets a new session id, so it is never mistaken for it.
 */
export const REVOKED_SESSION_COOKIE = "englow-revoked-session";

/**
 * Long enough to outlive any access token of the ended session. After that
 * the token has expired, and refreshing it fails because Supabase already
 * deleted the session - the leftover cookie stops working by itself.
 */
export const REVOKED_SESSION_MAX_AGE = 24 * 60 * 60;

type Cookie = { name: string; value: string };

const AUTH_COOKIE = /^sb-.+-auth-token(?:\.(\d+))?$/;
const BASE64_PREFIX = "base64-";

/** The auth cookies, chunks included (`sb-<ref>-auth-token`, `.0`, `.1`...). */
function authCookies(cookies: Cookie[]): Cookie[] {
  return cookies.filter((cookie) => AUTH_COOKIE.test(cookie.name));
}

/** The session the SDK would read, put back together from its chunks. */
function rawSession(cookies: Cookie[]): string | null {
  const auth = authCookies(cookies);
  const whole = auth.find((cookie) => !cookie.name.match(AUTH_COOKIE)?.[1]);
  if (whole) return whole.value;

  const chunks = auth
    .map((cookie) => ({
      index: Number(cookie.name.match(AUTH_COOKIE)?.[1]),
      value: cookie.value,
    }))
    .sort((a, b) => a.index - b.index);
  return chunks.length ? chunks.map((chunk) => chunk.value).join("") : null;
}

/**
 * The id of the sign-in the auth cookies belong to - the `session_id` claim of
 * their access token - or null when there is no session or it cannot be read.
 * Read without verifying: it only ever decides to treat a session as absent.
 */
export function sessionIdOf(cookies: Cookie[]): string | null {
  const raw = rawSession(cookies);
  if (!raw) return null;

  try {
    const json = raw.startsWith(BASE64_PREFIX)
      ? stringFromBase64URL(raw.slice(BASE64_PREFIX.length))
      : raw;
    const token: unknown = JSON.parse(json)?.access_token;
    if (typeof token !== "string") return null;
    const claims: unknown = JSON.parse(
      stringFromBase64URL(token.split(".")[1]),
    );
    const id = (claims as { session_id?: unknown } | null)?.session_id;
    return typeof id === "string" && id !== "" ? id : null;
  } catch {
    return null;
  }
}

/**
 * The auth cookies to drop because they carry the session this browser signed
 * out of; empty when there is nothing to drop.
 */
export function revokedAuthCookieNames(cookies: Cookie[]): string[] {
  const revoked = cookies.find(
    (cookie) => cookie.name === REVOKED_SESSION_COOKIE,
  )?.value;
  if (!revoked || sessionIdOf(cookies) !== revoked) return [];
  return authCookies(cookies).map((cookie) => cookie.name);
}
