import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { publicEnv } from "@/config/env";

/**
 * Server-side Supabase client. A new one per request — never share a client
 * across requests, since each carries its own session cookies.
 *
 * `getAll`/`setAll` are both implemented: without `setAll` the SDK cannot
 * write refreshed tokens back, which shows up later as random logouts.
 */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    publicEnv.supabaseUrl,
    publicEnv.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );
}
