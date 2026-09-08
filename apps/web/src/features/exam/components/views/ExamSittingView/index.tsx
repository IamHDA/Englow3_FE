'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Stack,
  Text,
} from '@mantine/core';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useExamPaperQuery } from '@/lib/graphql/generated/hooks';
import { useLanguage } from '@/shared/hooks/useLanguage';
import { useExamTimer } from '../../../hooks/useExamTimer';
import { EXAM_LOCAL_STORAGE_PREFIX } from '../../../constants/examSitting';

import { ExamOverview } from '../../blocks/ExamOverview';
import { ExamOverviewSkeleton } from '../../blocks/ExamOverview/ExamOverviewSkeleton';
import { ExamSittingHeader } from '../../blocks/ExamSittingHeader';
import { QuestionCard } from '../../blocks/QuestionCard';
import { QuestionPalette, type FlatQuestionItem } from '../../blocks/QuestionPalette';
import { SubmitModal } from '../../blocks/SubmitModal';
import { ExamResultView } from '../../blocks/ExamResultView';

interface ExamSittingViewProps {
  examId: string;
}

type SittingMode = 'overview' | 'sitting' | 'result';

export function ExamSittingView({ examId }: ExamSittingViewProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { data, loading, error } = useExamPaperQuery({
    variables: { id: examId },
    fetchPolicy: 'cache-and-network',
  });

  const paper = data?.examPaper;

  const [mode, setMode] = useState<SittingMode>('overview');
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = sessionStorage.getItem(`${EXAM_LOCAL_STORAGE_PREFIX}${examId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.currentIndex === 'number') return parsed.currentIndex;
      }
    } catch {
      // ignore
    }
    return 0;
  });
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = sessionStorage.getItem(`${EXAM_LOCAL_STORAGE_PREFIX}${examId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers && typeof parsed.answers === 'object') return parsed.answers;
      }
    } catch {
      // ignore
    }
    return {};
  });
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = sessionStorage.getItem(`${EXAM_LOCAL_STORAGE_PREFIX}${examId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.flaggedIds)) return new Set(parsed.flaggedIds);
      }
    } catch {
      // ignore
    }
    return new Set();
  });
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  // Submit test action
  const handleFinalSubmit = useCallback(() => {
    setSubmitModalOpen(false);
    setMode('result');
    try {
      sessionStorage.removeItem(`${EXAM_LOCAL_STORAGE_PREFIX}${examId}`);
    } catch {
      // ignore storage errors
    }
  }, [examId]);

  // Hook-extracted timer with background clock-skew protection
  const {
    formattedTime,
    timeSpentSeconds,
    isWarning,
    isCritical,
    reset: resetTimer,
  } = useExamTimer({
    durationSeconds: paper?.durationSeconds ?? 7200,
    isActive: mode === 'sitting',
    onExpire: handleFinalSubmit,
  });

  // Auto-persist answers locally as learner answers (per exam-flow.md rule)
  useEffect(() => {
    if (mode === 'sitting') {
      try {
        sessionStorage.setItem(
          `${EXAM_LOCAL_STORAGE_PREFIX}${examId}`,
          JSON.stringify({
            answers,
            flaggedIds: Array.from(flaggedIds),
            currentIndex,
          }),
        );
      } catch {
        // ignore
      }
    }
  }, [mode, examId, answers, flaggedIds, currentIndex]);

  // Flatten questions list for sequential navigation
  const flatQuestions = useMemo<FlatQuestionItem[]>(() => {
    if (!paper) return [];
    const list: FlatQuestionItem[] = [];
    let globalIdx = 0;

    paper.sections.forEach((sec, sIdx) => {
      sec.parts.forEach((part, pIdx) => {
        part.questionSets.forEach((qs, qsIdx) => {
          qs.questions.forEach((q) => {
            list.push({
              globalIndex: globalIdx++,
              sectionIndex: sIdx,
              partIndex: pIdx,
              questionSetIndex: qsIdx,
              questionId: q.id,
              sectionType: sec.sectionType,
              partTitle: part.title,
            });
          });
        });
      });
    });
    return list;
  }, [paper]);

  // Current question references
  const currentItem = flatQuestions[currentIndex];
  const currentSection = currentItem ? paper?.sections[currentItem.sectionIndex] : null;
  const currentPart = currentItem && currentSection ? currentSection.parts[currentItem.partIndex] : null;
  const currentQuestionSet = currentItem && currentPart ? currentPart.questionSets[currentItem.questionSetIndex] : null;
  const currentQuestion = currentItem && currentQuestionSet
    ? currentQuestionSet.questions.find((q) => q.id === currentItem.questionId)
    : null;

  // Answer selection handler
  const handleSelectOption = (optionId: string) => {
    if (!currentItem) return;
    setAnswers((prev) => ({
      ...prev,
      [currentItem.questionId]: optionId,
    }));
  };

  // Flag toggle handler
  const handleToggleFlag = () => {
    if (!currentItem) return;
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentItem.questionId)) {
        next.delete(currentItem.questionId);
      } else {
        next.add(currentItem.questionId);
      }
      return next;
    });
  };

  // Retake test
  const handleRetake = () => {
    setAnswers({});
    setFlaggedIds(new Set());
    setCurrentIndex(0);
    resetTimer();
    try {
      sessionStorage.removeItem(`${EXAM_LOCAL_STORAGE_PREFIX}${examId}`);
    } catch {
      // ignore
    }
    setMode('overview');
  };

  // Fallback loading: Named skeleton component, never a spinner
  if (loading && !paper) {
    return <ExamOverviewSkeleton />;
  }

  if (error || !paper) {
    return (
      <Container size="md" py="xl">
        <Stack align="center" gap="md" py={60}>
          <AlertCircle size={40} color="var(--mantine-color-warn-6)" />
          <Text size="lg" fw={700} c="navy.9">
            {t.exam.failedLoadExam}
          </Text>
          <Text size="sm" c="ink.5" ta="center">
            {error?.message || t.exam.failedLoadExamDesc}
          </Text>
          <Button
            component={Link}
            href="/exams"
            variant="default"
            radius="xl"
            leftSection={<ArrowLeft size={16} />}
          >
            {t.exam.returnToLibrary}
          </Button>
        </Stack>
      </Container>
    );
  }

  // 1. Overview Mode (Briefing)
  if (mode === 'overview') {
    return (
      <ExamOverview
        paper={paper}
        onStart={() => setMode('sitting')}
      />
    );
  }

  // 3. Result Mode (Post-submission)
  if (mode === 'result') {
    return (
      <ExamResultView
        paper={paper}
        questions={flatQuestions}
        answers={answers}
        timeSpentSeconds={timeSpentSeconds}
        onRetake={handleRetake}
      />
    );
  }

  // 2. Active Sitting Mode
  return (
    <Box bg="ink.0" mih="100vh" pb={60}>
      {/* Sticky Timer & Examination Header */}
      <ExamSittingHeader
        title={paper.title}
        sectionTitle={currentSection ? `${currentSection.sectionType} · ${currentPart?.title || ''}` : ''}
        formattedTime={formattedTime}
        isWarning={isWarning}
        isCritical={isCritical}
        answeredCount={Object.keys(answers).length}
        totalQuestions={flatQuestions.length}
        onSubmitClick={() => setSubmitModalOpen(true)}
        onExitClick={() => {
          if (window.confirm(t.exam.exitConfirm)) {
            router.push('/exams');
          }
        }}
      />

      {/* Main Examination Workspace (Split Layout) */}
      <Container size="xl" py="lg">
        <Grid gap="lg">
          {/* Left: Question Card & Stimulus */}
          <Grid.Col span={{ base: 12, md: 8, lg: 8.5 }}>
            {currentSection && currentPart && currentQuestionSet && currentQuestion ? (
              <QuestionCard
                section={currentSection}
                part={currentPart}
                questionSet={currentQuestionSet}
                question={currentQuestion}
                questionIndex={currentIndex}
                totalQuestions={flatQuestions.length}
                selectedOptionId={answers[currentQuestion.id]}
                isFlagged={flaggedIds.has(currentQuestion.id)}
                onSelectOption={handleSelectOption}
                onToggleFlag={handleToggleFlag}
                onPrevQuestion={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                onNextQuestion={() =>
                  setCurrentIndex((prev) => Math.min(flatQuestions.length - 1, prev + 1))
                }
                hasPrev={currentIndex > 0}
                hasNext={currentIndex < flatQuestions.length - 1}
              />
            ) : (
              <Card p="xl" radius="lg">
                <Text c="ink.5" ta="center">
                  {t.exam.notFoundQuestion}
                </Text>
              </Card>
            )}
          </Grid.Col>

          {/* Right: Question Palette Sidebar */}
          <Grid.Col span={{ base: 12, md: 4, lg: 3.5 }}>
            <QuestionPalette
              questions={flatQuestions}
              currentIndex={currentIndex}
              answers={answers}
              flaggedQuestionIds={flaggedIds}
              onSelectQuestion={(idx) => setCurrentIndex(idx)}
            />
          </Grid.Col>
        </Grid>
      </Container>

      {/* Confirmation Submit Modal */}
      <SubmitModal
        opened={submitModalOpen}
        totalQuestions={flatQuestions.length}
        answeredCount={Object.keys(answers).length}
        flaggedCount={flaggedIds.size}
        onClose={() => setSubmitModalOpen(false)}
        onConfirmSubmit={handleFinalSubmit}
      />
    </Box>
  );
}
