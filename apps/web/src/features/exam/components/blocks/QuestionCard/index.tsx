'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Radio,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
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
            <ThemeIcon size={26} radius="xl" color="navy.9">
              <Text size="xs" fw={700} c="white">
                {questionIndex + 1}
              </Text>
            </ThemeIcon>
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
          <Text fw={600} size="md" c="navy.9" lh={1.5}>
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
                  <UnstyledButton
                    key={option.id}
                    onClick={() => onSelectOption(option.id)}
                    p="sm"
                    className={isSelected ? classes.optionItemSelected : classes.optionItem}
                    style={{ width: '100%', borderRadius: 8, display: 'block' }}
                  >
                    <Flex align="center" gap="md">
                      <ThemeIcon
                        size={26}
                        radius="xl"
                        color={isSelected ? 'navy.9' : 'gray.2'}
                        c={isSelected ? 'white' : 'ink.8'}
                      >
                        <Text size="xs" fw={700}>
                          {letter}
                        </Text>
                      </ThemeIcon>
                      <Text
                        size="sm"
                        c={isSelected ? 'navy.9' : 'ink.8'}
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
          </Radio.Group>
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
