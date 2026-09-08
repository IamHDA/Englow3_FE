"use client";

import {
  Badge,
  Button,
  Card,
  Flex,
  Grid,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { DictationSessionSummaryData } from "../../../types";

interface DictationSessionSummaryProps {
  summary: DictationSessionSummaryData;
  onRestart: () => void;
  onReviewMistakes: () => void;
}

export function DictationSessionSummary({
  summary,
  onRestart,
  onReviewMistakes,
}: DictationSessionSummaryProps) {
  const { isVi } = useLanguage();

  const kpiCards = [
    {
      label: isVi ? "Độ chính xác tổng quan" : "Overall Accuracy",
      value: `${summary.overallAccuracyPercent}%`,
      icon: Trophy,
      color: "orange",
    },
    {
      label: isVi ? "Số từ gõ đúng" : "Words Correct",
      value: summary.wordsCorrectRatio,
      icon: CheckCircle2,
      color: "teal",
    },
    {
      label: isVi ? "Câu đã hoàn thành" : "Sentences Completed",
      value: `${summary.sentencesCompletedCount}`,
      icon: Sparkles,
      color: "navy",
    },
    {
      label: isVi ? "Thời gian luyện tập" : "Study Duration",
      value: summary.studyDurationFormatted,
      icon: Clock,
      color: "ink.7",
    },
  ];

  return (
    <Stack gap="lg">
      {/* Hero Completion Banner */}
      <Paper
        radius="lg"
        p={{ base: "lg", sm: "xl" }}
        withBorder
        style={{
          background: "linear-gradient(135deg, #1B2540 0%, #2A4CA8 100%)",
          color: "#FFFFFF",
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Stack gap={4}>
            <Badge color="teal" variant="filled" size="sm" radius="sm">
              {isVi ? "Đã hoàn thành phiên học" : "Session Completed"}
            </Badge>
            <Title order={2} size="h2" fw={700} style={{ color: "#FFFFFF" }}>
              {isVi
                ? "Hoàn thành bài luyện nghe chép chính tả!"
                : "Dictation Session Completed!"}
            </Title>
            <Text size="sm" style={{ color: "#C5CBD7" }}>
              {summary.sentencesCompletedCount} {isVi ? "câu" : "sentences"} ·{" "}
              {summary.lessonTitle} ({summary.lessonLevel})
            </Text>
          </Stack>

          <Group gap="sm">
            <Button
              variant="white"
              color="navy"
              size="sm"
              radius="md"
              onClick={onRestart}
              leftSection={<RotateCcw size={15} />}
              fw={600}
            >
              {isVi ? "Luyện tập lại" : "Practice Again"}
            </Button>
            {summary.mistakes.length > 0 && (
              <Button
                variant="filled"
                color="orange"
                size="sm"
                radius="md"
                onClick={onReviewMistakes}
                rightSection={<ArrowRight size={15} />}
                fw={600}
              >
                {isVi
                  ? `Luyện câu sai (${summary.mistakes.length})`
                  : `Review Mistakes (${summary.mistakes.length})`}
              </Button>
            )}
          </Group>
        </Group>
      </Paper>

      {/* 4 KPI Cards */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        {kpiCards.map((c, i) => (
          <Paper key={i} radius="md" p="md" withBorder bg="white">
            <Group justify="space-between" align="flex-start" mb="xs">
              <Text size="xs" fw={600} c="ink.6">
                {c.label}
              </Text>
              <ThemeIcon size={28} radius="md" variant="light" color={c.color}>
                <c.icon size={16} />
              </ThemeIcon>
            </Group>
            <Title order={3} size="h3" fw={700} c="ink.9">
              {c.value}
            </Title>
          </Paper>
        ))}
      </SimpleGrid>

      {/* 2-Column Metrics & Breakdown */}
      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper radius="md" p="lg" withBorder bg="white" style={{ height: "100%" }}>
            <Stack gap="md">
              <Title order={4} size="h5" fw={700} c="ink.9">
                {isVi ? "Chi tiết phiên học" : "Session Metrics"}
              </Title>

              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="ink.6">
                    {isVi ? "Số lần nghe lại:" : "Audio Replays:"}
                  </Text>
                  <Text size="sm" fw={700} c="ink.9">
                    {summary.metrics.replays} {isVi ? "lần" : "times"}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="ink.6">
                    {isVi ? "Số gợi ý đã dùng:" : "Hints Utilized:"}
                  </Text>
                  <Text size="sm" fw={700} c="orange.8">
                    {summary.metrics.hintsUsed} {isVi ? "gợi ý" : "hints"}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="ink.6">
                    {isVi ? "Câu chuẩn xác 100%:" : "100% Accurate Sentences:"}
                  </Text>
                  <Text size="sm" fw={700} c="teal.8">
                    {summary.metrics.perfectSentences} / {summary.sentencesCompletedCount} {isVi ? "câu" : "sentences"}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="ink.6">
                    {isVi ? "Câu có từ chưa chuẩn:" : "Sentences with Mistakes:"}
                  </Text>
                  <Text size="sm" fw={700} c="warn.8">
                    {summary.metrics.sentencesWithMistakes} {isVi ? "câu" : "sentences"}
                  </Text>
                </Group>
              </Stack>

              <Title order={4} size="h5" fw={700} c="ink.9" mt="xs">
                {isVi ? "Phân bổ độ chính xác" : "Accuracy Breakdown"}
              </Title>
              <Progress.Root size="xl" radius="xl">
                <Progress.Section
                  value={summary.breakdown.correctPercent}
                  color="teal"
                  title={isVi ? "Từ gõ đúng" : "Correct"}
                >
                  <Progress.Label>{summary.breakdown.correctPercent}%</Progress.Label>
                </Progress.Section>
                <Progress.Section
                  value={summary.breakdown.incorrectPercent}
                  color="warn"
                  title={isVi ? "Từ gõ sai" : "Incorrect"}
                >
                  {summary.breakdown.incorrectPercent > 5 && (
                    <Progress.Label>{summary.breakdown.incorrectPercent}%</Progress.Label>
                  )}
                </Progress.Section>
                <Progress.Section
                  value={summary.breakdown.missingPercent}
                  color="orange"
                  title={isVi ? "Từ còn thiếu" : "Missing"}
                >
                  {summary.breakdown.missingPercent > 5 && (
                    <Progress.Label>{summary.breakdown.missingPercent}%</Progress.Label>
                  )}
                </Progress.Section>
              </Progress.Root>

              <Group gap="md">
                <Group gap={4}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "var(--mantine-color-teal-6)",
                    }}
                  />
                  <Text size="xs" c="ink.6">
                    {isVi ? "Đúng" : "Correct"}: {summary.breakdown.correctPercent}%
                  </Text>
                </Group>
                <Group gap={4}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "var(--mantine-color-warn-6)",
                    }}
                  />
                  <Text size="xs" c="ink.6">
                    {isVi ? "Sai" : "Incorrect"}: {summary.breakdown.incorrectPercent}%
                  </Text>
                </Group>
                <Group gap={4}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "var(--mantine-color-orange-6)",
                    }}
                  />
                  <Text size="xs" c="ink.6">
                    {isVi ? "Thiếu" : "Missing"}: {summary.breakdown.missingPercent}%
                  </Text>
                </Group>
              </Group>
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Sentences with Mistakes */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper radius="md" p="lg" withBorder bg="white" style={{ height: "100%" }}>
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Title order={4} size="h5" fw={700} c="ink.9">
                  {isVi
                    ? `Các câu có lỗi cần ôn tập (${summary.mistakes.length})`
                    : `Sentences to Review (${summary.mistakes.length})`}
                </Title>
                {summary.mistakes.length > 0 && (
                  <Button
                    variant="light"
                    color="orange"
                    size="xs"
                    radius="md"
                    onClick={onReviewMistakes}
                  >
                    {isVi ? "Bắt đầu ôn tập câu sai" : "Review Mistakes"}
                  </Button>
                )}
              </Group>

              {summary.mistakes.length === 0 ? (
                <Card radius="md" p="lg" withBorder bg="teal.0" style={{ textAlign: "center" }}>
                  <Text size="sm" c="teal.9" fw={600}>
                    {isVi
                      ? "Tuyệt vời! Bạn không mắc phải lỗi nào trong bài học này."
                      : "Awesome! You completed this session with zero mistakes."}
                  </Text>
                </Card>
              ) : (
                <Stack gap="xs">
                  {summary.mistakes.map((m) => (
                    <Paper key={m.id} radius="md" p="sm" withBorder bg="ink.0">
                      <Group justify="space-between" align="flex-start" mb={4}>
                        <Badge size="xs" variant="outline" color="navy">
                          {m.sentenceLabel}
                        </Badge>
                        <Badge size="xs" color="warn" variant="light">
                          {m.accuracyPercent}%
                        </Badge>
                      </Group>
                      <Stack gap={2}>
                        <Text size="xs" c="ink.6">
                          {isVi ? "Bạn đã gõ:" : "Your Input:"}{" "}
                          <span style={{ color: "var(--mantine-color-warn-8)", fontWeight: 600 }}>
                            “{m.learnerAnswer}”
                          </span>
                        </Text>
                        <Text size="xs" c="ink.6">
                          {isVi ? "Đáp án đúng:" : "Correct Answer:"}{" "}
                          <span style={{ color: "var(--mantine-color-teal-8)", fontWeight: 600 }}>
                            “{m.correctAnswer}”
                          </span>
                        </Text>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Footer Navigation CTA */}
      <Paper radius="md" p="md" withBorder bg="white">
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align="center"
          gap="sm"
        >
          <Button
            component={Link}
            href="/study/dictation"
            variant="default"
            size="sm"
            radius="md"
            leftSection={<ArrowLeft size={15} />}
          >
            {isVi ? "Về danh sách bài học" : "Back to Lesson Catalog"}
          </Button>

          <Group gap="xs">
            <Button
              variant="default"
              size="sm"
              radius="md"
              onClick={onRestart}
              leftSection={<RotateCcw size={15} />}
            >
              {isVi ? "Luyện lại từ đầu" : "Practice Again"}
            </Button>
            {summary.mistakes.length > 0 && (
              <Button
                variant="filled"
                color="orange"
                size="sm"
                radius="md"
                onClick={onReviewMistakes}
                rightSection={<ArrowRight size={15} />}
                fw={600}
              >
                {isVi
                  ? `Luyện câu sai (${summary.mistakes.length})`
                  : `Review Mistakes (${summary.mistakes.length})`}
              </Button>
            )}
          </Group>
        </Flex>
      </Paper>
    </Stack>
  );
}
