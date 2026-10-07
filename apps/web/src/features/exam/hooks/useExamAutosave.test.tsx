import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useExamAutosave } from "./useExamAutosave";
const mocks = vi.hoisted(() => ({ save: vi.fn(), code: vi.fn() }));
const emptyAnswers = {};
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useSaveExamDraftMutation: () => [mocks.save],
}));
vi.mock("@/shared/network/loadError", () => ({ backendCodeOf: mocks.code }));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.code.mockReturnValue(undefined);
});
describe("exam draft synchronization", () => {
  it("preserves all selected options for a multiple-choice question", async () => {
    mocks.save.mockResolvedValue({ data: { saveExamDraft: { version: 1 } } });
    const hook = renderHook(() => useExamAutosave("attempt", emptyAnswers));
    act(() => hook.result.current.initialize("attempt", 0, {}, {}));
    await act(async () => {
      expect(
        await hook.result.current.flush({ question: ["first", "second"] }),
      ).toBe(true);
    });
    expect(mocks.save.mock.calls[0][0].variables.answers).toEqual([
      { questionId: "question", selectedOptionIds: ["first", "second"] },
    ]);
  });
  it("flushes the answers passed by submit even before the debounce runs", async () => {
    mocks.save.mockResolvedValue({ data: { saveExamDraft: { version: 1 } } });
    const hook = renderHook(() => useExamAutosave("attempt", emptyAnswers));
    act(() => hook.result.current.initialize("attempt", 0, {}, {}));
    let saved = false;
    await act(async () => {
      saved = await hook.result.current.flush({ question: "option" });
    });
    expect(saved).toBe(true);
    expect(mocks.save).toHaveBeenCalledWith({
      variables: {
        attemptId: "attempt",
        version: 0,
        answers: [{ questionId: "question", selectedOptionIds: ["option"] }],
      },
    });
    expect(hook.result.current.status).toBe("saved");
  });
  it("serializes a second edit behind an in-flight save and uses its returned revision", async () => {
    let finish!: (value: unknown) => void;
    mocks.save
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      )
      .mockResolvedValueOnce({ data: { saveExamDraft: { version: 2 } } });
    const hook = renderHook(() => useExamAutosave("attempt", emptyAnswers));
    act(() => hook.result.current.initialize("attempt", 0, {}, {}));
    let first!: Promise<boolean>;
    let second!: Promise<boolean>;
    act(() => {
      first = hook.result.current.flush({ question: "first" });
    });
    act(() => {
      second = hook.result.current.flush({ question: "second" });
    });
    expect(mocks.save).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish({ data: { saveExamDraft: { version: 1 } } });
      await Promise.all([first, second]);
    });
    expect(mocks.save).toHaveBeenCalledTimes(2);
    expect(mocks.save.mock.calls[1][0].variables).toEqual({
      attemptId: "attempt",
      version: 1,
      answers: [{ questionId: "question", selectedOptionIds: ["second"] }],
    });
  });
  it("blocks further writes after a competing tab changes the revision", async () => {
    mocks.code.mockReturnValue("EXAM_DRAFT_CHANGED");
    mocks.save.mockRejectedValue(new Error("conflict"));
    const hook = renderHook(() => useExamAutosave("attempt", emptyAnswers));
    act(() => hook.result.current.initialize("attempt", 7, {}, {}));
    await act(async () => {
      expect(await hook.result.current.flush({ question: "option" })).toBe(
        false,
      );
    });
    expect(hook.result.current.status).toBe("conflict");
    await act(async () => {
      expect(await hook.result.current.flush({ question: "other" })).toBe(
        false,
      );
    });
    expect(mocks.save).toHaveBeenCalledTimes(1);
  });
  it("retries a network failure without discarding the current answers", async () => {
    mocks.save
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ data: { saveExamDraft: { version: 4 } } });
    const hook = renderHook(() => useExamAutosave("attempt", emptyAnswers));
    act(() => hook.result.current.initialize("attempt", 3, {}, {}));
    await act(async () => {
      expect(await hook.result.current.flush({ question: "option" })).toBe(
        false,
      );
    });
    await act(async () => {
      expect(await hook.result.current.flush()).toBe(true);
    });
    expect(mocks.save.mock.calls[1][0]).toEqual(mocks.save.mock.calls[0][0]);
  });
});
