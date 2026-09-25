"use client";

import { Grid, Group, Paper, Stack, Text, Tooltip, Title } from "@mantine/core";
import { TrendingUp, BarChart2 } from "lucide-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { DictationStatsData } from "../../../types";

interface DictationChartsProps {
  stats: DictationStatsData;
}

export function DictationCharts({ stats }: DictationChartsProps) {
  const { isVi, t } = useLanguage();
  const accData = stats.accuracyOverTime;
  const activityData = stats.practiceActivity;

  // Chart dimensions for SVG
  const width = 500;
  const height = 180;
  const padding = 28;

  const minAcc = 60;
  const maxAcc = 100;

  // A learner with no attempts yet has no points: the path below used to read
  // points[0] regardless and took the whole page down with it. One point sits
  // in the middle - dividing by (length - 1) put it at NaN.
  const points = accData.map((d, i) => {
    const x =
      accData.length === 1
        ? width / 2
        : padding + (i / (accData.length - 1)) * (width - padding * 2);
    // The axis starts at 60%; a worse day sits on the floor rather than below
    // the chart.
    const clamped = Math.min(maxAcc, Math.max(minAcc, d.accuracy));
    const y =
      height -
      padding -
      ((clamped - minAcc) / (maxAcc - minAcc)) * (height - padding * 2);
    return { x, y, label: d.dateLabel, value: d.accuracy };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const first = points[0];
  const last = points[points.length - 1];
  const areaD =
    first && last
      ? `${pathD} L ${last.x} ${height - padding} L ${first.x} ${height - padding} Z`
      : "";

  const maxActivity = Math.max(...activityData.map((a) => a.sentencesCount), 1);
  const hasActivity = activityData.some((a) => a.sentencesCount > 0);
  const emptyText = isVi
    ? "Chưa có dữ liệu. Luyện vài câu để thấy biểu đồ."
    : "No data yet. Practise a few sentences to see the chart.";

  return (
    <Grid gap="md">
      {/* Accuracy Over Time Line Chart */}
      <Grid.Col span={{ base: 12, md: 7 }}>
        <Paper
          radius="md"
          p="lg"
          withBorder
          bg="white"
          style={{ height: "100%" }}
        >
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <TrendingUp size={18} color="var(--mantine-color-navy-9)" />
                <Title order={3} size="h5" fw={700} c="ink.9">
                  {t.dictation.accuracyOverTime}
                </Title>
              </Group>
            </Group>

            {points.length === 0 ? (
              <Text size="sm" c="ink.5" ta="center" py={48}>
                {emptyText}
              </Text>
            ) : (
              <div style={{ width: "100%", overflowX: "auto" }}>
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  style={{ width: "100%", height: "auto", display: "block" }}
                >
                  <defs>
                    <linearGradient
                      id="accGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#3B6FD4"
                        stopOpacity="0.35"
                      />
                      <stop
                        offset="100%"
                        stopColor="#3B6FD4"
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  {/* Grid guidelines */}
                  {[70, 80, 90, 100].map((v) => {
                    const y =
                      height -
                      padding -
                      ((v - minAcc) / (maxAcc - minAcc)) *
                        (height - padding * 2);
                    return (
                      <g key={v}>
                        <line
                          x1={padding}
                          y1={y}
                          x2={width - padding}
                          y2={y}
                          stroke="var(--mantine-color-ink-2)"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={padding - 6}
                          y={y + 4}
                          fontSize="10"
                          fill="var(--mantine-color-ink-5)"
                          textAnchor="end"
                        >
                          {v}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Filled area */}
                  <path d={areaD} fill="url(#accGradient)" />

                  {/* Trend line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="var(--mantine-color-navy-8)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Points */}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="var(--mantine-color-navy-9)"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      <text
                        x={p.x}
                        y={height - 8}
                        fontSize="10"
                        fill="var(--mantine-color-ink-6)"
                        textAnchor="middle"
                      >
                        {p.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )}
          </Stack>
        </Paper>
      </Grid.Col>

      {/* Practice Activity Bar Chart */}
      <Grid.Col span={{ base: 12, md: 5 }}>
        <Paper
          radius="md"
          p="lg"
          withBorder
          bg="white"
          style={{ height: "100%" }}
        >
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <BarChart2 size={18} color="var(--mantine-color-orange-8)" />
                <Title order={3} size="h5" fw={700} c="ink.9">
                  {t.dictation.practiceActivity}
                </Title>
              </Group>
              <Text size="xs" c="ink.5">
                {isVi ? "Số câu / ngày" : "Sentences / day"}
              </Text>
            </Group>

            {!hasActivity ? (
              <Text size="sm" c="ink.5" ta="center" py={48}>
                {emptyText}
              </Text>
            ) : (
              <Group
                justify="space-between"
                align="flex-end"
                style={{
                  height: 140,
                  padding: "16px 8px 0",
                }}
              >
                {activityData.map((act, i) => {
                  const heightPercent = Math.max(
                    12,
                    Math.round((act.sentencesCount / maxActivity) * 100),
                  );
                  const isPeak = act.sentencesCount === maxActivity;

                  return (
                    <Tooltip
                      key={i}
                      label={`${act.dayLabel}: ${act.sentencesCount} ${isVi ? "câu đã luyện" : "sentences practiced"}`}
                      withArrow
                    >
                      <Stack gap={6} align="center" style={{ flex: 1 }}>
                        <Text
                          size="xs"
                          fw={700}
                          c={isPeak ? "orange.9" : "ink.7"}
                        >
                          {act.sentencesCount}
                        </Text>
                        <div
                          style={{
                            width: 24,
                            height: `${heightPercent}px`,
                            borderRadius: 4,
                            backgroundColor: isPeak
                              ? "var(--mantine-color-orange-6)"
                              : "var(--mantine-color-navy-3)",
                            transition:
                              "height 0.3s ease, background-color 0.2s ease",
                          }}
                        />
                        <Text size="xs" fw={600} c="ink.6">
                          {act.dayLabel}
                        </Text>
                      </Stack>
                    </Tooltip>
                  );
                })}
              </Group>
            )}
          </Stack>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
