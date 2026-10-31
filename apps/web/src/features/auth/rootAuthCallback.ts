/** Supabase can fall back to Site URL when a redirect is not allowlisted. */
export function rootAuthCallback(url: URL): URL | null {
  if (
    url.pathname !== "/" ||
    (!url.searchParams.has("code") &&
      !url.searchParams.has("token_hash") &&
      !url.searchParams.has("error"))
  ) {
    return null;
  }
  const callback = new URL("/auth/callback", url.origin);
  for (const key of [
    "code",
    "token_hash",
    "type",
    "next",
    "sb_flow_id",
    "error",
    "error_code",
  ]) {
    const value = url.searchParams.get(key);
    if (value !== null) callback.searchParams.set(key, value);
  }
  return callback;
}
