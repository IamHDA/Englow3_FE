"use client";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Group, Stack, Text } from "@mantine/core";
import {
  useTutorMemoryQuery,
  useClearTutorMemoryMutation,
} from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function TutorMemoryControls({
  conversationId,
  busy,
  updated,
  archived,
  canSummarize = true,
  onSummarize,
}: {
  conversationId: string;
  busy: boolean;
  updated: number;
  archived: boolean;
  canSummarize?: boolean;
  onSummarize: () => Promise<boolean>;
}) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const query = useTutorMemoryQuery({
    variables: { conversationId },
    fetchPolicy: "network-only",
  });
  const [clear, mutation] = useClearTutorMemoryMutation();
  const [error, setError] = useState(false);
  const guard = useRef(false);
  const prior = useRef(updated);
  const { refetch } = query;
  useEffect(() => {
    if (prior.current !== updated) {
      prior.current = updated;
      void refetch().catch(() => undefined);
    }
  }, [updated, refetch]);
  const memory = query.data?.tutorMemory;
  if (!memory && !query.error) return null;
  if (
    memory &&
    !memory.enabled &&
    !memory.content &&
    !memory.pendingMessageId &&
    !query.error
  )
    return null;
  async function clearNotes() {
    if (guard.current) return;
    guard.current = true;
    setError(false);
    try {
      await clear({ variables: { conversationId } });
      await query.refetch();
    } catch {
      setError(true);
    } finally {
      guard.current = false;
    }
  }
  return (
    <Card withBorder radius="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={700}>
            {tr("Ghi nhớ cuộc trò chuyện", "Conversation memory")}
          </Text>
          <Button
            variant="subtle"
            mih={44}
            loading={query.loading}
            onClick={() => void query.refetch().catch(() => undefined)}
          >
            {tr("Cập nhật trạng thái", "Refresh status")}
          </Button>
        </Group>
        {(query.error || error) && (
          <Alert color="orange">
            {tr(
              "Chưa hoàn tất thao tác ghi nhớ. Nội dung chat được giữ; hãy thử lại.",
              "Could not complete the memory action. Your conversation is kept; please retry.",
            )}
          </Alert>
        )}
        <Text size="sm" c="dimmed">
          {tr(
            "Mỗi lần tổng kết dùng 1 lượt AI cho tối đa 20 tin nhắn có đoạn trích giới hạn. Ghi nhớ có thể sai, chỉ dùng làm ngữ cảnh trong cuộc trò chuyện này.",
            "Each summary uses 1 AI request for bounded extracts of up to 20 messages. These notes can be wrong and are only context for this conversation.",
          )}
        </Text>
        {memory?.content && (
          <details>
            <summary>
              {tr("Xem ghi nhớ AI đang dùng", "View current AI notes")}
            </summary>
            <Text
              size="sm"
              mt="sm"
              style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
            >
              {memory.content}
            </Text>
          </details>
        )}
        {memory && (
          <>
            <Text size="sm">
              {memory.pendingMessageId
                ? tr(
                    "Đang tổng kết trong hàng đợi; bạn có thể xem tiến trình ở phần chat.",
                    "A summary is queued; follow its progress in the conversation.",
                  )
                : memory.remainingMessages > 0
                  ? tr(
                      `Còn ${memory.remainingMessages} tin nhắn chưa gộp vào ghi nhớ.`,
                      `${memory.remainingMessages} messages are not yet included in these notes.`,
                    )
                  : tr(
                      "Ghi nhớ đã cập nhật với các tin hoàn tất hiện có.",
                      "The notes include the currently completed messages.",
                    )}
            </Text>
            <Group>
              {!archived && memory.enabled && (
                <Button
                  mih={44}
                  variant="light"
                  disabled={
                    !canSummarize ||
                    busy ||
                    !!memory.pendingMessageId ||
                    memory.remainingMessages === 0 ||
                    mutation.loading
                  }
                  onClick={() => void onSummarize().catch(() => setError(true))}
                >
                  {tr(
                    `Tổng kết ${Math.min(memory.batchSize, memory.remainingMessages)} tin · 1 lượt AI`,
                    `Summarize ${Math.min(memory.batchSize, memory.remainingMessages)} messages · 1 AI request`,
                  )}
                </Button>
              )}
              {memory.content && (
                <Button
                  mih={44}
                  variant="subtle"
                  color="red"
                  loading={mutation.loading}
                  disabled={busy}
                  onClick={() => void clearNotes()}
                >
                  {tr("Ngừng dùng ghi nhớ này", "Stop using these notes")}
                </Button>
              )}
            </Group>
            {!memory.enabled && memory.content && (
              <Text size="xs" c="dimmed">
                {tr(
                  "Tính năng ghi nhớ đang tạm dừng. Bản tóm tắt vẫn có trong lịch sử và dữ liệu xuất.",
                  "Memory is currently paused. The summary remains in history and exports.",
                )}
              </Text>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
}
