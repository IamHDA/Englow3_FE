"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Box, Card, Grid, Text } from "@mantine/core";

import {
  useAttemptPaperQuery,
  useExamDetailQuery,
  useStartExamAttemptMutation,
  useSubmitExamAttemptMutation,
} from "@/lib/graphql/generated/hooks";
import { useAccountProfile } from "@/features/account";
import { ExamType } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useExamTimer } from "../../../hooks/useExamTimer";
import { EXAM_LOCAL_STORAGE_PREFIX } from "../../../constants/examSitting";

import { ExamOverview } from "../../blocks/ExamOverview";
import { ExamOverviewSkeleton } from "../../blocks/ExamOverview/ExamOverviewSkeleton";
import { ExamSittingHeader } from "../../blocks/ExamSittingHeader";
import { QuestionCard } from "../../blocks/QuestionCard";
import {
  QuestionPalette,
  type FlatQuestionItem,
} from "../../blocks/QuestionPalette";
import { SubmitModal } from "../../blocks/SubmitModal";
import { ExamResultView } from "../../blocks/ExamResultView";

import type { ExamAttemptResult } from "../../../types";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { Page } from "@/shared/components/Page";

interface ExamSittingViewProps {
  examId: string;
}

type StoredProgress = {
  answers: Record<string, string>;
  flaggedIds: string[];
  currentIndex: number;
};

/**
 * Bản nháp cục bộ được khoá theo lượt thi chứ không theo đề: mỗi lượt là một
 * phiên riêng, dùng chung khoá thì bài làm của lượt trước sẽ chảy sang lượt sau.
 */
function storageKey(attemptId: string): string {
  return `${EXAM_LOCAL_STORAGE_PREFIX}${attemptId}`;
}

function readProgress(attemptId: string): StoredProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(storageKey(attemptId));
    if (!saved) return null;
    const value = JSON.parse(saved);
    if (
      !value ||
      !value.answers ||
      typeof value.answers !== "object" ||
      Array.isArray(value.answers) ||
      !Object.values(value.answers).every(
        (answer) => typeof answer === "string",
      ) ||
      !Array.isArray(value.flaggedIds) ||
      !value.flaggedIds.every((id: unknown) => typeof id === "string") ||
      !Number.isInteger(value.currentIndex) ||
      value.currentIndex < 0
    )
      return null;
    return value as StoredProgress;
  } catch {
    return null;
  }
}

