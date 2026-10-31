import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PRESENCE_INTERVAL_MS, useExamPresence } from "./useExamPresence";

const heartbeat = vi.fn();
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useHeartbeatExamAttemptMutation: () => [heartbeat],
}));

beforeEach(() => {
  vi.useFakeTimers();
  heartbeat.mockReset();
  heartbeat.mockResolvedValue({ data: { heartbeatExamAttempt: true } });
});
afterEach(() => vi.useRealTimers());

describe("useExamPresence", () => {
  it("reports at once and then on every interval", async () => {
    renderHook(() => useExamPresence("attempt-1", true, vi.fn()));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(heartbeat).toHaveBeenCalledTimes(1);
    expect(heartbeat).toHaveBeenCalledWith({
      variables: { attemptId: "attempt-1" },
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(PRESENCE_INTERVAL_MS * 2);
    });
    expect(heartbeat).toHaveBeenCalledTimes(3);
  });

  it("stays quiet for a practice or when there is no attempt", async () => {
    renderHook(() => useExamPresence("attempt-1", false, vi.fn()));
    renderHook(() => useExamPresence(null, true, vi.fn()));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PRESENCE_INTERVAL_MS * 3);
    });
    expect(heartbeat).not.toHaveBeenCalled();
  });

  it("says so when the backend reports the sitting closed, and stops reporting", async () => {
    const onEnded = vi.fn();
    heartbeat.mockResolvedValue({ data: { heartbeatExamAttempt: false } });
    renderHook(() => useExamPresence("attempt-1", true, onEnded));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(onEnded).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(PRESENCE_INTERVAL_MS * 2);
    });
    expect(heartbeat).toHaveBeenCalledTimes(1);
  });

  it("does not end the sitting because the network failed", async () => {
    const onEnded = vi.fn();
    heartbeat.mockRejectedValue(new Error("offline"));
    renderHook(() => useExamPresence("attempt-1", true, onEnded));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(PRESENCE_INTERVAL_MS * 2);
    });

    expect(onEnded).not.toHaveBeenCalled();
  });
});
