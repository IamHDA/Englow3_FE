"use client";

import { NavLink, ScrollArea, Stack, Text } from "@mantine/core";
import { IconMessage } from "@tabler/icons-react";
import React from "react";

import type { TutorConversationSummary } from "../../../types";

interface TutorConversationListProps {
  conversations: TutorConversationSummary[];
  activeId?: string;
  onOpen: (id: string) => void;
}

export function TutorConversationList({
  conversations,
  activeId,
  onOpen,
}: TutorConversationListProps) {
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
