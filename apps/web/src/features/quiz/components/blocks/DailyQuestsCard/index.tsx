"use client";

import {
  Badge,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconCheck, IconTarget } from "@tabler/icons-react";
import React from "react";
import { DailyQuest } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface DailyQuestsCardProps {
  quests: DailyQuest[];
}

export function DailyQuestsCard({ quests }: DailyQuestsCardProps) {
  const { isVi } = useLanguage();

  return (
    <Card withBorder padding="md" radius="md">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon variant="light" color="indigo" size="sm" radius="xl">
              <IconTarget size={16} />
            </ThemeIcon>
            <Text fw={700} fz="sm" c="dark.9">
              {isVi ? "Nhiệm vụ trong ngày" : "Daily Quests"}
            </Text>
          </Group>
          <Badge variant="light" color="yellow" size="xs">
            {isVi ? "Làm mới mỗi ngày" : "Resets Daily"}
          </Badge>
        </Group>

        <Stack gap="xs">
          {quests.map((quest) => {
            const percent = Math.min(
              Math.round((quest.progress / quest.target) * 100),
              100
            );

            return (
              <Card
                key={quest.id}
                withBorder
                padding="xs"
                radius="sm"
                bg={quest.isCompleted ? "teal.0" : "var(--mantine-color-body)"}
              >
                <Group justify="space-between" align="center" mb={4}>
                  <Stack gap={0}>
                    <Group gap="xs">
                      {quest.isCompleted && (
                        <IconCheck size={14} color="var(--mantine-color-teal-6)" />
                      )}
                      <Text fz="xs" fw={700} c={quest.isCompleted ? "teal.9" : "dark.8"}>
                        {quest.title}
                      </Text>
                    </Group>
                    <Text fz={10} c="dimmed">
                      {quest.description}
                    </Text>
                  </Stack>

                  <Badge variant="filled" color="yellow" size="xs" c="dark.9">
                    +{quest.rewardXp} XP
                  </Badge>
                </Group>

                <Progress
                  value={percent}
                  size="xs"
                  color={quest.isCompleted ? "teal" : "indigo"}
                  radius="xl"
                />
              </Card>
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
}
