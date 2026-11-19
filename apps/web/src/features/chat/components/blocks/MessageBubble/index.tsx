"use client";

import {
  ActionIcon,
  Button,
  Flex,
  Group,
  Image,
  Menu,
  Paper,
  Text,
} from "@mantine/core";
import { Ban, Ellipsis, Undo2 } from "lucide-react";

import { DATE_LOCALES } from "@/shared/constants/dateLocales";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { sentenceForCode } from "../../../constants/chatErrors";
import { DELIVERY, type ChatMessageEntry } from "../../../realtime/messageList";

import classes from "./MessageBubble.module.css";

type MessageBubbleProps = {
  entry: ChatMessageEntry;
  /** Written by the viewer. */
  mine: boolean;
  /** The other person has read up to here: "Seen" goes under it. */
  seen: boolean;
  onRetry: (key: string) => void;
  onDismiss: (key: string) => void;
  onAskRecall: (entry: ChatMessageEntry) => void;
  /** The picture would not load - most often its link expired. */
  onImageError: (entry: ChatMessageEntry) => void;
  /** The picture has loaded and the bubble has grown. */
  onImageLoad: () => void;
};

/**
 * One message: its text and picture, the time, whether it is still being sent
 * or could not be (with a way to send it again or let it go), and - for the
 * viewer's own, confirmed ones - the way to take it back. A recalled message is
 * a quiet placeholder: its words are gone on every screen.
 */
export function MessageBubble({
  entry,
  mine,
  seen,
  onRetry,
  onDismiss,
  onAskRecall,
  onImageError,
  onImageLoad,
}: MessageBubbleProps) {
  const { language, t } = useLanguage();
  const copy = t.chat;
  const time = new Date(entry.sentAt).toLocaleTimeString(
    DATE_LOCALES[language],
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
  const canRecall = mine && entry.id !== null && !entry.recalled;
  const notDelivered =
    entry.delivery === DELIVERY.failed || entry.delivery === DELIVERY.rejected;

  return (
    <Flex direction="column" align={mine ? "flex-end" : "flex-start"} gap={2}>
      <Group
        className={classes.line}
        gap={4}
        wrap="nowrap"
        align="center"
        justify={mine ? "flex-end" : "flex-start"}
      >
        {canRecall && (
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="ink"
                size={28}
                radius="xl"
                className={classes.options}
                aria-label={copy.message.options}
              >
                <Ellipsis size={16} aria-hidden="true" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                color="warn"
                leftSection={<Undo2 size={16} aria-hidden="true" />}
                onClick={() => onAskRecall(entry)}
              >
                {copy.message.recall}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
        <Paper
          className={classes.bubble}
          data-mine={mine || undefined}
          data-recalled={entry.recalled || undefined}
          data-delivery={entry.delivery}
        >
          {entry.recalled ? (
            <Group gap={6} wrap="nowrap">
              <Ban size={14} aria-hidden="true" />
              <Text size="sm" fs="italic">
                {copy.message.recalled}
              </Text>
            </Group>
          ) : (
            <>
              {entry.imageUrl && (
                <a
                  className={classes.image}
                  href={entry.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={copy.message.openImage}
                >
                  <Image
                    src={entry.imageUrl}
                    alt={copy.message.imageAlt}
                    radius="md"
                    maw={260}
                    mah={280}
                    fit="cover"
                    loading="lazy"
                    onError={() => onImageError(entry)}
                    onLoad={onImageLoad}
                  />
                </a>
              )}
              {entry.body && (
                <Text size="sm" className={classes.text}>
                  {entry.body}
                </Text>
              )}
            </>
          )}
          <Text size="xs" className={classes.time}>
            {time}
            {entry.delivery === DELIVERY.sending &&
              ` · ${copy.message.sending}`}
          </Text>
        </Paper>
      </Group>
      {notDelivered && (
        <Group gap="xs" role="alert">
          <Text size="xs" c="warn.7">
            {entry.failureCode
              ? sentenceForCode(copy, entry.failureCode)
              : copy.message.failed}
          </Text>
          {entry.delivery === DELIVERY.failed && (
            <Button
              size="compact-xs"
              variant="subtle"
              onClick={() => onRetry(entry.key)}
            >
              {copy.message.retry}
            </Button>
          )}
          <Button
            size="compact-xs"
            variant="subtle"
            color="ink"
            onClick={() => onDismiss(entry.key)}
          >
            {copy.message.dismiss}
          </Button>
        </Group>
      )}
      {seen && (
        <Text size="xs" c="ink.5">
          {copy.pane.seen}
        </Text>
      )}
    </Flex>
  );
}
