import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLearnerSearchTerm } from "./useLearnerSearchTerm";

const DEBOUNCE_MS = 300;

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function setup(initial = "") {
  return renderHook(({ input }) => useLearnerSearchTerm(input), {
    initialProps: { input: initial },
  });
}

describe("useLearnerSearchTerm", () => {
  it("is idle until something is typed, and for blanks", () => {
    const { result, rerender } = setup();
    expect(result.current).toEqual({ status: "idle" });

    rerender({ input: "   " });
    expect(result.current).toEqual({ status: "idle" });
  });

  /** The backend refuses a shorter term with SEARCH_TERM_TOO_SHORT; the query is never sent. */
  it("is too short below two characters, ignoring spaces around the term", () => {
    const { result, rerender } = setup();

    rerender({ input: "a" });
    expect(result.current).toEqual({ status: "tooShort" });

    rerender({ input: "  a  " });
    expect(result.current).toEqual({ status: "tooShort" });

    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    expect(result.current).toEqual({ status: "tooShort" });
  });

  it("waits for a pause in typing, then hands over the trimmed term", () => {
    const { result, rerender } = setup();

    rerender({ input: " an " });
    expect(result.current).toEqual({ status: "typing" });

    act(() => vi.advanceTimersByTime(DEBOUNCE_MS - 1));
    expect(result.current).toEqual({ status: "typing" });

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toEqual({ status: "ready", term: "an" });
  });

  it("settles on the last thing typed after quick keystrokes", () => {
    const { result, rerender } = setup();

    rerender({ input: "an" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ input: "ann" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ input: "anna" });
    expect(result.current).toEqual({ status: "typing" });

    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    expect(result.current).toEqual({ status: "ready", term: "anna" });
  });

  it("goes back to typing when a ready term is edited", () => {
    const { result, rerender } = setup();
    rerender({ input: "an" });
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    expect(result.current).toEqual({ status: "ready", term: "an" });

    rerender({ input: "ann" });
    expect(result.current).toEqual({ status: "typing" });
  });
});
