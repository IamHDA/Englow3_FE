// Plain TypeScript, no "use client": the route reads the address with it on the
// server, and the list's hook writes the address with it in the browser.
import { BlogPostSort } from "@/lib/graphql/generated";

/** What narrows and orders the list at /blog. Everything but the sort and the page is optional. */
export type BlogListFilters = {
  /** As typed in the box; the list searches for it once it settles. */
  q: string;
  skill: string | null;
  level: string | null;
  certificate: string | null;
  sort: BlogPostSort;
  /** Counted from 1. */
  page: number;
};

export const DEFAULT_LIST_FILTERS: BlogListFilters = {
  q: "",
  skill: null,
  level: null,
  certificate: null,
  sort: BlogPostSort.NEWEST,
  page: 1,
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const textOrNull = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/**
 * The filters an address asks for, so a link to a filtered list can be shared.
 * Anything it cannot read is the default: the address is typed by hand as
 * often as it is built here. The tag values are not checked against the
 * catalogue - the backend refuses one it does not know and the list says so.
 */
export function parseListFilters(params: RawParams): BlogListFilters {
  const page = Number.parseInt(first(params.page) ?? "", 10);
  return {
    q: first(params.q)?.trim() ?? "",
    skill: textOrNull(first(params.skill)),
    level: textOrNull(first(params.level)),
    certificate: textOrNull(first(params.certificate)),
    sort:
      first(params.sort) === BlogPostSort.MOST_LIKED
        ? BlogPostSort.MOST_LIKED
        : BlogPostSort.NEWEST,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** The query string that `parseListFilters` reads back; what is at its default is left out. */
export function serializeListFilters(filters: BlogListFilters): string {
  const query = new URLSearchParams();
  const q = filters.q.trim();
  if (q) query.set("q", q);
  if (filters.skill) query.set("skill", filters.skill);
  if (filters.level) query.set("level", filters.level);
  if (filters.certificate) query.set("certificate", filters.certificate);
  if (filters.sort !== DEFAULT_LIST_FILTERS.sort) {
    query.set("sort", filters.sort);
  }
  if (filters.page > 1) query.set("page", String(filters.page));
  return query.toString();
}
