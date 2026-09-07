'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  Flex,
  Group,
  Radio,
  Stack,
  Text,
} from '@mantine/core';
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  Headphones,
  Volume2,
} from 'lucide-react';
import type { ExamPaperQuery } from '@/lib/graphql/generated/hooks';
import classes from './QuestionCard.module.css';

type ExamPaper = NonNullable<ExamPaperQuery['examPaper']>;
type Section = ExamPaper['sections'][number];
type Part = Section['parts'][number];
type QuestionSet = Part['questionSets'][number];
type Question = QuestionSet['questions'][number];

export interface QuestionCardProps {
  section: Section;
  part: Part;
  questionSet: QuestionSet;
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedOptionId?: string;
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
  isFlagged,
  onSelectOption,
  onToggleFlag,
  onPrevQuestion,
  onNextQuestion,
  hasPrev,
  hasNext,
}: QuestionCardProps) {
  const isListening = section.sectionType.toUpperCase().includes('LISTEN');

  return (
    <Card
      radius="lg"
      p={{ base: 'md', md: 'xl' }}
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
                  Phần Nghe
                </Text>
              </Group>
            )}
          </Group>
          {part.instruction && (
            <Text size="xs" c="ink.6" style={{ fontStyle: 'italic' }}>
              {part.instruction}
            </Text>
          )}
        </Box>

        {/* Question Set Stimulus / Passage / Audio */}
        {(questionSet.content || questionSet.audioObjectKey || questionSet.instruction) && (
          <Card p="md" radius="md" className={classes.stimulusCard}>
            {questionSet.title && (
              <Text fw={700} size="sm" c="navy.9" mb={4}>
                {questionSet.title}
              </Text>
            )}
            {questionSet.instruction && (
              <Text size="xs" c="ink.5" mb="xs" style={{ fontStyle: 'italic' }}>
                {questionSet.instruction}
              </Text>
            )}
            {questionSet.content && (
              <Text size="sm" c="ink.8" style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {questionSet.content}
              </Text>
            )}
            {questionSet.audioObjectKey && (
              <Box mt="xs" p="xs" className={classes.audioWidget}>
                <Group gap="xs">
                  <Volume2 size={18} color="var(--mantine-color-navy-9)" />
                  <Text size="xs" fw={600} c="navy.9">
                    Audio bài nghe: {questionSet.audioObjectKey}
                  </Text>
                </Group>
              </Box>
            )}
          </Card>
        )}

        {/* Question Item Header */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <span className={classes.questionNumberBadge}>
              {questionIndex + 1}
            </span>
            <Text size="xs" c="ink.5" fw={600}>
              Câu {questionIndex + 1} / {totalQuestions}
            </Text>
          </Group>

          {/* Flag Button */}
          <Button
            variant={isFlagged ? 'filled' : 'subtle'}
            color={isFlagged ? 'yellow' : 'gray'}
            size="xs"
            radius="xl"
            leftSection={<Flag size={14} />}
            onClick={onToggleFlag}
          >
            {isFlagged ? 'Đã gắn cờ' : 'Gắn cờ'}
          </Button>
        </Group>

        {/* Question Prompt */}
        <Box>
          <Text fw={600} size="md" c="navy.9" style={{ lineHeight: 1.5 }}>
            {question.content}
          </Text>
        </Box>

        {/* Answer Options */}
        <Stack gap="xs">
          <Radio.Group
            value={selectedOptionId || ''}
            onChange={(val) => onSelectOption(val)}
          >
            <Stack gap="xs">
              {question.options.map((option, optIdx) => {
                const isSelected = selectedOptionId === option.id;
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <Box
                    key={option.id}
                    onClick={() => onSelectOption(option.id)}
                    p="sm"
                    className={isSelected ? classes.optionItemSelected : classes.optionItem}
                  >
                    <Flex align="center" gap="md">
                      <span
                        className={
                          isSelected ? classes.optionLetterSelected : classes.optionLetter
                        }
                      >
                        {letter}
                      </span>
                      <Text
                        size="sm"
                        c={isSelected ? 'navy.9' : 'ink.8'}
                        fw={isSelected ? 600 : 400}
                        style={{ flex: 1 }}
                      >
                        {option.content}
                      </Text>
                    </Flex>
                  </Box>
                );
              })}
            </Stack>
          </Radio.Group>
        </Stack>

        {/* Navigation Action Buttons */}
        <Group justify="space-between" pt="md" style={{ borderTop: '1px solid var(--mantine-color-ink-2)' }}>
          <Button
            variant="default"
            radius="xl"
            size="sm"
            leftSection={<ArrowLeft size={16} />}
            onClick={onPrevQuestion}
            disabled={!hasPrev}
          >
            Câu trước
          </Button>
          <Button
            radius="xl"
            size="sm"
            rightSection={<ArrowRight size={16} />}
            onClick={onNextQuestion}
            disabled={!hasNext}
            className={classes.nextBtn}
          >
            Câu tiếp theo
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
