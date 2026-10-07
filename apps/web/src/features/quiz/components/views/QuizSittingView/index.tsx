"use client";

import {
  Badge,
  Alert,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuizEngine } from "../../../hooks/useQuizEngine";
import { QuizItem } from "../../../types";
import { encodeAnswer, toQuizQuestion } from "./answerEncoding";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useQuizPaperQuery,
  useStartQuizAttemptMutation,
  useSubmitQuizAttemptMutation,
} from "@/lib/graphql/generated/hooks";
import type { SubmitQuizAttemptMutation } from "@/lib/graphql/generated/documents";
import { QuizSittingSkeleton } from "../../blocks/QuizSittingSkeleton";
import { FillBlankQuestion } from "../../blocks/FillBlankQuestion";
import { MatchingQuestion } from "../../blocks/MatchingQuestion";
import { MultipleChoiceQuestion } from "../../blocks/MultipleChoiceQuestion";
import { QuizResultSummary } from "../../blocks/QuizResultSummary";
import { QuizTimerPalette } from "../../blocks/QuizTimerPalette";
import { ReorderQuestion } from "../../blocks/ReorderQuestion";
import { RewriteQuestion } from "../../blocks/RewriteQuestion";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { Page } from "@/shared/components/Page";
import { isWellFormedId } from "@/shared/network/loadError";

interface QuizSittingViewProps {
  quizId: string;
}

type ScoredAttempt = SubmitQuizAttemptMutation["submitQuizAttempt"];
type StoredQuizProgress = {
  answers: Record<string, unknown>;
  flaggedIds: string[];
  currentIndex: number;
};

function progressKey(attemptId: string): string {
  return `englow3:quiz-progress:${attemptId}`;
}

function readProgress(attemptId: string): StoredQuizProgress | null {
  try {
    const value = sessionStorage.getItem(progressKey(attemptId));
    if (value === null) return null;
    const parsed = JSON.parse(value) as Partial<StoredQuizProgress>;
    if (
      typeof parsed.answers !== "object" ||
      parsed.answers === null ||
      !Array.isArray(parsed.flaggedIds) ||
      typeof parsed.currentIndex !== "number"
    ) {
      return null;
    }
    return {
      answers: parsed.answers,
      flaggedIds: parsed.flaggedIds,
      currentIndex: parsed.currentIndex,
    };
  } catch {
    return null;
  }
}

