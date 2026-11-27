"use client";

import React, { memo } from "react";
import {
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { Flag } from "lucide-react";
import type { ExamPaper } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";
import classes from "./QuestionCard.module.css";
import { ExamQuestionType } from "@/lib/graphql/generated/schemaTypes";
import {
  MAX_TEXT_ANSWER_LENGTH,
  chosenOptionIds,
  questionNumberLabel,
  typedAnswerText,
  type ExamAnswer,
} from "../../../examAnswers";
import { questionAnchorId } from "../../../constants/examSitting";

type Section = ExamPaper["sections"][number];
type Part = Section["parts"][number];
type QuestionSet = Part["questionSets"][number];
type Question = QuestionSet["questions"][number];

export interface QuestionCardProps {
  /** The set the question belongs to: a matching question chooses from its shared list. */
  questionSet: QuestionSet;
  question: Question;
  /**
   * The learner's answer as stored - the same object until it changes, which
   * is what lets an untouched question skip rendering while another is typed in.
   */
  answer?: ExamAnswer;
  isFlagged: boolean;
  /** The question the learner is on: the palette's highlight and the gap that stands out. */
  isCurrent: boolean;
  /** Called with this question's id, so one handler serves every question. */
  onSelectOption: (questionId: string, optionId: string) => void;
  onChangeText?: (questionId: string, text: string) => void;
  onToggleFlag: (questionId: string) => void;
}

/**
 * One question of a part: its number, the flag, the prompt and the way to
 * answer it - options, the set's shared list for matching, or a field to type
 * in. What the question is about (the passage, the audio) belongs to the part
 * or the set and is shown once above, by the sheet.
 */
export const QuestionCard = memo(function QuestionCard({
  questionSet,
  question,
  answer,
  isFlagged,
  isCurrent,
  onSelectOption: selectOption,
  onChangeText: changeText,
  onToggleFlag: toggleFlag,
}: QuestionCardProps) {
  const { t, isVi } = useLanguage();
  const multiple = question.questionType === ExamQuestionType.MULTIPLE_CHOICE;
  const typed = question.questionType === ExamQuestionType.TEXT_ENTRY;
  // A matching question chooses one entry of the list its whole set shares,
  // labelled as the paper labels it (i, ii, iii or A, B, C).
  const choices =
    question.questionType === ExamQuestionType.MATCHING
      ? (questionSet.setOptions ?? []).map((entry) => ({
          id: entry.id,
          letter: entry.label,
          content: entry.content ?? "",
        }))
      : question.options.map((option, index) => ({
          id: option.id,
          letter: String.fromCharCode(65 + index),
          content: option.content,
        }));
  const numberLabel = questionNumberLabel(question);
  const selected = chosenOptionIds(answer);
  const textAnswer = typedAnswerText(answer);
  const onSelectOption = (optionId: string) =>
    selectOption(question.id, optionId);
  const onToggleFlag = () => toggleFlag(question.id);

  return (
    <Paper
      id={questionAnchorId(question.id)}
      p="md"
      radius="md"
      withBorder
      className={classes.questionRoot}
      data-current={isCurrent || undefined}
      aria-current={isCurrent ? "step" : undefined}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <ThemeIcon size={26} radius="xl" color="navy.9">
              <Text size="xs" fw={700} c="white">
                {numberLabel}
              </Text>
            </ThemeIcon>
            <Text size="xs" c="ink.5" fw={600}>
              {t.exam.questionPrefix} {numberLabel}
            </Text>
          </Group>
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

        <Text fw={600} size="md" c="navy.9" lh={1.5}>
          {question.content}
        </Text>

        {typed && (
          <TextInput
            label={isVi ? "Câu trả lời của bạn" : "Your answer"}
            description={
              isVi
                ? "Gõ đúng chính tả. Không phân biệt chữ hoa, chữ thường."
                : "Spell it correctly. Capital letters do not matter."
            }
            value={textAnswer}
            maxLength={MAX_TEXT_ANSWER_LENGTH}
            onChange={(event) =>
              changeText?.(question.id, event.currentTarget.value)
            }
            autoComplete="off"
            spellCheck={false}
          />
        )}

        {!typed && (
          <Box
            role={multiple ? "group" : "radiogroup"}
            aria-label={question.content}
          >
            {multiple && (
              <Text size="sm" c="dimmed" mb="sm">
                {isVi
                  ? `Chọn ${question.choiceLimit ?? ""} đáp án.`
                  : `Choose ${question.choiceLimit ?? ""} answers.`}
              </Text>
            )}
            <Stack gap="xs">
              {choices.map((option, optIdx) => {
                const isSelected = selected.includes(option.id);
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
                          (optIdx + offset + choices.length) % choices.length;
                        onSelectOption(choices[next].id);
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
                          {option.letter}
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
        )}
      </Stack>
    </Paper>
  );
});
