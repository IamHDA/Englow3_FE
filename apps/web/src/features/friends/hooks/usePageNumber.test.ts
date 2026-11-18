import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { usePageNumber } from "./usePageNumber";

function setup(totalPages: number | undefined) {
  return renderHook(
    ({ total }) => {
      const pager = usePageNumber();
      pager.fitTo(total);
      return pager;
    },
    { initialProps: { total: totalPages } },
  );
}

describe("usePageNumber", () => {
  it("starts on page 1 and moves where it is told", () => {
    const { result } = setup(5);
    expect(result.current.page).toBe(1);

    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);
  });

  /** The last row of the last page was unfriended: page 3 of 3 is now page 2 of 2. */
  it("steps back to the new last page when the list shrinks under it", () => {
    const { result, rerender } = setup(3);
    act(() => result.current.setPage(3));

    rerender({ total: 2 });

    expect(result.current.page).toBe(2);
  });

  it("falls back to page 1 when nothing is left", () => {
    const { result, rerender } = setup(2);
    act(() => result.current.setPage(2));

    rerender({ total: 0 });

    expect(result.current.page).toBe(1);
  });

  /** While the next page loads its total is unknown, and must not undo the move. */
  it("keeps the page while the total is unknown", () => {
    const { result, rerender } = setup(5);
    act(() => result.current.setPage(4));

    rerender({ total: undefined });

    expect(result.current.page).toBe(4);
  });
});
