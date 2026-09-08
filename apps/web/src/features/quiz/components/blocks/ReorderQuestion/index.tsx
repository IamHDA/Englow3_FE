"use client";

import {
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import React, { useMemo } from "react";
import { QuizQuestion } from "../../../types";

interface ReorderQuestionProps {
  question: QuizQuestion;
  orderedWords?: string[];
  onChange: (words: string[]) => void;
}

export function ReorderQuestion({
  question,
  orderedWords = [],
  onChange,
}: ReorderQuestionProps) {
  const scrambled = useMemo(() => {
    return question.scrambledWords || [];
  }, [question.scrambledWords]);

  // Compute available pool:
  const pool = useMemo(() => {
    const usedCounts: Record<string, number> = {};
    orderedWords.forEach((w) => {
      usedCounts[w] = (usedCounts[w] || 0) + 1;
    });

    const countsSoFar: Record<string, number> = {};
    return scrambled.map((word, idx) => {
      countsSoFar[word] = (countsSoFar[word] || 0) + 1;
      const isUsed = countsSoFar[word] <= (usedCounts[word] || 0);
      return {
        word,
        idx,
        isUsed,
      };
    });
  }, [scrambled, orderedWords]);

  const handleAdd = (word: string) => {
    onChange([...orderedWords, word]);
  };

  const handleRemove = (index: number) => {
    const updated = [...orderedWords];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleReset = () => {
    onChange([]);
  };

  return (
    <Stack gap="md">
      <Text fw={600} fz="md" c="dark.9" style={{ whiteSpace: "pre-line" }}>
        {question.prompt}
      </Text>

      {/* Assembly Area */}
      <Card
        withBorder
        padding="md"
        radius="md"
        style={{
          minHeight: 80,
          borderStyle: "dashed",
          borderColor: "var(--mantine-color-indigo-4)",
        }}
      >
        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text fz="xs" fw={700} c="indigo">
              CÂU ĐANG SẮP XẾP:
            </Text>
            {orderedWords.length > 0 && (
              <Button
                variant="subtle"
                color="red"
                size="xs"
                onClick={handleReset}
                leftSection={<IconRefresh size={14} />}
              >
                Đặt lại
              </Button>
            )}
          </Group>

          {orderedWords.length === 0 ? (
            <Text fz="sm" c="dimmed" fs="italic" py="xs">
              Nhấp vào các khối từ bên dưới để đưa vào câu theo thứ tự đúng...
            </Text>
          ) : (
            <Group gap="xs" wrap="wrap">
              {orderedWords.map((word, idx) => (
                <Badge
                  key={idx}
                  size="lg"
                  variant="filled"
                  color="indigo"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemove(idx)}
                >
                  {word}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>
      </Card>

      {/* Scrambled Word Tiles */}
      <Stack gap="xs">
        <Text fz="xs" fw={700} c="dimmed">
          CÁC KHỐI TỪ CẦN SẮP XẾP:
        </Text>
        <Group gap="xs" wrap="wrap">
          {pool.map((item) => (
            <Button
              key={item.idx}
              variant="outline"
              color="indigo"
              size="sm"
              disabled={item.isUsed}
              onClick={() => handleAdd(item.word)}
              style={{
                opacity: item.isUsed ? 0.3 : 1,
              }}
            >
              {item.word}
            </Button>
          ))}
        </Group>
      </Stack>
    </Stack>
  );
}
