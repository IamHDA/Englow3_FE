"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  RingProgress,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconFlame,
  IconHelpCircle,
  IconRotateClockwise,
  IconTrophy,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { QuizSessionResult } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface QuizResultSummaryProps {
  result: QuizSessionResult;
  onRestart: () => void;
}

export function QuizResultSummary({
  result,
  onRestart,
}: QuizResultSummaryProps) {
  const { t } = useLanguage();
  const isPassed = result.isPassed;
  const statusColor = isPassed ? "teal" : "orange";

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return t.quiz.durationFormat
      .replace("{m}", String(m))
      .replace("{s}", String(s));
  };

  return (
    <Stack gap="xl">
      {/* Header Result Card */}
      <Card withBorder padding="xl" radius="lg" shadow="sm">
        <Stack align="center" gap="md">
          <ThemeIcon size={68} radius="xl" color={statusColor} variant="light">
            {isPassed ? <IconTrophy size={40} /> : <IconFlame size={40} />}
          </ThemeIcon>

          <Stack align="center" gap={4}>
            <Badge size="lg" variant="filled" color={statusColor}>
              {isPassed ? t.quiz.passedBadge : t.quiz.needsRetakeBadge}
            </Badge>
            <Text fz="xl" fw={800} ta="center">
              {result.quizTitle}
            </Text>
            <Text fz="sm" c="dimmed" ta="center">
              {isPassed ? t.quiz.passedMessage : t.quiz.failedMessage}
            </Text>
          </Stack>

          <Group justify="center" gap="xl" my="sm">
            <RingProgress
              size={130}
              thickness={12}
              roundCaps
              sections={[{ value: result.scorePercent, color: statusColor }]}
              label={
                <Text ta="center" fw={800} fz="xl">
                  {result.scorePercent}%
                </Text>
              }
            />

            <Stack gap="xs">
              <Group gap="xs">
                <IconCheck size={18} color="var(--mantine-color-teal-6)" />
                <Text fz="sm">
                  {t.quiz.scoreLabel}{" "}
                  <b>
                    {result.score} / {result.totalPoints} {t.quiz.pointsUnit}
                  </b>
                </Text>
              </Group>

              <Group gap="xs">
                <IconClock size={18} color="var(--mantine-color-blue-6)" />
                <Text fz="sm">
                  {t.quiz.timeSpentLabel}{" "}
                  <b>{formatTime(result.timeSpentSeconds)}</b>
                </Text>
              </Group>

              <Group gap="xs">
                <IconFlame size={18} color="var(--mantine-color-orange-6)" />
                <Text fz="sm">
                  {t.quiz.experienceLabel} <b>+{result.score * 10} XP</b>
                </Text>
              </Group>
            </Stack>
          </Group>

          <Group justify="space-between" w="100%" mt="md">
            <Button
              component={Link}
              href="/study/daily-path"
              variant="default"
              leftSection={<IconArrowLeft size={18} />}
            >
              {t.quiz.backToRoadmap}
            </Button>
            <Button
              variant="filled"
              color="indigo"
              onClick={onRestart}
              leftSection={<IconRotateClockwise size={18} />}
            >
              {t.quiz.retakeQuiz}
            </Button>
          </Group>
        </Stack>
      </Card>

      {/* Question by Question Detailed Review */}
      <Stack gap="md">
        <Text fw={700} fz="lg" c="dark.9">
          {t.quiz.detailedReviewTitle.replace(
            "{count}",
            String(result.reviews.length),
          )}
        </Text>

        {result.reviews.map((rev, idx) => (
          <Card key={rev.questionId} withBorder padding="lg" radius="md">
            <Stack gap="sm">
              <Group justify="space-between" align="flex-start">
                <Group gap="xs">
                  <Badge
                    variant="filled"
                    color={rev.isCorrect ? "teal" : "red"}
                    size="md"
                  >
                    {t.quiz.questionPrefix.replace("{n}", String(idx + 1))}{" "}
                    {rev.isCorrect
                      ? t.quiz.correctLabel
                      : t.quiz.incorrectLabel}{" "}
                    (+{rev.pointsEarned}/{rev.pointsPossible}{" "}
                    {t.quiz.pointsAbbrev})
                  </Badge>
                  <Badge variant="outline" color="gray" size="xs">
                    {rev.type}
                  </Badge>
                </Group>
              </Group>

              <Text
                fw={600}
                fz="sm"
                c="dark.9"
                style={{ whiteSpace: "pre-line" }}
              >
                {rev.prompt}
              </Text>

              <Divider my={4} />

              <Group gap="xl" wrap="wrap">
                <Box>
                  <Text fz="xs" c="dimmed" fw={700}>
                    {t.quiz.yourAnswerLabel}
                  </Text>
                  <Text
                    fz="sm"
                    fw={600}
                    c={rev.isCorrect ? "teal.8" : "red.8"}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {rev.userAnswerText}
                  </Text>
                </Box>

                {!rev.isCorrect && (
                  <Box>
                    <Text fz="xs" c="dimmed" fw={700}>
                      {t.quiz.correctAnswerLabel}
                    </Text>
                    <Text
                      fz="sm"
                      fw={600}
                      c="teal.8"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {rev.correctAnswerText}
                    </Text>
                  </Box>
                )}
              </Group>

              {/* Explanation note */}
              <Card
                withBorder
                padding="xs"
                radius="sm"
                bg="var(--mantine-color-indigo-0)"
                style={{
                  borderLeft: "4px solid var(--mantine-color-indigo-6)",
                }}
              >
                <Group gap="xs" align="flex-start" wrap="nowrap">
                  <ThemeIcon
                    variant="light"
                    color="indigo"
                    size="xs"
                    radius="xl"
                    mt={2}
                  >
                    <IconHelpCircle size={14} />
                  </ThemeIcon>
                  <Box>
                    <Text fz="xs" fw={700} c="indigo.9">
                      {t.quiz.explanationNoteLabel}
                    </Text>
                    <Text fz="xs" c="dark.8" style={{ whiteSpace: "pre-line" }}>
                      {rev.explanation}
                    </Text>
                  </Box>
                </Group>
              </Card>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
