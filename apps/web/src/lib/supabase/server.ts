import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

import { hardenedCookieOptions, isHttps, SESSION_ONLY_COOKIE } from "./cookies";
import {
  REVOKED_SESSION_COOKIE,
  REVOKED_SESSION_MAX_AGE,
  revokedAuthCookieNames,
  sessionIdOf,
} from "./revokedSession";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy apps/web/.env.local.example to apps/web/.env.local and fill in your Supabase project values.",
  );
}

type Options = {
  /**
   * Decided by the caller when the cookie that records it is being written in
   * this same request (the sign-in route); otherwise read from that cookie.
   */
  sessionOnly?: boolean;
};

/**
 * Supabase client for Route Handlers and Server Components. Reads and writes
 * the session cookie via `next/headers`, so it must be created per request.
 * The browser never sees the session: it is written HttpOnly (see cookies.ts).
 */
export async function createSupabaseServerClient({
  sessionOnly,
}: Options = {}) {
  const cookieStore = await cookies();
  const secure = isHttps(await headers());
  const endsWithBrowser =
    sessionOnly ?? cookieStore.get(SESSION_ONLY_COOKIE)?.value === "1";

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll: () => {
        const all = cookieStore.getAll();
        // A session this browser signed out of, written back by a request
        // that was still in flight (see revokedSession.ts): read it as absent.
        const revoked = revokedAuthCookieNames(all);
        if (revoked.length === 0) return all;
        try {
          for (const name of revoked) {
            cookieStore.set(
              name,
              "",
              hardenedCookieOptions(
                { maxAge: 0 },
                { secure, sessionOnly: false },
              ),
            );
          }
        } catch {
          // A Server Component can't write cookies; proxy.ts clears them on the
          // next navigation, and until then they are ignored here anyway.
        }
        return all.filter((cookie) => !revoked.includes(cookie.name));
      },
      setAll: ((cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(
              name,
              value,
              hardenedCookieOptions(options, {
                secure,
                sessionOnly: endsWithBrowser,
              }),
            );
          }
        } catch {
          // Called from a Server Component, which can't set cookies - safe to
          // ignore since proxy.ts already refreshes the session cookie.
        }
      }) satisfies SetAllCookies,
    },
  });
}

/** Records (or forgets) whether the session should end with the browser. */
export async function rememberSessionPreference(sessionOnly: boolean) {
  const cookieStore = await cookies();
  if (!sessionOnly) {
    cookieStore.delete(SESSION_ONLY_COOKIE);
    return;
  }
  cookieStore.set(SESSION_ONLY_COOKIE, "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps(await headers()),
  });
}

/**
 * The id of the sign-in this request carries, read before signing out - once
 * signed out, the cookies that name it are gone.
 */
export async function currentSessionId(): Promise<string | null> {
  return sessionIdOf((await cookies()).getAll());
}

/**
 * Records the sign-in that just ended, so a late response that writes its
 * cookies back cannot sign this browser in again (see revokedSession.ts).
 * Written only after signing out: the server client reads this cookie too, and
 * would otherwise hide the very session it is asked to end.
 */
export async function rememberRevokedSession(sessionId: string | null) {
  if (!sessionId) return;
  const cookieStore = await cookies();
  cookieStore.set(REVOKED_SESSION_COOKIE, sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps(await headers()),
    maxAge: REVOKED_SESSION_MAX_AGE,
  });
}
