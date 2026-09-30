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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const pending = useRef(false);
  const startedAt = useRef<number | null>(null);
  const [studySeconds, setStudySeconds] = useState(0);
  useEffect(() => {
    if (lesson.id) startedAt.current = Date.now();
  }, [lesson.id]);

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

  const handleType = useCallback((value: string) => {
    startedAt.current ??= Date.now();
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

  /**
   * Chấm bài. Con số là của server; `computeWordDiff` ở đây chỉ để tô màu chỗ
   * sai trên transcript vừa nhận về, nên hai bên không thể nói khác nhau.
   */
  const recordAnswer = useCallback(
    async (answer: string) => {
      if (!currentSentence || pending.current || isCompleted) return null;
      pending.current = true;
      setSubmitting(true);
      setSubmitError(false);
      startedAt.current ??= Date.now();
      try {
        const submission = await checkSentence(currentSentence.id, answer);
        if (!submission) throw new Error("Submission unavailable");
        setStudySeconds(Math.floor((Date.now() - startedAt.current) / 1000));

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
      } catch {
        setSubmitError(true);
        return null;
      } finally {
        pending.current = false;
        setSubmitting(false);
      }
    },
    [currentSentence, checkSentence, isCompleted],
  );

  const checkAnswer = useCallback(async () => {
    const diff = await recordAnswer(typedText);
    if (!diff) return;
    setDiffResult(diff);
    setIsChecked(true);
  }, [recordAnswer, typedText]);

  const nextSentence = useCallback(() => {
    if (pending.current) return;
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

  // Bỏ qua vẫn là một lần trả lời - ghi lại chuỗi rỗng để lịch sử phản ánh đúng
  // những câu người học né, chứ không phải những câu họ chưa gặp.
  const skipSentence = useCallback(async () => {
    if (await recordAnswer("")) nextSentence();
  }, [recordAnswer, nextSentence]);

  const restartPractice = useCallback(() => {
    if (pending.current) return;
    startedAt.current = Date.now();
    setStudySeconds(0);
    setSubmitError(false);
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
      studyDurationFormatted: `${Math.floor(studySeconds / 60)}m ${studySeconds % 60}s`,
      metrics: {
        replays: 0,
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
    hintsUsedCount,
    lesson.targetLevel,
    lesson.title,
    studySeconds,
  ]);

  const retrySentence = useCallback(() => {
    if (pending.current) return;
    setIsChecked(false);
    setDiffResult(null);
    setTypedText("");
    setSubmitError(false);
  }, []);

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
    retrySentence,
    submitting,
    submitError,
  };
}
