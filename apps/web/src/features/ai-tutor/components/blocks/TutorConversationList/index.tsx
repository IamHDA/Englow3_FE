"use client";

import { NavLink, ScrollArea, Skeleton, Stack, Text } from "@mantine/core";
import { IconMessage } from "@tabler/icons-react";
import React from "react";

import type { TutorConversationSummary } from "../../../types";

interface TutorConversationListProps {
  conversations: TutorConversationSummary[];
  activeId?: string;
  onOpen: (id: string) => void;
  /** First load: say nothing about the list until it has arrived. */
  loading?: boolean;
}

export function TutorConversationList({
  conversations,
  activeId,
  onOpen,
  loading = false,
}: TutorConversationListProps) {
  // "No conversations yet" while the list is still on its way would tell a
  // learner their history is gone.
  if (loading && conversations.length === 0) {
    return (
      <Stack gap={8} p="sm" aria-busy="true">
        <Skeleton height={14} radius="sm" />
        <Skeleton height={14} radius="sm" width="80%" />
        <Skeleton height={14} radius="sm" width="60%" />
      </Stack>
    );
  }

  if (conversations.length === 0) {
    return (
      <Text size="sm" c="dimmed" p="sm">
        Chưa có cuộc trò chuyện nào.
      </Text>
    );
  }

  return (
    <ScrollArea.Autosize mah={480}>
      <Stack gap={2}>
        {conversations.map((conversation) => (
          <NavLink
            key={conversation.id}
            active={conversation.id === activeId}
            label={conversation.title}
            description={`${conversation.messageCount} tin nhắn`}
            leftSection={<IconMessage size={16} />}
            onClick={() => onOpen(conversation.id)}
          />
        ))}
      </Stack>
    </ScrollArea.Autosize>
  );
}
