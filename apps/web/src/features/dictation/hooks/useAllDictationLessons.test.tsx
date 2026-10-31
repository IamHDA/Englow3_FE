import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAllDictationLessons } from "./useAllDictationLessons";

const mocks = vi.hoisted(() => ({ first: vi.fn(), query: vi.fn() }));

// One client for the whole file, as in the app: a new one per render would make
// the hook think the client changed and fetch again, forever.
const client = { query: (...args: unknown[]) => mocks.query(...args) };
vi.mock("@apollo/client/react", () => ({
  useApolloClient: () => client,
}));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  DictationLessonsDocument: "DictationLessonsDocument",
  useDictationLessonsQuery: () => mocks.first(),
}));

const lesson = (id: string) => ({ id });
const page = (ids: string[], totalPages: number, totalItems: number) => ({
  items: ids.map(lesson),
  totalPages,
  totalItems,
});

beforeEach(() => {
  mocks.first.mockReset();
  mocks.query.mockReset();
});

describe("useAllDictationLessons", () => {
  it("returns just the first page when the library fits in one", () => {
    const result1 = {
      data: { dictationLessons: page(["a", "b"], 1, 2) },
      loading: false,
    };
    mocks.first.mockReturnValue(result1);

    const { result } = renderHook(() => useAllDictationLessons());

    expect(result.current.lessons.map((l) => l.id)).toEqual(["a", "b"]);
    expect(mocks.query).not.toHaveBeenCalled();
  });

  // The library once stopped at the first fifty lessons without saying so.
  it("fetches every later page and keeps the order", async () => {
    const firstPage = {
      data: { dictationLessons: page(["a", "b"], 3, 5) },
      loading: false,
    };
    mocks.first.mockReturnValue(firstPage);
    mocks.query.mockImplementation(
      async ({ variables }: { variables: { page: number } }) => ({
        data: {
          dictationLessons: page(
            variables.page === 1 ? ["c", "d"] : ["e"],
            3,
            5,
          ),
        },
      }),
    );

    const { result } = renderHook(() => useAllDictationLessons());

    await waitFor(() => expect(result.current.lessons).toHaveLength(5));
    expect(result.current.lessons.map((l) => l.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
    ]);
    expect(mocks.query.mock.calls.map((c) => c[0].variables.page)).toEqual([
      1, 2,
    ]);
  });

  it("keeps the first page when a later one fails", async () => {
    const failing = {
      data: { dictationLessons: page(["a"], 2, 2) },
      loading: false,
    };
    mocks.first.mockReturnValue(failing);
    mocks.query.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useAllDictationLessons());

    await waitFor(() => expect(mocks.query).toHaveBeenCalled());
    expect(result.current.lessons.map((l) => l.id)).toEqual(["a"]);
  });

  it("is empty before anything has loaded", () => {
    const loadingResult = { data: undefined, loading: true };
    mocks.first.mockReturnValue(loadingResult);

    const { result } = renderHook(() => useAllDictationLessons());

    expect(result.current.lessons).toEqual([]);
    expect(result.current.loading).toBe(true);
  });
});
