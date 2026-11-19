"use client";

import {
  Avatar,
  Badge,
  Group,
  Stack,
  Text,
  UnstyledButton,
  VisuallyHidden,
} from "@mantine/core";
import { ImageIcon } from "lucide-react";
import Link from "next/link";

import { DATE_LOCALES } from "@/shared/constants/dateLocales";
import type { Language } from "@/shared/constants/translations";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { CHAT_ROUTES, UNREAD_BADGE_MAX } from "../../../../constants/chat";
import type { ConversationItem } from "../../../../types";

import classes from "./ConversationRow.module.css";

type ConversationRowProps = {
  conversation: ConversationItem;
  meId: string;
  selected: boolean;
};

/** When the last message was sent, as short as the list needs: the time today, the day and month this year, the full date before that. */
function shortTime(iso: string, language: Language): string {
  const sent = new Date(iso);
  const now = new Date();
  const locale = DATE_LOCALES[language];
  if (sent.toDateString() === now.toDateString()) {
    return sent.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return sent.toLocaleDateString(
    locale,
    sent.getFullYear() === now.getFullYear()
      ? { day: "2-digit", month: "2-digit" }
      : { day: "2-digit", month: "2-digit", year: "numeric" },
  );
}

/** One conversation of the list: who, what was said last and when, and how much has not been read. */
export function ConversationRow({
  conversation,
  meId,
  selected,
}: ConversationRowProps) {
  const { language, t } = useLanguage();
  const copy = t.chat.list;
  const { otherUser, lastMessage, unreadCount } = conversation;
  const name = otherUser?.displayName ?? copy.deletedUser;
  const unread = unreadCount > 0;

  let preview: string | null = null;
  if (lastMessage) {
    preview = lastMessage.recalled
      ? copy.recalledPreview
      : (lastMessage.preview ??
        (lastMessage.hasImage ? copy.imagePreview : null));
  }
  const showsImage =
    lastMessage !== null && lastMessage.hasImage && !lastMessage.recalled;

  return (
    <UnstyledButton
      component={Link}
      href={CHAT_ROUTES.conversation(conversation.id)}
      className={classes.row}
      data-selected={selected || undefined}
      aria-current={selected ? "page" : undefined}
    >
      <Group gap="sm" wrap="nowrap" align="center">
        <Avatar
          src={otherUser?.avatarUrl}
          name={otherUser?.displayName}
          radius="xl"
          size={44}
          aria-hidden="true"
        />
        <Stack gap={2} miw={0} flex={1}>
          <Group gap="xs" wrap="nowrap" justify="space-between">
            <Text fw={unread ? 700 : 600} truncate c="ink.9">
              {name}
            </Text>
            {lastMessage && (
              <Text size="xs" c="ink.5" flex="none">
                {shortTime(lastMessage.sentAt, language)}
              </Text>
            )}
          </Group>
          <Group gap="xs" wrap="nowrap" justify="space-between">
            <Group gap={4} wrap="nowrap" miw={0}>
              {showsImage && (
                <ImageIcon
                  size={14}
                  aria-hidden="true"
                  style={{ flex: "none" }}
                />
              )}
              <Text
                size="sm"
                truncate
                c={unread ? "ink.9" : "ink.6"}
                fw={unread ? 600 : 400}
                fs={lastMessage?.recalled ? "italic" : undefined}
              >
                {lastMessage?.senderId === meId ? copy.youPrefix : ""}
                {preview}
              </Text>
            </Group>
            {unread && (
              <>
                <Badge
                  size="sm"
                  variant="filled"
                  color="navy"
                  flex="none"
                  aria-hidden="true"
                >
                  {unreadCount > UNREAD_BADGE_MAX
                    ? `${UNREAD_BADGE_MAX}+`
                    : unreadCount}
                </Badge>
                <VisuallyHidden>
                  {(unreadCount === 1
                    ? copy.unreadOne
                    : copy.unreadOther
                  ).replace("{count}", String(unreadCount))}
                </VisuallyHidden>
              </>
            )}
          </Group>
        </Stack>
      </Group>
    </UnstyledButton>
  );
}
