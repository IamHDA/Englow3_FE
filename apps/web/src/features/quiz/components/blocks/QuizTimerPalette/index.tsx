"use client";

import {
  Box,
  Button,
  Card,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAlertTriangle,
  IconClock,
  IconFlag,
  IconSend,
} from "@tabler/icons-react";
import React from "react";
import { QuizQuestion } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface QuizTimerPaletteProps {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, unknown>;
  flaggedIds: string[];
  timeRemainingFormatted: string;
  timeRemainingSeconds: number;
  onSelectQuestion: (index: number) => void;
  onToggleFlag: (questionId: string) => void;
  onSubmit: () => void;
  /** Đang gửi bài lên server - khoá nút xác nhận để không nộp hai lần. */
  submitting: boolean;
}

export function QuizTimerPalette({
  questions,
  currentIndex,
  answers,
  flaggedIds,
  timeRemainingFormatted,
  timeRemainingSeconds,
  onSelectQuestion,
  onToggleFlag,
  onSubmit,
  submitting,
}: QuizTimerPaletteProps) {
  const { t } = useLanguage();
  const [opened, { open, close }] = useDisclosure(false);

  const currentQ = questions[currentIndex];
  const isCurrentFlagged = currentQ ? flaggedIds.includes(currentQ.id) : false;

  const answeredCount = questions.filter((q) => {
    const val = answers[q.id];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "object") return Object.keys(val).length > 0;
    return true;
  }).length;

  const isTimeCritical = timeRemainingSeconds < 120; // less than 2 minutes

  const handleConfirmSubmit = () => {
    close();
    onSubmit();
  };

  return (
    <>
      <Card withBorder padding="md" radius="md">
        <Stack gap="md">
          {/* Timer display */}
          <Group
            justify="space-between"
            p="xs"
            style={{
              borderRadius: "var(--mantine-radius-md)",
              backgroundColor: isTimeCritical
                ? "var(--mantine-color-red-0)"
                : "var(--mantine-color-indigo-0)",
            }}
          >
            <Group gap="xs">
              <ThemeIcon
                variant="light"
                color={isTimeCritical ? "red" : "indigo"}
                size="sm"
                radius="xl"
              >
                <IconClock size={16} />
              </ThemeIcon>
              <Text fz="xs" fw={700} c={isTimeCritical ? "red.9" : "indigo.9"}>
                {t.quiz.timeRemainingCaps}
              </Text>
            </Group>
            <Text
              fz="lg"
              fw={800}
              c={isTimeCritical ? "red.7" : "indigo.7"}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {timeRemainingFormatted}
            </Text>
          </Group>

          {/* Palette Questions Grid */}
          <Box>
            <Group justify="space-between" mb="xs">
              <Text fz="xs" fw={700} c="dimmed">
                {t.quiz.questionPaletteLabel}
              </Text>
              <Text fz="xs" fw={600} c="indigo">
                {answeredCount}/{questions.length} {t.quiz.answeredLabel}
              </Text>
            </Group>

            <SimpleGrid cols={5} spacing="xs">
              {questions.map((q, idx) => {
                const isSelected = idx === currentIndex;
                const isFlagged = flaggedIds.includes(q.id);
                const ans = answers[q.id];
                const hasAnswer =
                  ans !== undefined &&
                  ans !== null &&
                  ans !== "" &&
                  (Array.isArray(ans)
                    ? ans.length > 0
                    : typeof ans === "object"
                      ? Object.keys(ans as Record<string, unknown>).length > 0
                      : true);

                let variant: "filled" | "light" | "outline" = "outline";
                let color = "gray";

                if (isSelected) {
                  variant = "filled";
                  color = "indigo";
                } else if (hasAnswer) {
                  variant = "light";
                  color = "teal";
                }

                return (
                  <Button
                    key={q.id}
                    variant={variant}
                    color={color}
                    size="xs"
                    p={0}
                    radius="md"
                    onClick={() => onSelectQuestion(idx)}
                    style={{
                      position: "relative",
                      height: 36,
                      borderWidth: isSelected ? 2 : 1,
                    }}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <Box
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: "var(--mantine-color-orange-6)",
                        }}
                      />
                    )}
                  </Button>
                );
              })}
            </SimpleGrid>
          </Box>

          {/* Action buttons */}
          <Stack gap="xs">
            {currentQ && (
              <Button
                variant="light"
                color={isCurrentFlagged ? "orange" : "gray"}
                size="sm"
                radius="md"
                onClick={() => onToggleFlag(currentQ.id)}
                leftSection={<IconFlag size={16} />}
              >
                {isCurrentFlagged ? t.quiz.unflagButton : t.quiz.flagButton}
              </Button>
            )}

            <Button
              variant="filled"
              color="indigo"
              size="sm"
              radius="md"
              onClick={open}
              disabled={submitting || timeRemainingSeconds <= 0}
              leftSection={<IconSend size={16} />}
            >
              {t.quiz.submitExam}
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={t.quiz.confirmSubmitTitle}
        centered
      >
        <Stack gap="md">
          {answeredCount < questions.length ? (
            <Group gap="xs" align="flex-start" wrap="nowrap">
              <ThemeIcon variant="light" color="orange" size="md" radius="xl">
                <IconAlertTriangle size={18} />
              </ThemeIcon>
              <Text fz="sm">
                {t.quiz.unansweredWarningLong.replace(
                  "{count}",
                  String(questions.length - answeredCount),
                )}
              </Text>
            </Group>
          ) : (
            <Text fz="sm">{t.quiz.allAnsweredMessage}</Text>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={close}>
              {t.quiz.keepWorkingButton}
            </Button>
            <Button
              variant="filled"
              color="indigo"
              onClick={handleConfirmSubmit}
              loading={submitting}
              disabled={timeRemainingSeconds <= 0}
            >
              {t.quiz.confirmSubmitButton}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
