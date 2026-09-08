"use client";

import {
  Badge,
  Card,
  Grid,
  Group,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconFlame,
  IconSparkles,
  IconTrophy,
} from "@tabler/icons-react";
import React from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface DailyStreakBannerProps {
  streakDays: number;
  totalXp: number;
  currentLevel: number;
  levelXp: number;
  nextLevelXp: number;
}

export function DailyStreakBanner({
  streakDays,
  totalXp,
  currentLevel,
  levelXp,
  nextLevelXp,
}: DailyStreakBannerProps) {
  const { isVi } = useLanguage();
  const levelProgress = Math.round((levelXp / nextLevelXp) * 100);

  return (
    <Card
      withBorder
      padding="xl"
      radius="lg"
      style={{
        background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)",
        color: "#ffffff",
      }}
    >
      <Grid align="center" gap="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="xs">
            <Group gap="xs">
              <Badge variant="filled" color="yellow" size="sm" c="dark.9" fw={700}>
                {isVi ? "LỘ TRÌNH THÍCH ỨNG AI" : "AI ADAPTIVE LEARNING PATH"}
              </Badge>
              <Group gap={4}>
                <IconFlame size={18} color="#FBBF24" />
                <Text fz="xs" fw={700} c="yellow.2">
                  {isVi
                    ? `Chuỗi ${streakDays} ngày liên tiếp`
                    : `${streakDays}-day streak`}
                </Text>
              </Group>
            </Group>

            <Title order={2} fw={800} c="white">
              {isVi ? "Lộ trình học tập mỗi ngày" : "Adaptive Daily Learning Path"}
            </Title>

            <Text fz="sm" c="indigo.1" maw={560}>
              {isVi
                ? "Hệ thống tự động đề xuất bài học, câu đố và dạng bài tập tương tác dựa trên lịch sử làm bài và điểm yếu cần cải thiện của bạn."
                : "Intelligent daily lesson progression that dynamically scales in difficulty based on your previous performance and areas for improvement."}
            </Text>

            <Group gap="lg" mt="xs">
              <Group gap="xs">
                <ThemeIcon variant="filled" color="yellow" size="sm" radius="xl">
                  <IconTrophy size={14} />
                </ThemeIcon>
                <Text fz="xs" fw={600} c="white">
                  {isVi
                    ? `Cấp độ ${currentLevel} (Học giả Tiềm năng)`
                    : `Level ${currentLevel} (Rising Scholar)`}
                </Text>
              </Group>

              <Group gap="xs">
                <ThemeIcon variant="filled" color="indigo" size="sm" radius="xl">
                  <IconSparkles size={14} />
                </ThemeIcon>
                <Text fz="xs" fw={600} c="white">
                  {isVi ? `Tổng tích lũy: ${totalXp} XP` : `Total XP: ${totalXp} XP`}
                </Text>
              </Group>
            </Group>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack
            gap="xs"
            p="md"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(8px)",
              borderRadius: "var(--mantine-radius-md)",
            }}
          >
            <Group justify="space-between">
              <Text fz="xs" fw={700} c="white">
                {isVi
                  ? `Tiến độ lên Cấp ${currentLevel + 1}:`
                  : `Progress to Level ${currentLevel + 1}:`}
              </Text>
              <Text fz="xs" fw={700} c="yellow.3">
                {levelXp} / {nextLevelXp} XP
              </Text>
            </Group>

            <Progress
              value={levelProgress}
              color="yellow"
              size="sm"
              radius="xl"
            />

            <Text fz="xs" c="indigo.2" mt={2}>
              {isVi
                ? `Còn ${nextLevelXp - levelXp} XP nữa để mở khóa huy hiệu mới.`
                : `${nextLevelXp - levelXp} XP needed to reach next rank.`}
            </Text>
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
