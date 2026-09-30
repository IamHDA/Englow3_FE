/**
 * Builds a query string, leaving out null, undefined and "" - an unset filter
 * is not sent at all rather than sent empty. 0 is a value and is kept.
 */
export function toQueryString(
  params: Record<string, string | number | null | undefined>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") query.set(key, String(value));
  }
  return query.toString();
}
