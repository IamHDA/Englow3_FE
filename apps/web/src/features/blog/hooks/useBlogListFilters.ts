"use client";

import { useCallback, useState } from "react";

import { BLOG_ROUTES } from "../constants/blog";

import {
  DEFAULT_LIST_FILTERS,
  serializeListFilters,
  type BlogListFilters,
} from "./blogFilters";

/**
 * The filters of the list, kept in the address as they change - rewritten in
 * place rather than added to the history, so Back leaves the list instead of
 * stepping through every filter. Changing a filter goes back to the first page;
 * changing the page does not.
 */
export function useBlogListFilters(initial: BlogListFilters) {
  const [filters, setFilters] = useState(initial);

  const apply = useCallback((next: BlogListFilters) => {
    setFilters(next);
    const query = serializeListFilters(next);
    window.history.replaceState(
      null,
      "",
      query ? `${BLOG_ROUTES.list}?${query}` : BLOG_ROUTES.list,
    );
  }, []);

  const setFilter = useCallback(
    (change: Partial<Omit<BlogListFilters, "page">>) =>
      apply({ ...filters, ...change, page: 1 }),
    [apply, filters],
  );

  const setPage = useCallback(
    (page: number) => apply({ ...filters, page }),
    [apply, filters],
  );

  const clear = useCallback(
    () => apply({ ...DEFAULT_LIST_FILTERS, sort: filters.sort }),
    [apply, filters.sort],
  );

  const narrowed = Boolean(
    filters.q.trim() || filters.skill || filters.level || filters.certificate,
  );

  return { filters, setFilter, setPage, clear, narrowed };
}
