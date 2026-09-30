import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDictationPractice } from "./useDictationPractice";
import type {
  DictationLesson,
  DictationSentence,
  DictationSubmission,
} from "../types";

const lesson = {
  id: "lesson",
  title: "Practice",
  targetLevel: "A1",
} as DictationLesson;
const sentences = [
  { id: "one", orderNo: 1 },
  { id: "two", orderNo: 2 },
] as DictationSentence[];
const submission = {
  correctText: "Hello",
  accuracyPercent: 100,
  correctWordCount: 1,
  totalWordCount: 1,
} as DictationSubmission;

describe("dictation recovery", () => {
  it("does not skip a sentence when saving fails", async () => {
    const check = vi.fn().mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() =>
      useDictationPractice(lesson, sentences, check),
    );
    act(() => {
      result.current.handleType("My answer");
    });
    await act(async () => {
      await result.current.skipSentence();
    });
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.typedText).toBe("My answer");
    expect(result.current.submitError).toBe(true);
    expect(result.current.submitting).toBe(false);
  });

  it("unlocks the input when trying the same sentence again", async () => {
    const { result } = renderHook(() =>
      useDictationPractice(
        lesson,
        sentences,
        vi.fn().mockResolvedValue(submission),
      ),
    );
    act(() => {
      result.current.handleType("Hello");
    });
    await act(async () => {
      await result.current.checkAnswer();
    });
    expect(result.current.isChecked).toBe(true);
    act(() => {
      result.current.retrySentence();
    });
    expect(result.current.isChecked).toBe(false);
    expect(result.current.diffResult).toBeNull();
    expect(result.current.currentIndex).toBe(0);
  });

  it("sends only one answer while checking", async () => {
    let finish!: (value: DictationSubmission) => void;
    const check = vi.fn(
      () =>
        new Promise<DictationSubmission>((resolve) => {
          finish = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useDictationPractice(lesson, sentences, check),
    );
    let request!: Promise<void>;
    act(() => {
      request = result.current.checkAnswer();
    });
    await act(async () => {
      await result.current.skipSentence();
    });
    expect(check).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish(submission);
      await request;
    });
    expect(result.current.currentIndex).toBe(0);
  });
});
