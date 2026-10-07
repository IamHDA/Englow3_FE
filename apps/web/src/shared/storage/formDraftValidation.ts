/** A malformed recovery record must never replace a valid form. */
export function matchesDraftShape(value: unknown, template: unknown): boolean {
  if (template === null)
    return (
      value === null ||
      typeof value === "string" ||
      (typeof value === "number" && Number.isFinite(value))
    );
  if (Array.isArray(template))
    return (
      Array.isArray(value) &&
      value.every((item) =>
        template.length
          ? matchesDraftShape(item, template[0])
          : item !== undefined,
      )
    );
  if (typeof template === "object")
    return (
      !!value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.entries(template).every(
        ([key, shape]) =>
          shape === undefined ||
          matchesDraftShape((value as Record<string, unknown>)[key], shape),
      )
    );
  return (
    typeof value === typeof template &&
    (typeof value !== "number" || Number.isFinite(value))
  );
}
