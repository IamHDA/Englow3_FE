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

interface RewriteQuestionProps {
  question: QuizQuestion;
  selectedWords?: string[];
  onChange: (words: string[]) => void;
}

export function RewriteQuestion({
  question,
  selectedWords = [],
  onChange,
}: RewriteQuestionProps) {
  const bankWords = useMemo(() => {
    return question.rewriteWordBank || [];
  }, [question.rewriteWordBank]);

  // Compute available words count taking duplicates into account
  const availableBank = useMemo(() => {
    const counts: Record<string, number> = {};
    bankWords.forEach((w) => {
      counts[w] = (counts[w] || 0) + 1;
    });
    selectedWords.forEach((w) => {
      if (counts[w]) {
        counts[w] -= 1;
      }
    });

    const result: Array<{ word: string; isUsed: boolean; key: string }> = [];
    const usedTracker: Record<string, number> = {};
    bankWords.forEach((w, idx) => {
      usedTracker[w] = (usedTracker[w] || 0) + 1;
      const countUsedSoFar = selectedWords.filter((sw) => sw === w).length;
      const isUsed = usedTracker[w] <= countUsedSoFar;
      result.push({
        word: w,
        isUsed,
        key: `${w}-${idx}`,
      });
    });
    return result;
  }, [bankWords, selectedWords]);

  const handleAddWord = (word: string) => {
    onChange([...selectedWords, word]);
  };

  const handleRemoveWordAtIndex = (idx: number) => {
    const updated = [...selectedWords];
    updated.splice(idx, 1);
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

      {/* Original Sentence & Keyword */}
      <Card withBorder padding="md" radius="md" bg="var(--mantine-color-gray-0)">
        <Stack gap="xs">
          <Text fz="xs" fw={700} c="dimmed">
            CÂU GỐC:
          </Text>
          <Text fz="sm" fw={600} c="dark.8">
            &ldquo;{question.originalSentence}&rdquo;
          </Text>
          {question.rewriteKeyword && (
            <Group gap="xs" mt={4}>
              <Text fz="xs" fw={700} c="dimmed">
                TỪ KHOÁ BẮT BUỘC:
              </Text>
              <Badge variant="filled" color="indigo" size="md">
                {question.rewriteKeyword}
              </Badge>
            </Group>
          )}
        </Stack>
      </Card>

      {/* Answer Construction Area */}
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
              CÂU ĐÃ GHÉP CỦA BẠN (Click vào từ để gỡ bỏ):
            </Text>
            {selectedWords.length > 0 && (
              <Button
                variant="subtle"
                color="red"
                size="xs"
                onClick={handleReset}
                leftSection={<IconRefresh size={14} />}
              >
                Xóa làm lại
              </Button>
            )}
          </Group>

          {selectedWords.length === 0 ? (
            <Text fz="sm" c="dimmed" fs="italic" py="xs">
              Chưa chọn từ nào. Hãy click vào các thẻ từ trong ngân hàng từ phía dưới...
            </Text>
          ) : (
            <Group gap="xs" wrap="wrap">
              {selectedWords.map((word, idx) => (
                <Badge
                  key={idx}
                  size="lg"
                  variant="filled"
                  color="indigo"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemoveWordAtIndex(idx)}
                >
                  {word}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>
      </Card>

      {/* Word Bank */}
      <Stack gap="xs">
        <Text fz="xs" fw={700} c="dimmed">
          NGÂN HÀNG TỪ (Bao gồm cả từ gây nhiễu):
        </Text>
        <Group gap="xs" wrap="wrap">
          {availableBank.map((item) => (
            <Button
              key={item.key}
              variant="outline"
              color="indigo"
              size="sm"
              disabled={item.isUsed}
              onClick={() => handleAddWord(item.word)}
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
