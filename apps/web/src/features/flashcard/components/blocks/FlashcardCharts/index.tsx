"use client";

import {
  Box,
  Card,
  Grid,
  Group,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import React from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { FlashcardStatsData } from "../../../types";

interface FlashcardChartsProps {
  stats: FlashcardStatsData;
}

export function FlashcardCharts({ stats }: FlashcardChartsProps) {
  const { isVi } = useLanguage();
  const maxCards = Math.max(...stats.activityDays.map((d) => d.cardsCount), 80);

  return (
    <Grid gap="md">
      {/* Weekly Activity Bars */}
      <Grid.Col span={{ base: 12, md: 7 }}>
        <Card withBorder padding="lg" radius="md" h="100%">
          <Stack justify="space-between" h="100%">
            <Box>
              <Text fw={700} fz="sm" c="dark.9">
                {isVi
                  ? "Số lượng thẻ ôn tập theo ngày (7 ngày qua)"
                  : "Cards Reviewed Daily (Past 7 Days)"}
              </Text>
              <Text fz="xs" c="dimmed">
                {isVi
                  ? "Đo lường tính kiên định và tần suất tiếp xúc Flashcard"
                  : "Track daily study consistency and review volume"}
              </Text>
            </Box>

            <Group align="flex-end" justify="space-around" h={180} mt="md" px="xs">
              {stats.activityDays.map((item, idx) => {
                const heightPercent = Math.round((item.cardsCount / maxCards) * 100);
                return (
                  <Stack key={idx} align="center" gap={4} style={{ flex: 1 }}>
                    <Text fz="xs" fw={700} c="indigo">
                      {item.cardsCount}
                    </Text>
                    <Box
                      w="70%"
                      maw={36}
                      h={`${heightPercent}%`}
                      bg="indigo.5"
                      style={{
                        borderRadius: "4px 4px 0 0",
                        minHeight: 12,
                        transition: "height 0.3s ease",
                      }}
                    />
                    <Text fz="xs" c="dimmed" fw={600}>
                      {item.day}
                    </Text>
                  </Stack>
                );
              })}
            </Group>
          </Stack>
        </Card>
      </Grid.Col>

      {/* Memory Stage Breakdown */}
      <Grid.Col span={{ base: 12, md: 5 }}>
        <Card withBorder padding="lg" radius="md" h="100%">
          <Stack gap="md">
            <Box>
              <Text fw={700} fz="sm" c="dark.9">
                {isVi ? "Trạng thái lưu trữ não bộ" : "Memory Retention Stages"}
              </Text>
              <Text fz="xs" c="dimmed">
                {isVi
                  ? "Phân bổ từ vựng theo chu kỳ trí nhớ Ebbinghaus"
                  : "Vocabulary distribution based on Ebbinghaus forgetting curve"}
              </Text>
            </Box>

            <Stack gap="sm">
              <Box>
                <Group justify="space-between" mb={2}>
                  <Text fz="xs" fw={600}>
                    {isVi ? "Đã khắc sâu (> 1 tháng)" : "Mastered (> 1 month)"}
                  </Text>
                  <Text fz="xs" fw={700} c="teal">
                    {isVi ? "184 từ (54%)" : "184 cards (54%)"}
                  </Text>
                </Group>
                <Progress value={54} color="teal" size="sm" radius="xl" />
              </Box>

              <Box>
                <Group justify="space-between" mb={2}>
                  <Text fz="xs" fw={600}>
                    {isVi ? "Đang củng cố (4 - 7 ngày)" : "Review (4 - 7 days)"}
                  </Text>
                  <Text fz="xs" fw={700} c="indigo">
                    {isVi ? "96 từ (28%)" : "96 cards (28%)"}
                  </Text>
                </Group>
                <Progress value={28} color="indigo" size="sm" radius="xl" />
              </Box>

              <Box>
                <Group justify="space-between" mb={2}>
                  <Text fz="xs" fw={600}>
                    {isVi ? "Bộ nhớ ngắn hạn (1 - 2 ngày)" : "Short-term (1 - 2 days)"}
                  </Text>
                  <Text fz="xs" fw={700} c="orange">
                    {isVi ? "42 từ (12%)" : "42 cards (12%)"}
                  </Text>
                </Group>
                <Progress value={12} color="orange" size="sm" radius="xl" />
              </Box>

              <Box>
                <Group justify="space-between" mb={2}>
                  <Text fz="xs" fw={600}>
                    {isVi ? "Từ mới tinh (< 1 ngày)" : "New (< 1 day)"}
                  </Text>
                  <Text fz="xs" fw={700} c="gray">
                    {isVi ? "20 từ (6%)" : "20 cards (6%)"}
                  </Text>
                </Group>
                <Progress value={6} color="gray" size="sm" radius="xl" />
              </Box>
            </Stack>
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  );
}
