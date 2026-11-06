"use client";

import { Alert, Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { FullTestSittingStatus } from "@/lib/graphql/generated/schemaTypes";
import { useFullTestSittingQuery } from "@/lib/graphql/generated/hooks";
import { Page, PageHeader } from "@/shared/components/Page";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { useLanguage } from "@/shared/hooks/useLanguage";
import {
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
  const deadline = new Date(sitting.deadlineAt).toLocaleString(
    isVi ? "vi-VN" : "en-GB",
    { dateStyle: "medium", timeStyle: "short" },
  );
  const parts = [
    {
      key: "paper",
      title: "Listening + Reading",
      done: Boolean(sitting.examAttemptId),
      href: `/exams/${sitting.examId}`,
    },
    ...sitting.parts.map((part) => ({
      key: part.slot,
      title: isVi ? SLOT_COPY[part.slot].vi : SLOT_COPY[part.slot].en,
      done: Boolean(part.attemptId),
      href: `${SLOT_COPY[part.slot].path}/${part.taskId}`,
    })),
  ];

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
              {tr("Nộp đủ trước", "Hand everything in by")} {deadline}
            </Text>
          )}
        </Group>

        {sitting.status === FullTestSittingStatus.EXPIRED && (
          <Alert color="gray" variant="light">
            {tr(
              "Đã quá 7 ngày mà chưa nộp đủ các phần. Band tạm vẫn được giữ; muốn có band tổng, hãy làm một lượt mới.",
              "Seven days passed with parts missing. The provisional band stays; start a new sitting for an overall band.",
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
                    <Text size="xs" c="dimmed">
                      {part.done
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
              </Group>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Page>
  );
}
