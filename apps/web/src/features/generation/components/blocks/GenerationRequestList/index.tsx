"use client";

import {
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  List,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import Link from "next/link";
import type { GenerationRequestFieldsFragment } from "@/lib/graphql/generated/documents";
import { GenerationStatus } from "@/lib/graphql/generated/schemaTypes";
import { useLanguage } from "@/shared/hooks/useLanguage";
import {
  FAILURE_COPY,
  STATUS_COPY,
  STEP_COPY,
} from "../../../constants/generation";

const TASK_LABELS = [
  "Writing Task 1",
  "Writing Task 2",
  "Speaking Part 1",
  "Speaking Part 2",
  "Speaking Part 3",
];

type GenerationRequestListProps = {
  requests: GenerationRequestFieldsFragment[];
  /** Picks a failed request up again at the step it stopped at. */
  onResume?: (id: string) => void;
  /** The request being resumed now, to show its button busy. */
  resumingId?: string | null;
  /** Another request is running, so none can be resumed until it ends. */
  inProgress?: boolean;
};

/**
 * Every request, newest first: where it is, what went wrong, and the drafts it
 * made. A failed one can be picked up again at the step it stopped at, keeping
 * what the AI already wrote.
 */
export function GenerationRequestList({
  requests,
  onResume,
  resumingId = null,
  inProgress = false,
}: GenerationRequestListProps) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const when = (at: string) =>
    new Date(at).toLocaleString(isVi ? "vi-VN" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  if (requests.length === 0)
    return (
      <Card withBorder radius="lg" p="xl">
        <Text c="dimmed" ta="center">
          {tr("Chưa có lượt tạo đề nào.", "No generation requests yet.")}
        </Text>
      </Card>
    );

  return (
    <Stack gap="md">
      {requests.map((request) => {
        const status = STATUS_COPY[request.status];
        const step = request.step ? STEP_COPY[request.step] : null;
        const running =
          request.status === GenerationStatus.QUEUED ||
          request.status === GenerationStatus.RUNNING;
        const done = request.status === GenerationStatus.COMPLETED;
        const failed = request.status === GenerationStatus.FAILED;
        const failure = request.failureCode
          ? FAILURE_COPY[request.failureCode]
          : undefined;
        return (
          <Card key={request.id} withBorder radius="lg" p="lg">
            <Stack gap="sm">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2}>
                  <Text fw={700}>
                    {request.title ??
                      tr(
                        "Bộ đề IELTS (đang lên chủ đề)",
                        "IELTS set (planning)",
                      )}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {request.requestedByName ?? ""} · {when(request.createdAt)}
                  </Text>
                </Stack>
                <Badge color={status.color} variant="light">
                  {isVi ? status.vi : status.en}
                </Badge>
              </Group>
              {request.brief && (
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  <Text span fw={600}>
                    {tr("Yêu cầu riêng: ", "Brief: ")}
                  </Text>
                  {request.brief}
                </Text>
              )}
              {running && (
                <Stack gap={4}>
                  <Progress
                    value={(request.stepIndex / request.stepsTotal) * 100}
                    animated
                    aria-label={tr("Tiến độ", "Progress")}
                  />
                  <Text size="sm" c="dimmed">
                    {step ? (isVi ? step.vi : step.en) : request.step} ·{" "}
                    {tr("bước", "step")} {request.stepIndex + 1}/
                    {request.stepsTotal}
                    {request.attempt > 0 &&
                      tr(
                        ` · đang thử lại lần ${request.attempt + 1}`,
                        ` · retry ${request.attempt + 1}`,
                      )}
                  </Text>
                </Stack>
              )}
              {request.lastProblems.length > 0 && (
                <Alert color={failed ? "red" : "yellow"} variant="light">
                  <Text size="sm" fw={600} mb={4}>
                    {failed
                      ? tr("Lỗi lần thử cuối:", "Last attempt's problems:")
                      : tr("AI đang sửa các lỗi:", "The model is fixing:")}
                  </Text>
                  <List size="sm">
                    {request.lastProblems.slice(0, 6).map((problem) => (
                      <List.Item key={problem}>{problem}</List.Item>
                    ))}
                  </List>
                </Alert>
              )}
              {failed && (
                <Alert color="red" variant="light">
                  {tr("Dừng ở bước: ", "Stopped at: ")}
                  {step ? (isVi ? step.vi : step.en) : request.step}.{" "}
                  {failure
                    ? isVi
                      ? failure.vi
                      : failure.en
                    : `${request.failureCode ?? ""} ${request.failureMessage ?? ""}`}
                  {onResume && request.resumable && (
                    <Stack gap={6} mt="sm" align="flex-start">
                      <Text size="sm">
                        {tr(
                          "Các phần AI đã viết được giữ lại; chạy tiếp chỉ làm lại từ bước này.",
                          "What the AI already wrote is kept; resuming redoes only this step onwards.",
                        )}
                        {request.resumeCount > 0 &&
                          tr(
                            ` Đã chạy tiếp ${request.resumeCount}/3 lần.`,
                            ` Resumed ${request.resumeCount} of 3 times.`,
                          )}
                      </Text>
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        loading={resumingId === request.id}
                        disabled={
                          inProgress ||
                          (resumingId !== null && resumingId !== request.id)
                        }
                        onClick={() => onResume(request.id)}
                      >
                        {tr("Chạy tiếp từ bước lỗi", "Resume from this step")}
                      </Button>
                      {inProgress && (
                        <Text size="xs" c="dimmed">
                          {tr(
                            "Đang có một lượt khác chạy; chờ lượt đó xong rồi chạy tiếp.",
                            "Another request is running; resume once it ends.",
                          )}
                        </Text>
                      )}
                    </Stack>
                  )}
                </Alert>
              )}
              {done && (
                <Group gap="md">
                  {request.examId && (
                    <Anchor
                      component={Link}
                      href={`/admin/content/editor/EXAM/${request.examId}`}
                      size="sm"
                    >
                      {tr(
                        "Đề Listening + Reading",
                        "Listening + Reading paper",
                      )}
                    </Anchor>
                  )}
                  {request.taskIds.map((taskId, i) => (
                    <Anchor
                      key={taskId}
                      component={Link}
                      href={`/admin/assessments/tasks/${taskId}/edit`}
                      size="sm"
                    >
                      {TASK_LABELS[i] ?? `Task ${i + 1}`}
                    </Anchor>
                  ))}
                  {request.fullTestId && (
                    <Anchor component={Link} href="/admin/full-tests" size="sm">
                      {tr("Full test nháp", "Draft full test")}
                    </Anchor>
                  )}
                </Group>
              )}
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}
