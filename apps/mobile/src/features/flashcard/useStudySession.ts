import { useCallback, useRef, useState } from "react";

import { ReviewRating } from "@/lib/graphql/generated";

export type RatingCounts = Record<"again" | "hard" | "good" | "easy", number>;

const KEY: Record<ReviewRating, keyof RatingCounts> = {
  [ReviewRating.AGAIN]: "again",
  [ReviewRating.HARD]: "hard",
  [ReviewRating.GOOD]: "good",
  [ReviewRating.EASY]: "easy",
};

/**
 * Walking a study queue: flip, rate, next. The time a card took is measured
 * from its first flip to the rating, as on the web, so a learner who leaves
 * the phone on the table does not inflate the review log.
 */
export function useStudySession<T extends { id: string }>(
  cards: T[],
  rate: (
    cardId: string,
    rating: ReviewRating,
    seconds: number,
  ) => Promise<unknown>,
) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [counts, setCounts] = useState<RatingCounts>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  // When the card was first flipped, tied to the card so a new queue never inherits a stale time.
  const shownAt = useRef<{ cardId: string; at: number } | null>(null);
  const pending = useRef(false);

  // A fresh queue (another round) starts a fresh session. Adjusting state
  // while rendering, rather than in an effect, avoids a render with stale state.
  const [queue, setQueue] = useState(cards);
  if (queue !== cards) {
    setQueue(cards);
    setIndex(0);
    setFlipped(false);
    setCounts({ again: 0, hard: 0, good: 0, easy: 0 });
  }

  const card = cards[index] ?? null;
  const done = cards.length > 0 && index >= cards.length;

  const flip = useCallback(() => {
    const current = cards[index];
    if (current && shownAt.current?.cardId !== current.id)
      shownAt.current = { cardId: current.id, at: Date.now() };
    setFlipped((value) => !value);
  }, [cards, index]);

  const submit = useCallback(
    async (rating: ReviewRating) => {
      const current = cards[index];
      if (!current || pending.current) return;
      pending.current = true;
      setSaving(true);
      setSaveError(false);
      try {
        const seconds =
          shownAt.current?.cardId === current.id
            ? Math.round((Date.now() - shownAt.current.at) / 1000)
            : 0;
        await rate(current.id, rating, seconds);
        shownAt.current = null;
        setCounts((value) => ({
          ...value,
          [KEY[rating]]: value[KEY[rating]] + 1,
        }));
        setFlipped(false);
        setIndex((value) => value + 1);
      } catch {
        // The card stays put; the learner can rate it again.
        setSaveError(true);
      } finally {
        pending.current = false;
        setSaving(false);
      }
    },
    [cards, index, rate],
  );

  const reviewed = counts.again + counts.hard + counts.good + counts.easy;
  const accuracy =
    reviewed === 0
      ? 0
      : Math.round(((counts.good + counts.easy) / reviewed) * 100);

  return {
    card,
    index,
    total: cards.length,
    flipped,
    flip,
    submit,
    counts,
    done,
    saving,
    saveError,
    accuracy,
  };
}
