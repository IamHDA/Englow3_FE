"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useApolloClient } from "@apollo/client/react";
import {
  ExamDraftDocument,
  ExamAttemptResultDocument,
} from "@/lib/graphql/generated/documents";
import { useExamAutosave } from "../../../hooks/useExamAutosave";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Box,
  Card,
  Grid,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import {
  useAttemptPaperQuery,
  useExamDetailQuery,
  useExamOutlineQuery,
  useStartExamAttemptMutation,
  useSubmitExamAttemptMutation,
} from "@/lib/graphql/generated/hooks";
import { useAccountProfile } from "@/features/account";
import {
  ExamAttemptMode,
  ExamType,
  OpenAttemptChoice,
  type StartExamAttemptInput,
} from "@/lib/graphql/generated";
import { backendCodeOf } from "@/shared/network/loadError";
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

import type { ExamAttemptResult, ExamStartChoice } from "../../../types";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { Page } from "@/shared/components/Page";

interface ExamSittingViewProps {
  examId: string;
}

type StoredProgress = {
  updatedAt?: number;
  answers: Record<string, string | string[]>;
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
        (answer) =>
          typeof answer === "string" ||
          (Array.isArray(answer) &&
            answer.every((id) => typeof id === "string")),
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
  const client = useApolloClient();
  const [openingDraft, setOpeningDraft] = useState(false);
  const [draftLoadFailed, setDraftLoadFailed] = useState(false);
  const { t, isVi } = useLanguage();
  const { refresh: refreshProfile } = useAccountProfile();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  // Không giới hạn giờ chỉ có ở bài luyện tập; khi đó không đếm ngược.
  const [untimed, setUntimed] = useState(false);
  const [practice, setPractice] = useState(false);
  // Lần bắt đầu bị chặn vì đề đang có một lượt khác còn dở - chờ người học chọn.
  const [blockedChoice, setBlockedChoice] = useState<ExamStartChoice | null>(
    null,
  );
  const lastChoice = useRef<ExamStartChoice>({ mode: "FULL" });
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

  const [
    startAttempt,
    { loading: starting, error: startError, reset: resetStart },
  ] = useStartExamAttemptMutation();
  const {
    data: outlineData,
    loading: outlineLoading,
    error: outlineError,
    refetch: refetchOutline,
  } = useExamOutlineQuery({ variables: { examId } });
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
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
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

  const autosave = useExamAutosave(result ? null : attemptId, answers);

  /**
   * Nộp bài. Backend chấm ngay và trả kết quả, kể cả khi mảng đáp án rỗng - hết
   * giờ thì nộp những gì đang có chứ không vứt đi, rồi để server phán quyết.
   */
  const handleFinalSubmit = useCallback(async () => {
    if (
      attemptId === null ||
      pending.current ||
      result !== null ||
      autosave.status === "conflict"
    )
      return;
    pending.current = true;
    setSendFailed(false);

    setSubmitModalOpen(false);

    if (!expiresAt || Date.now() < Date.parse(expiresAt)) {
      if (!(await autosave.flush(answers))) {
        pending.current = false;
        setSendFailed(true);
        return;
      }
    }
    const payload = Object.entries(answers).map(
      ([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionIds: Array.isArray(selectedOptionId)
          ? selectedOptionId
          : [selectedOptionId],
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
    autosave,
  ]);

  const { formattedTime, isWarning, isCritical, remainingSeconds } =
    useExamTimer({
      expiresAt,
      isActive: attemptId !== null && result === null,
      onExpire: () => void handleFinalSubmit(),
    });
  const expired =
    expiresAt !== null && remainingSeconds === 0 && result === null;

  useEffect(() => {
    if (!expired || !attemptId || result) return;
    let active = true;
    const readResult = async () => {
      try {
        const response = await client.query({
          query: ExamAttemptResultDocument,
          variables: { id: attemptId },
          fetchPolicy: "network-only",
        });
        if (active && response.data) setResult(response.data.examAttempt);
      } catch {
        /* Keep the retry action visible while the server finalizes. */
      }
    };
    void readResult();
    const timer = setInterval(() => void readResult(), 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [expired, attemptId, result, client]);

  async function reloadServerDraft() {
    if (
      !attemptId ||
      !window.confirm(
        isVi
          ? "Thay đáp án trên màn hình bằng bản mới nhất trên máy chủ?"
          : "Replace the displayed answers with the latest server draft?",
      )
    )
      return;
    try {
      const response = await client.query({
        query: ExamDraftDocument,
        variables: { attemptId },
        fetchPolicy: "network-only",
      });
      if (!response.data) return;
      const draft = response.data.examDraft;
      const restored = Object.fromEntries(
        draft.answers
          .filter((a) => a.selectedOptionIds.length)
          .map((a) => [a.questionId, a.selectedOptionIds]),
      );
      autosave.initialize(attemptId, draft.version, restored, restored);
      setAnswers(restored);
    } catch {
      setSendFailed(true);
    }
  }

  /**
   * Mở lượt thi. Backend luôn trả về một lượt đang mở: lượt cũ còn hạn thì trả
   * lại với `resumed: true`, hết hạn thì nó đóng lại rồi tạo lượt mới. Nên bấm
   * "Bắt đầu" lần nữa không bao giờ tạo ra hai lượt song song.
   */
  const handleStart = useCallback(
    async (
      choice: ExamStartChoice = lastChoice.current,
      onOpen?: OpenAttemptChoice,
    ) => {
      if (pending.current) return;
      pending.current = true;
      lastChoice.current = choice;
      const input: StartExamAttemptInput =
        choice.mode === "FULL"
          ? { mode: ExamAttemptMode.FULL, onOpen }
          : {
              mode: ExamAttemptMode.PRACTICE,
              partIds: choice.partIds,
              timeLimitMinutes: choice.timeLimitMinutes,
              onOpen,
            };
      const response = await startAttempt({
        variables: { examId, input },
      }).catch((failure: unknown) => {
        // Đề đang có một lượt khác còn dở: hỏi người học thay vì báo lỗi cả trang.
        if (backendCodeOf(failure) === "ATTEMPT_IN_PROGRESS") {
          resetStart();
          setBlockedChoice(choice);
        }
        return null;
      });
      pending.current = false;

      const attempt = response?.data?.startExamAttempt;
      if (!attempt) return;
      setBlockedChoice(null);
      setUntimed(attempt.timeLimitSeconds == null);
      setPractice(attempt.mode === ExamAttemptMode.PRACTICE);

      // Lượt được nối lại có thể đã làm dở ở lần trước - khôi phục bản nháp cục
      // bộ của đúng lượt đó, kể cả vị trí câu đang đứng.
      setOpeningDraft(true);
      setDraftLoadFailed(false);
      try {
        const response = await client.query({
          query: ExamDraftDocument,
          variables: { attemptId: attempt.id },
          fetchPolicy: "network-only",
        });
        if (!response.data) throw new Error("Missing draft");
        const draft = response.data.examDraft;
        const serverAnswers = Object.fromEntries(
          draft.answers
            .filter((a) => a.selectedOptionIds.length)
            .map((a) => [a.questionId, a.selectedOptionIds]),
        );
        const restored = readProgress(attempt.id);
        const useLocal =
          restored && (restored.updatedAt ?? 0) > Date.parse(draft.savedAt);
        const currentAnswers = useLocal ? restored.answers : serverAnswers;
        autosave.initialize(
          attempt.id,
          draft.version,
          serverAnswers,
          currentAnswers,
        );
        setAnswers(currentAnswers);
        setFlaggedIds(new Set(restored?.flaggedIds ?? []));
        setCurrentIndex(restored?.currentIndex ?? 0);
        setAttemptId(attempt.id);
        setExpiresAt(attempt.expiresAt);
      } catch {
        setDraftLoadFailed(true);
      } finally {
        setOpeningDraft(false);
      }
    },
    [examId, startAttempt, resetStart, client, autosave],
  );

  // Giữ bản nháp cục bộ để tải lại trang hay mất mạng không mất bài đang làm.
  useEffect(() => {
    if (attemptId === null || result !== null) return;
    try {
      sessionStorage.setItem(
        storageKey(attemptId),
        JSON.stringify({
          answers,
          updatedAt: Date.now(),
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
    setAnswers((prev) => {
      if (currentQuestion?.questionType !== "MULTIPLE_CHOICE")
        return { ...prev, [currentItem.questionId]: optionId };
      const old = prev[currentItem.questionId];
      const chosen = Array.isArray(old) ? old : old ? [old] : [];
      const selected = chosen.includes(optionId)
        ? chosen.filter((id) => id !== optionId)
        : [...chosen, optionId];
      const next = { ...prev };
      if (selected.length) next[currentItem.questionId] = selected;
      else delete next[currentItem.questionId];
      return next;
    });
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
    setUntimed(false);
    setPractice(false);
    setAnswers({});
    setFlaggedIds(new Set());
    setCurrentIndex(0);
  };

  const error =
    (!detailData ? detailError : undefined) ??
    startError ??
    (!paper ? paperError : undefined);

  if (error && !result && !expired) {
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

  if (result && !paper)
    return (
      <Page width="focus">
        <Stack>
          <Title order={1}>{isVi ? "Kết quả bài thi" : "Exam result"}</Title>
          <Card withBorder>
            <Text fw={700} size="xl">
              {result.rawScore ?? 0} / {result.maxRawScore}
            </Text>
            <Text>
              {result.correctAnswerCount ?? 0} / {result.questionCount}{" "}
              {isVi ? "câu đúng" : "correct answers"}
            </Text>
          </Card>
          <Alert color="blue">
            {isVi
              ? "Lượt thi đã được chấm trên máy chủ. Không tải được nội dung đề để hiển thị chi tiết câu hỏi."
              : "The server has scored your attempt. The paper is unavailable for the detailed question review."}
          </Alert>
          <Button onClick={handleRetake}>
            {isVi ? "Về màn bắt đầu" : "Return to exam briefing"}
          </Button>
          <Button variant="light" onClick={() => router.push("/exams")}>
            {t.exam.returnToLibrary}
          </Button>
        </Stack>
      </Page>
    );
  if (expired && !paper)
    return (
      <Page width="focus">
        <Alert color="blue">
          {isVi
            ? "Đã hết hạn. Máy chủ đang hoàn tất lượt thi từ các đáp án đã đồng bộ đúng hạn; trang sẽ tự lấy kết quả khi kết nối trở lại."
            : "The deadline has passed. The server finalizes answers received on time; this page retrieves the result when the connection returns."}
        </Alert>
      </Page>
    );
  // 1. Overview Mode (Briefing) - chưa mở lượt thi nào
  if (attemptId === null || !paper) {
    const exam = detailData?.exam;
    if (detailLoading || !exam || (attemptId !== null && paperLoading)) {
      return <ExamOverviewSkeleton />;
    }
    return (
      <Box>
        {draftLoadFailed && (
          <Alert color="orange">
            {isVi
              ? "Chưa tải được nháp đã lưu. Thử mở lại lượt thi; hệ thống sẽ tiếp tục lượt còn hạn."
              : "Could not load your saved answers. Retry opening the attempt."}
          </Alert>
        )}
        <ExamOverview
          exam={exam}
          outline={outlineData?.examOutline.sections ?? null}
          outlineLoading={outlineLoading && !outlineData}
          outlineFailed={!!outlineError && !outlineData}
          onRetryOutline={() => void refetchOutline().catch(() => undefined)}
          starting={starting || openingDraft}
          onStart={(choice) => void handleStart(choice)}
        />
        <Modal
          opened={blockedChoice !== null}
          onClose={() => setBlockedChoice(null)}
          title={
            isVi ? "Bạn đang có bài làm dở" : "You have an unfinished attempt"
          }
          centered
          radius="lg"
        >
          <Stack gap="md">
            <Text size="sm">
              {isVi
                ? "Đề này còn một lượt làm dở khác. Bạn có thể làm tiếp lượt đó, hoặc nộp nó với các đáp án đã lưu rồi bắt đầu lượt mới."
                : "This exam has another attempt still open. Continue it, or submit it with the answers saved so far and start a new one."}
            </Text>
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setBlockedChoice(null)}>
                {isVi ? "Huỷ" : "Cancel"}
              </Button>
              <Button
                variant="light"
                loading={starting || openingDraft}
                onClick={() =>
                  blockedChoice &&
                  void handleStart(blockedChoice, OpenAttemptChoice.RESUME)
                }
              >
                {isVi ? "Làm tiếp bài dở" : "Continue that attempt"}
              </Button>
              <Button
                color="orange"
                loading={starting || openingDraft}
                onClick={() =>
                  blockedChoice &&
                  void handleStart(blockedChoice, OpenAttemptChoice.REPLACE)
                }
              >
                {isVi ? "Nộp bài đó, bắt đầu mới" : "Submit it and start new"}
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Box>
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
        submitDisabled={expired || submitting || autosave.status === "conflict"}
        title={paper.title}
        sectionTitle={
          (practice ? (isVi ? "Luyện tập · " : "Practice · ") : "") +
          (currentSection
            ? `${currentSection.sectionType} · ${currentPart?.title || ""}`
            : "")
        }
        formattedTime={
          untimed ? (isVi ? "Không giới hạn" : "No time limit") : formattedTime
        }
        isWarning={!untimed && isWarning}
        isCritical={!untimed && isCritical}
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
        <Text size="sm" role="status" aria-live="polite" mb="sm">
          {autosave.status === "saving"
            ? isVi
              ? "Đang lưu đáp án…"
              : "Saving answers…"
            : autosave.status === "saved"
              ? isVi
                ? "Đáp án đã đồng bộ"
                : "Answers synced"
              : isVi
                ? "Có đáp án chưa đồng bộ"
                : "Some answers are not synced"}
        </Text>
        {(autosave.status === "error" || autosave.status === "conflict") && (
          <Alert color="orange" mb="md">
            {autosave.status === "conflict"
              ? isVi
                ? "Tab khác đã thay đổi nháp. Tải lại để đọc phiên bản mới trước khi tiếp tục."
                : "Another tab changed this draft. Reload the latest version before continuing."
              : isVi
                ? "Chưa lưu được lên máy chủ. Giữ trang mở và thử lưu lại trước hạn."
                : "Could not sync. Keep this page open and retry before the deadline."}
            <Button
              variant="subtle"
              onClick={() =>
                autosave.status === "conflict"
                  ? void reloadServerDraft()
                  : void autosave.flush()
              }
            >
              {isVi ? "Thử lại" : "Retry"}
            </Button>
          </Alert>
        )}
        {!expired && (
          <Text size="sm" c="dimmed" mb="sm">
            {isVi
              ? "Đáp án được tự lưu lên máy chủ. Hết giờ, hệ thống chấm phần đã đồng bộ trước hạn."
              : "Answers are saved to the server. At the deadline, only answers synced before expiry are graded."}
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
              ? "Đã hết giờ. Hệ thống đang hoàn tất phần đáp án đã lưu trước hạn; đáp án chưa đồng bộ không được tính."
              : "Time is up. The server is finalizing answers saved before the deadline; unsynced answers are not counted."}
            <Button
              variant="subtle"
              loading={submitting}
              onClick={() => void handleFinalSubmit()}
            >
              {isVi ? "Lấy kết quả" : "Get result"}
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
                  selectedOptionIds={
                    Array.isArray(answers[currentQuestion.id])
                      ? (answers[currentQuestion.id] as string[])
                      : answers[currentQuestion.id]
                        ? [answers[currentQuestion.id] as string]
                        : []
                  }
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
