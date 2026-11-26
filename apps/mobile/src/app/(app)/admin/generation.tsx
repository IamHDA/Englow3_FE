import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { formatDateTime } from "@/features/shared/labels";
import { backendCodeOf } from "@/lib/errors";
import {
  GenerationKind,
  GenerationStatus,
  useAdminGenerationQuery,
  useRequestGenerationMutation,
  useResumeGenerationMutation,
  type GenerationRequestFieldsFragment,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  Notice,
  Pager,
  ProgressBar,
  Row,
  Screen,
  Section,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

/** As the web's constants/generation.ts. */
const BRIEF_MAX_LENGTH = 1000;
const POLL_MS = 5_000;

const STEP_LABELS: Record<string, string> = {
  plan: "Lên chủ đề",
  "listening-1": "Viết Listening Part 1",
  "listening-2": "Viết Listening Part 2",
  "listening-3": "Viết Listening Part 3",
  "listening-4": "Viết Listening Part 4",
  "reading-1": "Viết Reading Passage 1",
  "reading-2": "Viết Reading Passage 2",
  "reading-3": "Viết Reading Passage 3",
  "writing-1": "Viết Writing Task 1",
  "writing-2": "Viết Writing Task 2",
  speaking: "Viết đề Speaking",
  assemble: "Dựng bộ đề và tạo bản nháp",
  chart: "Gắn biểu đồ Task 1",
  "audio-1": "Thu âm Listening Part 1",
  "audio-2": "Thu âm Listening Part 2",
  "audio-3": "Thu âm Listening Part 3",
  "audio-4": "Thu âm Listening Part 4",
  finish: "Gửi duyệt và tạo full test",
};

const STATUS: Record<
  GenerationStatus,
  { label: string; tone: "neutral" | "primary" | "success" | "danger" }
> = {
  [GenerationStatus.QUEUED]: { label: "Đang chờ", tone: "neutral" },
  [GenerationStatus.RUNNING]: { label: "Đang tạo", tone: "primary" },
  [GenerationStatus.COMPLETED]: { label: "Xong, chờ duyệt", tone: "success" },
  [GenerationStatus.FAILED]: { label: "Hỏng", tone: "danger" },
};

const REFUSALS: Record<string, string> = {
  GENERATION_NOT_RESUMABLE:
    "Lượt này không còn ở trạng thái thất bại nên không chạy tiếp được. Kéo xuống để tải lại.",
  GENERATION_RESUME_LIMIT: "Lượt này đã chạy tiếp 3 lần. Hãy tạo một lượt mới.",
  GENERATION_DAILY_LIMIT:
    "Bạn đã dùng hết lượt tạo đề hôm nay. Lượt hỏng không bị tính.",
  GENERATION_IN_PROGRESS:
    "Bạn đang có một lượt chưa xong. Đợi nó xong rồi tạo tiếp.",
};

const FAILURES: Record<string, string> = {
  GENERATION_STEP_FAILED:
    "AI viết sai luật 3 lần liền ở bước này. Thử lại, hoặc nới yêu cầu riêng nếu nó đòi điều luật không cho.",
  AI_GENERATION_DISABLED:
    "Chưa cấu hình model tạo đề trên AI service (AI_SERVICE_GENERATION_*).",
};

const TASK_LABELS = [
  "Writing Task 1",
  "Writing Task 2",
  "Speaking Part 1",
  "Speaking Part 2",
  "Speaking Part 3",
];

/** IELTS sets written by AI, as drafts for review. As the web's AdminGenerationView. */
export default function AdminGenerationScreen() {
  const [page, setPage] = useState(0);
  const query = useAdminGenerationQuery({
    variables: { page },
    fetchPolicy: "cache-and-network",
  });
  const { data, startPolling, stopPolling, refetch } = query;
  const [request, requestState] = useRequestGenerationMutation();
  const [resume] = useResumeGenerationMutation();
  const [brief, setBrief] = useState("");
  const [resumingId, setResumingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    text: string;
    tone: "success" | "danger";
  } | null>(null);

  const requests = data?.generationRequests.items ?? [];
  const running = requests.some(
    (item) =>
      item.status === GenerationStatus.QUEUED ||
      item.status === GenerationStatus.RUNNING,
  );
  useEffect(() => {
    if (!running) return;
    startPolling(POLL_MS);
    return () => stopPolling();
  }, [running, startPolling, stopPolling]);

  const allowance = data?.generationAllowance;
  const blocked =
    !allowance || allowance.remaining <= 0 || allowance.inProgress;

  async function start() {
    setNotice(null);
    try {
      await request({
        variables: {
          kind: GenerationKind.IELTS_FULL_TEST,
          brief: brief.trim() || null,
        },
      });
      setBrief("");
      setNotice({
        text: "Đã bắt đầu tạo bộ đề. Trang sẽ tự cập nhật tiến độ.",
        tone: "success",
      });
      setPage(0);
      await refetch({ page: 0 }).catch(() => undefined);
    } catch (failure) {
      setNotice({
        text:
          REFUSALS[backendCodeOf(failure) ?? ""] ??
          "Chưa bắt đầu được. Kiểm tra kết nối rồi thử lại.",
        tone: "danger",
      });
    }
  }

  async function resumeFrom(id: string) {
    setResumingId(id);
    setNotice(null);
    try {
      await resume({ variables: { id } });
      setNotice({
        text: "Đã chạy tiếp từ bước lỗi. Trang sẽ tự cập nhật tiến độ.",
        tone: "success",
      });
      await refetch().catch(() => undefined);
    } catch (failure) {
      setNotice({
        text:
          REFUSALS[backendCodeOf(failure) ?? ""] ??
          "Chưa chạy tiếp được. Kiểm tra kết nối rồi thử lại.",
        tone: "danger",
      });
    } finally {
      setResumingId(null);
    }
  }

  return (
    <Screen
      refreshing={query.loading && Boolean(data)}
      onRefresh={() => void refetch()}
    >
      <Stack.Screen options={{ title: "Tạo đề bằng AI" }} />
      <AppText variant="caption" tone="muted">
        AI viết một bộ full test IELTS Academic: đề Listening + Reading có
        audio, 5 đề Writing/Speaking và full test nháp. Mọi thứ được gửi duyệt,
        không có gì tự phát hành. Mỗi lượt mất vài phút.
      </AppText>
      <Notice message={notice?.text} tone={notice?.tone} />
      <QueryView
        loading={query.loading}
        error={query.error}
        data={data}
        onRetry={() => void refetch()}
      >
        {(loaded) => (
          <>
            <Section title="Tạo bộ đề mới">
              <TextField
                label="Yêu cầu riêng (không bắt buộc)"
                hint="Ví dụ: chủ đề khoa học và môi trường, khó hơn B2, nhiều câu ghép. Để trống thì AI tạo theo mặc định."
                value={brief}
                onChangeText={setBrief}
                maxLength={BRIEF_MAX_LENGTH}
                multiline
                editable={!requestState.loading}
              />
              <AppText
                variant="caption"
                tone="muted"
                style={{ marginBottom: spacing.sm }}
              >
                Còn {loaded.generationAllowance.remaining}/
                {loaded.generationAllowance.limit} lượt hôm nay · {brief.length}
                /{BRIEF_MAX_LENGTH} ký tự
              </AppText>
              <Button
                title="Tạo bộ đề IELTS"
                icon="sparkles-outline"
                loading={requestState.loading}
                disabled={blocked}
                onPress={() => void start()}
              />
              {loaded.generationAllowance.inProgress ? (
                <AppText
                  variant="caption"
                  tone="muted"
                  style={{ marginTop: spacing.xs }}
                >
                  Bạn đang có một lượt chưa xong; đợi nó xong rồi tạo tiếp.
                </AppText>
              ) : null}
            </Section>

            <Section title="Các lượt tạo đề">
              {loaded.generationRequests.items.length === 0 ? (
                <EmptyState
                  icon="sparkles-outline"
                  title="Chưa có lượt tạo đề nào"
                />
              ) : (
                loaded.generationRequests.items.map((item) => (
                  <RequestCard
                    key={item.id}
                    request={item}
                    resuming={resumingId === item.id}
                    resumeDisabled={
                      loaded.generationAllowance.inProgress ||
                      (resumingId !== null && resumingId !== item.id)
                    }
                    inProgress={loaded.generationAllowance.inProgress}
                    onResume={() => void resumeFrom(item.id)}
                  />
                ))
              )}
              <Pager
                page={page}
                totalPages={loaded.generationRequests.totalPages}
                onChange={setPage}
              />
            </Section>
          </>
        )}
      </QueryView>
    </Screen>
  );
}

function RequestCard({
  request,
  resuming,
  resumeDisabled,
  inProgress,
  onResume,
}: {
  request: GenerationRequestFieldsFragment;
  resuming: boolean;
  resumeDisabled: boolean;
  inProgress: boolean;
  onResume: () => void;
}) {
  const status = STATUS[request.status];
  const step = request.step
    ? (STEP_LABELS[request.step] ?? request.step)
    : null;
  const running =
    request.status === GenerationStatus.QUEUED ||
    request.status === GenerationStatus.RUNNING;
  const failed = request.status === GenerationStatus.FAILED;
  const done = request.status === GenerationStatus.COMPLETED;

  return (
    <Card style={{ marginBottom: spacing.sm }}>
      <Row
        style={{ justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <View style={{ flex: 1, paddingRight: spacing.sm }}>
          <AppText variant="label">
            {request.title ?? "Bộ đề IELTS (đang lên chủ đề)"}
          </AppText>
          <AppText variant="caption" tone="muted">
            {request.requestedByName ?? ""} ·{" "}
            {formatDateTime(request.createdAt)}
          </AppText>
        </View>
        <Badge label={status.label} tone={status.tone} />
      </Row>
      {request.brief ? (
        <AppText variant="caption" style={{ marginTop: spacing.xs }}>
          Yêu cầu riêng: {request.brief}
        </AppText>
      ) : null}
      {running ? (
        <View style={{ marginTop: spacing.sm }}>
          <ProgressBar
            value={request.stepIndex / Math.max(1, request.stepsTotal)}
          />
          <AppText variant="caption" tone="muted">
            {step} · bước {request.stepIndex + 1}/{request.stepsTotal}
            {request.attempt > 0
              ? ` · đang thử lại lần ${request.attempt + 1}`
              : ""}
          </AppText>
        </View>
      ) : null}
      {request.lastProblems.length > 0 ? (
        <View style={{ marginTop: spacing.sm }}>
          <AppText variant="caption" tone={failed ? "danger" : "default"}>
            {failed ? "Lỗi lần thử cuối:" : "AI đang sửa các lỗi:"}
          </AppText>
          {request.lastProblems.slice(0, 6).map((problem) => (
            <AppText key={problem} variant="caption" tone="muted">
              • {problem}
            </AppText>
          ))}
        </View>
      ) : null}
      {failed ? (
        <View style={{ marginTop: spacing.sm }}>
          <Notice
            message={`Dừng ở bước: ${step ?? "?"}. ${
              (request.failureCode && FAILURES[request.failureCode]) ||
              `${request.failureCode ?? ""} ${request.failureMessage ?? ""}`
            }`}
          />
          {request.resumable ? (
            <>
              <AppText variant="caption" tone="muted">
                Các phần AI đã viết được giữ lại; chạy tiếp chỉ làm lại từ bước
                này.
                {request.resumeCount > 0
                  ? ` Đã chạy tiếp ${request.resumeCount}/3 lần.`
                  : ""}
              </AppText>
              <Button
                title="Chạy tiếp từ bước lỗi"
                size="sm"
                variant="secondary"
                loading={resuming}
                disabled={resumeDisabled}
                onPress={onResume}
              />
              {inProgress ? (
                <AppText variant="caption" tone="muted">
                  Đang có một lượt khác chạy; chờ lượt đó xong rồi chạy tiếp.
                </AppText>
              ) : null}
            </>
          ) : null}
        </View>
      ) : null}
      {done ? (
        <Row wrap gap={spacing.xs} style={{ marginTop: spacing.sm }}>
          {request.examId ? (
            <Button
              title="Đề Listening + Reading"
              size="sm"
              variant="ghost"
              onPress={() =>
                router.push({
                  pathname: "/admin/content/editor/[kind]/[id]",
                  params: { kind: "EXAM", id: request.examId ?? "" },
                })
              }
            />
          ) : null}
          {request.taskIds.map((taskId, index) => (
            <Button
              key={taskId}
              title={TASK_LABELS[index] ?? `Task ${index + 1}`}
              size="sm"
              variant="ghost"
              onPress={() =>
                router.push({
                  pathname: "/admin/assessments/tasks/[id]",
                  params: { id: taskId },
                })
              }
            />
          ))}
          {request.fullTestId ? (
            <Button
              title="Full test nháp"
              size="sm"
              variant="ghost"
              onPress={() => router.push("/admin/full-tests")}
            />
          ) : null}
        </Row>
      ) : null}
    </Card>
  );
}
