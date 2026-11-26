import { Stack, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import {
  CONTENT_STATUS_LABELS,
  CONTENT_STATUS_TONE,
} from "@/features/admin/fullTestAdmin";
import { useAuth } from "@/features/auth/AuthProvider";
import { EXAM_ADMIN_ERRORS } from "@/features/exam/adminErrors";
import { formatDateTime } from "@/features/shared/labels";
import { errorMessage } from "@/lib/errors";
import {
  ExamStatus,
  ExamType,
  useAdminExamsQuery,
  useApproveExamMutation,
  useArchiveExamMutation,
  usePublishExamMutation,
  useRejectExamMutation,
  useRestoreExamMutation,
  useSubmitExamForReviewMutation,
  type AdminExamFieldsFragment,
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
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { usePrompt } from "@/ui/usePrompt";
import { spacing } from "@/ui/theme";

const EXAM_TYPES: [ExamType, string][] = [
  [ExamType.MOCK, "Thi thử"],
  [ExamType.PLACEMENT, "Đầu vào"],
  [ExamType.LEVEL_CHECK, "Đo trình độ"],
];

/** Which steps each status allows, as the web's EXAM_ACTIONS_BY_STATUS. Only hides buttons. */
const ACTIONS: Record<
  ExamStatus,
  {
    submit: boolean;
    approve: boolean;
    reject: boolean;
    publish: boolean;
    archive: boolean;
    restore?: boolean;
  }
> = {
  [ExamStatus.DRAFT]: {
    submit: true,
    approve: false,
    reject: false,
    publish: true,
    archive: true,
  },
  [ExamStatus.PENDING_REVIEW]: {
    submit: false,
    approve: true,
    reject: true,
    publish: false,
    archive: true,
  },
  [ExamStatus.REJECTED]: {
    submit: true,
    approve: false,
    reject: false,
    publish: false,
    archive: true,
  },
  [ExamStatus.PUBLISHED]: {
    submit: false,
    approve: false,
    reject: false,
    publish: false,
    archive: true,
  },
  [ExamStatus.ARCHIVED]: {
    submit: false,
    approve: false,
    reject: false,
    publish: false,
    archive: false,
    restore: true,
  },
};

/** Exams: write, submit, review, publish, archive. As the web's AdminExamListView. */
export default function AdminExamsScreen() {
  const { me } = useAuth();
  const canReview = me?.role === "ADMIN";
  const [status, setStatus] = useState<ExamStatus | null>(null);
  const [examType, setExamType] = useState<ExamType | null>(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    text: string;
    tone: "success" | "danger";
  } | null>(null);
  const pending = useRef(false);
  const prompt = usePrompt();

  useEffect(() => {
    const timer = setTimeout(() => {
      setTitle(search.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const exams = useAdminExamsQuery({
    variables: { status, examType, title: title || null, page, size: 20 },
    fetchPolicy: "cache-and-network",
  });
  const [submit] = useSubmitExamForReviewMutation();
  const [approve] = useApproveExamMutation();
  const [reject] = useRejectExamMutation();
  const [publish] = usePublishExamMutation();
  const [archive] = useArchiveExamMutation();
  const [restore] = useRestoreExamMutation();

  async function run(id: string, action: () => Promise<unknown>, done: string) {
    if (pending.current) return;
    pending.current = true;
    setBusyId(id);
    setNotice(null);
    try {
      await action();
      setNotice({ text: done, tone: "success" });
      await exams.refetch().catch(() => undefined);
    } catch (failure) {
      setNotice({
        text: errorMessage(failure, EXAM_ADMIN_ERRORS),
        tone: "danger",
      });
    } finally {
      pending.current = false;
      setBusyId(null);
    }
  }

  async function rejectWithNote(exam: AdminExamFieldsFragment) {
    const note = await prompt.ask({
      title: "Trả lại đề",
      message: "Tác giả sẽ thấy lý do này.",
      multiline: true,
      confirmLabel: "Trả lại",
    });
    if (note)
      await run(
        exam.id,
        () => reject({ variables: { id: exam.id, note } }),
        "Đã trả lại đề.",
      );
  }

  function confirmArchive(exam: AdminExamFieldsFragment) {
    Alert.alert("Lưu trữ đề?", "Học viên sẽ không thấy đề này nữa.", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Lưu trữ",
        style: "destructive",
        onPress: () =>
          void run(
            exam.id,
            () => archive({ variables: { id: exam.id } }),
            "Đã lưu trữ.",
          ),
      },
    ]);
  }

  return (
    <Screen
      refreshing={exams.loading && Boolean(exams.data)}
      onRefresh={() => void exams.refetch()}
    >
      {prompt.element}
      <Stack.Screen options={{ title: "Đề thi" }} />
      <Button
        title="Tạo đề"
        icon="add"
        onPress={() =>
          router.push({
            pathname: "/admin/content/editor/[kind]/[id]",
            params: { kind: "EXAM", id: "new" },
          })
        }
        style={{ marginBottom: spacing.sm }}
      />
      <ChipRow>
        <Chip
          label="Mọi trạng thái"
          selected={status === null}
          onPress={() => {
            setStatus(null);
            setPage(0);
          }}
        />
        {(Object.keys(CONTENT_STATUS_LABELS) as ExamStatus[]).map((value) => (
          <Chip
            key={value}
            label={CONTENT_STATUS_LABELS[value]}
            selected={status === value}
            onPress={() => {
              setStatus(value);
              setPage(0);
            }}
          />
        ))}
      </ChipRow>
      <ChipRow>
        <Chip
          label="Mọi loại đề"
          selected={examType === null}
          onPress={() => {
            setExamType(null);
            setPage(0);
          }}
        />
        {EXAM_TYPES.map(([value, label]) => (
          <Chip
            key={value}
            label={label}
            selected={examType === value}
            onPress={() => {
              setExamType(value);
              setPage(0);
            }}
          />
        ))}
      </ChipRow>
      <TextField
        placeholder="Tìm theo tên đề"
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
      />
      <Notice message={notice?.text} tone={notice?.tone} />
      <QueryView
        loading={exams.loading}
        error={exams.error}
        data={exams.data?.adminExams}
        onRetry={() => void exams.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState icon="document-text-outline" title="Không có đề nào" />
        }
      >
        {(data) => (
          <>
            {data.items.map((exam) => {
              const actions = ACTIONS[exam.status];
              const busy = busyId === exam.id;
              const editable =
                exam.status === ExamStatus.DRAFT ||
                exam.status === ExamStatus.REJECTED;
              return (
                <Card key={exam.id} style={{ marginBottom: spacing.sm }}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <AppText variant="label" style={{ flex: 1 }}>
                      {exam.title}
                    </AppText>
                    <Badge
                      label={CONTENT_STATUS_LABELS[exam.status]}
                      tone={CONTENT_STATUS_TONE[exam.status]}
                    />
                  </Row>
                  <AppText variant="caption" tone="muted">
                    {[
                      exam.examType,
                      exam.certificateType,
                      exam.certificateVariant,
                      exam.targetLevel,
                      `v${exam.versionNumber}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    {exam.submittedForReviewAt
                      ? ` · gửi duyệt ${formatDateTime(exam.submittedForReviewAt)}`
                      : ""}
                  </AppText>
                  {exam.reviewNote ? (
                    <AppText variant="caption" tone="danger">
                      Lý do trả lại: {exam.reviewNote}
                    </AppText>
                  ) : null}
                  <Row wrap gap={spacing.xs} style={{ marginTop: spacing.sm }}>
                    <Button
                      title={editable ? "Soạn / xem trước" : "Xem đề"}
                      size="sm"
                      variant="ghost"
                      onPress={() =>
                        router.push({
                          pathname: "/admin/content/editor/[kind]/[id]",
                          params: { kind: "EXAM", id: exam.id },
                        })
                      }
                    />
                    {actions.submit ? (
                      <Button
                        title="Gửi duyệt"
                        size="sm"
                        variant="secondary"
                        loading={busy}
                        onPress={() =>
                          void run(
                            exam.id,
                            () => submit({ variables: { id: exam.id } }),
                            "Đã gửi duyệt.",
                          )
                        }
                      />
                    ) : null}
                    {canReview && actions.approve ? (
                      <Button
                        title="Duyệt"
                        size="sm"
                        loading={busy}
                        onPress={() =>
                          void run(
                            exam.id,
                            () => approve({ variables: { id: exam.id } }),
                            "Đã duyệt và xuất bản.",
                          )
                        }
                      />
                    ) : null}
                    {canReview && actions.reject ? (
                      <Button
                        title="Trả lại"
                        size="sm"
                        variant="danger"
                        disabled={busy}
                        onPress={() => void rejectWithNote(exam)}
                      />
                    ) : null}
                    {canReview && actions.publish ? (
                      <Button
                        title="Xuất bản"
                        size="sm"
                        loading={busy}
                        onPress={() =>
                          void run(
                            exam.id,
                            () => publish({ variables: { id: exam.id } }),
                            "Đã xuất bản.",
                          )
                        }
                      />
                    ) : null}
                    {canReview && actions.restore ? (
                      <Button
                        title="Khôi phục"
                        size="sm"
                        variant="secondary"
                        loading={busy}
                        onPress={() =>
                          void run(
                            exam.id,
                            () => restore({ variables: { id: exam.id } }),
                            "Đã khôi phục.",
                          )
                        }
                      />
                    ) : null}
                    {canReview && actions.archive ? (
                      <Button
                        title="Lưu trữ"
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onPress={() => confirmArchive(exam)}
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
    </Screen>
  );
}
