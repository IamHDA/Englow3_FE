/**
 * The backend trusts the requested size; the cap belongs here so a client
 * cannot ask for the whole table.
 */
export function clampPageSize(
  value: number | null | undefined,
  defaultSize = 20,
  maxSize = 100,
): number {
  return Math.min(value ?? defaultSize, maxSize);
}
