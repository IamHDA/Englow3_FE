"use client";

import { Box, Group, Stack, Text } from "@mantine/core";
import { Lock } from "lucide-react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  CONVERSATION_LOCK_SENTENCE,
  type ConversationLock,
} from "../../../constants/chat";
import type { ImageProblem } from "../../../hooks/useImageUpload";
import type { ChatMessageEntry } from "../../../realtime/messageList";
import type { ConversationPartner } from "../../../types";
import { MessageComposer } from "../MessageComposer";
import { MessageList } from "../MessageList";
import { MessageListSkeleton } from "../MessageList/MessageListSkeleton";
import { TypingIndicator } from "../TypingIndicator";

import classes from "./ConversationPane.module.css";
import { ConversationHeader } from "./ConversationHeader";

type ConversationPaneProps = {
  /** Null when the other person erased their account. */
  partner: ConversationPartner | null;
  /** False while the newest messages are still on their way. */
  messagesLoaded: boolean;
  entries: ChatMessageEntry[];
  partnerReadSeq: number | null;
  hasOlder: boolean;
  loadingOlder: boolean;
  partnerTyping: boolean;
  /** Why the box is closed, or null when it is open. */
  lock: ConversationLock | null;
  onLoadOlder: () => void;
  onRetry: (key: string) => void;
  onDismiss: (key: string) => void;
  onRecall: (messageId: string) => Promise<void>;
  onImageError: (entry: ChatMessageEntry) => void;
  onSend: (message: { body: string; image: File | null }) => void;
  onTyping: (hasText: boolean) => void;
  onStopTyping: () => void;
  validateImage: (file: File) => ImageProblem | null;
};

/**
 * One conversation: who it is with, the messages, "is typing", and the box to
 * write in - or, when the two can no longer talk, the reason in its place. The
 * messages stay readable either way.
 */
export function ConversationPane({
  partner,
  messagesLoaded,
  entries,
  partnerReadSeq,
  hasOlder,
  loadingOlder,
  partnerTyping,
  lock,
  onLoadOlder,
  onRetry,
  onDismiss,
  onRecall,
  onImageError,
  onSend,
  onTyping,
  onStopTyping,
  validateImage,
}: ConversationPaneProps) {
  const copy = useLanguage().t.chat;
  const partnerName = partner?.displayName ?? copy.list.deletedUser;

  return (
    <Stack gap={0} h="100%">
      <ConversationHeader partner={partner} />
      <Box flex={1} mih={0}>
        {messagesLoaded ? (
          <MessageList
            entries={entries}
            partnerName={partnerName}
            partnerReadSeq={partnerReadSeq}
            hasOlder={hasOlder}
            loadingOlder={loadingOlder}
            onLoadOlder={onLoadOlder}
            onRetry={onRetry}
            onDismiss={onDismiss}
            onRecall={onRecall}
            onImageError={onImageError}
          />
        ) : (
          <MessageListSkeleton />
        )}
      </Box>
      <TypingIndicator name={partnerTyping ? partnerName : null} />
      {lock === null ? (
        <MessageComposer
          onSend={onSend}
          onTyping={onTyping}
          onStopTyping={onStopTyping}
          validateImage={validateImage}
        />
      ) : (
        <Group
          gap="sm"
          p="md"
          wrap="nowrap"
          role="status"
          className={classes.locked}
        >
          <Lock size={18} aria-hidden="true" />
          <Text size="sm" c="ink.7">
            {copy.composer[CONVERSATION_LOCK_SENTENCE[lock]]}
          </Text>
        </Group>
      )}
    </Stack>
  );
}
