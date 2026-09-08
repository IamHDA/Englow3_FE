"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FlashcardItem, FlashcardSessionSummaryData, SRSRating } from "../types";

export interface UseFlashcardStudyOptions {
  cards: FlashcardItem[];
  setName: string;
  onComplete?: (summary: FlashcardSessionSummaryData) => void;
}

export function useFlashcardStudy({
  cards,
  setName,
  onComplete,
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
    setIsFlipped((prev) => !prev);
  }, []);

  const speakCard = useCallback((text?: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text || currentCard?.front || "");
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, [currentCard?.front]);

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const rateCard = useCallback(
    (rating: SRSRating) => {
      const nextCounts = { ...ratingCounts };
      if (rating === "Again") nextCounts.again += 1;
      else if (rating === "Hard") nextCounts.hard += 1;
      else if (rating === "Good") nextCounts.good += 1;
      else if (rating === "Easy") nextCounts.easy += 1;
      setRatingCounts(nextCounts);

      if (currentIndex + 1 >= cards.length) {
        setIsCompleted(true);
        const totalReviewed = cards.length;
        const successful = nextCounts.good + nextCounts.easy;
        const accuracyPercent = Math.round((successful / totalReviewed) * 100) || 0;
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
    [cards.length, currentIndex, onComplete, ratingCounts, setName, studySeconds]
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
          rateCard("Again");
        } else if (e.key === "2") {
          rateCard("Hard");
        } else if (e.key === "3") {
          rateCard("Good");
        } else if (e.key === "4") {
          rateCard("Easy");
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
      accuracyPercent: totalReviewed > 0 ? Math.round((successful / totalReviewed) * 100) : 0,
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
