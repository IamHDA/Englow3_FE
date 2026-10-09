import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { contentSecurityPolicy, createNonce } from "@/config/securityHeaders";
import {
  hardenedCookieOptions,
  isHttps,
  SESSION_ONLY_COOKIE,
} from "@/lib/supabase/cookies";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy apps/web/.env.local.example to apps/web/.env.local and fill in your Supabase project values.",
  );
}

/**
 * Pages that only make sense with an account. A guest who reaches one - by a
 * bookmark or a typed URL, since the header already stops clicks - is sent
 * to the landing page, where they can sign in, rather than shown a screen
 * whose every request would fail.
 */
const MEMBER_ONLY_PREFIXES = [
  "/study",
  "/exams",
  "/ai-tutor",
  "/dictation",
  "/profile",
  "/admin",
];

function isMemberOnly(pathname: string): boolean {
  return MEMBER_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Refreshes the Supabase session cookie on every navigation. Without this,
 * a Server Component reading cookies via next/headers can see a stale
 * access token that expired between page loads. `getClaims()` refreshes an
 * expired session and verifies the token, and the `setAll` below writes the
 * renewed cookie back.
 *
 * It is also the one place that turns guests away from member-only pages.
 *
 * Lives in src/ as proxy.ts on purpose. With an src/app directory Next.js
 * only looks for this file inside src/, and Next 16 renamed middleware to
 * proxy; at the project root under its old name it was never run at all.
 */
export async function proxy(request: NextRequest) {
  // One nonce per response. It goes to the page twice: in the policy the
  // browser enforces, and on the request, where Next.js reads it back to stamp
  // its own inline scripts and where the root layout takes it for the scripts
  // it writes itself (x-nonce).
  const nonce = createNonce();
  const policy = contentSecurityPolicy({
    nonce,
    development: process.env.NODE_ENV === "development",
  });

  // Built from the request as it is *now*: after the session refresh below has
  // rewritten the cookies, a copy taken earlier would still carry the old ones.
  const proceed = () => {
    const headers = new Headers(request.headers);
    headers.set("x-nonce", nonce);
    headers.set("content-security-policy", policy);
    const next = NextResponse.next({ request: { headers } });
    next.headers.set("content-security-policy", policy);
    return next;
  };

  let response = proceed();

  // The refresh below rewrites the auth cookies, and has to write them the way
  // the server client does: HttpOnly, and without an expiry for someone who
  // signed in without "remember me".
  const secure = isHttps(request.headers, request.nextUrl.protocol);
  const sessionOnly = request.cookies.get(SESSION_ONLY_COOKIE)?.value === "1";

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = proceed();
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(
            name,
            value,
            hardenedCookieOptions(options, { secure, sessionOnly }),
          );
        }
      },
    },
  });

  // getClaims, not getUser: it verifies the token's signature locally against
  // the project's cached JWKS, where getUser asked the Auth server on every
  // single navigation - a round trip to Supabase before any page could start.
  // It still refreshes an expired session, which is what this file is for.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  if (!user && isMemberOnly(request.nextUrl.pathname)) {
    const landing = request.nextUrl.clone();
    landing.pathname = "/";
    landing.search = "";
    const redirect = NextResponse.redirect(landing);
    redirect.headers.set("content-security-policy", policy);
    // Carry over whatever getClaims() just wrote, e.g. a cleared stale token.
    for (const cookie of response.cookies.getAll()) {
      redirect.cookies.set(cookie);
    }
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    // /api is left out: its routes read (and refresh) the session themselves,
    // and this proxy would buffer an uploaded body before they saw it.
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
