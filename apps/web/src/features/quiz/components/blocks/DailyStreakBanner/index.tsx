"use client";

import {
  Card,
  Grid,
  Group,
  Progress,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconFlame, IconSparkles, IconTrophy } from "@tabler/icons-react";
import React from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { levelTitle } from "../../../constants/dailyPath";

interface DailyStreakBannerProps {
  streakDays: number;
  totalXp: number;
  level: number;
  /** Điểm kiếm được kể từ khi lên cấp này, và số điểm cần để rời nó. */
  xpIntoLevel: number;
  levelCostXp: number;
}

export function DailyStreakBanner({
  streakDays,
  totalXp,
  level,
  xpIntoLevel,
  levelCostXp,
}: DailyStreakBannerProps) {
  const { isVi } = useLanguage();
  const levelProgress =
    levelCostXp === 0 ? 0 : Math.round((xpIntoLevel / levelCostXp) * 100);
  const remaining = Math.max(levelCostXp - xpIntoLevel, 0);

  return (
    <Card
      withBorder
      padding="xl"
      radius="lg"
      style={{
        background:
          "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)",
        color: "#ffffff",
      }}
    >
      <Grid align="center" gap="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="xs">
            {/* Chuỗi 0 ngày không phải là chuỗi - không dán ngọn lửa lên nó. */}
            {streakDays > 0 && (
              <Group gap={4}>
                <IconFlame size={18} color="#FBBF24" />
                <Text fz="xs" fw={700} c="yellow.2">
                  {isVi
                    ? `Chuỗi ${streakDays} ngày liên tiếp`
                    : `${streakDays}-day streak`}
                </Text>
              </Group>
            )}

            <Group gap="lg" mt="xs">
              <Group gap="xs">
                <ThemeIcon
                  variant="filled"
                  color="yellow"
                  size="sm"
                  radius="xl"
                >
                  <IconTrophy size={14} />
                </ThemeIcon>
                <Text fz="xs" fw={600} c="white">
                  {isVi
                    ? `Cấp độ ${level} (${levelTitle(level, true)})`
                    : `Level ${level} (${levelTitle(level, false)})`}
                </Text>
              </Group>

              <Group gap="xs">
                <ThemeIcon
                  variant="filled"
                  color="indigo"
                  size="sm"
                  radius="xl"
                >
                  <IconSparkles size={14} />
                </ThemeIcon>
                <Text fz="xs" fw={600} c="white">
                  {isVi
                    ? `Tổng tích lũy: ${totalXp} XP`
                    : `Total XP: ${totalXp} XP`}
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
                  ? `Tiến độ lên Cấp ${level + 1}:`
                  : `Progress to Level ${level + 1}:`}
              </Text>
              <Text fz="xs" fw={700} c="yellow.3">
                {xpIntoLevel} / {levelCostXp} XP
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
                ? `Còn ${remaining} XP nữa để lên cấp.`
                : `${remaining} XP to the next level.`}
            </Text>
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
