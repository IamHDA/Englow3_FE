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
  const { t } = useLanguage();

  const cards = [
    {
      label: t.dictation.completedLessonsLabel,
      value: stats.lessonsCompleted,
      unit: t.dictation.lessonsUnit,
      icon: Award,
      color: "navy",
    },
    {
      label: t.dictation.averageAccuracyLabel,
      value: `${stats.averageAccuracyPercent}%`,
      unit: t.dictation.overallSentencesUnit,
      icon: Target,
      color: "teal",
    },
    {
      label: t.dictation.listeningHoursLabel,
      value: `${stats.listeningHours}h`,
      unit: t.dictation.focusedPracticeUnit,
      icon: Clock,
      color: "orange",
    },
    {
      label: t.dictation.sentencesPracticedLabel,
      value: stats.sentencesPracticed,
      unit: t.dictation.sentencesCompletedUnit,
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
            {t.dictation.statsPageTitle}
          </Title>
        </Stack>

        <SegmentedControl
          size="sm"
          value={period}
          onChange={(v) =>
            onPeriodChange(v as "7 Days" | "30 Days" | "3 Months" | "All Time")
          }
          data={[
            { label: t.dictation.period7Days, value: "7 Days" },
            { label: t.dictation.period30Days, value: "30 Days" },
            { label: t.dictation.period3Months, value: "3 Months" },
            { label: t.dictation.periodAllTime, value: "All Time" },
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