export function ExamSittingView({ examId }: ExamSittingViewProps) {
  const router = useRouter();
  const { t, isVi } = useLanguage();
  const { refresh: refreshProfile } = useAccountProfile();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [result, setResult] = useState<ExamAttemptResult | null>(null);
  const pending = useRef(false);
  const [sendFailed, setSendFailed] = useState(false);

  // Bản tóm tắt đề cho màn giới thiệu - đọc được trước khi đồng hồ chạy.
  const {
    data: detailData,
    loading: detailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = useExamDetailQuery({ variables: { id: examId } });

  const [startAttempt, { loading: starting, error: startError }] =
    useStartExamAttemptMutation();
  const [
    submitAttempt,
    { loading: submitting, error: submitError, reset: resetSubmit },
  ] = useSubmitExamAttemptMutation();

  const {
    data,
    loading: paperLoading,
    error: paperError,
    refetch: refetchPaper,
  } = useAttemptPaperQuery({
    variables: { attemptId: attemptId ?? "" },
    skip: attemptId === null,
    fetchPolicy: "cache-and-network",
  });

  const paper = data?.attemptPaper;
  const isPlacement = detailData?.exam?.examType === ExamType.PLACEMENT;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

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

  /**
   * Nộp bài. Backend chấm ngay và trả kết quả, kể cả khi mảng đáp án rỗng - hết
   * giờ thì nộp những gì đang có chứ không vứt đi, rồi để server phán quyết.
   */
  const handleFinalSubmit = useCallback(async () => {
    if (
      attemptId === null ||
      pending.current ||
      result !== null ||
      (expiresAt && Date.now() >= Date.parse(expiresAt))
    )
      return;
    pending.current = true;
    setSendFailed(false);

    setSubmitModalOpen(false);

    const payload = Object.entries(answers).map(
      ([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionIds: [selectedOptionId],
      }),
    );

    const response = await submitAttempt({
      variables: { attemptId, answers: payload },
    }).catch(() => null);

    pending.current = false;
    if (!response?.data) {
      setSendFailed(true);
      return;
    }

    setResult(response.data.submitExamAttempt);
    try {
      sessionStorage.removeItem(storageKey(attemptId));
    } catch {
      // ignore storage errors
    }

    // Chấm xong một đề xếp trình độ là backend vừa ghi trình độ và đẩy bước
    // onboarding. Đọc lại hồ sơ ngay, nếu không thì header và popup vẫn hiện
    // trạng thái cũ cho tới lần tải trang kế tiếp.
    if (isPlacement) {
      await refreshProfile().catch(() => undefined);
    }
  }, [
    attemptId,
    answers,
    submitAttempt,
    isPlacement,
    refreshProfile,
    result,
    expiresAt,
  ]);

  const { formattedTime, isWarning, isCritical, remainingSeconds } =
    useExamTimer({
      expiresAt,
      isActive: attemptId !== null && result === null,
    });
  const expired =
    expiresAt !== null && remainingSeconds === 0 && result === null;

  /**
   * Mở lượt thi. Backend luôn trả về một lượt đang mở: lượt cũ còn hạn thì trả
   * lại với `resumed: true`, hết hạn thì nó đóng lại rồi tạo lượt mới. Nên bấm
   * "Bắt đầu" lần nữa không bao giờ tạo ra hai lượt song song.
   */
  const handleStart = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    const response = await startAttempt({
      variables: { examId },
    }).catch(() => null);
    pending.current = false;

    const attempt = response?.data?.startExamAttempt;
    if (!attempt) return;

    // Lượt được nối lại có thể đã làm dở ở lần trước - khôi phục bản nháp cục
    // bộ của đúng lượt đó, kể cả vị trí câu đang đứng.
    const restored = readProgress(attempt.id);
    setAnswers(restored?.answers ?? {});
    setFlaggedIds(new Set(restored?.flaggedIds ?? []));
    setCurrentIndex(restored?.currentIndex ?? 0);
    setAttemptId(attempt.id);
    setExpiresAt(attempt.expiresAt);
  }, [examId, startAttempt]);

  // Giữ bản nháp cục bộ để tải lại trang hay mất mạng không mất bài đang làm.
  useEffect(() => {
    if (attemptId === null || result !== null) return;
    try {
      sessionStorage.setItem(
        storageKey(attemptId),
        JSON.stringify({
          answers,
          flaggedIds: Array.from(flaggedIds),
          currentIndex,
        }),
      );
    } catch {
      // ignore
    }
  }, [attemptId, result, answers, flaggedIds, currentIndex]);

  // Current question references
  const currentItem =
    flatQuestions[
      Math.min(currentIndex, Math.max(0, flatQuestions.length - 1))
    ];
  const currentSection = currentItem
    ? paper?.sections[currentItem.sectionIndex]
    : null;
  const currentPart =
    currentItem && currentSection
      ? currentSection.parts[currentItem.partIndex]
      : null;
  const currentQuestionSet =
    currentItem && currentPart
      ? currentPart.questionSets[currentItem.questionSetIndex]
      : null;
  const currentQuestion =
    currentItem && currentQuestionSet
      ? currentQuestionSet.questions.find(
          (q) => q.id === currentItem.questionId,
        )
      : null;

  const handleSelectOption = (optionId: string) => {
    if (!currentItem || pending.current || expired) return;
    setAnswers((prev) => ({ ...prev, [currentItem.questionId]: optionId }));
  };

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

  // Làm lại là mở một lượt mới - backend cấp id và hạn nộp mới, không tái dùng
  // lượt đã chấm.
  const handleRetake = () => {
    if (pending.current) return;
    resetSubmit();
    setSendFailed(false);
    setResult(null);
    setAttemptId(null);
    setExpiresAt(null);
    setAnswers({});
    setFlaggedIds(new Set());
    setCurrentIndex(0);
  };

  const error =
    (!detailData ? detailError : undefined) ??
    startError ??
    (!paper ? paperError : undefined);

  if (error) {
    return (
      <Page width="focus">
        <LoadErrorState
          error={error}
          thing={{ vi: "đề thi", en: "exam" }}
          back={{ href: "/exams", label: t.exam.returnToLibrary }}
          onRetry={() => {
            void (
              attemptId
                ? refetchPaper()
                : startError
                  ? handleStart()
                  : refetchDetail()
            ).catch(() => undefined);
          }}
        />
      </Page>
    );
  }

  // 1. Overview Mode (Briefing) - chưa mở lượt thi nào
  if (attemptId === null || !paper) {
    const exam = detailData?.exam;
    if (detailLoading || !exam || (attemptId !== null && paperLoading)) {
      return <ExamOverviewSkeleton />;
    }
    return (
      <ExamOverview exam={exam} starting={starting} onStart={handleStart} />
    );
  }

  // 3. Result Mode (Post-submission)
  if (result) {
    return (
      <ExamResultView
        paper={paper}
        questions={flatQuestions}
        attempt={result}
        onRetake={handleRetake}
      />
    );
  }

  // 2. Active Sitting Mode
  return (
    <Box bg="ink.0" mih="100vh" pb={60}>
      <ExamSittingHeader
        submitDisabled={expired || submitting}
        title={paper.title}
        sectionTitle={
          currentSection
            ? `${currentSection.sectionType} · ${currentPart?.title || ""}`
            : ""
        }
        formattedTime={formattedTime}
        isWarning={isWarning}
        isCritical={isCritical}
        answeredCount={Object.keys(answers).length}
        totalQuestions={flatQuestions.length}
        onSubmitClick={() => setSubmitModalOpen(true)}
        onExitClick={() => {
          if (window.confirm(t.exam.exitConfirm)) {
            router.push("/exams");
          }
        }}
      />

      <Page>
        {!expired && (
          <Text size="sm" c="dimmed" mb="sm">
            {isVi
              ? "Hãy nộp bài trước khi đồng hồ về 00:00."
              : "Submit your answers before the timer reaches 00:00."}
          </Text>
        )}
        {(sendFailed || submitError) && !expired && !result && (
          <Alert color="red" role="alert" mb="md">
            {isVi
              ? "Chưa nộp được bài. Đáp án được giữ lại; kiểm tra kết nối rồi nộp lại."
              : "Submission failed. Your answers are kept; check your connection and submit again."}
            <Button
              variant="subtle"
              loading={submitting}
              onClick={handleFinalSubmit}
            >
              {isVi ? "Nộp lại" : "Retry submission"}
            </Button>
          </Alert>
        )}
        {expired && (
          <Alert color="orange" role="alert" mb="md">
            {isVi
              ? "Lượt thi đã hết hạn. Máy chủ không nhận bài nộp muộn; bản nháp vẫn được giữ trong phiên trình duyệt này."
              : "This attempt has expired. Late submissions are not accepted; your draft is kept in this browser session."}
            <Button variant="subtle" onClick={handleRetake}>
              {isVi ? "Làm lượt mới" : "Start a new attempt"}
            </Button>
          </Alert>
        )}
        <Grid gap="lg">
          <Grid.Col span={{ base: 12, md: 8, lg: 8.5 }}>
            {currentSection &&
            currentPart &&
            currentQuestionSet &&
            currentQuestion ? (
              <Box
                component="fieldset"
                disabled={expired || submitting}
                style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
              >
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
                  onPrevQuestion={() =>
                    setCurrentIndex((prev) => Math.max(0, prev - 1))
                  }
                  onNextQuestion={() =>
                    setCurrentIndex((prev) =>
                      Math.min(flatQuestions.length - 1, prev + 1),
                    )
                  }
                  hasPrev={currentIndex > 0}
                  hasNext={currentIndex < flatQuestions.length - 1}
                />
              </Box>
            ) : (
              <Card p="xl" radius="lg">
                <Text c="ink.5" ta="center">
                  {t.exam.notFoundQuestion}
                </Text>
              </Card>
            )}
          </Grid.Col>

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
      </Page>

      <SubmitModal
        opened={submitModalOpen}
        totalQuestions={flatQuestions.length}
        answeredCount={Object.keys(answers).length}
        flaggedCount={flaggedIds.size}
        submitting={submitting}
        onClose={() => setSubmitModalOpen(false)}
        onConfirmSubmit={handleFinalSubmit}
      />
    </Box>
  );
}
