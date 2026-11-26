import { Image } from "react-native";
import { Stack, router } from "expo-router";
import { useRef, useState } from "react";

import { formatDuration } from "@/features/shared/labels";
import { backendCodeOf, errorMessage } from "@/lib/errors";
import {
  AssessmentSkill,
  type FullTestSlot,
  useAssessmentStartMutation,
  useStartFullTestAssessmentMutation,
  useAssessmentSubmitMutation,
  useAssessmentTaskDetailQuery,
} from "@/lib/graphql/generated";
import { uploadToSignedUrl } from "@/lib/upload";
import { randomUUID } from "@/lib/uuid";
import { RecorderPanel, type Recording } from "@/ui/audio";
import {
  AppText,
  Badge,
  Button,
  Card,
  Notice,
  Row,
  Screen,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { radius, spacing } from "@/ui/theme";

import { taskTypeLabel } from "./report";

/**
 * A writing or speaking task. Writing opens a draft and continues on the
 * attempt screen; speaking is recorded here and uploaded before it counts.
 * The client key makes a retried start return the same attempt rather than a
 * second one.
 */
export function AssessmentTaskScreen({
  id,
  fullTest,
}: {
  id: string;
  /** Set when an IELTS full test sitting opened this task for one of its slots. */
  fullTest?: { sittingId: string; slot: FullTestSlot } | null;
}) {
  const detail = useAssessmentTaskDetailQuery({ variables: { id } });
  const [start] = useAssessmentStartMutation();
  const [startFullTestPart] = useStartFullTestAssessmentMutation();
  const [submit] = useAssessmentSubmitMutation();
  const [recording, setRecording] = useState<Recording | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<{ recording: Recording | null; key: string } | null>(
    null,
  );

  async function begin(speaking: boolean) {
    if (busy) return;
    setError(null);
    setBusy("Đang mở lượt làm…");
    try {
      if (speaking && !recording) throw new Error("recording missing");
      if (!request.current || request.current.recording !== recording) {
        request.current = { recording, key: randomUUID() };
      }
      const audio =
        speaking && recording
          ? {
              contentType: recording.contentType,
              contentLength: recording.bytes.byteLength,
            }
          : {};
      const ticket = fullTest
        ? await startFullTestPart({
            variables: {
              sittingId: fullTest.sittingId,
              slot: fullTest.slot,
              taskId: id,
              ...audio,
            },
          }).then(({ data }) =>
            data
              ? {
                  attempt: { id: data.startFullTestAssessment.attemptId },
                  uploadUrl: data.startFullTestAssessment.uploadUrl,
                }
              : null,
          )
        : await start({
            variables: { taskId: id, clientKey: request.current.key, ...audio },
          }).then(({ data }) => data?.startAssessment ?? null);
      if (!ticket) throw new Error("Missing result");
      if (speaking && recording) {
        if (!ticket.uploadUrl) throw new Error("Missing upload URL");
        setBusy("Đang tải bản ghi lên…");
        await uploadToSignedUrl(
          ticket.uploadUrl,
          recording.contentType,
          recording.bytes,
        );
        setBusy("Đang xác nhận nộp bài…");
        const submitted = await submit({
          variables: { id: ticket.attempt.id },
        });
        if (!submitted.data) throw new Error("Submission failed");
      }
      router.replace({
        pathname: "/study/assessments/attempts/[id]",
        params: { id: ticket.attempt.id },
      });
    } catch (failure) {
      const code = backendCodeOf(failure);
      if (code === "FULL_TEST_CLOSED" || code === "FULL_TEST_TASK_MISMATCH") {
        setError(
          "Lượt thi đã đóng hoặc đề này không thuộc lượt thi. Hãy mở lại phần làm bài từ bộ IELTS của bạn.",
        );
        return;
      }
      setError(
        code === "RECORDING_CHANGED" || code === "RECORDING_INVALID"
          ? "Bản ghi không hợp lệ hoặc vượt giới hạn thời gian. Hãy ghi lại."
          : speaking
            ? "Chưa gửi được bản ghi. Bản ghi vẫn được giữ; hãy kiểm tra kết nối rồi thử lại."
            : errorMessage(failure),
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen>
      <QueryView
        loading={detail.loading}
        error={detail.error}
        data={detail.data?.assessmentTask}
        onRetry={() => void detail.refetch()}
      >
        {(task) => {
          const speaking = task.skill === AssessmentSkill.SPEAKING;
          const capabilities = detail.data?.assessmentCapabilities;
          const automatic = speaking
            ? capabilities?.automaticSpeaking
            : capabilities?.automaticWriting;
          return (
            <>
              <Stack.Screen options={{ title: task.title }} />
              <Row wrap gap={spacing.sm} style={{ marginBottom: spacing.md }}>
                <Badge label={taskTypeLabel(task.taskType)} />
                <Badge
                  label={`${Math.round(task.timeLimitSeconds / 60)} phút`}
                  tone="neutral"
                />
                {task.minimumWords > 0 ? (
                  <Badge label={`${task.minimumWords}+ từ`} tone="neutral" />
                ) : null}
                {task.targetLevel ? (
                  <Badge label={task.targetLevel} tone="accent" />
                ) : null}
              </Row>
              <Card style={{ marginBottom: spacing.lg }}>
                <AppText selectable>{task.instructions}</AppText>
                {task.imageUrl ? (
                  <Image
                    source={{ uri: task.imageUrl }}
                    style={{
                      width: "100%",
                      aspectRatio: 4 / 3,
                      marginTop: spacing.md,
                      borderRadius: radius.md,
                    }}
                    resizeMode="contain"
                    accessibilityLabel="Biểu đồ của đề"
                  />
                ) : null}
              </Card>
              <Notice
                tone="info"
                message={
                  automatic
                    ? "Bài nộp sẽ được AI đánh giá theo 4 tiêu chí, với điểm luyện tập ước lượng."
                    : capabilities?.humanReview
                      ? "Bài nộp sẽ được giáo viên chấm."
                      : "Chấm bài đang tạm dừng; bài của bạn sẽ được chấm khi dịch vụ hoạt động lại."
                }
              />
              <Notice message={error} />
              {speaking ? (
                <>
                  <RecorderPanel
                    recording={recording}
                    onRecorded={setRecording}
                    disabled={Boolean(busy)}
                    maxSeconds={
                      task.timeLimitSeconds > 0
                        ? task.timeLimitSeconds
                        : undefined
                    }
                  />
                  <Button
                    title={busy ?? "Nộp bài nói"}
                    icon="send"
                    loading={Boolean(busy)}
                    disabled={!recording}
                    onPress={() => void begin(true)}
                  />
                  {task.timeLimitSeconds > 0 ? (
                    <AppText
                      variant="caption"
                      tone="muted"
                      style={{ marginTop: spacing.sm, textAlign: "center" }}
                    >
                      Ghi âm tự dừng sau {formatDuration(task.timeLimitSeconds)}
                      .
                    </AppText>
                  ) : null}
                </>
              ) : (
                <Button
                  title={busy ?? "Bắt đầu viết"}
                  icon="create"
                  loading={Boolean(busy)}
                  onPress={() => void begin(false)}
                />
              )}
            </>
          );
        }}
      </QueryView>
    </Screen>
  );
}
