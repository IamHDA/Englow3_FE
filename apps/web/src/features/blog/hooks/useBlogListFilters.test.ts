import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BlogPostSort } from "@/lib/graphql/generated";

import {
  DEFAULT_LIST_FILTERS,
  parseListFilters,
  serializeListFilters,
} from "./blogFilters";
import { useBlogListFilters } from "./useBlogListFilters";

afterEach(() => vi.restoreAllMocks());

describe("parseListFilters", () => {
  it("reads every filter from an address", () => {
    expect(
      parseListFilters({
        q: " ielts ",
        skill: "WRITING",
        level: "B2",
        certificate: "IELTS",
        sort: "MOST_LIKED",
        page: "3",
      }),
    ).toEqual({
      q: "ielts",
      skill: "WRITING",
      level: "B2",
      certificate: "IELTS",
      sort: BlogPostSort.MOST_LIKED,
      page: 3,
    });
  });

  it("is the default for an address with nothing in it, or nothing it can read", () => {
    expect(parseListFilters({})).toEqual(DEFAULT_LIST_FILTERS);
    expect(
      parseListFilters({
        skill: "  ",
        sort: "OLDEST",
        page: "0",
      }),
    ).toEqual(DEFAULT_LIST_FILTERS);
    expect(parseListFilters({ page: "abc" }).page).toBe(1);
    expect(parseListFilters({ page: "-2" }).page).toBe(1);
    expect(parseListFilters({ page: "2.5" }).page).toBe(2);
  });

  it("takes the first of a parameter given twice", () => {
    expect(parseListFilters({ skill: ["READING", "WRITING"] }).skill).toBe(
      "READING",
    );
  });
});

describe("serializeListFilters", () => {
  it("leaves out whatever is at its default", () => {
    expect(serializeListFilters(DEFAULT_LIST_FILTERS)).toBe("");
  });

  it("round-trips through parseListFilters", () => {
    const filters = {
      q: "ielts tips",
      skill: "WRITING",
      level: "B2",
      certificate: "IELTS",
      sort: BlogPostSort.MOST_LIKED,
      page: 4,
    };
    const query = serializeListFilters(filters);
    expect(
      parseListFilters(Object.fromEntries(new URLSearchParams(query))),
    ).toEqual(filters);
  });
});

describe("useBlogListFilters", () => {
  function setup(initial = DEFAULT_LIST_FILTERS) {
    const replace = vi
      .spyOn(window.history, "replaceState")
      .mockImplementation(() => undefined);
    const hook = renderHook(() => useBlogListFilters(initial));
    return { ...hook, replace };
  }

  it("writes a change into the address in place, and goes back to the first page", () => {
    const { result, replace } = setup({ ...DEFAULT_LIST_FILTERS, page: 3 });

    act(() => result.current.setFilter({ skill: "WRITING" }));

    expect(result.current.filters).toMatchObject({ skill: "WRITING", page: 1 });
    expect(replace).toHaveBeenLastCalledWith(null, "", "/blog?skill=WRITING");
  });

  it("changes the page and keeps the filters", () => {
    const { result, replace } = setup({
      ...DEFAULT_LIST_FILTERS,
      skill: "WRITING",
    });

    act(() => result.current.setPage(2));

    expect(result.current.filters).toMatchObject({ skill: "WRITING", page: 2 });
    expect(replace).toHaveBeenLastCalledWith(
      null,
      "",
      "/blog?skill=WRITING&page=2",
    );
  });

  it("clears the filters but keeps the order the person chose", () => {
    const { result, replace } = setup({
      ...DEFAULT_LIST_FILTERS,
      q: "ielts",
      level: "B2",
      sort: BlogPostSort.MOST_LIKED,
      page: 2,
    });
    expect(result.current.narrowed).toBe(true);

    act(() => result.current.clear());

    expect(result.current.filters).toEqual({
      ...DEFAULT_LIST_FILTERS,
      sort: BlogPostSort.MOST_LIKED,
    });
    expect(result.current.narrowed).toBe(false);
    expect(replace).toHaveBeenLastCalledWith(null, "", "/blog?sort=MOST_LIKED");
  });

  it("goes to the bare address when nothing is left to say", () => {
    const { result, replace } = setup({ ...DEFAULT_LIST_FILTERS, level: "B2" });

    act(() => result.current.setFilter({ level: null }));

    expect(replace).toHaveBeenLastCalledWith(null, "", "/blog");
  });
});
