import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";

import { ReportView } from "@/features/assessment/ReportView";
import {
  ATTEMPT_STATUS_LABELS,
  parseReport,
  skillLabel,
  wordCount,
} from "@/features/assessment/report";
import { useWritingDraft } from "@/features/assessment/useWritingDraft";
import { formatDateTime } from "@/features/shared/labels";
import { errorMessage } from "@/lib/errors";
import {
  AssessmentAttemptStatus,
  useAssessmentAttemptDetailQuery,
  useAssessmentReadResultMutation,
  useAssessmentRequestReviewMutation,
  useAssessmentRetryMutation,
  useAssessmentSubmitMutation,
  type AssessmentAttemptFieldsFragment,
} from "@/lib/graphql/generated";
import { PlayButton } from "@/ui/audio";
import {
  AppText,
  Badge,
  Button,
  Card,
  LoadingState,
  Notice,
  Row,
  Screen,
  Section,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

const WAITING = new Set([AssessmentAttemptStatus.QUEUED]);

export default function AssessmentAttemptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useAssessmentAttemptDetailQuery({
    variables: { id },
    fetchPolicy: "cache-and-network",
  });
  const attempt = detail.data?.assessmentAttempt;
  const waiting = attempt ? WAITING.has(attempt.status) : false;
  const [markRead] = useAssessmentReadResultMutation();

  // Poll while the AI is scoring; the backend answers in seconds to a minute.
  const { startPolling, stopPolling } = detail;
  useEffect(() => {
    if (!waiting) return;
    startPolling(4000);
    return () => stopPolling();
  }, [waiting, startPolling, stopPolling]);

  // Opening a finished result clears its notification.
  useEffect(() => {
    if (attempt?.status === AssessmentAttemptStatus.COMPLETED) {
      void markRead({
        variables: { id: attempt.id, version: attempt.version },
      }).catch(() => undefined);
    }
  }, [attempt?.status, attempt?.id, attempt?.version, markRead]);

  return (
    <Screen>
      <Stack.Screen options={{ title: attempt?.task.title ?? "Bài làm" }} />
      <QueryView
        loading={detail.loading}
        error={detail.error}
        data={attempt}
        onRetry={() => void detail.refetch()}
      >
        {(item) =>
          item.status === AssessmentAttemptStatus.DRAFT &&
          item.skill === "WRITING" ? (
            <WritingEditor
              attempt={item}
              onSubmitted={() => void detail.refetch()}
            />
          ) : (
            <AttemptResult
              attempt={item}
              waiting={waiting}
              onChanged={() => void detail.refetch()}
            />
          )
        }
      </QueryView>
    </Screen>
  );
}

function WritingEditor({
  attempt,
  onSubmitted,
}: {
  attempt: AssessmentAttemptFieldsFragment;
  onSubmitted: () => void;
}) {
  const draft = useWritingDraft(attempt);
  const [submit, submitState] = useAssessmentSubmitMutation();
  const words = wordCount(draft.text);
  const minimum = attempt.task.minimumWords;

  async function send() {
    const saved = await draft.flush();
    if (!saved) return;
    try {
      await submit({ variables: { id: attempt.id } });
      onSubmitted();
    } catch {
      // submitState.error renders below
    }
  }

  function confirm() {
    Alert.alert(
      "Nộp bài viết?",
      minimum > 0 && words < minimum
        ? `Bài mới có ${words}/${minimum} từ khuyến nghị. Bạn vẫn muốn nộp?`
        : "Sau khi nộp bạn không sửa được nữa.",
      [
        { text: "Viết tiếp", style: "cancel" },
        { text: "Nộp bài", onPress: () => void send() },
      ],
    );
  }

  return (
    <>
      <Card style={{ marginBottom: spacing.md }}>
        <AppText selectable>{attempt.task.instructions}</AppText>
      </Card>
      {draft.restore !== null ? (
        <Card style={{ marginBottom: spacing.md }}>
          <AppText>
            Điện thoại còn một bản nháp chưa lưu lên máy chủ. Khôi phục?
          </AppText>
          <Row gap={spacing.sm} style={{ marginTop: spacing.sm }}>
            <Button title="Khôi phục" size="sm" onPress={draft.acceptRestore} />
            <Button
              title="Bỏ qua"
              size="sm"
              variant="ghost"
              onPress={draft.dismissRestore}
            />
          </Row>
        </Card>
      ) : null}
      <TextField
        value={draft.text}
        onChangeText={draft.change}
        multiline
        placeholder="Viết bài của bạn ở đây…"
        style={{ minHeight: 280 }}
        maxLength={draft.maxLength}
        autoCorrect={false}
        accessibilityLabel="Bài viết"
      />
      <Row
        style={{ justifyContent: "space-between", marginBottom: spacing.md }}
      >
        <AppText
          variant="caption"
          tone={minimum > 0 && words < minimum ? "danger" : "muted"}
        >
          {words}
          {minimum > 0 ? `/${minimum}` : ""} từ
        </AppText>
        <AppText variant="caption" tone="muted">
          {draft.saving ? "Đang lưu…" : draft.dirty ? "Chưa lưu" : "Đã lưu"}
        </AppText>
      </Row>
      <Notice message={draft.error} />
      <Notice
        message={submitState.error ? errorMessage(submitState.error) : null}
      />
      <Row gap={spacing.sm}>
        <Button
          title="Lưu nháp"
          variant="secondary"
          onPress={() => void draft.flush()}
          disabled={!draft.dirty}
          style={{ flex: 1 }}
        />
        <Button
          title="Nộp bài"
          variant="accent"
          loading={submitState.loading}
          disabled={!draft.text.trim()}
          onPress={confirm}
          style={{ flex: 1 }}
        />
      </Row>
    </>
  );
}

