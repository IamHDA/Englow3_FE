import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SEARCH_DEBOUNCE_MS } from "../constants/blog";

import { useBlogSearchTerm } from "./useBlogSearchTerm";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function setup(initial = "") {
  return renderHook(({ input }) => useBlogSearchTerm(input), {
    initialProps: { input: initial },
  });
}

describe("useBlogSearchTerm", () => {
  it("is idle with no term until something is typed, and for blanks", () => {
    const { result, rerender } = setup();
    expect(result.current).toEqual({ status: "idle", term: null });

    rerender({ input: "   " });
    expect(result.current).toEqual({ status: "idle", term: null });
  });

  it("is too short below two characters - the backend refuses it - and never searches for it", () => {
    const { result, rerender } = setup();

    rerender({ input: " a " });
    expect(result.current).toEqual({ status: "tooShort", term: null });

    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(result.current).toEqual({ status: "tooShort", term: null });
  });

  it("waits for a pause in typing, then hands over the trimmed term", () => {
    const { result, rerender } = setup();

    rerender({ input: " ielts " });
    expect(result.current).toEqual({ status: "typing", term: null });

    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(result.current).toEqual({ status: "ready", term: "ielts" });
  });

  it("keeps the last settled term while the person types the next, and searches for the last thing typed", () => {
    const { result, rerender } = setup();
    rerender({ input: "ie" });
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(result.current).toEqual({ status: "ready", term: "ie" });

    rerender({ input: "iel" });
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 50));
    rerender({ input: "ielt" });
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 50));
    expect(result.current).toEqual({ status: "typing", term: "ie" });

    act(() => vi.advanceTimersByTime(50));
    expect(result.current).toEqual({ status: "ready", term: "ielt" });
  });

  it("drops the term one pause after the box is emptied", () => {
    const { result, rerender } = setup();
    rerender({ input: "ielts" });
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));

    rerender({ input: "" });
    expect(result.current).toEqual({ status: "idle", term: "ielts" });

    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(result.current).toEqual({ status: "idle", term: null });
  });
});
