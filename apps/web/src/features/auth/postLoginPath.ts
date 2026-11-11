import { safeNext } from "./safeNext";
import { homeForRole } from "./types";

/** Keep bookmarks across password/OAuth sign-in without allowing redirect loops. */
export function postLoginPath(
  role: string | null | undefined,
  search: string,
  next?: string | null,
): string | null {
  const requested = next ?? new URLSearchParams(search).get("next");
  if (requested) {
    const path = safeNext(requested);
    const pathname = path.split(/[?#]/, 1)[0];
    if (
      path !== "/" &&
      !pathname.startsWith("/auth/") &&
      !pathname.startsWith("/api/")
    )
      return path;
  }
  return homeForRole(role);
}
