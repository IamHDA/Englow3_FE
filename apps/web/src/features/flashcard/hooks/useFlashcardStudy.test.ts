import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FlashcardItem } from "../types";
import { useFlashcardStudy } from "./useFlashcardStudy";

const mockCards: FlashcardItem[] = [
  {
    id: "c1",
    front: "comprehensive",
    ipa: "/ˌkɒm.prɪˈhen.sɪv/",
    pos: "adjective",
    definition: "Complete",
    translationVi: "Toàn diện",
    exampleSentence: "A comprehensive review.",
    status: "Review",
    missCount: 1,
  },
  {
    id: "c2",
    front: "substantiate",
    ipa: "/səbˈstæn.ʃi.eɪt/",
    pos: "verb",
    definition: "Prove with evidence",
    translationVi: "Chứng minh",
    exampleSentence: "Substantiate the claims.",
    status: "Learning",
    missCount: 2,
  },
];

describe("useFlashcardStudy", () => {
  it("initializes with first card and unflipped state", () => {
    const { result } = renderHook(() =>
      useFlashcardStudy({ cards: mockCards, setName: "Test Set" })
    );

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.totalCards).toBe(2);
    expect(result.current.currentCard?.front).toBe("comprehensive");
    expect(result.current.isFlipped).toBe(false);
    expect(result.current.isCompleted).toBe(false);
  });

  it("flips card when flipCard is called", () => {
    const { result } = renderHook(() =>
      useFlashcardStudy({ cards: mockCards, setName: "Test Set" })
    );

    act(() => {
      result.current.flipCard();
    });

    expect(result.current.isFlipped).toBe(true);

    act(() => {
      result.current.flipCard();
    });

    expect(result.current.isFlipped).toBe(false);
  });

  it("advances card upon rating and triggers onComplete on last card", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useFlashcardStudy({ cards: mockCards, setName: "Test Set", onComplete })
    );

    // Rate first card
    act(() => {
      result.current.rateCard("Good");
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.currentCard?.front).toBe("substantiate");
    expect(result.current.isFlipped).toBe(false);

    // Rate second (last) card
    act(() => {
      result.current.rateCard("Easy");
    });

    expect(result.current.isCompleted).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        setName: "Test Set",
        totalReviewed: 2,
        accuracyPercent: 100,
        breakdown: { again: 0, hard: 0, good: 1, easy: 1 },
      })
    );
  });

  it("restarts study successfully", () => {
    const { result } = renderHook(() =>
      useFlashcardStudy({ cards: mockCards, setName: "Test Set" })
    );

    act(() => {
      result.current.rateCard("Again");
    });
    act(() => {
      result.current.rateCard("Good");
    });

    expect(result.current.isCompleted).toBe(true);

    act(() => {
      result.current.restartStudy();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.isFlipped).toBe(false);
  });
});
