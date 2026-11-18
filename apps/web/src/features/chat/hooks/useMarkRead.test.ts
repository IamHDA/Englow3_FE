import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MARK_READ_DEBOUNCE_MS } from "../constants/chat";

import { useMarkRead } from "./useMarkRead";

let visibility: DocumentVisibilityState = "visible";
function changeVisibility(next: DocumentVisibilityState) {
  visibility = next;
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
}

function setup(initial: { upToSeq: number | null; readSeq: number }) {
  const markRead = vi.fn().mockResolvedValue(true);
  const onMarked = vi.fn();
  const hook = renderHook(
    (props: { upToSeq: number | null; readSeq: number }) =>
      useMarkRead({ ...props, markRead, onMarked }),
    { initialProps: initial },
  );
  return { ...hook, markRead, onMarked };
}

beforeEach(() => {
  vi.useFakeTimers();
  visibility = "visible";
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => visibility,
  });
});
afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(document, "visibilityState");
});

describe("useMarkRead", () => {
  it("marks the conversation read a second after something new from the other person is on screen", async () => {
    const { markRead, onMarked } = setup({ upToSeq: 9, readSeq: 4 });

    await act(() => vi.advanceTimersByTimeAsync(MARK_READ_DEBOUNCE_MS - 1));
    expect(markRead).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));

    expect(markRead).toHaveBeenCalledExactlyOnceWith(9);
    expect(onMarked).toHaveBeenCalledTimes(1);
  });

  it("makes one call for a burst, carrying the highest seq", async () => {
    const { rerender, markRead } = setup({ upToSeq: 5, readSeq: 4 });

    await act(() => vi.advanceTimersByTimeAsync(MARK_READ_DEBOUNCE_MS - 200));
    rerender({ upToSeq: 6, readSeq: 4 });
    await act(() => vi.advanceTimersByTimeAsync(MARK_READ_DEBOUNCE_MS - 200));
    rerender({ upToSeq: 7, readSeq: 4 });
    await act(() => vi.advanceTimersByTimeAsync(MARK_READ_DEBOUNCE_MS));

    expect(markRead).toHaveBeenCalledExactlyOnceWith(7);
  });

  it("does nothing when the viewer has already read that far, or there is nothing from the other person", async () => {
    const read = setup({ upToSeq: 4, readSeq: 4 });
    const none = setup({ upToSeq: null, readSeq: 0 });

    await act(() => vi.advanceTimersByTimeAsync(10 * MARK_READ_DEBOUNCE_MS));

    expect(read.markRead).not.toHaveBeenCalled();
    expect(none.markRead).not.toHaveBeenCalled();
  });

  it("does not ask again for a seq it already asked for", async () => {
    const { rerender, markRead } = setup({ upToSeq: 9, readSeq: 4 });
    await act(() => vi.advanceTimersByTimeAsync(MARK_READ_DEBOUNCE_MS));

    // The conversation is refetched and still says the old read mark.
    rerender({ upToSeq: 9, readSeq: 4 });
    await act(() => vi.advanceTimersByTimeAsync(10 * MARK_READ_DEBOUNCE_MS));

    expect(markRead).toHaveBeenCalledTimes(1);
  });

  it("marks nothing while the tab is hidden, and marks once it is shown", async () => {
    changeVisibility("hidden");
    const { markRead } = setup({ upToSeq: 9, readSeq: 4 });

    await act(() => vi.advanceTimersByTimeAsync(10 * MARK_READ_DEBOUNCE_MS));
    expect(markRead).not.toHaveBeenCalled();

    changeVisibility("visible");
    await act(() => vi.advanceTimersByTimeAsync(MARK_READ_DEBOUNCE_MS));
    expect(markRead).toHaveBeenCalledExactlyOnceWith(9);
  });

  it("tries again later when the mark failed, and tells nobody it worked", async () => {
    const { rerender, markRead, onMarked } = setup({ upToSeq: 9, readSeq: 4 });
    markRead.mockRejectedValueOnce(new Error("offline"));
    await act(() => vi.advanceTimersByTimeAsync(MARK_READ_DEBOUNCE_MS));
    expect(onMarked).not.toHaveBeenCalled();

    rerender({ upToSeq: 10, readSeq: 4 });
    await act(() => vi.advanceTimersByTimeAsync(MARK_READ_DEBOUNCE_MS));

    expect(markRead.mock.calls.map(([seq]) => seq)).toEqual([9, 10]);
  });

  it("leaves no timer behind when unmounted", () => {
    const { unmount } = setup({ upToSeq: 9, readSeq: 4 });

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
