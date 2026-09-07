import { Badge, Button, Card, Divider, Group, Stack, Text } from "@mantine/core";
import { Clock, FileText, Play } from "lucide-react";
import Link from "next/link";

import { CEFR_COLOR_MAP } from "../../../constants/examLibrary";
import classes from "./ExamCard.module.css";

export type ExamCardData = {
  id: string;
  title: string;
  description: string;
  examType: string;
  certificateType?: string | null;
  certificateVariant?: string | null;
  targetLevel?: string | null;
  durationSeconds: number;
  maxRawScore: number;
  passScore?: number | null;
  questionCount: number;
  status: string;
  bestScore?: number | null;
  attemptStatus?: string | null;
};

type ExamCardProps = {
  exam: ExamCardData;
};

export function ExamCard({ exam }: ExamCardProps) {
  const level = exam.targetLevel ?? "B1";
  const colors = CEFR_COLOR_MAP[level] ?? {
    bg: "#F1F5F9",
    fg: "#334155",
    border: "#CBD5E1",
  };

  const durationMinutes = Math.round(exam.durationSeconds / 60);

  // Status badge config
  const isStarted = exam.attemptStatus === "IN_PROGRESS";
  const isDone = exam.attemptStatus === "COMPLETED";

  const statusLabel = isDone
    ? "Đã hoàn thành"
    : isStarted
      ? "Đang làm dở"
      : "Chưa làm";
  const statusBadgeColor = isDone ? "teal" : isStarted ? "yellow" : "gray";

  // Derive skill labels based on variant or certificate
  const skills: string[] = [];
  if (exam.certificateVariant === "LR") {
    skills.push("Listening", "Reading");
  } else if (exam.certificateVariant === "SW") {
    skills.push("Speaking", "Writing");
  } else if (exam.certificateType === "IELTS") {
    skills.push("Listening", "Reading", "Writing");
  } else {
    skills.push("Tổng hợp");
  }

  // Series label
  const seriesName = exam.certificateType
    ? `${exam.certificateType} ${exam.certificateVariant ?? ""}`.trim()
    : "Đề thi thử";

  return (
    <Card withBorder radius="lg" p="lg" className={classes.card}>
      <Group justify="space-between" align="center" mb="xs">
        <Badge
          size="md"
          radius="xl"
          variant="outline"
          style={{
            background: colors.bg,
            color: colors.fg,
            borderColor: colors.border,
          }}
        >
          {level}
        </Badge>
        <Badge size="sm" radius="xl" variant="dot" color={statusBadgeColor}>
          {statusLabel}
        </Badge>
      </Group>

      <Stack gap={4}>
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" lts="0.08em">
          {seriesName}
        </Text>
        <Text fw={700} size="md" c="navy.9" lineClamp={2} title={exam.title} lh={1.35}>
          {exam.title}
        </Text>
      </Stack>

      <Group gap={6} mt={6} mb="xs">
        {skills.map((skill) => (
          <Badge key={skill} size="sm" variant="light" color="gray" radius="sm">
            {skill}
          </Badge>
        ))}
      </Group>

      <Stack gap="xs" mt="auto" pt="xs">
        <Divider color="gray.2" />

        <Group gap="md">
          <Group gap={5}>
            <FileText size={14} aria-hidden="true" color="var(--mantine-color-gray-6)" />
            <Text size="xs" c="dimmed">
              {exam.questionCount} câu
            </Text>
          </Group>
          <Group gap={5}>
            <Clock size={14} aria-hidden="true" color="var(--mantine-color-gray-6)" />
            <Text size="xs" c="dimmed">
              {durationMinutes} phút
            </Text>
          </Group>
        </Group>

        <Group justify="space-between" align="center" pt={4}>
          <Stack gap={1}>
            <Text size="xs" c="dimmed">
              {exam.bestScore !== null && exam.bestScore !== undefined
                ? "Điểm cao nhất"
                : "Điểm tối đa"}
            </Text>
            <Text fw={700} size="sm" c="navy.9" style={{ fontVariantNumeric: "tabular-nums" }}>
              {exam.bestScore !== null && exam.bestScore !== undefined
                ? `${exam.bestScore}/${exam.maxRawScore}`
                : `${exam.maxRawScore} điểm`}
            </Text>
          </Stack>

          <Button
            component={Link}
            href={`/mock-test/${exam.id}`}
            size="xs"
            radius="xl"
            color={isDone ? "gray" : isStarted ? "orange" : "blue"}
            variant={isDone ? "outline" : "filled"}
            rightSection={
              <Play size={12} fill="currentColor" aria-hidden="true" />
            }
          >
            {isDone ? "Làm lại" : isStarted ? "Làm tiếp" : "Bắt đầu làm bài"}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
