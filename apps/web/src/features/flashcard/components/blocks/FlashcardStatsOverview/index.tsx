"use client";

import { Card, Grid, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconBrain,
  IconCards,
  IconClock,
  IconFlame,
} from "@tabler/icons-react";
import React from "react";
import { FlashcardStatsData } from "../../../types";

interface FlashcardStatsOverviewProps {
  stats: FlashcardStatsData;
}

export function FlashcardStatsOverview({ stats }: FlashcardStatsOverviewProps) {
  const statItems = [
    {
      title: "Tổng số từ đã học",
      value: `${stats.totalCardsLearned} từ`,
      desc: "Bao gồm cả New & Review",
      icon: IconCards,
      color: "indigo",
    },
    {
      title: "Tỷ lệ ghi nhớ dài hạn",
      value: `${stats.retentionRatePercent}%`,
      desc: "Dựa trên đánh giá Good / Easy",
      icon: IconBrain,
      color: "teal",
    },
    {
      title: "Tổng thời gian ôn tập",
      value: `${stats.studyTimeHours} giờ`,
      desc: "Thời gian tiếp xúc từ vựng",
      icon: IconClock,
      color: "blue",
    },
    {
      title: "Chuỗi ngày liên tục",
      value: `${stats.dailyStreakDays} ngày`,
      desc: "Đang giữ vững phong độ",
      icon: IconFlame,
      color: "orange",
    },
  ];

  return (
    <Grid gap="md">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md" radius="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Text fz="xs" c="dimmed" fw={600}>
                    {item.title}
                  </Text>
                  <Text fz="xl" fw={800} c="dark.9">
                    {item.value}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    {item.desc}
                  </Text>
                </Stack>
                <ThemeIcon variant="light" color={item.color} size="lg" radius="md">
                  <Icon size={22} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>
        );
      })}
    </Grid>
  );
}
