import { useRef, useState } from "react";
import { Alert, View } from "react-native";

import { useAuth } from "@/features/auth/AuthProvider";
import { errorMessage } from "@/lib/errors";
import {
  ContentKind,
  useApproveContentMutation,
  useApproveExamMutation,
  useArchiveContentMutation,
  useArchiveExamMutation,
  useRejectContentMutation,
  useRejectExamMutation,
  useSubmitContentForReviewMutation,
  useSubmitExamForReviewMutation,
} from "@/lib/graphql/generated";
import { Button, Notice, Row, TextField } from "@/ui/components";
import { spacing } from "@/ui/theme";

import { CONTENT_ERRORS } from "./errors";
import type { AuthoringKind } from "./types";

type Action = "submit" | "approve" | "reject" | "archive";

/**
 * Review steps from inside the editor: the author submits what is saved, an
 * administrator approves, returns with a note or archives. As the web's
 * AuthoringReviewActions.
 */
export function ReviewActions({
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
  const { me } = useAuth();
  const admin = me?.role === "ADMIN";
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
  const [notice, setNotice] = useState<{
    text: string;
    tone: "success" | "danger" | "info";
  } | null>(null);
  const pending = useRef(false);

  async function run(action: Action) {
    if (pending.current || dirty) return;
    pending.current = true;
    setBusy(true);
    setNotice(null);
    try {
      if (kind === "EXAM") {
        const variables = { id, note };
        const result =
          action === "submit"
            ? await submitExam({ variables })
            : action === "approve"
              ? await approveExam({ variables })
              : action === "reject"
                ? await rejectExam({ variables })
                : await archiveExam({ variables });
        if (!result.data) throw new Error("Missing result");
      } else {
        const variables = { id, kind: kind as ContentKind, note };
        const result =
          action === "submit"
            ? await submitContent({ variables })
            : action === "approve"
              ? await approveContent({ variables })
              : action === "reject"
                ? await rejectContent({ variables })
                : await archiveContent({ variables });
        if (!result.data) throw new Error("Missing result");
      }
      setNotice({ text: "Đã cập nhật trạng thái nội dung.", tone: "success" });
      await refresh().catch(() =>
        setNotice({
          text: "Thao tác đã lưu nhưng chưa tải được trạng thái mới. Hãy mở lại.",
          tone: "info",
        }),
      );
    } catch (failure) {
      setNotice({
        text: errorMessage(failure, CONTENT_ERRORS),
        tone: "danger",
      });
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function archive() {
    Alert.alert(
      "Lưu trữ nội dung?",
      "Đề sẽ ẩn khỏi thư viện; lịch sử và bài đã nộp được giữ.",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Lưu trữ",
          style: "destructive",
          onPress: () => void run("archive"),
        },
      ],
    );
  }

  return (
    <View style={{ marginTop: spacing.md }}>
      {dirty ? (
        <Notice tone="info" message="Lưu nháp trước khi gửi duyệt." />
      ) : null}
      <Notice message={notice?.text} tone={notice?.tone} />
      {admin && status === "PENDING_REVIEW" ? (
        <TextField
          label="Lý do trả lại (bắt buộc khi trả lại)"
          value={note}
          onChangeText={setNote}
          maxLength={4000}
          multiline
          editable={!busy}
        />
      ) : null}
      <Row wrap gap={spacing.xs}>
        {["DRAFT", "REJECTED"].includes(status ?? "") ? (
          <Button
            title="Gửi duyệt nội dung đã lưu"
            loading={busy}
            disabled={dirty}
            onPress={() => void run("submit")}
          />
        ) : null}
        {admin && status === "PENDING_REVIEW" ? (
          <>
            <Button
              title="Duyệt và xuất bản"
              loading={busy}
              onPress={() => void run("approve")}
            />
            <Button
              title="Trả lại kèm lý do"
              variant="danger"
              loading={busy}
              disabled={!note.trim()}
              onPress={() => void run("reject")}
            />
          </>
        ) : null}
        {admin && status === "PUBLISHED" ? (
          <Button
            title="Lưu trữ"
            variant="secondary"
            loading={busy}
            onPress={archive}
          />
        ) : null}
      </Row>
    </View>
  );
}
