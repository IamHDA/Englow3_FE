import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DictationLesson, DictationSentence } from "../types";
import { useDictationPractice } from "./useDictationPractice";

const lesson: DictationLesson = {
  id: "lesson-1",
  slug: "lesson-1",
  title: "Everyday English",
  topic: "Daily Conversation",
  targetLevel: "A2",
  sentenceCount: 2,
  completedSentenceCount: 0,
  totalDurationSeconds: 8,
  lastPractisedAt: null,
  publishedAt: null,
};

function sentence(
  id: string,
  text: string,
  orderNo: number,
): DictationSentence {
  return {
    id,
    orderNo,
    text,
    translationVi: "Chào buổi sáng",
    audioUrl: "https://example.test/audio.wav",
    audioDurationSeconds: 8,
    audioStartMs: null,
    audioEndMs: null,
    bestAccuracyPercent: null,
  };
}

const first = sentence("sentence-1", "Good morning", 1);
const second = sentence("sentence-2", "See you soon", 2);

function setup(
  record = vi.fn().mockResolvedValue(true),
  sentences = [first, second],
) {
  const hook = renderHook(() =>
    useDictationPractice(lesson, sentences, record),
  );
  return { ...hook, record };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useDictationPractice", () => {
  it("marks an answer at once, without waiting for the server", () => {
    const record = vi.fn(() => new Promise<boolean>(() => {}));
    const { result } = setup(record);

    act(() => result.current.handleType("Good mornin"));
    act(() => result.current.checkAnswer());

    expect(result.current.isChecked).toBe(true);
    expect(result.current.diffResult?.mistakesCount).toBeGreaterThan(0);
    expect(record).toHaveBeenCalledWith(first.id, "Good mornin");
  });

  it("keeps the typed text when it is edited after a check, and records the new answer", () => {
    const { result, record } = setup();

    act(() => result.current.handleType("Good mornin"));
    act(() => result.current.checkAnswer());
    act(() => result.current.handleType("Good mornin "));

    expect(result.current.typedText).toBe("Good mornin ");
    expect(result.current.isChecked).toBe(false);

    act(() => result.current.handleType("Good morning"));
    act(() => result.current.checkAnswer());
    expect(record).toHaveBeenLastCalledWith(first.id, "Good morning");
  });

  it("moves on by itself after a perfect answer", () => {
    const { result } = setup();

    act(() => result.current.handleType("good morning!"));
    act(() => result.current.checkAnswer());
    expect(result.current.isAdvancing).toBe(true);
    expect(result.current.currentIndex).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.typedText).toBe("");
    expect(result.current.isChecked).toBe(false);
  });

  it("does not move on if the learner edits during the pause", () => {
    const { result } = setup();

    act(() => result.current.handleType("Good morning"));
    act(() => result.current.checkAnswer());
    act(() => result.current.handleType("Good morning, everyone"));
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("checks on the first Enter and goes to the next sentence on the second", () => {
    const { result } = setup();

    act(() => result.current.handleType("Good mornin"));
    act(() => result.current.submitOrAdvance());
    expect(result.current.isChecked).toBe(true);
    expect(result.current.currentIndex).toBe(0);

    act(() => result.current.submitOrAdvance());
    expect(result.current.currentIndex).toBe(1);
  });

  it("ignores Enter on an empty answer", () => {
    const { result, record } = setup();

    act(() => result.current.submitOrAdvance());

    expect(result.current.isChecked).toBe(false);
    expect(record).not.toHaveBeenCalled();
  });

  it("skips straight on and still records the skipped line", () => {
    const { result, record } = setup();

    act(() => result.current.skipSentence());

    expect(record).toHaveBeenCalledWith(first.id, "");
    expect(result.current.currentIndex).toBe(1);
  });

  it("keeps the result and flags the answer as unsaved when the server cannot be reached", async () => {
    const record = vi.fn().mockRejectedValue(new Error("offline"));
    const { result } = setup(record);

    act(() => result.current.handleType("Good mornin"));
    act(() => result.current.checkAnswer());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(record).toHaveBeenCalledTimes(3);
    expect(result.current.isChecked).toBe(true);
    expect(result.current.typedText).toBe("Good mornin");
    expect(result.current.unsavedCount).toBe(1);

    record.mockResolvedValue(true);
    await act(async () => {
      result.current.retrySaving();
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.unsavedCount).toBe(0);
  });

  it("uses measured session values", () => {
    const { result } = setup(undefined, [first]);

    act(() => {
      result.current.setReplayCount(2);
      result.current.handleType("Good morning");
    });
    act(() => result.current.checkAnswer());
    act(() => result.current.nextSentence());

    expect(result.current.isCompleted).toBe(true);
    expect(result.current.summaryData.metrics.replays).toBe(2);
    expect(result.current.summaryData.metrics.perfectSentences).toBe(1);
  });
});
