import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { beginRequest, endRequest } from "@/shared/network/pendingRequests";

import { SlowBackendNotice } from "./index";

const show = vi.hoisted(() => vi.fn());
const hide = vi.hoisted(() => vi.fn());
vi.mock("@mantine/notifications", () => ({
  notifications: { show, hide },
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SlowBackendNotice", () => {
  it("says nothing about an ordinary request", () => {
    render(<SlowBackendNotice />);

    act(() => beginRequest());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => endRequest());
    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(show).not.toHaveBeenCalled();
  });

  // The backend's host sleeps when idle and takes up to a minute to wake;
  // without a word, every screen sat on a skeleton and looked broken.
  it("explains a long wait, and clears it when the data arrives", () => {
    render(<SlowBackendNotice />);

    act(() => beginRequest());
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({ id: "slow-backend", loading: true }),
    );

    act(() => endRequest());

    expect(hide).toHaveBeenCalledWith("slow-backend");
  });
});
