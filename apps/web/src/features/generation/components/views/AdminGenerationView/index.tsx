"use client";

import { Alert, Card, Pagination, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import {
  GenerationKind,
  GenerationStatus,
} from "@/lib/graphql/generated/schemaTypes";
import {
  useAdminGenerationQuery,
  useRequestGenerationMutation,
} from "@/lib/graphql/generated/hooks";
import { Page, PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";
import {
  GENERATION_POLL_MS,
  REFUSAL_COPY,
} from "../../../constants/generation";
import {
  GenerationRequestForm,
  type GenerationRequestValues,
} from "../../blocks/GenerationRequestForm";
import { GenerationRequestList } from "../../blocks/GenerationRequestList";
import { GenerationRequestListSkeleton } from "../../blocks/GenerationRequestList/GenerationRequestListSkeleton";

/**
 * Generating IELTS sets with AI: start one (optionally with a brief) and follow
 * every request until its drafts wait for review. The page asks again every
 * few seconds while anything is running.
 */
export function AdminGenerationView() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const [page, setPage] = useState(0);
  const { data, loading, error, refetch, startPolling, stopPolling } =
    useAdminGenerationQuery({
      variables: { page },
      fetchPolicy: "cache-and-network",
    });
  const [requestGeneration, requestState] = useRequestGenerationMutation();
  const requests = data?.generationRequests.items ?? [];
  const running = requests.some(
    (r) =>
      r.status === GenerationStatus.QUEUED ||
      r.status === GenerationStatus.RUNNING,
  );

  // Steps finish on the server while the page is open; look again until none is running.
  useEffect(() => {
    if (!running) return;
    startPolling(GENERATION_POLL_MS);
    return () => stopPolling();
  }, [running, startPolling, stopPolling]);

  async function handleSubmit(values: GenerationRequestValues) {
    try {
      await requestGeneration({
        variables: {
          kind: GenerationKind.IELTS_FULL_TEST,
          brief: values.brief || null,
        },
      });
      notifications.show({
        color: "teal",
        message: tr(
          "Đã bắt đầu tạo bộ đề. Trang sẽ tự cập nhật tiến độ.",
          "Generation started. This page follows its progress.",
        ),
      });
      setPage(0);
      await refetch({ page: 0 }).catch(() => undefined);
      return true;
    } catch (failure) {
      const copy = REFUSAL_COPY[backendCodeOf(failure) ?? ""];
      notifications.show({
        color: "red",
        message: copy
          ? isVi
            ? copy.vi
            : copy.en
          : tr(
              "Chưa bắt đầu được. Kiểm tra kết nối rồi thử lại.",
              "Could not start. Check the connection and try again.",
            ),
      });
      return false;
    }
  }

  if (loading && !data)
    return (
      <Page>
        <GenerationRequestListSkeleton />
      </Page>
    );

  return (
    <Page>
      <Stack gap="lg">
        <PageHeader title={tr("Tạo đề bằng AI", "Generate with AI")} />
        <Text size="sm" c="dimmed">
          {tr(
            "AI viết một bộ full test IELTS Academic: đề Listening + Reading có audio, 5 đề Writing/Speaking và full test nháp. Mọi thứ được gửi duyệt, không có gì tự phát hành. Mỗi lượt mất vài phút.",
            "The model writes an IELTS Academic full test: a Listening + Reading paper with audio, five Writing and Speaking tasks and a draft full test. Everything goes for review; nothing is published by itself. Each request takes a few minutes.",
          )}
        </Text>
        {error && !data ? (
          <Alert color="red">
            {tr(
              "Không tải được trang tạo đề.",
              "The generation page could not be loaded.",
            )}
          </Alert>
        ) : (
          <>
            <Card withBorder radius="lg" p="lg">
              <GenerationRequestForm
                remaining={data?.generationAllowance.remaining ?? 0}
                limit={data?.generationAllowance.limit ?? 0}
                inProgress={data?.generationAllowance.inProgress ?? false}
                submitting={requestState.loading}
                onSubmit={handleSubmit}
              />
            </Card>
            <GenerationRequestList requests={requests} />
            {(data?.generationRequests.totalPages ?? 0) > 1 && (
              <Pagination
                value={page + 1}
                onChange={(value) => setPage(value - 1)}
                total={data?.generationRequests.totalPages ?? 1}
              />
            )}
          </>
        )}
      </Stack>
    </Page>
  );
}
