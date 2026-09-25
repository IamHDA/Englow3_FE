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

import { useLanguage } from "@/shared/hooks/useLanguage";
import { QUEST_LABELS } from "../../../constants/dailyPath";
import type { DailyQuest } from "../../../types";

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
              {isVi ? "Mục tiêu hôm nay" : "Today's Goals"}
            </Text>
          </Group>
          <Badge variant="light" color="yellow" size="xs">
            {isVi ? "Tính lại mỗi ngày" : "Resets daily"}
          </Badge>
        </Group>

        <Stack gap="xs">
          {quests.map((quest) => {
            const labels = QUEST_LABELS[quest.kind];
            const percent =
              quest.target === 0
                ? 100
                : Math.min(
                    Math.round((quest.progress / quest.target) * 100),
                    100,
                  );

            return (
              <Card
                key={quest.kind}
                withBorder
                padding="xs"
                radius="sm"
                bg={quest.completed ? "teal.0" : "var(--mantine-color-body)"}
              >
                <Group justify="space-between" align="center" mb={4}>
                  <Stack gap={0}>
                    <Group gap="xs">
                      {quest.completed && (
                        <IconCheck
                          size={14}
                          color="var(--mantine-color-teal-6)"
                        />
                      )}
                      <Text
                        fz="xs"
                        fw={700}
                        c={quest.completed ? "teal.9" : "dark.8"}
                      >
                        {isVi ? labels.vi : labels.en}
                      </Text>
                    </Group>
                  </Stack>

                  {/*
                    Con số thật thay cho huy hiệu "+50 XP" cũ. Điểm đến từ chính
                    việc làm, nên treo thêm thưởng cho cùng việc đó thì hoặc là
                    đếm hai lần, hoặc là trang trí giả làm phần thưởng.
                  */}
                  <Text
                    fz="xs"
                    fw={700}
                    c={quest.completed ? "teal.7" : "dimmed"}
                  >
                    {quest.progress}/{quest.target}
                  </Text>
                </Group>

                <Progress
                  value={percent}
                  size="xs"
                  color={quest.completed ? "teal" : "indigo"}
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
