import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

import { hardenedCookieOptions, isHttps, SESSION_ONLY_COOKIE } from "./cookies";

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
      getAll: () => cookieStore.getAll(),
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
