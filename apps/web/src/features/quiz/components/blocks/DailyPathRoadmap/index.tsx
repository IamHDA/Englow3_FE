"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBook,
  IconCheck,
  IconHeadphones,
  IconPlayerPlay,
  IconRotateClockwise,
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

import {
  DailyTaskKind,
  DailyTaskStatus,
} from "@/lib/graphql/generated/schemaTypes";
import { useLanguage } from "@/shared/hooks/useLanguage";
import {
  TASK_KIND_HREFS,
  TASK_KIND_LABELS,
  TASK_UNIT_LABELS,
} from "../../../constants/dailyPath";
import type { DailyTask } from "../../../types";

interface DailyPathRoadmapProps {
  tasks: DailyTask[];
}

const KIND_ICONS = {
  [DailyTaskKind.FLASHCARD_REVIEW]: IconBook,
  [DailyTaskKind.DICTATION]: IconHeadphones,
  [DailyTaskKind.QUIZ]: IconSparkles,
};

/**
 * Câu mô tả dưới tên trạm, dựng từ các con số backend trả về. Viết ở đây chứ
 * không nhận sẵn một chuỗi từ server: cùng một dữ liệu phải đọc được ở cả hai
 * ngôn ngữ.
 */
function subtitleFor(task: DailyTask, isVi: boolean): string {
  const unit = TASK_UNIT_LABELS[task.kind];

  if (task.status === DailyTaskStatus.COMPLETED) {
    const done = task.unitsDoneToday;
    if (task.kind === DailyTaskKind.QUIZ) {
      return task.completionPercent == null
        ? isVi
          ? "Đã làm hôm nay"
          : "Done today"
        : isVi
          ? `Đã làm hôm nay - ${task.completionPercent}%`
          : `Done today - ${task.completionPercent}%`;
    }
    const noun = isVi
      ? task.kind === DailyTaskKind.FLASHCARD_REVIEW
        ? "thẻ"
        : "câu"
      : task.kind === DailyTaskKind.FLASHCARD_REVIEW
        ? done === 1
          ? "card"
          : "cards"
        : done === 1
          ? "sentence"
          : "sentences";
    const accuracy =
      task.completionPercent == null ? "" : ` - ${task.completionPercent}%`;
    return isVi
      ? `Hôm nay đã xong ${done} ${noun}${accuracy}`
      : `${done} ${noun} done today${accuracy}`;
  }

  const remaining = task.unitsRemaining;
  const unitText = isVi ? unit.vi : remaining === 1 ? unit.en : unit.enPlural;
  const base = isVi
    ? `Còn ${remaining} ${unitText}`
    : `${remaining} ${unitText}`;

  // Chỉ nói "đã làm được N hôm nay" khi thực sự có - dòng "0 hôm nay" là nhiễu.
  if (task.unitsDoneToday > 0) {
    return isVi
      ? `${base} - đã làm ${task.unitsDoneToday} hôm nay`
      : `${base} - ${task.unitsDoneToday} already done today`;
  }
  return base;
}

