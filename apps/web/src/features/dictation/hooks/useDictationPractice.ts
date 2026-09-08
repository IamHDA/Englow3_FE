"use client";

import { useCallback, useMemo, useState } from "react";
import { computeWordDiff } from "../utils/diff";
import type {
  DictationLesson,
  DictationSentence,
  DictationSessionSummaryData,
  DiffResult,
} from "../types";

export function useDictationPractice(lesson: DictationLesson) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Per-sentence recorded results
  const [completedResults, setCompletedResults] = useState<
    Array<{
      sentence: DictationSentence;
      learnerAnswer: string;
      diff: DiffResult;
    }>
  >([]);

  const currentSentence = useMemo(() => {
    return lesson.sentences[currentIndex] || lesson.sentences[0];
  }, [lesson.sentences, currentIndex]);

  const totalSentences = lesson.sentences.length;

  const handleType = useCallback((value: string) => {
    setTypedText(value);
  }, []);

  const revealHint = useCallback((hintKey: string) => {
    setRevealedHints((prev) => {
      if (!prev[hintKey]) {
        setHintsUsedCount((c) => c + 1);
        return { ...prev, [hintKey]: true };
      }
      return prev;
    });
  }, []);

  const checkAnswer = useCallback(() => {
    if (!currentSentence) return;
    const diff = computeWordDiff(currentSentence.text, typedText);
    setDiffResult(diff);
    setIsChecked(true);

    setCompletedResults((prev) => {
      const existing = prev.filter((r) => r.sentence.id !== currentSentence.id);
      return [
        ...existing,
        {
          sentence: currentSentence,
          learnerAnswer: typedText,
          diff,
        },
      ];
    });
  }, [currentSentence, typedText]);

  const nextSentence = useCallback(() => {
    if (currentIndex + 1 < totalSentences) {
      setCurrentIndex((prev) => prev + 1);
      setTypedText("");
      setIsChecked(false);
      setDiffResult(null);
      setRevealedHints({});
    } else {
      setIsCompleted(true);
    }
  }, [currentIndex, totalSentences]);

  const skipSentence = useCallback(() => {
    if (!currentSentence) return;
    const diff = computeWordDiff(currentSentence.text, "");
    setCompletedResults((prev) => {
      const existing = prev.filter((r) => r.sentence.id !== currentSentence.id);
      return [
        ...existing,
        {
          sentence: currentSentence,
          learnerAnswer: "",
          diff,
        },
      ];
    });
    nextSentence();
  }, [currentSentence, nextSentence]);

  const restartPractice = useCallback(() => {
    setCurrentIndex(0);
    setTypedText("");
    setIsChecked(false);
    setDiffResult(null);
    setHintsUsedCount(0);
    setRevealedHints({});
    setCompletedResults([]);
    setIsCompleted(false);
  }, []);

  // Summary computed data
  const summaryData: DictationSessionSummaryData = useMemo(() => {
    const totalWords = completedResults.reduce((acc, r) => acc + r.diff.totalWordsCount, 0) || 1;
    const correctWords = completedResults.reduce((acc, r) => acc + r.diff.correctWordsCount, 0);
    const mistakesCount = completedResults.reduce((acc, r) => acc + r.diff.mistakesCount, 0);

    const overallAccuracyPercent = Math.round((correctWords / totalWords) * 100);
    const perfectCount = completedResults.filter((r) => r.diff.mistakesCount === 0).length;

    const mistakesList = completedResults
      .filter((r) => r.diff.mistakesCount > 0)
      .map((r, i) => ({
        id: r.sentence.id,
        sentenceLabel: `Sentence ${r.sentence.order || i + 1}`,
        accuracyPercent: r.diff.accuracyPercent,
        learnerAnswer: r.learnerAnswer || "(Bỏ qua)",
        correctAnswer: r.sentence.text,
      }));

    return {
      lessonTitle: lesson.title,
      lessonLevel: lesson.level,
      overallAccuracyPercent: Math.max(0, Math.min(100, overallAccuracyPercent)),
      wordsCorrectRatio: `${correctWords} / ${totalWords}`,
      sentencesCompletedCount: completedResults.length,
      studyDurationFormatted: "6m 15s",
      metrics: {
        replays: 8,
        hintsUsed: hintsUsedCount,
        perfectSentences: perfectCount,
        sentencesWithMistakes: mistakesList.length,
      },
      breakdown: {
        correctPercent: Math.min(100, overallAccuracyPercent),
        incorrectPercent: Math.round((mistakesCount / totalWords) * 100),
        missingPercent: Math.max(0, 100 - overallAccuracyPercent - Math.round((mistakesCount / totalWords) * 100)),
      },
      mistakes: mistakesList,
    };
  }, [completedResults, hintsUsedCount, lesson.level, lesson.title]);

  return {
    currentIndex,
    totalSentences,
    currentSentence,
    typedText,
    isChecked,
    diffResult,
    hintsUsedCount,
    revealedHints,
    isCompleted,
    summaryData,
    handleType,
    revealHint,
    checkAnswer,
    nextSentence,
    skipSentence,
    restartPractice,
  };
}
