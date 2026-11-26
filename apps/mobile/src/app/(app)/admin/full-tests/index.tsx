import { Stack, router } from "expo-router";
import { useRef, useState } from "react";
import { Alert } from "react-native";

import {
  CONTENT_STATUS_LABELS,
  CONTENT_STATUS_TONE,
  FULL_TEST_ERRORS,
} from "@/features/admin/fullTestAdmin";
import { useAuth } from "@/features/auth/AuthProvider";
import { formatDate } from "@/features/shared/labels";
import { errorMessage } from "@/lib/errors";
import {
  ExamStatus,
  useAdminFullTestsQuery,
  useApproveFullTestMutation,
  useArchiveFullTestMutation,
  useRejectFullTestMutation,
  useSubmitFullTestForReviewMutation,
  type AdminFullTestFieldsFragment,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  Notice,
  Row,
  Screen,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { usePrompt } from "@/ui/usePrompt";
import { spacing } from "@/ui/theme";

/** IELTS full tests: one paper plus five Writing/Speaking tasks. As the web's AdminFullTestListView. */
export default function AdminFullTestsScreen() {
  const { me } = useAuth();
  const canReview = me?.role === "ADMIN";
  const query = useAdminFullTestsQuery({ fetchPolicy: "cache-and-network" });
  const [submit] = useSubmitFullTestForReviewMutation();
  const [approve] = useApproveFullTestMutation();
  const [reject] = useRejectFullTestMutation();
  const [archive] = useArchiveFullTestMutation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    text: string;
    tone: "success" | "danger";
  } | null>(null);
  const pending = useRef(false);
  const prompt = usePrompt();

  async function run(id: string, action: () => Promise<unknown>, done: string) {
    if (pending.current) return;
    pending.current = true;
    setBusyId(id);
    setNotice(null);
    try {
      await action();
      setNotice({ text: done, tone: "success" });
      await query.refetch().catch(() => undefined);
    } catch (failure) {
      setNotice({
        text: errorMessage(failure, FULL_TEST_ERRORS),
        tone: "danger",
      });
    } finally {
      pending.current = false;
      setBusyId(null);
    }
  }

  async function rejectWithNote(fullTest: AdminFullTestFieldsFragment) {
    const note = await prompt.ask({
      title: "Trả lại full test",
      message: "Tác giả sẽ thấy ghi chú này.",
      multiline: true,
      confirmLabel: "Trả lại",
    });
    if (note)
      await run(
        fullTest.id,
        () => reject({ variables: { id: fullTest.id, note } }),
        "Đã trả lại full test.",
      );
  }

  function confirmArchive(fullTest: AdminFullTestFieldsFragment) {
    Alert.alert("Lưu trữ full test?", "Người học sẽ không bắt đầu được nữa.", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Lưu trữ",
        style: "destructive",
        onPress: () =>
          void run(
            fullTest.id,
            () => archive({ variables: { id: fullTest.id } }),
            "Đã lưu trữ.",
          ),
      },
    ]);
  }

  return (
    <Screen
      refreshing={query.loading && Boolean(query.data)}
      onRefresh={() => void query.refetch()}
    >
      {prompt.element}
      <Stack.Screen options={{ title: "Full test IELTS" }} />
      <Button
        title="Tạo full test"
        icon="add"
        onPress={() =>
          router.push({
            pathname: "/admin/full-tests/[id]",
            params: { id: "new" },
          })
        }
        style={{ marginBottom: spacing.md }}
      />
      <Notice message={notice?.text} tone={notice?.tone} />
      <QueryView
        loading={query.loading}
        error={query.error}
        data={query.data?.adminFullTests}
        onRetry={() => void query.refetch()}
        isEmpty={(items) => items.length === 0}
        empty={
          <EmptyState
            icon="trophy-outline"
            title="Chưa có full test nào"
            message="Ghép một đề Listening + Reading đã phát hành với 5 đề Writing/Speaking."
          />
        }
      >
        {(items) =>
          items.map((fullTest) => {
            const busy = busyId === fullTest.id;
            const editable =
              fullTest.status === ExamStatus.DRAFT ||
              fullTest.status === ExamStatus.REJECTED;
            return (
              <Card key={fullTest.id} style={{ marginBottom: spacing.sm }}>
                <Row style={{ justifyContent: "space-between" }}>
                  <AppText variant="label" style={{ flex: 1 }}>
                    {fullTest.title}
                  </AppText>
                  <Badge
                    label={CONTENT_STATUS_LABELS[fullTest.status]}
                    tone={CONTENT_STATUS_TONE[fullTest.status]}
                  />
                </Row>
                <AppText variant="caption" tone="muted">
                  {fullTest.certificateVariant === "GENERAL"
                    ? "General Training"
                    : "Academic"}{" "}
                  · v{fullTest.version}
                  {fullTest.publishedAt
                    ? ` · phát hành ${formatDate(fullTest.publishedAt)}`
                    : ""}
                </AppText>
                {fullTest.status === ExamStatus.REJECTED &&
                fullTest.reviewNote ? (
                  <Notice message={`Ghi chú duyệt: ${fullTest.reviewNote}`} />
                ) : null}
                <Row wrap gap={spacing.xs} style={{ marginTop: spacing.sm }}>
                  {editable ? (
                    <>
                      <Button
                        title="Sửa"
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onPress={() =>
                          router.push({
                            pathname: "/admin/full-tests/[id]",
                            params: { id: fullTest.id },
                          })
                        }
                      />
                      <Button
                        title="Gửi duyệt"
                        size="sm"
                        loading={busy}
                        onPress={() =>
                          void run(
                            fullTest.id,
                            () => submit({ variables: { id: fullTest.id } }),
                            "Đã gửi duyệt.",
                          )
                        }
                      />
                    </>
                  ) : null}
                  {canReview &&
                  fullTest.status === ExamStatus.PENDING_REVIEW ? (
                    <>
                      <Button
                        title="Duyệt và phát hành"
                        size="sm"
                        loading={busy}
                        onPress={() =>
                          void run(
                            fullTest.id,
                            () => approve({ variables: { id: fullTest.id } }),
                            "Đã phát hành full test.",
                          )
                        }
                      />
                      <Button
                        title="Trả lại"
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onPress={() => void rejectWithNote(fullTest)}
                      />
                    </>
                  ) : null}
                  {canReview && fullTest.status === ExamStatus.PUBLISHED ? (
                    <Button
                      title="Lưu trữ"
                      size="sm"
                      variant="danger"
                      disabled={busy}
                      onPress={() => confirmArchive(fullTest)}
                    />
                  ) : null}
                </Row>
              </Card>
            );
          })
        }
      </QueryView>
    </Screen>
  );
}
