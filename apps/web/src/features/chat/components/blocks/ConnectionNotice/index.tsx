"use client";

import { Alert, Button, Group, Text } from "@mantine/core";
import { RotateCw, WifiOff } from "lucide-react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  CHAT_SOCKET_STATUS,
  type ChatSocketStatus,
} from "../../../realtime/chatSocket";

type ConnectionNoticeProps = {
  status: ChatSocketStatus;
  /** For a socket that gave up: a new page load starts everything again. */
  onReload: () => void;
};

/**
 * A thin strip over the chat when new messages do not arrive by themselves.
 * Sending still works - it goes over REST - and says so; a socket that has
 * given up asks for a reload. Nothing at all while connected, and nothing during
 * the first connection, which is over before anyone looks.
 */
export function ConnectionNotice({ status, onReload }: ConnectionNoticeProps) {
  const copy = useLanguage().t.chat.connection;

  switch (status) {
    case CHAT_SOCKET_STATUS.reconnecting:
      return (
        <Alert
          role="status"
          variant="light"
          color="orange"
          radius="md"
          py={8}
          icon={<WifiOff size={18} aria-hidden="true" />}
        >
          <Text size="sm">{copy.reconnecting}</Text>
        </Alert>
      );
    case CHAT_SOCKET_STATUS.failed:
      return (
        <Alert
          role="status"
          variant="light"
          color="orange"
          radius="md"
          py={8}
          icon={<WifiOff size={18} aria-hidden="true" />}
        >
          <Group justify="space-between" gap="sm">
            <Text size="sm">{copy.failed}</Text>
            <Button
              size="compact-sm"
              variant="light"
              color="orange"
              leftSection={<RotateCw size={14} aria-hidden="true" />}
              onClick={onReload}
            >
              {copy.reload}
            </Button>
          </Group>
        </Alert>
      );
    case CHAT_SOCKET_STATUS.idle:
    case CHAT_SOCKET_STATUS.connecting:
    case CHAT_SOCKET_STATUS.open:
    case CHAT_SOCKET_STATUS.closed:
      return null;
    default: {
      const unreachable: never = status;
      return unreachable;
    }
  }
}
