"use client";
import { Alert, Button, Group, Stack, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRef, useState } from "react";
import { ContentKind, Role } from "@/lib/graphql/generated";
import {
  useApproveContentMutation,
  useApproveExamMutation,
  useArchiveContentMutation,
  useArchiveExamMutation,
  useCurrentUserQuery,
  useRejectContentMutation,
  useRejectExamMutation,
  useSubmitContentForReviewMutation,
  useSubmitExamForReviewMutation,
} from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { AuthoringKind } from "../../types/authoring";

export function AuthoringReviewActions({
  kind,
  id,
  status,
  dirty,
  refresh,
}: {
  kind: AuthoringKind;
  id: string;
  status?: string;
  dirty: boolean;
  refresh: () => Promise<void>;
}) {
  const { isVi } = useLanguage();
  const t = (vi: string, en: string) => (isVi ? vi : en);
  const me = useCurrentUserQuery();
  const admin = me.data?.me.role === Role.ADMIN;
  const [submitContent] = useSubmitContentForReviewMutation();
  const [approveContent] = useApproveContentMutation();
  const [rejectContent] = useRejectContentMutation();
  const [archiveContent] = useArchiveContentMutation();
  const [submitExam] = useSubmitExamForReviewMutation();
  const [approveExam] = useApproveExamMutation();
  const [rejectExam] = useRejectExamMutation();
  const [archiveExam] = useArchiveExamMutation();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const pending = useRef(false);
  async function act(action: "submit" | "approve" | "reject" | "archive") {
    if (pending.current || dirty) return;
    if (
      action === "archive" &&
      !window.confirm(
        t(
          "Lưu trữ nội dung? Đề sẽ ẩn khỏi thư viện; lịch sử và bài đã nộp được giữ.",
          "Archive this content? It will leave the library; learner history and submissions are retained.",
        ),
      )
    )
      return;
    pending.current = true;
    setBusy(true);
    setError(false);
    try {
      const result =
        kind === "EXAM"
          ? await (
              action === "submit"
                ? submitExam
                : action === "approve"
                  ? approveExam
                  : action === "reject"
                    ? rejectExam
                    : archiveExam
            )({ variables: { id, note } })
          : await (
              action === "submit"
                ? submitContent
                : action === "approve"
                  ? approveContent
                  : action === "reject"
                    ? rejectContent
                    : archiveContent
            )({ variables: { id, kind: kind as ContentKind, note } });
      if (!result.data) throw new Error("Missing result");
      notifications.show({
        color: "teal",
        message: t(
          "Đã cập nhật trạng thái nội dung.",
          "Content status updated.",
        ),
      });
      await refresh().catch(() =>
        notifications.show({
          color: "orange",
          message: t(
            "Thao tác đã lưu nhưng chưa tải được trạng thái mới. Hãy tải lại.",
            "The action succeeded, but refreshing failed. Reload to see the current status.",
          ),
        }),
      );
    } catch {
      setError(true);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <Stack>
      {dirty && (
        <Alert color="blue">
          {t(
            "Lưu nháp trước khi gửi duyệt.",
            "Save your draft before submitting for review.",
          )}
        </Alert>
      )}
      {error && (
        <Alert color="orange">
          {t(
            "Chưa cập nhật được. Kiểm tra nội dung, trạng thái và quyền rồi thử lại.",
            "Could not update. Check the content, status and permissions, then retry.",
          )}
        </Alert>
      )}
      {admin && status === "PENDING_REVIEW" && (
        <Textarea
          label={t(
            "Lý do trả lại (bắt buộc khi trả lại)",
            "Changes requested (required to reject)",
          )}
          value={note}
          maxLength={4000}
          disabled={busy}
          onChange={(e) => setNote(e.currentTarget.value)}
        />
      )}
      <Group>
        {["DRAFT", "REJECTED"].includes(status ?? "") && (
          <Button
            disabled={dirty}
            loading={busy}
            onClick={() => void act("submit")}
          >
            {t("Gửi duyệt nội dung đã lưu", "Submit saved content for review")}
          </Button>
        )}
        {admin && status === "PENDING_REVIEW" && (
          <>
            <Button loading={busy} onClick={() => void act("approve")}>
              {t("Duyệt và xuất bản", "Approve and publish")}
            </Button>
            <Button
              color="red"
              variant="light"
              loading={busy}
              disabled={!note.trim()}
              onClick={() => void act("reject")}
            >
              {t("Trả lại kèm lý do", "Request changes")}
            </Button>
          </>
        )}
        {admin && status === "PUBLISHED" && (
          <Button
            variant="default"
            loading={busy}
            onClick={() => void act("archive")}
          >
            {t("Lưu trữ", "Archive")}
          </Button>
        )}
      </Group>
    </Stack>
  );
}
