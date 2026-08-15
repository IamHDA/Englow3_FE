import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy apps/web/.env.local.example to apps/web/.env.local and fill in your Supabase project values.",
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * @supabase/ssr always writes the auth cookie with a 400-day max-age (see
 * DEFAULT_COOKIE_OPTIONS in its cookies.js) - `cookieOptions.maxAge` passed to
 * createBrowserClient is silently overridden on every write, so persistence
 * can't be configured at client-creation time. To make an unchecked "remember
 * me" actually expire the session at browser close, rewrite the cookie right
 * after sign-in with no max-age.
 */
export function forgetSessionOnBrowserClose() {
  document.cookie
    .split("; ")
    .filter((entry) => entry.includes("-auth-token"))
    .forEach((entry) => {
      const [name, ...rest] = entry.split("=");
      document.cookie = `${name}=${rest.join("=")}; path=/; samesite=lax`;
    });
}
