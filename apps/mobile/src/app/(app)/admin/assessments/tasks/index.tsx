import { Stack, router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Image, Modal, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  TASK_ERRORS,
  TASK_STATUS_LABELS,
} from "@/features/assessment/admin/labels";
import { skillLabel, taskTypeLabel } from "@/features/assessment/report";
import { useAuth } from "@/features/auth/AuthProvider";
import { errorMessage } from "@/lib/errors";
import {
  AssessmentSkill,
  AssessmentTaskStatus,
  useAssessmentAuthoringQuery,
  useAssessmentTransitionTaskMutation,
  type AssessmentTaskFieldsFragment,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  Notice,
  Pager,
  Row,
  Screen,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { usePrompt } from "@/ui/usePrompt";
import { colors, radius, spacing } from "@/ui/theme";

/** Writing and Speaking tasks: write, send for review, publish. As the web's AssessmentManagement, tasks tab. */
export default function AssessmentTasksScreen() {
  const { me } = useAuth();
  const admin = me?.role === "ADMIN";
  const [skill, setSkill] = useState<AssessmentSkill | null>(null);
  const [status, setStatus] = useState<AssessmentTaskStatus | null>(null);
  const [page, setPage] = useState(0);
  const tasks = useAssessmentAuthoringQuery({
    variables: { skill, status, page },
    fetchPolicy: "cache-and-network",
  });
  const [transition] = useAssessmentTransitionTaskMutation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<AssessmentTaskFieldsFragment | null>(
    null,
  );
  const lock = useRef(false);
  const prompt = usePrompt();

  async function act(
    task: AssessmentTaskFieldsFragment,
    action: string,
    note?: string,
  ) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      await transition({ variables: { id: task.id, action, note } });
      await tasks
        .refetch()
        .catch(() =>
          setError(
            "Thao tác đã thành công nhưng danh sách chưa cập nhật. Kéo xuống để tải lại.",
          ),
        );
    } catch (failure) {
      setError(errorMessage(failure, TASK_ERRORS));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function reject(task: AssessmentTaskFieldsFragment) {
    const note = await prompt.ask({
      title: "Yêu cầu chỉnh sửa đề",
      message: "Lý do / nội dung cần sửa",
      multiline: true,
      confirmLabel: "Trả lại cho người soạn",
    });
    if (note) await act(task, "reject", note);
  }

  function archive(task: AssessmentTaskFieldsFragment) {
    Alert.alert(
      `Lưu trữ “${task.title}”?`,
      "Đề sẽ ẩn khỏi thư viện; bài đã nộp vẫn được giữ.",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Lưu trữ",
          style: "destructive",
          onPress: () => void act(task, "archive"),
        },
      ],
    );
  }

  const filtered = Boolean(skill || status || page > 0);
  return (
    <Screen
      refreshing={tasks.loading && Boolean(tasks.data)}
      onRefresh={() => void tasks.refetch()}
    >
      {prompt.element}
      <Stack.Screen options={{ title: "Đề Nói & Viết" }} />
      <Button
        title="Tạo đề luyện"
        icon="add"
        onPress={() =>
          router.push({
            pathname: "/admin/assessments/tasks/[id]",
            params: { id: "new" },
          })
        }
        style={{ marginBottom: spacing.sm }}
      />
      <ChipRow>
        <Chip
          label="Mọi kỹ năng"
          selected={skill === null}
          onPress={() => {
            setSkill(null);
            setPage(0);
          }}
        />
        {[AssessmentSkill.WRITING, AssessmentSkill.SPEAKING].map((value) => (
          <Chip
            key={value}
            label={skillLabel(value)}
            selected={skill === value}
            onPress={() => {
              setSkill(value);
              setPage(0);
            }}
          />
        ))}
      </ChipRow>
      <ChipRow>
        <Chip
          label="Mọi trạng thái"
          selected={status === null}
          onPress={() => {
            setStatus(null);
            setPage(0);
          }}
        />
        {Object.values(AssessmentTaskStatus).map((value) => (
          <Chip
            key={value}
            label={TASK_STATUS_LABELS[value] ?? value}
            selected={status === value}
            onPress={() => {
              setStatus(value);
              setPage(0);
            }}
          />
        ))}
      </ChipRow>
      <Notice message={error} />
      <QueryView
        loading={tasks.loading}
        error={tasks.error}
        data={tasks.data?.authoringAssessmentTasks}
        onRetry={() => void tasks.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState
            icon="reader-outline"
            title={
              filtered
                ? "Không có đề phù hợp bộ lọc"
                : admin
                  ? "Chưa có đề Writing / Speaking"
                  : "Bạn chưa có đề Writing / Speaking phụ trách"
            }
            message="Tạo đề mới hoặc điền nhanh từ đề mẫu. Sau khi lưu bản nháp, gửi duyệt; đề được admin xuất bản mới xuất hiện cho người học."
          />
        }
      >
        {(data) => (
          <>
            {data.items.map((task) => {
              const editable =
                task.status === AssessmentTaskStatus.DRAFT ||
                task.status === AssessmentTaskStatus.REJECTED;
              return (
                <Card key={task.id} style={{ marginBottom: spacing.sm }}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <AppText variant="label" style={{ flex: 1 }}>
                      {task.title}
                    </AppText>
                    <Badge
                      label={TASK_STATUS_LABELS[task.status] ?? task.status}
                      tone={
                        task.status === AssessmentTaskStatus.PUBLISHED
                          ? "success"
                          : task.status === AssessmentTaskStatus.REJECTED
                            ? "danger"
                            : "neutral"
                      }
                    />
                  </Row>
                  <AppText variant="caption" tone="muted">
                    {skillLabel(task.skill)} · {taskTypeLabel(task.taskType)}
                    {task.certificateType ? ` · ${task.certificateType}` : ""}
                  </AppText>
                  {task.reviewNote ? (
                    <AppText variant="caption" tone="danger">
                      Yêu cầu chỉnh sửa: {task.reviewNote}
                    </AppText>
                  ) : null}
                  <Row wrap gap={spacing.xs} style={{ marginTop: spacing.sm }}>
                    <Button
                      title="Xem trước"
                      size="sm"
                      variant="ghost"
                      onPress={() => setPreview(task)}
                    />
                    {editable ? (
                      <>
                        <Button
                          title="Sửa đề"
                          size="sm"
                          variant="secondary"
                          disabled={busy}
                          onPress={() =>
                            router.push({
                              pathname: "/admin/assessments/tasks/[id]",
                              params: { id: task.id },
                            })
                          }
                        />
                        <Button
                          title="Gửi duyệt"
                          size="sm"
                          disabled={busy}
                          onPress={() => void act(task, "submit")}
                        />
                      </>
                    ) : null}
                    {admin &&
                    task.status === AssessmentTaskStatus.PENDING_REVIEW ? (
                      <>
                        <Button
                          title="Duyệt và xuất bản"
                          size="sm"
                          disabled={busy}
                          onPress={() => void act(task, "approve")}
                        />
                        <Button
                          title="Trả lại"
                          size="sm"
                          variant="danger"
                          disabled={busy}
                          onPress={() => void reject(task)}
                        />
                      </>
                    ) : null}
                    {admin && task.status === AssessmentTaskStatus.ARCHIVED ? (
                      <Button
                        title="Khôi phục"
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onPress={() => void act(task, "restore")}
                      />
                    ) : null}
                    {admin && task.status === AssessmentTaskStatus.PUBLISHED ? (
                      <Button
                        title="Lưu trữ"
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onPress={() => archive(task)}
                      />
                    ) : null}
                  </Row>
                </Card>
              );
            })}
            <Pager
              page={data.page}
              totalPages={data.totalPages}
              onChange={setPage}
            />
          </>
        )}
      </QueryView>
      <TaskPreview task={preview} onClose={() => setPreview(null)} />
    </Screen>
  );
}

