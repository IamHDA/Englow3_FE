import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizItem } from "../types";
import { useQuizEngine } from "./useQuizEngine";

const mockQuiz: QuizItem = {
  id: "test-quiz",
  title: "Test Grammar Quiz",
  category: "Grammar",
  level: "Intermediate",
  description: "Test description",
  timeLimitMinutes: 10,
  passingScorePercent: 70,
  questions: [
    {
      id: "q1",
      type: "MULTIPLE_CHOICE",
      title: "Question 1",
      prompt: "Choose the correct option",
      points: 5,
      explanation: "Option A is correct",
      mcOptions: [
        { id: "opt-a", label: "A", text: "Alpha" },
        { id: "opt-b", label: "B", text: "Beta" },
      ],
      correctOptionId: "opt-a",
    },
    {
      id: "q2",
      type: "FILL_BLANK",
      title: "Question 2",
      prompt: "Fill in the blank",
      points: 5,
      explanation: "off is correct",
      beforeText: "Put",
      afterText: "the meeting",
      acceptedAnswers: ["off"],
    },
  ],
};

describe("useQuizEngine", () => {
  it("initializes properly with zero answers", () => {
    const { result } = renderHook(() => useQuizEngine({ quiz: mockQuiz }));

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.totalQuestions).toBe(2);
    expect(result.current.currentQuestion?.id).toBe("q1");
    expect(result.current.answeredCount).toBe(0);
    expect(result.current.isSubmitted).toBe(false);
  });

  it("sets answers and updates answered count", () => {
    const { result } = renderHook(() => useQuizEngine({ quiz: mockQuiz }));

    act(() => {
      result.current.setAnswer("q1", "opt-a");
    });

    expect(result.current.answers["q1"]).toBe("opt-a");
    expect(result.current.answeredCount).toBe(1);

    act(() => {
      result.current.nextQuestion();
      result.current.setAnswer("q2", "off");
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.answeredCount).toBe(2);
  });

  it("toggles flagged question state", () => {
    const { result } = renderHook(() => useQuizEngine({ quiz: mockQuiz }));

    act(() => {
      result.current.toggleFlag("q1");
    });

    expect(result.current.flaggedIds).toContain("q1");

    act(() => {
      result.current.toggleFlag("q1");
    });

    expect(result.current.flaggedIds).not.toContain("q1");
  });

  it("submits quiz and computes accurate score and reviews", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useQuizEngine({ quiz: mockQuiz, onComplete })
    );

    act(() => {
      result.current.setAnswer("q1", "opt-a"); // correct (5 pts)
      result.current.setAnswer("q2", "wrong"); // wrong (0 pts)
    });

    act(() => {
      result.current.submitQuiz();
    });

    expect(result.current.isSubmitted).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 5,
        totalPoints: 10,
        scorePercent: 50,
        isPassed: false, // passing is 70%
      })
    );
  });
});
