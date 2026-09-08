"use client";

import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBrain,
  IconCalendarTime,
  IconFlame,
  IconPlayerPlay,
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface FlashcardHeroCardProps {
  dueCount: number;
  streakDays: number;
  retentionPercent: number;
  primarySetSlug: string;
}

export function FlashcardHeroCard({
  dueCount,
  streakDays,
  retentionPercent,
  primarySetSlug,
}: FlashcardHeroCardProps) {
  const { isVi } = useLanguage();

  return (
    <Card
      withBorder
      padding="xl"
      radius="lg"
      style={{
        background: "linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)",
        color: "#ffffff",
      }}
    >
      <Grid align="center" gap="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="sm">
            <Group gap="xs">
              <Badge variant="filled" color="white" c="indigo.8" size="sm" fw={700}>
                {isVi ? "LẶP LẠI NGẮT QUÃNG" : "SPACED REPETITION"}
              </Badge>
              <Group gap={4}>
                <IconFlame size={18} color="#FDE047" />
                <Text fz="xs" fw={700} c="yellow.2">
                  {isVi
                    ? `Chuỗi ${streakDays} ngày liên tiếp`
                    : `${streakDays}-day streak`}
                </Text>
              </Group>
            </Group>

            <Text fz={{ base: 22, sm: 26 }} fw={800} lh={1.2}>
              {isVi
                ? `Hôm nay bạn có ${dueCount} thẻ đến hạn cần ôn tập!`
                : `You have ${dueCount} cards due for review today!`}
            </Text>

            <Text fz="sm" c="indigo.1" maw={520}>
              {isVi
                ? "Thuật toán SRS tính toán đường cong quên lãng để tối ưu thời điểm ôn lại trước khi kiến thức bị phai mờ."
                : "The SRS algorithm calculates your forgetting curve to optimize review timing before memory fades."}
            </Text>

            <Group mt="xs">
              <Button
                component={Link}
                href={`/study/flashcards/${primarySetSlug}/study`}
                size="md"
                variant="white"
                color="indigo"
                radius="md"
                fw={700}
                leftSection={<IconPlayerPlay size={18} />}
              >
                {isVi
                  ? `Bắt đầu ôn ngay (${dueCount} thẻ)`
                  : `Start Review (${dueCount} cards)`}
              </Button>
            </Group>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack
            gap="xs"
            p="md"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(8px)",
              borderRadius: "var(--mantine-radius-md)",
            }}
          >
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon variant="white" color="indigo" size="sm" radius="xl">
                  <IconCalendarTime size={14} />
                </ThemeIcon>
                <Text fz="xs" fw={600} c="white">
                  {isVi ? "Thẻ đến hạn hôm nay:" : "Due today:"}
                </Text>
              </Group>
              <Text fz="sm" fw={800} c="white">
                {dueCount} {isVi ? "thẻ" : "cards"}
              </Text>
            </Group>

            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon variant="white" color="indigo" size="sm" radius="xl">
                  <IconBrain size={14} />
                </ThemeIcon>
                <Text fz="xs" fw={600} c="white">
                  {isVi ? "Tỷ lệ nhớ chuẩn:" : "Retention rate:"}
                </Text>
              </Group>
              <Text fz="sm" fw={800} c="white">
                {retentionPercent}%
              </Text>
            </Group>

            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon variant="white" color="indigo" size="sm" radius="xl">
                  <IconSparkles size={14} />
                </ThemeIcon>
                <Text fz="xs" fw={600} c="white">
                  {isVi ? "Trí nhớ dài hạn:" : "Memory optimization:"}
                </Text>
              </Group>
              <Badge variant="outline" color="white" size="xs">
                {isVi ? "Tối ưu hóa" : "Optimized"}
              </Badge>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