export function QuizSittingView({ quizId }: QuizSittingViewProps) {
  const { isVi, t } = useLanguage();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptExpiresAt, setAttemptExpiresAt] = useState<string | null>(null);
  const [scored, setScored] = useState<ScoredAttempt | null>(null);
  const [sendFailed, setSendFailed] = useState(false);
  const pending = useRef(false);

  const [startAttempt, { loading: starting, error: startError }] =
    useStartQuizAttemptMutation();
  const [
    submitAttempt,
    { loading: submitting, error: submitError, reset: resetSubmit },
  ] = useSubmitQuizAttemptMutation();

  const {
    data: paperData,
    loading: paperLoading,
    error: paperError,
    refetch: refetchPaper,
  } = useQuizPaperQuery({
    variables: { attemptId: attemptId ?? "" },
    skip: attemptId === null,
    fetchPolicy: "network-only",
  });

  const paper =
    paperData?.quizPaper?.attemptId === attemptId
      ? paperData.quizPaper
      : undefined;

  /**
   * The shape the question blocks were written against, built from the paper.
   * Its answer-key fields stay empty - the server marks now, and the paper
   * carries nothing to fill them with.
   */
  const quiz = useMemo<QuizItem>(
    () => ({
      id: paper?.quizId ?? quizId,
      title: paper?.title ?? "",
      category: "",
      level: "Intermediate",
      description: paper?.description ?? "",
      timeLimitMinutes: Math.ceil((paper?.timeLimitSeconds ?? 0) / 60),
      passingScorePercent: 0,
      questions: (paper?.questions ?? []).map(toQuizQuestion),
    }),
    [paper, quizId],
  );

  const {
    currentIndex,
    totalQuestions,
    currentQuestion,
    answers,
    flaggedIds,
    isSubmitted,
    timeRemainingFormatted,
    timeRemainingSeconds,
    setAnswer,
    restoreProgress,
    toggleFlag,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    submitQuiz,
    restartQuiz,
  } = useQuizEngine({
    quiz,
    isActive: attemptId !== null && paper !== undefined,
    expiresAt: paper?.expiresAt ?? attemptExpiresAt,
    onExpire: () => undefined,
  });

  useEffect(() => {
    if (attemptId === null || paper === undefined || isSubmitted) return;
    try {
      sessionStorage.setItem(
        progressKey(attemptId),
        JSON.stringify({ answers, flaggedIds, currentIndex }),
      );
    } catch {
      // Session storage can be unavailable in restricted browser contexts.
    }
  }, [attemptId, paper, isSubmitted, answers, flaggedIds, currentIndex]);

  const expired =
    attemptId !== null &&
    (paper?.expiresAt ?? attemptExpiresAt) !== null &&
    timeRemainingSeconds === 0 &&
    scored === null;

  /** Sends every question, including the ones left alone - a missing answer is wrong, not absent. */
  async function handleSubmit() {
    if (
      attemptId === null ||
      paper === undefined ||
      pending.current ||
      scored ||
      expired
    )
      return;
    pending.current = true;
    setSendFailed(false);

    const payload = paper.questions.map((question) => ({
      questionId: question.id,
      response: encodeAnswer(question, answers[question.id]),
    }));

    const response = await submitAttempt({
      variables: { attemptId, answers: payload },
    }).catch(() => null);

    if (response?.data) {
      resetSubmit();
      setScored(response.data.submitQuizAttempt);
      submitQuiz();
      try {
        sessionStorage.removeItem(progressKey(attemptId));
      } catch {
        // Ignore unavailable session storage.
      }
    } else {
      setSendFailed(true);
    }
    pending.current = false;
  }

  async function handleStart() {
    if (pending.current) return;
    pending.current = true;
    const response = await startAttempt({ variables: { quizId } }).catch(
      () => null,
    );
    if (response?.data) {
      const attempt = response.data.startQuizAttempt;
      const restored = readProgress(attempt.id);
      restoreProgress(
        restored ?? { answers: {}, flaggedIds: [], currentIndex: 0 },
      );
      setAttemptExpiresAt(attempt.expiresAt);
      setAttemptId(attempt.id);
    }
    pending.current = false;
  }

  async function handleRetake() {
    if (pending.current) return;
    if (attemptId !== null) {
      try {
        sessionStorage.removeItem(progressKey(attemptId));
      } catch {
        // Ignore unavailable session storage.
      }
    }
    setAttemptId(null);
    setAttemptExpiresAt(null);
    setScored(null);
    setSendFailed(false);
    resetSubmit();
    restartQuiz();
    await handleStart();
  }

  const error = startError ?? (paper === undefined ? paperError : undefined);

  // Nothing is fetched before Start, so an id that cannot name a quiz is
  // caught here; one that is well formed but missing comes back from Start as
  // NOT_FOUND and lands in the same state.
  const malformedId = !isWellFormedId(quizId);

  if (error || malformedId) {
    return (
      <Page width="focus">
        <LoadErrorState
          error={error}
          kind={malformedId ? "not-found" : undefined}
          thing={{ vi: "bài kiểm tra", en: "quiz" }}
          back={{
            href: "/study/daily-path?tab=quizzes",
            label: t.quiz.backToQuizzesButton,
          }}
          onRetry={
            attemptId === null
              ? handleStart
              : () => void refetchPaper().catch(() => undefined)
          }
        />
      </Page>
    );
  }

  // Bắt đầu bằng một thao tác rõ ràng chứ không tự chạy khi mở trang: mở lượt
  // là lúc backend bắt đầu tính giờ, nên người học phải là người bấm.
  if (attemptId === null) {
    return (
      <Page width="focus">
        <Card withBorder padding="xl" radius="md">
          <Stack gap="md" align="center">
            <Title order={2} fz="h3" ta="center">
              {t.quiz.readyToStartTitle}
            </Title>
            <Text fz="sm" c="dimmed" ta="center">
              {t.quiz.startExplanation}
            </Text>
            <Button onClick={handleStart} loading={starting} size="md">
              {t.common.start}
            </Button>
          </Stack>
        </Card>
      </Page>
    );
  }

  if (paperLoading && paper === undefined) {
    return <QuizSittingSkeleton />;
  }

  // Điểm, đáp án đúng và lời giải đều lấy từ lượt đã chấm trên server - trình
  // duyệt không còn giữ đáp án để tự tính nữa.
  if (isSubmitted && scored) {
    return (
      <Page width="focus">
        <QuizResultSummary
          result={{
            quizId: scored.quizId,
            quizTitle: scored.quizTitle,
            score: scored.score ?? 0,
            totalPoints: scored.maxScore,
            scorePercent: Math.round(scored.scorePercentage ?? 0),
            isPassed: scored.passed ?? false,
            timeSpentSeconds: scored.submittedAt
              ? Math.max(
                  0,
                  Math.round(
                    (Date.parse(scored.submittedAt) -
                      Date.parse(scored.startedAt)) /
                      1000,
                  ),
                )
              : 0,
            reviews: scored.reviews.map((review) => ({
              questionId: review.questionId,
              type: review.questionType,
              prompt: review.prompt,
              userAnswerText: review.userAnswerText,
              correctAnswerText: review.correctAnswerText,
              isCorrect: review.correct,
              pointsEarned: review.pointsEarned,
              pointsPossible: review.pointsPossible,
              explanation: review.explanation,
            })),
          }}
          onRestart={() => void handleRetake()}
        />
      </Page>
    );
  }

  if (!currentQuestion) {
    return (
      <Page width="focus">
        <Alert color="blue">
          {isVi
            ? "Bài kiểm tra chưa có câu hỏi."
            : "This quiz has no questions."}
          <Button
            component={Link}
            href="/study/daily-path?tab=quizzes"
            variant="subtle"
          >
            {isVi ? "Về danh sách" : "Back to quizzes"}
          </Button>
        </Alert>
      </Page>
    );
  }

  return (
    <Page>
      <Stack gap="lg">
        {(sendFailed || submitError) && !expired && (
          <Alert color="red" role="alert">
            {isVi
              ? "Chưa nộp được bài. Đáp án vẫn được giữ trên trang; kiểm tra kết nối rồi bấm nộp lại."
              : "Submission failed. Your answers are kept on this page; check your connection and submit again."}
          </Alert>
        )}
        {expired && (
          <Alert color="orange" role="alert">
            {isVi
              ? "Lượt làm bài đã hết hạn. Máy chủ không nhận bài nộp muộn. Bạn có thể bắt đầu lượt mới."
              : "This attempt has expired. Late submissions are not accepted. You can start a new attempt."}
            <Button
              variant="subtle"
              disabled={submitting}
              onClick={() => void handleRetake()}
            >
              {isVi ? "Bắt đầu lượt mới" : "Start a new attempt"}
            </Button>
          </Alert>
        )}
        {/* Top Header */}
        <Group justify="space-between" align="center">
          <Button
            component={Link}
            href="/study/daily-path"
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
          >
            {t.quiz.exitQuizButton}
          </Button>

          <Stack gap={2} align="center">
            <Text fw={700} fz="sm" c="dark.9">
              {quiz.title}
            </Text>
            <Badge variant="light" color="indigo" size="xs">
              {quiz.category}
            </Badge>
          </Stack>

          <Box style={{ width: 120 }} />
        </Group>

        <Grid gap="md">
          {/* Main Question Area (8 cols) */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder padding="xl" radius="md">
              <Stack gap="lg">
                {/* Question Info Header */}
                <Group justify="space-between" align="center">
                  <Badge variant="filled" color="indigo" size="lg">
                    {t.quiz.questionPositionLabel
                      .replace("{current}", String(currentIndex + 1))
                      .replace("{total}", String(totalQuestions))}
                  </Badge>

                  <Group gap="xs">
                    <Badge variant="outline" color="gray" size="sm">
                      {currentQuestion.type}
                    </Badge>
                    <Badge variant="dot" color="teal" size="sm">
                      {currentQuestion.points} {t.quiz.pointsUnit}
                    </Badge>
                  </Group>
                </Group>

                <Title order={4} fw={700} c="dark.9">
                  {currentQuestion.title}
                </Title>

                {/* Question Renderer by Type */}
                <Box
                  component="fieldset"
                  disabled={submitting || expired}
                  style={{ border: 0, margin: 0, minWidth: 0 }}
                  py="xs"
                >
                  {currentQuestion.type === "MULTIPLE_CHOICE" && (
                    <MultipleChoiceQuestion
                      question={currentQuestion}
                      selectedOptionId={
                        answers[currentQuestion.id] as string | undefined
                      }
                      onSelectOption={(val) =>
                        setAnswer(currentQuestion.id, val)
                      }
                    />
                  )}

                  {currentQuestion.type === "FILL_BLANK" && (
                    <FillBlankQuestion
                      question={currentQuestion}
                      value={answers[currentQuestion.id] as string | undefined}
                      onChange={(val) => setAnswer(currentQuestion.id, val)}
                    />
                  )}

                  {currentQuestion.type === "REWRITE" && (
                    <RewriteQuestion
                      question={currentQuestion}
                      selectedWords={
                        answers[currentQuestion.id] as string[] | undefined
                      }
                      onChange={(words) => setAnswer(currentQuestion.id, words)}
                    />
                  )}

                  {currentQuestion.type === "REORDER" && (
                    <ReorderQuestion
                      question={currentQuestion}
                      orderedWords={
                        answers[currentQuestion.id] as string[] | undefined
                      }
                      onChange={(words) => setAnswer(currentQuestion.id, words)}
                    />
                  )}

                  {currentQuestion.type === "MATCHING" && (
                    <MatchingQuestion
                      question={currentQuestion}
                      userPairs={
                        answers[currentQuestion.id] as
                          Record<string, string> | undefined
                      }
                      onChange={(pairs) => setAnswer(currentQuestion.id, pairs)}
                    />
                  )}
                </Box>

                {/* Prev / Next Navigation */}
                <Group justify="space-between" mt="md">
                  <Button
                    variant="default"
                    size="sm"
                    disabled={currentIndex === 0}
                    onClick={prevQuestion}
                    leftSection={<IconChevronLeft size={16} />}
                  >
                    {t.quiz.prevQuestion}
                  </Button>

                  <Button
                    variant="filled"
                    color="indigo"
                    size="sm"
                    disabled={currentIndex === totalQuestions - 1}
                    onClick={nextQuestion}
                    rightSection={<IconChevronRight size={16} />}
                  >
                    {t.quiz.nextQuestion}
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Palette & Timer Sidebar (4 cols) */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <QuizTimerPalette
              questions={quiz.questions}
              currentIndex={currentIndex}
              answers={answers}
              flaggedIds={flaggedIds}
              timeRemainingFormatted={timeRemainingFormatted}
              timeRemainingSeconds={timeRemainingSeconds}
              onSelectQuestion={jumpToQuestion}
              onToggleFlag={toggleFlag}
              onSubmit={handleSubmit}
              submitting={submitting || expired}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Page>
  );
}
