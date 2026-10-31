import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useExamTimer } from "./useExamTimer";

afterEach(() => vi.useRealTimers());

describe("attempt deadline", () => {
  it("uses the server deadline and catches up when returning to the tab", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const expired = vi.fn();
    const { result } = renderHook(() =>
      useExamTimer({
        expiresAt: "2026-01-01T00:01:00Z",
        isActive: true,
        onExpire: expired,
      }),
    );
    expect(result.current.remainingSeconds).toBe(60);
    act(() => {
      vi.setSystemTime(new Date("2026-01-01T00:02:00Z"));
      window.dispatchEvent(new Event("focus"));
    });
    expect(result.current.remainingSeconds).toBe(0);
    expect(expired).toHaveBeenCalledTimes(1);
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    expect(expired).toHaveBeenCalledTimes(1);
  });
});
