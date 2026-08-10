import type { User } from "@supabase/supabase-js";

/**
 * The name to greet someone by. Prefers what they set at sign-up - Google and
 * Facebook both populate one of these - then the local part of their email, so
 * the header never shows a full address or an empty greeting.
 */
export function displayName(user: User): string {
  const metadata: Record<string, unknown> = user.user_metadata ?? {};

  for (const key of ["full_name", "name", "user_name"]) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  const local = user.email?.split("@")[0]?.trim();
  if (local) {
    return local.charAt(0).toUpperCase() + local.slice(1);
  }

  return "there";
}
