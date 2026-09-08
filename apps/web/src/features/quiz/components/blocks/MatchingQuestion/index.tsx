"use client";

import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconCheck, IconLink, IconRefresh } from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import { QuizQuestion } from "../../../types";

interface MatchingQuestionProps {
  question: QuizQuestion;
  userPairs?: Record<string, string>;
  onChange: (pairs: Record<string, string>) => void;
}

const PAIR_COLORS = ["teal", "blue", "indigo", "violet", "pink", "orange"];

export function MatchingQuestion({
  question,
  userPairs = {},
  onChange,
}: MatchingQuestionProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const pairs = useMemo(() => {
    return question.matchingPairs || [];
  }, [question.matchingPairs]);

  const leftItems = useMemo(() => pairs.map((p) => p.left), [pairs]);
  // Shuffled right items to avoid identical order
  const rightItems = useMemo(() => {
    return [...pairs.map((p) => p.right)].reverse();
  }, [pairs]);

  // Map each matched pair to a consistent color index
  const pairColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.keys(userPairs).forEach((left, idx) => {
      map[left] = PAIR_COLORS[idx % PAIR_COLORS.length] || "indigo";
      map[userPairs[left]!] = PAIR_COLORS[idx % PAIR_COLORS.length] || "indigo";
    });
    return map;
  }, [userPairs]);

  const handleLeftClick = (left: string) => {
    // If already paired, unpair it
    if (userPairs[left]) {
      const updated = { ...userPairs };
      delete updated[left];
      onChange(updated);
      setSelectedLeft(null);
      return;
    }

    if (selectedLeft === left) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(left);
    }
  };

  const handleRightClick = (right: string) => {
    // If this right clause is already used in a pair, unpair it
    const existingLeft = Object.keys(userPairs).find((l) => userPairs[l] === right);
    if (existingLeft) {
      const updated = { ...userPairs };
      delete updated[existingLeft];
      onChange(updated);
      return;
    }

    // If a left item is selected, create the pair
    if (selectedLeft) {
      onChange({
        ...userPairs,
        [selectedLeft]: right,
      });
      setSelectedLeft(null);
    }
  };

  const handleReset = () => {
    onChange({});
    setSelectedLeft(null);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text fw={600} fz="md" c="dark.9" style={{ whiteSpace: "pre-line" }}>
          {question.prompt}
        </Text>
        {Object.keys(userPairs).length > 0 && (
          <Button
            variant="subtle"
            color="red"
            size="xs"
            onClick={handleReset}
            leftSection={<IconRefresh size={14} />}
          >
            Nối lại từ đầu
          </Button>
        )}
      </Group>

      <Grid gap="md">
        {/* Left Column */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="xs">
            <Text fz="xs" fw={700} c="dimmed">
              VẾ ĐẦU (MỆNH ĐỀ ĐIỀU KIỆN):
            </Text>
            {leftItems.map((left, idx) => {
              const isPaired = !!userPairs[left];
              const isSelected = selectedLeft === left;
              const color = pairColorMap[left] || "indigo";

              return (
                <UnstyledButton
                  key={idx}
                  onClick={() => handleLeftClick(left)}
                  style={{ width: "100%" }}
                >
                  <Card
                    withBorder
                    padding="sm"
                    radius="md"
                    style={{
                      borderColor: isSelected
                        ? "var(--mantine-color-indigo-6)"
                        : isPaired
                        ? `var(--mantine-color-${color}-6)`
                        : undefined,
                      backgroundColor: isSelected
                        ? "var(--mantine-color-indigo-0)"
                        : isPaired
                        ? `var(--mantine-color-${color}-0)`
                        : "var(--mantine-color-body)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Group justify="space-between" align="center">
                      <Group gap="xs">
                        <Badge
                          variant={isPaired ? "filled" : "outline"}
                          color={isPaired ? color : "gray"}
                          size="sm"
                        >
                          {idx + 1}
                        </Badge>
                        <Text fz="sm" fw={isPaired || isSelected ? 600 : 500}>
                          {left}
                        </Text>
                      </Group>
                      {isPaired && <IconCheck size={16} color={`var(--mantine-color-${color}-6)`} />}
                    </Group>
                  </Card>
                </UnstyledButton>
              );
            })}
          </Stack>
        </Grid.Col>

        {/* Right Column */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="xs">
            <Text fz="xs" fw={700} c="dimmed">
              VẾ SAU (KẾT QUẢ TƯƠNG ỨNG):
            </Text>
            {rightItems.map((right, idx) => {
              const existingLeft = Object.keys(userPairs).find((l) => userPairs[l] === right);
              const isPaired = !!existingLeft;
              const color = existingLeft ? pairColorMap[right] || "indigo" : "gray";

              return (
                <UnstyledButton
                  key={idx}
                  onClick={() => handleRightClick(right)}
                  style={{ width: "100%" }}
                >
                  <Card
                    withBorder
                    padding="sm"
                    radius="md"
                    style={{
                      borderColor: isPaired ? `var(--mantine-color-${color}-6)` : undefined,
                      backgroundColor: isPaired
                        ? `var(--mantine-color-${color}-0)`
                        : selectedLeft
                        ? "var(--mantine-color-indigo-0)"
                        : "var(--mantine-color-body)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Group justify="space-between" align="center">
                      <Group gap="xs">
                        <Badge
                          variant={isPaired ? "filled" : "outline"}
                          color={isPaired ? color : "gray"}
                          size="sm"
                        >
                          {String.fromCharCode(65 + idx)}
                        </Badge>
                        <Text fz="sm" fw={isPaired ? 600 : 500}>
                          {right}
                        </Text>
                      </Group>
                      {isPaired && <IconLink size={16} color={`var(--mantine-color-${color}-6)`} />}
                    </Group>
                  </Card>
                </UnstyledButton>
              );
            })}
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
