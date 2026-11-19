"use client";

import { Anchor, Badge, Group, Paper, Stack, Text } from "@mantine/core";
import Link from "next/link";

import { BlogTargetStatus, BlogTargetType } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../../constants/blog";
import {
  REPORT_REASON_KEY,
  countLabel,
  targetTypeLabel,
} from "../../../../constants/blogLabels";
import type { ModerationQueueItemData } from "../../../../types";
import { AuthorChip } from "../../../parts/AuthorChip";
import { TargetStatusBadge } from "../../../parts/TargetStatusBadge";
import { Timestamp } from "../../../parts/Timestamp";

import classes from "./ModerationQueueRow.module.css";

/**
 * One piece of reported content in the queue - one row however many reports it
 * has: what it is, a line of it, who wrote it, how many reports are open and
 * why, when it was first and last reported, and where it stands. A comment's
 * line is under the title of the post it is on. Content its author deleted since
 * is marked as that and has nothing else to show. The row opens the content.
 */
export function ModerationQueueRow({
  item,
}: {
  item: ModerationQueueItemData;
}) {
  const { t } = useLanguage();
  const copy = t.blog.admin.queue;
  const deleted = item.targetStatus === BlogTargetStatus.DELETED;
  const isComment = item.targetType === BlogTargetType.COMMENT;

  return (
    <Paper component="li" withBorder radius="md" p="md" className={classes.row}>
      <Stack gap="xs">
        <Group
          justify="space-between"
          gap="xs"
          align="flex-start"
          wrap="nowrap"
        >
          <Group gap="xs" wrap="wrap">
            <Badge variant="outline" color="ink">
              {targetTypeLabel(t.blog, item.targetType)}
            </Badge>
            <TargetStatusBadge status={item.targetStatus} />
            <Badge color="orange" variant="filled">
              {countLabel(
                item.openReports,
                copy.openReportsOne,
                copy.openReportsOther,
              )}
            </Badge>
          </Group>
        </Group>

        {deleted ? (
          <Text fs="italic" c="ink.6">
            {copy.deletedByAuthor}
          </Text>
        ) : (
          <Stack gap={2}>
            {isComment && item.title && (
              <Text size="xs" c="ink.5">
                {copy.commentOn} “{item.title}”
              </Text>
            )}
            <Anchor
              component={Link}
              href={BLOG_ROUTES.adminTarget(item.targetType, item.targetId)}
              fw={600}
              c="navy.9"
              underline="never"
              className={classes.link}
              lineClamp={2}
            >
              {isComment
                ? (item.excerpt ?? copy.noExcerpt)
                : (item.title ?? copy.noExcerpt)}
            </Anchor>
            {!isComment && item.excerpt && (
              <Text size="sm" c="ink.6" lineClamp={2}>
                {item.excerpt}
              </Text>
            )}
          </Stack>
        )}
        {deleted && (
          <Anchor
            component={Link}
            href={BLOG_ROUTES.adminTarget(item.targetType, item.targetId)}
            size="sm"
            className={classes.link}
          >
            {t.blog.admin.actions.open}
          </Anchor>
        )}

        <Group gap={6}>
          {item.reasons.map((reason) => (
            <Badge key={reason} variant="light" color="brand" size="sm">
              {t.blog.reportReasons[REPORT_REASON_KEY[reason]]}
            </Badge>
          ))}
        </Group>

        <Group justify="space-between" gap="sm" align="center">
          <AuthorChip author={item.author} />
          <Group gap="md">
            <Text size="xs" c="ink.5">
              {copy.firstReported}{" "}
              <Timestamp value={item.firstReportedAt} withTime span />
            </Text>
            <Text size="xs" c="ink.5">
              {copy.lastReported}{" "}
              <Timestamp value={item.lastReportedAt} withTime span />
            </Text>
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
}
