"use client";
import { useAssessmentText } from "../hooks/useAssessmentText";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { useLanguage } from "@/shared/hooks/useLanguage";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  useAssessmentAttemptDetailQuery,
  useAssessmentSubmitMutation,
  useAssessmentRetryMutation,
  useAssessmentRequestReviewMutation,
} from "@/lib/graphql/generated/hooks";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { useWritingDraft } from "../hooks/useWritingDraft";
import { AssessmentReport } from "./AssessmentReport";
import { AssessmentResultRead } from "./AssessmentResultRead";
import { statusLabels, wordCount, type PracticeAttempt } from "../types";
import { TaskInstructions } from "./TaskInstructions";
export function AssessmentAttemptView({ id }: { id: string }) {
  const tx = useAssessmentText();
  const query = useAssessmentAttemptDetailQuery({
    variables: { id },
    fetchPolicy: "network-only",
  });
  const status = query.data?.assessmentAttempt.status;
  const { startPolling, stopPolling, refetch } = query;
  useEffect(() => {
    if (status === "QUEUED" || status === "NEEDS_REVIEW")
      startPolling(status === "QUEUED" ? 3000 : 30000);
    else stopPolling();
    const onFocus = () => {
      void refetch().catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => {
      stopPolling();
      window.removeEventListener("focus", onFocus);
    };
  }, [status, startPolling, stopPolling, refetch]);
  if (query.loading && !query.data)
    return (
      <Container py="xl">
        <Loader />
      </Container>
    );
  if (!query.data)
    return (
      <Container py="xl">
        <LoadErrorState
          error={query.error}
          thing={{ vi: tx("nội dung luyện tập"), en: "practice content" }}
          back={{ href: "/", label: tx("Trang chủ") }}
          onRetry={() => void refetch().catch(() => {})}
        />
      </Container>
    );
  return (
    <AttemptContent
      key={id}
      attempt={query.data.assessmentAttempt}
      refresh={() => refetch()}
    />
  );
}
function AttemptContent({
  attempt,
  refresh,
}: {
  attempt: PracticeAttempt;
  refresh: () => Promise<unknown>;
}) {
  const tx = useAssessmentText();
  const { isVi } = useLanguage();
  const [retry] = useAssessmentRetryMutation();
  const [review] = useAssessmentRequestReviewMutation();
  const [submit] = useAssessmentSubmitMutation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);
  async function act(action: "retry" | "review" | "submit") {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await (
        action === "retry" ? retry : action === "review" ? review : submit
      )({ variables: { id: attempt.id } });
      if (!result.data) throw new Error("No result");
      await refresh().catch(() =>
        setError(
          tx(
            "Thao tác đã thành công nhưng chưa tải được trạng thái mới. Hãy tải lại trang.",
          ),
        ),
      );
    } catch {
      setError(
        tx(
          "Chưa thực hiện được thao tác. Nội dung bài nộp vẫn được giữ; hãy thử lại.",
        ),
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Button
            component={Link}
            href={`/study/${attempt.skill === "WRITING" ? "writing" : "speaking"}`}
            variant="subtle"
          >
            {tx("← Lịch sử và đề luyện")}
          </Button>
          <Badge>{tx(statusLabels[attempt.status])}</Badge>
        </Group>
        <Title order={1}>{attempt.task.title}</Title>
        <Card withBorder>
          <TaskInstructions text={attempt.task.instructions} />
        </Card>
        {attempt.status === "DRAFT" && attempt.skill === "WRITING" ? (
          <WritingEditor key={attempt.id} attempt={attempt} refresh={refresh} />
        ) : (
          <>
            <Text size="xs" c="dimmed">
              {attempt.submittedAt
                ? tx("Đã nộp ") +
                  new Date(attempt.submittedAt).toLocaleString(
                    isVi ? "vi-VN" : "en-US",
                  )
                : tx("Bản ghi chưa nộp")}
            </Text>
            {attempt.audioUrl && (
              <audio
                controls
                src={attempt.audioUrl}
                style={{ width: "100%" }}
              />
            )}
            {attempt.answerText && (
              <Card withBorder>
                <Text fw={600}>
                  {tx("Bài viết của bạn")} · {attempt.wordCount} {tx("từ")}
                </Text>
                <Text mt="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {attempt.answerText}
                </Text>
              </Card>
            )}
            {attempt.status === "QUEUED" && (
              <Alert color="indigo" icon={<Loader size="sm" />}>
                {tx(
                  "Bài đã được lưu và đang chờ AI chấm. Bạn có thể rời trang rồi quay lại lịch sử để xem kết quả.",
                )}
              </Alert>
            )}
            {attempt.status === "NEEDS_REVIEW" && (
              <Alert color="blue">
                {tx(
                  "Bài đã được lưu và đang chờ giáo viên chấm. Kết quả sẽ xuất hiện tại đây khi hoàn tất.",
                )}
              </Alert>
            )}
            {attempt.status === "FAILED" && (
              <Alert color="orange">
                <Stack>
                  <Text>
                    {tx(
                      "Chưa chấm được bài này. Bài viết/bản ghi vẫn được giữ.",
                    )}
                  </Text>
                  <Group>
                    <Button onClick={() => void act("retry")} loading={busy}>
                      {tx("Thử chấm lại")}
                    </Button>
                    <Button
                      variant="light"
                      disabled={busy}
                      onClick={() => void act("review")}
                    >
                      {tx("Gửi giáo viên chấm")}
                    </Button>
                  </Group>
                </Stack>
              </Alert>
            )}
            {attempt.status === "DRAFT" && attempt.skill === "SPEAKING" && (
              <Alert>
                <Stack>
                  <Text>
                    {tx(
                      "Bản ghi chưa được nộp. Nếu upload đã hoàn tất, bạn có thể thử nộp lại.",
                    )}
                  </Text>
                  <Group>
                    <Button loading={busy} onClick={() => void act("submit")}>
                      {tx("Nộp bản ghi đã upload")}
                    </Button>
                    <Button
                      component={Link}
                      href={`/study/speaking/${attempt.taskId}`}
                      variant="light"
                    >
                      {tx("Ghi một bài mới")}
                    </Button>
                  </Group>
                </Stack>
              </Alert>
            )}
            {attempt.status === "COMPLETED" && (
              <>
                <AssessmentReport attempt={attempt} />
                <AssessmentResultRead
                  key={attempt.version}
                  id={attempt.id}
                  version={attempt.version}
                />
                <Button
                  component={Link}
                  href={`/study/${attempt.skill === "WRITING" ? "writing" : "speaking"}/${attempt.taskId}`}
                  variant="light"
                >
                  {tx("Luyện thêm một lần")}
                </Button>
              </>
            )}
            {error && <Alert color="red">{error}</Alert>}
          </>
        )}
      </Stack>
    </Container>
  );
}
function WritingEditor({
  attempt,
  refresh,
}: {
  attempt: PracticeAttempt;
  refresh: () => Promise<unknown>;
}) {
  const tx = useAssessmentText();
  const { isVi } = useLanguage();
  const draft = useWritingDraft(attempt);
  const [submit] = useAssessmentSubmitMutation();
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);
  const count = wordCount(draft.text);
  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (draft.dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [draft.dirty]);
  async function send() {
    if (locked.current) return;
    locked.current = true;
    setSubmitting(true);
    setError(null);
    try {
      if (!(await draft.save())) {
        setError(
          tx(
            "Chưa lưu được bản nháp nên bài chưa được nộp. Nội dung vẫn được giữ; hãy thử lưu lại.",
          ),
        );
        return;
      }
      const r = await submit({ variables: { id: attempt.id } });
      if (!r.data) throw new Error("No result");
      setConfirm(false);
      await refresh().catch(() =>
        setError(
          tx(
            "Bài đã được nộp nhưng chưa tải được trạng thái mới. Hãy tải lại trang để xem kết quả.",
          ),
        ),
      );
    } catch {
      setError(tx("Chưa nộp được bài. Bản nháp đã được giữ; hãy thử lại."));
    } finally {
      locked.current = false;
      setSubmitting(false);
    }
  }
  return (
    <Stack>
      {draft.restore !== null && (
        <Alert color="orange">
          <Stack>
            <Text>
              {tx(
                "Có bản sao tạm chưa đồng bộ từ lần làm trước. Chọn nội dung bạn muốn tiếp tục.",
              )}
            </Text>
            <Group>
              <Button onClick={draft.restoreLocal}>
                {tx("Khôi phục bản sao tạm")}
              </Button>
              <Button variant="light" onClick={draft.discardLocal}>
                {tx("Dùng bản trên máy chủ")}
              </Button>
            </Group>
          </Stack>
        </Alert>
      )}
      <Textarea
        label={tx("Bài viết của bạn")}
        description={tx(
          "Tự động lưu sau khi bạn ngừng nhập. Khuyến nghị thời gian trong đề là gợi ý luyện tập.",
        )}
        minRows={15}
        autosize
        maxRows={30}
        value={draft.text}
        onChange={(e) => draft.change(e.currentTarget.value)}
        maxLength={12000}
        disabled={submitting || draft.restore !== null}
      />
      <Group justify="space-between">
        <Text size="sm">
          {count} {tx("từ")} · {draft.text.length}/12000 {tx("ký tự")}
        </Text>
        <Text size="xs" c="dimmed">
          {draft.saving
            ? tx("Đang lưu…")
            : draft.dirty
              ? tx("Có thay đổi chưa lưu")
              : tx("Đã lưu bản nháp")}
        </Text>
      </Group>
      {attempt.task.minimumWords > 0 && count < attempt.task.minimumWords && (
        <Alert color="yellow">
          {isVi
            ? `Đề khuyến nghị ${attempt.task.minimumWords} từ. Bạn có thể nộp từ 20 từ; phần đáp ứng đề sẽ được đánh giá theo nội dung thực tế.`
            : `The recommended length is ${attempt.task.minimumWords} words. You may submit from 20 words; task response will be assessed from your actual writing.`}
        </Alert>
      )}
      {(draft.error || error) && (
        <Alert color="red">{draft.error ?? error}</Alert>
      )}
      <Group>
        <Button
          variant="light"
          onClick={() => void draft.save()}
          loading={draft.saving}
          disabled={submitting || draft.restore !== null}
        >
          {tx("Lưu bản nháp")}
        </Button>
        <Button
          onClick={() => setConfirm(true)}
          disabled={count < 20 || draft.restore !== null}
          loading={submitting}
        >
          {tx("Nộp bài để chấm")}
        </Button>
      </Group>
      <Modal
        opened={confirm}
        onClose={() => {
          if (!submitting) setConfirm(false);
        }}
        title={tx("Nộp bài viết")}
        closeOnClickOutside={!submitting}
        closeOnEscape={!submitting}
        withCloseButton={!submitting}
      >
        <Stack>
          <Text>
            {tx(
              "Sau khi nộp, bài viết này sẽ được khóa chỉnh sửa. Bạn có thể tạo lần luyện mới sau đó.",
            )}
          </Text>
          {error && <Alert color="red">{error}</Alert>}
          <Group justify="flex-end">
            <Button
              variant="default"
              disabled={submitting}
              onClick={() => setConfirm(false)}
            >
              {tx("Tiếp tục viết")}
            </Button>
            <Button loading={submitting} onClick={() => void send()}>
              {tx("Xác nhận nộp")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
