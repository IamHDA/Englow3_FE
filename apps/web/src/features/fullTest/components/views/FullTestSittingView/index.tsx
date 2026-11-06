"use client";

import { Alert, Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import {
  FullTestPartGrading,
  FullTestSittingStatus,
} from "@/lib/graphql/generated/schemaTypes";
import { useFullTestSittingQuery } from "@/lib/graphql/generated/hooks";
import { Page, PageHeader } from "@/shared/components/Page";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { useLanguage } from "@/shared/hooks/useLanguage";
import {
  attemptPath,
  GRADING_COPY,
  SITTING_POLL_MS,
  SLOT_COPY,
  STATUS_COPY,
} from "../../../constants/fullTest";
import { FullTestBands } from "../../blocks/FullTestBands";
import { FullTestSittingSkeleton } from "../../blocks/FullTestSittingSkeleton";

/**
 * A learner's full test: where each of the six parts stands, a way to each, and
 * the bands so far. The parts are sat on their own pages; the backend picks
 * them up and settles the sitting on every read, so this page only asks again.
 */
export function FullTestSittingView({ sittingId }: { sittingId: string }) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const { data, loading, error, refetch, startPolling, stopPolling } =
    useFullTestSittingQuery({
      variables: { id: sittingId },
      fetchPolicy: "network-only",
    });
  const sitting = data?.fullTestSitting;
  const unsettled =
    sitting?.status === FullTestSittingStatus.IN_PROGRESS ||
    sitting?.status === FullTestSittingStatus.AWAITING_GRADES;

  // Grades land while the page is open; look again until the sitting settles.
  useEffect(() => {
    if (!unsettled) return;
    startPolling(SITTING_POLL_MS);
    return () => stopPolling();
  }, [unsettled, startPolling, stopPolling]);

  if (loading && !sitting) return <FullTestSittingSkeleton />;
  if (!sitting)
    return (
      <LoadErrorState
        error={error}
        thing={{ vi: "lượt full test này", en: "this full test sitting" }}
        back={{ href: "/exams/full-tests", label: "IELTS Full Test" }}
        onRetry={() => void refetch()}
      />
    );

  const status = STATUS_COPY[sitting.status];
  const open = sitting.status === FullTestSittingStatus.IN_PROGRESS;
  const when = (at: string) =>
    new Date(at).toLocaleString(isVi ? "vi-VN" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  const parts = [
    {
      key: "paper",
      title: "Listening + Reading",
      done: Boolean(sitting.examAttemptId),
      href: `/exams/${sitting.examId}`,
      grading: sitting.examAttemptId ? FullTestPartGrading.GRADED : null,
      attemptId: null,
    },
    ...sitting.parts.map((part) => ({
      key: part.slot,
      title: isVi ? SLOT_COPY[part.slot].vi : SLOT_COPY[part.slot].en,
      done: Boolean(part.attemptId),
      href: `${SLOT_COPY[part.slot].path}/${part.taskId}`,
      grading: part.grading ?? null,
      attemptId: part.attemptId ?? null,
    })),
  ];
  const failed = parts.some(
    (part) => part.grading === FullTestPartGrading.FAILED,
  );
  // Everything handed in: an expiry then means grading ran out, not the parts.
  const allHandedIn = parts.every((part) => part.done);

  return (
    <Page width="focus">
      <Stack gap="lg">
        <PageHeader
          title={sitting.title}
          above={
            <Text
              component={Link}
              href="/exams/full-tests"
              size="sm"
              c="dimmed"
            >
              ← IELTS Full Test
            </Text>
          }
        />
        <Group gap="sm">
          <Badge color={status.color} variant="light" size="lg">
            {isVi ? status.vi : status.en}
          </Badge>
          {open && (
            <Text size="sm" c="dimmed">
              {tr("Nộp đủ trước", "Hand everything in by")}{" "}
              {when(sitting.deadlineAt)}
            </Text>
          )}
          {sitting.status === FullTestSittingStatus.AWAITING_GRADES && (
            <Text size="sm" c="dimmed">
              {tr("Hạn chấm xong", "Grading closes")}{" "}
              {when(sitting.gradesDueAt)}
            </Text>
          )}
        </Group>

        {sitting.status === FullTestSittingStatus.EXPIRED && (
          <Alert color="gray" variant="light">
            {allHandedIn
              ? tr(
                  "Đã hết hạn chấm mà vẫn còn phần chưa có điểm. Band tạm vẫn được giữ; muốn có band tổng, hãy làm một lượt mới.",
                  "Grading closed with a part still ungraded. The provisional band stays; start a new sitting for an overall band.",
                )
              : tr(
                  "Đã quá 7 ngày mà chưa nộp đủ các phần. Band tạm vẫn được giữ; muốn có band tổng, hãy làm một lượt mới.",
                  "Seven days passed with parts missing. The provisional band stays; start a new sitting for an overall band.",
                )}
          </Alert>
        )}
        {failed && !sitting.overallBand && unsettled && (
          <Alert color="red" variant="light">
            {tr(
              `Có phần chấm tự động bị lỗi. Mở phần đó để chấm lại hoặc gửi giáo viên chấm trước ${when(sitting.gradesDueAt)}, nếu không lượt thi sẽ hết hạn mà không có band tổng.`,
              `A part could not be graded automatically. Open it to resend it or ask a teacher before ${when(sitting.gradesDueAt)}, or the sitting closes without an overall band.`,
            )}
          </Alert>
        )}

        <FullTestBands sitting={sitting} />

        <Stack gap="sm">
          {parts.map((part) => (
            <Card key={part.key} withBorder radius="md" p="md">
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  {part.done && (
                    <Check
                      size={18}
                      color="var(--mantine-color-teal-7)"
                      aria-hidden="true"
                    />
                  )}
                  <Stack gap={0}>
                    <Text fw={600}>{part.title}</Text>
                    <Text
                      size="xs"
                      c={
                        part.grading
                          ? GRADING_COPY[part.grading].color
                          : "dimmed"
                      }
                    >
                      {part.grading
                        ? isVi
                          ? GRADING_COPY[part.grading].vi
                          : GRADING_COPY[part.grading].en
                        : part.done
                          ? tr("Đã nộp", "Handed in")
                          : tr("Chưa làm", "Not done yet")}
                    </Text>
                  </Stack>
                </Group>
                {open && !part.done && (
                  <Button component={Link} href={part.href} variant="light">
                    {tr("Làm phần này", "Take this part")}
                  </Button>
                )}
                {unsettled &&
                  part.attemptId &&
                  part.grading === FullTestPartGrading.FAILED && (
                    <Button
                      component={Link}
                      href={attemptPath(part.attemptId)}
                      variant="light"
                      color="red"
                    >
                      {tr("Chấm lại", "Resend")}
                    </Button>
                  )}
              </Group>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Page>
  );
}
