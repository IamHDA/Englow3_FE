"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBook,
  IconFlame,
  IconLock,
  IconPlayerPlay,
  IconRotateClockwise,
  IconStar,
  IconTrophy,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { DailyPathNode } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface DailyPathRoadmapProps {
  nodes: DailyPathNode[];
}

export function DailyPathRoadmap({ nodes }: DailyPathRoadmapProps) {
  const { isVi } = useLanguage();

  const getNodeIcon = (type: DailyPathNode["type"]) => {
    switch (type) {
      case "LESSON":
        return IconBook;
      case "QUIZ":
        return IconFlame;
      case "CHALLENGE":
        return IconFlame;
      case "MILESTONE":
        return IconTrophy;
    }
  };

  const getNodeTypeLabel = (type: DailyPathNode["type"]) => {
    if (isVi) {
      switch (type) {
        case "LESSON": return "Bài học";
        case "QUIZ": return "Trắc nghiệm";
        case "CHALLENGE": return "Thử thách";
        case "MILESTONE": return "Cột mốc";
      }
    }
    return type;
  };

  return (
    <Card withBorder padding="xl" radius="md">
      <Stack gap="lg">
        <Box>
          <Text fw={800} fz="lg" c="dark.9">
            {isVi ? "Bản đồ chặng đường học tập" : "Learning Roadmap"}
          </Text>
          <Text fz="xs" c="dimmed">
            {isVi
              ? "Hoàn thành từng trạm học để mở khóa thử thách tiếp theo và thăng cấp năng lực"
              : "Complete each checkpoint to unlock the next challenge and rank up"}
          </Text>
        </Box>

        <Stack gap="md" style={{ position: "relative" }}>
          {nodes.map((node, idx) => {
            const Icon = getNodeIcon(node.type);
            const isCompleted = node.status === "COMPLETED";
            const isCurrent = node.status === "CURRENT";
            const isLocked = node.status === "LOCKED";

            return (
              <Card
                key={node.id}
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
                  opacity: isLocked ? 0.65 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                <Group justify="space-between" align="center" wrap="wrap">
                  <Group gap="md">
                    <ThemeIcon
                      size={42}
                      radius="xl"
                      color={
                        isCompleted
                          ? "teal"
                          : isCurrent
                          ? "indigo"
                          : "gray"
                      }
                      variant={isCurrent ? "filled" : "light"}
                    >
                      {isLocked ? <IconLock size={20} /> : <Icon size={20} />}
                    </ThemeIcon>

                    <Stack gap={2}>
                      <Group gap="xs" align="center">
                        <Badge
                          size="xs"
                          variant="light"
                          color={
                            isCompleted
                              ? "teal"
                              : isCurrent
                              ? "indigo"
                              : "gray"
                          }
                        >
                          {isVi ? `Trạm ${idx + 1}` : `Stage ${idx + 1}`}: {getNodeTypeLabel(node.type)}
                        </Badge>
                        <Badge variant="dot" color="yellow" size="xs">
                          +{node.xpReward} XP
                        </Badge>
                      </Group>

                      <Text fw={700} fz="sm" c="dark.9">
                        {node.title}
                      </Text>
                      <Text fz="xs" c="dimmed">
                        {node.subtitle}
                      </Text>
                    </Stack>
                  </Group>

                  <Group gap="sm">
                    {isCompleted && (
                      <Group gap={2}>
                        {Array.from({ length: 3 }).map((_, sIdx) => (
                          <IconStar
                            key={sIdx}
                            size={16}
                            color={
                              sIdx < (node.starsEarned || 0)
                                ? "var(--mantine-color-yellow-5)"
                                : "var(--mantine-color-gray-3)"
                            }
                            fill={
                              sIdx < (node.starsEarned || 0)
                                ? "var(--mantine-color-yellow-5)"
                                : "transparent"
                            }
                          />
                        ))}
                      </Group>
                    )}

                    {isCompleted ? (
                      <Button
                        component={Link}
                        href={`/study/quiz/${node.targetQuizId || "ielts-academic-grammar"}`}
                        variant="light"
                        color="gray"
                        size="xs"
                        leftSection={<IconRotateClockwise size={14} />}
                      >
                        {isVi ? "Luyện lại" : "Review"}
                      </Button>
                    ) : isCurrent ? (
                      <Button
                        component={Link}
                        href={`/study/quiz/${node.targetQuizId || "ielts-academic-grammar"}`}
                        variant="filled"
                        color="indigo"
                        size="sm"
                        leftSection={<IconPlayerPlay size={16} />}
                      >
                        {isVi ? "Bắt đầu ngay" : "Start Now"}
                      </Button>
                    ) : (
                      <Button
                        variant="subtle"
                        color="gray"
                        size="xs"
                        disabled
                        leftSection={<IconLock size={14} />}
                      >
                        {isVi ? "Đang khóa" : "Locked"}
                      </Button>
                    )}
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
