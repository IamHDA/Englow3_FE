import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import type { PracticeAttempt } from "../types";
import { useWritingDraft } from "./useWritingDraft";
const mocks = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock("@apollo/client/react", () => ({
  useApolloClient: () => ({ mutate: mocks.mutate }),
}));
vi.mock("@/features/auth", () => ({
  useAuth: () => ({ session: { userId: "auth-a" } }),
}));
const attempt = {
  id: "attempt",
  answerText: "Original",
  version: 3,
} as PracticeAttempt;
beforeEach(() => {
  mocks.mutate.mockReset();
  sessionStorage.clear();
});
afterEach(() => vi.useRealTimers());
describe("Writing draft durability", () => {
  it("keeps the text and browser copy after failed save, then retries with the same version", async () => {
    mocks.mutate.mockRejectedValueOnce(new Error("outage"));
    const { result } = renderHook(() => useWritingDraft(attempt));
    act(() => result.current.change("My edited essay"));
    let saved = true;
    await act(async () => {
      saved = await result.current.save();
    });
    expect(saved).toBe(false);
    expect(result.current.text).toBe("My edited essay");
    expect(sessionStorage.getItem("englow-writing:auth-a:attempt")).toContain(
      "My edited essay",
    );
    mocks.mutate.mockResolvedValueOnce({
      data: { saveAssessmentDraft: { version: 4 } },
    });
    await act(async () => {
      saved = await result.current.save();
    });
    expect(saved).toBe(true);
    expect(mocks.mutate.mock.calls[1][0].variables.version).toBe(3);
    expect(result.current.dirty).toBe(false);
  });
  it("flushes text typed while an earlier save was in progress before submission", async () => {
    let resolve!: (value: unknown) => void;
    mocks.mutate
      .mockReturnValueOnce(
        new Promise((r) => {
          resolve = r;
        }),
      )
      .mockResolvedValueOnce({ data: { saveAssessmentDraft: { version: 5 } } });
    const { result } = renderHook(() => useWritingDraft(attempt));
    act(() => result.current.change("First edit"));
    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current.save();
    });
    act(() => result.current.change("Latest edit"));
    await act(async () => {
      resolve({ data: { saveAssessmentDraft: { version: 4 } } });
      await pending;
    });
    await act(async () => {
      await result.current.save();
    });
    expect(mocks.mutate.mock.calls[1][0].variables).toEqual({
      id: "attempt",
      answerText: "Latest edit",
      version: 4,
    });
    expect(result.current.dirty).toBe(false);
  });
  it("offers recovery of a browser draft without overwriting the server version", async () => {
    sessionStorage.setItem(
      "englow-writing:auth-a:attempt",
      JSON.stringify({ text: "Recovered text", version: 2, at: Date.now() }),
    );
    const { result } = renderHook(() => useWritingDraft(attempt));
    await waitFor(() => expect(result.current.restore).toBe("Recovered text"));
    expect(result.current.text).toBe("Original");
    act(() => result.current.restoreLocal());
    expect(result.current.text).toBe("Recovered text");
  });
  it.each([Date.now() - 86400001, Date.now() + 60000])(
    "does not offer an expired or future-dated browser draft (%s)",
    async (at) => {
      sessionStorage.setItem(
        "englow-writing:auth-a:attempt",
        JSON.stringify({ text: "Stale text", version: 2, at }),
      );
      const { result } = renderHook(() => useWritingDraft(attempt));
      await act(async () => {});
      expect(result.current.restore).toBeNull();
      expect(result.current.text).toBe("Original");
    },
  );
});
