"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QuestionReview, QuizItem, QuizSessionResult } from "../types";

export interface UseQuizEngineOptions {
  quiz: QuizItem;
  onComplete?: (result: QuizSessionResult) => void;
}

export function useQuizEngine({ quiz, onComplete }: UseQuizEngineOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimitMinutes * 60);

  const answersRef = useRef(answers);
  const timeRemainingRef = useRef(timeRemaining);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  const currentQuestion = useMemo(() => {
    return quiz.questions[currentIndex] || null;
  }, [quiz.questions, currentIndex]);

  const setAnswer = useCallback((questionId: string, val: unknown) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: val,
    }));
  }, []);

  const toggleFlag = useCallback((questionId: string) => {
    setFlaggedIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  }, []);

  const handleSubmit = useCallback(() => {
    const currentAnswers = answersRef.current;
    const currentTimeRemaining = timeRemainingRef.current;
    let totalScore = 0;
    let maxPoints = 0;
    const reviews: QuestionReview[] = [];

    quiz.questions.forEach((q) => {
      maxPoints += q.points;
      const userAns = currentAnswers[q.id];
      let isCorrect = false;
      let userAnsText = "";
      let correctAnsText = "";

      switch (q.type) {
        case "MULTIPLE_CHOICE": {
          isCorrect = userAns === q.correctOptionId;
          const chosen = q.mcOptions?.find((o) => o.id === userAns);
          const right = q.mcOptions?.find((o) => o.id === q.correctOptionId);
          userAnsText = chosen ? `${chosen.label}. ${chosen.text}` : "(Chưa chọn)";
          correctAnsText = right ? `${right.label}. ${right.text}` : "";
          break;
        }

        case "FILL_BLANK": {
          const cleanUser = String(userAns || "").trim().toLowerCase();
          const matches = q.acceptedAnswers?.some(
            (ans) => ans.trim().toLowerCase() === cleanUser
          );
          isCorrect = !!matches;
          userAnsText = userAns ? String(userAns) : "(Chưa điền)";
          correctAnsText = q.acceptedAnswers?.join(" / ") || "";
          break;
        }

        case "REWRITE": {
          const userWords: string[] = Array.isArray(userAns) ? (userAns as string[]) : [];
          const correctWords = q.correctRewriteWords || [];
          isCorrect =
            userWords.length === correctWords.length &&
            userWords.every(
              (w, i) => w.toLowerCase() === correctWords[i]?.toLowerCase()
            );
          userAnsText = userWords.length > 0 ? userWords.join(" ") : "(Chưa hoàn thành)";
          correctAnsText = correctWords.join(" ");
          break;
        }

        case "REORDER": {
          const userWords: string[] = Array.isArray(userAns) ? (userAns as string[]) : [];
          const correctWords = q.correctOrderWords || [];
          isCorrect =
            userWords.length === correctWords.length &&
            userWords.every(
              (w, i) => w.toLowerCase() === correctWords[i]?.toLowerCase()
            );
          userAnsText = userWords.length > 0 ? userWords.join(" ") : "(Chưa sắp xếp)";
          correctAnsText = correctWords.join(" ");
          break;
        }

        case "MATCHING": {
          const pairs = q.matchingPairs || [];
          const userPairs = (userAns as Record<string, string>) || {};
          let matchesCount = 0;
          pairs.forEach((p) => {
            if (userPairs[p.left] === p.right) {
              matchesCount += 1;
            }
          });
          isCorrect = matchesCount === pairs.length && pairs.length > 0;
          userAnsText = `Đúng ${matchesCount}/${pairs.length} cặp`;
          correctAnsText = pairs.map((p) => `${p.left} ➔ ${p.right}`).join("\n");
          break;
        }
      }

      const pointsEarned = isCorrect ? q.points : 0;
      totalScore += pointsEarned;

      reviews.push({
        questionId: q.id,
        type: q.type,
        prompt: q.prompt,
        userAnswerText: userAnsText,
        correctAnswerText: correctAnsText,
        isCorrect,
        pointsEarned,
        pointsPossible: q.points,
        explanation: q.explanation,
      });
    });

    const scorePercent = Math.round((totalScore / maxPoints) * 100) || 0;
    const isPassed = scorePercent >= quiz.passingScorePercent;
    const timeSpent = quiz.timeLimitMinutes * 60 - currentTimeRemaining;

    const result: QuizSessionResult = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      score: totalScore,
      totalPoints: maxPoints,
      scorePercent,
      isPassed,
      timeSpentSeconds: Math.max(timeSpent, 0),
      reviews,
    };

    setIsSubmitted(true);
    onComplete?.(result);
  }, [quiz, onComplete]);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, handleSubmit]);

  const restartQuiz = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setFlaggedIds([]);
    setIsSubmitted(false);
    setTimeRemaining(quiz.timeLimitMinutes * 60);
  }, [quiz.timeLimitMinutes]);

  const formatTimer = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const answeredCount = useMemo(() => {
    return Object.keys(answers).filter((k) => {
      const val = answers[k];
      if (!val) return false;
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === "object") return Object.keys(val).length > 0;
      return true;
    }).length;
  }, [answers]);

  return {
    currentIndex,
    totalQuestions: quiz.questions.length,
    currentQuestion,
    answers,
    flaggedIds,
    isSubmitted,
    timeRemainingFormatted: formatTimer(timeRemaining),
    timeRemainingSeconds: timeRemaining,
    answeredCount,
    setAnswer,
    toggleFlag,
    nextQuestion: () => setCurrentIndex((prev) => Math.min(prev + 1, quiz.questions.length - 1)),
    prevQuestion: () => setCurrentIndex((prev) => Math.max(prev - 1, 0)),
    jumpToQuestion: (idx: number) => setCurrentIndex(idx),
    submitQuiz: handleSubmit,
    restartQuiz,
  };
}
