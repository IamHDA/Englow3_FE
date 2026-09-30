import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  DictationLesson,
  DictationSentence,
  DictationSubmission,
} from "../types";
import { useDictationPractice } from "./useDictationPractice";

const lesson: DictationLesson = {
  id: "lesson-1",
  slug: "lesson-1",
  title: "Everyday English",
  topic: "Daily Conversation",
  targetLevel: "A2",
  sentenceCount: 1,
  completedSentenceCount: 0,
  totalDurationSeconds: 8,
  lastPractisedAt: null,
};

const sentence: DictationSentence = {
  id: "sentence-1",
  orderNo: 1,
  audioUrl: "https://example.test/audio.wav",
  audioDurationSeconds: 8,
  hintWordCount: 3,
  hintFirstLetters: null,
  hintRevealWord: null,
  hintPartialTranscript: null,
  audioStartMs: null,
  audioEndMs: null,
  bestAccuracyPercent: null,
};

const submission: DictationSubmission = {
  sentenceId: sentence.id,
  correctText: "Good morning",
  translationVi: null,
  response: "Good morning",
  accuracyPercent: 100,
  correctWordCount: 2,
  totalWordCount: 2,
  cleared: true,
};

describe("useDictationPractice", () => {
  it("keeps the answer when grading fails", async () => {
    const checkSentence = vi.fn().mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() =>
      useDictationPractice(lesson, [sentence], checkSentence),
    );

    act(() => result.current.handleType("Good morning"));
    await act(async () => result.current.checkAnswer());

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.typedText).toBe("Good morning");
    expect(result.current.isChecked).toBe(false);
    expect(result.current.submissionError).toBe(true);
  });

  it("does not skip unless the server records the skipped answer", async () => {
    const checkSentence = vi.fn().mockResolvedValue(null);
    const { result } = renderHook(() =>
      useDictationPractice(lesson, [sentence], checkSentence),
    );

    await act(async () => result.current.skipSentence());

    expect(checkSentence).toHaveBeenCalledWith(sentence.id, "");
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.submissionError).toBe(true);
  });

  it("prevents two submissions for the same sentence", async () => {
    let finish!: (value: DictationSubmission) => void;
    const checkSentence = vi.fn(
      () =>
        new Promise<DictationSubmission>((resolve) => {
          finish = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useDictationPractice(lesson, [sentence], checkSentence),
    );
    let request!: Promise<void>;
    act(() => {
      request = result.current.checkAnswer();
    });
    await act(async () => result.current.skipSentence());
    expect(checkSentence).toHaveBeenCalledOnce();
    await act(async () => {
      finish(submission);
      await request;
    });
    expect(result.current.currentIndex).toBe(0);
  });

  it("uses measured session values", async () => {
    const checkSentence = vi.fn().mockResolvedValue(submission);
    const { result } = renderHook(() =>
      useDictationPractice(lesson, [sentence], checkSentence),
    );

    act(() => {
      result.current.setReplayCount(2);
      result.current.handleType("Good morning");
    });
    await act(async () => result.current.checkAnswer());
    act(() => result.current.nextSentence());

    expect(result.current.isCompleted).toBe(true);
    expect(result.current.summaryData.metrics.replays).toBe(2);
    expect(result.current.summaryData.studyDurationFormatted).not.toBe(
      "6m 15s",
    );
  });
});
