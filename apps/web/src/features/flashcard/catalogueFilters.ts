export function flashcardFiltersFromUrl(
  values: Record<string, string | string[] | undefined>,
) {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const topic = first(values.topic);
  const sort = first(values.sort);
  return {
    topic: topic && topic !== "ALL" ? topic : "ALL",
    q: first(values.q)?.trim() ?? "",
    sort: ["due", "progress", "cards"].includes(sort ?? "") ? sort! : "due",
    page: Math.min(
      10000,
      Math.max(1, Number.parseInt(first(values.page) ?? "1", 10) || 1),
    ),
  };
}

export type FlashcardCatalogueFilters = ReturnType<
  typeof flashcardFiltersFromUrl
>;
