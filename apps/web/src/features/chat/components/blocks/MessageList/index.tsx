"use client";

import { Divider, Flex, ScrollArea, Stack, Text } from "@mantine/core";
import { MessageCircle } from "lucide-react";
import { Fragment, useState } from "react";

import { DATE_LOCALES } from "@/shared/constants/dateLocales";
import type { Language } from "@/shared/constants/translations";
import type { ChatTranslations } from "@/shared/constants/translations";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { useMessageScroll } from "../../../hooks/useMessageScroll";
import {
  isOwnMessage,
  type ChatMessageEntry,
} from "../../../realtime/messageList";
import { ChatEmptyState } from "../ChatEmptyState";
import { MessageBubble } from "../MessageBubble";

import classes from "./MessageList.module.css";
import { RecallModal } from "./RecallModal";

type MessageListProps = {
  /** Oldest first. */
  entries: ChatMessageEntry[];
  /** Who the conversation is with, for the labels. */
  partnerName: string;
  /** How far the other person has read, as far as this session knows. */
  partnerReadSeq: number | null;
  hasOlder: boolean;
  loadingOlder: boolean;
  onLoadOlder: () => void;
  onRetry: (key: string) => void;
  onDismiss: (key: string) => void;
  /** Takes the message back. Settles once it is done, whatever came of it. */
  onRecall: (messageId: string) => Promise<void>;
  onImageError: (entry: ChatMessageEntry) => void;
};

/** "Today", "Yesterday", or the date: the heading of a day's messages. */
function dayLabel(
  sentAt: string,
  language: Language,
  copy: ChatTranslations["pane"],
): string {
  const day = new Date(sentAt);
  const today = new Date();
  if (day.toDateString() === today.toDateString()) return copy.today;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (day.toDateString() === yesterday.toDateString()) return copy.yesterday;
  return day.toLocaleDateString(DATE_LOCALES[language], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * The messages of one conversation, oldest first, a heading for each day. It
 * reads as a live log to a screen reader, scrolls itself as the messages change
 * (see useMessageScroll), and asks for older ones as the viewer reaches the top.
 * "Seen" sits under the viewer's last message the other person has read.
 */
export function MessageList({
  entries,
  partnerName,
  partnerReadSeq,
  hasOlder,
  loadingOlder,
  onLoadOlder,
  onRetry,
  onDismiss,
  onRecall,
  onImageError,
}: MessageListProps) {
  const { language, t } = useLanguage();
  const copy = t.chat.pane;
  const { viewportRef, onScrollPositionChange, keepAtBottom } =
    useMessageScroll({ entries, hasOlder, loadingOlder, onLoadOlder });

  const [recalling, setRecalling] = useState<ChatMessageEntry | null>(null);
  const [recallRunning, setRecallRunning] = useState(false);
  async function confirmRecall() {
    if (!recalling?.id) return;
    setRecallRunning(true);
    try {
      await onRecall(recalling.id);
    } finally {
      setRecallRunning(false);
      setRecalling(null);
    }
  }

  // The last of the viewer's messages the other person has read.
  let seenKey: string | null = null;
  if (partnerReadSeq !== null) {
    for (const entry of entries) {
      if (
        isOwnMessage(entry) &&
        entry.seq !== null &&
        entry.seq <= partnerReadSeq
      ) {
        seenKey = entry.key;
      }
    }
  }

  if (entries.length === 0) {
    return (
      <ChatEmptyState
        icon={<MessageCircle size={24} aria-hidden="true" />}
        title={copy.emptyTitle}
        description={copy.emptyDescription.replace("{name}", () => partnerName)}
      />
    );
  }

  return (
    <>
      <ScrollArea
        h="100%"
        viewportRef={viewportRef}
        onScrollPositionChange={onScrollPositionChange}
      >
        <Stack
          className={classes.list}
          gap={6}
          p="md"
          role="log"
          aria-label={copy.messagesLabel.replace("{name}", () => partnerName)}
        >
          {loadingOlder && (
            <Text size="xs" c="ink.5" ta="center" role="status">
              {copy.loadingOlder}
            </Text>
          )}
          {entries.map((entry, index) => {
            const newDay =
              index === 0 ||
              new Date(entries[index - 1].sentAt).toDateString() !==
                new Date(entry.sentAt).toDateString();
            return (
              <Fragment key={entry.key}>
                {newDay && (
                  <Divider
                    my="xs"
                    labelPosition="center"
                    label={
                      <Text size="xs" c="ink.5">
                        {dayLabel(entry.sentAt, language, copy)}
                      </Text>
                    }
                  />
                )}
                <Flex direction="column">
                  <MessageBubble
                    entry={entry}
                    mine={isOwnMessage(entry)}
                    seen={entry.key === seenKey}
                    onRetry={onRetry}
                    onDismiss={onDismiss}
                    onAskRecall={setRecalling}
                    onImageError={onImageError}
                    onImageLoad={keepAtBottom}
                  />
                </Flex>
              </Fragment>
            );
          })}
        </Stack>
      </ScrollArea>
      <RecallModal
        opened={recalling !== null}
        loading={recallRunning}
        onConfirm={confirmRecall}
        onCancel={() => setRecalling(null)}
      />
    </>
  );
}
