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
import { useQuizEngine } from "../../../hooks/useQuizEngine";
import { QuizItem } from "../../../types";
import { FillBlankQuestion } from "../../blocks/FillBlankQuestion";
import { MatchingQuestion } from "../../blocks/MatchingQuestion";
import { MultipleChoiceQuestion } from "../../blocks/MultipleChoiceQuestion";
import { QuizResultSummary } from "../../blocks/QuizResultSummary";
import { QuizTimerPalette } from "../../blocks/QuizTimerPalette";
import { ReorderQuestion } from "../../blocks/ReorderQuestion";
import { RewriteQuestion } from "../../blocks/RewriteQuestion";

import { useLanguage } from "@/shared/hooks/useLanguage";

interface QuizSittingViewProps {
  quiz: QuizItem;
}

export function QuizSittingView({ quiz }: QuizSittingViewProps) {
  const { isVi } = useLanguage();
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

  // If submitted, show results review
  if (isSubmitted) {
    const computeResults = () => {
      let totalScore = 0;
      let maxPoints = 0;
      const reviews = quiz.questions.map((q) => {
        let isCorrect = false;
        const userAns = answers[q.id];
        let userAnsText = "";
        let correctAnsText = "";

        if (q.type === "MULTIPLE_CHOICE") {
          const opt = q.mcOptions?.find((o) => o.id === userAns);
          const correctOpt = q.mcOptions?.find((o) => o.id === q.correctOptionId);
          userAnsText = opt ? `${opt.label}. ${opt.text}` : isVi ? "(Chưa chọn)" : "(No selection)";
          correctAnsText = correctOpt ? `${correctOpt.label}. ${correctOpt.text}` : "";
          isCorrect = userAns === q.correctOptionId;
        } else if (q.type === "FILL_BLANK") {
          userAnsText = (userAns as string) || (isVi ? "(Chưa điền)" : "(Empty)");
          correctAnsText = q.acceptedAnswers?.join(" / ") || "";
          isCorrect =
            String(userAns || "").trim().toLowerCase() === String(q.acceptedAnswers?.[0] || "").trim().toLowerCase();
        } else if (q.type === "REWRITE") {
          const words = (userAns as string[]) || [];
          userAnsText = words.join(" ") || (isVi ? "(Chưa viết)" : "(Empty)");
          correctAnsText = q.correctRewriteWords?.join(" ") || "";
          isCorrect =
            userAnsText.trim().toLowerCase() === correctAnsText.trim().toLowerCase();
        } else if (q.type === "REORDER") {
          const words = (userAns as string[]) || [];
          userAnsText = words.join(" ") || (isVi ? "(Chưa sắp xếp)" : "(Empty)");
          correctAnsText = q.correctOrderWords?.join(" ") || "";
          isCorrect =
            userAnsText.trim().toLowerCase() === correctAnsText.trim().toLowerCase();
        } else if (q.type === "MATCHING") {
          const userPairs = (userAns as Record<string, string>) || {};
          const correctPairs = q.matchingPairs || [];
          let matches = 0;
          correctPairs.forEach((pair) => {
            if (userPairs[pair.left] === pair.right) {
              matches++;
            }
          });
          userAnsText = isVi ? `${matches}/${correctPairs.length} cặp đúng` : `${matches}/${correctPairs.length} correct pairs`;
          correctAnsText = isVi ? `${correctPairs.length}/${correctPairs.length} cặp` : `${correctPairs.length}/${correctPairs.length} pairs`;
          isCorrect = matches === correctPairs.length;
        }

        const pointsEarned = isCorrect ? q.points : 0;
        totalScore += pointsEarned;
        maxPoints += q.points;

        return {
          questionId: q.id,
          type: q.type,
          prompt: q.prompt,
          userAnswerText: userAnsText,
          correctAnswerText: correctAnsText,
          isCorrect,
          pointsEarned,
          pointsPossible: q.points,
          explanation: q.explanation,
        };
      });

      const scorePercent = Math.round((totalScore / maxPoints) * 100) || 0;
      const isPassed = scorePercent >= quiz.passingScorePercent;
      const timeSpent = quiz.timeLimitMinutes * 60 - timeRemainingSeconds;

      return {
        totalScore,
        maxPoints,
        scorePercent,
        isPassed,
        timeSpent,
        reviews,
      };
    };

    const sessionResult = computeResults();

    return (
      <Container size="md" py="xl">
        <QuizResultSummary
          result={{
            quizId: quiz.id,
            quizTitle: quiz.title,
            score: sessionResult.totalScore,
            totalPoints: sessionResult.maxPoints,
            scorePercent: sessionResult.scorePercent,
            isPassed: sessionResult.isPassed,
            timeSpentSeconds: Math.max(sessionResult.timeSpent, 0),
            reviews: sessionResult.reviews,
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
                      selectedOptionId={answers[currentQuestion.id] as string | undefined}
                      onSelectOption={(val) => setAnswer(currentQuestion.id, val)}
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
                      selectedWords={answers[currentQuestion.id] as string[] | undefined}
                      onChange={(words) => setAnswer(currentQuestion.id, words)}
                    />
                  )}

                  {currentQuestion.type === "REORDER" && (
                    <ReorderQuestion
                      question={currentQuestion}
                      orderedWords={answers[currentQuestion.id] as string[] | undefined}
                      onChange={(words) => setAnswer(currentQuestion.id, words)}
                    />
                  )}

                  {currentQuestion.type === "MATCHING" && (
                    <MatchingQuestion
                      question={currentQuestion}
                      userPairs={answers[currentQuestion.id] as Record<string, string> | undefined}
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
              onSubmit={submitQuiz}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
