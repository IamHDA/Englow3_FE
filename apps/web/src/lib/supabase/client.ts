import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/config/env";

/**
 * Browser-side Supabase client. `@supabase/ssr` keeps the session in cookies
 * rather than localStorage, so middleware and Server Components can read it
 * once route protection is added. The SDK owns the session — nothing here
 * copies, persists or logs tokens.
 */
export function getSupabaseBrowserClient() {
  return createBrowserClient(
    publicEnv.supabaseUrl,
    publicEnv.supabasePublishableKey,
  );
}
