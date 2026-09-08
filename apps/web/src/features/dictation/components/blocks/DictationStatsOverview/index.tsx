"use client";

import {
  Flex,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Award, Clock, Headphones, Target } from "lucide-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { DictationStatsData } from "../../../types";

interface DictationStatsOverviewProps {
  stats: DictationStatsData;
  period: string;
  onPeriodChange: (val: "7 Days" | "30 Days" | "3 Months" | "All Time") => void;
}

export function DictationStatsOverview({
  stats,
  period,
  onPeriodChange,
}: DictationStatsOverviewProps) {
  const { isVi } = useLanguage();

  const cards = [
    {
      label: isVi ? "Bài học đã hoàn thành" : "Completed Lessons",
      value: stats.lessonsCompleted,
      unit: isVi ? "bài" : "lessons",
      icon: Award,
      color: "navy",
    },
    {
      label: isVi ? "Độ chính xác trung bình" : "Average Accuracy",
      value: `${stats.averageAccuracyPercent}%`,
      unit: isVi ? "trên tổng số câu" : "overall sentences",
      icon: Target,
      color: "teal",
    },
    {
      label: isVi ? "Thời gian luyện nghe" : "Listening Hours",
      value: `${stats.listeningHours}h`,
      unit: isVi ? "luyện tập trung" : "focused practice",
      icon: Clock,
      color: "orange",
    },
    {
      label: isVi ? "Số câu đã thực hành" : "Sentences Practiced",
      value: stats.sentencesPracticed,
      unit: isVi ? "câu hoàn thành" : "completed",
      icon: Headphones,
      color: "ink.7",
    },
  ];

  return (
    <Stack gap="md">
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        gap="sm"
      >
        <Stack gap={2}>
          <Title order={2} size="h3" fw={700} c="ink.9">
            {isVi ? "Thống kê quá trình học" : "Dictation Statistics"}
          </Title>
          <Text size="xs" c="ink.6">
            {isVi
              ? "Theo dõi sự tiến bộ về khả năng nghe và gõ chính tả theo thời gian."
              : "Track your listening comprehension and typing precision over time."}
          </Text>
        </Stack>

        <SegmentedControl
          size="sm"
          value={period}
          onChange={(v) =>
            onPeriodChange(v as "7 Days" | "30 Days" | "3 Months" | "All Time")
          }
          data={[
            { label: isVi ? "7 ngày qua" : "Past 7 Days", value: "7 Days" },
            { label: isVi ? "30 ngày qua" : "Past 30 Days", value: "30 Days" },
            { label: isVi ? "3 tháng qua" : "Past 3 Months", value: "3 Months" },
            { label: isVi ? "Tất cả" : "All Time", value: "All Time" },
          ]}
        />
      </Flex>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        {cards.map((c, i) => (
          <Paper key={i} radius="md" p="md" withBorder bg="white">
            <Group justify="space-between" align="flex-start" mb="xs">
              <Text size="xs" fw={600} c="ink.6">
                {c.label}
              </Text>
              <ThemeIcon size={28} radius="md" variant="light" color={c.color}>
                <c.icon size={16} />
              </ThemeIcon>
            </Group>
            <Title order={3} size="h3" fw={700} c="ink.9">
              {c.value}
            </Title>
            <Text size="xs" c="ink.5" mt={2}>
              {c.unit}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
