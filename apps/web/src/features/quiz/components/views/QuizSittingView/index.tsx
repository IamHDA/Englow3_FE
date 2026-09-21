"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Container,
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
import { useMemo, useState } from "react";
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

interface QuizSittingViewProps {
  quizId: string;
}

type ScoredAttempt = SubmitQuizAttemptMutation["submitQuizAttempt"];

export function QuizSittingView({ quizId }: QuizSittingViewProps) {
  const { isVi } = useLanguage();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [scored, setScored] = useState<ScoredAttempt | null>(null);

  const [startAttempt, { loading: starting, error: startError }] =
    useStartQuizAttemptMutation();
  const [submitAttempt, { loading: submitting, error: submitError }] =
    useSubmitQuizAttemptMutation();

  const {
    data: paperData,
    loading: paperLoading,
    error: paperError,
  } = useQuizPaperQuery({
    variables: { attemptId: attemptId ?? "" },
    skip: attemptId === null,
    fetchPolicy: "network-only",
  });

  const paper = paperData?.quizPaper;

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
      timeLimitMinutes: Math.round((paper?.timeLimitSeconds ?? 0) / 60),
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
    toggleFlag,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    submitQuiz,
    restartQuiz,
  } = useQuizEngine({ quiz });

  /** Sends every question, including the ones left alone - a missing answer is wrong, not absent. */
  async function handleSubmit() {
    if (attemptId === null || paper === undefined) return;

    const payload = paper.questions.map((question) => ({
      questionId: question.id,
      response: encodeAnswer(question, answers[question.id]),
    }));

    const response = await submitAttempt({
      variables: { attemptId, answers: payload },
    }).catch(() => null);

    if (response?.data) {
      setScored(response.data.submitQuizAttempt);
      submitQuiz();
    }
  }

  async function handleStart() {
    const response = await startAttempt({ variables: { quizId } }).catch(
      () => null,
    );
    if (response?.data) {
      setAttemptId(response.data.startQuizAttempt.id);
    }
  }

  const error = startError ?? paperError ?? submitError;

  if (error) {
    return (
      <Container size="md" py="xl">
        <Stack align="center" gap="md" py={60}>
          <Text fw={700} c="dark.9">
            {isVi ? "Không tải được bài kiểm tra" : "Could not load the quiz"}
          </Text>
          <Text fz="sm" c="dimmed" ta="center">
            {isVi
              ? "Kiểm tra kết nối tới backend rồi thử lại."
              : "Check the backend connection and try again."}
          </Text>
          <Button component={Link} href="/study/daily-path" variant="default">
            {isVi ? "Quay lại lộ trình" : "Back to the path"}
          </Button>
        </Stack>
      </Container>
    );
  }

  // Bắt đầu bằng một thao tác rõ ràng chứ không tự chạy khi mở trang: mở lượt
  // là lúc backend bắt đầu tính giờ, nên người học phải là người bấm.
  if (attemptId === null) {
    return (
      <Container size="sm" py="xl">
        <Card withBorder padding="xl" radius="md">
          <Stack gap="md" align="center">
            <Title order={2} fz="h3" ta="center">
              {isVi ? "Sẵn sàng làm bài?" : "Ready to start?"}
            </Title>
            <Text fz="sm" c="dimmed" ta="center">
              {isVi
                ? "Đồng hồ bắt đầu chạy ngay khi bạn bấm. Bấm lại lần nữa sẽ quay về đúng lượt đang dở, không tạo lượt mới."
                : "The clock starts when you press. Pressing again returns to the same attempt rather than opening a new one."}
            </Text>
            <Button onClick={handleStart} loading={starting} size="md">
              {isVi ? "Bắt đầu" : "Start"}
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  if (paperLoading && paper === undefined) {
    return <QuizSittingSkeleton />;
  }

  // Điểm, đáp án đúng và lời giải đều lấy từ lượt đã chấm trên server - trình
  // duyệt không còn giữ đáp án để tự tính nữa.
  if (isSubmitted && scored) {
    return (
      <Container size="md" py="xl">
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
          onRestart={restartQuiz}
        />
      </Container>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
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
            {isVi ? "Thoát bài kiểm tra" : "Exit Quiz"}
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
                    {isVi
                      ? `Câu hỏi ${currentIndex + 1} / ${totalQuestions}`
                      : `Question ${currentIndex + 1} of ${totalQuestions}`}
                  </Badge>

                  <Group gap="xs">
                    <Badge variant="outline" color="gray" size="sm">
                      {currentQuestion.type}
                    </Badge>
                    <Badge variant="dot" color="teal" size="sm">
                      {currentQuestion.points} {isVi ? "điểm" : "pts"}
                    </Badge>
                  </Group>
                </Group>

                <Title order={4} fw={700} c="dark.9">
                  {currentQuestion.title}
                </Title>

                {/* Question Renderer by Type */}
                <Box py="xs">
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
                    {isVi ? "Câu trước" : "Previous"}
                  </Button>

                  <Button
                    variant="filled"
                    color="indigo"
                    size="sm"
                    disabled={currentIndex === totalQuestions - 1}
                    onClick={nextQuestion}
                    rightSection={<IconChevronRight size={16} />}
                  >
                    {isVi ? "Câu tiếp theo" : "Next"}
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
              submitting={submitting}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
