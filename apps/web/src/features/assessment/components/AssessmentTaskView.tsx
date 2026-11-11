"use client";
import { useAssessmentText } from "../hooks/useAssessmentText";
import {
  Alert,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Anchor,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth";
import {
  useAssessmentTaskDetailQuery,
  useAssessmentStartMutation,
  useAssessmentSubmitMutation,
  useStartFullTestAssessmentMutation,
} from "@/lib/graphql/generated/hooks";
import { FullTestSlot } from "@/lib/graphql/generated/schemaTypes";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { useAssessmentRecorder } from "../hooks/useAssessmentRecorder";
import { taskTypeLabel, type PracticeTask } from "../types";
import { MicrophoneCheck } from "./MicrophoneCheck";
import { TaskInstructions } from "./TaskInstructions";
import {
  fullTestSittingPath,
  withFullTestSitting,
} from "@/shared/constants/fullTestNavigation";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";
export function AssessmentTaskView({
  id,
  fullTestSittingId,
}: {
  id: string;
  fullTestSittingId?: string | null;
}) {
  const tx = useAssessmentText();
  const { session } = useAuth();
  const query = useAssessmentTaskDetailQuery({ variables: { id } });
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
          onRetry={() => void query.refetch().catch(() => {})}
        />
      </Container>
    );
  return (
    <TaskWorkbench
      key={`${id}:${session?.userId}`}
      task={query.data.assessmentTask}
      fullTestSittingId={fullTestSittingId}
      automatic={
        query.data.assessmentTask.skill === "WRITING"
          ? query.data.assessmentCapabilities.automaticWriting
          : query.data.assessmentCapabilities.automaticSpeaking
      }
    />
  );
}
function TaskWorkbench({
  task,
  automatic,
  fullTestSittingId,
}: {
  task: PracticeTask;
  automatic: boolean;
  fullTestSittingId?: string | null;
}) {
  const tx = useAssessmentText();
  const { isVi } = useLanguage();
  const router = useRouter();
  const { session } = useAuth();
  const [start] = useAssessmentStartMutation();
  const [submit] = useAssessmentSubmitMutation();
  const [startFullTestPart] = useStartFullTestAssessmentMutation();
  const fullSlot =
    task.skill === "WRITING"
      ? task.taskType === "TASK_1"
        ? FullTestSlot.WRITING_TASK_1
        : FullTestSlot.WRITING_TASK_2
      : task.taskType === "PART_1"
        ? FullTestSlot.SPEAKING_PART_1
        : task.taskType === "PART_2"
          ? FullTestSlot.SPEAKING_PART_2
          : FullTestSlot.SPEAKING_PART_3;
  const recordingLimit =
    fullTestSittingId && task.taskType === "PART_2" ? 120 : 300;
  const [prepareUntil, setPrepareUntil] = useState<number | null>(null);
  const [prepareLeft, setPrepareLeft] = useState(0);
  useEffect(() => {
    if (prepareUntil === null) return;
    const timer = setInterval(() => {
      setPrepareLeft(
        Math.max(0, Math.ceil((prepareUntil - Date.now()) / 1000)),
      );
      if (Date.now() >= prepareUntil) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [prepareUntil]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);
  const request = useRef<{ blob: Blob | null; key: string } | null>(null);
  const audio = useAssessmentRecorder(
    task.skill === "SPEAKING" && session
      ? `${session.userId}:${task.id}:${fullTestSittingId ?? "practice"}`
      : undefined,
    recordingLimit,
  );
  const [phase, setPhase] = useState("");
  const submitted = useRef(false);
  useEffect(() => {
    if (!audio.blob && !audio.recording) return;
    const unload = (event: BeforeUnloadEvent) => {
      if (!submitted.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const navigate = (event: MouseEvent) => {
      const link =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (
        link &&
        !submitted.current &&
        !event.ctrlKey &&
        !event.metaKey &&
        !window.confirm(
          audio.recording
            ? tx(
                "Đang ghi âm. Rời trang sẽ dừng và mất lần ghi đang chạy. Tiếp tục?",
              )
            : tx(
                "Bản ghi chưa nộp. Rời trang và giữ nháp trên thiết bị nếu bộ nhớ khả dụng?",
              ),
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", navigate, true);
    };
  }, [audio.blob, audio.recording, tx]);
  async function begin() {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    setPhase(tx("Đang mở lượt làm…"));
    try {
      if (task.skill === "SPEAKING" && !audio.blob)
        throw new Error("recording missing");
      if (!request.current || request.current.blob !== audio.blob)
        request.current = {
          blob: audio.blob,
          key: audio.clientKey.current ?? crypto.randomUUID(),
        };
      const ticket = fullTestSittingId
        ? await startFullTestPart({
            variables: {
              sittingId: fullTestSittingId,
              slot: fullSlot,
              taskId: task.id,
              ...(task.skill === "SPEAKING"
                ? { contentType: "audio/wav", contentLength: audio.blob!.size }
                : {}),
            },
          }).then((r) =>
            r.data?.startFullTestAssessment
              ? {
                  attempt: { id: r.data.startFullTestAssessment.attemptId },
                  uploadUrl: r.data.startFullTestAssessment.uploadUrl,
                }
              : null,
          )
        : await start({
            variables: {
              taskId: task.id,
              clientKey: request.current.key,
              ...(task.skill === "SPEAKING"
                ? { contentType: "audio/wav", contentLength: audio.blob!.size }
                : {}),
            },
          }).then((r) => r.data?.startAssessment);
      if (!ticket) throw new Error("Missing result");
      if (task.skill === "SPEAKING" && ticket.uploadUrl) {
        setPhase(tx("Đang tải bản ghi lên…"));
        if (!ticket.uploadUrl) throw new Error("Missing upload URL");
        const response = await fetch(ticket.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "audio/wav" },
          body: audio.blob,
          signal: AbortSignal.timeout(60000),
        });
        if (!response.ok) throw new Error("Upload failed");
        setPhase(tx("Đang xác nhận nộp bài…"));
        const result = await submit({ variables: { id: ticket.attempt.id } });
        if (!result.data) throw new Error("Submission failed");
      }
      submitted.current = true;
      await audio.clear();
      router.push(
        withFullTestSitting(
          `/study/assessments/attempts/${ticket.attempt.id}`,
          fullTestSittingId,
        ),
      );
    } catch (failure) {
      const code = backendCodeOf(failure);
      if (code === "FULL_TEST_CLOSED" || code === "FULL_TEST_TASK_MISMATCH") {
        setError(
          isVi
            ? "Lượt thi đã đóng hoặc đề này không thuộc lượt thi. Hãy mở lại phần làm bài từ bộ IELTS của bạn."
            : "This sitting is closed or this task is not assigned to it. Reopen the part from your IELTS full test.",
        );
        return;
      }
      if (code === "RECORDING_CHANGED" || code === "RECORDING_INVALID") {
        setError(
          isVi
            ? "Hãy dùng lại bản ghi gốc và kiểm tra giới hạn thời gian của phần thi."
            : "Use the original recording and check this part's recording time limit.",
        );
        return;
      }
      setError(
        task.skill === "SPEAKING"
          ? tx(
              "Chưa gửi được bản ghi. Bản ghi vẫn được giữ; hãy kiểm tra kết nối rồi thử lại.",
            )
          : tx("Chưa mở được bản nháp. Hãy thử lại."),
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Button
          component={Link}
          href={
            fullTestSittingId
              ? fullTestSittingPath(fullTestSittingId)
              : `/study/${task.skill === "WRITING" ? "writing" : "speaking"}`
          }
          variant="subtle"
          w="fit-content"
        >
          {fullTestSittingId
            ? isVi
              ? "← Quay lại full test"
              : "← Back to full test"
            : tx("← Danh sách đề")}
        </Button>
        <Title order={1}>{task.title}</Title>
        <Group>
          <Text size="sm">{taskTypeLabel(task.taskType)}</Text>
          <Text size="sm" c="dimmed">
            {Math.round(task.timeLimitSeconds / 60)} {tx("phút gợi ý")}
          </Text>
          {task.minimumWords > 0 && (
            <Text size="sm" c="dimmed">
              {tx("Khuyến nghị")} {task.minimumWords} {tx("từ")}
            </Text>
          )}
        </Group>
        <Card withBorder radius="lg" p="xl">
          <TaskInstructions text={task.instructions} imageUrl={task.imageUrl} />
        </Card>
        <Alert color="blue">
          {automatic
            ? tx(
                "Bài nộp sẽ được AI đánh giá theo 4 tiêu chí, với điểm luyện tập ước lượng.",
              )
            : tx("Bài nộp sẽ được chuyển cho giáo viên chấm theo 4 tiêu chí.")}
        </Alert>
        {task.skill === "SPEAKING" && (
          <Card withBorder>
            <Stack>
              {audio.restored && (
                <Alert color="blue">
                  {tx(
                    "Đã khôi phục bản ghi chưa nộp. Bạn có thể nghe lại hoặc ghi lại.",
                  )}
                </Alert>
              )}
              {audio.storageError && (
                <Alert color="orange">
                  {tx(
                    "Không lưu được audio trên thiết bị. Tải bản ghi xuống hoặc giữ trang mở đến khi nộp thành công.",
                  )}
                </Alert>
              )}
              <Text fw={600}>{tx("Trả lời đề bằng giọng nói của bạn")}</Text>
              <MicrophoneCheck
                disabled={busy || audio.recording || audio.preparing}
              />
              <Text size="sm" c="dimmed">
                {fullTestSittingId
                  ? isVi
                    ? `Phần này nộp một bản ghi, tối đa ${recordingLimit / 60} phút. Giữ bản ghi để thử tải lên lại nếu mất mạng.`
                    : `Submit one recording for this part, up to ${recordingLimit / 60} minutes. Keep it to retry an interrupted upload.`
                  : tx(
                      "Có thể nghe lại và ghi lại trước khi nộp. Tối đa 5 phút mỗi bản ghi.",
                    )}
              </Text>
              {prepareUntil !== null && prepareLeft > 0 && (
                <Text role="timer">
                  {isVi ? "Chuẩn bị" : "Preparation"}: {prepareLeft}s
                </Text>
              )}
              <Group>
                <Button
                  onClick={() => {
                    if (
                      fullTestSittingId &&
                      task.taskType === "PART_2" &&
                      prepareUntil === null
                    ) {
                      setPrepareLeft(60);
                      setPrepareUntil(Date.now() + 60000);
                      return;
                    }
                    void audio.start();
                  }}
                  disabled={
                    busy ||
                    audio.recording ||
                    audio.preparing ||
                    prepareLeft > 0 ||
                    (!!fullTestSittingId && !!audio.blob)
                  }
                >
                  {fullTestSittingId &&
                  task.taskType === "PART_2" &&
                  prepareUntil === null
                    ? isVi
                      ? "Chuẩn bị 1 phút"
                      : "Prepare for 1 minute"
                    : audio.blob
                      ? tx("Ghi lại")
                      : tx("Bắt đầu ghi âm")}
                </Button>
                <Button
                  color="red"
                  onClick={audio.stop}
                  disabled={!audio.recording}
                >
                  {tx("Dừng ghi")}
                </Button>
                <Text>
                  {Math.floor(audio.seconds / 60)}:
                  {String(audio.seconds % 60).padStart(2, "0")}
                </Text>
                {audio.preparing && <Loader size="sm" />}
              </Group>
              {audio.url && (
                <Stack gap="xs">
                  <audio controls src={audio.url} style={{ width: "100%" }} />
                  <Anchor href={audio.url} download="englow3-speaking.wav">
                    {tx("Tải bản ghi xuống")}
                  </Anchor>
                </Stack>
              )}
              {audio.error && <Alert color="red">{audio.error}</Alert>}
            </Stack>
          </Card>
        )}
        {error && <Alert color="red">{error}</Alert>}
        {busy && (
          <Text role="status" aria-live="polite">
            {phase}
          </Text>
        )}
        <Button
          size="md"
          loading={busy}
          disabled={
            task.skill === "SPEAKING" &&
            (!audio.blob || audio.recording || audio.preparing)
          }
          onClick={() => void begin()}
        >
          {task.skill === "WRITING"
            ? tx("Bắt đầu viết bài")
            : tx("Nộp bản ghi")}
        </Button>
      </Stack>
    </Container>
  );
}