function TaskPreview({
  task,
  onClose,
}: {
  task: AssessmentTaskFieldsFragment | null;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={task !== null}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Row
          style={{
            justifyContent: "space-between",
            padding: spacing.md,
          }}
        >
          <AppText variant="heading" style={{ flex: 1 }}>
            {task?.title}
          </AppText>
          <Button title="Đóng" size="sm" variant="ghost" onPress={onClose} />
        </Row>
        {task ? (
          <ScrollView contentContainerStyle={{ padding: spacing.md }}>
            <Badge
              label={`${skillLabel(task.skill)} · ${taskTypeLabel(task.taskType)}`}
            />
            <Section title="Đề và hướng dẫn">
              <AppText selectable>{task.instructions}</AppText>
              {task.imageUrl ? (
                <Image
                  source={{ uri: task.imageUrl }}
                  resizeMode="contain"
                  accessibilityLabel="Biểu đồ của đề"
                  style={{
                    width: "100%",
                    aspectRatio: 4 / 3,
                    borderRadius: radius.md,
                    marginTop: spacing.sm,
                  }}
                />
              ) : null}
            </Section>
            <Section title="Ghi chú chấm bài">
              <AppText selectable>
                {task.rubricNotes || "Chấm theo rubric 4 tiêu chí mặc định."}
              </AppText>
            </Section>
            <Section title="Bài tham khảo">
              <AppText selectable>
                {task.sampleAnswer || "Chưa có bài tham khảo."}
              </AppText>
            </Section>
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: spacing.md }}>
      <AppText variant="label" style={{ marginBottom: spacing.xs }}>
        {title}
      </AppText>
      {children}
    </View>
  );
}
