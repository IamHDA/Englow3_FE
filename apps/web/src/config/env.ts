import { z } from "zod";

/**
 * Public runtime configuration. Everything here ships to the browser, so it
 * must never hold a secret — the Supabase publishable key is safe by design
 * and is guarded server-side by row level security, not by being hidden.
 *
 * `process.env.NEXT_PUBLIC_*` is written out in full on purpose: Next only
 * inlines these when it can see the literal member expression.
 */
const publicEnvSchema = z.object({
  supabaseUrl: z.url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  supabasePublishableKey: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
});

export const publicEnv = publicEnvSchema.parse({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
