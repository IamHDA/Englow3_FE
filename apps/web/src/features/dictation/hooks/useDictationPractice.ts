"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { computeProgressiveFeedback, computeWordDiff } from "../utils/diff";
import type {
  DictationLesson,
  DictationSentence,
  DictationSessionSummaryData,
  DiffResult,
} from "../types";

/**
 * Ghi một lần trả lời lên server. Trả về `true` khi server đã nhận. Hook không
 * tự gọi Apollo: nó không biết gì về BFF, và giữ nguyên như vậy thì còn test
 * được mà không cần mock schema.
 */
type RecordAttempt = (sentenceId: string, typed: string) => Promise<boolean>;

/** Số lần thử ghi một câu trước khi báo là chưa lưu được. */
const SAVE_ATTEMPTS = 3;
/** Một câu đúng hoàn toàn dừng lại chừng này để người học thấy, rồi sang câu tiếp. */
const AUTO_ADVANCE_MS = 900;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds}s`;
}

type Unsaved = { sentenceId: string; answer: string };

/**
 * Luyện một bài nghe chép. Chấm ngay trên trình duyệt: câu đã có transcript
 * từ lúc mở bài, nên Enter cho kết quả tức thì, không chờ mạng. Server vẫn là
 * nơi lưu: mỗi lần chấm được gửi nền, server chấm lại từ transcript của nó và
 * chỉ điểm đó mới được ghi. Gửi hỏng không làm mất câu trả lời hay chặn người
 * học - nó hiện thành cảnh báo "chưa lưu" kèm nút thử lại.
 */
export function useDictationPractice(
  lesson: DictationLesson,
  sentences: DictationSentence[],
  recordAttempt: RecordAttempt,
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [feedbackAnswer, setFeedbackAnswer] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [replayCount, setReplayCountState] = useState(0);
  const [clockStarted, setClockStarted] = useState(false);
  const [unsaved, setUnsaved] = useState<Unsaved[]>([]);
  const [savingCount, setSavingCount] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const cancelAdvance = useCallback(() => {
    if (advanceTimer.current !== null) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);
  useEffect(() => cancelAdvance, [cancelAdvance]);

  // Per-sentence recorded results
  const [completedResults, setCompletedResults] = useState<
    Array<{
      sentence: DictationSentence;
      learnerAnswer: string;
      correctText: string;
      translationVi: string | null;
      diff: DiffResult;
    }>
  >([]);

  const currentSentence = useMemo(() => {
    return sentences[currentIndex] || sentences[0];
  }, [sentences, currentIndex]);

  const totalSentences = sentences.length;

  /** Gửi nền một câu, thử lại vài lần; hỏng hẳn thì ghi vào danh sách chưa lưu. */
  const persist = useCallback(
    async (sentenceId: string, answer: string) => {
      setSavingCount((count) => count + 1);
      let saved = false;
      for (let attempt = 0; attempt < SAVE_ATTEMPTS && !saved; attempt++) {
        saved = await recordAttempt(sentenceId, answer).catch(() => false);
        if (!saved && attempt + 1 < SAVE_ATTEMPTS) {
          await wait(600 * (attempt + 1));
        }
      }
      setSavingCount((count) => count - 1);
      setUnsaved((list) => {
        const rest = list.filter(
          (item) => !(item.sentenceId === sentenceId && item.answer === answer),
        );
        return saved ? rest : [...rest, { sentenceId, answer }];
      });
    },
    [recordAttempt],
  );

  const retrySaving = useCallback(() => {
    for (const item of unsaved) void persist(item.sentenceId, item.answer);
  }, [unsaved, persist]);

  /** Giữ gợi ý lần chấm trước trong lúc người học bổ sung câu trả lời. */
  const handleType = useCallback(
    (value: string) => {
      startClock();
      cancelAdvance();
      setTypedText(value);
      if (isChecked) {
        setFeedbackAnswer(null);
        setDiffResult(null);
      }
      setIsChecked(false);
    },
    [startClock, cancelAdvance, isChecked],
  );

  /** Chấm một câu trả lời trên trình duyệt, ghi vào kết quả phiên và gửi nền lên server. */
  const gradeAndRecord = useCallback(
    (answer: string): DiffResult | null => {
      if (!currentSentence || isCompleted) return null;
      startClock();
      const diff = computeWordDiff(currentSentence.text, answer);
      setCompletedResults((prev) => [
        ...prev.filter((r) => r.sentence.id !== currentSentence.id),
        {
          sentence: currentSentence,
          learnerAnswer: answer,
          correctText: currentSentence.text,
          translationVi: currentSentence.translationVi ?? null,
          diff,
        },
      ]);
      void persist(currentSentence.id, answer);
      return diff;
    },
    [currentSentence, isCompleted, startClock, persist],
  );

  const nextSentence = useCallback(() => {
    cancelAdvance();
    if (currentIndex + 1 < totalSentences) {
      setCurrentIndex((prev) => prev + 1);
      setTypedText("");
      setIsChecked(false);
      setDiffResult(null);
      setFeedbackAnswer(null);
    } else {
      if (startedAtRef.current !== null) {
        setElapsedSeconds(
          Math.floor((Date.now() - startedAtRef.current) / 1000),
        );
      }
      setIsCompleted(true);
    }
  }, [currentIndex, totalSentences, cancelAdvance]);

  const nextRef = useRef(nextSentence);
  useEffect(() => {
    nextRef.current = nextSentence;
  }, [nextSentence]);

  const checkAnswer = useCallback(() => {
    if (!typedText.trim()) return;
    if (typedText === feedbackAnswer) return;
    const diff = gradeAndRecord(typedText);
    if (!diff) return;
    setFeedbackAnswer(typedText);
    setDiffResult(diff);
    setIsChecked(diff.mistakesCount === 0);
    // Đúng hết thì không còn gì để xem lại: sang câu kế sau một nhịp ngắn.
    if (diff.mistakesCount === 0) {
      cancelAdvance();
      advanceTimer.current = setTimeout(
        () => nextRef.current(),
        AUTO_ADVANCE_MS,
      );
    }
  }, [typedText, feedbackAnswer, gradeAndRecord, cancelAdvance]);

  /** Enter: chưa chấm thì chấm; đã chấm mà chưa sửa gì thì sang câu kế. */
  const submitOrAdvance = useCallback(() => {
    if (isChecked) nextSentence();
    else checkAnswer();
  }, [isChecked, nextSentence, checkAnswer]);

  // Bỏ qua vẫn là một lần trả lời - ghi lại chuỗi rỗng để lịch sử phản ánh đúng
  // những câu người học né, chứ không phải những câu họ chưa gặp.
  const skipSentence = useCallback(() => {
    if (!gradeAndRecord("")) return;
    nextSentence();
  }, [gradeAndRecord, nextSentence]);

  const restartPractice = useCallback(() => {
    cancelAdvance();
    setCurrentIndex(0);
    setTypedText("");
    setIsChecked(false);
    setDiffResult(null);
    setFeedbackAnswer(null);
    setCompletedResults([]);
    setIsCompleted(false);
    setElapsedSeconds(0);
    setReplayCountState(0);
    setClockStarted(false);
    startedAtRef.current = null;
  }, [cancelAdvance]);

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
        sentenceNumber: r.sentence.orderNo || i + 1,
        accuracyPercent: r.diff.accuracyPercent,
        learnerAnswer: r.learnerAnswer,
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
    lesson.targetLevel,
    lesson.title,
    replayCount,
  ]);

  const progressiveFeedback = useMemo(
    () =>
      currentSentence && feedbackAnswer !== null
        ? computeProgressiveFeedback(currentSentence.text, feedbackAnswer)
        : null,
    [currentSentence, feedbackAnswer],
  );

  return {
    currentIndex,
    totalSentences,
    currentSentence,
    typedText,
    isChecked,
    /** Đúng hết và đang chuyển sang câu kế - khoá ô nhập trong nhịp ngắn đó. */
    isAdvancing: isChecked && diffResult?.mistakesCount === 0,
    /** Số lần chấm chưa gửi xong lên server (đang gửi hoặc đã hỏng). */
    unsavedCount: unsaved.length,
    isSaving: savingCount > 0,
    retrySaving,
    setReplayCount: updateReplayCount,
    startSession: startClock,
    diffResult,
    progressiveFeedback,
    isCompleted,
    summaryData,
    handleType,
    checkAnswer,
    submitOrAdvance,
    nextSentence,
    skipSentence,
    restartPractice,
  };
}
