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
} from "@/lib/graphql/generated/hooks";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { useAssessmentRecorder } from "../hooks/useAssessmentRecorder";
import type { PracticeTask } from "../types";
import { MicrophoneCheck } from "./MicrophoneCheck";
import { TaskInstructions } from "./TaskInstructions";
export function AssessmentTaskView({ id }: { id: string }) {
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
}: {
  task: PracticeTask;
  automatic: boolean;
}) {
  const tx = useAssessmentText();
  const router = useRouter();
  const { session } = useAuth();
  const [start] = useAssessmentStartMutation();
  const [submit] = useAssessmentSubmitMutation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);
  const request = useRef<{ blob: Blob | null; key: string } | null>(null);
  const audio = useAssessmentRecorder(
    task.skill === "SPEAKING" && session
      ? `${session.userId}:${task.id}`
      : undefined,
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
      const started = await start({
        variables: {
          taskId: task.id,
          clientKey: request.current.key,
          ...(task.skill === "SPEAKING"
            ? { contentType: "audio/wav", contentLength: audio.blob!.size }
            : {}),
        },
      });
      if (!started.data) throw new Error("Missing result");
      const ticket = started.data.startAssessment;
      if (task.skill === "SPEAKING" && ticket.attempt.status === "DRAFT") {
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
      router.push(`/study/assessments/attempts/${ticket.attempt.id}`);
    } catch {
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
          href={`/study/${task.skill === "WRITING" ? "writing" : "speaking"}`}
          variant="subtle"
          w="fit-content"
        >
          {tx("← Danh sách đề")}
        </Button>
        <Title order={1}>{task.title}</Title>
        <Group>
          <Text size="sm">{task.taskType.replaceAll("_", " ")}</Text>
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
          <TaskInstructions text={task.instructions} />
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
                {tx(
                  "Có thể nghe lại và ghi lại trước khi nộp. Tối đa 5 phút mỗi bản ghi.",
                )}
              </Text>
              <Group>
                <Button
                  onClick={() => void audio.start()}
                  disabled={busy || audio.recording || audio.preparing}
                >
                  {audio.blob ? tx("Ghi lại") : tx("Bắt đầu ghi âm")}
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
