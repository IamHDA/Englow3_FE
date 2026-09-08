import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PronunciationLesson } from "../types";
import { useVoiceRecorder } from "./useVoiceRecorder";

const mockLesson: PronunciationLesson = {
  id: "test-lesson",
  slug: "test-lesson",
  title: "Test Pronunciation Lesson",
  category: "Minimal Pairs",
  level: "Beginner",
  phonemeTarget: "/iː/",
  targetSentence: "Please sit on this seat.",
  ipaTranscript: "/pliːz sɪt ɒn ðɪs siːt/",
  translationVi: "Xin vui lòng ngồi vào chiếc ghế này.",
  phonemes: [
    { symbol: "/iː/", soundType: "vowel" },
    { symbol: "/s/", soundType: "consonant" },
  ],
  tips: ["Keep mouth wide"],
};

describe("useVoiceRecorder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with non-recording state", () => {
    const { result } = renderHook(() =>
      useVoiceRecorder({ lesson: mockLesson })
    );

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.recordingDuration).toBe(0);
    expect(result.current.evaluation).toBe(null);
  });

  it("handles simulated recording and generates AI evaluation", async () => {
    const onEvaluated = vi.fn();
    const { result } = renderHook(() =>
      useVoiceRecorder({ lesson: mockLesson, onEvaluated })
    );

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);

    // Fast-forward duration
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.recordingDuration).toBe(2);

    // Stop recording
    act(() => {
      result.current.stopRecording();
    });

    expect(result.current.isRecording).toBe(false);

    // Run pending timers (AI evaluation timeout)
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.evaluation).not.toBe(null);
    expect(result.current.evaluation?.phonemeScores).toHaveLength(2);
    expect(onEvaluated).toHaveBeenCalledTimes(1);
  });

  it("resets practice cleanly", async () => {
    const { result } = renderHook(() =>
      useVoiceRecorder({ lesson: mockLesson })
    );

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      result.current.stopRecording();
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.evaluation).not.toBe(null);

    act(() => {
      result.current.resetPractice();
    });

    expect(result.current.evaluation).toBe(null);
    expect(result.current.recordingDuration).toBe(0);
    expect(result.current.isRecording).toBe(false);
  });
});
