"use client";

import { Anchor, Badge, Flex, Group, Paper, Stack, Text } from "@mantine/core";
import Link from "next/link";

import type {
  BlogModerationAction,
  BlogTargetType,
} from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../constants/blog";
import {
  MODERATION_ACTION_COLOR,
  MODERATION_ACTION_KEY,
  targetTypeLabel,
} from "../../../constants/blogLabels";
import type { BlogAuthorData } from "../../../types";
import { AuthorChip } from "../../parts/AuthorChip";
import { Timestamp } from "../../parts/Timestamp";

import classes from "./ModerationHistory.module.css";

/** One thing a moderator did. `target` is set where the history is of many pieces of content, and links to the one this was done to. */
export type ModerationHistoryEntry = {
  id: string;
  action: BlogModerationAction;
  reason: string;
  createdAt: string;
  moderator: BlogAuthorData | null;
  target?: { type: BlogTargetType; id: string };
};

type ModerationHistoryProps = {
  entries: ModerationHistoryEntry[];
  /** What to say when there is nothing. */
  emptyText: string;
};

/**
 * What moderators did, newest first, in the order given: the action (a dismissal
 * of reports - "Dismiss reports" - is in the history like any other), the reason
 * they gave, who did it and when.
 */
export function ModerationHistory({
  entries,
  emptyText,
}: ModerationHistoryProps) {
  const { t } = useLanguage();
  const copy = t.blog.admin;

  if (entries.length === 0) {
    return (
      <Text size="sm" c="ink.6">
        {emptyText}
      </Text>
    );
  }

  return (
    <Flex component="ul" direction="column" gap="sm" className={classes.list}>
      {entries.map((entry) => (
        <Paper component="li" key={entry.id} withBorder radius="md" p="md">
          <Stack gap="xs">
            <Group justify="space-between" gap="xs" align="flex-start">
              <Group gap="xs" wrap="wrap">
                <Badge
                  variant="light"
                  color={MODERATION_ACTION_COLOR[entry.action]}
                >
                  {copy.form.actions[MODERATION_ACTION_KEY[entry.action]]}
                </Badge>
                {entry.target && (
                  <Badge variant="outline" color="ink">
                    {targetTypeLabel(t.blog, entry.target.type)}
                  </Badge>
                )}
              </Group>
              <Timestamp value={entry.createdAt} withTime />
            </Group>
            <Text size="sm" className={classes.reason}>
              <Text span fw={600}>
                {copy.actions.reason}:
              </Text>{" "}
              {entry.reason}
            </Text>
            <Group justify="space-between" gap="sm">
              <Group gap="xs" wrap="nowrap">
                <Text size="xs" c="ink.5">
                  {copy.target.moderator}
                </Text>
                <AuthorChip author={entry.moderator} size={24} />
              </Group>
              {entry.target && (
                <Anchor
                  component={Link}
                  href={BLOG_ROUTES.adminTarget(
                    entry.target.type,
                    entry.target.id,
                  )}
                  size="sm"
                >
                  {copy.actions.open}
                </Anchor>
              )}
            </Group>
          </Stack>
        </Paper>
      ))}
    </Flex>
  );
}
