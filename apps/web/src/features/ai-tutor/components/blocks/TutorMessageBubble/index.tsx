"use client";
import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconCopy,
  IconFlag,
  IconRefresh,
  IconPlayerStop,
} from "@tabler/icons-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/shared/hooks/useLanguage";
import {
  TutorMessageRole,
  TutorMessageStatus,
} from "@/lib/graphql/generated/schemaTypes";
import type { TutorMessage } from "../../../types";
import classes from "./TutorMessageBubble.module.css";
interface Props {
  message: TutorMessage;
  onReport: (id: string) => void;
  onRetry?: (id: string) => void;
  onHistory?: (id: string) => void;
  onBranch?: (id: string, text: string) => void;
  onRegenerate?: (id: string) => void;
  onCancel?: (id: string) => void;
  last?: boolean;
  disabled?: boolean;
}
export function TutorMessageBubble({
  message,
  onReport,
  onRetry,
  onHistory,
  onBranch,
  onRegenerate,
  onCancel,
  last,
  disabled,
}: Props) {
  const { isVi } = useLanguage();
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  if (message.role === TutorMessageRole.USER)
    return (
      <Group justify="flex-end">
        <Paper
          bg="brand.7"
          c="white"
          p="md"
          radius="lg"
          className={classes.message}
        >
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
            {message.summary
              ? tr(
                  "Tổng kết và cập nhật ghi nhớ cuộc trò chuyện.",
                  "Summarize and update conversation memory.",
                )
              : message.content}
          </Text>
          {onBranch && !message.summary && (
            <Button
              variant="white"
              color="brand"
              size="sm"
              mih={44}
              mt="sm"
              disabled={disabled}
              onClick={() => onBranch(message.id, message.content ?? "")}
            >
              {tr("Chỉnh sửa ở cuộc mới", "Edit in a new conversation")}
            </Button>
          )}
        </Paper>
      </Group>
    );
  if (message.status === TutorMessageStatus.PENDING)
    return (
      <Paper withBorder p="md" radius="lg" className={classes.message}>
        <Stack gap="xs">
          <Group role="status" aria-live="polite">
            <Loader size="sm" type="dots" />
            <Text size="sm">
              {tr(
                "Đã lưu câu hỏi · Gia sư đang chuẩn bị câu trả lời",
                "Question saved · The tutor is preparing a reply",
              )}
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            {tr(
              "Bạn có thể rời trang rồi mở lại cuộc trò chuyện.",
              "You can leave and reopen this conversation later.",
            )}
          </Text>
          {message.content && (
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
              {message.content}
            </Text>
          )}
          {onCancel && (
            <Button
              size="sm"
              mih={44}
              variant="subtle"
              leftSection={<IconPlayerStop size={16} />}
              disabled={disabled}
              onClick={() => onCancel(message.id)}
            >
              {tr("Dừng lượt này", "Stop this reply")}
            </Button>
          )}
        </Stack>
      </Paper>
    );
  if (
    message.status === TutorMessageStatus.FAILED ||
    message.status === TutorMessageStatus.CANCELLED
  )
    return (
      <Alert color="orange" radius="md" className={classes.message}>
        <Stack gap="xs">
          <Text size="sm">
            {message.status === TutorMessageStatus.CANCELLED
              ? tr(
                  "Đã dừng trả lời. Câu hỏi vẫn được giữ.",
                  "Reply stopped. Your question is kept.",
                )
              : tr(
                  "Gia sư chưa trả lời được câu này. Câu hỏi vẫn được giữ.",
                  "The tutor could not answer this question. Your question is kept.",
                )}
          </Text>
          {last &&
            onRetry &&
            !message.summary &&
            (message.restartCount ?? message.revision ?? 0) < 3 && (
              <Button
                variant="light"
                disabled={disabled}
                onClick={() => onRetry(message.id)}
                leftSection={<IconRefresh size={16} />}
              >
                {tr("Thử trả lời lại", "Retry reply")}
              </Button>
            )}
          {onHistory && message.revision > 0 && (
            <Button
              variant="subtle"
              mih={44}
              onClick={() => onHistory(message.id)}
            >
              {tr(
                "Xem và chọn đáp án trước",
                "View and select an earlier answer",
              )}
            </Button>
          )}
        </Stack>
      </Alert>
    );
  return (
    <Paper withBorder p="md" radius="lg" className={classes.message}>
      <Stack gap="sm">
        <Text size="xs" fw={700} c="brand.8">
          {message.summary
            ? tr("TỔNG KẾT AI · CÓ THỂ SAI", "AI SUMMARY · MAY BE INCORRECT")
            : tr("GIA SƯ ENGLOW3", "ENGLOW3 TUTOR")}
        </Text>
        {message.sources.length === 0 && (
          <Text size="xs" c="dimmed">
            {tr(
              "Phản hồi AI · chưa có trích dẫn học liệu",
              "AI response · no learning-material citations",
            )}
          </Text>
        )}
        <div className={classes.markdown}>
          <Markdown
            remarkPlugins={[remarkGfm]}
            skipHtml
            urlTransform={(url) =>
              /^https:\/\//i.test(url) || /^\/(?!\/)/.test(url) ? url : ""
            }
            components={{
              img: () => null,
              a: ({ href, children }) =>
                href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ) : (
                  <span>{children}</span>
                ),
              table: ({ children }) => (
                <div style={{ overflowX: "auto" }}>
                  <table>{children}</table>
                </div>
              ),
            }}
          >
            {message.content ?? ""}
          </Markdown>
        </div>
        {message.sources?.length > 0 && (
          <details>
            <summary>
              {tr(
                "Học liệu tham khảo tại thời điểm trả lời",
                "Reference material at the time of this reply",
              )}
            </summary>
            <Stack gap="sm" mt="sm">
              {message.sources.map((source) => (
                <div key={source.label}>
                  <Text size="sm" fw={600}>
                    [{source.label}] {source.title} · v{source.versionNumber}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {source.excerpt}
                  </Text>
                </div>
              ))}
            </Stack>
          </details>
        )}
        {message.reportStatus && (
          <Text size="xs" c="dimmed">
            {tr("Báo cáo: ", "Report: ")}
            {(
              {
                OPEN: tr("Đã tiếp nhận", "Received"),
                ASSIGNED: tr("Đang kiểm tra", "Under review"),
                PROPOSED: tr("Đang duyệt kết luận", "Awaiting resolution"),
                RESOLVED: tr("Đã xử lý", "Resolved"),
                DISMISSED: tr("Đã đóng", "Closed"),
              } as Record<string, string>
            )[message.reportStatus] ?? tr("Đã tiếp nhận", "Received")}
          </Text>
        )}
        {message.correction && (
          <Alert
            color="brand"
            title={tr(
              "Đính chính từ đội ngũ Englow3",
              "Correction from the Englow3 team",
            )}
          >
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
              {message.correction}
            </Text>
          </Alert>
        )}
        <Group gap="xs">
          {onHistory && message.revision > 0 && (
            <Button
              variant="subtle"
              mih={44}
              size="sm"
              onClick={() => onHistory(message.id)}
            >
              {tr("Lịch sử đáp án", "Answer history")}
            </Button>
          )}
          <Button
            variant="subtle"
            size="sm"
            mih={44}
            leftSection={<IconCopy size={16} />}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(message.content ?? "");
                setCopyStatus(tr("Đã sao chép", "Copied"));
              } catch {
                setCopyStatus(
                  tr(
                    "Chưa sao chép được. Hãy chọn văn bản để sao chép.",
                    "Could not copy. Select the text to copy it.",
                  ),
                );
              }
            }}
          >
            {tr("Sao chép", "Copy")}
          </Button>
          {last &&
            onRegenerate &&
            !message.summary &&
            (message.restartCount ?? message.revision ?? 0) < 3 && (
              <Tooltip
                label={tr(
                  "Dùng một lượt AI mới; câu trả lời cũ được lưu lịch sử",
                  "Uses a new AI request; the old answer is preserved",
                )}
              >
                <Button
                  variant="subtle"
                  size="sm"
                  mih={44}
                  disabled={disabled}
                  onClick={() => onRegenerate(message.id)}
                  leftSection={<IconRefresh size={16} />}
                >
                  {tr("Trả lời cách khác", "Regenerate")}
                </Button>
              </Tooltip>
            )}
          <Button
            variant="subtle"
            size="sm"
            mih={44}
            disabled={message.reported || disabled}
            onClick={() => onReport(message.id)}
            leftSection={<IconFlag size={16} />}
          >
            {message.reported
              ? tr("Đã báo cáo", "Reported")
              : tr("Báo câu trả lời sai", "Report answer")}
          </Button>
        </Group>
        {copyStatus && (
          <Text size="xs" role="status">
            {copyStatus}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
