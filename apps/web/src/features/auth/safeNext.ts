/**
 * Only a same-origin path is safe to redirect to; anything else falls back to
 * "/". A backslash is refused too: browsers read "/\evil.example" as
 * "//evil.example", another site.
 */
export function safeNext(next: string | null): string {
  return next &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("\\") &&
    !/[\u0000-\u0020\u007f]/.test(next)
    ? next
    : "/";
}
