"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReviewRating } from "@/lib/graphql/generated";
import {
  FlashcardItem,
  FlashcardSessionSummaryData,
  SRSRating,
} from "../types";

export interface UseFlashcardStudyOptions {
  cards: FlashcardItem[];
  setName: string;
  onComplete?: (summary: FlashcardSessionSummaryData) => void;
  /**
   * Báo cho nơi gọi biết một thẻ vừa được chấm. Hook không tự gửi đi: nó không
   * biết gì về Apollo, và giữ nguyên như vậy thì nó còn test được mà không cần
   * mock schema.
   */
  onRate?: (
    cardId: string,
    rating: SRSRating,
    timeSpentSeconds: number,
  ) => void;
}

export function useFlashcardStudy({
  cards,
  setName,
  onComplete,
  onRate,
}: UseFlashcardStudyOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratingCounts, setRatingCounts] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [studySeconds, setStudySeconds] = useState(0);

  // Timer
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setStudySeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const currentCard = useMemo(() => {
    return cards[currentIndex] || null;
  }, [cards, currentIndex]);

  const progressPercent = useMemo(() => {
    if (cards.length === 0) return 0;
    return Math.round((currentIndex / cards.length) * 100);
  }, [cards.length, currentIndex]);

  const flipCard = useCallback(() => {
    // Lần lật đầu của một thẻ là lúc người học thật sự bắt đầu với nó. Đặt mốc
    // ở đây chứ không lúc render, vì `Date.now()` không thuần.
    cardShownAtRef.current ??= Date.now();
    setIsFlipped((prev) => !prev);
  }, []);

  const speakCard = useCallback(
    (text?: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window))
        return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        text || currentCard?.lemma || "",
      );
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    },
    [currentCard?.lemma],
  );

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Mốc thời gian của thẻ đang mở, để đo người học nghĩ bao lâu trước khi trả
  // lời. Ref chứ không phải state: đổi nó không cần vẽ lại gì cả. Đặt lại ngay
  // trong lúc chấm chứ không qua effect - đây là hệ quả của một hành động, không
  // phải đồng bộ với thứ gì bên ngoài React.
  const cardShownAtRef = useRef<number | null>(null);

  const rateCard = useCallback(
    (rating: SRSRating) => {
      const answeredAt = Date.now();
      const shownAt = cardShownAtRef.current;
      const card = cards[currentIndex];
      if (card) {
        onRate?.(
          card.id,
          rating,
          shownAt === null ? 0 : Math.round((answeredAt - shownAt) / 1000),
        );
      }
      // Thẻ kế tiếp bắt đầu đếm lại từ lần lật của chính nó.
      cardShownAtRef.current = null;

      const nextCounts = { ...ratingCounts };
      if (rating === ReviewRating.AGAIN) nextCounts.again += 1;
      else if (rating === ReviewRating.HARD) nextCounts.hard += 1;
      else if (rating === ReviewRating.GOOD) nextCounts.good += 1;
      else if (rating === ReviewRating.EASY) nextCounts.easy += 1;
      setRatingCounts(nextCounts);

      if (currentIndex + 1 >= cards.length) {
        setIsCompleted(true);
        const totalReviewed = cards.length;
        const successful = nextCounts.good + nextCounts.easy;
        const accuracyPercent =
          Math.round((successful / totalReviewed) * 100) || 0;
        const summary: FlashcardSessionSummaryData = {
          setName,
          totalReviewed,
          accuracyPercent,
          studyDurationFormatted: formatDuration(studySeconds),
          breakdown: nextCounts,
        };
        onComplete?.(summary);
      } else {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [
      cards,
      currentIndex,
      onComplete,
      onRate,
      ratingCounts,
      setName,
      studySeconds,
    ],
  );

  const restartStudy = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setRatingCounts({ again: 0, hard: 0, good: 0, easy: 0 });
    setStudySeconds(0);
    setIsCompleted(false);
  }, []);

  // Keyboard shortcut: Space (flip), 1: Again, 2: Hard, 3: Good, 4: Easy
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        flipCard();
      } else if (isFlipped) {
        if (e.key === "1") {
          rateCard(ReviewRating.AGAIN);
        } else if (e.key === "2") {
          rateCard(ReviewRating.HARD);
        } else if (e.key === "3") {
          rateCard(ReviewRating.GOOD);
        } else if (e.key === "4") {
          rateCard(ReviewRating.EASY);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flipCard, isFlipped, rateCard]);

  const summaryData: FlashcardSessionSummaryData = useMemo(() => {
    const totalReviewed = cards.length;
    const successful = ratingCounts.good + ratingCounts.easy;
    return {
      setName,
      totalReviewed,
      accuracyPercent:
        totalReviewed > 0 ? Math.round((successful / totalReviewed) * 100) : 0,
      studyDurationFormatted: formatDuration(studySeconds),
      breakdown: ratingCounts,
    };
  }, [cards.length, ratingCounts, setName, studySeconds]);

  return {
    currentIndex,
    totalCards: cards.length,
    currentCard,
    isFlipped,
    progressPercent,
    studyDurationFormatted: formatDuration(studySeconds),
    isCompleted,
    summaryData,
    flipCard,
    speakCard,
    rateCard,
    restartStudy,
  };
}
