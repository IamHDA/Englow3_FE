"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  ActionIcon,
  Alert,
  Box,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconFlag,
  IconFlagFilled,
} from "@tabler/icons-react";
import React from "react";

import {
  TutorMessageRole,
  TutorMessageStatus,
} from "@/lib/graphql/generated/schemaTypes";

import type { TutorMessage } from "../../../types";

interface TutorMessageBubbleProps {
  message: TutorMessage;
  onReport: (messageId: string) => void;
}

/** Lỗi kỹ thuật không phải thứ người học đọc được - dịch sang câu họ hiểu. */
function explain(errorCode: string | null | undefined, isVi: boolean): string {
  switch (errorCode) {
    case "TUTOR_REPLY_EMPTY":
      return isVi
        ? "Gia sư không đưa ra được câu trả lời cho câu hỏi này. Thử hỏi lại theo cách khác nhé."
        : "The tutor could not answer this question. Try asking it another way.";
    case "TUTOR_SERVICE_UNREACHABLE":
      return isVi
        ? "Không kết nối được tới gia sư. Thử lại sau ít phút."
        : "Could not reach the tutor. Try again in a few minutes.";
    default:
      return isVi
        ? "Câu hỏi này chưa được trả lời. Bạn thử gửi lại nhé."
        : "This question was not answered. Try sending it again.";
  }
}

/**
 * Một lượt trong cuộc trò chuyện.
 *
 * Ba trạng thái hiện ba thứ khác nhau, và đó là chủ đích: đang chờ thì quay,
 * hỏng thì nói vì sao, có trả lời thì hiện trả lời. Gộp "chưa trả lời" với
 * "trả lời rỗng" làm một sẽ để người học ngồi nhìn một ô trống mãi không đầy.
 */
export function TutorMessageBubble({
  message,
  onReport,
}: TutorMessageBubbleProps) {
  const { isVi } = useLanguage();
  const fromLearner = message.role === TutorMessageRole.USER;

  if (fromLearner) {
    return (
      <Group justify="flex-end" align="flex-start" wrap="nowrap">
        <Paper
          bg="blue.6"
          c="white"
          p="sm"
          radius="lg"
          maw="80%"
          style={{ whiteSpace: "pre-wrap" }}
        >
          <Text size="sm">{message.content}</Text>
        </Paper>
      </Group>
    );
  }

  if (message.status === TutorMessageStatus.PENDING) {
    return (
      <Group align="center" gap="xs">
        <Loader size="xs" type="dots" />
        <Text size="sm" c="dimmed">
          {isVi
            ? "Gia sư đang soạn câu trả lời…"
            : "The tutor is writing an answer…"}
        </Text>
      </Group>
    );
  }

  if (message.status === TutorMessageStatus.FAILED) {
    return (
      <Alert
        color="orange"
        icon={<IconAlertTriangle size={16} />}
        variant="light"
        maw="85%"
      >
        <Text size="sm">{explain(message.errorCode, isVi)}</Text>
      </Alert>
    );
  }

  return (
    <Group justify="flex-start" align="flex-start" wrap="nowrap" gap="xs">
      <Paper withBorder p="sm" radius="lg" maw="85%">
        <Stack gap={6}>
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
            {message.content}
          </Text>
          <Group justify="space-between" gap="xs">
            {/* Model hiện ngay trên câu trả lời: một câu đọc thấy sai cần
                truy được là cái gì sinh ra nó. */}
            <Text size="xs" c="dimmed">
              {message.model ?? (isVi ? "Gia sư AI" : "AI Tutor")}
            </Text>
            <Tooltip
              label={
                message.reported
                  ? isVi
                    ? "Bạn đã báo câu trả lời này"
                    : "You reported this answer"
                  : isVi
                    ? "Báo câu trả lời sai hoặc không phù hợp"
                    : "Report a wrong or unsuitable answer"
              }
            >
              <ActionIcon
                variant="subtle"
                size="sm"
                color={message.reported ? "orange" : "gray"}
                disabled={message.reported}
                onClick={() => onReport(message.id)}
                aria-label={isVi ? "Báo câu trả lời này" : "Report this answer"}
              >
                {message.reported ? (
                  <IconFlagFilled size={14} />
                ) : (
                  <IconFlag size={14} />
                )}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Stack>
      </Paper>
      <Box />
    </Group>
  );
}
