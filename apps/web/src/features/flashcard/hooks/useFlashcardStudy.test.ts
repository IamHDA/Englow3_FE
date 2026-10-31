import { act, renderHook } from "@testing-library/react";
import { FlashcardReviewStatus, ReviewRating } from "@/lib/graphql/generated";
import { describe, expect, it, vi } from "vitest";
import { FlashcardItem } from "../types";
import { useFlashcardStudy } from "./useFlashcardStudy";

/** Shaped like the fragment the BFF returns, so the hook is tested against the real card. */
function card(
  id: string,
  lemma: string,
  status: FlashcardReviewStatus,
): FlashcardItem {
  return {
    id,
    orderNo: 1,
    lemma,
    partOfSpeech: "adjective",
    senseLabel: `${lemma} (sense 1)`,
    ipaUs: "/test/",
    ipaUk: null,
    audioUsUrl: null,
    audioUkUrl: null,
    definitionEn: "Complete",
    definitionVi: "Toan dien",
    exampleSentence: `A ${lemma} review.`,
    exampleTranslationVi: null,
    mnemonicTipVi: null,
    cefrLevel: "B2",
    status,
    dueAt: null,
    lapseCount: 0,
  };
}

const mockCards: FlashcardItem[] = [
  card("c1", "comprehensive", FlashcardReviewStatus.REVIEW),
  card("c2", "substantiate", FlashcardReviewStatus.LEARNING),
];

describe("useFlashcardStudy", () => {
  it("keeps a card when saving fails and advances only after a successful retry", async () => {
    const onRate = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useFlashcardStudy({ cards: mockCards, setName: "Test", onRate }),
    );
    await act(async () => {
      await result.current.rateCard(ReviewRating.GOOD);
    });
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.saveError).toBe(true);
    expect(result.current.summaryData.breakdown.good).toBe(0);
    await act(async () => {
      await result.current.rateCard(ReviewRating.GOOD);
    });
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.saveError).toBe(false);
  });

  it("ignores duplicate ratings while the request is pending", async () => {
    let finish!: () => void;
    const onRate = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useFlashcardStudy({ cards: mockCards, setName: "Test", onRate }),
    );
    let request!: Promise<void>;
    act(() => {
      request = result.current.rateCard(ReviewRating.GOOD);
    });
    await act(async () => {
      await result.current.rateCard(ReviewRating.EASY);
    });
    expect(onRate).toHaveBeenCalledTimes(1);
    expect(result.current.currentIndex).toBe(0);
    await act(async () => {
      finish();
      await request;
    });
    expect(result.current.currentIndex).toBe(1);
  });
  it("initializes with first card and unflipped state", () => {
    const { result } = renderHook(() =>
      useFlashcardStudy({ cards: mockCards, setName: "Test Set" }),
    );

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.totalCards).toBe(2);
    expect(result.current.currentCard?.lemma).toBe("comprehensive");
    expect(result.current.isFlipped).toBe(false);
    expect(result.current.isCompleted).toBe(false);
  });

  it("flips card when flipCard is called", () => {
    const { result } = renderHook(() =>
      useFlashcardStudy({ cards: mockCards, setName: "Test Set" }),
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

  it("advances card upon rating and triggers onComplete on last card", async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useFlashcardStudy({ cards: mockCards, setName: "Test Set", onComplete }),
    );

    // Rate first card
    await act(async () => {
      await result.current.rateCard(ReviewRating.GOOD);
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.currentCard?.lemma).toBe("substantiate");
    expect(result.current.isFlipped).toBe(false);

    // Rate second (last) card
    await act(async () => {
      await result.current.rateCard(ReviewRating.EASY);
    });

    expect(result.current.isCompleted).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        setName: "Test Set",
        totalReviewed: 2,
        accuracyPercent: 100,
        breakdown: { again: 0, hard: 0, good: 1, easy: 1 },
      }),
    );
  });

  it("restarts study successfully", async () => {
    const { result } = renderHook(() =>
      useFlashcardStudy({ cards: mockCards, setName: "Test Set" }),
    );

    await act(async () => {
      await result.current.rateCard(ReviewRating.AGAIN);
    });
    await act(async () => {
      await result.current.rateCard(ReviewRating.GOOD);
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
