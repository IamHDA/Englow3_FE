/**
 * Guards the `next` parameter carried through the OAuth round trip. Only a
 * plain in-app path is allowed: anything absolute, protocol-relative, or
 * backslash-escaped would let a crafted link bounce a freshly signed-in user
 * onto an attacker's site (open redirect).
 */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next) {
    return "/";
  }

  const normalised = next.replaceAll("\\", "/");

  if (!normalised.startsWith("/") || normalised.startsWith("//")) {
    return "/";
  }

  return normalised;
}
