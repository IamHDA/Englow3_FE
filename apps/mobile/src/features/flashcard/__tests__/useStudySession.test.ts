import { act, renderHook, waitFor } from "@testing-library/react-native";

import { ReviewRating } from "@/lib/graphql/generated";

import { useStudySession } from "../useStudySession";

const cards = [{ id: "a" }, { id: "b" }];

describe("useStudySession", () => {
  it("rates each card in turn and finishes with the tally", async () => {
    const rate = jest.fn().mockResolvedValue(undefined);
    const { result } = await renderHook(() => useStudySession(cards, rate));

    await act(async () => result.current.flip());
    await act(async () => result.current.submit(ReviewRating.GOOD));
    await act(async () => result.current.flip());
    await act(async () => result.current.submit(ReviewRating.AGAIN));

    expect(rate).toHaveBeenNthCalledWith(
      1,
      "a",
      ReviewRating.GOOD,
      expect.any(Number),
    );
    expect(rate).toHaveBeenNthCalledWith(
      2,
      "b",
      ReviewRating.AGAIN,
      expect.any(Number),
    );
    expect(result.current.done).toBe(true);
    expect(result.current.counts).toEqual({
      again: 1,
      hard: 0,
      good: 1,
      easy: 0,
    });
    expect(result.current.accuracy).toBe(50);
  });

  it("keeps the card when the rating cannot be saved", async () => {
    const rate = jest.fn().mockRejectedValue(new Error("offline"));
    const { result } = await renderHook(() => useStudySession(cards, rate));

    await act(async () => result.current.submit(ReviewRating.EASY));

    expect(result.current.index).toBe(0);
    expect(result.current.saveError).toBe(true);
    expect(result.current.counts.easy).toBe(0);
  });

  it("starts over when a new queue arrives", async () => {
    const rate = jest.fn().mockResolvedValue(undefined);
    const { result, rerender } = await renderHook(
      ({ queue }: { queue: { id: string }[] }) => useStudySession(queue, rate),
      { initialProps: { queue: cards } },
    );
    await act(async () => result.current.submit(ReviewRating.GOOD));
    expect(result.current.index).toBe(1);

    await rerender({ queue: [{ id: "c" }] });

    await waitFor(() => expect(result.current.index).toBe(0));
    expect(result.current.card?.id).toBe("c");
    expect(result.current.counts.good).toBe(0);
  });
});
