"use client";

import React from "react";
import {
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Image,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { ArrowLeft, ArrowRight, Flag, Headphones, Volume2 } from "lucide-react";
import type { ExamPaper } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";
import classes from "./QuestionCard.module.css";

type Section = ExamPaper["sections"][number];
type Part = Section["parts"][number];
type QuestionSet = Part["questionSets"][number];
type Question = QuestionSet["questions"][number];

export interface QuestionCardProps {
  section: Section;
  part: Part;
  questionSet: QuestionSet;
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  isFlagged: boolean;
  onSelectOption: (optionId: string) => void;
  onToggleFlag: () => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function QuestionCard({
  section,
  part,
  questionSet,
  question,
  questionIndex,
  totalQuestions,
  selectedOptionId,
  selectedOptionIds,
  isFlagged,
  onSelectOption,
  onToggleFlag,
  onPrevQuestion,
  onNextQuestion,
  hasPrev,
  hasNext,
}: QuestionCardProps) {
  const { t, isVi } = useLanguage();
  const multiple = question.questionType === "MULTIPLE_CHOICE";
  const selected =
    selectedOptionIds ?? (selectedOptionId ? [selectedOptionId] : []);
  const isListening = section.sectionType.toUpperCase().includes("LISTEN");

  return (
    <Card
      radius="lg"
      p={{ base: "md", md: "xl" }}
      withBorder
      className={classes.cardRoot}
    >
      <Stack gap="lg">
        {/* Part Header & Instructions */}
        <Box p="sm" className={classes.partHeader}>
          <Group justify="space-between" align="center" mb={4}>
            <Text fw={700} size="sm" c="navy.9">
              {part.title}
            </Text>
            {isListening && (
              <Group gap={4}>
                <Headphones size={14} color="var(--mantine-color-navy-9)" />
                <Text size="xs" fw={600} c="navy.9">
                  {t.exam.listeningSection}
                </Text>
              </Group>
            )}
          </Group>
          {part.instruction && (
            <Text size="xs" c="ink.6" style={{ fontStyle: "italic" }}>
              {part.instruction}
            </Text>
          )}
        </Box>

        {(part.content || part.audioUrl || part.imageUrl) && (
          <Card withBorder>
            <Stack>
              {part.content && (
                <Text style={{ whiteSpace: "pre-wrap" }}>{part.content}</Text>
              )}
              {part.audioUrl && (
                <audio
                  controls
                  preload="none"
                  src={part.audioUrl}
                  style={{ width: "100%" }}
                />
              )}
              {part.imageUrl && (
                <Image
                  src={part.imageUrl}
                  alt={isVi ? "Ảnh trong phần thi" : "Part stimulus"}
                  fit="contain"
                  mah={360}
                />
              )}
            </Stack>
          </Card>
        )}
        {/* Question Set Stimulus / Passage / Audio */}
        {(questionSet.content ||
          questionSet.audioUrl ||
          questionSet.imageUrl ||
          questionSet.instruction) && (
          <Card p="md" radius="md" className={classes.stimulusCard}>
            {questionSet.title && (
              <Text fw={700} size="sm" c="navy.9" mb={4}>
                {questionSet.title}
              </Text>
            )}
            {questionSet.instruction && (
              <Text size="xs" c="ink.5" mb="xs" style={{ fontStyle: "italic" }}>
                {questionSet.instruction}
              </Text>
            )}
            {questionSet.content && (
              <Text
                size="sm"
                c="ink.8"
                style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}
              >
                {questionSet.content}
              </Text>
            )}
            {questionSet.imageUrl && (
              <Image
                src={questionSet.imageUrl}
                alt={isVi ? "Ảnh trong nhóm câu" : "Question stimulus"}
                fit="contain"
                mah={360}
              />
            )}
            {/* URL đã được backend ký sẵn và tự hết hạn, phát thẳng được. */}
            {questionSet.audioUrl && (
              <Box mt="xs" p="xs" className={classes.audioWidget}>
                <Group gap="xs" mb={6}>
                  <Volume2 size={18} color="var(--mantine-color-navy-9)" />
                  <Text size="xs" fw={600} c="navy.9">
                    {t.exam.audioStimulus}
                  </Text>
                </Group>
                <audio controls preload="none" src={questionSet.audioUrl}>
                  {t.exam.audioStimulus}
                </audio>
              </Box>
            )}
          </Card>
        )}

        {/* Question Item Header */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon size={26} radius="xl" color="navy.9">
              <Text size="xs" fw={700} c="white">
                {questionIndex + 1}
              </Text>
            </ThemeIcon>
            <Text size="xs" c="ink.5" fw={600}>
              {t.exam.questionPrefix} {questionIndex + 1} / {totalQuestions}
            </Text>
          </Group>

          {/* Flag Button */}
          <Button
            variant={isFlagged ? "filled" : "subtle"}
            color={isFlagged ? "yellow" : "gray"}
            size="xs"
            radius="xl"
            leftSection={<Flag size={14} />}
            onClick={onToggleFlag}
          >
            {isFlagged ? t.exam.flagged : t.exam.flag}
          </Button>
        </Group>

        {/* Question Prompt */}
        <Box>
          <Text fw={600} size="md" c="navy.9" lh={1.5}>
            {question.content}
          </Text>
        </Box>

        {/* Answer Options */}
        <Stack gap="xs">
          <Box
            role={multiple ? "group" : "radiogroup"}
            aria-label={question.content}
          >
            {multiple && (
              <Text size="sm" c="dimmed" mb="sm">
                {isVi
                  ? "Chọn tất cả đáp án đúng."
                  : "Select all correct answers."}
              </Text>
            )}
            <Stack gap="xs">
              {question.options.map((option, optIdx) => {
                const isSelected = selected.includes(option.id);
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <UnstyledButton
                    key={option.id}
                    role={multiple ? "checkbox" : "radio"}
                    aria-checked={isSelected}
                    onKeyDown={(event) => {
                      if (
                        !multiple &&
                        [
                          "ArrowUp",
                          "ArrowDown",
                          "ArrowLeft",
                          "ArrowRight",
                        ].includes(event.key)
                      ) {
                        event.preventDefault();
                        const offset =
                          event.key === "ArrowUp" || event.key === "ArrowLeft"
                            ? -1
                            : 1;
                        const next =
                          (optIdx + offset + question.options.length) %
                          question.options.length;
                        onSelectOption(question.options[next].id);
                        const buttons =
                          event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                            '[role="radio"]',
                          );
                        buttons?.[next]?.focus();
                      }
                    }}
                    onClick={() => onSelectOption(option.id)}
                    p="sm"
                    className={
                      isSelected
                        ? classes.optionItemSelected
                        : classes.optionItem
                    }
                    style={{ width: "100%", borderRadius: 8, display: "block" }}
                  >
                    <Flex align="center" gap="md">
                      <ThemeIcon
                        size={26}
                        radius="xl"
                        color={isSelected ? "navy.9" : "gray.2"}
                        c={isSelected ? "white" : "ink.8"}
                      >
                        <Text size="xs" fw={700}>
                          {letter}
                        </Text>
                      </ThemeIcon>
                      <Text
                        size="sm"
                        c={isSelected ? "navy.9" : "ink.8"}
                        fw={isSelected ? 600 : 400}
                        style={{ flex: 1 }}
                      >
                        {option.content}
                      </Text>
                    </Flex>
                  </UnstyledButton>
                );
              })}
            </Stack>
          </Box>
        </Stack>

        <Divider color="gray.2" />

        {/* Navigation Action Buttons */}
        <Group justify="space-between">
          <Button
            variant="default"
            radius="xl"
            size="sm"
            leftSection={<ArrowLeft size={16} />}
            onClick={onPrevQuestion}
            disabled={!hasPrev}
          >
            {t.exam.prevQuestion}
          </Button>
          <Button
            radius="xl"
            size="sm"
            rightSection={<ArrowRight size={16} />}
            onClick={onNextQuestion}
            disabled={!hasNext}
            className={classes.nextBtn}
          >
            {t.exam.nextQuestion}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
