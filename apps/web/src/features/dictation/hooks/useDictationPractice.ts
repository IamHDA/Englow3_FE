"use client";

import { useCallback, useMemo, useState } from "react";
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
      if (!currentSentence) return null;

      const submission = await checkSentence(currentSentence.id, answer);
      if (!submission) return null;

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
    [currentSentence, checkSentence],
  );

  const checkAnswer = useCallback(async () => {
    const diff = await recordAnswer(typedText);
    if (!diff) return;
    setDiffResult(diff);
    setIsChecked(true);
  }, [recordAnswer, typedText]);

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

  // Bỏ qua vẫn là một lần trả lời - ghi lại chuỗi rỗng để lịch sử phản ánh đúng
  // những câu người học né, chứ không phải những câu họ chưa gặp.
  const skipSentence = useCallback(async () => {
    await recordAnswer("");
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
        missingPercent: Math.max(
          0,
          100 -
            overallAccuracyPercent -
            Math.round((mistakesCount / totalWords) * 100),
        ),
      },
      mistakes: mistakesList,
    };
  }, [completedResults, hintsUsedCount, lesson.targetLevel, lesson.title]);

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
  };
}
