'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Accordion,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Group,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import type { ExamPaperQuery } from '@/lib/graphql/generated/hooks';
import type { FlatQuestionItem } from '../QuestionPalette';
import classes from './ExamResultView.module.css';

type ExamPaper = NonNullable<ExamPaperQuery['examPaper']>;

export interface ExamResultViewProps {
  paper: ExamPaper;
  questions: FlatQuestionItem[];
  answers: Record<string, string>; // questionId -> optionId
  timeSpentSeconds: number;
  onRetake: () => void;
}

export function ExamResultView({
  paper,
  questions,
  answers,
  timeSpentSeconds,
  onRetake,
}: ExamResultViewProps) {
  const [filterTab, setFilterTab] = useState<string>('all');

  // Build a lookup map of all questions in paper
  const questionMap = new Map<
    string,
    {
      question: ExamPaper['sections'][number]['parts'][number]['questionSets'][number]['questions'][number];
      partTitle: string;
      sectionType: string;
    }
  >();

  paper.sections.forEach((sec) => {
    sec.parts.forEach((part) => {
      part.questionSets.forEach((qs) => {
        qs.questions.forEach((q) => {
          questionMap.set(q.id, {
            question: q,
            partTitle: part.title,
            sectionType: sec.sectionType,
          });
        });
      });
    });
  });

  // Calculate results
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  const evaluatedQuestions = questions.map((item) => {
    const qData = questionMap.get(item.questionId);
    const q = qData?.question;
    const selectedOptionId = answers[item.questionId];

    const correctOption = q?.options.find((o) => o.correct);
    const selectedOption = q?.options.find((o) => o.id === selectedOptionId);

    const isAnswered = !!selectedOptionId;
    const isCorrect = isAnswered && selectedOption?.correct === true;

    if (!isAnswered) {
      skippedCount++;
    } else if (isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }

    return {
      item,
      question: q,
      partTitle: qData?.partTitle || '',
      sectionType: qData?.sectionType || '',
      selectedOptionId,
      selectedOption,
      correctOption,
      isAnswered,
      isCorrect,
    };
  });

  const totalQuestions = questions.length;
  const accuracyPercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const scaledScore = Math.round((correctCount / (totalQuestions || 1)) * paper.maxRawScore);

  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;
  const timeFormatted = `${minutes} phút ${seconds.toString().padStart(2, '0')} giây`;

  const filteredQuestions = evaluatedQuestions.filter((eq) => {
    if (filterTab === 'correct') return eq.isCorrect;
    if (filterTab === 'incorrect') return eq.isAnswered && !eq.isCorrect;
    if (filterTab === 'skipped') return !eq.isAnswered;
    return true;
  });

  return (
    <Box py="xl" px={{ base: 'md', md: 'xl' }} maw={1100} mx="auto">
      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Flex align="center" gap="xs">
          <Link href="/mock-test" className={classes.breadcrumbLink}>
            <ArrowLeft size={16} />
            <span>Thư viện đề</span>
          </Link>
          <Text c="ink.3" size="sm">
            /
          </Text>
          <Text c="navy.9" size="sm" fw={600}>
            Kết quả: {paper.title}
          </Text>
        </Flex>

        {/* Hero Score Banner */}
        <Card
          radius="lg"
          p={{ base: 'lg', md: 'xl' }}
          withBorder
          className={classes.bannerCard}
        >
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
              <div>
                <Badge color="navy" variant="light" size="lg" radius="xl" mb={8}>
                  Hoàn thành bài thi
                </Badge>
                <Title order={1} size="h2" c="navy.9" fw={700}>
                  {paper.title}
                </Title>
              </div>

              {/* Action buttons */}
              <Group gap="xs">
                <Button
                  variant="default"
                  radius="xl"
                  size="sm"
                  leftSection={<RotateCcw size={16} />}
                  onClick={onRetake}
                >
                  Làm lại
                </Button>
                <Button
                  component={Link}
                  href="/mock-test"
                  radius="xl"
                  size="sm"
                  className={classes.libraryBtn}
                >
                  Thư viện đề
                </Button>
              </Group>
            </Group>

            {/* Score Grid Cards */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
              <Card p="md" radius="md" className={classes.scoreCardEstimated}>
                <Group gap="xs" mb={4}>
                  <Award size={20} color="var(--mantine-color-navy-9)" />
                  <Text size="xs" fw={700} c="navy.9">
                    Điểm số ước tính
                  </Text>
                </Group>
                <Text size="xl" fw={800} c="navy.9">
                  {scaledScore} / {paper.maxRawScore}
                </Text>
                <Text size="xs" c="navy.7">
                  Độ chính xác: {accuracyPercent}%
                </Text>
              </Card>

              <Card p="md" radius="md" className={classes.scoreCardCorrect}>
                <Group gap="xs" mb={4}>
                  <CheckCircle2 size={20} color="#16A34A" />
                  <Text size="xs" fw={700} c="green.9">
                    Số câu đúng
                  </Text>
                </Group>
                <Text size="xl" fw={800} c="green.9">
                  {correctCount}
                </Text>
                <Text size="xs" c="green.7">
                  Trên tổng {totalQuestions} câu
                </Text>
              </Card>

              <Card p="md" radius="md" className={classes.scoreCardIncorrect}>
                <Group gap="xs" mb={4}>
                  <XCircle size={20} color="#D9483B" />
                  <Text size="xs" fw={700} c="warn.9">
                    Số câu sai
                  </Text>
                </Group>
                <Text size="xl" fw={800} c="warn.9">
                  {incorrectCount}
                </Text>
                <Text size="xs" c="warn.7">
                  Cần xem lại giải thích
                </Text>
              </Card>

              <Card p="md" radius="md" className={classes.scoreCardTime}>
                <Group gap="xs" mb={4}>
                  <Clock size={20} color="var(--mantine-color-ink-7)" />
                  <Text size="xs" fw={700} c="ink.7">
                    Thời gian làm
                  </Text>
                </Group>
                <Text size="md" fw={700} c="ink.9">
                  {timeFormatted}
                </Text>
                <Text size="xs" c="ink.5">
                  Bỏ qua: {skippedCount} câu
                </Text>
              </Card>
            </SimpleGrid>
          </Stack>
        </Card>

        {/* Detailed Answer Review Section */}
        <Card
          radius="lg"
          p={{ base: 'md', md: 'xl' }}
          withBorder
          className={classes.reviewCard}
        >
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <div>
                <Title order={2} size="h3" c="navy.9" fw={700}>
                  Đáp án & Giải thích chi tiết
                </Title>
                <Text size="xs" c="ink.5">
                  Xem lại toàn bộ câu hỏi kèm đáp án đúng và phân tích lý do
                </Text>
              </div>

              {/* Review Filter Tabs */}
              <Tabs value={filterTab} onChange={(val) => setFilterTab(val || 'all')}>
                <Tabs.List>
                  <Tabs.Tab value="all">Tất cả ({totalQuestions})</Tabs.Tab>
                  <Tabs.Tab value="correct">Đúng ({correctCount})</Tabs.Tab>
                  <Tabs.Tab value="incorrect">Sai ({incorrectCount})</Tabs.Tab>
                  <Tabs.Tab value="skipped">Chưa làm ({skippedCount})</Tabs.Tab>
                </Tabs.List>
              </Tabs>
            </Group>

            {/* Questions Review Accordion */}
            <Accordion variant="separated" radius="md">
              {filteredQuestions.map(
                ({ item, question, partTitle, selectedOption, correctOption, isCorrect, isAnswered }) => {
                  if (!question) return null;

                  return (
                    <Accordion.Item key={item.questionId} value={item.questionId}>
                      <Accordion.Control>
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap="sm">
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                backgroundColor: !isAnswered
                                  ? 'var(--mantine-color-ink-2)'
                                  : isCorrect
                                  ? '#DCFCE7'
                                  : '#FEE2E2',
                                color: !isAnswered
                                  ? 'var(--mantine-color-ink-6)'
                                  : isCorrect
                                  ? '#16A34A'
                                  : '#DC2626',
                                fontSize: 13,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {item.globalIndex + 1}
                            </span>
                            <div>
                              <Text size="sm" fw={600} c="navy.9" lineClamp={1}>
                                {question.content}
                              </Text>
                              <Text size="xs" c="ink.5">
                                {partTitle}
                              </Text>
                            </div>
                          </Group>

                          <Badge
                            color={!isAnswered ? 'gray' : isCorrect ? 'green' : 'red'}
                            variant="light"
                            size="sm"
                            radius="xl"
                          >
                            {!isAnswered ? 'Chưa làm' : isCorrect ? 'Đúng' : 'Sai'}
                          </Badge>
                        </Group>
                      </Accordion.Control>

                      <Accordion.Panel>
                        <Stack gap="sm" pt="xs">
                          {/* Options List */}
                          <Stack gap="xs">
                            {question.options.map((opt, optIdx) => {
                              const isUserChoice = opt.id === selectedOption?.id;
                              const isCorrectOpt = opt.correct;
                              const letter = String.fromCharCode(65 + optIdx);

                              let bg = 'var(--mantine-color-white)';
                              let border = 'var(--mantine-color-ink-2)';
                              let badgeLabel = null;

                              if (isCorrectOpt) {
                                bg = '#F0FDF4';
                                border = '#86EFAC';
                                badgeLabel = 'Đáp án đúng';
                              } else if (isUserChoice && !isCorrectOpt) {
                                bg = '#FEF2F2';
                                border = '#FCA5A5';
                                badgeLabel = 'Lựa chọn của bạn';
                              }

                              return (
                                <Box
                                  key={opt.id}
                                  p="xs"
                                  style={{
                                    borderRadius: 8,
                                    backgroundColor: bg,
                                    border: `1px solid ${border}`,
                                  }}
                                >
                                  <Flex justify="space-between" align="center">
                                    <Group gap="sm">
                                      <span
                                        style={{
                                          width: 22,
                                          height: 22,
                                          borderRadius: '50%',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          backgroundColor: isCorrectOpt
                                            ? '#16A34A'
                                            : isUserChoice
                                            ? '#DC2626'
                                            : 'var(--mantine-color-ink-2)',
                                          color:
                                            isCorrectOpt || isUserChoice
                                              ? 'var(--mantine-color-white)'
                                              : 'var(--mantine-color-ink-7)',
                                          fontSize: 12,
                                          fontWeight: 700,
                                        }}
                                      >
                                        {letter}
                                      </span>
                                      <Text size="sm" c="ink.8">
                                        {opt.content}
                                      </Text>
                                    </Group>

                                    {badgeLabel && (
                                      <Badge
                                        size="xs"
                                        color={isCorrectOpt ? 'green' : 'red'}
                                        variant="filled"
                                      >
                                        {badgeLabel}
                                      </Badge>
                                    )}
                                  </Flex>
                                </Box>
                              );
                            })}
                          </Stack>

                          {/* Explanation Note */}
                          {(question.explanation || correctOption?.explanation) && (
                            <Box p="sm" className={classes.explanationBox}>
                              <Text size="xs" fw={700} c="navy.9" mb={2}>
                                Giải thích chi tiết:
                              </Text>
                              <Text size="xs" c="ink.7" style={{ lineHeight: 1.5 }}>
                                {question.explanation || correctOption?.explanation}
                              </Text>
                            </Box>
                          )}
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                },
              )}
            </Accordion>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
