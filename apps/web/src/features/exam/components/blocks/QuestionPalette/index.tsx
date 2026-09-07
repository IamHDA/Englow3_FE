'use client';

import React from 'react';
import {
  Box,
  Card,
  Flex,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { Flag } from 'lucide-react';
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
            Bảng câu hỏi
          </Text>
          <Text size="xs" c="ink.5" fw={600}>
            {answeredCount}/{totalCount} đã làm
          </Text>
        </Group>

        {/* Legend */}
        <Flex wrap="wrap" gap="xs" p={8} className={classes.legendContainer}>
          <Flex align="center" gap={4}>
            <Box className={classes.legendDotAnswered} />
            <Text size="xs" c="ink.6">
              Đã làm
            </Text>
          </Flex>
          <Flex align="center" gap={4}>
            <Box className={classes.legendDotFlagged} />
            <Text size="xs" c="ink.6">
              Gắn cờ ({flaggedCount})
            </Text>
          </Flex>
          <Flex align="center" gap={4}>
            <Box className={classes.legendDotUnanswered} />
            <Text size="xs" c="ink.6">
              Chưa làm
            </Text>
          </Flex>
        </Flex>

        {/* Palette Grid */}
        <SimpleGrid cols={5} spacing={6}>
          {questions.map((q) => {
            const isAnswered = !!answers[q.questionId];
            const isFlagged = flaggedQuestionIds.has(q.questionId);
            const isCurrent = q.globalIndex === currentIndex;

            let bgColor = 'var(--mantine-color-white)';
            let textColor = 'var(--mantine-color-ink-8)';
            let borderColor = 'var(--mantine-color-ink-2)';

            if (isFlagged) {
              bgColor = '#FEF3C7';
              textColor = '#92400E';
              borderColor = '#F59E0B';
            } else if (isAnswered) {
              bgColor = 'var(--mantine-color-navy-9)';
              textColor = 'var(--mantine-color-white)';
              borderColor = 'var(--mantine-color-navy-9)';
            }

            return (
              <Box
                key={q.questionId}
                onClick={() => onSelectQuestion(q.globalIndex)}
                className={`${classes.paletteBtn} ${isCurrent ? classes.paletteBtnCurrent : ''}`}
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                  border: `1.5px solid ${borderColor}`,
                }}
              >
                {q.globalIndex + 1}
                {isFlagged && (
                  <Box className={classes.flagIconPin}>
                    <Flag size={10} color="#F59E0B" fill="#F59E0B" />
                  </Box>
                )}
              </Box>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Card>
  );
}
