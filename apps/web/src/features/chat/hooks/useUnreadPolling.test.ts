import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UNREAD_POLL_INTERVAL_MS } from "../constants/chat";

import { useUnreadPolling } from "./useUnreadPolling";

let visibility: DocumentVisibilityState = "visible";

function changeVisibility(next: DocumentVisibilityState) {
  visibility = next;
  document.dispatchEvent(new Event("visibilitychange"));
}

function setup(pathname = "/exams") {
  const refresh = vi.fn();
  const hook = renderHook(
    ({ path }) => useUnreadPolling({ refresh, pathname: path }),
    { initialProps: { path: pathname } },
  );
  return { ...hook, refresh };
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

describe("useUnreadPolling", () => {
  it("leaves the first ask to the query, and asks again every minute while the tab is showing", () => {
    const { refresh } = setup();
    expect(refresh).not.toHaveBeenCalled();

    vi.advanceTimersByTime(UNREAD_POLL_INTERVAL_MS - 1);
    expect(refresh).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(UNREAD_POLL_INTERVAL_MS);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("asks nothing while the tab is hidden", () => {
    const { refresh } = setup();

    changeVisibility("hidden");
    vi.advanceTimersByTime(10 * UNREAD_POLL_INTERVAL_MS);

    expect(refresh).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("asks at once when the tab is shown again, and the next minute starts from then", () => {
    const { refresh } = setup();
    changeVisibility("hidden");
    vi.advanceTimersByTime(5 * UNREAD_POLL_INTERVAL_MS);

    changeVisibility("visible");
    expect(refresh).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(UNREAD_POLL_INTERVAL_MS - 1);
    expect(refresh).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("does not run two timers when the tab is shown twice", () => {
    const { refresh } = setup();

    changeVisibility("visible");
    changeVisibility("visible");
    refresh.mockClear();
    vi.advanceTimersByTime(UNREAD_POLL_INTERVAL_MS);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("asks at once when the page changes, and not when it stays", () => {
    const { refresh, rerender } = setup("/exams");

    rerender({ path: "/exams" });
    expect(refresh).not.toHaveBeenCalled();

    rerender({ path: "/friends" });
    expect(refresh).toHaveBeenCalledTimes(1);
    rerender({ path: "/study/flashcards" });
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("does not ask about a page change while the tab is hidden", () => {
    const { refresh, rerender } = setup("/exams");
    changeVisibility("hidden");

    rerender({ path: "/friends" });

    expect(refresh).not.toHaveBeenCalled();
  });

  it("stops everything when unmounted", () => {
    const { refresh, unmount } = setup();

    unmount();
    vi.advanceTimersByTime(5 * UNREAD_POLL_INTERVAL_MS);
    changeVisibility("hidden");
    changeVisibility("visible");

    expect(refresh).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
