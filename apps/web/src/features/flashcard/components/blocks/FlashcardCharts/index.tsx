"use client";

import { Box, Card, Group, Stack, Text } from "@mantine/core";
import React from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { FlashcardStatsData } from "../../../types";

interface FlashcardChartsProps {
  stats: FlashcardStatsData;
}

/**
 * Cards reviewed per day over the chosen period.
 *
 * There was a "memory stages" panel beside this one - 184 mastered, 96 in
 * review, and so on - that was the same four figures for every learner,
 * including one who had never studied. The API has nothing to fill it with, so
 * it is gone rather than kept as decoration that looks like data.
 */
export function FlashcardCharts({ stats }: FlashcardChartsProps) {
  const { isVi } = useLanguage();
  const maxCards = Math.max(...stats.activityDays.map((d) => d.cardsCount), 1);
  const hasActivity = stats.activityDays.some((d) => d.cardsCount > 0);

  return (
    <Card withBorder padding="lg" radius="md">
      <Stack gap="md">
        <Box>
          {/* Not "past 7 days": the period is whichever the learner picked. */}
          <Text fw={700} fz="sm" c="dark.9">
            {isVi ? "Số thẻ ôn tập theo ngày" : "Cards reviewed per day"}
          </Text>
        </Box>

        {hasActivity ? (
          <Group align="flex-end" justify="space-around" h={180} px="xs">
            {stats.activityDays.map((item, idx) => {
              const heightPercent = Math.round(
                (item.cardsCount / maxCards) * 100,
              );
              return (
                <Stack
                  key={idx}
                  align="center"
                  justify="flex-end"
                  gap={4}
                  h="100%"
                  style={{ flex: 1 }}
                >
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
                      minHeight: item.cardsCount > 0 ? 6 : 2,
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
        ) : (
          <Text size="sm" c="dimmed" ta="center" py={48}>
            {isVi
              ? "Chưa có lượt ôn tập nào trong khoảng thời gian này."
              : "No reviews in this period yet."}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
