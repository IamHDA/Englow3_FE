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

export function QuizResultSummary({ result, onRestart }: QuizResultSummaryProps) {
  const { isVi } = useLanguage();
  const isPassed = result.isPassed;
  const statusColor = isPassed ? "teal" : "orange";

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return isVi ? `${m} phút ${s} giây` : `${m}m ${s}s`;
  };

  return (
    <Stack gap="xl">
      {/* Header Result Card */}
      <Card withBorder padding="xl" radius="lg" shadow="sm">
        <Stack align="center" gap="md">
          <ThemeIcon
            size={68}
            radius="xl"
            color={statusColor}
            variant="light"
          >
            {isPassed ? <IconTrophy size={40} /> : <IconFlame size={40} />}
          </ThemeIcon>

          <Stack align="center" gap={4}>
            <Badge size="lg" variant="filled" color={statusColor}>
              {isPassed
                ? isVi ? "ĐẠT YÊU CẦU" : "PASSED"
                : isVi ? "CHƯA ĐẠT" : "NEEDS RETAKE"}
            </Badge>
            <Text fz="xl" fw={800} ta="center">
              {result.quizTitle}
            </Text>
            <Text fz="sm" c="dimmed" ta="center">
              {isPassed
                ? isVi
                  ? "Chúc mừng bạn đã vượt qua bài kiểm tra với số điểm ấn tượng!"
                  : "Congratulations! You have passed the quiz with a great score."
                : isVi
                  ? "Bạn chưa đạt điểm tối thiểu để mở khóa bài tiếp theo. Hãy xem lại lời giải chi tiết bên dưới nhé!"
                  : "You have not reached the passing score for this quiz. Review the explanations below and try again!"}
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
                  {isVi ? "Điểm số:" : "Score:"} <b>{result.score} / {result.totalPoints} {isVi ? "điểm" : "pts"}</b>
                </Text>
              </Group>

              <Group gap="xs">
                <IconClock size={18} color="var(--mantine-color-blue-6)" />
                <Text fz="sm">
                  {isVi ? "Thời gian làm:" : "Time spent:"} <b>{formatTime(result.timeSpentSeconds)}</b>
                </Text>
              </Group>

              <Group gap="xs">
                <IconFlame size={18} color="var(--mantine-color-orange-6)" />
                <Text fz="sm">
                  {isVi ? "Kinh nghiệm:" : "Experience:"} <b>+{result.score * 10} XP</b>
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
              {isVi ? "Về Lộ trình học" : "Back to Daily Path"}
            </Button>
            <Button
              variant="filled"
              color="indigo"
              onClick={onRestart}
              leftSection={<IconRotateClockwise size={18} />}
            >
              {isVi ? "Làm lại bài kiểm tra" : "Retake Quiz"}
            </Button>
          </Group>
        </Stack>
      </Card>

      {/* Question by Question Detailed Review */}
      <Stack gap="md">
        <Text fw={700} fz="lg" c="dark.9">
          {isVi
            ? `Xem lại đáp án & Giải thích chi tiết (${result.reviews.length} câu)`
            : `Detailed Review & Explanations (${result.reviews.length} questions)`}
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
                    {isVi ? `Câu ${idx + 1}:` : `Question ${idx + 1}:`} {rev.isCorrect ? (isVi ? "Đúng" : "Correct") : (isVi ? "Sai" : "Incorrect")} (+{rev.pointsEarned}/{rev.pointsPossible} {isVi ? "đ" : "pts"})
                  </Badge>
                  <Badge variant="outline" color="gray" size="xs">
                    {rev.type}
                  </Badge>
                </Group>
              </Group>

              <Text fw={600} fz="sm" c="dark.9" style={{ whiteSpace: "pre-line" }}>
                {rev.prompt}
              </Text>

              <Divider my={4} />

              <Group gap="xl" wrap="wrap">
                <Box>
                  <Text fz="xs" c="dimmed" fw={700}>
                    {isVi ? "CÂU TRẢ LỜI CỦA BẠN:" : "YOUR ANSWER:"}
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
                      {isVi ? "ĐÁP ÁN CHÍNH XÁC:" : "CORRECT ANSWER:"}
                    </Text>
                    <Text fz="sm" fw={600} c="teal.8" style={{ whiteSpace: "pre-line" }}>
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
                style={{ borderLeft: "4px solid var(--mantine-color-indigo-6)" }}
              >
                <Group gap="xs" align="flex-start" wrap="nowrap">
                  <ThemeIcon variant="light" color="indigo" size="xs" radius="xl" mt={2}>
                    <IconHelpCircle size={14} />
                  </ThemeIcon>
                  <Box>
                    <Text fz="xs" fw={700} c="indigo.9">
                      {isVi ? "GIẢI THÍCH NGỮ PHÁP / KIẾN THỨC:" : "EXPLANATION & GRAMMAR NOTE:"}
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
