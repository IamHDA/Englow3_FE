'use client';

import React from 'react';
import {
  Box,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { Flag } from 'lucide-react';
import { useLanguage } from '@/shared/hooks/useLanguage';
import classes from './QuestionPalette.module.css';

export interface FlatQuestionItem {
  globalIndex: number;
  sectionIndex: number;
  partIndex: number;
  questionSetIndex: number;
  questionId: string;
  sectionType: string;
  partTitle: string;
}

export interface QuestionPaletteProps {
  questions: FlatQuestionItem[];
  currentIndex: number;
  answers: Record<string, string>; // questionId -> optionId
  flaggedQuestionIds: Set<string>;
  onSelectQuestion: (index: number) => void;
}

export function QuestionPalette({
  questions,
  currentIndex,
  answers,
  flaggedQuestionIds,
  onSelectQuestion,
}: QuestionPaletteProps) {
  const { t } = useLanguage();
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestionIds.size;
  const totalCount = questions.length;

  return (
    <Card
      radius="lg"
      p="md"
      withBorder
      className={classes.paletteRoot}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Text fw={700} size="sm" c="navy.9">
            {t.exam.paletteTitle}
          </Text>
          <Text size="xs" c="ink.5" fw={600}>
            {t.exam.paletteCompleted
              .replace('{answered}', String(answeredCount))
              .replace('{total}', String(totalCount))}
          </Text>
        </Group>

        {/* Legend */}
        <Group gap="sm" p={8} className={classes.legendContainer}>
          <Group gap={5} align="center">
            <Box className={classes.legendDotAnswered} />
            <Text size="xs" c="ink.6">
              {t.exam.legendAnswered}
            </Text>
          </Group>
          <Group gap={5} align="center">
            <Box className={classes.legendDotFlagged} />
            <Text size="xs" c="ink.6">
              {t.exam.legendFlagged} ({flaggedCount})
            </Text>
          </Group>
          <Group gap={5} align="center">
            <Box className={classes.legendDotUnanswered} />
            <Text size="xs" c="ink.6">
              {t.exam.legendUnanswered}
            </Text>
          </Group>
        </Group>

        {/* Palette Grid */}
        <SimpleGrid cols={5} spacing={6}>
          {questions.map((q) => {
            const isAnswered = !!answers[q.questionId];
            const isFlagged = flaggedQuestionIds.has(q.questionId);
            const isCurrent = q.globalIndex === currentIndex;

            const status = isFlagged
              ? 'flagged'
              : isAnswered
              ? 'answered'
              : 'unanswered';

            return (
              <UnstyledButton
                key={q.questionId}
                onClick={() => onSelectQuestion(q.globalIndex)}
                className={`${classes.paletteBtn} ${isCurrent ? classes.paletteBtnCurrent : ''}`}
                data-status={status}
                aria-label={t.exam.questionAria.replace('{index}', String(q.globalIndex + 1))}
              >
                {q.globalIndex + 1}
                {isFlagged && (
                  <Box className={classes.flagIconPin}>
                    <Flag size={10} color="#F59E0B" fill="#F59E0B" />
                  </Box>
                )}
              </UnstyledButton>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Card>
  );
}
