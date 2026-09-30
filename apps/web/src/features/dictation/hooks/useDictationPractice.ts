"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { computeWordDiff } from "../utils/diff";
import type {
  DictationLesson,
  DictationSentence,
  DictationSessionSummaryData,
  DictationSubmission,
  DiffResult,
} from "../types";

/**
 * Gửi một câu lên server và nhận lại điểm kèm transcript. Hook không tự gọi
 * Apollo: nó không biết gì về BFF, và giữ nguyên như vậy thì còn test được mà
 * không cần mock schema.
 */
type CheckSentence = (
  sentenceId: string,
  typed: string,
) => Promise<DictationSubmission | null>;

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds}s`;
}

export function useDictationPractice(
  lesson: DictationLesson,
  sentences: DictationSentence[],
  checkSentence: CheckSentence,
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>(
    {},
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [replayCount, setReplayCountState] = useState(0);
  const [clockStarted, setClockStarted] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const clearSubmissionError = useCallback(() => setSubmissionError(false), []);
  const updateReplayCount = useCallback(
    (count: number) => setReplayCountState(count),
    [],
  );

  const startClock = useCallback(() => {
    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
      setClockStarted(true);
    }
  }, []);

  useEffect(() => {
    if (!clockStarted || isCompleted) return;
    const timer = setInterval(() => {
      const startedAt = startedAtRef.current;
      if (startedAt !== null) {
        setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [clockStarted, isCompleted]);

  // Per-sentence recorded results
  const [completedResults, setCompletedResults] = useState<
    Array<{
      sentence: DictationSentence;
      learnerAnswer: string;
      correctText: string;
      diff: DiffResult;
    }>
  >([]);

  const currentSentence = useMemo(() => {
    return sentences[currentIndex] || sentences[0];
  }, [sentences, currentIndex]);

  const totalSentences = sentences.length;

  const handleType = useCallback(
    (value: string) => {
      startClock();
      setTypedText(value);
    },
    [startClock],
  );

  const revealHint = useCallback(
    (hintKey: string) => {
      startClock();
      setRevealedHints((prev) => {
        if (!prev[hintKey]) {
          setHintsUsedCount((c) => c + 1);
          return { ...prev, [hintKey]: true };
        }
        return prev;
      });
    },
    [startClock],
  );

  /**
   * Chấm bài. Con số là của server; `computeWordDiff` ở đây chỉ để tô màu chỗ
   * sai trên transcript vừa nhận về, nên hai bên không thể nói khác nhau.
   */
  const recordAnswer = useCallback(
    async (answer: string) => {
      if (!currentSentence) return null;
      startClock();
      setSubmissionError(false);
      setIsSubmitting(true);
      let submission: DictationSubmission | null;
      try {
        submission = await checkSentence(currentSentence.id, answer);
      } catch {
        submission = null;
      } finally {
        setIsSubmitting(false);
      }
      if (!submission) {
        setSubmissionError(true);
        return null;
      }

      const diff: DiffResult = {
        ...computeWordDiff(submission.correctText, answer),
        accuracyPercent: Math.round(submission.accuracyPercent),
        correctWordsCount: submission.correctWordCount,
        totalWordsCount: submission.totalWordCount,
      };

      setCompletedResults((prev) => [
        ...prev.filter((r) => r.sentence.id !== currentSentence.id),
        {
          sentence: currentSentence,
          learnerAnswer: answer,
          correctText: submission.correctText,
          diff,
        },
      ]);

      return diff;
    },
    [currentSentence, checkSentence, startClock],
  );

  const checkAnswer = useCallback(async () => {
    const diff = await recordAnswer(typedText);
    if (!diff) return;
    setDiffResult(diff);
    setIsChecked(true);
  }, [recordAnswer, typedText]);

  const tryAgain = useCallback(() => {
    setTypedText("");
    setIsChecked(false);
    setDiffResult(null);
    setSubmissionError(false);
  }, []);

  const nextSentence = useCallback(() => {
    if (currentIndex + 1 < totalSentences) {
      setCurrentIndex((prev) => prev + 1);
      setTypedText("");
      setIsChecked(false);
      setDiffResult(null);
      setRevealedHints({});
    } else {
      if (startedAtRef.current !== null) {
        setElapsedSeconds(
          Math.floor((Date.now() - startedAtRef.current) / 1000),
        );
      }
      setIsCompleted(true);
    }
  }, [currentIndex, totalSentences]);

  // Bỏ qua vẫn là một lần trả lời - ghi lại chuỗi rỗng để lịch sử phản ánh đúng
  // những câu người học né, chứ không phải những câu họ chưa gặp.
  const skipSentence = useCallback(async () => {
    const result = await recordAnswer("");
    if (!result) return;
    nextSentence();
  }, [recordAnswer, nextSentence]);

  const restartPractice = useCallback(() => {
    setCurrentIndex(0);
    setTypedText("");
    setIsChecked(false);
    setDiffResult(null);
    setHintsUsedCount(0);
    setRevealedHints({});
    setCompletedResults([]);
    setIsCompleted(false);
    setIsSubmitting(false);
    setSubmissionError(false);
    setElapsedSeconds(0);
    setReplayCountState(0);
    setClockStarted(false);
    startedAtRef.current = null;
  }, []);

  // Summary computed data
  const summaryData: DictationSessionSummaryData = useMemo(() => {
    const totalWords =
      completedResults.reduce((acc, r) => acc + r.diff.totalWordsCount, 0) || 1;
    const correctWords = completedResults.reduce(
      (acc, r) => acc + r.diff.correctWordsCount,
      0,
    );
    const mistakesCount = completedResults.reduce(
      (acc, r) => acc + r.diff.mistakesCount,
      0,
    );

    const overallAccuracyPercent = Math.round(
      (correctWords / totalWords) * 100,
    );
    const perfectCount = completedResults.filter(
      (r) => r.diff.mistakesCount === 0,
    ).length;

    const mistakesList = completedResults
      .filter((r) => r.diff.mistakesCount > 0)
      .map((r, i) => ({
        id: r.sentence.id,
        sentenceLabel: `Sentence ${r.sentence.orderNo || i + 1}`,
        accuracyPercent: r.diff.accuracyPercent,
        learnerAnswer: r.learnerAnswer || "(Bỏ qua)",
        correctAnswer: r.correctText,
      }));

    return {
      lessonTitle: lesson.title,
      lessonLevel: lesson.targetLevel ?? "",
      overallAccuracyPercent: Math.max(
        0,
        Math.min(100, overallAccuracyPercent),
      ),
      wordsCorrectRatio: `${correctWords} / ${totalWords}`,
      sentencesCompletedCount: completedResults.length,
      studyDurationFormatted: formatDuration(elapsedSeconds),
      metrics: {
        replays: replayCount,
        hintsUsed: hintsUsedCount,
        perfectSentences: perfectCount,
        sentencesWithMistakes: mistakesList.length,
      },
      breakdown: {
        correctPercent: Math.min(100, overallAccuracyPercent),
        incorrectPercent: Math.round((mistakesCount / totalWords) * 100),
        missingPercent: Math.max(
          0,
          100 -
            overallAccuracyPercent -
            Math.round((mistakesCount / totalWords) * 100),
        ),
      },
      mistakes: mistakesList,
    };
  }, [
    completedResults,
    elapsedSeconds,
    hintsUsedCount,
    lesson.targetLevel,
    lesson.title,
    replayCount,
  ]);

  /** Transcript của câu vừa chấm. Rỗng cho tới khi người học nộp - đó là cả ý đồ. */
  const currentCorrectText =
    completedResults.find((r) => r.sentence.id === currentSentence?.id)
      ?.correctText ?? "";

  return {
    currentIndex,
    totalSentences,
    currentSentence,
    currentCorrectText,
    typedText,
    isChecked,
    isSubmitting,
    submissionError,
    clearSubmissionError,
    setReplayCount: updateReplayCount,
    startSession: startClock,
    diffResult,
    hintsUsedCount,
    revealedHints,
    isCompleted,
    summaryData,
    handleType,
    revealHint,
    checkAnswer,
    tryAgain,
    nextSentence,
    skipSentence,
    restartPractice,
  };
}
