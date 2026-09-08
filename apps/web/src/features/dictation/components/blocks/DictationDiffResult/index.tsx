"use client";

import {
  Badge,
  Button,
  Flex,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { DiffResult } from "../../../types";

interface DictationDiffResultProps {
  diff: DiffResult;
  expectedSentence: string;
  onNextSentence: () => void;
  onTryAgain: () => void;
  onListenAgain: () => void;
  isLastSentence: boolean;
}

export function DictationDiffResult({
  diff,
  expectedSentence,
  onNextSentence,
  onTryAgain,
  onListenAgain,
  isLastSentence,
}: DictationDiffResultProps) {
  const { isVi, t } = useLanguage();
  const [revealMode, setRevealMode] = useState<"mistakes" | "full">("mistakes");

  const isPerfect = diff.mistakesCount === 0;

  return (
    <Paper radius="md" p="lg" withBorder bg="white">
      <Stack gap="md">
        {/* Top Header Status */}
        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="xs">
            <ThemeIcon
              size={36}
              radius="xl"
              color={isPerfect ? "teal" : diff.accuracyPercent >= 70 ? "orange" : "warn"}
              variant="light"
            >
              {isPerfect ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </ThemeIcon>
            <Stack gap={2}>
              <Title order={3} size="h4" fw={700} c="ink.9">
                {isPerfect
                  ? isVi
                    ? "Xuất sắc! Bạn đã gõ đúng 100%"
                    : "Outstanding! 100% Accuracy"
                  : isVi
                  ? `${diff.mistakesCount} từ cần chú ý sửa lại`
                  : `${diff.mistakesCount} words need correction`}
              </Title>
              <Text size="xs" c="ink.6">
                {isVi
                  ? `Độ chính xác: ${diff.accuracyPercent}% (${diff.correctWordsCount} / ${diff.totalWordsCount} từ đúng)`
                  : `Accuracy: ${diff.accuracyPercent}% (${diff.correctWordsCount} / ${diff.totalWordsCount} words correct)`}
              </Text>
            </Stack>
          </Group>

          <Badge
            size="lg"
            radius="sm"
            color={isPerfect ? "teal" : diff.accuracyPercent >= 70 ? "orange" : "warn"}
            variant="filled"
          >
            {diff.accuracyPercent}% {isVi ? "Chính xác" : "Accuracy"}
          </Badge>
        </Group>

        {/* Word Diff Chips */}
        <Paper
          p="md"
          radius="md"
          withBorder
          style={{ backgroundColor: "var(--mantine-color-ink-0)" }}
        >
          <Text size="xs" fw={600} c="ink.5" mb="xs" style={{ textTransform: "uppercase" }}>
            {t.dictation.wordDiffResult}:
          </Text>

          <Flex gap="xs" wrap="wrap" align="center">
            {diff.items.map((item, idx) => {
              if (item.type === "ok") {
                return (
                  <Text key={idx} fw={600} size="md" c="ink.9" style={{ padding: "2px 4px" }}>
                    {item.text}
                  </Text>
                );
              }

              if (item.type === "bad") {
                return (
                  <Paper
                    key={idx}
                    px="xs"
                    py={2}
                    radius="sm"
                    withBorder
                    style={{
                      backgroundColor: "var(--mantine-color-warn-0)",
                      borderColor: "var(--mantine-color-warn-3)",
                    }}
                  >
                    <Text
                      fw={600}
                      size="md"
                      c="warn.9"
                      style={{ textDecoration: "line-through" }}
                    >
                      {item.text}
                    </Text>
                  </Paper>
                );
              }

              if (item.type === "missing") {
                return (
                  <Paper
                    key={idx}
                    px="xs"
                    py={2}
                    radius="sm"
                    withBorder
                    style={{
                      backgroundColor: "var(--mantine-color-orange-0)",
                      borderColor: "var(--mantine-color-orange-4)",
                      borderStyle: "dashed",
                    }}
                  >
                    <Text fw={700} size="md" c="orange.9">
                      {item.text}
                    </Text>
                  </Paper>
                );
              }

              // extra word
              return (
                <Paper
                  key={idx}
                  px="xs"
                  py={2}
                  radius="sm"
                  withBorder
                  style={{
                    backgroundColor: "var(--mantine-color-ink-1)",
                    borderColor: "var(--mantine-color-ink-3)",
                  }}
                >
                  <Text
                    fw={500}
                    size="md"
                    c="ink.5"
                    style={{ textDecoration: "line-through" }}
                  >
                    {item.text}
                  </Text>
                </Paper>
              );
            })}
          </Flex>

          {/* Diff Legend */}
          <Group gap="md" mt="sm" wrap="wrap">
            <Group gap={4}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: "var(--mantine-color-ink-9)",
                }}
              />
              <Text size="xs" c="ink.6">
                {isVi ? "Từ đúng" : "Correct"}
              </Text>
            </Group>
            <Group gap={4}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: "var(--mantine-color-warn-6)",
                }}
              />
              <Text size="xs" c="ink.6">
                {isVi ? "Từ sai" : "Incorrect"}
              </Text>
            </Group>
            <Group gap={4}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: "var(--mantine-color-orange-6)",
                }}
              />
              <Text size="xs" c="ink.6">
                {isVi ? "Từ còn thiếu" : "Missing"}
              </Text>
            </Group>
          </Group>
        </Paper>

        {/* Fixes Breakdown Panel */}
        <Paper p="md" radius="md" withBorder bg="white">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="xs" fw={700} c="ink.8" style={{ textTransform: "uppercase" }}>
              {revealMode === "full"
                ? isVi
                  ? "Toàn bộ câu mẫu:"
                  : "Full Target Sentence:"
                : isVi
                ? "Các từ cần sửa:"
                : "Tokens to Fix:"}
            </Text>

            <SegmentedControl
              size="xs"
              value={revealMode}
              onChange={(val) => setRevealMode(val as "mistakes" | "full")}
              data={[
                { label: isVi ? "Chỉ từ lỗi" : "Mistakes only", value: "mistakes" },
                { label: isVi ? "Cả câu mẫu" : "Full sentence", value: "full" },
              ]}
            />
          </Group>

          {revealMode === "full" ? (
            <Text size="md" fw={600} c="navy.9" style={{ fontStyle: "italic" }}>
              “{expectedSentence}”
            </Text>
          ) : (
            <Stack gap="xs">
              {diff.fixes.length === 0 ? (
                <Text size="sm" c="teal.8" fw={500}>
                  {isVi ? "Không có từ lỗi nào cần sửa!" : "No errors detected!"}
                </Text>
              ) : (
                diff.fixes.map((fix, i) => (
                  <Group key={i} gap="xs">
                    <Text
                      size="sm"
                      c={fix.from === "missing" ? "orange.8" : "warn.8"}
                      fw={600}
                      style={{ textDecoration: fix.strike ? "line-through" : "none" }}
                    >
                      {fix.from}
                    </Text>
                    <Text size="sm" c="ink.4">
                      →
                    </Text>
                    <Text size="sm" c="teal.8" fw={700}>
                      {fix.to}
                    </Text>
                  </Group>
                ))
              )}
            </Stack>
          )}
        </Paper>

        {/* Footer Actions */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align="center"
          gap="sm"
        >
          <Group gap="xs">
            <Button
              variant="default"
              size="sm"
              radius="md"
              onClick={onListenAgain}
              leftSection={<Volume2 size={15} />}
            >
              {isVi ? "Nghe lại câu này" : "Replay Audio"}
            </Button>
            <Button
              variant="default"
              size="sm"
              radius="md"
              onClick={onTryAgain}
              leftSection={<RotateCcw size={15} />}
            >
              {isVi ? "Gõ lại thử thách" : "Try Again"}
            </Button>
          </Group>

          <Button
            variant="filled"
            color="navy"
            size="sm"
            radius="md"
            onClick={onNextSentence}
            rightSection={<ArrowRight size={15} />}
            fw={600}
          >
            {isLastSentence
              ? isVi
                ? "Hoàn thành & Xem kết quả"
                : "Finish & View Results"
              : isVi
              ? "Câu tiếp theo →"
              : "Next Sentence →"}
          </Button>
        </Flex>
      </Stack>
    </Paper>
  );
}
