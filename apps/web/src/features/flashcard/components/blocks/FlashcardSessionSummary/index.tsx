"use client";

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
  const getFeedback = (accuracy: number) => {
    if (accuracy >= 85) return { text: "Xuất sắc! Trí nhớ của bạn rất tuyệt vời.", color: "teal" };
    if (accuracy >= 65) return { text: "Khá tốt! Hãy tiếp tục duy trì chuỗi học này.", color: "blue" };
    return { text: "Cần luyện tập thêm! Hãy ôn lại những từ chưa nhớ nhé.", color: "orange" };
  };

  const feedback = getFeedback(summary.accuracyPercent);

  return (
    <Card withBorder padding="xl" radius="lg" shadow="sm" style={{ maxWidth: 640, margin: "0 auto" }}>
      <Stack align="center" gap="md">
        <ThemeIcon size={64} radius="xl" color="yellow" variant="light">
          <IconTrophy size={36} />
        </ThemeIcon>

        <Stack align="center" gap={4}>
          <Badge size="lg" variant="dot" color={feedback.color}>
            HOÀN THÀNH PHIÊN HỌC
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
            sections={[{ value: summary.accuracyPercent, color: feedback.color }]}
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
                Đã ôn tập: <b>{summary.totalReviewed} từ</b>
              </Text>
            </Group>
            <Group gap="xs">
              <IconClock size={18} color="var(--mantine-color-blue-6)" />
              <Text fz="sm">
                Thời gian học: <b>{summary.studyDurationFormatted}</b>
              </Text>
            </Group>
            <Group gap="xs">
              <IconFlame size={18} color="var(--mantine-color-orange-6)" />
              <Text fz="sm">
                Điểm kinh nghiệm: <b>+{summary.totalReviewed * 5} XP</b>
              </Text>
            </Group>
          </Stack>
        </Group>

        {/* Breakdown Breakdown */}
        <Box w="100%">
          <Text fz="xs" fw={700} c="dimmed" mb="xs">
            CHI TIẾT PHÂN BỔ ĐÁNH GIÁ:
          </Text>
          <Grid gap="xs">
            <Grid.Col span={3}>
              <Card withBorder padding="xs" radius="sm" ta="center" bg="red.0">
                <Text fz="xs" c="red.9" fw={600}>
                  Chưa nhớ
                </Text>
                <Text fz="lg" fw={700} c="red.8">
                  {summary.breakdown.again}
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card withBorder padding="xs" radius="sm" ta="center" bg="orange.0">
                <Text fz="xs" c="orange.9" fw={600}>
                  Khó nhớ
                </Text>
                <Text fz="lg" fw={700} c="orange.8">
                  {summary.breakdown.hard}
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card withBorder padding="xs" radius="sm" ta="center" bg="blue.0">
                <Text fz="xs" c="blue.9" fw={600}>
                  Nhớ tốt
                </Text>
                <Text fz="lg" fw={700} c="blue.8">
                  {summary.breakdown.good}
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card withBorder padding="xs" radius="sm" ta="center" bg="teal.0">
                <Text fz="xs" c="teal.9" fw={600}>
                  Rất dễ
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
            Về danh sách
          </Button>
          <Button
            variant="filled"
            color="indigo"
            onClick={onRestart}
            leftSection={<IconRotateClockwise size={18} />}
          >
            Luyện tập lại
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
