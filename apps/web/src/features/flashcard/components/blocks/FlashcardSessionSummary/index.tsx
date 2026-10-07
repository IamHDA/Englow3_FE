"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
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
  IconRotateClockwise,
  IconTrophy,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { FlashcardSessionSummaryData } from "../../../types";

interface FlashcardSessionSummaryProps {
  summary: FlashcardSessionSummaryData;
  onRestart: () => void;
}

export function FlashcardSessionSummary({
  summary,
  onRestart,
}: FlashcardSessionSummaryProps) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const getFeedback = (accuracy: number) => {
    if (accuracy >= 85)
      return {
        text: tr(
          "Xuất sắc! Trí nhớ của bạn rất tuyệt vời.",
          "Excellent! Your memory is in great shape.",
        ),
        color: "teal",
      };
    if (accuracy >= 65)
      return {
        text: tr(
          "Khá tốt! Hãy tiếp tục duy trì chuỗi học này.",
          "Good work! Keep the streak going.",
        ),
        color: "blue",
      };
    return {
      text: tr(
        "Cần luyện tập thêm! Hãy ôn lại những từ chưa nhớ nhé.",
        "Needs more practice - review the words you missed.",
      ),
      color: "orange",
    };
  };

  const feedback = getFeedback(summary.accuracyPercent);

  return (
    <Card
      withBorder
      padding="xl"
      radius="lg"
      shadow="sm"
      style={{ maxWidth: 640, margin: "0 auto" }}
    >
      <Stack align="center" gap="md">
        <ThemeIcon size={64} radius="xl" color="yellow" variant="light">
          <IconTrophy size={36} />
        </ThemeIcon>

        <Stack align="center" gap={4}>
          <Badge size="lg" variant="dot" color={feedback.color}>
            {tr("HOÀN THÀNH PHIÊN HỌC", "SESSION COMPLETE")}
          </Badge>
          <Text fz="xl" fw={700} ta="center">
            {summary.setName}
          </Text>
          <Text fz="sm" c="dimmed" ta="center">
            {feedback.text}
          </Text>
        </Stack>

        <Group justify="center" gap="xl" my="md">
          <RingProgress
            size={120}
            thickness={10}
            roundCaps
            sections={[
              { value: summary.accuracyPercent, color: feedback.color },
            ]}
            label={
              <Text ta="center" fw={700} fz="lg">
                {summary.accuracyPercent}%
              </Text>
            }
          />
          <Stack gap="xs">
            <Group gap="xs">
              <IconCheck size={18} color="var(--mantine-color-teal-6)" />
              <Text fz="sm">
                {tr("Đã ôn tập", "Reviewed")}:{" "}
                <b>
                  {summary.totalReviewed} {tr("từ", "words")}
                </b>
              </Text>
            </Group>
            <Group gap="xs">
              <IconClock size={18} color="var(--mantine-color-blue-6)" />
              <Text fz="sm">
                {tr("Thời gian học", "Study time")}:{" "}
                <b>{summary.studyDurationFormatted}</b>
              </Text>
            </Group>
            <Group gap="xs">
              <IconFlame size={18} color="var(--mantine-color-orange-6)" />
              <Text fz="sm">
                {tr("Điểm kinh nghiệm", "Experience")}:{" "}
                <b>+{summary.totalReviewed * 5} XP</b>
              </Text>
            </Group>
          </Stack>
        </Group>

        {/* Breakdown Breakdown */}
        <Box w="100%">
          <Text fz="xs" fw={700} c="dimmed" mb="xs">
            {tr("CHI TIẾT PHÂN BỔ ĐÁNH GIÁ:", "RATING BREAKDOWN:")}
          </Text>
          <Grid gap="xs">
            <Grid.Col span={3}>
              <Card withBorder padding="xs" radius="sm" ta="center" bg="red.0">
                <Text fz="xs" c="red.9" fw={600}>
                  {tr("Chưa nhớ", "Again")}
                </Text>
                <Text fz="lg" fw={700} c="red.8">
                  {summary.breakdown.again}
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card
                withBorder
                padding="xs"
                radius="sm"
                ta="center"
                bg="orange.0"
              >
                <Text fz="xs" c="orange.9" fw={600}>
                  {tr("Khó nhớ", "Hard")}
                </Text>
                <Text fz="lg" fw={700} c="orange.8">
                  {summary.breakdown.hard}
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card withBorder padding="xs" radius="sm" ta="center" bg="blue.0">
                <Text fz="xs" c="blue.9" fw={600}>
                  {tr("Nhớ tốt", "Good")}
                </Text>
                <Text fz="lg" fw={700} c="blue.8">
                  {summary.breakdown.good}
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card withBorder padding="xs" radius="sm" ta="center" bg="teal.0">
                <Text fz="xs" c="teal.9" fw={600}>
                  {tr("Rất dễ", "Easy")}
                </Text>
                <Text fz="lg" fw={700} c="teal.8">
                  {summary.breakdown.easy}
                </Text>
              </Card>
            </Grid.Col>
          </Grid>
        </Box>

        {/* Actions */}
        <Group mt="lg" w="100%" justify="space-between">
          <Button
            component={Link}
            href="/study/flashcards"
            variant="default"
            leftSection={<IconArrowLeft size={18} />}
          >
            {tr("Về danh sách", "Back to sets")}
          </Button>
          <Button
            variant="filled"
            color="indigo"
            onClick={onRestart}
            leftSection={<IconRotateClockwise size={18} />}
          >
            {tr("Luyện tập lại", "Practise again")}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
