import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, View } from "react-native";

import {
  flattenPaper,
  fromDraft,
  isAnswered,
  toSubmitInput,
  type ExamAnswer,
  type ExamAnswers,
  type Paper,
} from "@/features/exam/answers";
import { ExamQuestion, Stimulus } from "@/features/exam/ExamQuestion";
import {
  useExamAutosave,
  useExamPresence,
} from "@/features/exam/useExamSession";
import { formatDuration } from "@/features/shared/labels";
import { useCountdown } from "@/features/shared/useCountdown";
import {
  ExamAttemptStatus,
  useAttemptPaperQuery,
  useExamAttemptResultQuery,
  useExamDraftQuery,
  useSubmitExamAttemptMutation,
  type ExamAttemptResultQuery,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  Chip,
  ChipRow,
  LoadingState,
  Notice,
  ProgressBar,
  Row,
  Screen,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

const SECTION_LABELS: Record<string, string> = {
  LISTENING: "Nghe",
  READING: "Đọc",
  WRITING: "Viết",
  SPEAKING: "Nói",
};

export default function ExamSittingScreen() {
  const { attemptId, fullTestSitting } = useLocalSearchParams<{
    attemptId: string;
    fullTestSitting?: string;
  }>();
  const attempt = useExamAttemptResultQuery({
    variables: { id: attemptId },
    fetchPolicy: "network-only",
  });
  const paperQuery = useAttemptPaperQuery({ variables: { attemptId } });
  const draft = useExamDraftQuery({
    variables: { attemptId },
    fetchPolicy: "network-only",
  });

  const paper = paperQuery.data?.attemptPaper;
  const info = attempt.data?.examAttempt;
  const finished =
    info != null && info.status !== ExamAttemptStatus.IN_PROGRESS;

  // Already scored or expired: show the result instead.
  useEffect(() => {
    if (finished)
      router.replace({
        pathname: "/exams/result/[attemptId]",
        params: { attemptId },
      });
  }, [finished, attemptId]);

  const ready = paper && info && draft.data && !finished;

  return ready ? (
    <Sitting
      attemptId={attemptId}
      fullTestSitting={fullTestSitting}
      paper={paper}
      info={info}
      initialAnswers={
        draft.data?.examDraft
          ? fromDraft(draft.data.examDraft.answers, paper)
          : {}
      }
      draftVersion={draft.data?.examDraft?.version ?? 0}
    />
  ) : (
    <Screen>
      <Stack.Screen options={{ title: "Làm bài" }} />
      <QueryView
        loading={paperQuery.loading || draft.loading || attempt.loading}
        error={paperQuery.error ?? draft.error ?? attempt.error}
        data={undefined}
        onRetry={() => {
          void paperQuery.refetch();
          void draft.refetch();
          void attempt.refetch();
        }}
      >
        {() => null}
      </QueryView>
    </Screen>
  );
}

/** The paper itself, mounted once the paper and the saved draft are both in hand. */
function Sitting({
  attemptId,
  fullTestSitting,
  paper,
  info,
  initialAnswers,
  draftVersion,
}: {
  attemptId: string;
  fullTestSitting?: string;
  paper: Paper;
  info: NonNullable<ExamAttemptResultQuery["examAttempt"]>;
  initialAnswers: ExamAnswers;
  draftVersion: number;
}) {
  const [submit, submitState] = useSubmitExamAttemptMutation();
  const [answers, setAnswers] = useState<ExamAnswers>(initialAnswers);
  const [partIndex, setPartIndex] = useState(0);
  const [sendFailed, setSendFailed] = useState(false);
  const sending = useRef(false);

  const autosave = useExamAutosave(attemptId, paper, draftVersion);
  const presenceClosed = useExamPresence(attemptId, info.mode, true);

  async function send() {
    if (sending.current) return;
    sending.current = true;
    setSendFailed(false);
    try {
      const { data } = await submit({
        variables: { attemptId, answers: toSubmitInput(paper, answers) },
      });
      if (data) {
        // A full test's paper goes back to its sitting, where all four skills come together.
        router.replace(
          fullTestSitting
            ? {
                pathname: "/exams/full-tests/sittings/[id]",
                params: { id: fullTestSitting },
              }
            : { pathname: "/exams/result/[attemptId]", params: { attemptId } },
        );
      } else setSendFailed(true);
    } catch {
      setSendFailed(true);
    } finally {
      sending.current = false;
    }
  }

  const secondsLeft = useCountdown(info.expiresAt, () => void send());

  const entries = useMemo(() => flattenPaper(paper), [paper]);
  const parts = useMemo(() => {
    const seen = new Map<
      string,
      (typeof entries)[number]["part"] & { sectionType: string }
    >();
    for (const entry of entries)
      if (!seen.has(entry.part.id))
        seen.set(entry.part.id, {
          ...entry.part,
          sectionType: entry.section.sectionType,
        });
    return [...seen.values()];
  }, [entries]);
  const answered = entries.filter((entry) =>
    isAnswered(answers[entry.question.id]),
  ).length;

  function change(questionId: string, answer: ExamAnswer | undefined) {
    const next = { ...answers };
    if (answer === undefined) delete next[questionId];
    else next[questionId] = answer;
    setAnswers(next);
    autosave.schedule(next);
  }

  function confirmSubmit() {
    const left = entries.length - answered;
    Alert.alert(
      "Nộp bài?",
      left > 0 ? `Bạn còn ${left} câu chưa làm.` : "Bạn đã làm tất cả các câu.",
      [
        { text: "Làm tiếp", style: "cancel" },
        { text: "Nộp bài", onPress: () => void send() },
      ],
    );
  }

  const part = parts[partIndex];
  const partSets = part
    ? entries.filter((entry) => entry.part.id === part.id)
    : [];
  const sets = [
    ...new Map(partSets.map((entry) => [entry.set.id, entry.set])).values(),
  ];

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: paper.title,
          headerRight: () =>
            secondsLeft != null ? (
              <Badge
                label={`⏱ ${formatDuration(secondsLeft)}`}
                tone={secondsLeft < 300 ? "danger" : "primary"}
              />
            ) : null,
        }}
      />
      {submitState.loading ? (
        <LoadingState label="Đang nộp và chấm bài…" />
      ) : (
        <>
          <Row style={{ marginBottom: spacing.xs }}>
            <View style={{ flex: 1 }}>
              <ProgressBar
                value={entries.length ? answered / entries.length : 0}
              />
            </View>
            <AppText variant="caption" tone="muted">
              {answered}/{entries.length}
            </AppText>
          </Row>
          <AppText
            variant="caption"
            tone="muted"
            style={{ marginBottom: spacing.sm }}
          >
            {autosave.saving
              ? "Đang lưu…"
              : autosave.lastSavedAt
                ? "Đã lưu nháp"
                : "Câu trả lời được lưu tự động"}
          </AppText>
          <Notice
            message={
              presenceClosed
                ? "Lượt thi đã bị đóng do mất kết nối quá lâu. Câu trả lời đã lưu vẫn được tính."
                : autosave.blocked
                  ? "Bài này vừa được lưu từ thiết bị khác. Hãy mở lại để tiếp tục từ bản mới nhất."
                  : sendFailed
                    ? "Chưa nộp được bài. Kiểm tra mạng rồi thử lại."
                    : null
            }
          />

          <ChipRow>
            {parts.map((item, index) => (
              <Chip
                key={item.id}
                label={`${SECTION_LABELS[item.sectionType] ?? item.sectionType} ${item.orderNo}`}
                selected={index === partIndex}
                onPress={() => setPartIndex(index)}
              />
            ))}
          </ChipRow>

          {part ? (
            <>
              <AppText variant="heading">{part.title}</AppText>
              {part.instruction ? (
                <AppText tone="muted" style={{ marginBottom: spacing.sm }}>
                  {part.instruction}
                </AppText>
              ) : null}
              <Stimulus
                content={part.content}
                audioUrl={part.audioUrl}
                imageUrl={part.imageUrl}
              />
              {sets.map((set) => (
                <Card key={set.id} style={{ marginBottom: spacing.md }}>
                  {set.title ? (
                    <AppText variant="label">{set.title}</AppText>
                  ) : null}
                  {set.instruction ? (
                    <AppText
                      variant="caption"
                      tone="muted"
                      style={{ fontStyle: "italic", marginBottom: spacing.xs }}
                    >
                      {set.instruction}
                    </AppText>
                  ) : null}
                  <Stimulus
                    content={set.content}
                    audioUrl={set.audioUrl}
                    imageUrl={set.imageUrl}
                    set={set}
                    answers={answers}
                  />
                  {[...set.questions]
                    .sort((a, b) => a.orderNo - b.orderNo)
                    .map((question) => (
                      <ExamQuestion
                        key={question.id}
                        question={question}
                        set={set}
                        answer={answers[question.id]}
                        onChange={(answer) => change(question.id, answer)}
                        disabled={secondsLeft === 0}
                      />
                    ))}
                </Card>
              ))}
            </>
          ) : null}

          <Row gap={spacing.sm}>
            <Button
              title="Phần trước"
              variant="secondary"
              disabled={partIndex === 0}
              onPress={() => setPartIndex(partIndex - 1)}
              style={{ flex: 1 }}
            />
            {partIndex < parts.length - 1 ? (
              <Button
                title="Phần sau"
                onPress={() => setPartIndex(partIndex + 1)}
                style={{ flex: 1 }}
              />
            ) : (
              <Button
                title={sendFailed ? "Gửi lại" : "Nộp bài"}
                variant="accent"
                onPress={secondsLeft === 0 ? () => void send() : confirmSubmit}
                style={{ flex: 1 }}
              />
            )}
          </Row>
          {partIndex < parts.length - 1 ? (
            <Button
              title="Nộp bài"
              variant="ghost"
              onPress={confirmSubmit}
              style={{ marginTop: spacing.sm }}
            />
          ) : null}
        </>
      )}
    </Screen>
  );
}