export function DailyPathRoadmap({ tasks }: DailyPathRoadmapProps) {
  const { isVi } = useLanguage();

  if (tasks.length === 0) {
    return (
      <Card withBorder padding="xl" radius="md">
        <Stack gap={6} align="center" py="lg">
          <ThemeIcon variant="light" color="teal" size={44} radius="xl">
            <IconCheck size={22} />
          </ThemeIcon>
          <Text fw={700} fz="sm" c="dark.9">
            {isVi ? "Không còn việc nào đang dở" : "Nothing outstanding"}
          </Text>
          <Text fz="xs" c="dimmed" ta="center" maw={360}>
            {isVi
              ? "Chưa có thẻ nào đến hạn, chưa có bài nào bỏ giữa. Mở thư viện chọn thêm bộ thẻ hoặc bài nghe để lộ trình có việc."
              : "No cards are due and nothing is half-finished. Pick up a new set or lesson from the library to give the path something to plan."}
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder padding="xl" radius="md">
      <Stack gap="lg">
        <Box>
          <Text fw={800} fz="lg" c="dark.9">
            {isVi ? "Bản đồ chặng đường học tập" : "Learning Roadmap"}
          </Text>
          <Text fz="xs" c="dimmed">
            {isVi
              ? "Việc đang dở của chính bạn, thẻ đến hạn xếp trước vì chỉ lịch ôn mới có kỳ hạn"
              : "Your own outstanding work. Due cards come first - only the review schedule has a deadline"}
          </Text>
        </Box>

        <Stack gap="md">
          {tasks.map((task, idx) => {
            const Icon = KIND_ICONS[task.kind];
            const isCompleted = task.status === DailyTaskStatus.COMPLETED;
            const isCurrent = task.status === DailyTaskStatus.CURRENT;
            const href = TASK_KIND_HREFS[task.kind](task.targetId);

            return (
              <Card
                key={`${task.kind}:${task.targetId}`}
                withBorder
                padding="md"
                radius="md"
                style={{
                  borderLeft: isCurrent
                    ? "4px solid var(--mantine-color-indigo-6)"
                    : isCompleted
                      ? "4px solid var(--mantine-color-teal-6)"
                      : "4px solid var(--mantine-color-gray-3)",
                  backgroundColor: isCurrent
                    ? "var(--mantine-color-indigo-0)"
                    : "var(--mantine-color-body)",
                  transition: "all 0.2s ease",
                }}
              >
                <Group justify="space-between" align="center" wrap="wrap">
                  <Group gap="md">
                    <ThemeIcon
                      size={42}
                      radius="xl"
                      color={
                        isCompleted ? "teal" : isCurrent ? "indigo" : "gray"
                      }
                      variant={isCurrent ? "filled" : "light"}
                    >
                      {isCompleted ? (
                        <IconCheck size={20} />
                      ) : (
                        <Icon size={20} />
                      )}
                    </ThemeIcon>

                    <Stack gap={2}>
                      <Group gap="xs" align="center">
                        <Badge
                          size="xs"
                          variant="light"
                          color={
                            isCompleted ? "teal" : isCurrent ? "indigo" : "gray"
                          }
                        >
                          {isVi ? `Trạm ${idx + 1}` : `Stage ${idx + 1}`}:{" "}
                          {isVi
                            ? TASK_KIND_LABELS[task.kind].vi
                            : TASK_KIND_LABELS[task.kind].en}
                        </Badge>
                        {/* Chỉ hiện khi còn thưởng: việc đã xong thì không nợ gì nữa. */}
                        {task.xpReward > 0 && (
                          <Badge variant="dot" color="yellow" size="xs">
                            +{task.xpReward} XP
                          </Badge>
                        )}
                      </Group>

                      <Text fw={700} fz="sm" c="dark.9">
                        {task.title}
                      </Text>
                      <Text fz="xs" c="dimmed">
                        {subtitleFor(task, isVi)}
                      </Text>
                    </Stack>
                  </Group>

                  <Group gap="sm">
                    {/* Vòng tiến độ thật của cả bộ, không phải số sao tự nghĩ ra. */}
                    {task.completionPercent != null && !isCompleted && (
                      <Stack gap={2} w={96}>
                        <Text fz={10} c="dimmed" ta="right">
                          {isVi
                            ? `Đã xong ${task.completionPercent}%`
                            : `${task.completionPercent}% complete`}
                        </Text>
                        <Progress
                          value={task.completionPercent}
                          size="xs"
                          color={isCurrent ? "indigo" : "gray"}
                          radius="xl"
                        />
                      </Stack>
                    )}

                    <Button
                      component={Link}
                      href={href}
                      variant={
                        isCurrent ? "filled" : isCompleted ? "light" : "default"
                      }
                      color={isCurrent ? "indigo" : "gray"}
                      size={isCurrent ? "sm" : "xs"}
                      leftSection={
                        isCompleted ? (
                          <IconRotateClockwise size={14} />
                        ) : (
                          <IconPlayerPlay size={isCurrent ? 16 : 14} />
                        )
                      }
                    >
                      {isCompleted
                        ? isVi
                          ? "Luyện lại"
                          : "Practise again"
                        : isCurrent
                          ? isVi
                            ? "Bắt đầu ngay"
                            : "Start now"
                          : isVi
                            ? "Mở"
                            : "Open"}
                    </Button>
                  </Group>
                </Group>
              </Card>
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
}
