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
  IconBrain,
  IconCheck,
  IconFlame,
  IconInfoCircle,
  IconRotateClockwise,
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";
import React, { useState } from "react";
import { PhonemeScoreDetail, PronunciationEvaluationResult } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface PronunciationScoreCardProps {
  evaluation: PronunciationEvaluationResult;
  onRetry: () => void;
}

export function PronunciationScoreCard({
  evaluation,
  onRetry,
}: PronunciationScoreCardProps) {
  const { isVi } = useLanguage();
  const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeScoreDetail | null>(
    evaluation.phonemeScores[0] || null
  );

  const getScoreColor = (score: number) => {
    if (score >= 85) return "teal";
    if (score >= 70) return "blue";
    if (score >= 55) return "orange";
    return "red";
  };

  const overallColor = getScoreColor(evaluation.overallScore);

  return (
    <Card withBorder padding="xl" radius="lg" shadow="sm">
      <Stack gap="lg">
        {/* Header Overview */}
        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="md">
            <RingProgress
              size={110}
              thickness={10}
              roundCaps
              sections={[{ value: evaluation.overallScore, color: overallColor }]}
              label={
                <Text ta="center" fw={800} fz="xl">
                  {evaluation.overallScore}
                </Text>
              }
            />
            <Stack gap={2}>
              <Badge variant="filled" color={overallColor} size="md">
                {evaluation.overallScore >= 80
                  ? isVi ? "ĐẠT CHUẨN BẢN XỨ" : "NATIVE LEVEL"
                  : isVi ? "CẦN LUYỆN TẬP THÊM" : "NEEDS PRACTICE"}
              </Badge>
              <Text fw={800} fz="lg" c="dark.9">
                {isVi
                  ? `Điểm phát âm tổng thể: ${evaluation.overallScore}/100`
                  : `Overall Pronunciation Score: ${evaluation.overallScore}/100`}
              </Text>
              <Text fz="xs" c="dimmed">
                {evaluation.feedbackMessage}
              </Text>
            </Stack>
          </Group>

          <Group gap="xs">
            <Button
              variant="default"
              size="sm"
              onClick={onRetry}
              leftSection={<IconRotateClockwise size={16} />}
            >
              {isVi ? "Thu âm lại" : "Record Again"}
            </Button>
            <Button
              component={Link}
              href="/study/pronunciation"
              variant="filled"
              color="indigo"
              size="sm"
              leftSection={<IconArrowLeft size={16} />}
            >
              {isVi ? "Về thư viện" : "Back to Library"}
            </Button>
          </Group>
        </Group>

        {/* 3 Metric Sub-Cards */}
        <Grid gap="md">
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder padding="md" radius="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Text fz="xs" c="dimmed" fw={600}>
                    {isVi ? "ĐỘ CHÍNH XÁC ÂM VỊ" : "PHONEME ACCURACY"}
                  </Text>
                  <Text fz="xl" fw={800} c="dark.9">
                    {evaluation.accuracyScore}%
                  </Text>
                  <Text fz={10} c="dimmed">
                    {isVi ? "Khẩu hình & vị trí lưỡi" : "Mouth shape & articulation"}
                  </Text>
                </Stack>
                <ThemeIcon variant="light" color="teal" size="md" radius="md">
                  <IconCheck size={18} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder padding="md" radius="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Text fz="xs" c="dimmed" fw={600}>
                    {isVi ? "ĐỘ LƯU LOÁT & NỐI ÂM" : "FLUENCY & LINKING"}
                  </Text>
                  <Text fz="xl" fw={800} c="dark.9">
                    {evaluation.fluencyScore}%
                  </Text>
                  <Text fz={10} c="dimmed">
                    {isVi ? "Tốc độ & nhịp ngắt nghỉ" : "Speech pace & rhythm"}
                  </Text>
                </Stack>
                <ThemeIcon variant="light" color="indigo" size="md" radius="md">
                  <IconFlame size={18} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder padding="md" radius="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Text fz="xs" c="dimmed" fw={600}>
                    {isVi ? "NGỮ ĐIỆU & TRỌNG ÂM" : "INTONATION & STRESS"}
                  </Text>
                  <Text fz="xl" fw={800} c="dark.9">
                    {evaluation.intonationScore}%
                  </Text>
                  <Text fz={10} c="dimmed">
                    {isVi ? "Độ lên xuống tự nhiên" : "Natural pitch contour"}
                  </Text>
                </Stack>
                <ThemeIcon variant="light" color="blue" size="md" radius="md">
                  <IconSparkles size={18} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Phoneme Breakdown Chips */}
        <Stack gap="xs">
          <Text fz="xs" fw={700} c="dimmed">
            {isVi
              ? "CHI TIẾT TỪNG ÂM VỊ — Bấm vào âm vị để xem hướng dẫn sửa lỗi:"
              : "PHONEME BREAKDOWN — Click a phoneme to view correction tips:"}
          </Text>

          <Group gap="xs" wrap="wrap">
            {evaluation.phonemeScores.map((ph, idx) => {
              const isSelected = selectedPhoneme?.phoneme === ph.phoneme;
              const color =
                ph.status === "good"
                  ? "teal"
                  : ph.status === "warning"
                  ? "orange"
                  : "red";

              return (
                <Button
                  key={idx}
                  variant={isSelected ? "filled" : "light"}
                  color={color}
                  size="sm"
                  radius="md"
                  onClick={() => setSelectedPhoneme(ph)}
                >
                  <Group gap={6}>
                    <Text fw={800}>{ph.phoneme}</Text>
                    <Badge size="xs" variant="white" c={`${color}.8`}>
                      {ph.score}%
                    </Badge>
                  </Group>
                </Button>
              );
            })}
          </Group>

          {/* Selected Phoneme Hint Box */}
          {selectedPhoneme && (
            <Card
              withBorder
              padding="sm"
              radius="md"
              bg="var(--mantine-color-indigo-0)"
              mt={4}
            >
              <Group gap="xs" align="flex-start" wrap="nowrap">
                <ThemeIcon variant="light" color="indigo" size="sm" radius="xl" mt={2}>
                  <IconInfoCircle size={16} />
                </ThemeIcon>
                <Box>
                  <Text fz="xs" fw={700} c="indigo.9">
                    {isVi
                      ? `HƯỚNG DẪN ĐIỀU CHỈNH CHO ÂM ${selectedPhoneme.phoneme} (${selectedPhoneme.score}%):`
                      : `CORRECTION GUIDE FOR /${selectedPhoneme.phoneme}/ (${selectedPhoneme.score}%):`}
                  </Text>
                  <Text fz="xs" c="dark.8">
                    {selectedPhoneme.hint}
                  </Text>
                </Box>
              </Group>
            </Card>
          )}
        </Stack>

        {/* AI Coaching Advice */}
        <Card
          withBorder
          padding="md"
          radius="md"
          bg="var(--mantine-color-teal-0)"
          style={{ borderLeft: "4px solid var(--mantine-color-teal-6)" }}
        >
          <Group gap="sm" align="flex-start" wrap="nowrap">
            <ThemeIcon variant="filled" color="teal" size="md" radius="xl" mt={2}>
              <IconBrain size={18} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text fz="xs" fw={700} c="teal.9">
                {isVi ? "LỜI KHUYÊN TỪ TRỢ LÝ PHÁT ÂM AI:" : "AI PRONUNCIATION COACH ADVICE:"}
              </Text>
              <Text fz="sm" c="dark.8">
                {evaluation.aiCoachingTip}
              </Text>
            </Stack>
          </Group>
        </Card>
      </Stack>
    </Card>
  );
}