function AttemptResult({
  attempt,
  waiting,
  onChanged,
}: {
  attempt: AssessmentAttemptFieldsFragment;
  waiting: boolean;
  onChanged: () => void;
}) {
  const [retry, retryState] = useAssessmentRetryMutation();
  const [requestReview, reviewState] = useAssessmentRequestReviewMutation();
  const report = parseReport(attempt.report);
  const failed = attempt.status === AssessmentAttemptStatus.FAILED;
  const mutationError = retryState.error ?? reviewState.error;

  return (
    <>
      <Row wrap gap={spacing.sm} style={{ marginBottom: spacing.md }}>
        <Badge label={skillLabel(attempt.skill)} />
        <Badge
          label={ATTEMPT_STATUS_LABELS[attempt.status]}
          tone={
            attempt.status === AssessmentAttemptStatus.COMPLETED
              ? "success"
              : failed
                ? "danger"
                : "accent"
          }
        />
        {attempt.submittedAt ? (
          <AppText variant="caption" tone="muted">
            Nộp {formatDateTime(attempt.submittedAt)}
          </AppText>
        ) : null}
      </Row>

      {waiting ? <LoadingState label="AI đang chấm bài của bạn…" /> : null}
      {attempt.status === AssessmentAttemptStatus.NEEDS_REVIEW ? (
        <Notice
          tone="info"
          message="Bài đang chờ giáo viên chấm. Bạn sẽ thấy kết quả ở đây khi có."
        />
      ) : null}
      {failed ? (
        <>
          <Notice message="Chấm chưa thành công. Bạn có thể chấm lại, hoặc nhờ giáo viên chấm." />
          <Row gap={spacing.sm} style={{ marginBottom: spacing.lg }}>
            <Button
              title="Chấm lại"
              loading={retryState.loading}
              onPress={() =>
                void retry({ variables: { id: attempt.id } })
                  .then(onChanged)
                  .catch(() => undefined)
              }
              style={{ flex: 1 }}
            />
            <Button
              title="Nhờ giáo viên"
              variant="secondary"
              loading={reviewState.loading}
              onPress={() =>
                void requestReview({ variables: { id: attempt.id } })
                  .then(onChanged)
                  .catch(() => undefined)
              }
              style={{ flex: 1 }}
            />
          </Row>
        </>
      ) : null}
      <Notice message={mutationError ? errorMessage(mutationError) : null} />

      {report ? <ReportView report={report} /> : null}

      {attempt.status === AssessmentAttemptStatus.COMPLETED ? (
        <Button
          title="Nhờ giáo viên chấm lại"
          variant="ghost"
          loading={reviewState.loading}
          onPress={() =>
            Alert.alert(
              "Nhờ giáo viên chấm?",
              "Giáo viên sẽ xem lại bài và có thể đổi điểm.",
              [
                { text: "Huỷ", style: "cancel" },
                {
                  text: "Gửi",
                  onPress: () =>
                    void requestReview({ variables: { id: attempt.id } })
                      .then(onChanged)
                      .catch(() => undefined),
                },
              ],
            )
          }
        />
      ) : null}

      <Section title="Bài của bạn">
        {attempt.audioUrl ? (
          <PlayButton url={attempt.audioUrl} label="Nghe bản ghi" />
        ) : null}
        {attempt.recognizedText ? (
          <AppText tone="muted" selectable>
            {attempt.recognizedText}
          </AppText>
        ) : null}
        {attempt.answerText ? (
          <AppText selectable>{attempt.answerText}</AppText>
        ) : null}
        {attempt.answerText ? (
          <AppText variant="caption" tone="muted">
            {attempt.wordCount} từ
          </AppText>
        ) : null}
      </Section>

      <Button
        title="Làm đề khác"
        variant="secondary"
        onPress={() =>
          router.replace(
            attempt.skill === "WRITING" ? "/study/writing" : "/study/speaking",
          )
        }
      />
    </>
  );
}
